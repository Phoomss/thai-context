# 🇹🇭 THAI CONTEXT — Real Data Usage & Architecture Guide
> **คู่มือการเปิดใช้งาน ตรวจสอบ และจัดการข้อมูลจริง (Real Data Pipeline & Production Ingestion)**  
> *ครอบคลุมฐานข้อมูล PostgreSQL 16 + pgvector, Backend NestJS Core API, FastAPI AI Service, และ Next.js Frontend*

---

## 1. ภาพรวมสถาปัตยกรรมข้อมูลจริง (Real Data Architecture)

ระบบ **THAI CONTEXT** ออกแบบสถาปัตยกรรมแบบ **Multi-tier Microservices** เพื่อให้การสืบค้นความหมายเชิงบริบท (Semantic & Lexical Search) ทำงานบนข้อมูลพจนานุกรมทางการจริง 100%:

```
 ┌─────────────────────────────────────────────────────────────┐
 │               Next.js 14 Web Application                    │
 │               (Port 3000 / SSR & App Router)                │
 └──────────────┬───────────────────────────────┬──────────────┘
                │ Proxy Route Handlers          │
                ▼                               ▼
 ┌──────────────────────────────┐ ┌────────────────────────────┐
 │  NestJS Core Backend API     │ │ Dialect Cultural Engine    │
 │  (Port 3001 / Prisma Client) │ │ (Direct Structured Cache)  │
 └───────┬──────────────┬───────┘ └────────────────────────────┘
         │ SQL & Vector │ REST Client
         ▼              ▼
 ┌──────────────────────────────┐ ┌────────────────────────────┐
 │ PostgreSQL 16 + pgvector     │ │ FastAPI AI Service         │
 │ (Port 5433:5432 / Docker)    │ │ (Port 8000 / PyThaiNLP)    │
 └──────────────────────────────┘ └────────────────────────────┘
```

---

## 2. สถิติคลังข้อมูลจริงในระบบ (Current Real Data Inventory)

ข้อมูลที่ถูกประมวลผลและพร้อมใช้งานในฐานข้อมูล PostgreSQL ปัจจุบัน:

| หมวดหมู่ข้อมูล | ปริมาณระเบียนจริง | แหล่งที่มา / รายละเอียด |
|:---|:---:|:---|
| **แม่คำ (Words)** | **57,977 คำ** | พจนานุกรมฉบับราชบัณฑิตยสถาน 3 ยุคสมัย (๒๕๔๒, ๒๕๕๔, ๒๕๖๙) และ Wiktionary ภาษาไทย |
| **นิยามและบทความ (Word Entries)** | **76,262 รายการ** | ความหมายทางการ แยกตามลำดับ Sense, หมวดวิชาการ, และชนิดของคำ (POS) |
| **เวกเตอร์ความหมาย (Embeddings)** | **80,024 เวกเตอร์** | เวกเตอร์ 1,536 มิติ สำหรับ Semantic Search พร้อม HNSW Index บน pgvector |
| **คลังภาษาถิ่น 4 ภาค (Dialect Entries)** | **2,980 รายการ** | ภาคเหนือ, อีสาน, ใต้ และกลาง (คลังข้อมูลภาษาและวัฒนธรรม ม.มหิดล) |
| **ศัพท์บัญญัติทางการ (Coined Terms)** | **6,277 รายการ** | ศัพท์บัญญัติราชบัณฑิตยสภา สาขาการแพทย์, จิตวิทยา, ปรัชญา และเทคโนโลยี |
| **คำทับศัพท์ทางการ (Transliterations)** | **2,256 คำ** | บัญชีคำทับศัพท์ทางการตามประกาศราชบัณฑิตยสภา |
| **ภาษามือไทย (Thai Sign Language)** | **วิดีโอ & ท่ามือ** | คำอธิบายโครงสร้างท่ามือ และวิดีโอตัวอย่าง MP4 ร่วมกับวิทยาลัยราชสุดา |

---

## 3. การกำหนดค่า Frontend (Real Data vs Mock Mode)

