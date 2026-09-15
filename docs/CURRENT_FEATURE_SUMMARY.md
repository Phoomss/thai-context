# THAI CONTEXT — Current Feature Summary

เอกสารนี้สรุปฟีเจอร์ที่พบใน source code ปัจจุบันแบบคร่าว ๆ เพื่อใช้เป็นภาพรวมของโปรเจกต์

## ภาพรวมผลิตภัณฑ์

THAI CONTEXT เป็นแพลตฟอร์มพจนานุกรมภาษาไทยแบบ **meaning-first** ผู้ใช้สามารถค้นหาคำ ความหมาย หรือข้อความที่อธิบายบริบท แล้วระบบช่วยตีความเจตนา แนะนำคำที่เกี่ยวข้อง และแสดงหลักฐานประกอบจากข้อมูลพจนานุกรม

โครงสร้างหลักของระบบประกอบด้วย:

- Frontend: Next.js
- Backend API: NestJS
- AI/NLP Service: FastAPI
- Database: PostgreSQL และ pgvector

## ฟีเจอร์หน้าเว็บ

### Hero และ Navigation

- Hero Section พร้อมภาพ 3D และ cinematic search transition
- Video background สำหรับ Hero โดยรองรับ WebM, MP4 และ poster image
- Video เล่นแบบ autoplay, muted, loop และ plays inline
- แสดงภาพ poster แทน video เมื่อผู้ใช้เปิด `prefers-reduced-motion`
- Navbar แบบ responsive และเปลี่ยนรูปแบบตามสถานะของหน้า
- รองรับ fallback เมื่อ WebGL หรือฉาก 3D ใช้งานไม่ได้

### Search Experience

- **2 โหมดการค้นหาหลัก (Dual Search Paradigms)**:
  1. **"จากความหมาย สู่คำที่ใช่" (Reverse Dictionary)**: ค้นหาจากความหมาย เจตนา บริบท หรือประโยคที่คิดอยู่ในหัว เพื่อให้ AI แนะนำคำที่เหมาะสม
  2. **"เปิดคลังพจนานุกรมฉบับพิมพ์" (Dictionary Browser)**: ค้นหาคำตรงตัวตามแม่คำ (Exact Match) พร้อมฟิลเตอร์เลือกปีฉบับพิมพ์ (พ.ศ. ๒๕๔๒, ๒๕๕๔, ๒๕๖๙) เลขหน้า และแหล่งข้อมูล
- แสดงคำค้นที่ระบบตีความแล้ว (parsed intent)
- แสดงคำแนะนำและผลลัพธ์ที่เกี่ยวข้อง พร้อมคะแนนความตรงบริบท
- **แผงตัวกรองอัจฉริยะ (Redesigned SmartFilters)**:
  - Quick Register Switcher Pills (`🌐 ทั้งหมด`, `🏛️ ทางการ`, `💼 ธุรกิจ`, `💬 ภาษาปาก`)
  - แสดงตัวนับสถานะตัวกรอง (`กำลังกรอง X เงื่อนไข`) พร้อมปุ่มล้างตัวกรอง
  - ช่อง "คำที่ไม่ต้องการใช้" พร้อมปุ่มล้างข้อความด่วน
  - Active Filter Tags ด้านล่างสำหรับกดปิดเฉพาะเงื่อนไขในคลิกเดียว
- Search bar แบบ persistent ยังคงใช้งานได้ตลอดการเลื่อนหน้า
- ป้องกัน race conditions ด้วย request ID และ `AbortController`
- รองรับสถานะ loading, empty, error, retry, demo และ fallback

### รายละเอียดคำและหลักฐาน (Word Detail & Information Hierarchy)

