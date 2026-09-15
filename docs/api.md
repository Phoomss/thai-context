# THAI CONTEXT — API Reference

เอกสารอ้างอิง API Endpoints ทั้งหมดสำหรับระบบ THAI CONTEXT  
- **Base URL:** `http://localhost:3001`  
- **Interactive Swagger UI:** `http://localhost:3001/api/docs`  
- **AI Service Docs (FastAPI):** `http://localhost:8000/docs`

---

## 1. System Health

### `GET /health`
ตรวจสอบสถานะความพร้อมของ Core Backend และการเชื่อมต่อไปยัง AI Service

**Response (200 OK):**
```json
{
  "status": "ok",
  "aiService": "ok"
}
```

---

## 2. Intelligent Search

### `GET /api/v1/search`
*รองรับ FR-01 (Keyword Search)*  
ค้นหาคำศัพท์ด้วยคีย์เวิร์ด รองรับทั้งคำเต็มและคำบางส่วน (Partial Match) ผ่าน GIN Trigram Index

**Parameters:**
- `q` (string, required): คำค้นหา เช่น `คุกกี้` หรือ `ประสิทธิภาพ`
- `edition` (string, optional): กรองตามปีฉบับ เช่น `2554`, `2567`
- `source` (string, optional): รหัสแหล่งข้อมูล เช่น `ROYAL_SOCIETY`, `WIKTIONARY`

**Response:**
```json
{
  "query": "คุกกี้",
  "results": [
    {
      "word": "คุกกี้",
      "definition": "ชื่อขนมชนิดหนึ่งจำพวกขนมเค้ก แต่ทำเป็นชิ้นเล็ก ๆ แบน ๆ แล้วอบให้กรอบ",
      "partOfSpeech": "น.",
      "source": "วิกิพจนานุกรมภาษาไทย (Wiktionary)",
      "edition": "2567"
    }
  ]
}
```

---

### `POST /api/v1/search/meaning`
*รองรับ FR-02, FR-03, FR-06 (Meaning-first Search & Explain Recommendation)*  
ค้นพบคำศัพท์จากคำบรรยายความหมายหรือเจตนา โดยไม่ต้องทราบคำศัพท์ล่วงหน้า

**Request Body:**
```json
{
  "query": "โปรแกรมคอมพิวเตอร์ใช้ในทางอินเทอร์เน็ตสำหรับเก็บข้อมูลของผู้ใช้งาน"
}
```

**Response:**
```json
{
  "query": "โปรแกรมคอมพิวเตอร์ใช้ในทางอินเทอร์เน็ตสำหรับเก็บข้อมูลของผู้ใช้งาน",
  "intent": "find_word_by_meaning",
  "results": [
    {
      "word": "คุกกี้",
      "score": 0.95,
      "reason": "มีความหมายสอดคล้องกับ 'โปรแกรมคอมพิวเตอร์' โดยนิยามระบุว่า 'โปรแกรมคอมพิวเตอร์ใช้ในทางอินเทอร์เน็ตสำหรับเก็บข้อมูลของผู้ใช้งาน'",
      "source": {
        "name": "วิกิพจนานุกรมภาษาไทย (Wiktionary)",
        "edition": "2567"
      }
    }
  ]
}
```

---

### `POST /api/v1/search/context`
*รองรับ FR-04, FR-05 (Query Understanding & Context-aware Recommendation)*  
ค้นหาและจัดอันดับคำแนะนำตามบริบท พร้อมสกัดและคัดแยกคำที่ผู้ใช้ต้องการหลีกเลี่ยง (Excluded Terms)

**Request Body:**
```json
{
  "query": "ทำงานได้ผลลัพธ์ดีเลิศ แต่ไม่เอาคำว่าเร็ว",
  "context": "รายงานราชการ"
}
```

**Response:**
```json
{
  "intent": "find_alternative_word",
  "context": "รายงานราชการ",
  "excludedTerms": ["เร็ว"],
  "results": [
    {
      "word": "ประสิทธิภาพ",
      "score": 0.94,
      "reason": "ตรงกับบริบทรายงานราชการ โดยเน้นความคุ้มค่าของผลลัพธ์และกระบวนการทำงาน"
    }
  ]
}
```

---

## 3. Dictionary Intelligence & Evolution

