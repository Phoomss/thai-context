# 📊 THAI CONTEXT — Presentation Diagram Packages & Technical Mappings
> **Module 08:** Hackathon Pitching Diagrams, Architecture Mappings & Demo Journey

---

## 1. Key Feature $\rightarrow$ Technical Architecture Mapping (Section 26)

### 1.1 Meaning-first Search Architecture Flow
```mermaid
flowchart TD
    MF1["User Meaning-first Query<br/>'อยากบอกว่าทำงานได้ผลดี คุ้มค่าทรัพยากร'"] --> MF2["Query Understanding & Intent Parsing<br/>(สกัด Intent, Context และ Negative Words)"]
    MF2 --> MF3["Thai Vector Embedding Generation<br/>(แปลงข้อความเป็น Dense Vector)"]
    MF3 --> MF4["Semantic Vector Search (pgvector)<br/>(คำนวณ Cosine Distance กับคำนิยาม)"]
    MF4 --> MF5["Context-aware Ranking Engine<br/>(Semantic + Context + Evidence Weight)"]
    MF5 --> MF6["Recommended Thai Words<br/>★ 'ประสิทธิภาพ' (94%) ★ 'ประสิทธิผล' (89%)"]
```

### 1.2 Dictionary Evolution Architecture Flow
```mermaid
flowchart TD
    EV1["Dictionary Editions<br/>(ฉบับ พ.ศ. 2542, 2554, 2569)"] --> EV2["Word Entries Matching<br/>(เชื่อมโยง word_id เดียวกันข้าม Edition)"]
    EV2 --> EV3["Definition Comparison Service<br/>(เปรียบเทียบนิยามความหมายข้อต่อข้อ)"]
    EV3 --> EV4["Semantic Change Detection Engine<br/>(ตรวจจับ: 🟢 Added, 🟡 Modified, ⚪ Unchanged, 🔴 Deprecated)"]
    EV4 --> EV5["Evolution Timeline & Diff UI<br/>(แสดงแถบกาลเวลาพร้อมคำอธิบายความเปลี่ยนแปลง)"]
```

### 1.3 Dialect Explorer Architecture Flow
```mermaid
flowchart TD
    DL1["Dialect Entries<br/>(คลังคำภาษาถิ่น เหนือ/อีสาน/ใต้)"] --> DL2["Semantic Mapping Table<br/>(เชื่อมโยงกับภาษากลาง Standard Thai)"]
    DL2 --> DL3["Regional Categorization<br/>(จำแนกตามภาค: ล้านนา, อีสาน, ปักษ์ใต้)"]
    DL3 --> DL4["Dialect Exploration UI<br/>(แผนที่ภาษาถิ่นแบบ Interactive พร้อมเสียงอ่านและบริบท)"]
```

### 1.4 Trusted AI & Grounded RAG Architecture Flow
```mermaid
flowchart TD
    AI1["User Inquiry / Writing Context"] --> AI2["Hybrid Retrieval Engine<br/>(ค้นหาคำศัพท์และนิยามที่เกี่ยวข้อง)"]
    AI2 --> AI3["Evidence Filtering & Abstention Guard<br/>(กรองเฉพาะข้อมูลที่มี Confidence สูง)"]
    AI3 --> AI4["Grounded RAG Prompt Assembly<br/>(แนบนิยามจริงจากราชบัณฑิตยสถานเป็น Context)"]
    AI4 --> AI5["LLM Synthesis (Streaming)<br/>(ประมวลผลคำตอบโดยอิงตามหลักฐานเท่านั้น)"]
    AI5 --> AI6["Answer + Evidence Citation Drawer<br/>(แสดงคำตอบพร้อมเปิดดูเล่มและหน้าที่มาได้จริง)"]
```

---

## 2. Official Data vs. AI-Generated Data Architecture (Section 27)

> [!IMPORTANT]
> **กำแพงแบ่งแยกข้อมูล (Strict Data Boundary):**  
> ข้อมูลที่สร้างจาก AI จะไม่มีวันเขียนทับข้อมูลจริงของพจนานุกรม และต้องติดป้ายกำกับแหล่งที่มาชัดเจนเสมอ

