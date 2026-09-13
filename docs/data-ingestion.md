# THAI CONTEXT — Data Ingestion Pipeline

เอกสารอธิบายกระบวนการนำเข้าข้อมูลพจนานุกรม สถิติคลังข้อมูล และคำสั่งสำหรับประมวลผลข้อมูลขนาดใหญ่เข้าสู่ระบบ THAI CONTEXT

---

## 1. ข้อมูลสถิติของคลังข้อมูลปัจจุบัน (Ingestion Statistics)

ระบบได้ทำการสกัดและนำเข้าคลังข้อมูลภาษาไทยจริงจาก `data/raw/raw-wiktextract-data.json` (1.62 GB) และ Seed Data ฉบับราชบัณฑิตยสถาน 3 ยุคสมัย:

| หมวดหมู่ข้อมูล | จำนวนระเบียนในฐานข้อมูล | คำอธิบาย |
|---|---|---|
| **แม่คำ (Words)** | **29,544 คำ** | คำศัพท์ภาษาไทยที่มีนิยามความหมายอย่างเป็นทางการ |
| **รายการความหมาย (Definitions)** | **36,398 รายการ** | ความหมายทางการ แยกตามลำดับ Sense และชนิดของคำ (POS) |
| **เวกเตอร์ความหมาย (Embeddings)** | **29,612 เวกเตอร์** | เวกเตอร์ 1,536 มิติ สำหรับ Semantic Search พร้อมดัชนี HNSW |
| **คลังคำภาษาถิ่น (Dialect Entries)** | **84 รายการ** | คำศัพท์ถิ่นเหนือ (16 คำ), ถิ่นอีสาน (57 คำ), และถิ่นใต้ (11 คำ) |
| **ความสัมพันธ์ของคำ (Relationships)** | **18 คู่คำ** | คำพ้อง (Synonyms), คำตรงข้าม (Antonyms), และคำใกล้เคียง |
| **การเชื่อมโยงคำถิ่น (Dialect Mappings)** | **12 คู่คำ** | แผนผังคำภาษากลางเทียบเคียงคำภาษาถิ่นพร้อม Confidence Score |

---

## 2. รูปแบบไฟล์ที่ระบบรองรับ (Supported Formats)

1. **JSON Lines (`.jsonl`, `.json` แบบ Streaming)**:
   - เหมาะสำหรับคลังข้อมูลขนาดใหญ่ เช่น Kaikki/Wiktionary dumps
   - ประมวลผลแบบ Stream ทีละบรรทัด ไม่ทำให้ Memory ล้น
2. **Hierarchical JSON (`.json`)**:
   - เหมาะสำหรับ Master Seed พจนานุกรมฉบับสมบูรณ์ (Sources, Editions, Words, Definitions, Dialects, Relationships)
3. **Flat Tabular (`.csv`)**:
   - เหมาะสำหรับ Dataset ภายนอกหรือตารางศัพท์เฉพาะทาง (`headword,definition,pos,edition`)

---

## 3. สคริปต์การนำเข้าข้อมูล (Ingestion Scripts)

### 3.1 สคริปต์สกัด Wiktextract Dataset ขนาดใหญ่
ไฟล์: `apps/ai-service/app/scripts/import_wiktextract.py`

**ความสามารถ:**
- กรองเฉพาะภาษาไทย (`lang_code == 'th'`)
- สกัดและแปลงชนิดของคำ (POS) เป็นมาตรฐานกลาง (N, V, ADJ, ADV, PREP, CONJ, PRON, INTERJ)
- ดึงสัทอักษร (Phoneme/IPA) และการถอดอักษรโรมัน (Royal Institute Romanization)
- ตรวจจับคำภาษาถิ่น (เหนือ, อีสาน, ใต้) และลงทะเบียนใน `dialect_entries`
- ประมวลผลแบบ Batch Insert (500 รายการ/รอบ) ร่วมกับ Upsert ป้องกันข้อมูลซ้ำซ้อน
- สร้างเวกเตอร์ 1,536 มิติแบบ Deterministic Semantic Vector ลงตาราง `search_embeddings` โดยตรง

**คำสั่งรันผ่าน Docker:**
```bash
# นำเข้าคำศัพท์ทั้งหมดจาก raw-wiktextract-data.json
docker compose exec ai-service python -m app.scripts.import_wiktextract --limit 0 --batch-size 500

# ทดสอบนำเข้าเพียง 1,000 คำแรก
docker compose exec ai-service python -m app.scripts.import_wiktextract --limit 1000 --batch-size 100
```

### 3.2 สคริปต์ Master Demo Seed (Prisma)
ไฟล์: `apps/api/prisma/seed.ts`
- อ่านชุดข้อมูลจาก `data/seed/demo_dictionary.json`
- บันทึกพจนานุกรมราชบัณฑิตยสภา 3 ฉบับ (พ.ศ. 2542, 2554, 2569) และพจนานุกรม 4 ภาค
- จำลองการเปลี่ยนแปลงความหมายข้ามยุคสมัย (Evolution & Change Detection)

**คำสั่งรัน:**
```bash
docker compose exec api npx ts-node prisma/seed.ts
```

---

## 4. การนำเข้าชุดข้อมูลการแข่งขันเพิ่มเติม (Competition Dataset Ingestion)

เมื่อได้รับไฟล์ข้อมูลอย่างเป็นทางการจากผู้จัดการแข่งขัน:
1. นำไฟล์มาวางในไดเรกทอรี `data/raw/` (ซึ่งได้รับการป้องกันใน `.gitignore` เรียบร้อยแล้ว)
2. รันสคริปต์นำเข้าตามรูปแบบไฟล์:
   ```bash
   # หากเป็นไฟล์ JSON หรือ CSV ทั่วไป
   docker compose exec ai-service python -m app.scripts.import_data --file /app/data/raw/competition_dict.json
   ```
3. เวกเตอร์ความหมายและดัชนี HNSW จะถูกสร้างและอัปเดตลงตาราง `search_embeddings` โดยอัตโนมัติ
