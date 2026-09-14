# THAI CONTEXT — Backend Platform

> **Tagline:** “ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน”  
> **Platform:** Thai Context Intelligence Platform for Hackathon “เปิดคลังคำ พลิกคลังคิด”

---

## 🌟 Overview

**THAI CONTEXT** ไม่ใช่เพียง Dictionary Search ทั่วไปที่ต้องทราบคำศัพท์ก่อนค้นหา แต่เป็นระบบ **Dictionary Intelligence** ที่เปลี่ยนกระบวนทัศน์การค้นหาภาษาไทย:
- **Traditional:** รู้คำ → ค้นคำ → อ่านความหมาย
- **THAI CONTEXT:** รู้สิ่งที่อยากสื่อ → อธิบายความหมาย/บริบท → ระบบค้นพบคำ → เปรียบเทียบ → เข้าใจการใช้ → ตรวจสอบหลักฐาน

### 📊 Current Database Scale (Real Thai Dataset):
- **29,544 แม่คำภาษาไทย** (Ingested from Wiktextract & Royal Society Editions)
- **36,398 รายการความหมาย** พร้อมระบุชนิดของคำ (POS) และลำดับ Sense
- **29,612 เวกเตอร์ความหมาย** (1536-dim HNSW Index บน pgvector)
- **84 รายการคำภาษาถิ่น** (เหนือ, อีสาน, ใต้)
- **100% Functional Requirements Compliance (18/18 FRs Passed)**

---

## 🏗️ Architecture

```text
Next.js (Web Frontend)
   │
   ▼
NestJS Core Backend (apps/api)
   │
   ├──────────────────────────┐
   ▼                          ▼
PostgreSQL 16 + pgvector   FastAPI AI/NLP Service (apps/ai-service)
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
                PyThaiNLP          Embedding / Grounded RAG
```

- **`apps/api` (NestJS Core Backend):**
  - REST API Routing & Data Validation
  - Dictionary Engine (2542, 2554, 2569, DIALECT)
  - Word Evolution & Change Detection
  - Dialect Explorer & Standard ↔ Dialect Mappings
  - AI Orchestration
  - Swagger Documentation (`/api/docs`)

- **`apps/ai-service` (FastAPI AI/NLP):**
  - PyThaiNLP Thai Text Processing & Tokenization
  - Query Understanding (Meaning, Excluded Words, Context Intent)
  - Pluggable Dense Embedding (Local Deterministic, Gemini, OpenAI)
  - pgvector Semantic Search
  - Context-Aware Ranking
  - Grounded RAG & Hallucination Guard

- **`PostgreSQL 16 + pgvector`:**
  - 15 Relational Tables with Vector Indexing

---

## 🚀 Quick Start with Docker Compose

รันระบบทั้งหมดด้วยคำสั่งเดียว:

```bash
docker compose up --build
```

### Services Healthcheck:
- **Core API Health:** `http://localhost:3001/health`
- **AI Service Health:** `http://localhost:8000/health`
- **Swagger Documentation:** `http://localhost:3001/api/docs`
- **FastAPI Documentation:** `http://localhost:8000/docs`

---

## 💻 Local Development Setup

### 1. Requirements
- Node.js 20+
- Python 3.11+
- Docker & PostgreSQL with pgvector

### 2. Setup PostgreSQL
```bash
docker compose up -d postgres
```

### 3. Setup NestJS Core API (`apps/api`)
```bash
cd apps/api
npm install
npx prisma db push
npm run seed
npm run start:dev
```

### 4. Setup FastAPI AI Service (`apps/ai-service`)
```bash
cd apps/ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.main
```

---

## 🧪 Testing

### Run NestJS API Tests:
```bash
cd apps/api
npm test
```

### Run Automated Smoke Test (All 12 Core Endpoints):
```bash
./scripts/smoke_test.sh
# หรือ cd apps/api && npm run test:smoke
```

### Run FastAPI AI Service Tests:
```bash
cd apps/ai-service
pytest
```

---

## 📖 API Documentation & Endpoints

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Core API Health Check |
| `GET` | `/api/v1/search?q=คำค้น` | Keyword Search (partial, exact, definition, edition) |
| `POST` | `/api/v1/search/meaning` | Meaning-first Search (“ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน”) |
| `POST` | `/api/v1/search/context` | Context-aware Search with excluded words |
| `GET` | `/api/v1/dictionary/words/:word` | Word Detail (Official Data vs AI Guidance) |
| `GET` | `/api/v1/dictionary/words/:word/evolution`| Evolution Timeline (2542, 2554, 2569) |
| `GET` | `/api/v1/dictionary/compare/:word` | Detect Edition Changes (ADDED, CHANGED, UNCHANGED) |
| `POST` | `/api/v1/compare` | Compare words with grounded evidence |
| `GET` | `/api/v1/dialect` | Regional Dialect Explorer with filters |
| `GET` | `/api/v1/dialect/mapping/:word` | Standard ↔ Dialect Mappings (OFFICIAL vs AI_INFERRED) |
| `POST` | `/api/v1/ai/chat` | Grounded RAG Chat with Hallucination Guard |
| `POST` | `/api/v1/feedback` | Submit user interaction & search feedback |

---

## 📚 Technical Documentation

- [Architecture Overview](docs/architecture.md)
- [Database Design & Schema](docs/database.md)
- [API Reference](docs/api.md)
- [AI & NLP Pipeline](docs/ai-pipeline.md)
- [Data Ingestion Pipeline](docs/data-ingestion.md)