```mermaid
flowchart TD
    subgraph OFFICIAL ["🏛️ OFFICIAL DATA (แหล่งข้อมูลทางการ — ตรวจสอบได้ 100%)"]
        direction TB
        OD1["<b>พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒</b>"]
        OD2["<b>พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔</b>"]
        OD3["<b>พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙</b>"]
        OD4["<b>พจนานุกรมภาษาถิ่น ๔ ภาค</b>"]
        
        OD_PROP["<b>คุณลักษณะข้อมูล:</b><br/>• ข้อมูลประวัติศาสตร์ ห้ามแก้ไขทับ (Immutable)<br/>• มีเลขหน้าและเล่มอ้างอิงชัดเจน<br/>• สถานะ: <code>Official Source</code>"]
        OD1 & OD2 & OD3 & OD4 --- OD_PROP
    end

    subgraph BARRIER ["🛡️ STRICT DATA BOUNDARY & ACCESS CONTROL"]
        WALL["<b>กฎเหล็ก: AI Generated Data ห้ามบันทึกทับ Official Data</b><br/>(อ่านข้อมูลแบบ Read-Only ผ่าน RAG เท่านั้น)"]
    end

    subgraph AI_GEN ["🤖 AI GENERATED / INFERRED DATA (ข้อมูลสังเคราะห์)"]
        direction TB
        AD1["<b>AI Explanation:</b> คำอธิบายเหตุผลและบริบทการใช้"]
        AD2["<b>Context Recommendation:</b> คะแนนความเหมาะสมของคำ"]
        AD3["<b>Usage Guidance:</b> คำแนะนำการเขียนและระดับภาษา"]
        AD4["<b>AI Inferred Mappings:</b> การจับคู่ภาษาถิ่นที่ AI อนุมานเอง"]
        AD5["<b>Comparison Summary:</b> ตารางสรุปจุดต่างของคำ"]
        
        AD_PROP["<b>คุณลักษณะข้อมูล:</b><br/>• เก็บแยกในตาราง <code>ai_explanations</code>, <code>rag_evidence</code><br/>• แสดงป้ายกำกับ: <code>AI Generated / AI Inferred</code><br/>• มี Fallback เมื่อหลักฐานไม่พอ"]
        AD1 & AD2 & AD3 & AD4 & AD5 --- AD_PROP
    end

    OFFICIAL --> BARRIER
    BARRIER --> AI_GEN
```

---

## 3. 10-Second Judge Concept Diagram (Section 28)

> *แผนภาพสำหรับกรรมการ เข้าใจได้ทันทีใน 10 วินาที โดยไม่ใช้คำศัพท์เทคนิคแม้แต่คำเดียว*

```mermaid
flowchart LR
    subgraph TRAD ["แบบเดิม (Traditional)"]
        T1["รู้คำศัพท์"] --> T2["ค้นหาคำ"] --> T3["อ่านความหมาย"]
    end

    subgraph TC ["THAI CONTEXT (แบบใหม่)"]
        N1["รู้สิ่งที่อยากสื่อ"] --> N2["บอกความหมาย / บริบท"] --> N3["ค้นพบคำที่เหมาะสม"] --> N4["เปรียบเทียบคำ"] --> N5["เข้าใจวิธีใช้"] --> N6["ตรวจสอบหลักฐาน"]
    end
```

---

## 4. From Dictionary to Language Intelligence (Section 29)

