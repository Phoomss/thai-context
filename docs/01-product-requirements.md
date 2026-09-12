# 🇹🇭 THAI CONTEXT — Product Requirements Document (PRD)
> **"ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน"**  
> *Semantic Thai Language Exploration Platform for Contextual Word Discovery, Lexical Evolution & Grounded AI*

---

## 📌 Document Information
- **Project:** THAI CONTEXT (ไทย คอนเท็กซ์)
- **Document:** Module 01 — Product Requirements Document (PRD & Functional Specifications)
- **Version:** `1.0.0 (Release Candidate)`
- **Core Principle:** *"เราไม่ได้สร้างพจนานุกรมใหม่ แต่เราออกแบบวิธีใหม่ในการเข้าถึง เข้าใจ เปรียบเทียบ และเชื่อมโยงคลังคำภาษาไทย"*

---

## 1. Product Concept & Problem Statement

### 1.1 The Core Problem (ข้อจำกัดเดิม)
พจนานุกรมแบบดั้งเดิม (Traditional Dictionary) มีข้อจำกัดเชิงโครงสร้างคือ **"ต้องรู้คำศัพท์ก่อน ถึงจะเปิดหาความหมายได้" (Keyword-first constraint)** แต่ในชีวิตจริง ผู้ใช้งาน (นักเขียน, นักวิชาการ, คอนเทนต์ครีเอเตอร์, นักเรียน/นักศึกษา หรือประชาชนทั่วไป) มักเผชิญกับสถานการณ์:
1. **Tip-of-the-tongue phenomenon:** นึกความหมายได้ นึกบริบทออก แต่อึกอักนึกคำศัพท์ไม่ออก
2. **Context mismatch:** รู้จักคำพื้นฐาน แต่อยากได้คำที่เป็นทางการ สละสลวย หรือตรงกับกาลเทศะ
3. **Evolution opacity:** ไม่เห็นการเปลี่ยนแปลงของความหมายและสถานะคำตามยุคสมัย (2542 → 2554 → 2569)
4. **AI Hallucination in Thai:** LLM ทั่วไปมักแต่งคำแปลหรืออธิบายความหมายภาษาไทยผิดเพี้ยน ขาดหลักฐานอ้างอิงทางภาษาศาสตร์ที่เป็นทางการ

### 1.2 The Solution: THAI CONTEXT
**THAI CONTEXT** เปลี่ยนรูปแบบการใช้งานจาก **"Keyword-First"** สู่ **"Meaning-First & Context-First"** โดยนำข้อมูลคลังพจนานุกรมราชบัณฑิตยสถานทั้ง 3 ยุคสมัย (พ.ศ. 2542, 2554, 2569) และพจนานุกรมภาษาถิ่น มาผ่านกระบวนการทำ Semantic Indexing ด้วย Vector Database ร่วมกับระบบ **Grounded RAG (Retrieval-Augmented Generation)** ที่มีหลักฐานอ้างอิงชัดเจน (Evidence-backed)

---

## 2. 4 Core Innovation Pillars (4 เสาหลักนวัตกรรม)

| Pillar | เสาหลักนวัตกรรม | คำอธิบายคุณค่า (Value Proposition) |
| :---: | :--- | :--- |
| **01** | **Search by Meaning** | **ไม่ต้องรู้คำ ก็ค้นพบคำได้** — ค้นหาด้วยความหมายหรือคำบรรยายสถานการณ์ ระบบถอดรหัสเจตนาด้วย Vector Embeddings |
| **02** | **Search by Context** | **แนะนำคำที่เหมาะกับบริบท** — คัดกรองคำตามระดับภาษา (Register), โทน (Tone), และความเหมาะสมของสถานการณ์ |
| **03** | **Explore Language Evolution & Dialect** | **เห็นพลวัตของภาษาไทย** — ติดตามการเกิดใหม่ ความหมายที่เปลี่ยน และการคงอยู่ของคำจาก 2542 → 2554 → 2569 พร้อมสะพานเชื่อมสู่ภาษาถิ่น |
| **04** | **Trusted & Grounded AI** | **AI ไม่แทนที่พจนานุกรม แต่เป็นสะพานเชื่อม** — ทุกคำตอบถูกตรึง (Grounded) ด้วยข้อมูลจากราชบัณฑิตยสถาน พร้อมแสดง Citation ชัดเจน และปฏิเสธการตอบเมื่อไม่มีข้อมูล |

---

## 3. 8 Key Features Matrix

