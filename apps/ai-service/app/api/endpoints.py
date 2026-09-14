import logging
from typing import List
import psycopg
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
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
    EvidenceItem,
    PhoneticsRequest,
    PhoneticsResponse,
    BilingualTranslateRequest,
    BilingualTranslateResponse,
    TtsSynthesizeRequest,
    TtsSynthesizeResponse
)
from app.services.nlp.query_parser import query_parser
from app.services.nlp.phonetics import phonetics_service
from app.services.retrieval.vector_search import vector_search_service
from app.services.ranking.ranker import ranker_service
from app.services.rag.assistant import rag_assistant
from app.services.rag.bilingual_translator import bilingual_translator
from app.services.audio.tts_engine import tts_engine

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

@router.post("/compare", response_model=CompareResponse)
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

def _retrieve_chat_evidences(payload: ChatRequest) -> List[EvidenceItem]:
    search_term = (payload.word or "").strip()
    if not search_term:
        # Extract potential target word or use message
        search_term = payload.message.strip()

    candidates = vector_search_service.search(search_term, top_k=4)
    evidences = [
        EvidenceItem(
            word=c.word,
            source="สำนักงานราชบัณฑิตยสภา",
            edition=c.edition or "2554",
            definition=c.definition,
            source_type="OFFICIAL",
            relevance=c.score
        )
        for c in candidates
    ]
    return evidences

@router.post("/chat", response_model=ChatResponse)
def rag_chat(payload: ChatRequest):
    try:
        evidences = _retrieve_chat_evidences(payload)
        return rag_assistant.answer_query(payload, evidences)
    except Exception as e:
        logger.error(f"RAG chat failed: {e}")
        raise HTTPException(status_code=500, detail=f"RAG chat failed: {str(e)}")

@router.post("/chat/stream")
async def rag_chat_stream(payload: ChatRequest):
    try:
        evidences = _retrieve_chat_evidences(payload)
        generator = rag_assistant.stream_consultation(payload, evidences)
        return StreamingResponse(
            generator,
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )
    except Exception as e:
        logger.error(f"RAG chat stream failed: {e}")
        raise HTTPException(status_code=500, detail=f"RAG chat stream failed: {str(e)}")

@router.post("/phonetics", response_model=PhoneticsResponse)
def get_phonetics(payload: PhoneticsRequest):
    try:
        result = phonetics_service.get_phonetics(payload.word, payload.known_spelling)
        return PhoneticsResponse(**result)
    except Exception as e:
        logger.error(f"Phonetics extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Phonetics processing failed: {str(e)}")

@router.post("/bilingual-explanation", response_model=BilingualTranslateResponse)
def bilingual_explanation(payload: BilingualTranslateRequest):
    try:
        result = bilingual_translator.translate_and_explain(
            headword=payload.word,
            definition_text=payload.definition,
            pos=payload.pos,
            domain=payload.domain
        )
        return BilingualTranslateResponse(**result)
    except Exception as e:
        logger.error(f"Bilingual translation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Bilingual translation failed: {str(e)}")

@router.post("/tts-synthesize", response_model=TtsSynthesizeResponse)
async def tts_synthesize(payload: TtsSynthesizeRequest):
    try:
        result = await tts_engine.synthesize(
            text=payload.text,
            voice=payload.voice or "th-TH-PremwadeeNeural",
            speed=payload.speed or 1.0
        )
        return TtsSynthesizeResponse(**result)
    except Exception as e:
        logger.error(f"TTS synthesis failed: {e}")
        raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")
