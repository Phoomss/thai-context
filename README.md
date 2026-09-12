# 🇹🇭 THAI CONTEXT
> **"ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน"**  
> *Semantic Thai Language Exploration Platform for Contextual Word Discovery, Lexical Evolution & Grounded AI*

---

## 👥 โครงสร้างทีมและการแบ่งบทบาท (Team Ownership)

| สมาชิก | ตำแหน่ง | หน้าที่หลัก | โฟลเดอร์งาน | คู่มือ Prompt |
| :--- | :--- | :--- | :--- | :--- |
| **คนที่ 1** | **🧠 AI & Search Engineer** | Query Understanding, Hybrid Search, Grounded RAG, Safe Abstention | `backend/src/modules/ai/` | [`prompts/role-1-ai-search.md`](./prompts/role-1-ai-search.md) |
| **คนที่ 2** | **⚙️ Backend, Data & DevOps** | PostgreSQL 16 + pgvector, REST APIs, Seeding 3 ยุค + ภาษาถิ่น, Docker | `backend/` & `docker-compose.yml` | [`prompts/role-2-backend-devops.md`](./prompts/role-2-backend-devops.md) |
| **คนที่ 3** | **🎨 Frontend & UX/Product** | Next.js 14 Web App, 5 UI Modules, Fail-Safe Mock Toggle, 10-Step Story | `frontend/` | [`prompts/role-3-frontend-product.md`](./prompts/role-3-frontend-product.md) |

---

## 🚀 วิธีการรันโปรเจกต์ (Quickstart Guide)

### 1. เปิดฐานข้อมูล PostgreSQL 16 + pgvector (คนที่ 2 ดูแล)
```bash
# รัน Database Container (สคริปต์ SQL 05-database-schema.sql จะถูก Initialized ให้อัตโนมัติ)
docker compose up -d

# ตรวจสอบสถานะว่า Database รันเรียบร้อย
docker ps
```

### 2. รัน Backend Service (NestJS API บนพอร์ต 4000)
```bash
cd backend

# ติดตั้ง Dependencies
npm install

# รัน Backend ในโหมด Development
npm run start:dev

# ทดสอบเปิดดู Swagger Documentation
# URL: http://localhost:4000/api/docs
```

### 3. รัน Frontend Web App (Next.js 14 บนพอร์ต 3000)
```bash
cd frontend

# ติดตั้ง Dependencies
npm install

# รัน Frontend Development Server
npm run dev

# เข้าชมหน้าเว็บ
# URL: http://localhost:3000
```

---

## 📁 โครงสร้างโปรเจกต์ (Monorepo Directory Structure)

```text
thai-context/
├── docker-compose.yml                      # ฐานข้อมูล PostgreSQL 16 + pgvector
├── .env.example                            # ตัวแปรระบบตัวอย่าง (API Keys, URLs)
├── README.md                               # เอกสารคู่มือนี้
│
├── backend/                                # ⚙️ Backend API Service (NestJS + TypeScript)
│   ├── src/
│   │   ├── main.ts                         # จุดเริ่มต้นเซิร์ฟเวอร์, CORS, Swagger
│   │   ├── app.module.ts
│   │   ├── database/                       # Database Service & Connection Pool
│   │   └── modules/
│   │       ├── ai/                         # 🧠 AI Pipeline (Gemini 3.8 Flash, RAG, Guardrail)
│   │       ├── search/                     # 🔎 Meaning-first & Keyword Search APIs
│   │       ├── words/                      # 📚 Word Detail, 3-Era Evolution & Compare APIs
│   │       ├── dialects/                   # 🌏 Thai Dialect Explorer APIs
│   │       └── feedback/                   # 📊 Relevance Feedback Metrics API
│   └── package.json
│
├── frontend/                               # 🎨 Frontend Web Application (Next.js 14 App Router)
│   ├── src/
│   │   ├── app/                            # Layout, Page & Styles
│   │   ├── components/                     # UI Modules (Search, Slider, Map, Drawer)
│   │   ├── lib/                            # API Client พร้อม Fail-Safe Mock Fallback
│   │   └── mocks/                          # ชุดข้อมูลจำลองสำหรับเดโม 10 ขั้นตอน
│   └── package.json
│
├── docs/                                   # 📑 เอกสารข้อกำหนดระบบ (Module 01 - 10)
└── prompts/                                # 🧭 Master Prompts พร้อมโค้ดสำหรับทั้ง 3 Role
```

---

## 🛡️ ระบบ Fail-Safe สำหรับวันเดโมบนเวที (100% Zero-Failure Guarantee)
- หน้าเว็บมีปุ่มสลับ **Mock Data / Live API** ที่แถบ Header ด้านขวาบน
- หากสัญญาณอินเทอร์เน็ตที่สถานที่จัดงานขัดข้อง หรือ Backend ไม่ตอบสนอง หน้าเว็บจะ **Fallback ไปใช้ Mock Data ทันทีโดยอัตโนมัติ** ทำให้การนำเสนอบนเวทีไม่สะดุดอย่างแน่นอน!