### `GET /api/v1/dictionary/words/{headword}`
*รองรับ FR-07, FR-08, FR-14 (Word Detail & Multi-Version Catalog)*  
ดึงโครงสร้างคำศัพท์ฉบับทางการครบถ้วน แยกชั้นระหว่าง `officialData` และ `aiAssistance`

**Response:**
```json
{
  "word": "คุกกี้",
  "charLength": 6,
  "officialData": {
    "entries": [
      {
        "edition": "2567",
        "editionTitle": "วิกิพจนานุกรมภาษาไทย ฉบับดิจิทัล (Wiktextract)",
        "source": "วิกิพจนานุกรมภาษาไทย (Wiktionary)",
        "pronunciation": "คุก-กี้",
        "definitions": [
          {
            "pos": "น.",
            "posName": "คำนาม",
            "senseOrder": 1,
            "definitionText": "ชื่อขนมชนิดหนึ่งจำพวกขนมเค้ก แต่ทำเป็นชิ้นเล็ก ๆ แบน ๆ แล้วอบให้กรอบ"
          }
        ]
      }
    ],
    "relationships": [],
    "dialectMappings": []
  },
  "aiAssistance": {
    "summary": "คำว่า \"คุกกี้\" ในพจนานุกรมฉบับล่าสุดมุ่งเน้นความหมาย: \"ชื่อขนมชนิดหนึ่ง...\"",
    "recommendedContexts": ["เอกสารทั่วไป", "บทความวิชาการคอมพิวเตอร์"],
    "nuanceAnalysis": "เป็นคำยืมจากภาษาอังกฤษ มีทั้งความหมายด้านอาหารและด้านเทคโนโลยีสารสนเทศ",
    "disclaimer": "คำแนะนำนี้ประมวลผลโดย AI Assistance และอ้างอิงจากหลักฐานพจนานุกรมฉบับทางการ"
  }
}
```

---

### `GET /api/v1/dictionary/words/{headword}/evolution`
*รองรับ FR-09 (Dictionary Evolution Timeline)*  
แสดงวิวัฒนาการความหมายของคำข้ามยุคสมัย (พ.ศ. 2542 ➔ 2554 ➔ 2569)

**Response:**
```json
{
  "headword": "ประสิทธิภาพ",
  "timeline": [
    {
      "editionYear": "2542",
      "title": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
      "status": "ADDED",
      "definitions": ["ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการทำงาน"]
    },
    {
      "editionYear": "2554",
      "title": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      "status": "CHANGED",
      "definitions": ["ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด"]
    },
    {
      "editionYear": "2569",
      "title": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙ (ฉบับดิจิทัล)",
      "status": "CHANGED",
      "definitions": ["ความสามารถในการปฏิบัติการที่ให้ผลลัพธ์สูงสุดโดยสูญเสียทรัพยากร พลังงาน หรือเวลาน้อยที่สุด ครอบคลุมทั้งระบบการทำงานและเทคโนโลยี"]
    }
  ]
}
```

---

### `GET /api/v1/dictionary/compare/{headword}`
*รองรับ FR-10 (Dictionary Change Detection)*  
วิเคราะห์และเปรียบเทียบจุดเปลี่ยนแปลงของนิยามระหว่างปีพิมพ์ พร้อมแท็กสถานะ `ADDED`, `CHANGED`, `UNCHANGED`

---

## 4. Thai Language Exploration & Dialects

### `GET /api/v1/dialect`
*รองรับ FR-11 (Dialect Explorer)*  
สำรวจคำศัพท์ภาษาถิ่น 4 ภาค (NORTH, NORTHEAST, SOUTH, CENTRAL)

**Parameters:**
- `region` (string, optional): `NORTH`, `NORTHEAST`, `SOUTH`
- `word` (string, optional): คำศัพท์ถิ่น
- `meaning` (string, optional): ค้นหาจากความหมายท้องถิ่น

---

### `GET /api/v1/dialect/mapping/{centralWord}`
*รองรับ FR-12 (Standard ↔ Dialect Mapping)*  
ดึงแผนผังคู่เทียบเคียงคำภาษากลางและภาษาถิ่น พร้อมระบุป้ายกำกับ `OFFICIAL` หรือ `AI_INFERRED`

