# THAI CONTEXT — Database Design & Schema Architecture

## 1. Database Principles

PostgreSQL 16 พร้อมส่วนขยาย `vector` (pgvector) และ `pg_trgm` (Trigram similarity) ทำหน้าที่เป็น Single Source of Truth สำหรับคลังพจนานุกรมและเวกเตอร์ความหมาย

### การแบ่งประเภทข้อมูล 4 ชั้น (Data Categorization):
1. **Official Data:** ข้อมูลทางการจากราชบัณฑิตยสภาและสถาบันภาษา (ห้าม AI แก้ไข)
2. **AI Generated Data:** คำอธิบายบริบท, การเปรียบเทียบคำ, และคำแนะนำการใช้
3. **AI Inferred Data:** ความสัมพันธ์ระหว่างคำ หรือการจับคู่ภาษาถิ่นที่ AI อนุมานขึ้น (`AI_INFERRED`)
4. **Search Data:** เวกเตอร์ความหมาย (`vector(1536)`), ข้อความสำหรับการค้นหาแบบ Dense & Sparse

---

## 2. Table Catalog

| Table Name | Category | Purpose |
| :--- | :--- | :--- |
| `dictionary_sources` | Official | แหล่งข้อมูลพจนานุกรม เช่น สำนักงานราชบัณฑิตยสภา |
| `dictionary_editions` | Official | ฉบับพิมพ์ เช่น พ.ศ. 2542, 2554, 2569, DIALECT |
| `parts_of_speech` | Official | ชนิดของคำ (น., ก., ว., ส., บ., สั.) |
| `words` | Official | รูปคำศัพท์หลัก (Headword) และรูปคำทำความสะอาด |
| `word_entries` | Official | รายการคำศัพท์ประจำแต่ละฉบับ (คำอ่าน, เลขหน้า) |
| `definitions` | Official | นิยามความหมายทางการ, ระดับภาษา, สาขาวิชา |
| `examples` | Official | ประโยคตัวอย่างการใช้จากพจนานุกรม |
| `dialect_regions` | Official | ภาคภาษาถิ่น (เหนือ, อีสาน, ใต้, กลาง) |
| `dialect_entries` | Official | คำศัพท์ภาษาถิ่น ความหมายท้องถิ่น สัทอักษร |
| `semantic_mappings` | Hybrid | ความสัมพันธ์คำมาตรฐาน ↔ ภาษาถิ่น (`OFFICIAL_DATA` / `AI_INFERRED`) |
| `word_relationships` | Hybrid | คำไวพจน์, คำตรงข้าม (`SYNONYM`, `ANTONYM`, `NEAR_SYNONYM`) |
| `search_embeddings` | Search | เวกเตอร์ Dense Vector สำหรับ Semantic Search (`vector(1536)`) |
| `ai_explanations` | AI Generated | บันทึกคำอธิบายที่ AI สังเคราะห์ |
| `rag_evidence` | Audit / RAG | หลักฐานพจนานุกรมที่ถูกอ้างอิงในการตอบ |
| `search_feedback` | Analytics | บันทึก Feedback และพฤติกรรมผู้ใช้เพื่อการปรับปรุงระบบ |

---

## 3. Multi-Edition Evolution Design

ระบบเก็บ `word_entries` แยกตาม `edition_id` เพื่อรองรับการเปรียบเทียบการเปลี่ยนแปลงของนิยาม เช่น:

```text
คำ: "ประสิทธิภาพ"
├── 2542: "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการทำงาน"
├── 2554: "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด"
└── 2569: "ความสามารถในการปฏิบัติการที่ให้ผลลัพธ์สูงสุดโดยสูญเสียทรัพยากร พลังงาน หรือเวลาน้อยที่สุด..."
```

สถานะการเปลี่ยนแปลงคำศัพท์ข้ามฉบับ:
- `ADDED`: คำที่เพิ่งได้รับการบรรจุในฉบับนั้น
- `CHANGED`: คำที่มีการปรับแก้นิยามความหมาย
- `UNCHANGED`: คำที่นิยามคงเดิมไม่เปลี่ยนแปลง
- `NO_DATA`: คำที่ไม่ปรากฏในฉบับดังกล่าว
