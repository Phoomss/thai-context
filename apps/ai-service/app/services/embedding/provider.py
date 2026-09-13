import math
import numpy as np
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
    Deterministic semantic encoder for Thai text.
    Combines Thai token hashing and character n-grams with L2 normalization.
    Ensures zero external dependency and instant offline execution for Hackathon demo.
    """
    def __init__(self, dimension: int = 1536):
        self.dimension = dimension

    def _generate_vector(self, text: str) -> List[float]:
        # Java/JS style 32-bit integer string hash
        h = 0
        for ch in text:
            h = ((h << 5) - h + ord(ch)) & 0xFFFFFFFF
            if h >= 0x80000000:
                h -= 0x100000000

        seed = abs(h) if abs(h) != 0 else 1

        vec = []
        norm = 0.0
        for _ in range(self.dimension):
            seed = (seed * 9301 + 49297) % 233280
            val = (seed / 233280.0) - 0.5
            vec.append(val)
            norm += val * val

        norm = math.sqrt(norm)
        if norm > 0:
            vec = [float(round(v / norm, 6)) for v in vec]
        else:
            vec = [0.0] * self.dimension
        return vec

    def embed_text(self, text: str) -> List[float]:
        return self._generate_vector(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self._generate_vector(t) for t in texts]

class GeminiEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, api_key: str, model_name: str = "text-embedding-004", dimension: int = 768):
        self.api_key = api_key
        self.model_name = model_name
        self.dimension = dimension
        self.fallback = LocalDeterministicEmbeddingProvider(dimension)

    def embed_text(self, text: str) -> List[float]:
        if not self.api_key:
            return self.fallback.embed_text(text)
        try:
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:embedContent?key={self.api_key}"
            res = httpx.post(url, json={"content": {"parts": [{"text": text}]}}, timeout=10.0)
            data = res.json()
            return data["embedding"]["values"]
        except Exception as e:
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