ไฟล์ตั้งค่า: [`frontend/.env.local`](file:///Users/mac/Desktop/workspace/thai-context/frontend/.env.local) หรือ [`frontend/.env`](file:///Users/mac/Desktop/workspace/thai-context/frontend/.env)

### 3.1 เปิดใช้งาน Real Data (Default)
เมื่อต้องการให้ระบบดึงข้อมูลจริงจาก PostgreSQL และ Microservices:
```env
# 1. ชี้ Base API URL ไปยัง Backend API (v1)
THAI_CONTEXT_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# 2. ปิด Mock Mode (บังคับดึงข้อมูลจริงจาก Backend)
THAI_CONTEXT_USE_MOCK=false
NEXT_PUBLIC_USE_MOCK=false
```

### 3.2 สลับใช้งาน Mock Mode (สำหรับ Offline Demo หรือ Standalone Test)
หากต้องการทดสอบ UI โดยไม่ต้องเปิด Docker หรือฐานข้อมูล:
```env
THAI_CONTEXT_USE_MOCK=true
NEXT_PUBLIC_USE_MOCK=true
```

> [!NOTE]
> **Graceful Failover System:**  
> แม้จะตั้งค่า `THAI_CONTEXT_USE_MOCK=false` แต่หากเซอร์วิส Backend เกิดขัดข้องหรือปิดอยู่ Next.js Route Handler จะสลับไปใช้ Mock Fallback ให้โดยอัตโนมัติ เพื่อป้องกันไม่ให้หน้าจอของผู้ใช้เกิดข้อผิดพลาด 500

---

## 4. ขั้นตอนการรันระบบ Real Data Stack ทั้งหมด

### ขั้นตอนที่ 1: สตาร์ต Docker Containers
เปิด Terminal ที่รากของโปรเจกต์:
```bash
docker compose up -d
```
ตรวจสอบสถานะคอนเทนเนอร์:
```bash
docker ps
```
จะพบ 3 เซอร์วิสหลักที่สถานะเป็น `Up (healthy)`:
- `thai_context_db` (PostgreSQL 16 + pgvector) ที่พอร์ต `0.0.0.0:5433->5432`
- `thai_context_ai` (FastAPI AI Service) ที่พอร์ต `0.0.0.0:8000->8000`
- `thai_context_api` (NestJS Core API) ที่พอร์ต `0.0.0.0:3001->3001`

---

### ขั้นตอนที่ 2: นำเข้าและ Seed ข้อมูลจริง (Data Ingestion)
หากเป็นฐานข้อมูลใหม่หรือต้องการอัปเดตข้อมูลให้ครบถ้วน:

```bash
# 1. ตรวจสอบและซิงค์โครงสร้างตาราง Prisma
docker exec thai_context_api npx prisma db push

# 2. รันสคริปต์ Master Seed นำเข้าข้อมูลทั้งหมด
docker exec thai_context_api npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed.ts
```

*สคริปต์จะทำการ:*
- สร้างและซิงค์ Dictionary Editions (2542, 2554, 2569, Wiktionary, Coined Terms, Dialects)
- นำเข้าแม่คำและนิยามพจนานุกรม 57,000+ คำ
- สร้างเวกเตอร์ 1,536 มิติลงใน `search_embeddings`
- นำเข้าคลังภาษาถิ่น 4 ภาค (ร่างกาย, เครือญาติ, สนทนา)
- นำเข้าศัพท์บัญญัติการแพทย์, ปรัชญา, จิตวิทยา
- นำเข้าชุดข้อมูลเพื่อการเข้าถึง (TSL, Phonetics, IPA, AI Translations)

---

### ขั้นตอนที่ 3: สตาร์ต Web Application (Frontend)
```bash
cd frontend
pnpm dev
```
เปิดบราวเซอร์ที่: **`http://localhost:3000`**

---

## 5. การทดสอบและตรวจสอบความถูกต้องของข้อมูล (Verification)

### 5.1 ทดสอบ Semantic Meaning Search (ค้นหาจากความหมาย)
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"ทำงานได้ดี ใช้เวลาและทรัพยากรน้อย"}'
```
**ผลลัพธ์ที่ได้รับ:**
- รายการคำแนะนำทางการ เช่น `ประสิทธิภาพ`, `ประสิทธิผล`, `แรงงาน`
- คะแนนความตรงประเด็น (Relevance Score)
- อ้างอิงเล่มพจนานุกรมและปี พ.ศ. ชัดเจน
- ค่า `"mode": "live"` ยืนยันว่าดึงจากฐานข้อมูลจริง

---

### 5.2 ทดสอบชุดข้อมูล Accessibility & แปลสองภาษา (Bilingual AI)
```bash
curl -s http://localhost:3001/api/v1/dictionary/words/สวัสดี/accessibility | jq .
```
**ตัวอย่างการตอบกลับจริงจากระบบ:**
```json
{
  "headword": "สวัสดี",
  "pronunciation": {
    "phoneticSpelling": "สะ-หฺวัด-ดี",
    "transliterationRtgs": "swatdi",
    "ipaNotation": "/swatdi/",
    "tonePattern": "M",
    "sourceType": "OFFICIAL_DATA"
  },
  "translations": [
    {
      "translatedWord": "hello / greetings",
      "languageCode": "en",
      "secondaryTranslations": [
        "good day",
        "good morning / afternoon",
        "prosperity (etymological)"
      ],
      "contextualExplanation": "Universal Thai greeting used at any time of day to say hello or goodbye. Derived from Sanskrit 'svasti' meaning well-being, success, and auspiciousness.",
      "provenance": "OFFICIAL_CURATED",
      "confidenceScore": 1
    }
  ]
}
```

---

### 5.3 ทดสอบคลังภาษาถิ่น 4 ภาค (Dialect Cultural Explorer)
```bash
curl -s "http://localhost:3000/api/v1/dialect?category=conversation" | jq .
```
**ผลลัพธ์ที่ได้รับ:**
- ชุดคำมาตรฐานเทียบเคียง 4 ภาค (คิดถึง, พูด, โกหก, อร่อย, กลับบ้าน)
- สัทอักษร [IPA / คำอ่านถิ่น]
- ป้ายรับรองสถานะที่มาข้อมูล (`provenance: "official"`)

---

## 6. โครงสร้างไฟล์และสคริปต์ที่เกี่ยวข้อง

| พาธไฟล์ | หน้าที่ / วัตถุประสงค์ |
|:---|:---|
| [`frontend/.env.local`](file:///Users/mac/Desktop/workspace/thai-context/frontend/.env.local) | ควบคุมโหมดข้อมูล Real Data vs Mock ในฝั่ง Frontend |
| [`frontend/src/app/api/search/route.ts`](file:///Users/mac/Desktop/workspace/thai-context/frontend/src/app/api/search/route.ts) | Next.js API Proxy เชื่อมต่อ NestJS Core API พร้อม Fallback |
| [`frontend/src/lib/dialect-data.ts`](file:///Users/mac/Desktop/workspace/thai-context/frontend/src/lib/dialect-data.ts) | ตัวจัดการคลังข้อมูลภาษาถิ่น 3 หมวดหมู่หลัก (สนทนา, ร่างกาย, เครือญาติ) |
| [`apps/api/prisma/schema.prisma`](file:///Users/mac/Desktop/workspace/thai-context/apps/api/prisma/schema.prisma) | ข้อกำหนดโครงสร้างตาราง Entity ใน PostgreSQL (20 ตารางหลัก) |
| [`apps/api/prisma/seed.ts`](file:///Users/mac/Desktop/workspace/thai-context/apps/api/prisma/seed.ts) | สคริปต์ Master Data Ingestion นำเข้าข้อมูลทั้งหมดเข้าสู่ฐานข้อมูล |
| [`apps/ai-service/app/services/rag/bilingual_translator.py`](file:///Users/mac/Desktop/workspace/thai-context/apps/ai-service/app/services/rag/bilingual_translator.py) | เอนจินวิเคราะห์สัณฐานวิทยาและแปลคำศัพท์สองภาษา (Thai-English Morphological AI) |

---

## 7. คำถามที่พบบ่อย (Troubleshooting & FAQ)

### Q: ทำไมรัน `curl http://localhost:3000/api/search` แล้วผลลัพธ์แสดง `"mode": "mock"`?
**ตอบ:** เกิดจากข้อใดข้อหนึ่งต่อไปนี้:
1. Docker คอนเทนเนอร์ `thai_context_api` หรือ `thai_context_db` ยังไม่ได้เปิด รัน `docker compose up -d`
2. ค่าใน `frontend/.env.local` ยังเป็น `THAI_CONTEXT_USE_MOCK=true` ให้เปลี่ยนเป็น `false` แล้วรีสตาร์ตเซิร์ฟเวอร์ Next.js (`pnpm dev`)

### Q: ฐานข้อมูลพอร์ต `5433` ชนกับ PostgreSQL ตัวเดิมในเครื่อง?
**ตอบ:** Docker Compose ถูกตั้งค่าให้แมปพอร์ตภายนอกเป็น `5433` เพื่อไม่ให้ชนกับ PostgreSQL ท้องถิ่นพอร์ต `5432` มาตรฐาน สามารถเชื่อมต่อผ่าน `psql -h localhost -p 5433 -U postgres -d thai_context` ได้โดยตรง

### Q: ต้องการรันชุดการทดสอบทั้งหมด (Automated Tests)?
```bash
# ทดสอบ Frontend (Vitest 68/68 ผ่านทั้งหมด)
cd frontend && pnpm test

# ทดสอบ Backend Core API (Jest 11/11 ผ่านทั้งหมด)
cd apps/api && npm run test
```
