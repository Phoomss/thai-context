import logging
from typing import List, Dict, Any, Optional
from app.models.schemas import EvidenceItem

logger = logging.getLogger(__name__)

class ConfidenceService:
    """
    Computes Evidence Confidence (Grounded Confidence) based on multi-factor analysis:
    - retrieval_score: Relevance of retrieved dictionary evidence
    - evidence_coverage: Proportion of query concepts/target words matched in evidence
    - source_reliability: Authority level of source (Official Royal Society = 1.0)
    - grounding_score: Degree to which the explanation is derived strictly from evidence
    """

    def __init__(
        self,
        w_retrieval: float = 0.35,
        w_coverage: float = 0.25,
        w_source: float = 0.20,
        w_grounding: float = 0.20,
        high_threshold: float = 0.85,
        medium_threshold: float = 0.65,
    ):
        self.w_retrieval = w_retrieval
        self.w_coverage = w_coverage
        self.w_source = w_source
        self.w_grounding = w_grounding
        self.high_threshold = high_threshold
        self.medium_threshold = medium_threshold

    def calculate_confidence(
        self,
        query: str,
        evidences: List[EvidenceItem],
        target_word: Optional[str] = None,
        is_abstained: bool = False,
    ) -> Dict[str, Any]:
        if is_abstained or not evidences:
            return {
                "confidence": 0.12,
                "confidence_level": "LOW",
                "breakdown": {
                    "retrieval_score": 0.0,
                    "evidence_coverage": 0.0,
                    "source_reliability": 0.0,
                    "grounding_score": 0.0,
                },
            }

        # 1. Retrieval Score (max relevance capped between 0 and 1)
        top_relevance = max((e.relevance for e in evidences), default=0.0)
        retrieval_score = min(1.0, max(0.0, top_relevance))

        # 2. Evidence Coverage
        # Check if target word or query core appears in evidence headwords
        evidence_words = [e.word for e in evidences if e.word]
        if target_word and any(target_word == ew for ew in evidence_words):
            evidence_coverage = 1.0
        elif any(ew in query for ew in evidence_words):
            evidence_coverage = 0.90
        elif len(evidences) >= 2:
            evidence_coverage = 0.80
        else:
            evidence_coverage = 0.65

        # 3. Source Reliability
        # Royal Society editions (2542, 2554, 2569) or official data = 1.0
        official_count = sum(
            1 for e in evidences if e.source_type in ["OFFICIAL", "OFFICIAL_DATA", "OFFICIAL_CURATED"]
        )
        source_reliability = official_count / len(evidences) if evidences else 0.5
        # Official sources get 1.0
        source_reliability = min(1.0, max(0.6, source_reliability))

        # 4. Grounding Score
        # Grounding is high when definitions contain rich linguistic explanations
        has_rich_definition = any(len(e.definition or "") > 20 for e in evidences)
        grounding_score = 0.95 if has_rich_definition else 0.75

        # Weighted calculation
        composite_score = (
            (retrieval_score * self.w_retrieval)
            + (evidence_coverage * self.w_coverage)
            + (source_reliability * self.w_source)
            + (grounding_score * self.w_grounding)
        )
        composite_score = round(min(1.0, max(0.0, composite_score)), 2)

        # Map to Confidence Level
        if composite_score >= self.high_threshold:
            level = "HIGH"
        elif composite_score >= self.medium_threshold:
            level = "MEDIUM"
        else:
            level = "LOW"

        return {
            "confidence": composite_score,
            "confidence_level": level,
            "breakdown": {
                "retrieval_score": round(retrieval_score, 2),
                "evidence_coverage": round(evidence_coverage, 2),
                "source_reliability": round(source_reliability, 2),
                "grounding_score": round(grounding_score, 2),
            },
        }

confidence_service = ConfidenceService()
