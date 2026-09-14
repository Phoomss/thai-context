    คุณกำลังพัฒนาโปรเจกต์ **THAI CONTEXT**

งานนี้ให้ implement:

# Feature 4 — Server-side TTS / Zero-Crash TTS Engine

ระบบเสียงอ่านสังเคราะห์จากเซิร์ฟเวอร์

## เป้าหมาย

เปลี่ยนระบบอ่านออกเสียงคำศัพท์ที่ปัจจุบันพึ่งพา Browser `window.speechSynthesis` ให้ใช้ **Server-side TTS เป็นระบบหลัก** เพื่อให้การออกเสียงภาษาไทยมีคุณภาพและเสถียรกว่า โดยเฉพาะบน Mobile และอุปกรณ์ที่ไม่มี Thai Voice ใน Browser

ขณะนี้ทำงานอยู่บน branch:

```bash
feature/pronunciation-tts
```

---

# 1. อ่าน Documentation ก่อน

เริ่มจากอ่านไฟล์:

```text
thai-context/docs/frontend-feature-gap-analysis.md
```

ให้โฟกัสเป็นพิเศษที่หัวข้อ:

```text
ระบบเสียงอ่านสังเคราะห์จากเซิร์ฟเวอร์
Server-side TTS / Zero-Crash TTS Engine
```

รวมถึง Actionable Implementation Plan ที่เกี่ยวข้องกับ:

```text
PronunciationButton
/api/v1/tts/synthesize
```

**ห้ามเริ่มแก้โค้ดทันที**

ก่อน implement ให้สำรวจและวิเคราะห์ project structure และ source code ที่เกี่ยวข้องทั้งหมดก่อน

---

# 2. วิเคราะห์ระบบเดิม

ค้นหาและอ่าน source code ที่เกี่ยวข้องกับ Pronunciation / TTS เช่น:

```text
PronunciationButton.tsx
SearchExperience.tsx
WordResultCard.tsx
SearchResults.tsx
```

รวมถึง:

* API client
* fetch utilities
* hooks
* types
* environment variables
* config
* backend routes
* FastAPI endpoints
* TTS service
* audio utilities
* error handling
* loading state
* component ที่เรียก `PronunciationButton`
* การใช้ `window.speechSynthesis`
* การใช้ Web Speech API ที่มีอยู่

ค้นหาทั้ง project ว่ามี:

```text
speechSynthesis
SpeechSynthesisUtterance
PronunciationButton
tts
synthesize
Audio
audio/wav
```

อยู่ที่ใดบ้าง

จากนั้นทำความเข้าใจ flow ปัจจุบันก่อนแก้ไข

---

# 3. ตรวจสอบ Backend API จริง

Documentation ระบุ Endpoint:

```http
POST /api/v1/tts/synthesize
```

แต่ **ห้ามเดา request / response schema**

ให้ค้นหา Backend implementation จริงใน project และตรวจสอบ:

* request body
* response type
* MIME type
* status code
* error response
* query/body parameters
* text field ใช้ชื่ออะไร
* รองรับ word / text แบบไหน
* response เป็น WAV stream, Blob, URL หรือรูปแบบอื่น
* มี server-side cache อยู่แล้วหรือไม่
* API base URL ถูกกำหนดไว้ที่ไหน
* frontend มี API abstraction pattern แบบใด

จากนั้นให้ Frontend ใช้ API contract จริงของ project

ถ้า API implementation กับ docs ไม่ตรงกัน ให้ยึด **implementation จริงของ project** และรายงานความแตกต่างในสรุปท้ายงาน

---

# 4. เปลี่ยน PronunciationButton ให้ใช้ Server-side TTS

เป้าหมายหลักคือ:

```text
User กดปุ่มออกเสียง
        ↓
Frontend request ไป Server TTS
        ↓
POST /api/v1/tts/synthesize
        ↓
Backend สร้างหรือดึงเสียงจาก cache
        ↓
Frontend รับ Audio
        ↓
เล่นเสียง
```

Server-side TTS ต้องเป็น **Primary Engine**

อย่าใช้:

```ts
window.speechSynthesis
```

เป็นระบบหลักอีกต่อไป

---

# 5. State Management

ออกแบบ state ของ `PronunciationButton` ให้รองรับอย่างน้อย:

```text
idle
loading
playing
error
```

พฤติกรรมที่ต้องการ:

### idle

แสดงปุ่ม Speaker ตาม UI เดิม

### loading

เมื่อกำลัง request TTS:

