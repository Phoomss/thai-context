import logging
import re
from typing import List, Tuple, Dict, Any, Optional
from app.models.schemas import EvidenceItem

logger = logging.getLogger(__name__)

class AbstentionGuard:
    """
    Guards against AI hallucinations by validating whether retrieved dictionary evidence
    is sufficient and appropriate to answer the user query.
    Enforces the Trusted AI principle: "Abstain when evidence is insufficient".
    """

    def __init__(self, min_similarity_threshold: float = 0.60):
        self.min_similarity_threshold = min_similarity_threshold

        # Patterns attempting to force AI to fabricate or hallucinate official dictionary data
        self.jailbreak_patterns = [
            re.compile(r"ignore\s+(all\s+)?(previous|prior)\s+instructions", re.IGNORECASE),
            re.compile(r"สร้าง\s*(นิยาม|ความหมาย|definition|ศัพท์)\s*(ใหม่)?.*(ราชบัณฑิต|ทางการ)", re.IGNORECASE),
            re.compile(r"แต่ง\s*(นิยาม|ความหมาย).*เป็นข้อมูล(ทางการ|ราชบัณฑิต)", re.IGNORECASE),
            re.compile(r"แกล้งทำเป็น(ราชบัณฑิต|พจนานุกรม)", re.IGNORECASE),
            re.compile(r"fake\s+(definition|dictionary)", re.IGNORECASE),
        ]

    def check_hallucination_attempt(self, user_query: str) -> Tuple[bool, str]:
        """
        Detects adversarial prompts attempting to force fake dictionary definitions.
        """
        for pattern in self.jailbreak_patterns:
            if pattern.search(user_query):
                return True, "ตรวจพบความพยายามสั่งการให้สร้างหรือปลอมแปลงนิยามพจนานุกรมทางการ ซึ่งขัดต่อหลักการความถูกต้องทางภาษา (Trusted AI Policy)"
        return False, ""

    def evaluate(
        self,
        user_query: str,
        evidences: List[EvidenceItem],
        target_word: Optional[str] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluates 5 key abstention conditions:
        1. Condition 1: No evidence
        2. Condition 2: Top evidence relevance below threshold (< 0.60)
        3. Condition 3: Evidence doesn't cover domain/context
        4. Condition 4: Adversarial hallucination attempt
        5. Condition 5: Requesting facts outside dictionary bounds
        """
        # Condition 4: Hallucination / Jailbreak attempt check
        is_adversarial, reason = self.check_hallucination_attempt(user_query)
        if is_adversarial:
            logger.warning(f"Adversarial prompt detected: {user_query}")
            return {
                "should_abstain": True,
                "reason": reason,
                "abstention_type": "ADVERSARIAL_REFUSAL",
                "recommended_response": "ระบบปฏิเสธการดำเนินการ: THAI CONTEXT ยึดมั่นในข้อมูลทางการของสำนักงานราชบัณฑิตยสภาเป็นหลักฐานอ้างอิงสูงสุด จึงไม่อาจสร้างหรือดัดแปลงนิยามพจนานุกรมขึ้นมาเองได้"
            }

        # Condition 1: Empty evidence check
        if not evidences:
            logger.info("Abstaining: Zero evidence retrieved.")
            return {
                "should_abstain": True,
                "reason": "ไม่พบข้อมูลคำศัพท์หรือหลักฐานที่เพียงพอในคลังพจนานุกรม",
                "abstention_type": "NO_EVIDENCE",
                "recommended_response": "ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลพจนานุกรมที่ระบบรองรับ จึงไม่สามารถยืนยันความหมายหรือการใช้คำนี้ได้อย่างเป็นทางการ"
            }

        # Condition 2: Relevance threshold check
        top_relevance = max((e.relevance for e in evidences), default=0.0)
        if top_relevance < self.min_similarity_threshold:
            logger.info(f"Abstaining: Top relevance {top_relevance:.2f} < threshold {self.min_similarity_threshold:.2f}")
            return {
                "should_abstain": True,
                "reason": f"ความเกี่ยวข้องของหลักฐานสูงสุด ({top_relevance:.2f}) ต่ำกว่าเกณฑ์ความน่าเชื่อถือขั้นต่ำ ({self.min_similarity_threshold:.2f})",
                "abstention_type": "LOW_RELEVANCE",
                "recommended_response": "หลักฐานพจนานุกรมที่มีอยู่มีความเกี่ยวข้องต่ำเกินกว่าจะสรุปเป็นข้อเท็จจริงทางภาษาได้อย่างชัดเจน เพื่อป้องกันข้อมูลคลาดเคลื่อน ระบบจึงของดเว้นการให้คำตอบในส่วนนี้"
            }

        # Condition 3 & 5: Context check (Caveat advisory instead of hard abort when general definition exists)
        has_context_caveat = False
        caveat_note = ""
        if context in ["legal", "medical"] and not any(context in (e.definition or "").lower() for e in evidences):
            has_context_caveat = True
            caveat_note = f"หมายเหตุ: นิยามในพจนานุกรมเป็นนิยามมาตรฐานทางภาษาทั่วไป ไม่ใช่นิยามเฉพาะทางด้าน {context} โดยตรง จึงควรปรึกษาผู้เชี่ยวชาญหรือประมวลกฎหมาย/คู่มือเฉพาะทางประกอบ"

        return {
            "should_abstain": False,
            "reason": "ผ่านเกณฑ์การตรวจสอบหลักฐานครบถ้วน",
            "abstention_type": "NONE",
            "has_caveat": has_context_caveat,
            "caveat_note": caveat_note,
            "recommended_response": ""
        }

abstention_guard = AbstentionGuard()