- **การจัดเรียงเนื้อหาตามลำดับการรับรู้ (Cognitive Flow)**:
  1. หัวคำ, ชนิดคำ, คำอ่านสัทอักษร พร้อมปุ่ม **📋 คัดลอกคำด่วน**
  2. แถบเครื่องมือมัลติโมดอลรวม (ฟังเสียงอ่าน, ภาษามือไทย 3D, อักษรเบรลล์, แชร์)
  3. **ความหมายหลัก**
  4. **ตัวอย่างการใช้จริง** พร้อมปุ่ม **📋 คัดลอกประโยคในคลิกเดียว**
  5. ป้ายกำกับบริบทและระดับภาษา
  6. **คำแปล & ศัพท์บัญญัติราชบัณฑิตยสภา**
  7. **ภาษามือไทย 3D** (Avatar & Skeleton)
  8. **คำใกล้เคียง**
  9. แถบเครื่องมือต่อยอด (เปรียบเทียบคำ, ปรึกษา AI Co-Thinking, ฟีดแบ็ก)
- Evidence Drawer สำหรับดูแหล่งข้อมูล ฉบับพจนานุกรม เลขหน้า และสถานะหลักฐาน
- **One-Click Academic Citation**: ตัวสร้างการอ้างอิงทางวิชาการ (APA / มาตรฐานราชบัณฑิตยสภา) ในคลิกเดียว
- แยกสถานะข้อมูลจริงกับข้อมูลสาธิตอย่างชัดเจน

### การเข้าถึงและมัลติโมดอล (Accessibility & Multi-Modal)

- **Thai Sign Language (TSL) 3D Motion Player**:
  - โปรแกรมจำลองการเคลื่อนไหวภาษามือไทย 3 มิติ (WebGL Avatar & Skeleton Kinematics) ที่ 30fps
  - ควบคุมความเร็วการเล่น, เลื่อนแถบไทม์ไลน์, โหมดวนซ้ำ
  - นโยบายความถูกต้องทางวิชาการ (Strict Legal Governance) อ้างอิงจากคลังภาษามือไทยทางการ ไม่คาดเดาท่ามือขึ้นเอง
  - โมดอลเสนอแหล่งข้อมูลภาษามือจากชุมชน (Community Contribution Proposal)
- **Thai Braille Accessibility Module**:
  - แสดงอักษรเบรลล์ไทยมาตรฐาน (Unicode Braille Patterns)
  - ตัวตรวจเซลล์ 6 จุด (6-Dot Cell Inspector) คลิกดูจุดนูนและหลักการผสมตัวอักษร
  - โหมด Reverse Braille: แป้นพิมพ์ 6 จุดสำหรับป้อนรหัสเบรลล์เพื่อถอดรหัสเป็นข้อความไทย
- **สะพานสองภาษาและศัพท์บัญญัติ (Bilingual & Coined Term Bridge)**:
  - แสดงคำแปลภาษาอังกฤษ พร้อมจำแนกตรารับรองแหล่งที่มา (Provenance Badges):
    - `🏛️ คำทับศัพท์ทางการ` (OFFICIAL_ROYAL_TRANSLITERATION)
    - `📜 ศัพท์บัญญัติราชบัณฑิต` (OFFICIAL_ROYAL_COINED)
    - `🤖 AI แนะนำ` (AI_GENERATED) พร้อมคำอธิบายบริบทและข้อสังเกตการใช้

### เปรียบเทียบและสำรวจภาษา

- **Context Comparator**: เปรียบเทียบคำพร้อมกันได้สูงสุด 3–5 คำ แสดงจุดเน้น วิธีใช้ และจุดที่มักสับสน พร้อม Nuance Delta
- **Evolution Explorer**: สำหรับดูตัวอย่างวิวัฒนาการของคำหรือความหมายตามยุคสมัย
- **Dialect Explorer**: สำหรับสำรวจคำถิ่น 4 ภาค พร้อมฟังเสียงอ่านสำเนียงท้องถิ่น
- **AI Co-Thinking Partner**: ผู้ช่วย AI วิเคราะห์เจตนาและแนะนำการต่อยอด พร้อม Context Chips และ Action Buttons

### Pronunciation และเสียง

- ปุ่มฟังการออกเสียงในผลการค้นหา
- รองรับเสียงสังเคราะห์จาก Server-side TTS API และ Web Speech API fallback
- รองรับ play, pause, resume, stop และ error state ป้องกันเสียงซ้อนทับกันเมื่อเปลี่ยนคำ

### Sharing

