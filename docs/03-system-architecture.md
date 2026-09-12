# 🏗️ THAI CONTEXT — System Architecture & RAG Pipeline
> **Module 03:** System Architecture, Hybrid Retrieval Engine & Grounded RAG Specifications

---

## 1. System Architecture Topology (Mermaid)

```mermaid
flowchart TB
    subgraph Client ["Frontend Tier (Next.js 14 + Tailwind CSS)"]
        UI_Search["Meaning-first Search Interface"]
        UI_Compare["Side-by-Side Context Comparator"]
        UI_Evol["Timeline Evolution Viewer (2542 ➔ 2554 ➔ 2569)"]
        UI_Dialect["Dialect Interactive Regional Map"]
        UI_AI["Grounded AI Consultation Drawer"]
    end

    subgraph Server ["Backend Tier (NestJS Modular Monolith)"]
        API_GW["API Gateway & Input Sanitizer"]
        
        subgraph Modules ["NestJS Domain Modules"]
            MOD_Search["Search Engine Module<br/>(Keyword + Dense Vector + RRF)"]
            MOD_Dict["Dictionary & Evolution Module"]
            MOD_Dialect["Dialect Exploration Module"]
            MOD_RAG["Grounded RAG & Guardrail Module"]
            MOD_Feedback["User Feedback Module"]
        end
    end

    subgraph Storage ["Storage & Vector Tier (PostgreSQL 16 + pgvector)"]
        DB_Rel[("Relational Tables<br/>(Words, Editions, Senses)")]
        DB_Vec[("Vector Tables (HNSW Index)<br/>(Embeddings & Mappings)")]
        DB_Audit[("Audit & Evidence Tables<br/>(AI Explanations & Citations)")]
    end

    subgraph External_AI ["External AI Services"]
        EMBED_API["Thai Vector Embedding Model<br/>(text-embedding-3-small / BGE-M3)"]
        LLM_API["LLM Synthesis Service<br/>(Streaming Response Generation)"]
    end

    Client <-->|REST / SSE Streaming| API_GW
    API_GW --> Modules
    MOD_Search <--> DB_Vec
    MOD_Search <--> DB_Rel
    MOD_Dict <--> DB_Rel
    MOD_Dialect <--> DB_Rel
    MOD_RAG <--> DB_Audit
    MOD_RAG <--> DB_Rel
    MOD_RAG <--> LLM_API
    MOD_Search <--> EMBED_API
    MOD_Feedback --> DB_Audit
```

---

## 2. Hybrid Search Strategy & RRF Ranking

เพื่อให้การสืบค้นครอบคลุมทั้งตัวสะกดที่ตรงกัน (Lexical) และมิติความหมายที่ลึกซึ้ง (Semantic) ระบบใช้กลไก **Hybrid Retrieval Engine**:

```mermaid
flowchart LR
    Q["User Query"] --> DENSE["Dense Vector Search<br/>(pgvector Cosine Distance)"]
    Q --> SPARSE["Sparse Text Search<br/>(Trigram Similarity)"]
    
    DENSE --> R1["Vector Rank List"]
    SPARSE --> R2["Text Rank List"]
    
    R1 & R2 --> RRF_CALC["Reciprocal Rank Fusion (RRF)<br/>Score = ∑ 1 / (60 + Rank)"]
    
    RRF_CALC --> RE_RANK["Contextual Re-ranker<br/>(Register + Exclusion Filter)"]
    RE_RANK --> FINAL["Top-K Candidate Words"]
```

### สูตรการคำนวณ Reciprocal Rank Fusion (RRF)
$$RRF(d) = \frac{w_{\text{dense}}}{60 + r_{\text{dense}}(d)} + \frac{w_{\text{sparse}}}{60 + r_{\text{sparse}}(d)}$$

- **Dense Search:** สกัดเวกเตอร์ความหมายผ่าน Embedding Model และค้นหาด้วย Cosine Distance
- **Sparse Search:** ค้นหาตัวสะกดและคำบางส่วนด้วย `pg_trgm` (GIN Index)
- **Constraint Filtering:** ตัดคำที่เป็น Negative Constraint (เช่น "ไม่อยากใช้คำว่าเร็ว") ออกจากผลลัพธ์

---

## 3. Grounded RAG Flow & Anti-Hallucination Architecture

