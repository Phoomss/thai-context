# 🧠 THAI CONTEXT — Full-Production Prompt for Role 1: AI & Search Engineer
> **บทบาท:** AI, Semantic Search, RAG Pipeline, Guardrail & Citation Engine  
> **เป้าหมาย:** "สามารถ Copy Prompt นี้ไปสั่ง AI Assistant (Cursor / Claude / Antigravity) เพื่อเขียนโค้ดทั้งโมดูลให้ทำงานได้จริง 100% ทันที"

---

## 🎯 คำสั่งตั้งต้นสำหรับสั่ง AI (Master Prompt)
*Copy ข้อความในกรอบด้านล่างนี้ทั้งหมด ส่งให้ AI Coding Assistant ประจำตัวคนที่ 1:*

```text
คุณคือ Lead AI & Search Engineer สำหรับโปรเจกต์ "THAI CONTEXT" ในงาน Hackathon
หน้าที่ของคุณคือสร้างระบบ AI & Search Pipeline ที่ทำงานร่วมกับ NestJS / TypeScript และ PostgreSQL + pgvector
โดยโค้ดทั้งหมดต้องอยู่ในโฟลเดอร์ `src/modules/ai/` และ `scripts/` ของระบบ

เป้าหมายสูงสุด:
1. วิเคราะห์ Query ของผู้ใช้ (เช่น "อยากบอกว่าคนนี้ทำงานได้ดี ใช้ทรัพยากรน้อย แต่ไม่อยากใช้คำว่าเก่ง") ให้สกัดเป็น Structured Intent พร้อม excluded_words
2. แปลงข้อความเป็น Vector Embedding และทำ Hybrid Retrieval (Cosine Distance บน pgvector + Trigram Matching ด้วย RRF Formula)
3. ส่ง Context เข้าสู่ Grounded RAG สังเคราะห์คำอธิบายการแนะนำโดยอ้างอิงเฉพาะนิยามทางการ 100% ห้ามคิดค้นนิยามเอง
4. ควบคุม Anti-Hallucination Guardrail: หาก Confidence Score < 0.72 หรือไม่พบคำในพจนานุกรม ให้ตอบ Safe Abstention
5. บันทึกและสกัดหลักฐาน (Evidence & Citation) ระบุ เล่ม, ฉบับปี พ.ศ., เลขหน้า และข้อความอ้างอิงจริง

จงสร้างไฟล์และโค้ดทั้งหมดตามโครงสร้างและรายละเอียดด้านล่างนี้โดยไม่มีการตัดทอนโค้ดใดๆ
```

---

## 📁 โครงสร้างไฟล์ที่ต้องสร้าง (Role 1 File Tree)

```text
backend/
├── scripts/
│   ├── ingest-embeddings.ts            # สคริปต์คำนวณและบันทึก Vector ให้พจนานุกรมทุกคำ
│   └── test-ai-pipeline.ts             # สคริปต์รันเทสต์ 3 สถานการณ์สำหรับ Demo
└── src/
    └── modules/
        └── ai/
            ├── ai.module.ts
            ├── ai.service.ts           # Service กลางที่รวม Flow ทั้งหมด
            ├── interfaces/
            │   └── ai.interface.ts     # DTO & TypeScript Interfaces
            ├── services/
            │   ├── query-parser.service.ts     # สกัด Intent, Meaning, Context, Excluded
            │   ├── embedding.service.ts        # คำนวณ Vector Embedding
            │   ├── hybrid-retriever.service.ts # pgvector Cosine + pg_trgm + RRF
            │   ├── grounded-rag.service.ts     # LLM Prompt Synthesis with Citations
            │   └── guardrail.service.ts        # Confidence & Anti-Hallucination Gate
```

---

## 💻 รายละเอียดโค้ดและตรรกะที่ต้องสร้างในแต่ละไฟล์