```mermaid
flowchart TD
    subgraph BASE ["1. คลังข้อมูลภาษาไทยที่เป็นทางการ (Official Foundation)"]
        D1["พจนานุกรม ๒๕๔๒"]
        D2["พจนานุกรม ๒๕๕๔"]
        D3["พจนานุกรม ๒๕๖๙"]
        D4["พจนานุกรมภาษาถิ่น"]
    end

    subgraph LAYER1 ["2. Dictionary Knowledge Base"]
        DK["โครงสร้างคลังคำศัพท์ บันทึกความหมาย และวิวัฒนาการ ๓ ยุคสมัย"]
    end

    subgraph LAYER2 ["3. Semantic Understanding"]
        SU["ถอดรหัสเจตนาและความหมายเชิงลึกข้ามกาลเวลาและภาษาถิ่น"]
    end

    subgraph LAYER3 ["4. Context Intelligence"]
        CI["วิเคราะห์ระดับภาษา กาลเทศะ และความเหมาะสมกับบริบท"]
    end

    subgraph LAYER4 ["5. Trusted AI"]
        TA["ผู้ช่วยอัจฉริยะที่อธิบายอย่างมีหลักฐานอ้างอิง ไร้การมโนข้อมูล"]
    end

    subgraph LAYER5 ["6. Thai Language Exploration Platform"]
        TC["THAI CONTEXT: แพลตฟอร์มสำรวจภาษาไทยที่ทรงพลังและแม่นยำ"]
    end

    D1 & D2 & D3 & D4 --> LAYER1
    LAYER1 --> LAYER2
    LAYER2 --> LAYER3
    LAYER3 --> LAYER4
    LAYER4 --> LAYER5
```

> **คำแถลงวิสัยทัศน์:**  
> *"เราไม่ได้สร้างพจนานุกรมใหม่ แต่เราออกแบบวิธีใหม่ในการเข้าถึง เข้าใจ เปรียบเทียบ และเชื่อมโยงคลังคำภาษาไทย"*

---

## 5. Problem $\rightarrow$ Solution $\rightarrow$ Impact (Section 30)

```mermaid
flowchart TD
    subgraph P ["1. PROBLEM (ปัญหาที่พบ)"]
        P1["ผู้ใช้งานมักรู้สิ่งที่ต้องการจะสื่อสาร<br/>แต่นึกคำศัพท์ภาษาไทยที่ถูกต้อง สละสลวย หรือตรงบริบทไม่ออก<br/>(Tip-of-the-tongue & Context Mismatch)"]
    end

    subgraph S ["2. SOLUTION (ทางออกของ THAI CONTEXT)"]
        S1["แพลตฟอร์มที่ผสานพลังของ:<br/>• การค้นหาจากความหมาย (Semantic Search)<br/>• การจัดอันดับตามบริบท (Context Understanding)<br/>• พจนานุกรม 3 ยุคสมัย (2542, 2554, 2569) & ภาษาถิ่น<br/>• ปัญญาประดิษฐ์ที่มีหลักฐานอ้างอิง (Grounded AI)"]
    end

    subgraph I ["3. IMPACT (ผลลัพธ์และคุณค่าที่เกิดขึ้น)"]
        I1["ผู้ใช้งานสามารถ:<br/>✓ ค้นพบคำที่เหมาะสมโดยไม่ต้องรู้คำล่วงหน้า<br/>✓ เข้าใจความหมายและระดับภาษาอย่างถ่องแท้<br/>✓ เปรียบเทียบความแตกต่างระหว่างคำใกล้เคียง<br/>✓ สื่อสารได้ถูกต้องตามกาลเทศะและบริบท<br/>✓ สำรวจวิวัฒนาการคำศัพท์ตลอด 27 ปี<br/>✓ เข้าถึงความหลากหลายของภาษาถิ่นไทย<br/>✓ ตรวจสอบหลักฐานอ้างอิงทางวิชาการได้จริง"]
    end

    P --> S --> I
```

---

## 6. Presentation-Ready User Journey (Section 31)