- แชร์คำและผลลัพธ์ผ่าน Web Share API เมื่ออุปกรณ์รองรับ
- fallback เป็นการคัดลอกลิงก์
- ลิงก์แชร์สามารถเปิดกลับมายังคำและ query ที่เกี่ยวข้องได้

### Responsive และ Accessibility

- รองรับ desktop, tablet และ mobile อย่างสมบูรณ์
- รองรับ keyboard navigation และ focus states
- มี ARIA labels/status สำหรับส่วน interactive หลัก
- รองรับ `prefers-reduced-motion`
- Background video ไม่รับ pointer event จึงไม่ขวาง navbar, search หรือปุ่มต่าง ๆ

## ฟีเจอร์ Backend API

### Dictionary และ Search

- ค้นหาแบบ keyword, meaning และ context
- ดูรายละเอียดคำจาก dictionary entry
- ดึงข้อมูลจากพจนานุกรมหลายฉบับ เช่น 2542, 2554, 2569 และข้อมูลคำถิ่น
- ดู timeline/วิวัฒนาการของคำ
- เปรียบเทียบคำหรือความหมาย
- ข้อมูลการออกเสียงและ RTGS
- ข้อมูลคำแปล
- metadata/media สำหรับภาษามือไทยและ accessibility

### Dialect

- ค้นหาและดูรายการคำถิ่น
- mapping ระหว่างคำถิ่นกับภาษาไทยมาตรฐาน

### AI และ NLP

- วิเคราะห์ query และเจตนาของผู้ใช้
- สร้าง embeddings และค้นหาเชิงความหมายด้วย pgvector
- จัดอันดับผลลัพธ์ตามบริบท
- Grounded AI chat/RAG โดยอ้างอิงข้อมูลในระบบ
- รองรับงาน RTGS, translation และการสังเคราะห์เสียงผ่าน AI service

### Server-side TTS

- Endpoint หลัก: `POST /api/v1/tts/synthesize`
- Endpoint ตรวจสถานะ provider: `GET /api/v1/tts/status`
- มี provider abstraction, cache และ fallback provider
- รองรับ timeout และ fallback เมื่อ AI TTS service ใช้งานไม่ได้

### ระบบสนับสนุน

- Health check endpoints
- Feedback API
- Validation และ Swagger/OpenAPI documentation

## Data และโหมดการทำงาน

- ระบบรองรับ PostgreSQL และ vector search ผ่าน pgvector
- README ของโปรเจกต์ระบุข้อมูลประมาณ 29,544 headwords, 36,398 definitions, 29,612 vectors และ 84 dialect items
- Frontend มี 3 โหมดผลลัพธ์: `live`, `demo` และ `fallback`
- การใช้งานข้อมูลจริงต้องเปิด backend, AI service และ database พร้อมตั้งค่า environment variables ให้ถูกต้อง

## สถานะและข้อจำกัดปัจจุบัน

- หน้าเว็บสามารถเปิดและทดลอง flow หลักได้ด้วย demo data แม้ backend ไม่ทำงาน
- Evolution, Dialect และบางส่วนของ Compare ใช้ sample/demo data เป็น fallback
- Server-side TTS มีใน backend แล้ว แต่ frontend ปัจจุบันยังใช้ audio URL หรือ Web Speech API เป็นหลัก
- ฟีเจอร์ AI, semantic search, translation และ TTS แบบเต็มรูปแบบขึ้นอยู่กับ backend, AI service, database และ configuration ของแต่ละ environment
- คุณภาพและความน่าเชื่อถือของผลลัพธ์ใน `demo`/`fallback` ไม่ควรถูกตีความว่าเป็นข้อมูลพจนานุกรมที่รับรองแล้ว

## จุดเริ่มต้นของ Source Code

- Frontend หลัก: `frontend/src/components/SearchExperience.tsx`
- Hero: `frontend/src/components/hero/HeroSection.tsx`
- Search API boundary: `frontend/src/app/api/search/route.ts`
- Pronunciation: `frontend/src/components/pronunciation/PronunciationButton.tsx`
- Audio lifecycle: `frontend/src/lib/audio-manager.ts`
- Backend modules: `apps/api/src/modules/`
- TTS backend: `apps/api/src/modules/tts/`
- AI service: `apps/ai-service/`

