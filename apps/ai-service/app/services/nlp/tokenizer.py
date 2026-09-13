import re
from typing import List
from pythainlp.tokenize import word_tokenize
from pythainlp.corpus import thai_stopwords
from pythainlp.util import normalize

STOP_WORDS = thai_stopwords()

class ThaiNLPTokenizer:
    @staticmethod
    def clean_text(text: str) -> str:
        """Normalize Thai vowels/tonemarks and strip leading/trailing spaces"""
        if not text:
            return ""
        text = normalize(text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    @staticmethod
    def tokenize(text: str, keep_whitespace: bool = False) -> List[str]:
        cleaned = ThaiNLPTokenizer.clean_text(text)
        tokens = word_tokenize(cleaned, engine="newmm", keep_whitespace=keep_whitespace)
        return tokens

    @staticmethod
    def extract_keywords(text: str) -> List[str]:
        tokens = ThaiNLPTokenizer.tokenize(text)
        keywords = [
            t for t in tokens
            if t not in STOP_WORDS and len(t.strip()) > 1 and not t.isnumeric()
        ]
        return keywords
