# THAI CONTEXT — Task 5: Multi-Word Comparator

## Role

คุณกำลังพัฒนา repository ของโปรเจกต์ **THAI CONTEXT**

งานในรอบนี้คือ:

> **Task 5: เปรียบเทียบความแตกต่างของคำด้วย AI (Multi-Word Comparator)**

ก่อนแก้ไข code ใด ๆ ต้องอ่าน:

```text
docs/12-api-audit-and-team-handoff.md
```

โดยเฉพาะหัวข้อ:

```text
Task 5: เปรียบเทียบความแตกต่างของคำด้วย AI (Multi-Word Comparator)
```

ใช้เอกสารดังกล่าวเป็น requirement หลักของ Task 5

แต่สำหรับ API contract จริง, DTO, types, Controller, Service, response shape และ implementation ปัจจุบัน ให้ตรวจสอบ source code จริงใน repository ก่อนแก้เสมอ

---

# Objective

เชื่อม UI เปรียบเทียบคำที่มีอยู่แล้วใน:

```text
ContextComparator.tsx
```

เข้ากับ Backend API จริง:

```http
POST /api/v1/compare
```

เพื่อให้ผู้ใช้สามารถเลือกหรือกรอกคำภาษาไทย **2–5 คำ** แล้วให้ระบบวิเคราะห์ความแตกต่างจากข้อมูลจริงและ AI service

เป้าหมาย flow:

```text
User selects 2–5 Thai words
        ↓
ContextComparator
        ↓
Frontend API/BFF
        ↓
POST /api/v1/compare
        ↓
NestJS Core API
        ↓
AI Service + Dictionary Evidence
        ↓
Comparison Result
        ↓
ContextComparator UI
```

ห้ามใช้ mock comparison เป็น primary source หลัง Task นี้เสร็จ

---

# Source Requirement

จากเอกสาร Task 5:

```http
POST /api/v1/compare
```

Request concept:

```json
{
  "words": ["ประสิทธิภาพ", "ประสิทธิผล"]
}
```

Expected response concept:

```json
{
  "words": [
    {
      "headword": "ประสิทธิภาพ",
      "definition": "ความสามารถที่ทำให้เกิดผล...",
      "edition": "2554"
    },
    {
      "headword": "ประสิทธิผล",
      "definition": "ผลสำเร็จตามเป้าหมาย...",
      "edition": "2554"
    }
  ],
  "comparison": {
    "meaningDifference": "...",
    "contextDifference": "...",
    "usageGuidance": "..."
  },
  "evidence": []
}
```

**Important:** ตัวอย่างนี้เป็น requirement-level example เท่านั้น

ห้าม assume ว่า source code ปัจจุบันใช้ field names เหล่านี้ตรงทั้งหมด

ตรวจ Backend implementation จริงก่อน

---

# Phase 1 — Read Docs and Audit Existing Code

ก่อนเขียน code ให้สำรวจ repository จริงก่อน

อ่าน:

```text
docs/12-api-audit-and-team-handoff.md
```

จากนั้นค้นหาทั้ง project สำหรับ:

```text
ContextComparator
/api/v1/compare
compare
comparison
meaningDifference
contextDifference
usageGuidance
evidence
mock comparison
```

ตรวจสอบอย่างน้อย:

* `ContextComparator.tsx`
* parent component ที่ render comparator
* hooks ที่เกี่ยวข้อง
* frontend API utilities
* Next.js API Route Handler ถ้ามี
* current mock/static data
* TypeScript interfaces
* loading state
* error state
* selected words state
* NestJS Compare Controller
* Compare Service
* DTO
* AI Service client
* FastAPI compare implementation ถ้ามี
* tests ที่เกี่ยวข้อง

ก่อนแก้ต้องอธิบายได้ว่า current flow เป็นอย่างไร

ตัวอย่าง:

```text
User
 ↓
ContextComparator
 ↓
local/mock logic
 ↓
render comparison
```

หรือ architecture จริงที่พบ

ห้ามเดา

---

# Phase 2 — Verify Backend Contract

ตรวจ Backend implementation ของ:

```http
POST /api/v1/compare
```

ค้นหา Controller / DTO / Service จริง

ตรวจว่า request body รองรับ:

