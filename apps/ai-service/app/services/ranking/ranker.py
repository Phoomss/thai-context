from typing import List, Optional
from app.core.config import settings
from app.models.schemas import RecommendationItem, EvidenceItem, SemanticSearchResult
from app.services.nlp.tokenizer import ThaiNLPTokenizer

class ContextRankerService:
    def __init__(self):
        self.w_semantic = settings.WEIGHT_SEMANTIC
        self.w_keyword = settings.WEIGHT_KEYWORD
        self.w_context = settings.WEIGHT_CONTEXT
        self.w_source = settings.WEIGHT_SOURCE

    def compute_keyword_score(self, query: str, word: str, definition: str) -> float:
        query_tokens = set(ThaiNLPTokenizer.extract_keywords(query))
        if not query_tokens:
            return 0.5

        def_tokens = set(ThaiNLPTokenizer.extract_keywords(f"{word} {definition}"))
        overlap = len(query_tokens.intersection(def_tokens))
        return min(1.0, overlap / max(1, len(query_tokens)))

    def compute_context_score(self, context: Optional[str], definition: str) -> float:
        if not context:
            return 0.7  # neutral context score

        ctx_tokens = set(ThaiNLPTokenizer.extract_keywords(context))
        def_tokens = set(ThaiNLPTokenizer.tokenize(definition))
        
        # Check formal markers
        formal_markers = {"รายงาน", "วิชาการ", "ราชการ", "ทางการ", "มหาวิทยาลัย", "วิทยานิพนธ์"}
        has_formal_context = any(m in context for m in formal_markers)

        if has_formal_context:
            # Reward official / formal definitions
            score = 0.85
        else:
            score = 0.7

        overlap = len(ctx_tokens.intersection(def_tokens))
        if overlap > 0:
            score += 0.15

        return min(1.0, score)

    def rank_and_explain(
        self,
        query: str,
        candidates: List[SemanticSearchResult],
        context: Optional[str] = None,
        excluded_terms: Optional[List[str]] = None
    ) -> List[RecommendationItem]:
        excluded_set = set(t.strip() for t in (excluded_terms or []) if t.strip())
        results: List[RecommendationItem] = []

        seen_words = set()
        for cand in candidates:
            # 1. Exclusion filter: strictly avoid excluded words
            if cand.word in excluded_set or any(ex in cand.word for ex in excluded_set):
                continue

            if cand.word in seen_words:
                continue
            seen_words.add(cand.word)

            # 2. Hybrid scores
            sem_score = max(0.0, min(1.0, cand.score))
            kw_score = self.compute_keyword_score(query, cand.word, cand.definition)
            ctx_score = self.compute_context_score(context, cand.definition)
            src_score = 1.0  # Official royal society source

            final_score = (
                sem_score * self.w_semantic
                + kw_score * self.w_keyword
                + ctx_score * self.w_context
                + src_score * self.w_source
            )
            final_score = round(min(0.99, max(0.50, final_score)), 2)

            # 3. Reason generation grounded in dictionary definition
            context_note = f" เหมาะสำหรับบริบท '{context}'" if context else ""
            reason = (
                f"มีความหมายสอดคล้องกับ '{query}' โดยนิยามระบุว่า '{cand.definition}'{context_note}"
            )

            # 4. Evidence linking
            evidence = [
                EvidenceItem(
                    word=cand.word,
                    source="สำนักงานราชบัณฑิตยสภา",
                    edition=cand.edition or "2554",
                    definition=cand.definition,
                    relevance=round(cand.score, 4)
                )
            ]

            results.append(
                RecommendationItem(
                    word=cand.word,
                    score=final_score,
                    reason=reason,
                    evidence=evidence
                )
            )

        results.sort(key=lambda x: x.score, reverse=True)
        return results

ranker_service = ContextRankerService()
