# THAI CONTEXT — Task 3: Unify Dialect API

## Role

คุณกำลังทำงานใน repository ของโปรเจกต์ **THAI CONTEXT**

งานนี้ให้ดำเนินการเฉพาะ:

> **Task 3: ปรับให้ Dialect Explorer ดึงข้อมูลจากฐานข้อมูลจริง (Unify Dialect)**

ก่อนแก้ไข code ใด ๆ ต้องอ่านเอกสารต้นฉบับนี้ก่อน:

```text
docs/12-api-audit-and-team-handoff.md
```

ให้ใช้หัวข้อ:

```text
Task 3: ปรับให้ Dialect Explorer ดึงข้อมูลจากฐานข้อมูลจริง (Unify Dialect)
```

เป็น requirement หลักของงาน

เอกสารใน `docs/12-api-audit-and-team-handoff.md` ถือเป็น source of truth สำหรับ scope และ architecture ระดับ feature

แต่สำหรับ:

* API response shape
* DTO
* Controller
* Service
* Environment variables
* Frontend data types
* Existing route implementation

ให้ตรวจสอบจาก source code จริงอีกครั้งก่อนแก้ไขเสมอ

---

# Objective

ปัจจุบัน Dialect Explorer มีการใช้ข้อมูล Local JSON

ต้องเปลี่ยน architecture ให้:

```text
Dialect Explorer
      ↓
Next.js API Route
      ↓
NestJS Core API
      ↓
PostgreSQL
      ↓
dialect_entries
```

โดยใช้ Backend API เป็น **Primary Data Source**

และใช้ Local JSON / cached local data เป็น:

```text
Fallback Source
```

เท่านั้น

Backend มีข้อมูลภาษาถิ่นประมาณ 2,980 คำอยู่ในฐานข้อมูลแล้ว

---

# Relevant APIs

Endpoints หลัก:

```http
GET /api/v1/dialect
```

เช่น:

```http
GET /api/v1/dialect?category=conversation
```

และ:

```http
GET /api/v1/dialect/mapping/:word
```

NestJS Core API local development:

```text
http://localhost:3001/api/v1
```

---

# Primary Frontend Target

ตรวจสอบไฟล์นี้เป็นอันดับแรก:

```text
frontend/src/app/api/v1/dialect/route.ts
```

Task หลักคือปรับ Route Handler นี้จากการอ่านข้อมูล Local JSON เป็นหลัก

ให้ทำหน้าที่เป็น proxy / Backend-for-Frontend ไปยัง NestJS Core API

---

# Phase 1 — Audit Before Editing

ก่อนแก้ไข code ห้ามเดา architecture

สำรวจ project ก่อน

อย่างน้อยให้ตรวจสอบ:

```text
docs/12-api-audit-and-team-handoff.md

frontend/src/app/api/v1/dialect/route.ts
```

จากนั้นค้นหา implementation ที่เกี่ยวข้องทั้งหมด เช่น:

```text
DialectExplorer
dialect
dialect mapping
/api/v1/dialect
/api/v1/dialect/mapping
THAI_CONTEXT_API_URL
dialect_entries
```

ตรวจสอบ:

* Dialect Explorer component
* hooks
* services
* API utilities
* TypeScript interfaces/types
* Local dialect JSON
* fallback data
* Next.js Route Handlers
* Backend Dialect Controller
* Backend Dialect Service
* Backend DTO
* Prisma queries
* database model/schema
* environment configuration

ก่อนเริ่มแก้ให้เข้าใจ flow เดิมก่อนว่า:

```text
UI
↓
อะไร
↓
อะไร
↓
Local JSON หรือ API
```

---

# Phase 2 — Verify Backend Contract

ตรวจ source code ฝั่ง NestJS จริง

ห้ามสร้าง response schema ขึ้นเองจากการคาดเดา

ตรวจ:

```text
GET /api/v1/dialect
```

และ:

```text
GET /api/v1/dialect/mapping/:word
```

ให้ทราบว่า:

* Query parameters รองรับอะไรบ้าง
* Response shape เป็นอย่างไร
* Pagination มีหรือไม่
* category ใช้ค่าอะไร
* field names เป็นอะไร
* mapping response เป็นอย่างไร
* error response เป็นอย่างไร

ถ้า Swagger พร้อมใช้งาน สามารถใช้ช่วยตรวจสอบได้ที่:

```text
http://localhost:3001/api/docs
```

แต่ source code จริงยังเป็น source of truth

---

# Phase 3 — Convert Dialect Route to Backend Proxy

แก้:

```text
frontend/src/app/api/v1/dialect/route.ts
```