| # | Key Feature | จุดขายเด่น (Value Proposition) | Module | Priority |
| :---: | :--- | :--- | :---: | :---: |
| **01** | **Meaning-first Search** | ไม่รู้คำก็ค้นได้ เพียงบอกสิ่งที่ต้องการสื่อ | Module A | `P0 (Critical)` |
| **02** | **Semantic Search** | ค้นหาจากความหมายเชิงลึก (Concept/Essence) ไม่จำกัดที่ตัวอักษร | Module A | `P0 (Critical)` |
| **03** | **Context-aware Recommendation** | แนะนำคำที่เข้ากับบริบท กาลเทศะ และระดับภาษา | Module B | `P0 (Critical)` |
| **04** | **Dictionary Evolution** | เห็นวิวัฒนาการของคำข้ามกาลเวลา 2542 → 2554 → 2569 | Module C | `P0 (Critical)` |
| **05** | **Dictionary Change Detection** | ตรวจจับการเปลี่ยนแปลง (เพิ่ม/แก้/คงเดิม/ตัดออก) แบบ Semantic Diff | Module C | `P0 (Critical)` |
| **06** | **Dialect Explorer** | สำรวจความรุ่มรวยของภาษาถิ่นไทย (เหนือ, ใต้, อีสาน) เชื่อมสู่ภาษากลาง | Module D | `P0 (Critical)` |
| **07** | **Context Compare & Usage Guidance** | เปรียบเทียบความแตกต่างระหว่างคำใกล้เคียง พร้อมไกด์ไลน์การนำไปใช้ | Module E | `P0 (Critical)` |
| **08** | **Trusted AI + RAG + Evidence** | AI อธิบายกระจ่าง อ้างอิงเล่มและปีพิมพ์ ไร้การมโนข้อมูล | Module F | `P0 (Critical)` |

---

## 4. Detailed Functional Requirements (18 FRs)

### 🔎 Module A — Intelligent Search
- **FR-01: Keyword Search `[P1]`**  
  รองรับการค้นหาคำศัพท์ด้วย Keyword ทั้งคำเต็ม คำบางส่วน (Partial match) และคำสะกดผิด (Fuzzy match) ตอบสนองภายใน 150ms
- **FR-02: Meaning-first Search `[P0]`**  
  ผู้ใช้สามารถค้นหาคำศัพท์จากความหมาย ประโยค หรือเจตนาที่ต้องการสื่อ โดยไม่ต้องพิมพ์ตัวคำศัพท์เลย
- **FR-03: Semantic Search `[P0]`**  
  ระบบแปลงประโยคเป็น Dense Vector Embedding เพื่อหาคำที่มีความหมายใกล้เคียงผ่าน Cosine Distance บน `pgvector`
- **FR-04: Query Understanding `[P0]`**  
  ระบบวิเคราะห์แยกแยะ (1) เจตนาหลัก (2) บริบทแวดล้อม และ (3) Negative Constraints (คำหรือความหมายที่ต้องการหลีกเลี่ยง)

### 🎯 Module B — Context Recommendation
- **FR-05: Context-aware Recommendation `[P0]`**  
  จัดอันดับคำแนะนำโดยใช้น้ำหนักผสม: $\text{Semantic Similarity} + \text{Context Relevance} + \text{Dictionary Evidence}$
- **FR-06: Explain Recommendation `[P0]`**  
  แสดงคำอธิบายเหตุผลว่า "ทำไมถึงแนะนำคำนี้" พร้อมชี้แจงหลักฐานข้อความนิยามจากพจนานุกรมที่เป็นทางการ

### 📚 Module C — Dictionary Intelligence
- **FR-07: Word Detail `[P0]`**  
  แสดงโครงสร้างคำศัพท์ครบถ้วน: คำอ่าน, ชนิดของคำ (POS), นิยามตามลำดับข้อ, ตัวอย่างประโยค, และแหล่งอ้างอิง
- **FR-08: Multi-Version Dictionary `[P0]`**  
  จัดเก็บและรองรับพจนานุกรมราชบัณฑิตยสถาน 3 ฉบับ (2542, 2554, 2569) และพจนานุกรมภาษาถิ่น โดยแยกประวัติชัดเจน
- **FR-09: Dictionary Evolution `[P0]`**  
  แสดง Timeline การคงอยู่และการขยายความหมายของคำศัพท์จากปี 2542 $\rightarrow$ 2554 $\rightarrow$ 2569
- **FR-10: Dictionary Change Detection `[P0]`**  
  วิเคราะห์และระบุสถานะความเปลี่ยนแปลงระหว่างฉบับ: `🟢 Added`, `🟡 Modified`, `⚪ Unchanged`, `🔴 Deprecated`

### 🌏 Module D — Thai Language Exploration
- **FR-11: Dialect Explorer `[P0]`**  
  ค้นหาและสำรวจคำจากพจนานุกรมภาษาถิ่น (เหนือ, อีสาน, ใต้) พร้อมคำอ่านสำเนียงท้องถิ่นและบริบทวัฒนธรรม