* minimum กี่คำ
* maximum กี่คำ
* field ชื่อ `words` จริงหรือไม่
* validation rules
* duplicate words ได้หรือไม่
* empty string behavior
* Thai text normalization
* HTTP status codes
* error response shape

ตรวจ response จริง:

* `words`
* `comparison`
* `meaningDifference`
* `contextDifference`
* `usageGuidance`
* `evidence`

รวมถึง field อื่นที่ Backend ส่งมาจริง

ถ้า Backend contract แตกต่างจาก docs:

ใช้ **source code จริงเป็น source of truth สำหรับ implementation**

แต่ห้ามเปลี่ยนเป้าหมายของ Task 5

---

# Phase 3 — Inspect Existing Frontend Architecture

ตรวจว่า frontend ใช้ pattern ใดสำหรับ API

ตัวอย่าง:

```text
Browser
 ↓
Next.js /api/v1/*
 ↓
NestJS Core API
```

หรือเรียก Backend โดยตรง

ให้ reuse architecture เดิมของ project

ห้ามสร้าง API architecture ใหม่ถ้า project มี convention อยู่แล้ว

ตรวจ routes เช่น:

```text
frontend/src/app/api/v1/
```

เพื่อดู pattern จาก endpoint อื่นที่ทำงานแล้ว เช่น:

* feedback
* search
* dictionary
* TTS
* dialect

reuse:

* environment configuration
* API URL helpers
* fetch wrappers
* error normalization
* response helpers

เมื่อเหมาะสม

---

# Phase 4 — Connect ContextComparator to Real API

ปรับ `ContextComparator.tsx` หรือ service layer ที่เกี่ยวข้อง ให้เรียก Backend จริง

Primary endpoint:

```http
POST /api/v1/compare
```

Request:

```json
{
  "words": ["คำที่1", "คำที่2"]
}
```

ต้องรองรับ **2–5 คำ**

อย่า hardcode แค่สองคำ หาก Backend รองรับ 2–5 ตาม requirement

UI ต้องสร้าง request จาก selected words จริง

ตัวอย่าง logic:

```ts
await fetch("/api/v1/compare", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    words: selectedWords,
  }),
});
```

ตัวอย่างนี้เป็นแนวทางเท่านั้น

ให้ใช้ abstraction ที่มีอยู่จริงใน codebase ถ้ามี

---

# Phase 5 — Next.js Proxy / BFF

หาก architecture ปัจจุบันใช้ Next.js Route Handler เป็น proxy ไป NestJS:

ตรวจว่ามี route นี้หรือยัง:

```text
frontend/src/app/api/v1/compare/route.ts
```

ถ้ามี:

audit และ reuse

ถ้ายังไม่มี แต่ architecture ของ project กำหนดให้ frontend request ผ่าน `/api/v1/*`:

สร้าง Route Handler ตาม pattern เดิมของ project

ตัวอย่าง conceptual implementation:

```ts
const backendUrl =
  process.env.THAI_CONTEXT_API_URL ||
  "http://localhost:3001/api/v1";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${backendUrl}/compare`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await response.json();

  return Response.json(data, {
    status: response.status,
  });
}
```

นี่เป็นเพียงตัวอย่างแนวทาง

ต้องตรวจ pattern จริงก่อน implement

ต้อง preserve:

* Backend status code
* meaningful error payload
* request body
* Unicode Thai text

ห้าม silently เปลี่ยน Backend error เป็น fake success

---

# Phase 6 — Input Validation

Comparator ต้องรองรับเฉพาะ input ที่ถูกต้องตาม Backend contract

Requirement ระดับ feature:

```text
2–5 words
```

ตรวจและ handle:

* น้อยกว่า 2 คำ
* มากกว่า 5 คำ
* empty words
* whitespace-only words
* duplicate words
* accidental leading/trailing whitespace

ใช้ validation เดิมของ project ถ้ามี

Frontend validation มีไว้เพื่อ UX

Backend validation ยังเป็น source of truth ด้าน security/data correctness

ห้าม disable compare button แบบผิด logicจน block valid request

---

# Phase 7 — Loading State

เมื่อผู้ใช้กด Compare:

ต้องมี loading state ที่ชัดเจน

ป้องกัน:

* duplicate submission
* กดซ้ำรัว ๆ แล้วเกิด parallel requests โดยไม่จำเป็น
* stale response เขียนทับ result ใหม่
* result เก่าแสดงเหมือนเป็นผลใหม่
* UI กระโดด/flicker รุนแรง

ถ้า component มี animation/loading เดิม:

รักษา design เดิมไว้

ห้าม redesign

---

# Phase 8 — Render Real Comparison Result

หลัง API success ให้ render ข้อมูลจริงจาก Backend

อย่างน้อยต้องรองรับ:

## Word definitions

สำหรับแต่ละคำ:

```text
headword
definition
edition
```

หรือ field equivalent ตาม contract จริง

---

## Meaning Difference

```text
comparison.meaningDifference
```

แสดงความแตกต่างเชิงความหมาย

---

## Context Difference

```text
comparison.contextDifference
```

แสดงบริบทที่เหมาะกับแต่ละคำ

---

## Usage Guidance

```text
comparison.usageGuidance
```

แสดงคำแนะนำว่าควรเลือกใช้คำไหนในสถานการณ์ใด

---

## Evidence

แสดง evidence/reference จาก Backend หาก response มีข้อมูล

ห้าม fabricate evidence ฝั่ง frontend

ห้ามสร้าง citation เอง

Evidence ต้องมาจาก Backend response เท่านั้น

---

# Phase 9 — Preserve Grounding

Feature นี้มีเป้าหมายเพื่อให้ผลเปรียบเทียบอิงหลักพจนานุกรม

ดังนั้น:

ห้ามสร้าง AI comparison ฝั่ง Frontend

ห้าม generate fake explanation

ห้ามใช้ hardcoded sample เป็น fallback แล้วแสดงเหมือน API response จริง

ข้อมูลหลักต้องมาจาก:

```text
POST /api/v1/compare
```

และ evidence ที่ Backend ส่งกลับ

ถ้า Backend fail:

ให้แสดง error state ที่เหมาะสม

ไม่สร้างข้อมูลขึ้นมาแทนโดยไม่มี indication

---

# Phase 10 — Error Handling

รองรับอย่างน้อย:

### Network Error

เช่น Backend unavailable

UI ต้องไม่ crash

---

### Validation Error

เช่นส่งคำไม่ครบ

แสดงข้อความที่ผู้ใช้เข้าใจได้

---

### API 4xx

preserve meaningful backend message เมื่อปลอดภัย

---

### API 5xx

แสดง generic retry/error state

ห้าม expose stack trace

---

### Malformed Response

ตรวจ defensive rendering

ห้าม component crash จาก field ที่หาย

แต่ห้ามซ่อน contract bug ด้วย fallback data แบบเงียบ ๆ

---

# Phase 11 — Response Compatibility

สร้างหรือ reuse TypeScript types สำหรับ API

ตัวอย่าง conceptual type:

```ts
interface ComparedWord {
  headword: string;
  definition: string;
  edition?: string;
}

interface ComparisonSummary {
  meaningDifference?: string;
  contextDifference?: string;
  usageGuidance?: string;
}

interface CompareResponse {
  words: ComparedWord[];
  comparison: ComparisonSummary;
  evidence?: unknown[];
}
```

**ห้าม copy type นี้โดยไม่ตรวจ Backend จริง**

ให้สร้าง type ตาม response จริงที่พบ

หลีกเลี่ยง:

```ts
any
```

ถ้าไม่จำเป็น

---

# Phase 12 — Preserve Current Design

Task นี้คือ:

```text
API Integration / Feature Completion
```

ไม่ใช่ redesign

ดังนั้นห้าม:

* redesign ContextComparator
* เปลี่ยน theme
* เปลี่ยน layout ครั้งใหญ่
* เปลี่ยน typography
* เปลี่ยน global styles
* เปลี่ยน navbar
* เปลี่ยน unrelated animations
* refactor component อื่นที่ไม่เกี่ยวข้อง
* implement Task อื่น

UI เดิมต้องคงไว้มากที่สุด

อนุญาตเฉพาะ UI change ที่จำเป็นต่อ:

* loading
* error
* real result rendering
* evidence rendering หาก UI เดิมยังไม่มีพื้นที่รองรับ

และต้องคง visual language เดิมของ THAI CONTEXT

---

# Phase 13 — Preserve Existing Animations

ถ้า `ContextComparator.tsx` มี:

* GSAP
* motion
* reveal animation
* hover animation
* transition

ห้ามลบทิ้งเพียงเพราะเชื่อม API

ตรวจให้ state ใหม่ยังทำงานร่วมกับ animation เดิม

ป้องกัน:

* animation replay loop
* hydration mismatch
* stale refs
* duplicate GSAP timeline

---

# Phase 14 — Race Condition Protection

ตรวจกรณี:

```text
request A
 ↓
