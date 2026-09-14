กำลังทำโปรเจกต์ **THAI CONTEXT — Task 5: Multi-Word Comparator**

ตอนนี้พบ runtime error:

```text
POST /api/v1/compare 404 in 218ms
(next.js: 198ms, application-code: 19ms)
```

ให้ตรวจสอบและแก้ไขปัญหานี้แบบ end-to-end

## Important

ก่อนแก้ code ให้กลับไปอ่าน:

```text
docs/12-api-audit-and-team-handoff.md
```

เฉพาะ:

```text
Task 5: เปรียบเทียบความแตกต่างของคำด้วย AI
(Multi-Word Comparator)
```

Task 5 ต้องใช้:

```http
POST /api/v1/compare
```

และเชื่อม `ContextComparator.tsx` กับ Backend จริง

---

# Current Problem

Frontend กำลังเรียก:

```http
POST /api/v1/compare
```

แต่ Next.js ตอบ:

```text
404
```

Log:

```text
POST /api/v1/compare 404 in 218ms
(next.js: 198ms, application-code: 19ms)
```

อย่าเดาว่าปัญหาอยู่ Backend ทันที

จาก log นี้ให้ตรวจสอบก่อนว่า Next.js มี Route Handler สำหรับ URL นี้จริงหรือไม่

---

# Step 1 — Trace Request Flow

ค้นทั้ง repository:

```text
/api/v1/compare
ContextComparator
compareWords
CompareController
@Post
compare
THAI_CONTEXT_API_URL
```

ตรวจ flow จริงว่าปัจจุบันเป็น:

```text
ContextComparator
      ↓
POST /api/v1/compare
      ↓
???
```

แล้วระบุว่าจุดที่ 404 เกิดตรงไหน

ต้องตรวจทั้ง:

```text
frontend
apps/api
apps/ai-service หรือ AI service directory จริง
```

---

# Step 2 — Inspect Next.js Route

ตรวจว่ามีไฟล์นี้จริงหรือไม่:

```text
frontend/src/app/api/v1/compare/route.ts
```

สำหรับ Next.js App Router endpoint:

```http
POST /api/v1/compare
```

ควรมี route structure เทียบเท่า:

```text
src/
└─ app/
   └─ api/
      └─ v1/
         └─ compare/
            └─ route.ts
```

และต้อง export:

```ts
export async function POST(request: Request) {
  ...
}
```

หาก route นี้ไม่มี และ architecture ของ project ใช้ Next.js BFF/proxy สำหรับ `/api/v1/*`:

ให้สร้าง route ตาม pattern ที่ project ใช้อยู่จริง

อย่าตั้งชื่อ:

```text
compare.ts
page.tsx
route.js
```

ผิด convention โดยไม่ตรวจ configuration

---

# Step 3 — Check for Wrong Route Location

ตรวจว่ามี route ถูกสร้างผิดที่หรือไม่ เช่น:

```text
frontend/app/api/v1/compare/route.ts
```

แต่ project ใช้:

```text
frontend/src/app/
```

หรือกลับกัน

ตรวจ `frontend` structure จริงก่อน

Next.js ต้องเห็น route จาก App Router path ที่ project ใช้งานจริง

---

# Step 4 — Check HTTP Method

ตรวจ `route.ts`

ถ้ามีแค่:

```ts
export async function GET()
```

แต่ Frontend เรียก:

```http
POST /api/v1/compare
```

ให้เพิ่มหรือแก้เป็น:

```ts
export async function POST(request: Request)
```

ตาม Task 5 contract

อย่าเปลี่ยน frontend ไปใช้ GET เพราะ Backend contract คือ POST

---

# Step 5 — Implement Correct Next.js Proxy

หาก project ใช้ Next.js proxy pattern:

Route Handler ต้องรับ:

```json
{
  "words": ["ประสิทธิภาพ", "ประสิทธิผล"]
}
```

แล้ว forward ไป NestJS:

```http
POST http://localhost:3001/api/v1/compare
```

ใช้ environment config เดิมของ project

เช่น:

```ts
const backendUrl =
  process.env.THAI_CONTEXT_API_URL ||
  "http://localhost:3001/api/v1";
```

conceptual implementation:

```ts
export async function POST(request: Request) {
  try {
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
  } catch (error) {
    // proper error handling
  }
}
```

นี่เป็นตัวอย่าง concept เท่านั้น

ให้ reuse:

* API helpers
* backend URL helper
* response helper
* logger
* error utilities

ที่ project มีอยู่แล้ว

---

# Step 6 — Verify THAI_CONTEXT_API_URL

ตรวจ environment variables จริง