ให้ใช้ Backend API เป็น primary source

ใช้ environment variable:

```ts
const backendUrl =
  process.env.THAI_CONTEXT_API_URL ||
  "http://localhost:3001/api/v1";
```

แนวทางหลัก:

```ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const response = await fetch(
      `${backendUrl}/dialect?${searchParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (response.ok) {
      return Response.json(await response.json());
    }
  } catch (error) {
    // fallback
  }

  return Response.json(localFallbackData);
}
```

โค้ดด้านบนเป็นเพียงตัวอย่างแนวคิด

อย่า copy โดยไม่ตรวจ architecture จริงของ project

ให้ reuse utility, logger, response helper หรือ API client ที่ project มีอยู่แล้ว หากเหมาะสม

---

# Phase 4 — Preserve Query Parameters

Route:

```text
/api/v1/dialect
```

ต้อง forward query parameters จาก Frontend ไป Backend

ตัวอย่าง:

```text
Frontend request

/api/v1/dialect?category=conversation
```

ต้องกลายเป็น:

```text
http://localhost:3001/api/v1/dialect?category=conversation
```

อย่า hardcode แค่ `category`

หาก Backend รองรับ query parameter อื่นอยู่แล้ว ให้สามารถ forward ได้ด้วย

ใช้วิธีเช่น:

```ts
searchParams.toString()
```

หรือ implementation ที่ equivalent และเหมาะกับ project

---

# Phase 5 — Local JSON Becomes Fallback Only

หลังแก้ architecture ต้องเป็น:

```text
Primary
   ↓
NestJS Core API
   ↓
PostgreSQL dialect_entries
```

ถ้า Backend ใช้งานไม่ได้:

```text
Backend Failure
   ↓
Next.js Route Handler
   ↓
Local Cached Dialect Data
```

Local JSON ห้ามเป็น primary data source อีกต่อไป

แต่ไม่ควรลบ fallback ทิ้ง หากยังสามารถใช้สร้าง resilience ให้ระบบได้

Fallback สามารถใช้เมื่อ:

* Backend connection error
* Network failure
* Backend unavailable
* fetch exception
* Backend failure ที่เหมาะสมกับ fallback policy

ออกแบบให้ fallback ไม่ซ่อน programming error หรือ invalid response โดยไม่จำเป็น

---

# Phase 6 — Dialect Mapping API

ตรวจสอบว่า Frontend มีการใช้:

```http
GET /api/v1/dialect/mapping/:word
```

อยู่หรือไม่

ถ้ามี implementation แล้ว:

ให้ปรับให้ใช้ NestJS backend จริง

ถ้า UI ต้องใช้ endpoint นี้ แต่ยังไม่มี Next.js proxy route และ architecture ของ project ใช้ BFF Route Handler:

สามารถเพิ่ม route เช่น:

```text
frontend/src/app/api/v1/dialect/mapping/[word]/route.ts
```

โดย flow:

```text
Frontend

/api/v1/dialect/mapping/กิน
```

↓

```text
NestJS

/api/v1/dialect/mapping/กิน
```

ต้องรองรับคำภาษาไทยอย่างถูกต้อง

ตรวจ:

```ts
encodeURIComponent(word)
```

และ URL decoding/encoding อย่างเหมาะสม

อย่า encode ซ้ำจน URL ผิด

ถ้า project มี route/service สำหรับงานนี้อยู่แล้ว:

**reuse ของเดิม**

ห้ามสร้าง implementation ซ้ำ

---

# Phase 7 — Response Compatibility

เปรียบเทียบ:

```text
Local JSON response shape
```

กับ:

```text
NestJS API response shape
```

Dialect Explorer UI ต้องยังทำงานได้เหมือนเดิม

ถ้า response shape ต่างกัน:

เลือกจุด normalize ที่เหมาะสมที่สุด เช่น:

```text
Route Handler
```

หรือ:

```text
API service layer
```

หรือ:

```text
frontend mapper
```

เป้าหมายคือ:

* UI component เปลี่ยนน้อยที่สุด
* ไม่มี duplicated mapping logic
* TypeScript types ชัดเจน
* maintainable
* ไม่ผูก UI กับ Backend DTO มากเกินไปโดยไม่จำเป็น

ถ้ามี types/interface เดิมอยู่แล้ว:

reuse หรือแก้ให้ถูกต้อง

ไม่สร้าง type ซ้ำโดยไม่จำเป็น

---

# Phase 8 — Preserve Existing UI

งานนี้เป็น:

```text
Data Integration Task
```

ไม่ใช่ UI redesign

ดังนั้นห้าม:

* redesign Dialect Explorer
* เปลี่ยน theme
* เปลี่ยน layout โดยไม่จำเป็น
* เปลี่ยน typography
* เปลี่ยน animation
* เปลี่ยน navigation
* เปลี่ยน component structure ครั้งใหญ่
* refactor unrelated code
* implement feature อื่น

UI/UX ปัจจุบันต้องคงเดิมให้มากที่สุด

สิ่งที่ต้องเปลี่ยนหลัก ๆ คือ:

```text
Local data source
        ↓