request B
 ↓
B returns
 ↓
A returns later
```

ผลลัพธ์ A ไม่ควรเขียนทับ B หากผู้ใช้เปลี่ยนคำและ compare ใหม่แล้ว

ถ้า architecture เหมาะสม:

ใช้:

```text
AbortController
```

หรือ request identity

แต่ไม่ต้อง over-engineer ถ้า component behavior ปัจจุบันไม่สามารถเกิด concurrency ได้

ตัดสินจาก code จริง

---

# Phase 15 — Unicode / Thai Language Safety

ระบบนี้ทำงานกับภาษาไทย

ตรวจให้แน่ใจว่า:

* JSON body preserve Unicode
* ไม่ encode Thai words ผิด
* ไม่ double encode
* trim string อย่างเหมาะสม
* ไม่ normalize จนความหมายของคำเปลี่ยน
* React keys ไม่สร้างจากค่า unstable โดยไม่จำเป็น

ห้าม transliterate ก่อนส่ง API เว้นแต่ Backend contract ระบุ

---

# Phase 16 — Evidence UI

ถ้า Backend response มี:

```json
"evidence": [...]
```

ตรวจ schema จริง

หาก ContextComparator มี evidence UI อยู่แล้ว:

reuse

ถ้ายังไม่มี แต่ Task 5 จำเป็นต้องแสดง grounding:

เพิ่ม section แบบ minimal และเข้ากับ UI เดิม

แสดงเฉพาะข้อมูลที่ API ให้จริง เช่น:

* dictionary source
* edition
* definition
* reference
* confidence

ตาม schema จริง

ห้าม invent field

ถ้า `evidence` ว่าง:

อย่าแสดง empty card ที่ไม่มีประโยชน์

---

# Phase 17 — API Configuration

หาก Next.js Route Handler forward ไป NestJS:

reuse:

```text
THAI_CONTEXT_API_URL
```

Expected local fallback:

```text
http://localhost:3001/api/v1
```

ตรวจให้แน่ใจว่า final URL เป็น:

```text
http://localhost:3001/api/v1/compare
```

ไม่ใช่:

```text
/api/v1/api/v1/compare
```

หรือ:

```text
/compare/compare
```

Production environment ต้อง configurable

ห้าม hardcode localhost เป็น production-only endpoint

---

# Phase 18 — Inspect AI Service Integration

Backend `/compare` มีปลายทางไป AI Service ตาม architecture ของระบบ

ตรวจ implementation จริงว่า:

```text
NestJS Compare API
      ↓
