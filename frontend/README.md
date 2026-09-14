# THAI CONTEXT

THAI CONTEXT คือเว็บต้นแบบพจนานุกรมไทยร่วมสมัยที่เริ่มค้นหาจาก **ความหมายและบริบทที่ผู้ใช้ต้องการสื่อ** แทนการเริ่มจากคำศัพท์ ผู้ใช้สามารถพิมพ์คำอธิบาย เช่น “คำที่หมายถึงการทำงานให้คุ้มทรัพยากร” แล้วระบบจะแนะนำคำที่ใกล้เคียง พร้อมความหมาย ระดับภาษา บริบท ตัวอย่างการใช้ และสถานะของแหล่งอ้างอิง

หน้าเว็บออกแบบเป็นประสบการณ์แบบหน้าเดียว เริ่มจาก Hero 3D รูปหนังสือ ก่อนเปลี่ยนเข้าสู่พื้นที่สำรวจคำด้วย animation เมื่อเริ่มค้นหา

> [!IMPORTANT]
> Repository นี้เป็น frontend prototype และใช้ข้อมูลสาธิตเป็นค่าเริ่มต้น ข้อมูลคำศัพท์ คะแนนความใกล้เคียง วิวัฒนาการของคำ และภาษาถิ่นบางรายการยังไม่ใช่ข้อมูลที่รับรองสำหรับการอ้างอิงทางวิชาการ สามารถเชื่อมต่อ backend จริงได้ผ่าน environment variables

## ความสามารถหลัก

- ค้นหาคำจากคำอธิบายความหมายหรือสถานการณ์ที่ต้องการใช้
- แสดงการตีความคำค้น คำแนะนำ ความหมาย คะแนนความใกล้เคียง ระดับภาษา และบริบท
- กรองผลลัพธ์ตามระดับภาษา บริบท และคำที่ไม่ต้องการ
- เปรียบเทียบคำสองคำเพื่อดูน้ำหนักความหมาย วิธีใช้ และจุดที่มักสับสน
- ตรวจสอบรายละเอียดแหล่งข้อมูลผ่าน Evidence drawer และแสดงสถานะอย่างระมัดระวังเมื่อหลักฐานไม่เพียงพอ
- ฟังการออกเสียงจากไฟล์เสียงของ backend หรือ Web Speech API ของ browser
- แชร์ผลลัพธ์ด้วยลิงก์ที่เปิดกลับมายังคำนั้นได้ รวมถึงคัดลอกความหมายและใช้ native share บนอุปกรณ์ที่รองรับ
- สำรวจตัวอย่างวิวัฒนาการคำตามยุคและคำภาษาถิ่น 4 ภาค
- รองรับ responsive layout, keyboard navigation, focus management, `aria-live` และ `prefers-reduced-motion`
- มี fallback เมื่อ WebGL ใช้งานไม่ได้ และหยุด render ฉาก 3D เมื่อไม่จำเป็น

## เทคโนโลยี

- Next.js 16 App Router และ React 19
- TypeScript
- Three.js, React Three Fiber และ Drei สำหรับ Hero 3D
- GSAP สำหรับ transition และ reveal animation
- Noto Sans Thai
- Vitest และ Testing Library สำหรับ unit/integration tests
- Playwright สำหรับ browser tests

## เริ่มใช้งาน

ต้องมี Node.js 20.9 ขึ้นไป (แนะนำ Node.js 22 LTS) และ npm

