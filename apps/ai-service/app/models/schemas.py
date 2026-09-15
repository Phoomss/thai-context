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
    source_type: str = "OFFICIAL"  # 'OFFICIAL', 'AI_GENERATED', 'AI_INFERRED'
    relevance: float = 0.0

class GeneratedContentItem(BaseModel):
    type: str = "writing_suggestion"  # 'writing_suggestion', 'usage_guidance', 'context_caveat'
    content: str

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
    word: Optional[str] = None
    context: Optional[str] = None  # 'academic', 'business', 'formal', 'casual', 'legal', 'general'

class ChatResponse(BaseModel):
    answer: str
    grounded: bool
    abstained: bool = False
    confidence: float = 0.0
    confidence_level: str = "MEDIUM"  # 'HIGH', 'MEDIUM', 'LOW'
    evidence: List[EvidenceItem] = Field(default_factory=list)
    generated_content: List[GeneratedContentItem] = Field(default_factory=list)
    abstention_reason: Optional[str] = None

# Accessibility & Multilingual Schemas
class PhoneticsRequest(BaseModel):
    word: str = Field(..., description="Thai headword")
    known_spelling: Optional[str] = Field(None, description="Known pronunciation from dictionary entry if available")

class PhoneticsResponse(BaseModel):
    headword: str
    phonetic_spelling: str
    transliteration_rtgs: str
    ipa_notation: str
    tone_pattern: str
    syllables: List[str]
    source_type: str

class BilingualTranslateRequest(BaseModel):
    word: str = Field(..., description="Thai headword")
    definition: Optional[str] = Field(None, description="Official dictionary definition text")
    pos: Optional[str] = Field(None, description="Part of speech")
    domain: Optional[str] = Field(None, description="Subject domain")

class BilingualTranslateResponse(BaseModel):
    headword: str
    primary_translation: str
    secondary_translations: List[str] = Field(default_factory=list)
    contextual_explanation_en: str
    usage_nuance_en: str
    provenance: str
    confidence_score: float

class TtsSynthesizeRequest(BaseModel):
    text: str = Field(..., description="Text to synthesize to speech")
    voice: Optional[str] = Field("th-TH-PremwadeeNeural", description="Voice identifier")
    speed: Optional[float] = Field(1.0, description="Speech rate multiplier")

class TtsSynthesizeResponse(BaseModel):
    audio_base64: str
    format: str = "mp3"
    provider: str
    cached: bool
    duration_ms: Optional[int] = None

# Sentence Quirkifier Schemas
class WordMappingItem(BaseModel):
    original_phrase: str = Field(..., description="Original word/phrase replaced")
    replaced_word: str = Field(..., description="Quirkified replacement word")
    part_of_speech: Optional[str] = Field(None, description="Part of speech, e.g. น., ก., ว.")
    official_definition: str = Field(..., description="Official dictionary definition from Royal Society")
    source_edition: str = Field("สำนักงานราชบัณฑิตยสภา", description="Dictionary edition citation")
    quirk_reason: str = Field(..., description="Humorous rationale for choosing this word")

class QuirkifyRequest(BaseModel):
    sentence: str = Field(..., min_length=1, max_length=300, description="Original Thai sentence")
    style: Optional[str] = Field("ancient", description="Target style: ancient, formal, meme, literary, dialect, poetic, gentle")
    mode: Optional[str] = Field("quirkify", description="Mode: 'quirkify' (make quirky/meme) or 'beautify' (make elegant/beautiful)")

class QuirkifyResponse(BaseModel):
    original_sentence: str
    quirkified_sentence: str
    vibe_style: str
    punchline_explanation: str
    word_mappings: List[WordMappingItem] = Field(default_factory=list)