Backend database source
```

---

# Phase 9 — Loading & Error Handling

ตรวจ flow ตอน loading

ต้องไม่เกิด:

* infinite request
* infinite render
* request loop
* duplicated requests โดยไม่จำเป็น
* hydration error
* stale state
* UI flicker รุนแรง

เมื่อ Backend error:

Dialect Explorer ต้องไม่ crash

ถ้ามี Local fallback:

ให้ fallback ได้อย่าง graceful

ถ้ามี logging utility อยู่แล้ว:

reuse

หลีกเลี่ยง production console spam

---

# Phase 10 — Environment Configuration

ตรวจสอบ environment configuration จริงของ project

ต้องรองรับ:

```text
THAI_CONTEXT_API_URL
```

Expected example:

```env
THAI_CONTEXT_API_URL=http://localhost:3001/api/v1
```

จากนั้น frontend route append:

```text
/dialect
```

ตรวจสอบให้แน่ใจว่าจะไม่เกิด URL ผิด เช่น:

```text
/api/v1/api/v1/dialect
```

หรือ:

```text
/dialect/dialect
```

อย่า hardcode `localhost` เป็น production configuration

ใช้ localhost เป็น local development fallback เท่านั้น

ถ้า project มี centralized config อยู่แล้ว:

reuse

---

# Phase 11 — Do Not Work Around Backend Problems

ถ้า integration มีปัญหา:

ห้ามรีบสร้าง mock หรือ workaround ฝั่ง Frontend

ตรวจ Backend ก่อน:

* NestJS running หรือไม่
* Dialect module registered หรือไม่
* Controller route ถูกต้องหรือไม่
* Service query ถูกต้องหรือไม่
* Prisma/database connected หรือไม่
* `dialect_entries` มีข้อมูลจริงหรือไม่
* response จาก API จริงคืออะไร
* environment variable ถูกต้องหรือไม่

แก้ root cause

อย่าซ่อน backend bug ด้วย frontend fallback

---

# Phase 12 — Runtime Verification

หลังแก้เสร็จ ให้ทดสอบ flow จริง

## Test 1 — Base Dialect API

```http
GET /api/v1/dialect
```

ต้องดึง Backend data ได้

---

## Test 2 — Category Query

```http
GET /api/v1/dialect?category=conversation
```

ต้อง forward query parameter ไป Backend ถูกต้อง

---

## Test 3 — Thai Mapping

ทดสอบ:

```http
GET /api/v1/dialect/mapping/<thai-word>
```

เช่นคำภาษาไทยจริงที่ Backend มีข้อมูล

ตรวจ encoding

---

## Test 4 — Backend Failure

จำลองหรือทดสอบกรณี Backend unavailable

Expected:

```text
Backend unavailable
        ↓
Next.js API route
        ↓
Local fallback
        ↓
