import re
from typing import List

try:
    from pythainlp.tokenize import word_tokenize
    from pythainlp.corpus import thai_stopwords
    from pythainlp.util import normalize
    STOP_WORDS = thai_stopwords()
    HAS_PYTHAINLP = True
except ImportError:
    HAS_PYTHAINLP = False
    STOP_WORDS = {"และ", "หรือ", "ใน", "ที่", "ของ", "การ", "ความ", "ไป", "มา", "ได้", "ให้", "กับ"}

class ThaiNLPTokenizer:
    @staticmethod
    def clean_text(text: str) -> str:
        """Normalize Thai vowels/tonemarks and strip leading/trailing spaces"""
        if not text:
            return ""
        if HAS_PYTHAINLP:
            text = normalize(text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    @staticmethod
    def tokenize(text: str, keep_whitespace: bool = False) -> List[str]:
        cleaned = ThaiNLPTokenizer.clean_text(text)
        if HAS_PYTHAINLP:
            return word_tokenize(cleaned, engine="newmm", keep_whitespace=keep_whitespace)
        # Fallback whitespace / character tokenization
        parts = cleaned.split() if not keep_whitespace else re.split(r"(\s+)", cleaned)
        return [p for p in parts if p]

    @staticmethod
    def extract_keywords(text: str) -> List[str]:
        tokens = ThaiNLPTokenizer.tokenize(text)
        keywords = [
            t for t in tokens
            if t not in STOP_WORDS and len(t.strip()) > 1 and not t.isnumeric()
        ]
        return keywords