```mermaid
flowchart TD
    A["คำถาม / ข้อความที่ต้องการสื่อของผู้ใช้<br/>(User Query & Context)"] --> B["Query Understanding & Intent Parsing<br/>(แยกความหมายหลัก บริบท และคำต้องห้าม)"]
    B --> C["Query Vectorizer<br/>(สร้าง Embedding เวกเตอร์คำถาม)"]
    
    C --> D["Hybrid Retrieval (PostgreSQL + pgvector)<br/>1. Dense Vector Match (Cosine Distance)<br/>2. Sparse Trigram Keyword Match<br/>3. Reciprocal Rank Fusion (RRF)"]
    
    D --> E["Top-K Candidate Extraction<br/>(ดึงคำศัพท์ นิยาม ฉบับ 2542/2554/2569)"]
    
    E --> F{"Hallucination Guardrail Check<br/>ความเกี่ยวข้องเพียงพอหรือไม่? (Confidence > 0.72)"}
    
    F -->|ไม่เพียงพอ / ไม่พบข้อมูล| G["Safe Abstention Response<br/>'ไม่พบข้อมูลที่เพียงพอจากพจนานุกรมที่เป็นทางการ'"]
    
    F -->|ผ่านเกณฑ์ความถูกต้อง| H["Grounded Context Injection<br/>(นำนิยามและเล่มอ้างอิงใส่ลงใน Prompt Template)"]
    
    H --> I["LLM Synthesis (Streaming Response)<br/>- ตอบตรงประเด็น<br/>- เปรียบเทียบตามบริบทจริง"]
    
    I --> J["Evidence Attribution & Citation<br/>(ผูกคำตอบเข้ากับ ID พจนานุกรมและแสดงใน Drawer)"]
    
    J --> K["บันทึกประวัติลง ai_explanations & rag_evidence"]
```

### Strict System Prompt Design
```text
[SYSTEM INSTRUCTION]
คุณคือผู้เชี่ยวชาญด้านภาษาไทยสำหรับแพลตฟอร์ม THAI CONTEXT
หน้าที่ของคุณคือช่วยผู้ใช้เลือกคำ เปรียบเทียบคำ และให้คำแนะนำการใช้ภาษาไทย

[GROUNDING RULES]
1. จงตอบคำถามโดยใช้เฉพาะข้อมูลใน [DICTIONARY CONTEXT] ที่แนบมานี้เท่านั้น
2. ห้ามแต่งคำแปล สันนิษฐาน หรือสร้างคำศัพท์ใหม่ที่ไม่มีปรากฏในหลักฐาน
3. ทุกคำแนะนำต้องระบุชื่อเล่มและปี พ.ศ. ของพจนานุกรมที่ใช้อ้างอิง
4. หากข้อมูลในบริบทไม่เพียงพอ จงตอบว่า:
   "ไม่พบข้อมูลที่เพียงพอจากคลังพจนานุกรมฉบับทางการที่ระบบรองรับ"
```

---

## 4. Data Ingestion & Normalization Flow (Mermaid)

```mermaid
flowchart TD
    subgraph RAW ["1. Source Datasets (JSON / CSV)"]
        DS_42["พจนานุกรม 2542"]
        DS_54["พจนานุกรม 2554"]
        DS_69["พจนานุกรม 2569"]
        DS_DIA["พจนานุกรมภาษาถิ่น"]
    end

    subgraph PIPELINE ["2. Normalization & Indexing Pipeline"]
        VAL["Schema Validation & Deduplication"]
        NORM["Thai Linguistic Normalization (PyThaiNLP)<br/>(ตัดวรรณยุกต์/สระเกิน, จัดการช่องไฟ)"]
        CHUNK["Sense Chunking & Metadata Enrichment"]
        EMBED["Vector Embedding Generation"]
    end

    subgraph DB ["3. Database Storage (PostgreSQL + pgvector)"]
        T_OFFICIAL[("ข้อมูลพจนานุกรมทางการ<br/>(Immutable Official Data)")]
        T_VEC[("ดัชนีเวกเตอร์ค้นหา<br/>(search_embeddings)")]
    end

    DS_42 & DS_54 & DS_69 & DS_DIA --> VAL
    VAL --> NORM --> CHUNK
    CHUNK --> T_OFFICIAL
    CHUNK --> EMBED --> T_VEC
```

---

## 5. Technical Decisions & Architectural Rationales

| การตัดสินใจ | ทางเลือกอื่นที่พิจารณา | เหตุผลและความเหมาะสมสำหรับ Hackathon |
| :--- | :--- | :--- |
| **PostgreSQL + pgvector** | Milvus, Pinecone, Qdrant | รวมทุกอย่างไว้ในฐานข้อมูลเดียว ไม่ต้องบริหารจัดการ Cluster สองตัว สามารถเขียน Single SQL ที่ JOIN ข้อมูลประวัติศาสตร์พจนานุกรมเข้ากับ Vector Similarity ได้ทันที |
| **NestJS (Modular Monolith)** | Microservices | เหมาะกับระยะเวลาพัฒนาที่จำกัด มี Dependency Injection ที่แข็งแกร่ง มีโครงสร้าง Domain Module ชัดเจน สามารถสเกลขึ้น Production หรือแยก Service ได้ง่ายในอนาคต |
| **Next.js 14 + Tailwind CSS** | Vite SPA | รองรับ Server-Side Rendering (SSR) ช่วยเรื่องการแสดงผลฟอนต์ภาษาไทย และรองรับ Server-Sent Events (SSE) สำหรับการแสดงผล LLM แบบ Streaming อย่างลื่นไหล |
| **HNSW Vector Index** | IVFFlat Index | HNSW ให้ค่า Recall ที่สูงกว่า และไม่ต้องรอ Re-train ดัชนีเมื่อมีการเพิ่มข้อมูลคำศัพท์ใหม่ |
