# THAI CONTEXT — AI & NLP Pipeline Documentation

เอกสารอธิบายสถาปัตยกรรม Pipeline ของระบบปัญญาประดิษฐ์ (AI), การประมวลผลภาษาธรรมชาติ (NLP), และระบบค้นคืนข้อมูลเชิงความหมาย (Semantic Retrieval) สำหรับ THAI CONTEXT

---

## 1. ผังการทำงานของ AI Pipeline (Pipeline Architecture)

```text
ข้อความนำเข้าจากผู้ใช้ (Natural Language Query)
  │
  ▼
[1. การตัดคำและการปรับรูปอักขระ (PyThaiNLP Tokenization & Normalization)]
  • ปรับสระและวรรณยุกต์ให้เป็นรูปมาตรฐาน (Unicode Thai Normalization)
  • ตัดคำด้วยเอนจิน newmm ของ PyThaiNLP
  │
  ▼
[2. การถอดรหัสความต้องการ (Query Understanding & Intent Parsing)]
  • วิเคราะห์ Intent (ค้นหาคำ, เปรียบเทียบคำ, ค้นหาคำถิ่น)
  • สกัดแก่นความหมายหลัก (Core Meaning) และบริบท (Context)
  • สกัดข้อจำกัดเชิงปฏิเสธ (Negative Constraints / Excluded Terms เช่น "ไม่เอาคำว่าเร็ว")
  │
  ▼
[3. การค้นคืนข้อมูลแบบลูกผสม (Hybrid Retrieval Engine)]
  ┌─────────────────────────────────┴─────────────────────────────────┐
  ▼                                                                   ▼
[Exact & Keyword Retrieval]                         [Dense Vector Semantic Search]
• ค้นหาแม่คำและคำสำคัญตรงตัว                          • เข้ารหัสประโยคเป็น Dense Vector (1536-dim)
• อาศัยดัชนี B-Tree & Trigram GIN บน PostgreSQL       • ค้นหาด้วย Cosine Distance ผ่าน pgvector (HNSW)
  └─────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    ▼
[4. การจัดอันดับตามบริบท (Context-Aware Multi-Factor Re-ranking)]
  • กรองคำที่ติดเงื่อนไข Excluded Terms ออกทันที
  • คำนวณคะแนนรวมตามสูตรถ่วงน้ำหนัก:
      Score = (0.60 * Semantic) + (0.20 * Keyword) + (0.15 * Context) + (0.05 * Evidence)
  • สร้างคำอธิบายเหตุผลภาษาธรรมชาติ (Recommendation Reasoning) กำกับทุกคำ
  │
  ▼
[5. รั้วกั้นความปลอดภัยและป้องกันการมโน (Hallucination Guardrail Check)]
  • ตรวจสอบว่ามีหลักฐานในพจนานุกรมรองรับหรือไม่ (Evidence count > 0)
  • ตรวจสอบว่าคะแนนความเกี่ยวข้องผ่านเกณฑ์ขั้นต่ำหรือไม่ (Max Relevance >= 0.65)
  • หากไม่ผ่านเกณฑ์: ทำ Safe Abstention คืนข้อความปฏิเสธอย่างปลอดภัย
  │
  ▼
[6. การสังเคราะห์คำตอบที่มีหลักฐานกำกับ (Grounded RAG Generation)]
  • ควบคุม Context ให้อ้างอิงเฉพาะหลักฐานพจนานุกรมที่สืบค้นได้เท่านั้น
  • แยกชั้นข้อมูลชัดเจนระหว่าง ข้อมูลทางการ (Official), AI Generated, และ AI Inferred
  • แนบการ์ดอ้างอิงชื่อพจนานุกรม ปีพิมพ์ และข้อความนิยามต้นฉบับ
```

---

## 2. ฟีเจอร์ AI ทั้ง 8 รายการในระบบปัจจุบัน (8 AI-Powered Features)

1. **Meaning-first Search**: ค้นพบคำศัพท์จากคำบรรยายความหมายหรือเจตนา โดยไม่ต้องทราบตัวคำศัพท์ล่วงหน้า
2. **Natural Language Query Understanding**: ถอดรหัสคำค้นที่ซับซ้อน แยกบริบท และคัดแยกคำที่ผู้ใช้ต้องการหลีกเลี่ยง
3. **Hybrid Retrieval**: ผสานการค้นหาคำสำคัญตรงตัวและเวกเตอร์ความหมายบนฐานข้อมูลกว่า 29,600 เวกเตอร์
4. **Context-Aware Re-ranking & Explainability**: จัดอันดับคำให้เข้ากับระดับภาษาและกลุ่มผู้รับสาร พร้อมอธิบายเหตุผล
5. **Semantic Word Comparison**: เปรียบเทียบความแตกต่างของคำใกล้เคียง แยก 3 มิติ (ความหมาย, บริบท, และไกด์ไลน์การใช้)
6. **Grounded RAG Assistant**: ตอบคำถามเกี่ยวกับการใช้ภาษาโดยมีพจนานุกรมกำกับคำตอบ
7. **Hallucination Guardrail**: รั้วกั้นป้องกัน AI สร้างข้อมูลเท็จ คืนคำตอบปฏิเสธอย่างปลอดภัยเมื่อไม่มีหลักฐาน
8. **AI-Inferred Dialect Tagging**: กำกับระดับความเชื่อมั่นในการจับคู่คำภาษากลางและภาษาถิ่น

---

## 3. สถาปัตยกรรมโมเดลแบบเสียบต่อได้ (Pluggable Model Architecture)

ระบบถูกออกแบบให้รองรับโมเดลได้หลากหลายผ่าน Interface เดียวกัน:

### 3.1 Embedding Providers
- **Local Deterministic Encoder (ค่าเริ่มต้น - สำหรับ Offline / Hackathon)**:
  - สร้างเวกเตอร์ 1,536 มิติแบบ L2-Normalized โดยอาศัย FNV-1a Hashing ร่วมกับ Character N-grams
  - รันได้รวดเร็ว (1,400+ รายการ/วินาที) โดยไม่ต้องต่ออินเทอร์เน็ตหรือใช้ API Key
- **Google Gemini Embedding**:
  - โมเดล `text-embedding-004` (เพียงระบุ `GEMINI_API_KEY` ใน `.env`)
- **OpenAI Embedding**:
  - โมเดล `text-embedding-3-small` (1,536 มิติ)

### 3.2 LLM Providers
- **Local Grounded Template Synthesizer (ค่าเริ่มต้น)**:
  - สังเคราะห์คำตอบตามโครงสร้าง Template ภาษาไทยที่เข้มงวด ปลอดภัย ไร้ Hallucination 100%
- **Google Gemini LLM**:
  - โมเดล `gemini-1.5-flash` สำหรับการอธิบายความแตกต่างและการตอบคำถามที่สละสลวย
- **OpenAI LLM**:
  - โมเดล `gpt-4o-mini`