**Response:**
```json
{
  "standardWord": "อร่อย",
  "mappings": [
    { "word": "ลำ", "region": "ภาษาถิ่นเหนือ", "meaning": "รสชาติอร่อย มีรสโอชา", "type": "OFFICIAL", "confidence": 1.0 },
    { "word": "แซ่บ", "region": "ภาษาถิ่นอีสาน", "meaning": "รสชาติอร่อย เผ็ดนัว", "type": "OFFICIAL", "confidence": 1.0 },
    { "word": "หรอย", "region": "ภาษาถิ่นใต้", "meaning": "อร่อยมาก ได้รสชาติ", "type": "OFFICIAL", "confidence": 1.0 }
  ]
}
```

---

## 5. Word Comparison & Usage Guidance

### `POST /api/v1/compare`
*รองรับ FR-13, FR-14 (Context Compare & Usage Guidance)*  
เปรียบเทียบความแตกต่างระหว่างคำศัพท์ใกล้เคียง Side-by-Side

**Request Body:**
```json
{
  "words": ["คุกกี้", "เค้ก"]
}
```

**Response:**
```json
{
  "words": [
    { "word": "คุกกี้", "definition": "ชื่อขนมชนิดหนึ่งจำพวกขนมเค้ก แต่ทำเป็นชิ้นเล็ก ๆ แบน ๆ แล้วอบให้กรอบ", "partOfSpeech": "น." },
    { "word": "เค้ก", "definition": "ขนมฝรั่งชนิดหนึ่ง ทำด้วยแป้งสาลีผสมไข่ เนย น้ำตาล", "partOfSpeech": "น." }
  ],
  "comparison": {
    "meaningDifference": "'คุกกี้' หมายถึงขนมอบกรอบชิ้นเล็ก ในขณะที่ 'เค้ก' หมายถึงขนมเนื้อนุ่มขึ้นฟู",
    "contextDifference": "คำว่า 'คุกกี้' ใช้ได้ทั้งในบริบทขนมและเทคโนโลยีคอมพิวเตอร์ ส่วน 'เค้ก' ใช้ในบริบทอาหารและของหวาน",
    "usageGuidance": "เลือกใช้ตามลักษณะทางกายภาพของสิ่งของหรือบริบทด้านไอที"
  },
  "evidence": [
    { "word": "คุกกี้", "source": "สำนักงานราชบัณฑิตยสภา", "edition": "2567", "relevance": 1.0 },
    { "word": "เค้ก", "source": "สำนักงานราชบัณฑิตยสภา", "edition": "2567", "relevance": 1.0 }
  ]
}
```

---

## 6. Trusted AI, RAG & Feedback

### `POST /api/v1/ai/chat`
*รองรับ FR-15, FR-16, FR-17 (Grounded RAG Writing Assistant & Hallucination Guard)*  
ผู้ช่วย AI ตอบคำถามและให้คำปรึกษาการใช้คำ (Writing Assistant) โดยถูกควบคุมด้วยหลักฐานพจนานุกรมทางการ แยกส่วน Official Facts และ AI Writing Suggestions อย่างเด็ดขาด พร้อมคำนวณ Evidence Confidence

**Request Body:**
```json
{
  "message": "คำว่า ประสิทธิภาพ ใช้ในรายงานวิชาการได้ไหม",
  "word": "ประสิทธิภาพ",
  "context": "academic"
}
```

**Response (200 OK — Grounded):**
```json
{
  "answer": "📖 **[ข้อมูลจากพจนานุกรมทางการ — แหล่งอ้างอิงหลัก]**\nคำว่า **\"ประสิทธิภาพ\"** บันทึกใน สำนักงานราชบัณฑิตยสภา (ฉบับ พ.ศ. 2554)\n• **นิยามทางการ:** \"ความสามารถที่ทำให้เกิดผลในการทำงาน\"...\n\n✍️ **[ตัวอย่างประโยค/ข้อแนะนำการเรียบเรียง (สร้างโดย AI — มิใช่ตัวอย่างทางการ)]**\n> \"การบริหารจัดการโครงการอย่างเป็นระบบจะช่วยเพิ่มประสิทธิภาพในการดำเนินงานขององค์กรได้อย่างมีนัยสำคัญ\"",
  "grounded": true,
  "abstained": false,
  "confidence": 0.92,
  "confidence_level": "HIGH",
  "evidence": [
    {
      "word": "ประสิทธิภาพ",
      "source": "สำนักงานราชบัณฑิตยสภา",
      "edition": "2554",
      "definition": "ความสามารถที่ทำให้เกิดผลในการทำงาน",
      "source_type": "OFFICIAL",
      "relevance": 0.95
    }
  ],
  "generated_content": [
    {
      "type": "writing_suggestion",
      "content": "การบริหารจัดการโครงการอย่างเป็นระบบจะช่วยเพิ่มประสิทธิภาพในการดำเนินงานขององค์กรได้อย่างมีนัยสำคัญ"
    }
  ]
}
```