* แสดงสถานะกำลังโหลดอย่าง subtle
* disable การกดซ้ำ
* UI ห้ามกระโดด
* ห้ามสร้าง animation รบกวนผู้ใช้

### playing

เมื่อเสียงกำลังเล่น:

* แสดง feedback ว่ากำลังอ่าน
* ป้องกัน audio ซ้อนกันแบบผิดพลาด

### error

หาก Server TTS ใช้ไม่ได้:

* UI ห้าม crash
* handle error อย่างเหมาะสม
* สามารถแจ้งผู้ใช้แบบ unobtrusive
* reset กลับสู่สถานะที่สามารถลองใหม่ได้

---

# 6. Zero-Crash Behavior

Feature นี้ต้องออกแบบให้ **fail gracefully**

ต้อง handle อย่างน้อย:

* Network error
* Backend unavailable
* HTTP non-2xx
* invalid audio response
* empty response
* audio decode/playback failure
* browser autoplay restriction
* component unmount ระหว่าง request
* user กดซ้ำเร็ว ๆ
* user เปลี่ยนคำระหว่างกำลังโหลด
* user กดคำอื่นขณะที่เสียงก่อนหน้ายังเล่น
* request timeout / aborted request ถ้า architecture รองรับ

ไม่ว่าจะเกิด error แบบใด:

```text
หน้าเว็บต้องไม่ crash
```

และต้องไม่มี:

```text
Unhandled Promise Rejection
```

---

# 7. Audio Lifecycle

จัดการ Audio lifecycle ให้ถูกต้อง

ถ้า response เป็น Blob และใช้:

```ts
URL.createObjectURL(...)
```

ต้อง cleanup ด้วย:

```ts
URL.revokeObjectURL(...)
```

เมื่อไม่ใช้งานแล้ว

รวมถึง:

* pause/stop audio เดิมเมื่อเหมาะสม
* cleanup เมื่อ component unmount
* remove event listener
* ป้องกัน memory leak
* ป้องกัน stale request เล่นเสียงของคำเก่าหลังจาก user เปลี่ยนคำไปแล้ว

อย่าสร้าง `Audio` object ใหม่ซ้ำโดยไม่มี cleanup

---

# 8. Concurrent Playback

ตรวจสอบ UX เมื่อมี PronunciationButton หลายอันใน Search Results

ตัวอย่าง:

```text
ผลลัพธ์คำที่ 1 🔊
ผลลัพธ์คำที่ 2 🔊
ผลลัพธ์คำที่ 3 🔊
```

ถ้าผู้ใช้กดคำที่ 1 แล้วกดคำที่ 2:

ควรหลีกเลี่ยงการปล่อยเสียงหลายชุดเล่นทับกันจน UX เสีย

เลือก implementation ที่เหมาะสมกับ architecture ของ project เช่น:

* stop audio ปัจจุบันก่อนเล่น audio ใหม่
* shared audio controller
* centralized playback state

แต่ **อย่า over-engineer**

ให้เลือกแนวทางที่เรียบง่ายและเข้ากับ architecture ปัจจุบันที่สุด

---

# 9. Browser SpeechSynthesis Fallback

จาก docs ระบบเดิมใช้:

```ts
window.speechSynthesis
```

สามารถเก็บไว้เป็น **optional fallback** ได้ถ้าเห็นว่าเหมาะสม

แต่ลำดับต้องเป็น:

```text
Server-side TTS
       ↓
ถ้าล้มเหลว
       ↓
Optional browser speechSynthesis fallback
```

ไม่ใช่:

```text
speechSynthesis ก่อน
```

ถ้าเก็บ fallback ไว้:

* ตรวจสอบ feature support ก่อนใช้
* ใช้ `lang = "th-TH"` ตามความเหมาะสม
* fallback failure ต้องไม่ทำให้ระบบ crash
* อย่าซ่อน Server error แบบทำให้ debugging ยาก

ถ้า project architecture หรือ requirements ไม่เหมาะกับ fallback สามารถไม่ใช้ได้ แต่ให้อธิบายในสรุป

---

# 10. API Layer

อย่าเขียน `fetch()` กระจัดกระจายถ้า project มี API abstraction อยู่แล้ว

ตรวจสอบ pattern เดิมก่อน เช่น:

```text
src/lib/api
src/services
src/api
hooks
fetcher
axios instance
API_BASE_URL
```

แล้ว implement ให้สอดคล้องกับ project

ถ้าจำเป็นต้องเพิ่ม abstraction ใหม่ ให้สร้างเฉพาะที่สมเหตุสมผล เช่น:

```text
tts-service.ts
tts-client.ts
useTTS.ts
```

แต่ไม่จำเป็นต้องสร้างหลาย layer หาก feature มีขนาดเล็ก

เน้น:

```text
simple
typed
maintainable
consistent with existing project
```

---

# 11. TypeScript

ห้ามแก้ด้วย:

```ts
any
```

แบบไม่จำเป็น

เพิ่ม TypeScript types ที่เหมาะสมสำหรับ:

* TTS request
* TTS error
* playback state
* API response ถ้ามี structured metadata

ต้องไม่มี TypeScript error ใหม่

---

# 12. UI / Design

**ห้าม redesign หน้าเว็บ**

รักษา design ของ THAI CONTEXT ปัจจุบันทั้งหมด

โดยเฉพาะ:

* typography
* spacing
* icon style
* color
* liquid/glass UI
* hover
* transition
* responsive
* card dimensions

แก้เฉพาะพฤติกรรมที่จำเป็นสำหรับ TTS

Loading / Playing state ต้อง:

* subtle
* smooth
* ไม่ flashy
* ไม่ดู AI-generated
* ไม่ทำ layout shift

ถ้ามี animation เดิมอยู่แล้ว ให้ reuse style เดิม

---

# 13. Accessibility

ปุ่มออกเสียงต้องใช้งานได้ด้วย Keyboard

ตรวจสอบ:

```text
button semantics
aria-label
disabled / aria-disabled
focus state
screen reader feedback
```

ตัวอย่าง intent:

```text
ฟังการออกเสียงคำว่า "..."
กำลังสร้างเสียง...
กำลังเล่นเสียง...
ไม่สามารถเล่นเสียงได้
```

แต่เลือกข้อความและ implementation ให้เข้ากับ architecture/UI เดิม

อย่าใช้ `<div onClick>` ถ้าสามารถใช้ `<button>` ได้

---

# 14. Mobile

Feature นี้ทำขึ้นเพื่อแก้ pain point ของ Browser Speech Synthesis โดยเฉพาะ

จึงต้องตรวจสอบ Mobile behavior อย่างจริงจัง:

* responsive UI
* touch target
* audio playback
* request
* loading
* repeated tapping
* Safari/iOS behavior เท่าที่สามารถตรวจสอบได้จาก implementation
* Chrome/Android

ห้าม implement solution ที่พึ่ง Desktop-only API

---

# 15. Performance

TTS endpoint มี server-side cache ตาม docs

Frontend ไม่จำเป็นต้อง duplicate caching แบบซับซ้อนโดยไม่มีเหตุผล

แต่สามารถ reuse Audio URL / Blob แบบ session-level ได้ถ้าพบว่าจำเป็นและไม่ทำให้ architecture ซับซ้อน

Priority คือ:

```text
Correctness > Stability > UX > Optimization
```

---

# 16. Security / Input

อย่าส่งข้อมูลที่ไม่จำเป็นไป TTS API

sanitize/validate ตาม API contract เท่าที่จำเป็น

ห้าม:

* inject HTML
* eval
* dangerouslySetInnerHTML
* expose secrets
* hardcode private API keys

API base URL ต้องใช้ config/env pattern ที่ project ใช้อยู่

---

# 17. ห้ามแก้ส่วนอื่นโดยไม่จำเป็น

อย่า refactor ใหญ่ทั้ง project

อย่า redesign component อื่น

อย่าเปลี่ยน:

* Search state machine
* cinematic transition
* Search Results architecture
* Evidence Drawer
* Comparator
* Evolution Explorer
* Dialect Explorer

เว้นแต่จำเป็นโดยตรงสำหรับ TTS integration

ถ้าจำเป็นต้องแก้ component อื่น ให้แก้ให้น้อยที่สุด

---

# 18. ตรวจสอบ Feature เดิม

หลัง implement แล้วต้องตรวจสอบว่า:

```text
Search
Search Results
Word Result Card
Evidence Drawer
Responsive layout
Animations
Navbar
Persistent Search
```

ยังทำงานตามเดิม

TTS feature ต้องไม่สร้าง regression

---

# 19. Testing

หลังแก้โค้ดให้รันคำสั่งที่ project รองรับ เช่น:

```bash
npm run lint
npm run typecheck
npm run build
```

หรือ equivalent package manager / scripts ที่มีจริงใน project

อย่าเดาคำสั่ง ให้ดู `package.json`

แก้ error ที่เกิดจากงานนี้ให้ครบ

---

# 20. ทดสอบ Runtime จริง

ถ้า environment รองรับ browser testing ให้รัน project และทดสอบ flow จริง

