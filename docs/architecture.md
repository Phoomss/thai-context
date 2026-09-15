# THAI CONTEXT — System Architecture

เอกสารสรุปสถาปัตยกรรมระบบ THAI CONTEXT (“ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน”)

---

## 1. ปรัชญาและหลักการของระบบ (Core Principles)

1. **Meaning-First over Keyword-First**: พลิกโฉมจาก Dictionary แบบเดิมที่ต้องรู้คำก่อน เป็นการค้นพบคำจากความหมายและเจตนา
2. **Immutable Official Dictionary**: ข้อมูลพจนานุกรมราชบัณฑิตยสถานและพจนานุกรมทางการ ถือเป็น Source of Truth ที่ไม่สามารถถูกแก้ไขหรือเขียนทับโดย AI ได้
3. **Strict 4-Tier Data Classification**:
   - `OFFICIAL`: ข้อมูลอย่างเป็นทางการจากพจนานุกรม
   - `AI_GENERATED`: ข้อความอธิบายความแตกต่างและการวิเคราะห์ที่สร้างโดย AI
   - `AI_INFERRED`: การอนุมานระดับภาษา นัยยะความรู้สึก และคู่เทียบเคียง
   - `SEARCH_DATA`: คำค้นหาและข้อมูลการโต้ตอบของผู้ใช้
4. **Safe Abstention / Anti-Hallucination**: AI จะไม่ตอบหากไม่มีหลักฐานพจนานุกรมรองรับอย่างชัดเจน
5. **Deterministic Offline Capability**: ระบบสามารถรันแบบ Offline ได้สมบูรณ์ 100% โดยไม่ต้องพึ่งพา API ภายนอก

---

## 2. แผนภาพสถาปัตยกรรมระดับสูง (High-Level Architecture)

```text
                               ┌─────────────────────────────────────────┐
                               │        Frontend Web Application         │
                               │        Next.js 14 + Tailwind CSS        │
                               │              (Port 3000)                │
                               └────────────────────┬────────────────────┘
                                                    │
                                                    │ HTTP / JSON REST
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │           Core API Gateway              │
                               │          NestJS 10 + Prisma             │
                               │              (Port 3001)                │
                               │       Swagger: /api/docs                │
                               └───────────┬─────────────────┬───────────┘
                                           │                 │
                           Internal REST   │                 │ Prisma ORM &
                           (Port 8000)     │                 │ Raw SQL Query
                                           ▼                 │
                ┌──────────────────────────────────────┐     │
                │        AI & NLP Microservice         │     │
                │          FastAPI + PyThaiNLP         │     │
                │              (Port 8000)             │     │
                │  • Query Understanding & Constraints │     │
                │  • Dense Vector & Hybrid Retrieval   │     │
                │  • Context-Aware Ranker Engine       │     │
                │  • Grounded RAG & Hallucination Guard│     │
                └──────────────────┬───────────────────┘     │
                                   │                         │
                                   │ Direct pgvector Read    │
                                   ▼                         ▼
                ┌────────────────────────────────────────────────────────┐
                │          PostgreSQL 16 + pgvector Database             │
                │                 (Port 5433 Host / 5432 Docker)         │
                │  • 15 Relational Tables (3NF Design)                   │
                │  • 29,544 Words / 36,398 Definitions                   │
                │  • 29,612 Semantic Embeddings (1536-dim HNSW Index)    │
                │  • B-Tree & Trigram GIN Indexes                        │
                └────────────────────────────────────────────────────────┘
```

---

## 3. โครงสร้างโฟลเดอร์โปรเจกต์ (Repository Structure)

```text
thai-context/
├── apps/
│   ├── api/                          # NestJS Core Backend Gateway
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # 15 Relational Tables with pgvector
│   │   │   └── seed.ts               # Master Seed Script
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── search/           # Keyword & Context Search Module
│   │   │   │   ├── dictionary/       # Word Detail & Catalog Module
│   │   │   │   ├── evolution/        # 3-Edition Timeline & Change Diff
│   │   │   │   ├── compare/          # Word Comparison Module
│   │   │   │   ├── dialect/          # Dialect Explorer & Mapping
│   │   │   │   ├── ai/               # AI Orchestration Module
│   │   │   │   ├── feedback/         # User Feedback Collection
│   │   │   │   └── health/           # Health Check Endpoints
│   │   │   └── main.ts
│   │   └── Dockerfile
│   └── ai-service/                   # FastAPI NLP & AI Microservice
│       ├── app/
│       │   ├── api/endpoints.py      # AI Endpoints (semantic-search, recommend, chat)
│       │   ├── services/
│       │   │   ├── nlp/              # PyThaiNLP Tokenizer & Query Parser
│       │   │   ├── embedding/        # Deterministic, Gemini, OpenAI Providers
│       │   │   ├── retrieval/        # Hybrid Dense+Keyword Vector Search
│       │   │   ├── ranking/          # Multi-Factor Context Ranker
│       │   │   └── rag/              # Grounded Assistant & Hallucination Guard
│       │   └── scripts/
│       │       └── import_wiktextract.py # Bulk Data Ingestion Pipeline
│       └── Dockerfile
├── data/
│   ├── raw/                          # Large Datasets (gitignored)
│   │   └── raw-wiktextract-data.json # 1.62 GB Wiktextract Thai Dump
│   └── seed/                         # Canonical Seed Data & Generator
│       ├── demo_dictionary.json
│       └── generate_demo_data.py
├── frontend/                         # Next.js Frontend Application
├── docs/                             # Full Technical Documentation (18 files)
├── docker-compose.yml                # Multi-Container Orchestration
└── README.md
```

---

## 4. สถานะความพร้อมและการทดสอบ (Testing & Compliance)

- **Functional Requirements**: ผ่านครบถ้วนทั้ง **18/18 FRs (100%)**
- **Unit Test Coverage**:
  - NestJS Services: ผ่าน 5/5 ชุดการทดสอบ (`npm test`)
  - FastAPI NLP & Guardrails: ผ่าน 6/6 ชุดการทดสอบ (`pytest`)
- **Docker Compose Status**: คอนเทนเนอร์ทั้ง 3 ตัว (`thai_context_db`, `thai_context_ai`, `thai_context_api`) อยู่ในสถานะ `healthy` และเชื่อมต่อกันแบบ Bridge Network
