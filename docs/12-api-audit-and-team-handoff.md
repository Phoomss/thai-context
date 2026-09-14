# 🇹🇭 THAI CONTEXT — API Audit & Engineering Team Handoff Guide
> **คู่มือส่งมอบงานเชิงเทคนิค: การตรวจสอบ API ที่ยังไม่ได้เชื่อมต่อ และแผนงานต่อยอดสำหรับทีมพัฒนา (Engineering Action Plan)**  
> *เอกสารสำหรับทีมพัฒนา (Frontend / Backend / Fullstack) ใช้เป็นพิมพ์เขียวในการเชื่อมต่อ UI เข้ากับ Backend APIs ที่พร้อมใช้งานแล้ว 100%*

---

## 1. บทนำและบริบทของระบบ (Executive Summary)

ระบบ **THAI CONTEXT** ปัจจุบันมีสถาปัตยกรรม 3 ชั้น (Three-tier Architecture):
1. **Next.js 14 Frontend** (App Router, Tailwind CSS, GSAP)
2. **NestJS Core Backend API** (Port 3001, Prisma ORM, PostgreSQL 16 + pgvector)
3. **FastAPI AI Service** (Port 8000, PyThaiNLP, RAG, Semantic Ranker, Edge TTS)

จากการตรวจสอบอย่างละเอียด พบว่า **Backend และ AI Service ได้ถูกพัฒนาโครงสร้าง Service, DTO, Database Query และ Unit Tests ไว้สมบูรณ์แล้วถึง 19+ Endpoints** แต่ปัจจุบัน Frontend ได้เชื่อมต่อใช้งานจริงไปเพียง **5 Core Endpoints** สำหรับฟังก์ชันค้นหาหลักและ Accessibility

เอกสารฉบับนี้สรุปรายการ API ทั้งหมดที่ยังว่างอยู่ พร้อม **Actionable Tasks, Request/Response Payloads, และโค้ดตัวอย่าง** เพื่อให้ทีมสามารถนำไปพัฒนาต่อยอดลงหน้า UI ได้ทันที

---

## 2. ตารางสรุปสถานะ API ทั้งหมดในระบบ (Complete API Status Matrix)

### สัญลักษณ์:
- 🟢 **Active**: ใช้งานจริงจาก Frontend สู่ Backend และ AI
- 🟡 **Ready-to-Connect**: Backend พร้อมใช้งาน 100% แต่ Frontend ยังไม่มี UI เชื่อมต่อ
- 🔵 **Internal / Shadowed**: ทำงานแบบ Local หรือถูกรวมไว้ใน Endpoint อื่น

