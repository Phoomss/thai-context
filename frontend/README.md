# THAI CONTEXT — Frontend Application

THAI CONTEXT คือเว็บพจนานุกรมไทยร่วมสมัยที่เริ่มค้นหาจาก **ความหมายและบริบทที่ผู้ใช้ต้องการสื่อ (Meaning-First)** แทนการเริ่มจากคำศัพท์ ผู้ใช้สามารถพิมพ์คำอธิบายหรือความรู้สึก เช่น *“คำที่หมายถึงการทำงานให้คุ้มทรัพยากร”* แล้วระบบจะวิเคราะห์เจตนาและแนะนำคำที่ตรงบริบท พร้อมทั้งมีโหมด **เปิดคลังพจนานุกรมฉบับพิมพ์** สำหรับสืบค้นคำตรงตัวตามปีฉบับพิมพ์และหลักฐานทางวิชาการ

หน้าเว็บออกแบบเป็นประสบการณ์แบบหน้าเดียว เริ่มจาก Hero 3D รูปหนังสือ ก่อนเปลี่ยนผ่านเข้าสู่พื้นที่สำรวจคำด้วยแอนิเมชันที่ลื่นไหลเมื่อเริ่มค้นหา

---

## 🌟 2 โหมดการค้นหาหลัก (Dual Search Paradigms)

1. **💡 "จากความหมาย สู่คำที่ใช่" (Reverse Dictionary / Semantic Meaning Search)**:
   - เหมาะสำหรับผู้ใช้ที่ *“ยังไม่รู้ว่าจะใช้คำว่าอะไร”* หรือคำติดอยู่ที่ปลายลิ้น
   - พิมพ์ข้อความอธิบายความรู้สึก บริบท หรือประโยคยาว ๆ
   - ระบบ AI Semantic Search จะวิเคราะห์เจตนา (Intent Understanding) และแนะนำคำที่ใกล้เคียง พร้อมจัดอันดับความตรงบริบท
2. **📖 "เปิดคลังพจนานุกรมฉบับพิมพ์" (Exact Keyword & Print Edition Browser)**:
   - เหมาะสำหรับผู้ใช้ที่ *“รู้คำศัพท์อยู่แล้ว”* และต้องการเปิดดูนิยามต้นฉบับอย่างเป็นทางการ
   - ค้นหาคำตรงตัวตามแม่คำ (Exact Match)
   - ฟิลเตอร์เลือกปีฉบับพิมพ์ราชบัณฑิตยสถาน (พ.ศ. ๒๕๔๒, ๒๕๕๔, ๒๕๖๙)
   - ระบุเลขหน้าในเล่มพิมพ์จริง และคัดลอกรูปแบบการอ้างอิงเชิงวิชาการ (APA / มาตรฐานราชบัณฑิตยสภา)

---

## 🚀 ความสามารถเด่นของระบบ (Core Features)

### 1. ประสบการณ์ค้นหาและการจัดลำดับเนื้อหา (Optimized Reading Hierarchy)
- **Word Detail Card**: จัดเรียงตามลำดับการรับรู้ที่เป็นธรรมชาติ:
  1. หัวคำ, ชนิดคำ (POS), คำอ่านสัทอักษร พร้อมปุ่ม **📋 คัดลอกคำด่วน**
  2. แถบเครื่องมือรวมมัลติโมดอล (🔊 ฟังเสียง | 🤟 ภาษามือไทย | ⠃ อักษรเบรลล์ | 🔗 แชร์)
  3. **📖 ความหมายหลัก** จากพจนานุกรม
  4. **💬 ตัวอย่างการใช้จริง** พร้อมปุ่ม **📋 คัดลอกประโยคในคลิกเดียว**
  5. **🏷️ ป้ายกำกับบริบทและระดับภาษา** (ทางการ / ธุรกิจ / ภาษาปาก / วิชาการ)
  6. **🌐 คำแปล & ศัพท์บัญญัติสากล** พร้อมตรารับรองแหล่งที่มา
  7. **🤟 โมเดลจำลองภาษามือไทย 3D** (Avatar & Skeleton)
  8. **🔗 คำใกล้เคียง** สำหรับสำรวจทางเลือกคำอื่น ๆ
  9. **เครื่องมือต่อยอด**: เลือกเปรียบเทียบคำ (Context Comparator), ปรึกษาผู้ช่วย AI Co-Thinking, และกล่องประเมินฟีดแบ็ก