ให้แน่ใจว่า:

```text
THAI_CONTEXT_API_URL=http://localhost:3001/api/v1
```

แล้ว final backend URL เป็น:

```text
http://localhost:3001/api/v1/compare
```

ต้องไม่เกิด:

```text
http://localhost:3001/api/v1/api/v1/compare
```

หรือ:

```text
http://localhost:3001/api/v1/compare/compare
```

หรือ:

```text
http://localhost:3001/compare
```

ถ้า Backend controller มี global prefix `/api/v1`

ให้ respect prefix จริง

---

# Step 7 — Verify NestJS Endpoint Exists

ตรวจ Backend source จริงว่า endpoint ถูก register

ค้น:

```text
CompareController
@Controller
@Post
compareWords
```

ตรวจว่า final route จริงคือ:

```http
POST /api/v1/compare
```

ไม่ใช่:

```text
POST /compare
POST /api/compare
POST /api/v1/ai/compare
```

ตรวจ:

* controller path
* global prefix
* module registration
* controller registration
* DTO
* service dependency

อย่า assume จาก docs อย่างเดียว

---

# Step 8 — Verify Compare Module Registration

ถ้า controller มีอยู่แต่ endpoint ยัง 404 ที่ NestJS:

ตรวจว่า module ถูก import ใน root/app module หรือไม่

เช่น:

```text
AppModule
  ↓
CompareModule / AiModule
  ↓
CompareController
```

ตรวจ decorators:

```ts
@Module({
  imports: [...],
  controllers: [...],
  providers: [...],
})
```

ถ้า controller ไม่ได้ register:

แก้เฉพาะ registration ที่จำเป็น

---

# Step 9 — Verify ContextComparator Request

ตรวจ `ContextComparator.tsx`

request ต้องเป็น:

```ts
fetch("/api/v1/compare", {
  method: "POST",
  ...
})
```

ไม่ควรเป็น:

```text
api/v1/compare
```

แบบไม่มี leading slash ถ้าทำให้ path relative ผิด

หรือ:

```text
/api/compare
```

หรือ:

```text
/api/v1/compare/
```

ถ้า routing/config ปัจจุบันไม่รองรับตามที่ตั้งใจ

ตรวจ request body:

```json
{
  "words": [...]
}
```

---

# Step 10 — Do Not Bypass Next.js Without Reason

ถ้า architecture ของ project คือ:

```text
Browser
 ↓
Next.js /api/v1/*
 ↓
NestJS
```

ให้คง architecture นี้

อย่าแก้แบบลัดด้วย:

```ts
fetch("http://localhost:3001/api/v1/compare")
```

จาก browser โดยตรง

เว้นแต่ project architecture จริงใช้ direct backend requests อยู่แล้ว

หลีกเลี่ยง CORS/config mismatch โดยไม่จำเป็น

---

# Step 11 — Verify Route Discovery

หลังสร้างหรือแก้ Next.js route:

restart frontend dev server หากจำเป็น

เพราะ Next.js อาจยังไม่ discover route ใหม่ในบาง state

จากนั้นทดสอบ:

```http
POST http://localhost:3000/api/v1/compare
```

หรือ frontend port จริง

ด้วย body:

```json
{
  "words": ["ประสิทธิภาพ", "ประสิทธิผล"]
}
```

Expected:

```text
NOT 404
```

จากนั้นจึงตรวจ response ต่อ

---

# Step 12 — Test Backend Directly

ทดสอบ Backend โดยไม่ผ่าน Next.js:

```http
POST http://localhost:3001/api/v1/compare
```

Body:

```json
{
  "words": ["ประสิทธิภาพ", "ประสิทธิผล"]
}
```

ต้องแยกให้ออก:

### Case A

```text
Next.js 404
Backend 200
```

หมายถึง Frontend route/proxy มีปัญหา

### Case B

```text
Next.js route works
Backend 404
```

หมายถึง NestJS route/controller/module มีปัญหา

### Case C

```text
Backend 5xx
```

หมายถึง route มีแล้ว แต่ AI/service integration มีปัญหา

แก้ตาม root cause จริง

---

# Step 13 — Preserve Backend Error Codes

Next.js proxy ต้องไม่ทำแบบ:

```ts
if (!res.ok) {
  return Response.json({ error: "failed" });
}
```

โดยไม่ preserve status

ควรส่งต่อ meaningful HTTP status จาก Backend

เช่น:

```ts
return Response.json(data, {
  status: response.status,
});
```

เพื่อให้ Frontend distinguish:

```text
400
404
422
500
503
```

ได้

---