Dialect Explorer remains usable
```

หน้าเว็บต้องไม่ crash

---

## Test 5 — Backend Recovery

เมื่อ Backend กลับมาทำงาน:

ต้องกลับมาใช้ Backend database เป็น primary source

Local fallback ต้องไม่ override Backend

---

# Phase 13 — Tests

ใช้ scripts ที่ project มีอยู่แล้ว

Frontend:

```bash
cd frontend
pnpm test
```

ถ้ามี:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

ให้รันด้วย

Backend:

```bash
cd apps/api
npm run test
```

ถ้ามี smoke test ตามเอกสาร:

```bash
bash scripts/smoke_test.sh
```

ให้ใช้ด้วยหาก environment รองรับ

อย่าสร้าง testing framework ใหม่สำหรับ task นี้

---

# Acceptance Criteria

Task 3 ถือว่าเสร็จเมื่อครบทั้งหมด:

* [ ] อ่าน `docs/12-api-audit-and-team-handoff.md`
* [ ] ตรวจ implementation จริงของ Frontend และ Backend ก่อนแก้
* [ ] Dialect Explorer ใช้ NestJS API เป็น Primary Data Source
* [ ] `/api/v1/dialect` proxy ไป Core API จริง
* [ ] Query parameters ถูก forward ครบ
* [ ] Database `dialect_entries` เป็น source หลัก
* [ ] Local JSON เหลือเป็น fallback เท่านั้น
* [ ] Backend unavailable แล้ว UI ไม่ crash
* [ ] Backend recovery แล้วกลับมาใช้ Backend data
* [ ] `/dialect/mapping/:word` ใช้ Backend จริง ถ้า feature ใช้งาน
* [ ] Thai URL encoding ทำงานถูกต้อง
* [ ] Response shape compatible กับ UI
* [ ] ไม่มี duplicate mapping logic
* [ ] ไม่มี request loop
* [ ] ไม่มี hydration/runtime error ใหม่
* [ ] ไม่มี TypeScript error ใหม่
* [ ] ไม่มี breaking UI change
* [ ] `THAI_CONTEXT_API_URL` ใช้งานถูกต้อง
* [ ] tests ที่เกี่ยวข้องผ่าน
* [ ] ไม่แก้ feature นอก Task 3

---

# Scope Guard

ทำเฉพาะ:

```text
Task 3 — Unify Dialect
```

จาก:

```text
docs/12-api-audit-and-team-handoff.md
```

ห้ามทำ:

```text
Task 1
Task 2
Task 4
Task 5
Task 6
```

ในรอบนี้

ห้าม redesign UI

ห้าม refactor unrelated architecture

ห้ามแก้ส่วนอื่นเพียงเพราะ "สามารถปรับปรุงได้"

แก้เฉพาะสิ่งที่จำเป็นต่อ Task 3 และ dependency ที่เกี่ยวข้องโดยตรง

---

# Working Principle

ใช้ลำดับนี้:

```text
READ DOCS
   ↓
AUDIT EXISTING CODE
   ↓
VERIFY BACKEND CONTRACT
   ↓
TRACE CURRENT DATA FLOW
   ↓
IMPLEMENT MINIMAL FIX
   ↓
VERIFY DATABASE DATA
   ↓
TEST FRONTEND ROUTE
   ↓
TEST DIALECT EXPLORER
   ↓
TEST FALLBACK
   ↓
RUN TESTS / BUILD
   ↓
REPORT
```

อย่าข้าม audit แล้วเริ่มเขียน code ทันที

---

# Final Report

เมื่อทำเสร็จ ให้รายงานผลในรูปแบบนี้

## 1. Existing Architecture

อธิบาย flow เดิมแบบสั้น ๆ:

```text
...
```

และ root cause ที่ทำให้ Dialect Explorer ยังใช้ Local JSON

---

## 2. Files Changed

แสดงทุกไฟล์ที่แก้ เช่น:

```text
frontend/...
apps/api/...
```

พร้อมอธิบายว่าแก้อะไรในแต่ละไฟล์

---

## 3. New Architecture

แสดง flow หลังแก้:

```text
Dialect Explorer
      ↓
Next.js /api/v1/dialect
      ↓
NestJS Core API
      ↓
Dialect Service
      ↓
Prisma
      ↓
PostgreSQL dialect_entries
```

Fallback:

```text
NestJS unavailable
      ↓
Next.js Route Handler
      ↓
Local cached dialect data
```

---

## 4. Backend Contract

สรุป API contract จริงที่ตรวจพบ:

```text
GET /api/v1/dialect
GET /api/v1/dialect/mapping/:word
```

รวม query params และ response shape สำคัญ

---

## 5. Compatibility Changes

ถ้าต้อง normalize data:

อธิบาย:

* Backend shape
* Frontend shape
* normalization อยู่ตรงไหน
* เหตุผลที่เลือกจุดนั้น

---

## 6. Tests Performed

ระบุ command ที่รันจริง

เช่น:

```text
pnpm test
pnpm lint
pnpm typecheck
pnpm build
npm run test
scripts/smoke_test.sh
```

อย่าระบุ command ว่าผ่านถ้ายังไม่ได้รันจริง

---

## 7. Test Results

รายงาน:

```text
PASS
FAIL
NOT RUN
```

อย่างตรงไปตรงมา

---

## 8. Remaining Issues

ถ้ามีปัญหาที่ยังเหลือ:

ระบุให้ชัด

ถ้าไม่มี:

```text
No known issues remaining within Task 3 scope.
```

---

# Final Instruction

เริ่มจากอ่าน:

```text
docs/12-api-audit-and-team-handoff.md
```

โดยเฉพาะ **Task 3**

จากนั้น audit codebase จริงก่อนแก้ไข

ทำ Task 3 ให้ครบแบบ end-to-end

เน้น:

```text
correctness
minimal changes
backend integration
database-backed data
fallback resilience
response compatibility
runtime verification
```

อย่าทำงานนอก scope