### 2. แผงตัวกรองบริบทอัจฉริยะ (Redesigned SmartFilters UI)
- **Quick Register Switcher Pills**: ชิปเลือกสลับระดับภาษาด่วน (`🌐 ทั้งหมด`, `🏛️ ทางการ (Official)`, `💼 ธุรกิจ / กึ่งทางการ`, `💬 ภาษาปาก / พูด`)
- **Active Filter Counter & Clear All**: ป้ายแสดงสถานะ `กำลังกรอง X เงื่อนไข` พร้อมปุ่มรีเซ็ตด่วน
- **Input ล้างคำที่ไม่ต้องการ**: มีปุ่ม `✕` เคลียร์คำค้นยกเว้นได้ในคลิกเดียว
- **Active Filter Tags**: แสดงแท็กตัวกรองที่เลือกไว้ด้านล่าง สามารถกดปิด `✕` เพื่อยกเลิกเฉพาะรายการที่ต้องการได้ทันที

### 3. การเข้าถึงและการเรียนรู้แบบมัลติโมดอล (Accessibility & Multi-Modal)
- **🤟 Thai Sign Language (TSL) 3D Motion Player**:
  - แสดงผลท่าทางภาษามือไทย 3 มิติ (WebGL Avatar & Skeleton Kinematics) ที่ 30fps
  - รองรับการควบคุมความเร็ว (0.5x, 0.75x, 1x, 1.25x), แถบเลื่อนไทม์ไลน์ (Timeline Scrubber), โหมดวนซ้ำ (Loop)
  - นโยบายความถูกต้องทางวิชาการ (Strict Legal Governance) โดยแสดงแหล่งอ้างอิงจากคลังภาษามือไทย และไม่คาดเดาท่ามือขึ้นเอง
  - โมดอลเสนอแหล่งข้อมูลภาษามือจากชุมชน (Community Contribution Proposal)
- **⠃ Thai Braille Accessibility Layer**:
  - แสดงอักษรเบรลล์ไทยมาตรฐาน (Unicode Braille Patterns)
  - ตัวจำลองเซลล์ 6 จุด (6-Dot Cell Inspector) คลิกดูจุดที่นูนและรายละเอียดการผสมอักษร
  - โหมด Reverse Braille: แป้นพิมพ์ 6 จุดสำหรับป้อนรหัสเบรลล์เพื่อถอดรหัสกลับมาเป็นข้อความภาษาไทย
- **🔊 Audio Pronunciation & Multi-Provider TTS**:
  - รองรับเสียงอ่านทั้งจาก Backend Server Audio และ Browser Speech Synthesis Fallback

### 4. สะพานสองภาษาและศัพท์บัญญัติ (Bilingual & Coined Term Bridge)
- แสดงคำแปลภาษาอังกฤษ พร้อมจำแนกตรารับรองแหล่งที่มา (Provenance Badges):
  - `🏛️ คำทับศัพท์ทางการ` (OFFICIAL_ROYAL_TRANSLITERATION)
  - `📜 ศัพท์บัญญัติราชบัณฑิต` (OFFICIAL_ROYAL_COINED)
  - `🤖 AI แนะนำ` (AI_GENERATED) พร้อมคำอธิบายบริบทและข้อสังเกตการใช้ (Usage Nuance)

### 5. เครื่องมือวิเคราะห์และสำรวจภาษาเชิงลึก
- **⚖️ Multi-Word Context Comparator**: เปรียบเทียบความแตกต่างของคำได้สูงสุด 3–5 คำพร้อมกัน แสดงจุดเน้น (Emphasis), เมื่อใดควรใช้ (Use When), จุดที่มักสับสน (Common Confusion)
- **⏳ Evolution Explorer**: สำรวจวิวัฒนาการคำศัพท์ตามยุคสมัย (พ.ศ. ๒๔๙๓, ๒๕๒๕, ๒๕๔๒, ๒๕๕๔, ๒๕๖๙)
- **🤖 AI Agent Workspace (✨ ผู้ช่วย AI ภาษาไทย)**: ระบบตัวแทนอัจฉริยะ (Multi-Agent System) มีหน้าเพจเฉพาะทาง (`/ai-assistant`) และเมนูสลับหน้า (Navbar Toggle) รวมถึง Drawer ในหน้าค้นหา รองรับ 6 โหมด Agent (Writing, Rewrite, Compare, Discovery, Proofread, Auto), แสดงขั้นตอน Pipeline Traces แบบเรียลไทม์, พร้อมปุ่ม 1-Click Copy และคำสั่งปรับแต่งต่อยอดด่วน

---

## 🛠️ เทคโนโลยีที่ใช้

