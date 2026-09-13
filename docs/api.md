# THAI CONTEXT — API Reference

Base URL: `http://localhost:3001`  
Interactive Swagger UI: `http://localhost:3001/api/docs`  
FastAPI Docs: `http://localhost:8000/docs`

---

## 1. System Health

### `GET /health`
Returns system operational status.

**Response:**
```json
{
  "status": "ok"
}
```

---

## 2. Search Endpoints

### `GET /api/v1/search`
Keyword search supporting exact match, partial headword, and definition fulltext.

**Query Parameters:**
- `q` (required): Search keyword (e.g. `ประสิทธิภาพ`)
- `edition` (optional): `2542`, `2554`, `2569`
- `source` (optional): `ROYAL_SOCIETY`, `DIALECT_INSTITUTE`

**Response:**
```json
{
  "query": "ประสิทธิภาพ",
  "results": [
    {
      "word": "ประสิทธิภาพ",
      "definition": "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด",
      "partOfSpeech": "น.",
      "source": "สำนักงานราชบัณฑิตยสภา",
      "edition": "2554"
    }
  ]
}
```

---

### `POST /api/v1/search/meaning`
Meaning-first search: “ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน”

**Request Body:**
```json
{
  "query": "ทำงานได้ดี ใช้เวลาและทรัพยากรน้อย"
}
```

**Response:**
```json
{
  "query": "ทำงานได้ดี ใช้เวลาและทรัพยากรน้อย",
  "intent": "find_word_by_meaning",
  "results": [
    {
      "word": "ประสิทธิภาพ",
      "score": 0.94,
      "reason": "มีความหมายสอดคล้องกับ 'ทำงานได้ดี ใช้เวลาและทรัพยากรน้อย' โดยนิยามระบุว่า 'ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด'",
      "source": {
        "name": "สำนักงานราชบัณฑิตยสภา",
        "edition": "2554"
      }
    }
  ]
}
```

---

### `POST /api/v1/search/context`
Context-aware recommendation with excluded words filter.

**Request Body:**
```json
{
  "query": "อยากบอกว่าทำงานเร็ว แต่ไม่อยากใช้คำว่าเร็ว",
  "context": "รายงานมหาวิทยาลัย"
}
```

**Response:**
```json
{
  "intent": "find_alternative_word",
  "context": "รายงานมหาวิทยาลัย",
  "excludedTerms": ["เร็ว"],
  "results": [
    {
      "word": "ว่องไว",
      "score": 0.88,
      "reason": "...",
      "evidence": [...]
    }
  ]
}
```

---

## 3. Dictionary & Evolution Endpoints

### `GET /api/v1/dictionary/words/:word`
Returns full dictionary details with clear separation between Official Information and AI Assistance.

### `GET /api/v1/dictionary/words/:word/evolution`
Returns historical timeline of definitions across 2542, 2554, and 2569 editions.

### `GET /api/v1/dictionary/compare/:word`
Returns change detection status per edition (`ADDED`, `CHANGED`, `UNCHANGED`, `NO_DATA`).

---

## 4. Word Comparison

### `POST /api/v1/compare`
Compares nuanced differences between 2 to 5 words.

**Request Body:**
```json
{
  "words": ["อนุมัติ", "เห็นชอบ"]
}
```

**Response:**
```json
{
  "words": [
    {
      "word": "อนุมัติ",
      "definition": "ให้อำนาจกระทำการตามระเบียบที่กำหนดไว้",
      "partOfSpeech": "ก."
    },
    {
      "word": "เห็นชอบ",
      "definition": "เห็นว่าถูกต้อง สมควร หรือเหมาะสม",
      "partOfSpeech": "ก."
    }
  ],
  "comparison": {
    "meaningDifference": "...",
    "contextDifference": "...",
    "usageGuidance": "..."
  },
  "evidence": [...]
}
```

---

## 5. Dialect Explorer

### `GET /api/v1/dialect`
Query parameters: `region` (`NORTH`, `NORTHEAST`, `SOUTH`, `CENTRAL`), `word`, `meaning`.

### `GET /api/v1/dialect/mapping/:word`
Returns mapped regional terms with explicit badges:
- `OFFICIAL`
- `AI_INFERRED`

---

## 6. Grounded RAG Assistant

### `POST /api/v1/ai/chat`
Ask questions grounded strictly in retrieved dictionary evidence.

**Request Body:**
```json
{
  "message": "ถ้าจะใช้คำนี้ในรายงานมหาวิทยาลัย ควรใช้คำไหน?"
}
```

**Response:**
```json
{
  "answer": "...",
  "grounded": true,
  "evidence": [
    {
      "word": "ประสิทธิภาพ",
      "source": "สำนักงานราชบัณฑิตยสภา",
      "edition": "2554",
      "definition": "...",
      "relevance": 0.93
    }
  ]
}
```

---

## 7. Search Feedback

### `POST /api/v1/feedback`
Submits user feedback and interaction metrics.