- **FR-12: Standard ↔ Dialect Mapping `[P0]`**  
  เชื่อมโยงคู่คำระหว่างภาษากลางและภาษาถิ่น โดยระบุป้ายกำกับชัดเจนระหว่าง `OFFICIAL_DATA` กับ `AI_INFERRED`

### ⚖️ Module E — Compare & Usage
- **FR-13: Context Compare `[P0]`**  
  เปรียบเทียบคำที่มีความหมายใกล้เคียงกันแบบ Side-by-Side (เช่น "อนุมัติ" vs "เห็นชอบ", "ประสิทธิภาพ" vs "ประสิทธิผล")
- **FR-14: Usage Guidance `[P0]`**  
  แนะนำระดับภาษา (ทางการ, กึ่งทางการ, ปากเปล่า) และบริบทสถานการณ์ที่ควรใช้และไม่ควรใช้

### 🤖 Module F — Trusted AI
- **FR-15: RAG-based AI Assistant `[P0]`**  
  ผู้ช่วย AI ตอบคำถามโดยดึงข้อมูลนิยามจากพจนานุกรมที่สืบค้นได้ มาเป็น Context บังคับคำตอบ (Grounded Generation)
- **FR-16: Source & Evidence `[P0]`**  
  ทุกคำตอบของ AI ต้องแนบการ์ดระบุเล่มพจนานุกรม ปี พ.ศ. และข้อความนิยามต้นฉบับที่ใช้อ้างอิง
- **FR-17: Hallucination Guard `[P0]`**  
  หากผลการค้นหาไม่พบข้อมูลที่เพียงพอ หรือมีคะแนน Similarity ต่ำกว่าเกณฑ์ ระบบจะตอบปฏิเสธอย่างปลอดภัย (Abstention)

### 📊 Module G — Feedback
- **FR-18: Search Feedback `[P1]`**  
  เปิดให้ผู้ใช้กดประเมินผลลัพธ์ (👍 มีประโยชน์ / 👎 ไม่ตรงบริบท) เพื่อเก็บ Log นำมาปรับแต่ง Ranking Weights

---

## 5. Non-Functional Requirements (12 NFRs)

| ID | มิติ NFR | มาตรฐานและเกณฑ์การยอมรับ (Acceptance Criteria) |
| :--- | :--- | :--- |
| **NFR-01** | **Language Accuracy** | ข้อมูลคำนิยามต้องตรงกับชุดข้อมูลทางการ 100% ไร้การตัดทอนหรือบิดเบือน |
| **NFR-02** | **AI Grounding** | คำตอบของโมเดลต้องถูกควบคุม (Constrained) ให้อ้างอิงเฉพาะระเบียนพจนานุกรมที่ได้รับ |
| **NFR-03** | **Traceability** | ทุกการแสดงผลต้องสืบย้อนแหล่งที่มา (Source, Edition, Section) ได้เสมอ |
| **NFR-04** | **Anti-Hallucination** | มี Threshold Guard ปฏิเสธการตอบเมื่อหลักฐานไม่เพียงพอ |
| **NFR-05** | **Performance** | Search P95 < 250ms, LLM Streaming First Token (TTFT) < 800ms |
| **NFR-06** | **Usability** | ใช้งานได้ง่าย ผู้ใช้ทั่วไปค้นพบคำได้ภายใน 3 คลิก โดยไม่ต้องเข้าใจคำสั่ง Prompt |
| **NFR-07** | **Accessibility** | Responsive Design, รองรับ Thai Typography ที่อ่านง่าย, ได้มาตรฐาน WCAG 2.1 AA |
| **NFR-08** | **Scalability** | รองรับการเพิ่ม Dataset ฉบับใหม่ผ่าน Ingestion Pipeline โดยไม่ต้องแก้ Core Logic |
| **NFR-09** | **Maintainability** | ออกแบบโครงสร้างแบบ Modular Monolith แยกเลเยอร์ชัดเจน สะดวกต่อการพัฒนาและส่งมอบ |
| **NFR-10** | **Security** | ป้องกัน Prompt Injection, Input Sanitization ป้องกัน XSS/SQL Injection, จัดเก็บ API Key ใน Secret Manager |
| **NFR-11** | **Data Governance** | เคารพเงื่อนไขการใช้ข้อมูลของราชบัณฑิตยสถานและสถาบันภาษาถิ่นอย่างเคร่งครัด |
| **NFR-12** | **Extensibility** | โครงสร้างระบบพร้อมเปิดเป็น Thai Semantic Lexicon API สำหรับต่อยอดในอนาคต |