```mermaid
flowchart LR
    U(["ผู้ใช้งาน"]) --> Q["'อยากบอกอะไร?'<br/>(พิมพ์ความหมาย/บริบท)"]
    Q --> S["Meaning-first Search<br/>(ค้นหาจากเจตนา)"]
    S --> W["Recommended Words<br/>(คำแนะนำที่ตรงบริบท)"]
    W --> E["Why this word?<br/>(ดูเหตุผลและหลักฐาน)"]
    E --> C["Compare Words<br/>(เปรียบเทียบคำคู่แฝด)"]
    C --> G["Usage Guidance<br/>(ดูระดับภาษาและวิธีใช้)"]
    G --> EV["Dictionary Evolution<br/>(ดูการเปลี่ยนผ่าน 3 ยุค)"]
    EV --> D["Dialect Explorer<br/>(สำรวจคู่เทียบภาษาถิ่น)"]
    D --> AI["Ask AI Assistant<br/>(ปรึกษาการเกลาประโยค)"]
    AI --> EV_CARD["Evidence-backed Answer<br/>(คำตอบพร้อมเล่มอ้างอิง)"]
```

---

## 7. The 10-Step Hackathon Demo Story (Section 32)

> ทุกขั้นตอนในการสาธิตจะร้อยเรียงเป็นเนื้อเรื่องเดียวกัน พร้อมแสดง Functional Requirement (FR) ที่ถูกทดสอบในแต่ละสเต็ป:

```mermaid
flowchart TD
    D1["<b>Step 1: ผู้ใช้ป้อนเจตนาเป็นภาษาธรรมชาติ</b><br/>'อยากบอกว่าทำงานได้ผลลัพธ์ดีเลิศ คุ้มค่าทรัพยากร แต่ไม่อยากใช้คำว่าเร็ว'<br/><i>(Demonstrates: FR-02 Meaning-first Search)</i>"] -->
    D2["<b>Step 2: ระบบถอดรหัสความหมายและเงื่อนไข</b><br/>ตัดคำว่า 'เร็ว' ออก และวิเคราะห์แก่นความหมายของการทำงานเชิงบริหาร<br/><i>(Demonstrates: FR-04 Query Understanding)</i>"] -->
    D3["<b>Step 3: แนะนำคำศัพท์ที่เหมาะสมที่สุด</b><br/>แสดงคำว่า 'ประสิทธิภาพ' (94%) พร้อมอธิบายเหตุผลจากนิยาม<br/><i>(Demonstrates: FR-03 Semantic Search, FR-05 Context Recommendation, FR-06 Explain)</i>"] -->
    D4["<b>Step 4: ผู้ใช้กดเปรียบเทียบสองคำที่ลังเล</b><br/>เปรียบเทียบ 'ประสิทธิภาพ' (กระบวนการคุ้มค่า) vs 'ประสิทธิผล' (ผลลัพธ์ตรงเป้า)<br/><i>(Demonstrates: FR-13 Context Compare)</i>"] -->
    D5["<b>Step 5: ตรวจสอบระดับภาษาและคำแนะนำการใช้</b><br/>ดูแท็กระดับภาษาทางการ (Formal) และตัวอย่างการใช้ในเอกสารราชการ<br/><i>(Demonstrates: FR-07 Word Detail, FR-14 Usage Guidance)</i>"] -->
    D6["<b>Step 6: ท่องเวลากับวิวัฒนาการพจนานุกรม 3 ยุค</b><br/>กดดูแถบ Timeline ปี 2542 ➔ 2554 ➔ 2569 ของคำว่า 'ประสิทธิภาพ'<br/><i>(Demonstrates: FR-08 Multi-Version Dictionary, FR-09 Dictionary Evolution)</i>"] -->
    D7["<b>Step 7: แสดงจุดที่มีการเปลี่ยนแปลงความหมาย (Semantic Diff)</b><br/>ระบบไฮไลต์แท็กสีเหลือง 'ปรับปรุงนิยามในฉบับ 2554 และ 2569 ครอบคลุมเทคโนโลยี'<br/><i>(Demonstrates: FR-10 Dictionary Change Detection)</i>"] -->
    D8["<b>Step 8: สำรวจคำเทียบเคียงในภาษาถิ่น</b><br/>กดดูคำที่มีนัยยะความคล่องแคล่วและการทำงานได้ดีในภาษาเหนือ/อีสาน/ใต้<br/><i>(Demonstrates: FR-11 Dialect Explorer, FR-12 Standard ↔ Dialect Mapping)</i>"] -->
    D9["<b>Step 9: ปรึกษาผู้ช่วย AI ด้านการนำไปเขียนงานจริง</b><br/>ถาม: 'ถ้าจะนำคำนี้ไปเขียนในรายงานประเมินผลประจำปี ควรเขียนอย่างไร?'<br/><i>(Demonstrates: FR-15 RAG-based AI Assistant, FR-17 Hallucination Guard)</i>"] -->
    D10["<b>Step 10: AI ให้คำตอบพร้อมเปิด Drawer แสดงหลักฐาน</b><br/>AI แนะนำรูปประโยค พร้อมการ์ดอ้างอิงพจนานุกรมฉบับ 2569 หน้า 820 อย่างโปร่งใส<br/><i>(Demonstrates: FR-16 Source & Evidence, FR-18 Search Feedback)</i>"]
```