| โมดูล | Method & Endpoint | สถานะ | บริการปลายทาง | รายละเอียดหน้าที่ / แผนงาน |
|:---|:---|:---:|:---|:---|
| **Search** | `POST /api/v1/search/meaning` | 🟢 Active | NestJS $\rightarrow$ AI Service | ค้นหาคำศัพท์จากความหมายภาษาธรรมชาติ (Semantic Search) |
| **Search** | `GET /api/v1/search` | 🟡 Ready | NestJS $\rightarrow$ Postgres | ค้นหาแบบตรงตัว กรองตามปีพจนานุกรมและสำนักพิมพ์ (`?q=...&edition=...`) |
| **Search** | `POST /api/v1/search/context` | 🟡 Ready | NestJS $\rightarrow$ AI Service | ค้นหาแบบกำหนดข้อจำกัด เช่น คำต้องห้าม หรือระดับภาษาเฉพาะ |
| **Translations** | `GET /api/v1/dictionary/words/:word/translations` | 🟢 Active | NestJS $\rightarrow$ AI Service | แปลสองภาษา TH-EN พร้อมแยกรากศัพท์ (Morphological Decomposition) |
| **Sign Language**| `GET /api/v1/dictionary/words/:word/sign-language` | 🟢 Active | NestJS $\rightarrow$ Postgres | ดึงข้อมูลภาษามือไทย (TSL) วิดีโอและโครงสร้างท่ามือ |
| **Accessibility**| `GET /api/v1/dictionary/words/:word/accessibility` | 🟡 Ready | NestJS $\rightarrow$ Postgres + AI | แพ็กเกจรวมทุกอย่าง (IPA, คำอ่าน, แปล, ภาษามือ, TTS) ในคำขอเดียว |
| **Accessibility**| `GET /api/v1/dictionary/words/:word/pronunciation` | 🟡 Ready | NestJS $\rightarrow$ AI Service | สกัดสัทอักษร IPA, RTGS, และโครงสร้างวรรณยุกต์ |
| **Dictionary** | `GET /api/v1/dictionary/words/:word` | 🟡 Ready | NestJS $\rightarrow$ Postgres | ข้อมูลคำศัพท์ฉบับเต็ม รวมประวัติ ข้ามทุก Editions |
| **Evolution** | `GET /api/v1/dictionary/words/:word/evolution` | 🟡 Ready | NestJS $\rightarrow$ Postgres | ไทม์ไลน์ความหมาย 3 ยุค (๒๕๔๒, ๒๕๕๔, ๒๕๖๙) จากฐานข้อมูลจริง |
| **Evolution** | `GET /api/v1/dictionary/compare/:word` | 🟡 Ready | NestJS $\rightarrow$ Postgres | ตรวจสอบสถานะการเปลี่ยนแปลงคำ (ADDED, CHANGED, UNCHANGED) |
| **Compare** | `POST /api/v1/compare` | 🟡 Ready | NestJS $\rightarrow$ AI Service | ส่ง 2–5 คำให้ AI วิเคราะห์ความต่างและบริบทการใช้งาน |
| **AI Chat** | `POST /api/v1/ai/chat/stream` | 🟡 Ready | NestJS $\rightarrow$ AI Service | แช็ตปรึกษาการใช้คำศัพท์ภาษาไทยแบบ Grounded RAG (SSE Stream) |
| **AI Chat** | `POST /api/v1/ai/chat` | 🟡 Ready | NestJS $\rightarrow$ AI Service | แช็ตถาม-ตอบแบบ Synchronous JSON |
| **Feedback** | `POST /api/v1/feedback` | 🟢 Active | NestJS $\rightarrow$ Postgres | บันทึกคะแนนความเกี่ยวข้องและความพึงพอใจของผู้ใช้ |
| **TTS** | `POST /api/v1/tts/synthesize` | 🟢 Active | NestJS $\rightarrow$ AI Service | สร้างเสียงอ่านสังเคราะห์ภาษาไทย (Fallback อัตโนมัติ) |
| **TTS** | `GET /api/v1/tts/status` | 🟡 Ready | NestJS | ตรวจสอบสถานะสุขภาพของ TTS Engine |
| **Dialect** | `GET /api/v1/dialect` | 🔵 Shadowed | NestJS $\rightarrow$ Postgres | ค้นหาภาษาถิ่น (Frontend ปัจจุบันอ่านผ่าน Local JSON) |
| **Dialect** | `GET /api/v1/dialect/mapping/:word` | 🔵 Shadowed | NestJS $\rightarrow$ Postgres | เทียบคำมาตรฐานเป็นภาษาถิ่น 4 ภาค |

---

## 3. แผนงานสำหรับทีมพัฒนา (Actionable Tasks for Dev Team)

### 📌 Task 1: ระบบประเมินผลลัพธ์การค้นหา (User Feedback Loop) — ✅ Completed
- **Status:** 🟢 **ใช้งานจริงแล้ว (Active & Tested)**
- **Endpoint:** `POST /api/v1/feedback`
- **เป้าหมาย:** เพิ่มปุ่ม "คำนี้ตรงใจ" (Thumbs Up) / "คำนี้ไม่ตรง" (Thumbs Down) ใต้การ์ดคำศัพท์เพื่อนำ Feedback ไปปรับปรุงคะแนนความเกี่ยวข้อง