Test อย่างน้อย:

### Case 1

กดออกเสียงคำหนึ่ง

```text
idle
→ loading
→ playing
→ idle
```

### Case 2

กดปุ่มซ้ำระหว่าง loading

ต้องไม่ยิง request ซ้ำแบบ uncontrolled

### Case 3

กดคำใหม่ระหว่างคำเก่ากำลังเล่น

ต้องจัดการ audio เดิมอย่างถูกต้อง

### Case 4

TTS API ล้ม

หน้าเว็บต้องไม่ crash

### Case 5

Backend ตอบ non-2xx

แสดง error/fallback อย่างเหมาะสม

### Case 6

audio.play() reject

handle error

### Case 7

Component unmount ระหว่าง request/play

ไม่มี memory leak หรือ console error

### Case 8

Mobile viewport

ปุ่มต้องกดง่ายและ layout ไม่แตก

---

# 21. Console

หลังทดสอบแล้วตรวจสอบ:

```text
Browser Console
Terminal
Network
```

ต้องไม่มี error ใหม่ เช่น:

```text
Unhandled Promise Rejection
Object URL leak
React state update after unmount
Hydration error
TypeError
Audio playback race condition
```

---

# 22. Definition of Done

งานถือว่าเสร็จเมื่อ:

* `PronunciationButton` ใช้ Server-side TTS เป็น primary engine
* เชื่อม `POST /api/v1/tts/synthesize` ตาม Backend contract จริง
* รับและเล่นเสียงจาก Server ได้
* มี idle / loading / playing / error state
* ป้องกัน repeated request ที่ไม่จำเป็น
* ป้องกัน overlapping audio ที่สร้าง UX แย่
* cleanup Audio / Object URL ถูกต้อง
* error ทุกกรณีไม่ทำให้เว็บ crash
* ทำงานบน Mobile-friendly architecture
* Accessibility ของปุ่มเหมาะสม
* UI เดิมไม่ถูก redesign
* Search flow เดิมไม่พัง
* TypeScript ไม่มี error ใหม่
* lint/build ผ่าน
* ไม่มี runtime error ใหม่

---

# 23. วิธีทำงาน

ให้ทำงานตามลำดับนี้:

```text
1. อ่าน docs
2. วิเคราะห์ frontend architecture
3. วิเคราะห์ PronunciationButton ปัจจุบัน
4. ค้นหา speechSynthesis usage ทั้ง project
5. วิเคราะห์ Backend TTS endpoint และ schema จริง
6. วิเคราะห์ API abstraction ปัจจุบัน
7. วาง implementation plan ภายใน
8. Implement Server-side TTS
9. เพิ่ม loading / playing / error handling
10. เพิ่ม audio lifecycle cleanup
11. ตรวจสอบ concurrency
12. ตรวจสอบ accessibility
13. Run lint/typecheck/build
14. Run project
15. ทดสอบ runtime
16. แก้ปัญหาที่พบ
17. ตรวจ diff สุดท้าย
```

ไม่ต้องหยุดถามผมระหว่างทางหากสามารถอนุมานได้จาก source code และ documentation

ให้ตัดสินใจจาก architecture จริงของ project

**Do not redesign. Do not over-engineer. Do not mock API if real implementation already exists.**

---

# 24. เมื่อทำเสร็จ ให้สรุป

รายงานกลับมาแบบกระชับแต่ละเอียด:

### Files Changed

บอกไฟล์ที่สร้าง / แก้

### Architecture

อธิบาย TTS flow หลังแก้:

```text
PronunciationButton
→ Frontend TTS client
→ POST /api/v1/tts/synthesize
→ Audio response
→ Browser Audio playback
```

ปรับตาม implementation จริง

### Backend Contract

บอก request/response schema ที่ตรวจพบจริง

### Error Handling

บอกว่ารองรับกรณีไหนบ้าง

### Fallback

บอกว่าเก็บ `speechSynthesis` fallback หรือไม่ และเพราะอะไร

### Testing

บอกคำสั่งที่รันและผลลัพธ์

### Runtime Verification

บอก scenarios ที่ทดสอบจริง

### Remaining Issues

ถ้ามีข้อจำกัดจาก Backend หรือ infrastructure ที่ยังแก้ไม่ได้ ให้ระบุอย่างตรงไปตรงมา

สุดท้ายตรวจ `git diff` อีกครั้งเพื่อให้แน่ใจว่าไม่มีการแก้ไฟล์ที่ไม่เกี่ยวข้องกับ Feature นี้
