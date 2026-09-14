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

- ค้นหาด้วยคำไทย ความหมาย หรือข้อความอธิบายบริบท
- แสดงคำค้นที่ระบบตีความแล้ว (parsed intent)
- แสดงคำแนะนำและผลลัพธ์ที่เกี่ยวข้อง
- แสดงคะแนนและข้อมูลประกอบ เช่น register, domain และ context
- มี Smart Filters สำหรับกรองผลลัพธ์
- Search bar ยังคงใช้งานได้หลังเข้าสู่หน้าผลลัพธ์
- ป้องกันผลลัพธ์จาก request เก่าทับ request ใหม่ด้วย request ID และ `AbortController`
- รองรับสถานะ loading, empty, error, retry, demo และ fallback
- หากไม่ได้ตั้งค่า backend หน้าเว็บจะใช้ demo data โดยอัตโนมัติ

### รายละเอียดคำและหลักฐาน

- แสดงหัวคำ ความหมาย ตัวอย่าง บริบท และข้อมูลการออกเสียง
- Evidence Drawer สำหรับดูแหล่งข้อมูล ฉบับพจนานุกรม หน้า และสถานะหลักฐาน
- แยกสถานะข้อมูลจริงกับข้อมูลสาธิตอย่างชัดเจน
- รองรับการเปิดผลลัพธ์จาก query/deep link

### เปรียบเทียบและสำรวจภาษา

- เลือกคำเพื่อเปรียบเทียบความหมายและบริบทใน Context Comparator
- Evolution Explorer สำหรับดูตัวอย่างวิวัฒนาการของคำหรือความหมาย
- Dialect Explorer สำหรับสำรวจคำถิ่นและการเชื่อมโยงกับภาษาไทยมาตรฐาน
- ข้อมูลบางส่วนในหน้าสำรวจยังใช้ข้อมูลตัวอย่างจาก frontend

### Pronunciation และเสียง

- ปุ่มฟังการออกเสียงในผลการค้นหา
- ใช้ `pronunciation.audio_url` จากผลค้นหาเมื่อมีไฟล์เสียง
- fallback ไปยัง Web Speech API (`speechSynthesis`) ของ browser เมื่อไม่มีไฟล์เสียง
- รองรับ play, pause, resume, stop และ error state
- หยุดเสียงเดิมเมื่อเปลี่ยนคำ เปลี่ยนหน้า หรือเริ่มเล่นคำใหม่
- Backend มี Server-side TTS API แยกต่างหาก แต่ frontend branch ปัจจุบันยังไม่ได้เรียก endpoint นี้โดยตรง

### Sharing

- แชร์คำและผลลัพธ์ผ่าน Native Share API เมื่ออุปกรณ์รองรับ
- fallback เป็นการคัดลอกลิงก์
- ลิงก์แชร์สามารถเปิดกลับมายังคำและ query ที่เกี่ยวข้องได้

### Responsive และ Accessibility

- รองรับ desktop, tablet และ mobile
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