- **Framework**: Next.js 16.3.5 (Turbopack, App Router)
- **UI Library**: React 19.2
- **Language**: TypeScript 6
- **Package Manager**: pnpm 12.4.1
- **Styling**: Vanilla CSS, Modern CSS Custom Properties, Glassmorphism UI
- **Animation & Motion**: GSAP 3.15
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **Testing**: Vitest 5, Testing Library (185 tests passed 100%), Playwright

---

## 💻 เริ่มต้นใช้งาน (Getting Started)

### ความต้องการของระบบ
- Node.js 20.9 ขึ้นไป (แนะนำ Node.js 22 LTS)
- pnpm 10 ขึ้นไป

### การติดตั้งและรันในเครื่อง

```bash
# ติดตั้ง dependencies
pnpm install

# รัน Development Server
pnpm run dev
```

เปิดเว็บเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

---

## ⚙️ การตั้งค่าสภาพแวดล้อม (Environment Variables)

สร้างไฟล์ `.env.local` เพื่อกำหนดค่าเชื่อมต่อ Backend:

```dotenv
# ชี้ไปยัง Backend API (หากไม่กำหนด หรือตั้งเป็น true จะทำงานในโหมด Demo อัตโนมัติ)
THAI_CONTEXT_API_URL=http://localhost:3001/api/v1/search/meaning
THAI_CONTEXT_USE_MOCK=false
```

---

## 🧪 คำสั่งทดสอบและตรวจสอบคุณภาพโค้ด

| คำสั่ง | รายละเอียด |
| :--- | :--- |
| `pnpm run dev` | เปิด Local Dev Server พร้อม Turbopack (`0.0.0.0:3000`) |
| `pnpm run typecheck` | ตรวจสอบ TypeScript ทั้งโปรเจกต์ (`tsc --noEmit`) |
| `pnpm test` | รันชุดทดสอบ Unit & Integration Test ทั้งหมด 21 ไฟล์ (185 tests) ด้วย Vitest |
| `pnpm run build` | คอมไพล์และสร้าง Production Build ด้วย Turbopack |
| `pnpm run start` | รัน Production Server จากไฟล์ build ที่สร้างไว้ |
| `pnpm run lint` | ตรวจสอบโค้ดด้วย ESLint |
| `pnpm run test:browser`| รัน End-to-End Test ด้วย Playwright |
| `pnpm run test:http` | ตรวจสอบ Endpoint และ HTTP Response |

ตัวอย่างการทดสอบความสมบูรณ์แบบครบวงจร:
```bash
pnpm run typecheck && pnpm test && pnpm run build
```

---

## 📁 โครงสร้างไดเรกทอรี (Project Structure)

```text
frontend/
├── src/
│   ├── app/                    # Next.js App Router (Pages, Layouts, API Route Handlers)
│   │   ├── api/v1/             # Route handlers สำหรับ Search, TSL, Translations, Dialect, Braille, TTS, Feedback
│   │   ├── globals.css         # ระบบสไตล์หลัก (Modern CSS, Variables, Glassmorphism, Responsive)
│   │   ├── layout.tsx          # Root Layout พร้อมฟอนต์ Noto Sans Thai และ IBM Plex Sans Thai Looped
│   │   └── page.tsx            # หน้าหลัก SearchExperience
│   ├── components/
│   │   ├── ai/                 # AIAssistantDrawer (Grounded Co-Thinking Partner)
│   │   ├── braille/            # BrailleModal (6-dot matrix & Reverse Braille Keypad)
│   │   ├── compare/            # ContextComparator (Multi-word comparison)
│   │   ├── dialect/            # DialectExplorer (Regional words & audio)
│   │   ├── dictionary/         # DictionaryBrowser (Exact search by print editions)
│   │   ├── evidence/           # EvidenceDrawer (Academic citations & dictionary proof)
│   │   ├── evolution/          # EvolutionExplorer (Era timeline 2493–2569)
│   │   ├── feedback/           # SearchResultFeedback (User satisfaction loop)
│   │   ├── hero/               # Hero 3D Book model, CapabilityStrip, HeroSearch
│   │   ├── layout/             # MorphingNavbar, Footer
│   │   ├── pronunciation/      # PronunciationButton (TTS / Web Speech)
│   │   ├── search/             # SearchResults, WordResultCard, SmartFilters, ParsedIntent
│   │   ├── share/              # ShareResultButton & Deep linking
│   │   ├── translations/       # WordTranslations, ProvenanceBadge
│   │   └── tsl/                # SignMotionPlayer (3D Kinematics), SignAvatarCanvas, SignLanguageModal
│   └── lib/                    # Business logic, API clients, motion data catalogs, types
└── tests/                      # ชุดทดสอบครอบคลุม 100% (185 tests)
```