*(กรณีคำที่ไม่มีในพจนานุกรม หรือหลักฐานไม่เพียงพอ ระบบจะ Abstain: `{"answer": "ไม่พบข้อมูลที่เพียงพอ...", "grounded": false, "abstained": true, "confidence": 0.12, "confidence_level": "LOW", "evidence": []}`)*

---

### `POST /api/v1/ai/chat/stream`
*รองรับ FR-15, FR-16, FR-17 (SSE Streaming for AI Writing Assistant)*  
สตรีมคำตอบแบบ Server-Sent Events (SSE) สำหรับ AI Writing Assistant Consultation Drawer แบบ Real-time

**Headers:**
- `Content-Type`: `application/json`
- `Accept`: `text/event-stream`

**Request Body:**
```json
{
  "message": "ช่วยเรียบเรียงประโยคโดยใช้คำว่า อนุมัติ ให้สุภาพ",
  "word": "อนุมัติ",
  "context": "formal"
}
```

**SSE Event Sequence:**
```text
event: start
data: {"request_id":"c4b9...","abstained":false,"word":"อนุมัติ"}

event: token
data: {"text":"📖 **[ข้อมูลจาก"}

event: token
data: {"text":"พจนานุกรมทางการ]**"}

event: evidence
data: {"word":"อนุมัติ","edition":"2554","source":"สำนักงานราชบัณฑิตยสภา","definition":"ให้อำนาจกระทำการตามหน้าที่หรือระเบียบที่กำหนดไว้","source_type":"OFFICIAL","relevance":0.95}

event: complete
data: {"confidence":0.92,"confidence_level":"HIGH","grounded":true,"abstained":false,"generated_content":[{"type":"writing_suggestion","content":"คณะกรรมการได้พิจารณาตามระเบียบแล้วมีมติอนุมัติตามข้อเสนอที่เสนอมา"}]}
```

---

### `POST /api/v1/feedback`
*รองรับ FR-18 (Search Feedback)*  
บันทึกการประเมินผลของผู้ใช้เพื่อนำไปปรับปรุง Ranking Weights

**Request Body:**
```json
{
  "queryText": "ทำงานสำเร็จอย่างรวดเร็ว",
  "userAction": "THUMBS_UP",
  "rating": 5,
  "feedbackNotes": "แนะนำคำว่า ประสิทธิภาพ ได้ตรงบริบทมาก"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "feedbackId": "63b3d75b-3cf6-4319-8b23-7d05ba6cfd12",
  "message": "Feedback recorded successfully"
}
```

---

## 7. Accessibility & Multilingual Intelligence

### `GET /api/v1/dictionary/words/:word/accessibility`
ดึงข้อมูลแพ็กรวมสำหรับการเข้าถึงภาษาไทยแบบครบวงจร (Universal Accessibility Pack) สำหรับคำศัพท์ที่ระบุ ประกอบด้วย:
- คำอ่านภาษาไทยและระบบถอดอักษรโรมัน RTGS (ราชบัณฑิตยสภา) + IPA
- คำแปลและคำอธิบายภาษาอังกฤษ (ระบุ Provenance ชัดเจน)
- ภาษามือไทย (TSL) พร้อมคำบรรยายท่ามือและคลิปวิดีโออ้างอิง
- สถานะระบบเสียงสังเคราะห์ (TTS)

**Example Request:**  
`GET /api/v1/dictionary/words/ประสิทธิภาพ/accessibility`

