import logging
from typing import List
import psycopg
from fastapi import APIRouter, HTTPException, Depends
from app.core.config import settings
from app.models.schemas import (
    HealthResponse,
    QueryUnderstandingRequest,
    QueryUnderstandingResponse,
    SemanticSearchRequest,
    SemanticSearchResponse,
    ContextRecommendRequest,
    ContextRecommendResponse,
    CompareRequest,
    CompareResponse,
    ChatRequest,
    ChatResponse,
    EvidenceItem
)
from app.services.nlp.query_parser import query_parser
from app.services.retrieval.vector_search import vector_search_service
from app.services.ranking.ranker import ranker_service
from app.services.rag.assistant import rag_assistant

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="ok")

@router.post("/query-understanding", response_model=QueryUnderstandingResponse)
def query_understanding(payload: QueryUnderstandingRequest):
    try:
        return query_parser.parse(payload.query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query understanding failed: {str(e)}")

@router.post("/semantic-search", response_model=SemanticSearchResponse)
def semantic_search(payload: SemanticSearchRequest):
    try:
        results = vector_search_service.search(payload.query, top_k=payload.top_k or 10)
        return SemanticSearchResponse(query=payload.query, results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Semantic search failed: {str(e)}")

@router.post("/recommend", response_model=ContextRecommendResponse)
def context_recommend(payload: ContextRecommendRequest):
    try:
        parsed = query_parser.parse(payload.query)
        effective_context = payload.context or parsed.context
        effective_excluded = list(set((payload.excluded_terms or []) + parsed.excluded_terms))
        search_query = parsed.meaning or payload.query

        candidates = vector_search_service.search(search_query, top_k=15)
        recommendations = ranker_service.rank_and_explain(
            query=search_query,
            candidates=candidates,
            context=effective_context,
            excluded_terms=effective_excluded
        )

        return ContextRecommendResponse(
            intent=parsed.intent,
            context=effective_context,
            excluded_terms=effective_excluded,
            recommendations=recommendations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Context recommendation failed: {str(e)}")

@router.post("/compare")
def compare_words(payload: CompareRequest):
    try:
        words_data = []
        all_evidences: List[EvidenceItem] = []

        for item in payload.words:
            if isinstance(item, dict):
                hw = item.get("headword") or item.get("word", "")
                df = item.get("definition", "")
                ed = item.get("edition", "2554")
                words_data.append({"headword": hw, "definition": df, "edition": ed})
                all_evidences.append(EvidenceItem(
                    word=hw,
                    source="สำนักงานราชบัณฑิตยสภา",
                    edition=ed,
                    definition=df,
                    relevance=1.0
                ))
            else:
                word_str = str(item).strip()
                # Query exact match in database first
                found = False
                try:
                    with psycopg.connect(settings.DATABASE_URL) as conn:
                        with conn.cursor() as cur:
                            cur.execute(
                                """
                                SELECT w.headword, d.definition_text, de.edition_year
                                FROM words w
                                JOIN word_entries we ON w.id = we.word_id
                                JOIN definitions d ON we.id = d.entry_id
                                LEFT JOIN dictionary_editions de ON we.edition_id = de.id
                                WHERE w.headword = %s
                                ORDER BY de.edition_year DESC
                                LIMIT 1;
                                """,
                                (word_str,)
                            )
                            row = cur.fetchone()
                            if row:
                                words_data.append({
                                    "headword": row[0],
                                    "definition": row[1],
                                    "edition": str(row[2]) if row[2] else "2554"
                                })
                                all_evidences.append(EvidenceItem(
                                    word=row[0],
                                    source="สำนักงานราชบัณฑิตยสภา",
                                    edition=str(row[2]) if row[2] else "2554",
                                    definition=row[1],
                                    relevance=1.0
                                ))
                                found = True
                except Exception as db_err:
                    logger.warning(f"Database lookup for word '{word_str}' failed: {db_err}")

                if not found:
                    candidates = vector_search_service.search(word_str, top_k=5)
                    matched = next((c for c in candidates if c.word == word_str), None)
                    if matched:
                        words_data.append({
                            "headword": matched.word,
                            "definition": matched.definition,
                            "edition": matched.edition or "2554"
                        })
                        all_evidences.append(EvidenceItem(
                            word=matched.word,
                            source="สำนักงานราชบัณฑิตยสภา",
                            edition=matched.edition or "2554",
                            definition=matched.definition,
                            relevance=matched.score
                        ))
                    else:
                        words_data.append({
                            "headword": word_str,
                            "definition": "ไม่มีข้อมูลในพจนานุกรมทางการ",
                            "edition": "-"
                        })

        comparison = rag_assistant.compare_words(words_data)
        return {
            "words": words_data,
            "comparison": comparison.model_dump(),
            "evidence": [e.model_dump() for e in all_evidences]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compare words failed: {str(e)}")

@router.post("/chat", response_model=ChatResponse)
def rag_chat(payload: ChatRequest):
    try:
        candidates = vector_search_service.search(payload.message, top_k=3)
        evidences = [
            EvidenceItem(
                word=c.word,
                source="สำนักงานราชบัณฑิตยสภา",
                edition=c.edition or "2554",
                definition=c.definition,
                relevance=c.score
            )
            for c in candidates
        ]
        return rag_assistant.answer_query(payload.message, evidences)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG chat failed: {str(e)}")