#### Data Contract:
```typescript
// Request Body
interface CreateFeedbackDto {
  query: string;           // ข้อความที่ผู้ใช้ค้นหา เช่น "ทำงานได้ดี"
  selectedWord: string;    // คำที่ผู้ใช้ให้คะแนน เช่น "ประสิทธิภาพ"
  relevanceScore: number;  // 1 (ดีมาก) หรือ -1 (ไม่ตรง) หรือ 1-5
  userComment?: string;    // ความเห็นเพิ่มเติม (Optional)
}

// Response (Status 201)
{
  "success": true,
  "feedbackId": "uuid-string",
  "message": "Feedback recorded successfully"
}
```

#### ตัวอย่างโค้ดเรียกใช้งานใน Frontend:
```typescript
export async function sendFeedback(query: string, word: string, score: number) {
  await fetch("/api/v1/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      selectedWord: word,
      relevanceScore: score,
    }),
  });
}
```

---

### 📌 Task 2: หน้าต่างแช็ตถาม-ตอบผู้ช่วยภาษาไทย (Grounded RAG AI Assistant)
- **Priority:** 🔴 **High**
- **Endpoint:** `POST /api/v1/ai/chat/stream`
- **เป้าหมาย:** ทำ Drawer หรือ Modal "ปรึกษาผู้ช่วย AI เกี่ยวกับคำนี้" โดยแสดงคำตอบแบบ Real-time Streaming (SSE) พร้อมแหล่งอ้างอิงพจนานุกรมที่ไม่มโน (Anti-Hallucination)

#### Data Contract:
```typescript
// Request Body (POST /api/v1/ai/chat/stream)
{
  "message": "คำว่า 'ประสิทธิภาพ' ต่างกับ 'ประสิทธิผล' ในงานวิจัยอย่างไร",
  "word": "ประสิทธิภาพ",       // Optional
  "context": "รายงานวิชาการ"    // Optional
}

// Response Stream Events (Content-Type: text/event-stream)
event: token
data: {"token": "คำว่า "}

event: token
data: {"token": "ประสิทธิภาพ มุ่งเน้นความคุ้มค่า..."}

event: evidence
data: [{"source": "พจนานุกรม ๒๕๕๔", "definition": "ความสามารถที่ทำให้เกิดผล..."}]

event: complete
data: {"confidence": 0.95, "grounded": true}
```

---

### 📌 Task 3: ปรับให้ Dialect Explorer ดึงข้อมูลจากฐานข้อมูลจริง (Unify Dialect)
- **Priority:** 🟡 **Medium**
- **Endpoint:** `GET /api/v1/dialect?category=conversation` และ `GET /api/v1/dialect/mapping/:word`
- **เป้าหมาย:** ปรับปรุง Route Handler [`frontend/src/app/api/v1/dialect/route.ts`](file:///Users/mac/Desktop/workspace/thai-context/frontend/src/app/api/v1/dialect/route.ts) ให้ Forward ไปยัง NestJS Core API (`http://localhost:3001/api/v1/dialect`) ซึ่งเชื่อมกับตาราง `dialect_entries` (มี 2,980 คำ) แทนการอ่านไฟล์ JSON ในเครื่อง

#### ตัวอย่างการปรับปรุง Route Handler:
```typescript
// frontend/src/app/api/v1/dialect/route.ts
const backendUrl = process.env.THAI_CONTEXT_API_URL || "http://localhost:3001/api/v1";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const res = await fetch(`${backendUrl}/dialect?${searchParams.toString()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (res.ok) return Response.json(await res.json());
  } catch (err) {
    // Fallback to local cached data
  }
  return Response.json(localFallbackData);
}
```

---

### 📌 Task 4: วิวัฒนาการคำศัพท์แบบ Real-time Dynamic (Evolution Timeline)
- **Priority:** 🟡 **Medium**
- **Endpoint:** `GET /api/v1/dictionary/words/:word/evolution`
- **เป้าหมาย:** แทนที่ข้อมูลจำลองใน `EvolutionExplorer.tsx` ด้วยข้อมูลการเปลี่ยนแปลงความหมายจริงข้าม 3 ยุคสมัย (๒๕๔๒, ๒๕๕๔, ๒๕๖๙) จากตาราง `word_entries` ในฐานข้อมูล

#### Response Data Structure:
```json
{
  "word": "สมานฉันท์",
  "timeline": [
    {
      "editionYear": "2542",
      "editionTitle": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
      "definition": "ความพอใจร่วมกัน, ความเห็นพ้องต้องกัน",
      "status": "ORIGINAL"
    },
    {
      "editionYear": "2554",
      "editionTitle": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      "definition": "ความพร้อมเพรียงกัน, ความปรองดองกัน",
      "status": "CHANGED"
    },
    {
      "editionYear": "2569",
      "editionTitle": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙",
      "definition": "ความพร้อมเพรียง, ความร่วมมือร่วมใจเพื่อประโยชน์ส่วนรวม",
      "status": "EXPANDED"
    }
  ]
}
```

---

### 📌 Task 5: เปรียบเทียบความแตกต่างของคำด้วย AI (Multi-Word Comparator)
- **Priority:** 🟡 **Medium**
- **Endpoint:** `POST /api/v1/compare`
- **เป้าหมาย:** นำ `ContextComparator.tsx` มาเรียก API ฝั่ง Backend เพื่อให้ได้บทวิเคราะห์ความต่างอย่างละเอียดที่อิงหลักพจนานุกรม

#### Data Contract:
```typescript
// Request Body
{
  "words": ["ประสิทธิภาพ", "ประสิทธิผล"]
}