# Step 14 — Check the Recent Task 5 Test Change

ก่อนหน้านี้ Task 5 มีการแก้:

```text
apps/api/src/modules/ai/ai.service.spec.ts
```

และ method:

```text
compareWords()
```

ตรวจว่าการ implement Task 5 ล่าสุดไม่ได้สร้าง:

* service แต่ไม่มี controller
* controller แต่ module ไม่ register
* frontend request แต่ไม่มี Next.js proxy
* duplicate `/api/v1`
* wrong route path

อย่าแก้ test เพื่อซ่อน runtime issue

---

# Step 15 — Runtime End-to-End Test

หลังแก้ ต้องทดสอบ flow:

```text
ContextComparator
      ↓
POST /api/v1/compare
      ↓
Next.js route.ts
      ↓
POST NestJS /api/v1/compare
      ↓
Compare service
      ↓
AI service
      ↓
response
      ↓
ContextComparator
```

ใช้ words:

```json
{
  "words": ["ประสิทธิภาพ", "ประสิทธิผล"]
}
```

ตรวจ:

* HTTP 200 หรือ status ที่ถูกต้อง
* definitions
* comparison
* evidence
* frontend render

---

# Step 16 — Regression Check

หลังแก้ให้รัน:

```bash
cd apps/api
npm run build
npm run test
```

และ:

```bash
cd frontend
pnpm test
pnpm build
```

ถ้ามี:

```bash
pnpm lint
pnpm typecheck
```

ให้รันด้วย

ห้ามรายงาน PASS ถ้าไม่ได้ run จริง

---

# Scope Guard

แก้เฉพาะ Task 5 และ dependency ที่จำเป็นต่อ:

```text
POST /api/v1/compare
```

ห้าม:

* redesign ContextComparator
* เปลี่ยน theme
* implement Task อื่น
* refactor unrelated code
* hardcode comparison result
* fake API success
* bypass Backend โดยไม่มีเหตุผล
* เปลี่ยน API contractเพียงเพื่อให้ frontend ผ่าน

---

# Acceptance Criteria

ถือว่าแก้เสร็จเมื่อ:

* [ ] `/api/v1/compare` ไม่ตอบ Next.js 404 อีก
* [ ] Next.js Route Handler มีและถูก discover
* [ ] HTTP method เป็น POST ถูกต้อง
* [ ] Frontend request path ถูกต้อง
* [ ] Request body ส่ง `words` ถูกต้อง
* [ ] Next.js forward ไป NestJS URL ถูกต้อง
* [ ] NestJS `/api/v1/compare` มีอยู่จริง
* [ ] Compare controller/module register ถูกต้อง
* [ ] API response status ถูก preserve
* [ ] ContextComparator ได้ response จริง
* [ ] ไม่มี mock success
* [ ] ไม่มี TypeScript compile error ใหม่
* [ ] `npm run build` ฝั่ง API ผ่าน
* [ ] `pnpm build` ฝั่ง Frontend ผ่าน
* [ ] test ที่เกี่ยวข้องผ่าน
* [ ] Task 5 end-to-end ใช้งานจริง

---

# Final Report

เมื่อแก้เสร็จ ให้รายงาน:

## Root Cause

ระบุสาเหตุจริงของ:

```text
POST /api/v1/compare 404
```

ห้ามตอบกว้าง ๆ

---

## Files Changed

แสดงไฟล์ทั้งหมดที่แก้

---

## Route Before

```text
ContextComparator
↓
...
↓
404
```

---

## Route After

```text
ContextComparator
↓
Next.js POST /api/v1/compare
↓
NestJS POST /api/v1/compare
↓
Compare Service
↓
AI Service
↓
Result
```

ปรับตาม architecture จริง

---

## Verification

แสดงผลทดสอบจริง:

```text
Next.js endpoint: PASS / FAIL
NestJS endpoint: PASS / FAIL
Frontend integration: PASS / FAIL
API build: PASS / FAIL
Frontend build: PASS / FAIL
Tests: PASS / FAIL
```

---

## Important Final Instruction

อย่าแก้จาก assumption

เริ่มจากตรวจว่า:

```text
frontend/src/app/api/v1/compare/route.ts
```

มีอยู่จริงหรือไม่

เพราะ log ปัจจุบัน:

```text
POST /api/v1/compare 404
(next.js: 198ms, application-code: 19ms)
```

บ่งชี้ว่าควรตรวจ Next.js route discovery / path / HTTP method เป็นอันดับแรก

จากนั้น trace ต่อจนถึง NestJS และ AI service

แก้ root cause และทดสอบ Task 5 แบบ end-to-end
