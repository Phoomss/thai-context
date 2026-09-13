from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "thai-context-ai-service"

class QueryUnderstandingRequest(BaseModel):
    query: str = Field(..., description="Thai natural language search or query", json_schema_extra={"example": "อยากบอกว่าคนนี้ทำงานได้ดี แต่ไม่อยากใช้คำว่าเก่ง"})

class QueryUnderstandingResponse(BaseModel):
    intent: str = Field(..., description="Detected user intent, e.g., find_word_by_meaning, find_alternative_word")
    meaning: str = Field(..., description="Core extracted semantic meaning")
    context: Optional[str] = Field(None, description="Extracted domain or situation context")
    excluded_terms: List[str] = Field(default_factory=list, description="Terms user explicitly wants to avoid")
    constraints: List[str] = Field(default_factory=list, description="Grammatical or formal constraints")

class SemanticSearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    top_k: Optional[int] = Field(10, description="Max candidates to return")

class SemanticSearchResult(BaseModel):
    id: str
    word: str
    definition: str
    edition: Optional[str] = None
    score: float

class SemanticSearchResponse(BaseModel):
    query: str
    results: List[SemanticSearchResult]

class ContextRecommendRequest(BaseModel):
    query: str
    context: Optional[str] = None
    excluded_terms: Optional[List[str]] = Field(default_factory=list)

class EvidenceItem(BaseModel):
    word: Optional[str] = None
    source: str
    edition: str
    definition: str
    relevance: float = 0.0

class RecommendationItem(BaseModel):
    word: str
    score: float
    reason: str
    evidence: List[EvidenceItem] = Field(default_factory=list)

class ContextRecommendResponse(BaseModel):
    intent: str
    context: Optional[str] = None
    excluded_terms: List[str] = Field(default_factory=list)
    recommendations: List[RecommendationItem] = Field(default_factory=list)

class CompareRequest(BaseModel):
    words: List[Any] = Field(..., min_length=2, max_length=5, description="List of 2 to 5 words to compare")

class WordComparisonDetail(BaseModel):
    meaningDifference: str
    contextDifference: str
    usageGuidance: str

class CompareResponse(BaseModel):
    words: List[Dict[str, Any]]
    comparison: WordComparisonDetail
    evidence: List[EvidenceItem] = Field(default_factory=list)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    answer: str
    grounded: bool
    evidence: List[EvidenceItem] = Field(default_factory=list)