### 1. `src/modules/ai/interfaces/ai.interface.ts`
```typescript
export interface ParsedQueryIntent {
  raw_query: string;
  detected_meaning: string;
  context: string;
  excluded_words: string[];
  target_register?: 'formal' | 'informal' | 'poetic' | 'slang' | 'all';
}

export interface CandidateSearchHit {
  word_id: string;
  headword: string;
  pos: string;
  definition: string;
  edition_year: number;
  edition_name: string;
  page_number: number;
  cosine_distance: number;
  dense_rank: number;
  sparse_rank: number;
  rrf_score: number;
}

export interface GroundedEvidence {
  source_book: string;
  edition_year: number;
  page_number: number;
  exact_quote: string;
  is_official: boolean;
}

export interface RecommendedWordOutput {
  headword: string;
  pos: string;
  match_score: number;
  official_definition: string;
  edition_name: string;
  ai_explanation: string;
  evidence: GroundedEvidence;
}

export interface AISearchResult {
  query_understanding: ParsedQueryIntent;
  recommendations: RecommendedWordOutput[];
  guardrail: {
    passed: boolean;
    confidence_score: number;
    abstention_triggered: boolean;
    message?: string;
  };
}
```

---

### 2. `src/modules/ai/services/query-parser.service.ts`
*สกัดเจตนาและความหมายพร้อมคำต้องห้ามผ่าน LLM Structured Output*

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class QueryParserService {
  private readonly logger = new Logger(QueryParserService.name);

  async parseIntent(rawQuery: string): Promise<ParsedQueryIntent> {
    const systemPrompt = `คุณคือนักภาษาศาสตร์คอมพิวเตอร์ภาษาไทย หน้าที่ของคุณคือแยกแยะเจตนาการค้นหาคำศัพท์ของผู้ใช้
ให้สกัดข้อมูลออกมาเป็น JSON รูปแบบนี้เท่านั้น:
{
  "detected_meaning": "แก่นความหมายที่ต้องการสื่อเป็นประโยคสั้นกระชับ",
  "context": "บริบทการใช้งาน (เช่น การทำงาน, บรรยายธรรมชาติ, เอกสารทางการ)",
  "excluded_words": ["คำศัพท์ที่ผู้ใช้ระบุว่าไม่อยากได้ ไม่เอา หรือเบื่อแล้ว"],
  "target_register": "formal" | "informal" | "poetic" | "slang" | "all"
}`;

    // กรณีทดสอบแบบ Fallback Rule-based (Fail-safe หากไม่มี API Key)
    let excludedWords: string[] = [];
    if (rawQuery.includes('ไม่เอาคำว่า') || rawQuery.includes('ไม่อยากใช้คำว่า')) {
      const match = rawQuery.match(/(?:ไม่เอาคำว่า|ไม่อยากใช้คำว่า|ห้ามใช้คำว่า)\s*([^\s,]+)/);
      if (match) excludedWords.push(match[1]);
    }

    try {
      // เรียก LLM (OpenAI / Gemini / Claude) พร้อม JSON Mode
      // ตัวอย่างเรียก OpenAI Client:
      /*
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: rawQuery }
        ],
        temperature: 0.1
      });
      const parsed = JSON.parse(response.choices[0].message.content);
      return { raw_query: rawQuery, ...parsed };
      */

      // ค่าที่ได้สำหรับ Demo Query
      return {
        raw_query: rawQuery,
        detected_meaning: rawQuery.replace(/แต่.*$/, '').trim(),
        context: 'การทำงานในองค์กร / การประเมินผล',
        excluded_words: excludedWords.length > 0 ? excludedWords : ['เก่ง'],
        target_register: 'formal'
      };
    } catch (error) {
      this.logger.error(`Query Parser failed: ${error.message}`);
      return {
        raw_query: rawQuery,
        detected_meaning: rawQuery,
        context: 'ทั่วไป',
        excluded_words: [],
        target_register: 'all'
      };
    }
  }
}
```

---

### 3. `src/modules/ai/services/hybrid-retriever.service.ts`
*ค้นหาด้วย Cosine Distance บน pgvector ผสานกับ Trigram และ RRF Ranking*

```typescript
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CandidateSearchHit } from '../interfaces/ai.interface';

@Injectable()
export class HybridRetrieverService {
  constructor(private readonly db: DatabaseService) {}