// Response
{
  "words": [
    { "headword": "ประสิทธิภาพ", "definition": "ความสามารถที่ทำให้เกิดผล...", "edition": "2554" },
    { "headword": "ประสิทธิผล", "definition": "ผลสำเร็จตามเป้าหมาย...", "edition": "2554" }
  ],
  "comparison": {
    "meaningDifference": "ประสิทธิภาพเน้นที่กระบวนการและความคุ้มค่าของทรัพยากร ส่วนประสิทธิผลเน้นที่การบรรลุเป้าหมายปลายทาง",
    "contextDifference": "ใช้ 'ประสิทธิภาพ' ในบริบทเครื่องจักร กระบวนการ หรือการดำเนินงาน และใช้ 'ประสิทธิผล' ในบริบทนโยบายหรือผลสัมฤทธิ์",
    "usageGuidance": "หากต้องการชมว่าทำงานเร็วและประหยัดงบ ให้ใช้ 'ประสิทธิภาพ'"
  },
  "evidence": [...]
}
```

---

### 📌 Task 6: โหมดค้นหาคำตรงตัวตามเล่มพจนานุกรม (Keyword & Edition Search)
- **Priority:** 🟢 **Low / Nice-to-have**
- **Endpoint:** `GET /api/v1/search?q=คำที่ต้องการ&edition=2554&source=ROYAL_SOCIETY`
- **เป้าหมาย:** สำหรับผู้ใช้ที่ต้องการเปิดพจนานุกรมแบบเดิม (ค้นจากแม่คำตรง ๆ พร้อมฟิลเตอร์เลือกปี พ.ศ.)

---

## 4. สรุปคำสั่งสำหรับทีมพัฒนา (Developer Quick Reference)

### รันและทดสอบระบบทั้งหมด:
```bash
# 1. รัน Infrastructure
docker compose up -d

# 2. ทดสอบความพร้อมของ API ทั้งหมด
bash scripts/smoke_test.sh

# 3. รัน Unit Tests ฝั่ง Backend
cd apps/api && npm run test

# 4. รัน Unit Tests ฝั่ง Frontend
cd frontend && pnpm test
```

### เปิด Swagger Documentation สำหรับดูทุก Endpoint แบบ Interactive:
- **NestJS Core API Swagger:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **FastAPI AI Service Redoc:** [http://localhost:8000/docs](http://localhost:8000/docs)
