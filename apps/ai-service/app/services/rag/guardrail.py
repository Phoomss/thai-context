from typing import List, Tuple
from app.core.config import settings
from app.models.schemas import EvidenceItem

class HallucinationGuard:
    def __init__(self, min_similarity_threshold: float = None):
        self.min_similarity_threshold = min_similarity_threshold or settings.SIMILARITY_THRESHOLD

    def validate(self, evidences: List[EvidenceItem]) -> Tuple[bool, str]:
        """
        Validates whether retrieved dictionary evidence is sufficient to ground an AI response.
        Returns (is_grounded, failure_reason)
        """
        # 1. Evidence existence check
        if not evidences:
            return False, "ไม่พบหลักฐานพจนานุกรมที่สอดคล้องกับคำค้นหา"

        # 2. Relevance threshold check
        max_relevance = max(e.relevance for e in evidences)
        if max_relevance < self.min_similarity_threshold:
            return (
                False,
                f"ความเกี่ยวข้องสูงสุดของหลักฐาน ({max_relevance:.2f}) ต่ำกว่าเกณฑ์ขั้นต่ำ ({self.min_similarity_threshold:.2f})"
            )

        return True, "Passed hallucination guardrail"

hallucination_guard = HallucinationGuard()