AI Service
```

ทำงานอย่างไร

ถ้า compare request ล้มเหลว:

ตรวจ root cause ที่ Backend/AI integration ด้วย

อย่าสร้าง Frontend workaround เพื่อซ่อน Backend integration bug

ตรวจ:

* AI service URL
* timeout
* DTO mapping
* FastAPI endpoint
* response mapping
* evidence mapping

แก้ Backend เฉพาะเมื่อจำเป็นต่อ Task 5 จริง ๆ

---

# Phase 19 — Runtime Testing

หลัง implement ให้ทดสอบ flow จริง

## Test Case 1 — Two Words

ส่ง:

```json
{
  "words": ["ประสิทธิภาพ", "ประสิทธิผล"]
}
```

Expected:

* request success
* แสดงข้อมูลคำทั้งสอง
* meaningDifference แสดง
* contextDifference แสดง
* usageGuidance แสดง
* evidence แสดงถ้ามี

---

## Test Case 2 — Three Words

เลือก 3 คำจริงที่ Backend รองรับ

Expected:

* frontend ไม่ assume ว่ามีแค่สองคำ
* API request ส่งครบ
* UI ไม่พัง

---

## Test Case 3 — Five Words

ทดสอบขอบเขตสูงสุดตาม requirement

Expected:

* ส่งได้
* layout ยังใช้งานได้
* ไม่มี overflow ที่ทำให้ UI พัง

---

## Test Case 4 — One Word

Expected:

* ห้าม submit invalid request หรือ
* Backend validation error ถูก handle อย่างเหมาะสม

ตาม architecture จริง

---

## Test Case 5 — More Than Five Words

Expected:

* validation ทำงาน
* ไม่มี runtime error

---

## Test Case 6 — Duplicate Words

เช่น:

```json
{
  "words": ["ดี", "ดี"]
}
```

ตรวจ Backend behavior จริง

Frontend ต้องทำงานตาม contract ไม่ใช่เดา

---

## Test Case 7 — Backend Failure

ปิดหรือจำลอง NestJS unavailable

Expected:

* UI ไม่ crash
* loading จบ
* error state แสดง
* retry ได้ถ้ามี pattern เดิมรองรับ

---

## Test Case 8 — AI Service Failure

ถ้า NestJS ทำงานแต่ AI service unavailable:

Expected:

* error ถูก propagate/handle อย่างเหมาะสม
* frontend ไม่แสดง fake comparison

---

## Test Case 9 — Rapid Compare

กด compare แล้วเปลี่ยนชุดคำและ compare ใหม่

ตรวจ stale/race response

---

# Phase 20 — Testing Commands

ใช้ scripts ที่ repository มีอยู่จริง

ตาม docs มีอย่างน้อย:

```bash
docker compose up -d
```

จากนั้น:

```bash
bash scripts/smoke_test.sh
```

Backend:

```bash
cd apps/api
npm run test
```

Frontend:

```bash
cd frontend
pnpm test
```

ถ้ามี scripts จริง:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

ให้รันด้วย

ห้ามรายงานว่าผ่านถ้ายังไม่ได้รัน

หาก command ใดไม่มีใน `package.json`:

ระบุว่าไม่ได้รันเพราะ script ไม่มี

อย่าสร้างผล test ขึ้นมาเอง

---

# Acceptance Criteria

Task 5 ถือว่าเสร็จเมื่อครบ:

* [ ] อ่าน `docs/12-api-audit-and-team-handoff.md`
* [ ] Audit `ContextComparator.tsx`
* [ ] Audit Backend `/api/v1/compare`
* [ ] ตรวจ DTO / Controller / Service จริง
* [ ] ตรวจ AI Service integration จริง
* [ ] Comparator เรียก API จริง
* [ ] Request ส่ง selected words จริง
* [ ] รองรับ 2–5 คำตาม Backend contract
* [ ] ไม่มี mock data เป็น primary result
* [ ] แสดง definitions จาก API
* [ ] แสดง meaning difference
* [ ] แสดง context difference
* [ ] แสดง usage guidance
* [ ] แสดง evidence เมื่อ Backend มีข้อมูล
* [ ] ไม่ fabricate evidence
* [ ] loading state ทำงาน
* [ ] error state ทำงาน
* [ ] invalid input ถูก handle
* [ ] Backend failure ไม่ทำให้ UI crash
* [ ] AI service failure ไม่แสดง fake result
* [ ] ไม่มี stale request overwrite
* [ ] Thai Unicode ทำงานถูกต้อง
* [ ] ไม่มี TypeScript error ใหม่
* [ ] ไม่มี runtime error ใหม่
* [ ] ไม่มี hydration error ใหม่
* [ ] ไม่มี breaking UI change
* [ ] ไม่ redesign ContextComparator
* [ ] tests ที่เกี่ยวข้องผ่าน
* [ ] ไม่ implement Task อื่น

---

# Scope Guard

ทำเฉพาะ:

```text
Task 5 — Multi-Word Comparator
```

ห้าม implement:

```text
Task 1
Task 2
Task 3
Task 4
Task 6
```

เว้นแต่ต้องแก้ shared utility เล็กน้อยเพื่อให้ Task 5 ทำงานได้จริง

ถ้าจำเป็นต้องแตะ shared code:

แก้ให้น้อยที่สุด

ห้าม refactor project ครั้งใหญ่

---

# Do Not

ห้ามทำสิ่งต่อไปนี้:

* อย่า redesign หน้าเว็บ
* อย่าเปลี่ยน global theme
* อย่าเปลี่ยน navbar
* อย่า implement AI comparison ฝั่ง browser
* อย่า hardcode comparison result
* อย่า fake evidence
* อย่า bypass Backend แล้วเรียก AI service จาก browser โดยตรง เว้นแต่ architecture จริงระบุเช่นนั้น
* อย่าใช้ mock data เป็น success fallback
* อย่าเปลี่ยน API contract โดยไม่มีเหตุผล
* อย่าเพิ่ม dependency ใหม่ถ้าไม่จำเป็น
* อย่า refactor unrelated files
* อย่าทำ Task อื่นพร้อมกัน

---

# Working Order

ทำตามลำดับนี้:

```text
READ TASK 5 DOCS
      ↓
