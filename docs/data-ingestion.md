# THAI CONTEXT — Data Ingestion Pipeline

## 1. Supported Formats
- **JSON**: Full hierarchical dataset (sources, editions, words, entries, definitions, examples, dialects, relationships)
- **JSONL**: Streaming entries (e.g. Kaikki/Wiktionary dumps)
- **CSV**: Flat tabular dictionary format (`headword,definition,pos,edition`)

---

## 2. Seed Dataset
- Location: `data/seed/demo_dictionary.json`
- Generator: `python3 data/seed/generate_demo_data.py`
- Ingestion command:
  ```bash
  npm run seed
  ```
  หรือ
  ```bash
  python -m app.scripts.import_data --file data/seed/demo_dictionary.json
  ```

---

## 3. Adding Official Competition Datasets
เมื่อได้รับไฟล์ข้อมูลการแข่งขัน (ฉบับ 2542, 2554, 2569, ภาษาถิ่น):
1. วางไฟล์ลงใน `data/raw/`
2. รันสคริปต์ Import หรือ Prisma Seed
3. เวกเตอร์ความหมายจะถูกสร้างลงตาราง `search_embeddings` โดยไม่กระทบสถาปัตยกรรมหลัก
