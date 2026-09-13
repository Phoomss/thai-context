import re
from typing import List, Tuple, Optional
from pythainlp.tokenize import word_tokenize
from app.models.schemas import QueryUnderstandingResponse
from app.services.nlp.tokenizer import ThaiNLPTokenizer

class QueryParserService:
    # Excluded terms patterns
    EXCLUDE_PATTERNS = [
        r"(?:แต่)?(?:ไม่อยาก|ไม่เอา|ไม่ต้องการ|เว้น|หลีกเลี่ยง|ห้าม)?(?:ใช้)?คำว่า\s*([^\s,]+)",
        r"(?:แต่)?(?:ไม่ใช้|ไม่ใช่|ไม่เอา)\s*([^\s,]+)",
    ]

    # Context patterns
    CONTEXT_PATTERNS = [
        r"(?:ใน)?บริบท(?:ของ)?\s*([^\s,]+)",
        r"(?:สำหรับ|ใน)\s*(รายงาน[^\s,]*|บทความ[^\s,]*|วิทยานิพนธ์[^\s,]*|เอกสารราชการ[^\s,]*|งานวิจัย[^\s,]*)",
        r"(?:ใช้ใน|เน้น)\s*([^\s,]+)",
    ]

    # Intent starter patterns
    INTENT_PREFIXES = [
        r"^อยากบอกว่า\s*",
        r"^หมายถึง\s*",
        r"^คำที่หมายถึง\s*",
        r"^ค้นหาคำว่า\s*",
        r"^หาคำที่สื่อถึง\s*",
        r"^คำอะไรที่แปลว่า\s*",
    ]

    def parse(self, raw_query: str) -> QueryUnderstandingResponse:
        cleaned_query = ThaiNLPTokenizer.clean_text(raw_query)
        excluded_terms: List[str] = []
        context: Optional[str] = None
        constraints: List[str] = []

        # 1. Extract Excluded Terms
        for pat in self.EXCLUDE_PATTERNS:
            matches = re.findall(pat, cleaned_query)
            for m in matches:
                word = m.strip().strip("'\"“”‘’")
                if word and word not in excluded_terms:
                    excluded_terms.append(word)

        # 2. Extract Context
        for pat in self.CONTEXT_PATTERNS:
            match = re.search(pat, cleaned_query)
            if match:
                ctx = match.group(1).strip()
                if ctx and not context:
                    context = ctx

        # 3. Clean query to get core meaning
        meaning = cleaned_query
        # Remove excluded clauses
        for pat in self.EXCLUDE_PATTERNS:
            meaning = re.sub(pat, "", meaning)
        # Remove context clauses
        for pat in self.CONTEXT_PATTERNS:
            meaning = re.sub(pat, "", meaning)
        # Remove intent prefixes
        for prefix in self.INTENT_PREFIXES:
            meaning = re.sub(prefix, "", meaning)

        # Clean trailing/leading artifacts
        meaning = re.sub(r"^[แต่,\s]+", "", meaning)
        meaning = re.sub(r"[แต่,\s]+$", "", meaning).strip()

        if not meaning:
            meaning = cleaned_query

        # 4. Determine Intent
        intent = "find_word_by_meaning"
        if excluded_terms:
            intent = "find_alternative_word"
        elif "เปรียบเทียบ" in raw_query or "ต่างกัน" in raw_query:
            intent = "compare_words"
        elif "ภาษาถิ่น" in raw_query or "ถิ่น" in raw_query:
            intent = "explore_dialect"

        # 5. Extract constraints
        if context:
            if "วิชาการ" in context or "รายงาน" in context or "ราชการ" in context:
                constraints.append("REGISTER:FORMAL")
            elif "สนทนา" in context or "ทั่วไป" in context:
                constraints.append("REGISTER:INFORMAL")

        return QueryUnderstandingResponse(
            intent=intent,
            meaning=meaning,
            context=context,
            excluded_terms=excluded_terms,
            constraints=constraints
        )

query_parser = QueryParserService()
