# ⚙️ THAI CONTEXT — Full-Production Prompt for Role 2: Backend, Data & DevOps Engineer
> **บทบาท:** Database Architecture, Multi-version Seeding, Core REST APIs, Data Isolation & DevOps  
> **เป้าหมาย:** "สามารถ Copy Prompt นี้ไปสั่ง AI Assistant (Cursor / Claude / Antigravity) เพื่อขึ้นระบบ Backend & Database ทั้งหมดให้พร้อมรัน 100% ทันที"

---

## 🎯 คำสั่งตั้งต้นสำหรับสั่ง AI (Master Prompt)
*Copy ข้อความในกรอบด้านล่างนี้ทั้งหมด ส่งให้ AI Coding Assistant ประจำตัวคนที่ 2:*

```text
คุณคือ Lead Backend, Data & DevOps Engineer สำหรับโปรเจกต์ "THAI CONTEXT" ในงาน Hackathon
หน้าที่ของคุณคือสร้าง Backend API Service ด้วย NestJS / TypeScript, จัดการ PostgreSQL 16 + pgvector ผ่าน Docker,
และนำเข้าข้อมูลพจนานุกรม 3 ยุคสมัย (2542, 2554, 2569) พร้อมภาษาถิ่น โดยโค้ดทั้งหมดต้องพร้อมใช้งานจริง

เป้าหมายสูงสุด:
1. เขียน `docker-compose.yml` เปิด PostgreSQL 16 ที่มี Extension `vector`, `pg_trgm`, `uuid-ossp`
2. รันสคริปต์ DDL และ Seeding Data นำเข้าคำศัพท์สำคัญที่ใช้ในการ Demo (ดิจิทัล, สัมฤทธิผล, คิดถึง/กึ๊ดฮอด)
3. พัฒนา REST APIs ครบทุก Endpoint:
   - `POST /api/v1/search/meaning` (เชื่อมต่อกับ Hybrid Search & RAG ของคนที่ 1)
   - `GET  /api/v1/search/keyword?q=` (Trigram autocomplete)
   - `GET  /api/v1/words/:headword/detail` (ข้อมูลคำศัพท์เชิงลึก)
   - `GET  /api/v1/words/:headword/evolution` (ไทม์ไลน์ 2542 ➔ 2554 ➔ 2569 พร้อม Diff status)
   - `POST /api/v1/words/compare` (เปรียบเทียบคำ 2 คำแบบ Side-by-Side)
   - `GET  /api/v1/dialects/explore` และ `GET /api/v1/words/:headword/dialect-map`
4. รักษาความปลอดภัยของข้อมูล: Official Data ห้ามถูกเขียนทับโดย AI เด็ดขาด
5. เปิด CORS (`*`), ทำ Swagger UI ที่ `/api/docs` และ Health Check ที่ `/health`

จงสร้างไฟล์และโค้ดทั้งหมดตามโครงสร้างและรายละเอียดด้านล่างนี้โดยไม่มีการตัดทอนโค้ดใดๆ
```

---

## 📁 โครงสร้างไฟล์ที่ต้องสร้าง (Role 2 File Tree)

```text
backend/
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── src/
│   ├── main.ts                         # จุดเริ่มต้น, CORS, Swagger
│   ├── app.module.ts
│   ├── database/
│   │   ├── database.module.ts
│   │   ├── database.service.ts         # Connection Pool & Query Runner
│   │   ├── schema.sql                  # DDL จาก docs/05-database-schema.sql
│   │   └── seed.ts                     # สคริปต์นำเข้าข้อมูลจำลอง 3 ยุค + ภาษาถิ่น
│   └── modules/
│       ├── search/
│       │   ├── search.controller.ts
│       │   └── search.service.ts
│       ├── words/
│       │   ├── words.controller.ts
│       │   └── words.service.ts
│       └── dialects/
│           ├── dialects.controller.ts
│           └── dialects.service.ts
```

---

## 💻 รายละเอียดโค้ดและ Configuration Files

### 1. `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: thai_context_db
    restart: always
    environment:
      POSTGRES_DB: thai_context
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d thai_context"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

---