---

## 8. Presentation Diagram Packages Overview (Section 34)

เพื่อให้ทีมงานเลือกหยิบไปใช้ได้อย่างถูกต้องตามกลุ่มผู้ฟัง เอกสารชุดนี้แบ่งแผนภาพออกเป็น 2 แพ็กเกจหลัก:

### 📦 PACKAGE A — TECHNICAL (สำหรับ Developer, Database Architect, และกรรมการสายเทคนิค)
1. **Full Technical ERD:** ใน [02-database-architecture.md](file:///Users/mac/Desktop/workspace/thai-context/docs/02-database-architecture.md#3-technical-erd-mermaid)
2. **System Architecture Topology:** ใน [03-system-architecture.md](file:///Users/mac/Desktop/workspace/thai-context/docs/03-system-architecture.md#1-system-architecture-topology-mermaid)
3. **Data Flow Diagram:** ใน [03-system-architecture.md](file:///Users/mac/Desktop/workspace/thai-context/docs/03-system-architecture.md#4-data-ingestion--normalization-flow-mermaid)
4. **Grounded RAG Flow:** ใน [03-system-architecture.md](file:///Users/mac/Desktop/workspace/thai-context/docs/03-system-architecture.md#3-grounded-rag-flow--anti-hallucination-architecture)
5. **Hybrid Search Architecture:** ใน [03-system-architecture.md](file:///Users/mac/Desktop/workspace/thai-context/docs/03-system-architecture.md#2-hybrid-search-strategy--rrf-ranking)
6. **Database Architecture & Indexes:** ใน [02-database-architecture.md](file:///Users/mac/Desktop/workspace/thai-context/docs/02-database-architecture.md#5-indexing-strategy)
7. **Complete API $\rightarrow$ Database Mapping:** ใน [07-requirement-traceability.md](file:///Users/mac/Desktop/workspace/thai-context/docs/07-requirement-traceability.md#2-complete-traceability-mapping-table-fr-01-ถึง-fr-18)

### 📦 PACKAGE B — JUDGE & USER (สำหรับสไลด์ Pitching, กรรมการทั่วไป และหน้าเว็บไซต์)
1. **Problem $\rightarrow$ Solution $\rightarrow$ Impact:** ในหัวข้อ 5 ของเอกสารนี้
2. **Traditional vs. THAI CONTEXT (10-Second Diagram):** ในหัวข้อ 3 ของเอกสารนี้
3. **From Dictionary to Language Intelligence:** ในหัวข้อ 4 ของเอกสารนี้
4. **Meaning-first Search Concept Flow:** ในหัวข้อ 1.1 ของเอกสารนี้
5. **Dictionary Evolution Concept Flow:** ในหัวข้อ 1.2 ของเอกสารนี้
6. **Dialect Exploration Concept Flow:** ในหัวข้อ 1.3 ของเอกสารนี้
7. **Official vs. AI Data Boundary:** ในหัวข้อ 2 ของเอกสารนี้
8. **Presentation-Ready User Journey:** ในหัวข้อ 6 ของเอกสารนี้
9. **10-Step Hackathon Demo Story:** ในหัวข้อ 7 ของเอกสารนี้