AUDIT ContextComparator
      ↓
TRACE CURRENT DATA FLOW
      ↓
AUDIT /compare BACKEND
      ↓
VERIFY DTO + RESPONSE
      ↓
VERIFY AI SERVICE
      ↓
CHECK FRONTEND API PATTERN
      ↓
IMPLEMENT MINIMAL INTEGRATION
      ↓
ADD LOADING / ERROR HANDLING
      ↓
RENDER REAL RESPONSE
      ↓
VERIFY EVIDENCE
      ↓
TEST 2–5 WORDS
      ↓
TEST FAILURE CASES
      ↓
RUN TESTS
      ↓
RUN BUILD
      ↓
FINAL REPORT
```

ห้ามเริ่มแก้ component ก่อนตรวจ backend contract

---

# Final Report

หลังทำเสร็จ ให้สรุปดังนี้

## 1. Previous Architecture

อธิบาย ContextComparator เดิม:

```text
...
```

ระบุว่าข้อมูลเดิมมาจากไหน

เช่น:

* mock
* local static
* frontend-only logic
* API ที่ยังไม่ได้ต่อ

ใช้สิ่งที่พบจริงเท่านั้น

---

## 2. Backend Contract Discovered

รายงาน contract จริงของ:

```http
POST /api/v1/compare
```

เช่น:

```text
Request:
...

Response:
...

Validation:
...
```

---

## 3. Files Changed

แสดงทุกไฟล์ที่แก้

ตัวอย่าง:

```text
frontend/...
apps/api/...
```

พร้อมสรุปการแก้แต่ละไฟล์

---

## 4. New Request Flow

แสดง architecture หลังแก้

```text
ContextComparator
       ↓
Frontend API Route / Service
       ↓
POST /api/v1/compare
       ↓
NestJS Compare Controller
       ↓
Compare Service
       ↓
AI Service / Dictionary Evidence
       ↓
Frontend Result
```

ปรับ flow ตาม implementation จริง

---

## 5. Response Rendering

สรุปว่า UI แสดง:

```text
Words
Definitions
Meaning Difference
Context Difference
Usage Guidance
Evidence
```

อะไรบ้างตาม API จริง

---

## 6. Error Handling

สรุป:

* invalid input
* API error
* Backend unavailable
* AI unavailable
* malformed response
* stale request

เฉพาะที่ implement จริง

---

## 7. Tests Run

รายงาน command ที่รันจริงทั้งหมด

เช่น:

```text
pnpm test
pnpm lint
pnpm typecheck
pnpm build
npm run test
bash scripts/smoke_test.sh
```

---

## 8. Test Results

ใช้สถานะ:

```text
PASS
FAIL
NOT RUN
```

ห้าม claim ผ่านถ้าไม่ได้ execute

---

## 9. Remaining Issues

ถ้ามี:

ระบุอย่างชัดเจน

หากไม่มี:

```text
No known issues remaining within Task 5 scope.
```

---

# Final Instruction

เริ่มงานโดยอ่าน:

```text
docs/12-api-audit-and-team-handoff.md
```

แล้วหา:

```text
Task 5: เปรียบเทียบความแตกต่างของคำด้วย AI (Multi-Word Comparator)
```

จากนั้น audit repository จริง

อย่าเริ่มจาก assumption

ใช้ Backend implementation จริงเป็น source of truth สำหรับ API contract

ทำ Task 5 แบบ end-to-end จน:

```text
ContextComparator
```

เรียก:

```http
POST /api/v1/compare
```

จริง

และแสดงผลจาก API จริงได้ครบถ้วน

เน้น:

```text
correctness
minimal changes
real API integration
dictionary grounding
evidence integrity
Thai language safety
loading/error robustness
runtime verification
```

ทำเฉพาะ Task 5 และ dependency ที่เกี่ยวข้องโดยตรง
