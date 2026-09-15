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
        self._db_offline = False
        self._last_db_check = 0.0

    def _is_db_reachable(self) -> bool:
        import time, socket
        now = time.time()
        if self._db_offline and (now - self._last_db_check < 60.0):
            return False
        try:
            from urllib.parse import urlparse
            p = urlparse(self.db_url)
            host = p.hostname or "localhost"
            port = p.port or 5432
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.08)
            s.connect((host, port))
            s.close()
            self._db_offline = False
            self._last_db_check = now
            return True
        except Exception:
            self._db_offline = True
            self._last_db_check = now
            return False

    def search(self, query_text: str, top_k: int = 10) -> List[SemanticSearchResult]:
        query_vector = embedding_provider.embed_text(query_text)
        vector_str = f"[{','.join(f'{x:.6f}' for x in query_vector)}]"
        
        if not self._is_db_reachable():
            return self._fallback_in_memory_search(query_text, query_vector, top_k)

        sql = """
            WITH top_emb AS (
                SELECT entity_id, 1 - (embedding <=> %s::vector) AS similarity
                FROM search_embeddings
                ORDER BY embedding <=> %s::vector ASC
                LIMIT %s
            )
            SELECT 
                te.entity_id as id,
                w.headword as word,
                d.definition_text as definition,
                de.edition_year as edition,
                te.similarity as similarity
            FROM top_emb te
            JOIN definitions d ON te.entity_id = d.id
            JOIN word_entries we ON d.entry_id = we.id
            JOIN words w ON we.word_id = w.id
            LEFT JOIN dictionary_editions de ON we.edition_id = de.id
            ORDER BY te.similarity DESC;
        """

        try:
            with psycopg.connect(self.db_url, connect_timeout=1) as conn:
                with conn.cursor() as cur:
                    from app.services.nlp.tokenizer import ThaiNLPTokenizer
                    cleaned_q = query_text.strip()
                    tokens = [t for t in ThaiNLPTokenizer.extract_keywords(query_text) if len(t) > 1]
                    q_tokens = list(dict.fromkeys([cleaned_q] + tokens))

                    # 1. Exact & Substring retrieval prioritizing target words
                    exact_rows = []
                    like_pattern = f"%{cleaned_q}%"
                    exact_sql = """
                        SELECT 
                            we.id as id,
                            w.headword as word,
                            (SELECT def2.definition_text FROM definitions def2 WHERE def2.entry_id = we.id ORDER BY def2.sense_order ASC LIMIT 1) as definition,
                            de.edition_year as edition,
                            0.98 as similarity
                        FROM words w
                        JOIN word_entries we ON we.word_id = w.id
                        LEFT JOIN dictionary_editions de ON we.edition_id = de.id
                        WHERE w.headword = %s 
                           OR w.headword LIKE %s 
                           OR w.headword_clean LIKE %s
                        ORDER BY 
                           CASE 
                             WHEN w.headword = %s THEN 1
                             WHEN w.headword LIKE %s THEN 2
                             ELSE 3
                           END
                        LIMIT %s;
                    """
                    cur.execute(exact_sql, (cleaned_q, like_pattern, like_pattern, cleaned_q, like_pattern, top_k))
                    exact_rows = cur.fetchall()

                    # 2. Dense vector similarity search via optimized CTE
                    fetch_limit = max(30, top_k * 3)
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
                    results = []
                    for row in rows:
                        raw_sim = float(row[4])
                        word_str = str(row[1])
                        def_str = str(row[2])

                        # Calibration for local sparse-hash embeddings
                        if settings.EMBEDDING_PROVIDER == "local":
                            from app.services.nlp.tokenizer import ThaiNLPTokenizer
                            q_tokens = [t for t in ThaiNLPTokenizer.extract_keywords(query_text) if len(t) > 1]
                            exact_word_match = word_str in query_text or query_text in word_str
                            token_overlap = any(t in word_str or t in def_str for t in q_tokens)

                            if exact_word_match:
                                calibrated_score = round(min(0.98, max(0.88, raw_sim)), 4)
                            elif token_overlap:
                                calibrated_score = round(min(0.94, max(0.70, raw_sim)), 4)
                            else:
                                calibrated_score = round(min(0.50, max(0.10, raw_sim)), 4)
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
                    if not results:
                        logger.info("Database returned 0 vector results. Using in-memory fallback search.")
                        return self._fallback_in_memory_search(query_text, query_vector, top_k)

                    results.sort(key=lambda x: x.score, reverse=True)
                    return results[:top_k]
        except Exception as e:
            logger.warning(f"Database vector query failed ({e}). Returning fallback search.")
            return self._fallback_in_memory_search(query_text, query_vector, top_k)

    def _get_in_memory_dict(self):
        """Loads and caches dictionary in-memory once for fast sub-millisecond retrieval."""
        global _CACHED_DICT_DATA
        if "_CACHED_DICT_DATA" in globals() and _CACHED_DICT_DATA is not None:
            return _CACHED_DICT_DATA

        import os
        candidate_paths = [
            os.path.join(os.getcwd(), "data/processed/dict/dict_all_editions.json"),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../../data/processed/dict/dict_all_editions.json")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../data/processed/dict/dict_all_editions.json")),
            "/app/data/processed/dict/dict_all_editions.json",
            os.path.join(os.getcwd(), "data/seed/demo_dictionary.json"),
            os.path.join(os.getcwd(), "apps/api/prisma/demo_dictionary.json"),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../../data/seed/demo_dictionary.json")),
            "/app/data/seed/demo_dictionary.json",
        ]
        seed_path = next((p for p in candidate_paths if os.path.exists(p)), None)
        if not seed_path:
            logger.warning("No dictionary data found for in-memory index.")
            _CACHED_DICT_DATA = {}
            return _CACHED_DICT_DATA

        try:
            with open(seed_path, "r", encoding="utf-8") as f:
                raw = json.load(f)

            index_map: Dict[str, List[dict]] = {}
            if isinstance(raw, list):
                for item in raw:
                    hw = (item.get("headword") or item.get("raw_headword") or "").strip()
                    df = item.get("definition") or ""
                    if hw and df:
                        if hw not in index_map:
                            index_map[hw] = []
                        index_map[hw].append({
                            "id": str(item.get("index") or hw),
                            "word": hw,
                            "definition": df,
                            "edition": str(item.get("edition") or "2554"),
                        })
            elif isinstance(raw, dict):
                words_map = {w["id"]: w["headword"] for w in raw.get("words", [])}
                entry_to_word = {e["id"]: words_map.get(e["wordId"], "") for e in raw.get("wordEntries", [])}
                entry_to_ed = {e["id"]: e.get("editionId", "") for e in raw.get("wordEntries", [])}
                editions_map = {ed["id"]: ed.get("editionYear", "") for ed in raw.get("editions", [])}

                for d in raw.get("definitions", []):
                    word = entry_to_word.get(d["entryId"], "").strip()
                    ed_year = editions_map.get(entry_to_ed.get(d["entryId"], ""), "2554")
                    def_text = d.get("definitionText", "")
                    if word and def_text:
                        if word not in index_map:
                            index_map[word] = []
                        index_map[word].append({
                            "id": d["id"],
                            "word": word,
                            "definition": def_text,
                            "edition": str(ed_year),
                        })

            _CACHED_DICT_DATA = index_map
            logger.info(f"Loaded {len(index_map)} unique dictionary headwords into in-memory index from {seed_path}")
            return _CACHED_DICT_DATA
        except Exception as err:
            logger.error(f"Failed to load in-memory dictionary: {err}")
            _CACHED_DICT_DATA = {}
            return _CACHED_DICT_DATA

    def _fallback_in_memory_search(self, query_text: str, query_vector: List[float], top_k: int) -> List[SemanticSearchResult]:
        dict_index = self._get_in_memory_dict()
        if not dict_index:
            return []

        from app.services.nlp.tokenizer import ThaiNLPTokenizer
        cleaned_q = query_text.strip()
        tokens = [t for t in ThaiNLPTokenizer.extract_keywords(query_text) if len(t) > 1]
        search_terms = list(dict.fromkeys([cleaned_q] + tokens))

        scored: List[SemanticSearchResult] = []
        seen_words = set()

        # 1. Exact match on cleaned query
        if cleaned_q in dict_index:
            for entry in dict_index[cleaned_q]:
                seen_words.add(cleaned_q)
                scored.append(SemanticSearchResult(
                    id=entry["id"],
                    word=entry["word"],
                    definition=entry["definition"],
                    edition=entry["edition"],
                    score=0.98
                ))

        # 2. Exact match on extracted keywords
        for tok in tokens:
            if tok in dict_index and tok not in seen_words:
                seen_words.add(tok)
                for entry in dict_index[tok]:
                    scored.append(SemanticSearchResult(
                        id=entry["id"],
                        word=entry["word"],
                        definition=entry["definition"],
                        edition=entry["edition"],
                        score=0.94
                    ))

        # 3. Substring matching if fewer than top_k
        if len(scored) < top_k:
            for hw, entries in dict_index.items():
                if hw in seen_words:
                    continue
                is_sub = (cleaned_q in hw) or (hw in cleaned_q and len(hw) >= 4 and len(hw) >= len(cleaned_q) * 0.6)
                if is_sub and len(hw) >= 2:
                    seen_words.add(hw)
                    for entry in entries:
                        scored.append(SemanticSearchResult(
                            id=entry["id"],
                            word=entry["word"],
                            definition=entry["definition"],
                            edition=entry["edition"],
                            score=0.88
                        ))
                if len(scored) >= top_k * 3:
                    break

        scored.sort(key=lambda x: x.score, reverse=True)
        return scored[:top_k]

_CACHED_DICT_DATA = None
vector_search_service = VectorSearchService()
