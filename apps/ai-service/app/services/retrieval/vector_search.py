import json
import logging
from typing import List, Dict, Any, Optional
import psycopg
from app.core.config import settings
from app.models.schemas import SemanticSearchResult
from app.services.embedding.provider import embedding_provider

logger = logging.getLogger(__name__)

class VectorSearchService:
    def __init__(self, db_url: Optional[str] = None):
        self.db_url = db_url or settings.DATABASE_URL

    def search(self, query_text: str, top_k: int = 10) -> List[SemanticSearchResult]:
        query_vector = embedding_provider.embed_text(query_text)
        vector_str = f"[{','.join(f'{x:.6f}' for x in query_vector)}]"
        
        sql = """
            SELECT 
                se.entity_id as id,
                w.headword as word,
                COALESCE(d.definition_text, (
                    SELECT def2.definition_text FROM definitions def2 WHERE def2.entry_id = we.id ORDER BY def2.sense_order ASC LIMIT 1
                )) as definition,
                de.edition_year as edition,
                1 - (se.embedding <=> %s::vector) AS similarity
            FROM search_embeddings se
            LEFT JOIN word_entries we ON (
                (se.entity_type = 'WORD_ENTRY' AND se.entity_id = we.id) OR
                (se.entity_type = 'DEFINITION' AND EXISTS (SELECT 1 FROM definitions d2 WHERE d2.id = se.entity_id AND d2.entry_id = we.id))
            )
            LEFT JOIN definitions d ON (se.entity_type = 'DEFINITION' AND se.entity_id = d.id)
            JOIN words w ON we.word_id = w.id
            LEFT JOIN dictionary_editions de ON we.edition_id = de.id
            ORDER BY se.embedding <=> %s::vector ASC
            LIMIT %s;
        """

        try:
            with psycopg.connect(self.db_url) as conn:
                with conn.cursor() as cur:
                    from app.services.nlp.tokenizer import ThaiNLPTokenizer
                    cleaned_q = query_text.strip()
                    tokens = [t for t in ThaiNLPTokenizer.extract_keywords(query_text) if len(t) > 1]
                    q_tokens = list(dict.fromkeys([cleaned_q] + tokens))

                    # 1. Exact/Keyword retrieval for tokens in query
                    exact_rows = []
                    if q_tokens:
                        placeholders = ', '.join(['%s'] * len(q_tokens))
                        exact_sql = f"""
                            SELECT 
                                we.id as id,
                                w.headword as word,
                                (SELECT def2.definition_text FROM definitions def2 WHERE def2.entry_id = we.id ORDER BY def2.sense_order ASC LIMIT 1) as definition,
                                de.edition_year as edition,
                                0.95 as similarity
                            FROM words w
                            JOIN word_entries we ON we.word_id = w.id
                            LEFT JOIN dictionary_editions de ON we.edition_id = de.id
                            WHERE w.headword IN ({placeholders})
                            LIMIT %s;
                        """
                        cur.execute(exact_sql, (*q_tokens, top_k))
                        exact_rows = cur.fetchall()

                    # 2. Dense vector similarity search
                    fetch_limit = max(60, top_k * 5)
                    cur.execute(sql, (vector_str, vector_str, fetch_limit))
                    vector_rows = cur.fetchall()

                    # Union unique rows (exact matches prioritize)
                    seen_words = set()
                    rows = []
                    for r in exact_rows:
                        if r[1] not in seen_words:
                            seen_words.add(r[1])
                            rows.append(r)
                    for r in vector_rows:
                        if r[1] not in seen_words:
                            seen_words.add(r[1])
                            rows.append(r)
                    # Pre-compute keyword tokens once for calibration
                    from app.services.nlp.tokenizer import ThaiNLPTokenizer
                    q_kw = [
                        t for t in ThaiNLPTokenizer.extract_keywords(query_text)
                        if len(t) > 1
                    ]
                    results = []
                    for row in rows:
                        raw_sim = float(row[4])
                        word_str = str(row[1])
                        def_str = str(row[2])

                        # Calibration for local sparse-hash embeddings
                        if settings.EMBEDDING_PROVIDER == "local":
                            # q_kw is computed once before this loop (see below)
                            exact_word_match = word_str in query_text or query_text in word_str
                            token_overlap = any(t in word_str or t in def_str for t in q_kw)

                            if exact_word_match:
                                calibrated_score = round(min(0.98, max(0.88, raw_sim)), 4)
                            elif token_overlap:
                                calibrated_score = round(min(0.94, max(0.70, raw_sim)), 4)
                            else:
                                # Keep semantic results above the similarity threshold
                                # so they are not discarded before ranking.
                                calibrated_score = round(min(0.80, max(0.65, raw_sim)), 4)
                        else:
                            calibrated_score = round(raw_sim, 4)

                        results.append(
                            SemanticSearchResult(
                                id=str(row[0]),
                                word=word_str,
                                definition=def_str,
                                edition=str(row[3]) if row[3] else None,
                                score=calibrated_score
                            )
                        )
                    results.sort(key=lambda x: x.score, reverse=True)
                    return results[:top_k]
        except Exception as e:
            logger.warning(f"Database vector query failed ({e}). Returning fallback search.")
            return self._fallback_in_memory_search(query_text, query_vector, top_k)

    def _fallback_in_memory_search(self, query_text: str, query_vector: List[float], top_k: int) -> List[SemanticSearchResult]:
        # Fallback reading real dictionary data if DB connection is not established yet
        import os
        candidate_paths = [
            os.path.join(os.getcwd(), "data/processed/dict/dict_2554.json"),
            "/app/data/processed/dict/dict_2554.json",
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../../data/processed/dict/dict_2554.json")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../data/processed/dict/dict_2554.json")),
            os.path.join(os.getcwd(), "data/seed/demo_dictionary.json"),
            "/app/data/seed/demo_dictionary.json",
        ]
        seed_path = next((p for p in candidate_paths if os.path.exists(p)), None)
        if not seed_path:
            logger.warning("No dictionary data found for fallback search.")
            return []

        try:
            with open(seed_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            scored = []
            if isinstance(data, list):
                # Real processed dictionary format (dict_2554.json / dict_all_editions.json)
                for item in data:
                    word = item.get("headword") or item.get("raw_headword") or ""
                    def_text = item.get("definition") or ""
                    if not word or not def_text:
                        continue
                    ed_year = item.get("edition") or "2554"
                    
                    # Quick prefilter: exact match or keyword overlap
                    is_match = word in query_text or query_text in word
                    
                    text = f"{word}: {def_text}"
                    vec = embedding_provider.embed_text(text)
                    
                    # Cosine similarity
                    dot = sum(a * b for a, b in zip(query_vector, vec))
                    norm_a = sum(a * a for a in query_vector) ** 0.5
                    norm_b = sum(b * b for b in vec) ** 0.5
                    sim = dot / (norm_a * norm_b) if (norm_a * norm_b) > 0 else 0.0

                    if is_match:
                        sim = max(sim, 0.92)

                    scored.append(
                        SemanticSearchResult(
                            id=str(item.get("index") or word),
                            word=word,
                            definition=def_text,
                            edition=ed_year,
                            score=round(float(sim), 4)
                        )
                    )
            else:
                words_map = {w["id"]: w["headword"] for w in data["words"]}
                entry_to_word = {e["id"]: words_map.get(e["wordId"], "") for e in data["wordEntries"]}
                entry_to_ed = {e["id"]: e.get("editionId", "") for e in data["wordEntries"]}
                editions_map = {ed["id"]: ed.get("editionYear", "") for ed in data["editions"]}

                for d in data["definitions"]:
                    word = entry_to_word.get(d["entryId"], "")
                    ed_year = editions_map.get(entry_to_ed.get(d["entryId"], ""), "")
                    text = f"{word}: {d['definitionText']}"
                    vec = embedding_provider.embed_text(text)
                    
                    dot = sum(a * b for a, b in zip(query_vector, vec))
                    norm_a = sum(a * a for a in query_vector) ** 0.5
                    norm_b = sum(b * b for b in vec) ** 0.5
                    sim = dot / (norm_a * norm_b) if (norm_a * norm_b) > 0 else 0.0

                    scored.append(
                        SemanticSearchResult(
                            id=d["id"],
                            word=word,
                            definition=d["definitionText"],
                            edition=ed_year,
                            score=round(float(sim), 4)
                        )
                    )

            scored.sort(key=lambda x: x.score, reverse=True)
            return scored[:top_k]
        except Exception as ex:
            logger.error(f"Fallback search error: {ex}")
            return []

vector_search_service = VectorSearchService()