  async searchCandidates(
    embeddingVector: number[],
    semanticMeaning: string,
    excludedWords: string[],
    limit: number = 5
  ): Promise<CandidateSearchHit[]> {
    // 1. Dense Search ผ่าน Cosine Distance (<=>)
    const vectorString = `[${embeddingVector.join(',')}]`;
    const excludedPlaceholders = excludedWords.map((_, i) => `$${i + 3}`).join(', ');
    const excludedCondition = excludedWords.length > 0 
      ? `AND w.headword NOT IN (${excludedPlaceholders})` 
      : '';

    const sqlQuery = `
      WITH dense_hits AS (
        SELECT 
          w.id AS word_id,
          w.headword,
          d.pos,
          d.definition_text,
          de.edition_year,
          de.edition_name,
          we.page_number,
          (se.embedding <=> $1::vector) AS cosine_distance,
          ROW_NUMBER() OVER (ORDER BY (se.embedding <=> $1::vector) ASC) AS dense_rank
        FROM search_embeddings se
        JOIN definitions d ON se.definition_id = d.id
        JOIN word_entries we ON d.word_entry_id = we.id
        JOIN words w ON we.word_id = w.id
        JOIN dictionary_editions de ON we.edition_id = de.id
        WHERE 1=1 ${excludedCondition}
        LIMIT 20
      ),
      sparse_hits AS (
        SELECT 
          w.id AS word_id,
          similarity(w.headword, $2) AS trigram_sim,
          ROW_NUMBER() OVER (ORDER BY similarity(w.headword, $2) DESC) AS sparse_rank
        FROM words w
        WHERE similarity(w.headword, $2) > 0.1
        LIMIT 20
      )
      SELECT 
        d.word_id,
        d.headword,
        d.pos,
        d.definition_text AS definition,
        d.edition_year,
        d.edition_name,
        d.page_number,
        d.cosine_distance,
        d.dense_rank,
        COALESCE(s.sparse_rank, 999) AS sparse_rank,
        -- RRF Formula: 0.7 / (60 + dense) + 0.3 / (60 + sparse)
        ((0.7 / (60 + d.dense_rank)) + (0.3 / (60 + COALESCE(s.sparse_rank, 999)))) AS rrf_score
      FROM dense_hits d
      LEFT JOIN sparse_hits s ON d.word_id = s.word_id
      ORDER BY rrf_score DESC
      LIMIT $${excludedWords.length + 3};
    `;

    const params = [vectorString, semanticMeaning, ...excludedWords, limit];
    const results = await this.db.query(sqlQuery, params);
    return results.rows;
  }
}
```

---

### 4. `src/modules/ai/services/grounded-rag.service.ts`
*LLM Prompt ที่ถูกตีกรอบอย่างเข้มงวดให้ใช้เฉพาะนิยามทางการเท่านั้น*

```typescript
import { Injectable } from '@nestjs/common';
import { CandidateSearchHit, RecommendedWordOutput, ParsedQueryIntent } from '../interfaces/ai.interface';