**Response (200 OK):**
```json
{
  "headword": "ประสิทธิภาพ",
  "pronunciation": {
    "phoneticSpelling": "ประ-สิด-ทิ-พาบ",
    "transliterationRtgs": "pra-sit-thi-phap",
    "ipaNotation": "praʔ˨˩.sit̚˨˩.tʰi˦˥.pʰaːp̚˥˩",
    "tonePattern": "L-L-H-L",
    "syllables": ["pra", "sit", "thi", "phap"],
    "sourceType": "OFFICIAL_DATA"
  },
  "translations": [
    {
      "translatedWord": "efficiency",
      "languageCode": "en",
      "secondaryTranslations": ["competence", "productivity", "performance"],
      "contextualExplanation": "The ability to produce maximum productive output with the least waste of time, resources, or energy.",
      "provenance": "OFFICIAL_CURATED",
      "confidenceScore": 1.0
    }
  ],
  "signLanguage": [
    {
      "signName": "ประสิทธิภาพ",
      "handshapeDescription": "มือขวาตั้งนิ้วชี้และนิ้วกลาง หมุนวนเป็นเกลียวไปข้างหน้าแล้วประกบฝ่ามือซ้าย",
      "dialectRegion": "CENTRAL",
      "verificationStatus": "OFFICIAL",
      "sourceAttribution": "วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล",
      "media": [
        {
          "mediaType": "VIDEO_MP4",
          "mediaUrl": "https://assets.thai-context.org/tsl/videos/prasitthiphap.mp4",
          "isPrimary": true
        }
      ]
    }
  ],
  "tts": {
    "supported": true,
    "synthesizeEndpoint": "/api/v1/tts/synthesize"
  }
}
```

---

### `GET /api/v1/dictionary/words/:word/pronunciation`
ดึงเฉพาะข้อมูลคำอ่านและการถอดอักษรโรมัน RTGS

**Response (200 OK):**
```json
{
  "phoneticSpelling": "ประ-สิด-ทิ-พาบ",
  "transliterationRtgs": "pra-sit-thi-phap",
  "ipaNotation": "praʔ˨˩.sit̚˨˩.tʰi˦˥.pʰaːp̚˥˩",
  "tonePattern": "L-L-H-L",
  "syllables": ["pra", "sit", "thi", "phap"],
  "sourceType": "OFFICIAL_DATA"
}
```

---

### `GET /api/v1/dictionary/words/:word/translations`
ดึงเฉพาะข้อมูลคำแปลและคำอธิบายภาษาอังกฤษ

**Response (200 OK):**
```json
[
  {
    "translatedWord": "efficiency",
    "languageCode": "en",
    "contextualExplanation": "The ability to produce maximum productive output with least consumption of inputs.",
    "provenance": "OFFICIAL_CURATED",
    "confidenceScore": 1.0
  }
]
```

---

### `GET /api/v1/dictionary/words/:word/sign-language`
ดึงเฉพาะข้อมูลภาษามือไทย (Thai Sign Language)

**Response (200 OK):**
```json
[
  {
    "signName": "ประสิทธิภาพ",
    "handshapeDescription": "มือขวาตั้งนิ้วชี้และนิ้วกลาง หมุนวนเป็นเกลียวไปข้างหน้าแล้วประกบฝ่ามือซ้าย",
    "dialectRegion": "CENTRAL",
    "verificationStatus": "OFFICIAL",
    "sourceAttribution": "วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล",
    "media": [
      {
        "mediaType": "VIDEO_MP4",
        "mediaUrl": "https://assets.thai-context.org/tsl/videos/prasitthiphap.mp4",
        "isPrimary": true
      }
    ]
  }
]
```

---

## 8. Text-to-Speech (TTS) Engine

### `POST /api/v1/tts/synthesize`
แปลงข้อความภาษาไทยหรือคำศัพท์เป็นไฟล์เสียง (Base64 Encoded Audio) โดยมีกลไก Multi-Provider Sequence และ Local Fallback อัตโนมัติ (Zero-Crash Guarantee)

**Request Body:**
```json
{
  "text": "ประสิทธิภาพ",
  "voice": "th-TH-PremwadeeNeural",
  "speed": 1.0
}
```

**Response (200 OK):**
```json
{
  "audioBase64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA...",
  "format": "wav",
  "provider": "AI_SERVICE_TTS",
  "cached": false,
  "durationMs": 1320
}
```

---

### `GET /api/v1/tts/status`
ตรวจสอบความพร้อมของ TTS Engine Providers และสถานะ Fallback

**Response (200 OK):**
```json
{
  "providers": [
    { "name": "AI_SERVICE_TTS", "available": true },
    { "name": "LOCAL_MOCK_FALLBACK", "available": true }
  ],
  "activeDefault": "AI_SERVICE"
}
```

