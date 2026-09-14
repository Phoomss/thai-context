import math
from abc import ABC, abstractmethod
from typing import List
from app.core.config import settings
from app.services.nlp.tokenizer import ThaiNLPTokenizer

class BaseEmbeddingProvider(ABC):
    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        pass

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        pass

class LocalDeterministicEmbeddingProvider(BaseEmbeddingProvider):
    """
    Enhanced deterministic semantic encoder for Thai text.
    Combines Thai tokenization, keyword extraction, and character n-grams (3-grams, 4-grams)
    with Random Projection Feature Hashing and L2 normalization.
    Ensures that morphological overlaps and shared vocabulary produce correlated vectors.
    """
    def __init__(self, dimension: int = 1536):
        self.dimension = dimension

    def _hash_feature(self, feature: str, seed: int = 42) -> tuple:
        """Returns (index, sign) for a given text feature"""
        h = seed
        for ch in feature:
            h = ((h << 5) - h + ord(ch)) & 0xFFFFFFFF
            if h >= 0x80000000:
                h -= 0x100000000
        idx = abs(h) % self.dimension
        sign = 1.0 if (abs(h) % 2 == 0) else -1.0
        return idx, sign

    def _generate_vector(self, text: str) -> List[float]:
        if not text:
            return [0.0] * self.dimension

        cleaned = ThaiNLPTokenizer.clean_text(text)
        tokens = ThaiNLPTokenizer.tokenize(cleaned)
        keywords = ThaiNLPTokenizer.extract_keywords(cleaned)

        vec = [0.0] * self.dimension

        # 1. Whole text fingerprint
        idx, sign = self._hash_feature(cleaned, seed=101)
        vec[idx] += 3.0 * sign

        # 2. Token features (weight: 2.0)
        for t in tokens:
            if not t.strip():
                continue
            idx, sign = self._hash_feature(t, seed=202)
            vec[idx] += 2.0 * sign

        # 3. Keywords (weight: 3.5 for salient terms)
        for kw in keywords:
            idx, sign = self._hash_feature(kw, seed=303)
            vec[idx] += 3.5 * sign

        # 4. Character 2-grams, 3-grams & 4-grams for Thai morphological root capture (weight: 1.2)
        chars = cleaned.replace(" ", "")
        for n in (2, 3, 4):
            if len(chars) >= n:
                for i in range(len(chars) - n + 1):
                    gram = chars[i:i+n]
                    idx, sign = self._hash_feature(gram, seed=404 + n)
                    vec[idx] += 1.2 * sign

        # L2 Normalization
        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 0:
            return [float(round(v / norm, 6)) for v in vec]
        return [0.0] * self.dimension

    def embed_text(self, text: str) -> List[float]:
        return self._generate_vector(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self._generate_vector(t) for t in texts]

class GeminiEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, api_key: str, model_name: str = "text-embedding-004", dimension: int = 1536):
        self.api_key = api_key
        self.model_name = model_name
        self.dimension = dimension
        self.fallback = LocalDeterministicEmbeddingProvider(dimension)

    def _normalize_dimension(self, values: List[float]) -> List[float]:
        """Adjust vector dimensionality to match pgvector target dimension (1536)"""
        if len(values) == self.dimension:
            return values
        if len(values) < self.dimension:
            # Repeat or pad and re-normalize
            padded = values * (self.dimension // len(values)) + values[:(self.dimension % len(values))]
            norm = math.sqrt(sum(v * v for v in padded))
            return [float(round(v / norm, 6)) for v in padded] if norm > 0 else padded
        return values[:self.dimension]

    def embed_text(self, text: str) -> List[float]:
        if not self.api_key:
            return self.fallback.embed_text(text)
        try:
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:embedContent?key={self.api_key}"
            payload = {
                "content": {"parts": [{"text": text}]},
                "outputDimensionality": min(self.dimension, 1536)
            }
            res = httpx.post(url, json=payload, timeout=10.0)
            data = res.json()
            raw_values = data["embedding"]["values"]
            return self._normalize_dimension(raw_values)
        except Exception:
            return self.fallback.embed_text(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]

class OpenAIEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, api_key: str, model_name: str = "text-embedding-3-small", dimension: int = 1536):
        self.api_key = api_key
        self.model_name = model_name
        self.dimension = dimension
        self.fallback = LocalDeterministicEmbeddingProvider(dimension)

    def embed_text(self, text: str) -> List[float]:
        if not self.api_key:
            return self.fallback.embed_text(text)
        try:
            import httpx
            headers = {"Authorization": f"Bearer {self.api_key}"}
            res = httpx.post(
                "https://api.openai.com/v1/embeddings",
                headers=headers,
                json={"input": text, "model": self.model_name},
                timeout=10.0
            )
            data = res.json()
            return data["data"][0]["embedding"]
        except Exception as e:
            return self.fallback.embed_text(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]

def get_embedding_provider() -> BaseEmbeddingProvider:
    provider = settings.EMBEDDING_PROVIDER.lower()
    if provider == "gemini" and settings.GEMINI_API_KEY:
        return GeminiEmbeddingProvider(settings.GEMINI_API_KEY, settings.EMBEDDING_MODEL, settings.VECTOR_DIMENSION)
    elif provider == "openai" and settings.OPENAI_API_KEY:
        return OpenAIEmbeddingProvider(settings.OPENAI_API_KEY, settings.EMBEDDING_MODEL, settings.VECTOR_DIMENSION)
    else:
        return LocalDeterministicEmbeddingProvider(settings.VECTOR_DIMENSION)

embedding_provider = get_embedding_provider()