```bash
npm ci
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) แล้วพิมพ์ความหมายหรือบริบทที่ต้องการค้นหาในช่องค้นหา

หากยังไม่ได้กำหนด backend ระบบจะเข้า **demo mode** โดยอัตโนมัติ ตัวอย่างคำค้นสำหรับทดลอง:

| คำค้น | ผลลัพธ์ที่คาดหวัง |
| --- | ---: |
| `ไม่พบคำนี้xyz` | 0 คำ |
| `วิจัย` | 1 คำ |
| `ช่วยกัน` | 2 คำ |
| `ทำงาน` | 3 คำ |
| `ทำงานทรัพยากร` | 4 คำ |

ข้อมูลเดโมใช้การจับ keyword จากชุดข้อมูลขนาดเล็ก จึงยังไม่สามารถเข้าใจความหมายได้เท่ากับ semantic search backend จริง

## เชื่อมต่อ Search API

คัดลอก `.env.example` เป็น `.env.local` แล้วกำหนด endpoint เต็มของ backend:

```dotenv
THAI_CONTEXT_API_URL=http://localhost:4000/api/v1/search/meaning
THAI_CONTEXT_USE_MOCK=false
```

ตัวแปรนี้ถูกอ่านใน Route Handler ฝั่ง server และไม่ถูกส่งไปยัง browser โดยตรง หากต้องการบังคับใช้ข้อมูลเดโม ให้ตั้ง `THAI_CONTEXT_USE_MOCK=true`

Frontend ส่งคำค้นไปยัง `POST /api/search` ด้วย payload:

```json
{
  "query": "คำที่หมายถึงการทำงานให้คุ้มทรัพยากร"
}
```

Route Handler จะตรวจว่าคำค้นมีความยาว 1–600 ตัวอักษร แล้วส่งต่อ `{ "query": "..." }` ไปยัง `THAI_CONTEXT_API_URL` โดย backend สามารถคืน response ตรงหรือห่อด้วย `{ "data": response }` ก็ได้ โครงสร้างหลักของ response คือ:

```json
{
  "query_understanding": {
    "raw_query": "...",
    "detected_meaning": "...",
    "context": "...",
    "excluded_words": []
  },
  "recommendations": [
    {
      "headword": "ประสิทธิภาพ",
      "score": 0.96,
      "pos": "น.",
      "definition": "...",
      "registers": ["ทางการ"],
      "contexts": ["การทำงาน"]
    }
  ]
}
```

รายละเอียดฟิลด์เสริม เช่น `examples`, `pronunciation`, `related_words`, `sources` และ `comparison` อยู่ใน [`src/lib/search-types.ts`](src/lib/search-types.ts)

Backend มี timeout 7 วินาที หากเชื่อมต่อไม่ได้ ได้ HTTP error หรือ response ไม่ผ่าน schema validation ระบบจะคืนข้อมูลเดโมในโหมด `fallback` พร้อมข้อความแจ้งบนหน้าเว็บ ส่วน request จาก browser มี timeout 10 วินาทีและสามารถกดลองใหม่ได้

## คำสั่งที่ใช้บ่อย

| คำสั่ง | รายละเอียด |
| --- | --- |
| `npm run dev` | เปิด development server ที่พอร์ต 3000 |
| `npm run build` | สร้าง production build |
| `npm run start` | เปิด production server จาก build ที่สร้างแล้ว |
| `npm run typecheck` | ตรวจ TypeScript โดยไม่สร้างไฟล์ output |
| `npm run lint` | ตรวจโค้ดใน `src` และ `tests` ด้วย ESLint |
| `npm test` | รัน Vitest unit/integration tests |
| `npm run test:browser` | รัน Playwright browser tests โดยคาดว่า app เปิดอยู่ที่พอร์ต 3000 |
| `npm run test:http` | ทดสอบ production HTTP และ API ที่พอร์ต 3011 โดยต้องรัน `npm run build` ก่อน |

ตัวอย่างการตรวจทั้งหมด:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:http
```

สำหรับ browser tests ให้เปิด development server ในอีก terminal ก่อน:

```bash
npm run dev
npm run test:browser
```

## โครงสร้างโปรเจกต์

```text
src/
├── app/
│   ├── api/search/route.ts   # API boundary, validation และ fallback
│   ├── layout.tsx            # metadata, font และ root layout
│   └── page.tsx              # หน้าแรก
├── components/
│   ├── hero/                 # Hero 3D และช่องค้นหาเริ่มต้น
│   ├── search/               # ผลลัพธ์ ตัวกรอง และ persistent search
│   ├── compare/              # เปรียบเทียบคำ
│   ├── evidence/             # แสดงหลักฐานอ้างอิง
│   ├── evolution/            # สำรวจวิวัฒนาการคำ
│   ├── dialect/              # สำรวจคำภาษาถิ่น
│   ├── pronunciation/        # จัดการการออกเสียง
│   └── share/                # แชร์และ deep link
└── lib/
    ├── experience-state.ts   # state machine ของประสบการณ์ค้นหา
    ├── search-types.ts       # types และ runtime response validation
    ├── mock-search.ts        # ข้อมูลค้นหาสำหรับ demo/fallback
    └── explorer-data.ts      # ข้อมูลเดโมสำหรับ evolution และ dialect

tests/
├── *.test.ts(x)              # Vitest unit/integration tests
└── browser/                  # Playwright end-to-end tests
```

`SearchExperience.tsx` เป็นตัวประสาน state, request, animation และส่วนแสดงผลทั้งหมด ระบบใช้ request ID และ `AbortController` เพื่อไม่ให้ response เก่าทับผลการค้นหาล่าสุด การค้นหาครั้งแรกจะรอจังหวะที่ transition ปิดหน้าจอสนิทก่อนเปลี่ยนไปยังผลลัพธ์ ส่วนการค้นหาครั้งถัดไปจะอัปเดตผลลัพธ์ในพื้นที่เดิมโดยไม่เล่น Hero ซ้ำ
