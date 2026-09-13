# THAI CONTEXT — AI & NLP Pipeline Documentation

## 1. Pipeline Overview

```text
User Natural Language Query
  │
  ▼
[1. PyThaiNLP Tokenization & Normalization]
  • Normalize vowel/tonemarks
  • PyThaiNLP newmm engine tokenization
  │
  ▼
[2. Query Understanding & Intent Parsing]
  • Rule-based & pattern extraction
  • Detect intent: find_word_by_meaning, find_alternative_word, compare_words
  • Extract target meaning
  • Extract excluded terms (e.g. "ไม่อยากใช้คำว่าเก่ง")
  • Extract context (e.g. "รายงานมหาวิทยาลัย")
  │
  ▼
[3. Dense Vector Embedding]
  • Configurable Provider (Local Deterministic, Gemini, OpenAI)
  • Default dimension: 1536 (L2 normalized)
  │
  ▼
[4. pgvector Similarity Retrieval]
  • Cosine distance search: 1 - (embedding <=> query_vec)
  • Fetch Top-K candidate definitions
  │
  ▼
[5. Hybrid Context-Aware Ranking]
  • Exclude terms filter
  • Final Score =
      (0.60 * Semantic Similarity)
    + (0.20 * Keyword Overlap)
    + (0.15 * Context Match)
    + (0.05 * Source Authority)
  │
  ▼
[6. Hallucination Guardrail Check]
  • Verify evidence count > 0
  • Verify max_relevance >= SIMILARITY_THRESHOLD (0.65)
  • If failed: Safely abstain with standard refusal message
  │
  ▼
[7. Grounded RAG Generation]
  • Distinguish: Official Data vs AI Assistance vs AI Inferred
  • Synthesize explanation and cite exact dictionary editions
```

---

## 2. Hallucination Guard Specifications

ระบบไม่อนุญาตให้ AI สร้างนิยามเองโดยเด็ดขาด:
- หากไม่มีข้อมูลในพจนานุกรมรองรับ หรือความเกี่ยวข้องต่ำกว่าเกณฑ์ ระบบจะคืนค่า:
  `{"answer": "ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลพจนานุกรมที่ระบบรองรับ", "grounded": false, "evidence": []}`
- ป้องกัน Prompt Injection โดยการจำกัดความยาว และแยก System Instructions ออกจาก User Content
