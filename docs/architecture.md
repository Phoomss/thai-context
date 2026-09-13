# THAI CONTEXT — Architecture Overview

> **Tagline:** “ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน”  
> **Platform:** Thai Context Intelligence Platform (Hackathon “เปิดคลังคำ พลิกคลังคิด”)

---

## 1. System Philosophy

Traditional Dictionary:
> รู้คำ → ค้นคำ → อ่านความหมาย

**THAI CONTEXT:**
> รู้สิ่งที่อยากสื่อ → อธิบายความหมาย/บริบท → ระบบค้นพบคำ → เปรียบเทียบ → เข้าใจการใช้ → ตรวจสอบหลักฐาน

ระบบ THAI CONTEXT ถูกออกแบบให้เป็น **Dictionary Intelligence Platform** ที่ใช้ AI ช่วยให้ผู้ใช้ค้นพบคำ เข้าใจบริบท เปรียบเทียบคำ และตรวจสอบหลักฐานจากคลังคำทางการ โดยไม่ใช่แชตบอตทั่วไปที่คิดคำตอบขึ้นมาเองโดยไม่มีหลักฐานอ้างอิง

---

## 2. High-Level Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                    Next.js (Web Frontend)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                apps/api (NestJS Core Backend)               │
│  - REST API Routing & Input Validation                      │
│  - Dictionary Multi-Edition Catalog Engine                  │
│  - Word Evolution & Change Detection (2542, 2554, 2569)     │
│  - Dialect Explorer & Standard-to-Dialect Mapping           │
│  - AI Orchestration & RAG Evidence Formatting               │
│  - Prisma ORM & Database Connection Pooling                 │
│  - OpenAPI / Swagger Documentation (/api/docs)              │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │ Internal HTTP
               │ Prisma Queries               ▼
               │              ┌──────────────────────────────────────────────┐
               │              │        apps/ai-service (FastAPI AI/NLP)      │
               │              │  - PyThaiNLP Tokenization & Processing       │
               │              │  - Query Understanding (Intent & Exclusions) │
               │              │  - Configurable Embedding Vectorization      │
               │              │  - Hybrid Retrieval (Dense pgvector + Sparse)│
               │              │  - Context-Aware Ranking (Configurable)      │
               │              │  - Grounded RAG Synthesis                    │
               │              │  - Hallucination Guard (Strict Verification) │
               │              └───────────────────────┬──────────────────────┘
               ▼                                      │
┌─────────────────────────────────────────────────────▼───────┐
│            PostgreSQL 16 + pgvector (thai_context_db)       │
│  - 15 Relational Tables (Catalog, Dialects, Embeddings)     │
│  - Extensions: vector, pg_trgm, pgcrypto                    │
│  - HNSW / Cosine Index for Dense Semantic Search            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Responsibilities Separation

| Service | Technology | Role & Responsibilities |
| :--- | :--- | :--- |
| **apps/api** | NestJS, TypeScript, Prisma | Core application backend, business logic, multi-edition catalog, database owner, security, validation, OpenAPI docs |
| **apps/ai-service** | FastAPI, Python 3.11, PyThaiNLP | Thai NLP tokenization, semantic embedding, query understanding, context ranking, grounded RAG, hallucination guard |
| **PostgreSQL** | pgvector 16 | Single source of truth, official immutable catalog, dense vector storage |

---

## 4. Key Architectural Guarantees

1. **Official Data Integrity:** AI will **never** overwrite or mutate official dictionary definitions. All AI inferences and explanations are explicitly tagged with `AI_INFERRED` or presented in dedicated AI Assistance sections.
2. **Safe Abstention:** If dictionary evidence relevance falls below `SIMILARITY_THRESHOLD`, the system abstains safely with: `"ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลพจนานุกรมที่ระบบรองรับ"` rather than hallucinating definitions.
3. **Multi-Edition Coexistence:** Editions 2542, 2554, 2569, and DIALECT exist concurrently without collision.