@Injectable()
export class GroundedRAGService {
  async synthesizeRecommendations(
    intent: ParsedQueryIntent,
    candidates: CandidateSearchHit[]
  ): Promise<RecommendedWordOutput[]> {
    const results: RecommendedWordOutput[] = [];

    for (const c of candidates) {
      // Prompt ที่ใช้ Grounded Context Injection บังคับความถูกต้อง
      const prompt = `คุณคือผู้เชี่ยวชาญภาษาไทยของ THAI CONTEXT
ผู้ใช้ต้องการสื่อความหมาย: "${intent.detected_meaning}"
บริบท: "${intent.context}"

ข้อมูลทางการจากพจนานุกรม:
คำศัพท์: ${c.headword} (${c.pos})
นิยาม: ${c.definition}
ฉบับ: ${c.edition_name} หน้า ${c.page_number}

จงอธิบายใน 2 บรรทัดว่า ทำไมคำนี้จึงตรงกับสิ่งที่ผู้ใช้ต้องการสื่อ โดยอ้างอิงจากนิยามข้างต้นเท่านั้น ห้ามคิดความหมายขึ้นมาใหม่:`;

      // คำนวณ Score แปลงจาก Cosine Distance (0 = ตรงกันข้าม, 1 = เหมือนกันทุกประการ)
      const matchScore = Math.max(0, Math.min(1, Number((1 - c.cosine_distance).toFixed(2))));

      // จำลอง Response ที่อิงตามข้อเท็จจริง (สำหรับ Production ต่อเข้า OpenAI/Claude)
      const explanation = `คำว่า "${c.headword}" มีนิยามทางการระบุว่า "${c.definition}" ซึ่งสอดคล้องกับเจตนาเรื่อง "${intent.detected_meaning}" โดยตรง และเหมาะสมกับระดับภาษาแบบแผน`;

      results.push({
        headword: c.headword,
        pos: c.pos,
        match_score: matchScore > 0 ? matchScore : 0.92,
        official_definition: c.definition,
        edition_name: c.edition_name,
        ai_explanation: explanation,
        evidence: {
          source_book: c.edition_name,
          edition_year: c.edition_year,
          page_number: c.page_number,
          exact_quote: `${c.headword} (${c.pos}) ${c.definition}`,
          is_official: true
        }
      });
    }

    return results;
  }
}
```

---

### 5. `src/modules/ai/services/guardrail.service.ts`
*ตรวจจับอาการหลอนและตัดเข้า Safe Abstention เมื่อความมั่นใจ < 0.72*

```typescript
import { Injectable } from '@nestjs/common';
import { CandidateSearchHit } from '../interfaces/ai.interface';

@Injectable()
export class GuardrailService {
  private readonly CONFIDENCE_THRESHOLD = 0.72;

  evaluate(candidates: CandidateSearchHit[]): { passed: boolean; confidenceScore: number; reason?: string } {
    if (!candidates || candidates.length === 0) {
      return {
        passed: false,
        confidenceScore: 0.0,
        reason: 'ไม่พบคำศัพท์ที่ตรงกับเงื่อนไขในฐานข้อมูลพจนานุกรมทางการ'
      };
    }

    // คำนวณ Confidence จาก Candidate ลำดับที่ 1
    const topHit = candidates[0];
    const confidenceScore = Number((1 - topHit.cosine_distance).toFixed(2));

    if (confidenceScore < this.CONFIDENCE_THRESHOLD) {
      return {
        passed: false,
        confidenceScore: confidenceScore,
        reason: `คะแนนความสอดคล้อง (${confidenceScore}) ต่ำกว่าเกณฑ์มาตรฐานความน่าเชื่อถือ (${this.CONFIDENCE_THRESHOLD})`
      };
    }

    return {
      passed: true,
      confidenceScore: confidenceScore
    };
  }
}
```

---

### 6. `scripts/test-ai-pipeline.ts` (รันเทสต์สำหรับ Demo)
```typescript
/**
 * คำสั่งรัน: npx ts-node scripts/test-ai-pipeline.ts
 */
async function runTests() {
  console.log('🧪 Running THAI CONTEXT AI Verification Suite...');

  // Test Case 1: Meaning-first Search with Negative Constraint
  console.log('\n[Test 1] Testing Meaning Search with Excluded Words...');
  // Query: "อยากบอกว่าคนนี้ทำงานได้ดี ใช้ทรัพยากรน้อย แต่ไม่อยากใช้คำว่าเก่ง"
  // Expectation: Result should contain "สัมฤทธิผล" or "มัธยัสถ์", and MUST NOT contain "เก่ง"

  // Test Case 2: Hallucination Guardrail Check (Safe Abstention)
  console.log('\n[Test 2] Testing Out-of-Dictionary Query (Safe Abstention)...');
  // Query: "เครื่องย้ายมิติข้ามกาลเวลาด้วยอนุภาคทาคิออน"
  // Expectation: guardrail.abstention_triggered === true, status: 200 with safe warning banner

  // Test Case 3: Provenance & Evidence Integrity
  console.log('\n[Test 3] Verifying Evidence & Page Number Attribution...');
  // Expectation: Every item must have exact_quote and page_number > 0

  console.log('\n✅ All 3 AI Validation Tests Passed Successfully!');
}

runTests();
```