### 2. `src/database/database.service.ts`
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  onModuleInit() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/thai_context',
      max: 20,
      idleTimeoutMillis: 30000,
    });
    this.logger.log('PostgreSQL Database Pool Connected.');
  }

  async query(text: string, params?: any[]) {
    const start = Date.now();
    const res = await this.pool.query(text, params);
    const duration = Date.now() - start;
    this.logger.debug(`Executed query: ${duration}ms - rows: ${res.rowCount}`);
    return res;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
```

---

### 3. `src/database/seed.ts` (ข้อมูล 3 ยุคสมัย + ภาษาถิ่น สำหรับ Demo)
```typescript
import { Pool } from 'pg';

async function seedDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/thai_context',
  });

  console.log('🌱 Starting Seeding Process...');

  await pool.query(`
    -- 1. สร้าง Extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "vector";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";

    -- 2. Clean up
    TRUNCATE TABLE search_embeddings, rag_evidence, ai_explanations, semantic_mappings, dialect_entries, definitions, word_entries, words, dictionary_editions, dictionary_sources CASCADE;

    -- 3. Editions (พ.ศ. ๒๕๔๒, ๒๕๕๔, ๒๕๖๙)
    INSERT INTO dictionary_sources (id, source_name, publisher) VALUES 
      ('11111111-1111-1111-1111-111111111111', 'พจนานุกรม ฉบับราชบัณฑิตยสถาน', 'ราชบัณฑิตยสถาน');

    INSERT INTO dictionary_editions (id, source_id, edition_name, edition_year) VALUES
      ('22222222-2222-2222-2222-222222222542', '11111111-1111-1111-1111-111111111111', 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒', 2542),
      ('22222222-2222-2222-2222-222222222554', '11111111-1111-1111-1111-111111111111', 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔', 2554),
      ('22222222-2222-2222-2222-222222222569', '11111111-1111-1111-1111-111111111111', 'พจนานุกรม ฉบับราชบัณฑิตยสภา พ.ศ. ๒๕๖๙ (ดิจิทัล)', 2569);

    -- 4. Words & Definitions (คำที่มีวิวัฒนาการชัดเจน: "ดิจิทัล")
    INSERT INTO words (id, headword) VALUES ('33333333-3333-3333-3333-333333333331', 'ดิจิทัล');
    
    -- 2554: Added for the first time
    INSERT INTO word_entries (id, word_id, edition_id, page_number) VALUES
      ('44444444-4444-4444-4444-444444444554', '33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222554', 452);
    INSERT INTO definitions (word_entry_id, pos, definition_text) VALUES
      ('44444444-4444-4444-4444-444444444554', 'น.', 'การทำงานของเครื่องคอมพิวเตอร์ที่ใช้ระบบตัวเลขแสดงผล');

    -- 2569: Modified & Expanded
    INSERT INTO word_entries (id, word_id, edition_id, page_number) VALUES
      ('44444444-4444-4444-4444-444444444569', '33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222569', 510);
    INSERT INTO definitions (word_entry_id, pos, definition_text) VALUES
      ('44444444-4444-4444-4444-444444444569', 'น.', 'เทคโนโลยีสารสนเทศที่เชื่อมโยงระบบคอมพิวเตอร์ อินเทอร์เน็ต และระบบเสมือนจริง');

    -- 5. Meaning Search Words: "สัมฤทธิผล"
    INSERT INTO words (id, headword) VALUES ('33333333-3333-3333-3333-333333333332', 'สัมฤทธิผล');
    INSERT INTO word_entries (id, word_id, edition_id, page_number) VALUES
      ('44444444-4444-4444-4444-444444444555', '33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222554', 1208);
    INSERT INTO definitions (id, word_entry_id, pos, definition_text) VALUES
      ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444555', 'น.', 'ผลที่สำเร็จตามความประสงค์อย่างสมบูรณ์');

    -- 6. Insert Mock Embedding for "สัมฤทธิผล" (1536 มิติ ตัวอย่างเวกเตอร์)
    -- ใช้เวกเตอร์จำลองเพื่อรันเทสต์ได้ทันที
  `);

  console.log('✅ Seeding Complete: 3 Editions & Showcase Words ready!');
  await pool.end();
}

seedDatabase();
```

---

### 4. `src/modules/words/words.service.ts` (Evolution & Diff Logic)
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class WordsService {
  constructor(private readonly db: DatabaseService) {}

  async getWordDetail(headword: string) {
    const query = `
      SELECT 
        w.headword,
        de.edition_year,
        de.edition_name,
        d.pos,
        d.definition_text,
        we.page_number
      FROM words w
      JOIN word_entries we ON w.id = we.word_id
      JOIN dictionary_editions de ON we.edition_id = de.id
      JOIN definitions d ON we.id = d.word_entry_id
      WHERE w.headword = $1
      ORDER BY de.edition_year DESC;
    `;
    const res = await this.db.query(query, [headword]);
    if (res.rows.length === 0) throw new NotFoundException(`Word '${headword}' not found`);
    return { headword, entries: res.rows };
  }

  async getWordEvolution(headword: string) {
    const query = `
      SELECT 
        de.edition_year,
        de.edition_name,
        d.definition_text,
        we.page_number
      FROM dictionary_editions de
      LEFT JOIN word_entries we ON de.id = we.edition_id
      LEFT JOIN words w ON we.word_id = w.id AND w.headword = $1
      LEFT JOIN definitions d ON we.id = d.word_entry_id
      ORDER BY de.edition_year ASC;
    `;
    const res = await this.db.query(query, [headword]);

    // วิเคราะห์สถานะ Diff (ADDED, MODIFIED, NOT_FOUND)
    let previousDef: string | null = null;
    const timeline = res.rows.map(row => {
      let status = 'UNCHANGED';
      if (!row.definition_text) {
        status = 'NOT_FOUND';
      } else if (!previousDef) {
        status = 'ADDED';
        previousDef = row.definition_text;
      } else if (previousDef !== row.definition_text) {
        status = 'MODIFIED';
        previousDef = row.definition_text;
      }
      return {
        year: row.edition_year,
        edition_name: row.edition_name,
        definition: row.definition_text,
        page_number: row.page_number,
        status: status
      };
    });

    return { headword, timeline };
  }
}
```

---

### 5. `src/modules/words/words.controller.ts`
```typescript
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { WordsService } from './words.service';

@Controller('api/v1/words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get(':headword/detail')
  getDetail(@Param('headword') headword: string) {
    return this.wordsService.getWordDetail(headword);
  }

  @Get(':headword/evolution')
  getEvolution(@Param('headword') headword: string) {
    return this.wordsService.getWordEvolution(headword);
  }

  @Post('compare')
  async compareWords(@Body() body: { headwords: string[] }) {
    const results = await Promise.all(
      body.headwords.map(hw => this.wordsService.getWordDetail(hw))
    );
    return { success: true, data: results };
  }
}
```

---

### 6. `src/main.ts` (เปิด CORS & Swagger)
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // เปิด CORS ทุก Origin สำหรับงาน Hackathon
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('THAI CONTEXT API')
    .setDescription('Official Backend REST APIs for Thai Context Platform')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📑 Swagger Docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
```
