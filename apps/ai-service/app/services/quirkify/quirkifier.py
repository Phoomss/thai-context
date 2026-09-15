import json
import logging
import re
from typing import List, Dict, Any, Optional
import httpx
import psycopg

from app.core.config import settings
from app.models.schemas import (
    QuirkifyRequest,
    QuirkifyResponse,
    WordMappingItem
)
from app.services.nlp.tokenizer import ThaiNLPTokenizer

logger = logging.getLogger(__name__)

QUIRKIFY_SYSTEM_PROMPT = """# Role: โปรแกรมสุ่มเปลี่ยนคำในประโยค (Thai In-Sentence Word Scrambler)

คุณมีหน้าที่สุ่มเปลี่ยน "เฉพาะคำในประโยค" ภาษาไทย โดย:
1. **คงโครงสร้างประโยคเดิมไว้ 100%**: ห้ามแต่งประโยคใหม่ ห้ามเติมคำเกริ่นนำ คำสร้อย หรือคำลงท้ายยาวๆ (ห้ามเติม 'ในทิวากาลนี้ ข้าพเจ้าขอประกาศิตว่า...' หรือคำใดๆ ที่ไม่มีในประโยคเดิม)
2. **สุ่มเปลี่ยนเฉพาะ 1-3 คำในประโยค**: เลือกคำสำคัญในประโยคเดิม (เช่น คำกริยา คำนาม หรือคำวิเศษณ์) แล้วสุ่มแทนที่ด้วยคำศัพท์จาก "Candidate Words from Database" หรือคำในพจนานุกรมราชบัณฑิตยสภา
3. **ใส่เครื่องหมายอัญประกาศรอบคำที่ถูกเปลี่ยน**: เช่น เดิม "วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว" -> "วันนี้ 'ระโหยโรยแรง' อยากกลับไป 'จำศีล' แล้ว"
4. แสดงรายการคำที่ถูกเปลี่ยน (word_mappings) พร้อมนิยามทางการจากพจนานุกรมราชบัณฑิตยสภา

---

## กฎเหล็ก (Strict Rules):
1. **ห้ามเปลี่ยนโครงสร้างประโยค**: ประโยคผลลัพธ์ต้องตรงกับประโยคเดิมทุกประการ ยกเว้นเฉพาะคำที่ถูกสุ่มเปลี่ยนเท่านั้น
2. **Grounding**: คำที่นำมาแทนที่ต้องมีอยู่จริงในพจนานุกรมไทย และมีนิยามทางการรองรับ
3. **Word Breakdown**: แจกแจง original_phrase (คำเดิมที่ถูกแทน), replaced_word (คำใหม่ที่สุ่มมาแทน), และ official_definition เสมอ
4. **Format Output**: ตอบกลับเป็น JSON Schema ตามที่กำหนดเท่านั้น

---

## JSON Output Schema:
{
  "original_sentence": "string (ประโยคตั้งต้น)",
  "quirkified_sentence": "string (ประโยคเดิมที่สุ่มเปลี่ยนเฉพาะคำ โดยใส่เครื่องหมายอัญประกาศรอบคำที่เปลี่ยน เช่น 'ระโหยโรยแรง')",
  "vibe_style": "string (เช่น: 'สุ่มเปลี่ยนคำในประโยค (Word Scrambler)')",
  "punchline_explanation": "string (คำอธิบายการสุ่มเปลี่ยนคำ)",
  "word_mappings": [
    {
      "original_phrase": "string (คำ/วลีเดิมในประโยค)",
      "replaced_word": "string (คำที่นำมาสุ่มเปลี่ยนแทนที่)",
      "part_of_speech": "string (น. / ก. / ว. ฯลฯ)",
      "official_definition": "string (นิยามความหมายทางการจากพจนานุกรม)",
      "source_edition": "string (เช่น: สำนักงานราชบัณฑิตยสภา พ.ศ. 2554)",
      "quirk_reason": "string (เหตุผลทางภาษา)"
    }
  ]
}

---

## ตัวอย่างตัวนำ (Few-Shot Example):
- **Input:** "วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว"
- **Candidate Words from DB:**
  - ระโหยโรยแรง (ว. อ่อนเพลียหมดแรง, เพลียมาก)
  - จำศีล (ก. ถือศีล, กบดานอยู่นิ่งๆ ในที่พัก)
- **Output:**
{
  "original_sentence": "วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว",
  "quirkified_sentence": "วันนี้ 'ระโหยโรยแรง' อยากกลับไป 'จำศีล' แล้ว",
  "vibe_style": "สุ่มเปลี่ยนคำในประโยค (Word Scrambler)",
  "punchline_explanation": "สุ่มเปลี่ยนคำว่า เหนื่อยมาก เป็น ระโหยโรยแรง และ นอน เป็น จำศีล โดยคงโครงสร้างประโยคเดิม",
  "word_mappings": [
    {
      "original_phrase": "เหนื่อยมาก",
      "replaced_word": "ระโหยโรยแรง",
      "part_of_speech": "ว.",
      "official_definition": "อ่อนเพลียหมดกำลัง, อ่อนระโหย",
      "source_edition": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. 2554",
      "quirk_reason": "สุ่มเปลี่ยนคำกริยาวิเศษณ์ในประโยคด้วยศัพท์พจนานุกรม"
    },
    {
      "original_phrase": "นอน",
      "replaced_word": "จำศีล",
      "part_of_speech": "ก.",
      "official_definition": "ถือศีล, การที่สัตว์บางชนิดหลบอยู่นิ่ง ๆ ในฤดูหนาวหรือฤดูแล้งโดยไม่กินอาหาร",
      "source_edition": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. 2554",
      "quirk_reason": "สุ่มเปลี่ยนคำกริยาในประโยคด้วยศัพท์พจนานุกรม"
    }
  ]
}
"""

BEAUTIFY_SYSTEM_PROMPT = """# Role: บรมครูรังสรรค์ภาษาไทยอันวิจิตร (Thai Linguistic Beautifier & Elegance Refiner)

คุณคือผู้เชี่ยวชาญด้านวรรณศิลป์ การเกลาสำนวน และคลังคำภาษาไทย มีหน้าที่แปลง "ประโยคธรรมดา ภาษาพูด สแลง ห้วนๆ หรือประโยคแปลกๆ" ให้กลายเป็น "ประโยคภาษาไทยที่ไพเราะ สละสลวย วิจิตรบรรจง และงดงามตามหลักภาษา" (Reverse Quirkify: Make Beautiful) โดย:
1. ขัดเกลาเนื้อความเดิมให้งดงาม มีจังหวะจะโคน สัมผัสสละสลวย นุ่มนวล ทรงคุณค่าทางภาษา
2. เลือกใช้ "คำศัพท์ที่ระบบดึงมาจากฐานข้อมูล (Candidate Words from Database)" ซึ่งเป็นคำไวพจน์ คำที่มีความหมายเชิงบวก ศัพท์วรรณกรรม หรือคำสุภาพชั้นสูง เพื่อยกระดับประโยค
3. แสดงรายการ "คำที่เปลี่ยนไป" พร้อมระบุความหมายทางการจากพจนานุกรม และเหตุผลความไพเราะสละสลวย (Linguistic Elegance)

---

## กฎเหล็ก (Strict Rules):
1. **Tone & Style:** ต้องอ่านแล้วรู้สึกซาบซึ้ง ไพเราะ สุภาพ ชวนฟัง เป็นวรรณศิลป์อันงดงาม และยังคงความหมายเดิมของผู้พูดได้อย่างลึกซึ้ง
2. **Grounding:** คำที่เลือกมาขัดเกลาต้องนำมาจาก `Candidate Words from Database` ที่ระบบจัดเตรียมไว้ให้ หรือคำศัพท์ที่มีอยู่จริงในพจนานุกรมไทย ห้ามประดิษฐ์คำที่ไม่มีความหมายขึ้นมาเอง
3. **Word Breakdown:** ทุกจุดที่มีการแทนที่คำ ต้องแจกแจง `original_phrase` (คำเดิม), `replaced_word` (คำสละสลวยที่นำมาแทน), และ `official_definition` (นิยามทางการจากคลังคำ) เสมอ
4. **Format Output:** ตอบกลับเป็น JSON Schema ตามที่กำหนดเท่านั้น ห้ามมีคำเกริ่นนอกเหนือจาก JSON หรือข้อความอื่นใดนอกบล็อก JSON

---

## JSON Output Schema:
{
  "original_sentence": "string (ประโยคตั้งต้น)",
  "quirkified_sentence": "string (ประโยคที่ขัดเกลาแล้วอย่างสละสลวยและไพเราะ โดยใส่เครื่องหมายอัญประกาศรอบคำที่เปลี่ยน เช่น 'โอชาหาร')",
  "vibe_style": "string (เช่น: 'ร้อยแก้ววรรณศิลป์สละสลวย', 'ภาษาทางการสุภาพนุ่มนวล', 'สำนวนชวนรื่นรมย์')",
  "punchline_explanation": "string (คำอธิบายสุนทรียภาพทางภาษา ว่าประโยคนี้ถูกขัดเกลาให้ไพเราะและทรงคุณค่าขึ้นอย่างไร)",
  "word_mappings": [
    {
      "original_phrase": "string (คำ/วลีเดิมในประโยค)",
      "replaced_word": "string (คำสละสลวยที่นำมาใส่แทน)",
      "part_of_speech": "string (น. / ก. / ว. ฯลฯ)",
      "official_definition": "string (นิยามความหมายทางการจากพจนานุกรม)",
      "source_edition": "string (เช่น: สำนักงานราชบัณฑิตยสภา พ.ศ. 2554)",
      "quirk_reason": "string (เหตุผลความสละสลวยทางภาษาที่เลือกคำนี้มาเกลา)"
    }
  ]
}

---

## ตัวอย่างตัวนำ (Few-Shot Examples):

### Example 1:
- **Input:** "กินข้าวกันเหอะ หิวจะตายอยู่แล้ว"
- **Candidate Words from DB:**
  - โอชาหาร (น. อาหารที่มีรสอร่อย, อาหารอันโอชา)
  - ร่วมรับประทาน (ก. กินอาหารด้วยกันอย่างสุภาพ)
  - ยิ่งยวด (ว. เป็นที่สุด, ยิ่งนัก)
- **Output:**
{
  "original_sentence": "กินข้าวกันเหอะ หิวจะตายอยู่แล้ว",
  "quirkified_sentence": "ขอเรียนเชิญ 'ร่วมรับประทาน' 'โอชาหาร' ด้วยกันเถิด ด้วยความหิวโหยได้มาเยือนอย่าง 'ยิ่งยวด' แล้ว",
  "vibe_style": "ร้อยแก้ววรรณศิลป์สละสลวยและสุภาพ",
  "punchline_explanation": "เปลี่ยนการชวนกินข้าวแบบห้วนๆ ให้กลายเป็นการเชื้อเชิญรับประทานอาหารอันประณีตและเปี่ยมมารยาท",
  "word_mappings": [
    {
      "original_phrase": "กินข้าว",
      "replaced_word": "โอชาหาร",
      "part_of_speech": "น.",
      "official_definition": "อาหารอันมีรสอร่อย, อาหารที่น่าพึงใจ",
      "source_edition": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. 2554",
      "quirk_reason": "ยกระดับอาหารธรรมดาให้แลดูเป็นอาหารเลิศรสที่ชวนรื่นรมย์"
    },
    {
      "original_phrase": "จะตายอยู่แล้ว",
      "replaced_word": "ยิ่งยวด",
      "part_of_speech": "ว.",
      "official_definition": "เป็นที่สุด, เกินขนาด, ยิ่งนัก",
      "source_edition": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. 2554",
      "quirk_reason": "เปลี่ยนคำสแลงติดปากให้กลายเป็นคำวิเศษณ์ที่สง่างามและทรงพลัง"
    }
  ]
}
"""

CANDIDATE_GEMINI_MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
]

STYLE_LABELS_QUIRKIFY = {
    "ancient": "โบราณพงศาวดาร/วรรณคดี",
    "formal": "วิชาการราชการขั้นสุดโต่ง",
    "meme": "สำนวนกวีปั่นประสาท",
    "literary": "ร้อยกรองสละสลวยหลุดโลก",
    "dialect": "สำนวนภาษาถิ่นปนราชการ",
}

STYLE_LABELS_BEAUTIFY = {
    "poetic": "วรรณศิลป์ร้อยแก้วสละสลวย",
    "gentle": "ภาษาทางการสุภาพนุ่มนวล",
    "grand": "สุนทรพจน์เฉลิมฉลองทรงคุณค่า",
    "minimal": "คมคายลึกซึ้งสงบงาม",
    "ancient": "สำนวนวรรณกรรมคลาสสิก",
    "formal": "ภาษาทางการสละสลวย",
}

class QuirkifierService:
    def __init__(self, db_url: Optional[str] = None):
        self.db_url = db_url or settings.DATABASE_URL
        self.gemini_key = settings.GEMINI_API_KEY

    def retrieve_candidate_words(
        self,
        sentence: str,
        style: str = "ancient",
        mode: str = "quirkify",
        limit: int = 15
    ) -> List[Dict[str, Any]]:
        """Retrieves candidate words matching the user's sentence and mode from PostgreSQL."""
        tokens = [t for t in ThaiNLPTokenizer.extract_keywords(sentence) if len(t) > 1]
        all_tokens = list(dict.fromkeys(tokens + ThaiNLPTokenizer.tokenize(sentence)))
        content_tokens = [t for t in all_tokens if len(t) >= 2 and not t.isdigit()][:6]

        candidates: List[Dict[str, Any]] = []
        seen_words = set()

        try:
            with psycopg.connect(self.db_url, connect_timeout=2) as conn:
                with conn.cursor() as cur:
                    # 1. Semantic/keyword match for tokens
                    for token in content_tokens:
                        like_pat = f"%{token}%"
                        cur.execute("""
                            SELECT w.headword, pos.code, d.definition_text, de.edition_year
                            FROM words w
                            JOIN word_entries we ON we.word_id = w.id
                            JOIN definitions d ON d.entry_id = we.id
                            LEFT JOIN parts_of_speech pos ON d.pos_id = pos.id
                            LEFT JOIN dictionary_editions de ON we.edition_id = de.id
                            WHERE (d.definition_text LIKE %s OR w.headword LIKE %s)
                              AND w.headword <> %s
                            ORDER BY length(d.definition_text) ASC
                            LIMIT 3;
                        """, (like_pat, like_pat, token))
                        for row in cur.fetchall():
                            hw = row[0]
                            if hw not in seen_words and len(hw) >= 2:
                                seen_words.add(hw)
                                candidates.append({
                                    "headword": hw,
                                    "pos": row[1] or "น.",
                                    "definition": row[2],
                                    "edition": str(row[3] or "2554")
                                })

                    # 2. Mode-specific exotic/poetic words
                    if mode == "beautify":
                        # Fetch poetic, elegant, polite, and positive connotation words
                        cur.execute("""
                            SELECT w.headword, pos.code, d.definition_text, de.edition_year
                            FROM definitions d
                            JOIN word_entries we ON d.entry_id = we.id
                            JOIN words w ON we.word_id = w.id
                            LEFT JOIN parts_of_speech pos ON d.pos_id = pos.id
                            LEFT JOIN dictionary_editions de ON we.edition_id = de.id
                            WHERE (d.definition_text LIKE '%(กลอน)%'
                               OR d.definition_text LIKE '%(แบบ)%'
                               OR d.definition_text LIKE '%ไพเราะ%'
                               OR d.definition_text LIKE '%สุนทร%'
                               OR d.definition_text LIKE '%วิจิตร%'
                               OR d.definition_text LIKE '%รื่นรมย์%'
                               OR d.definition_text LIKE '%ประณีต%'
                               OR d.definition_text LIKE '%ผาสุก%'
                               OR d.definition_text LIKE '%โอชา%'
                               OR d.definition_text LIKE '%สิริ%')
                            ORDER BY random()
                            LIMIT 8;
                        """)
                    else:
                        # Quirkify mode
                        if style in ["ancient", "literary"]:
                            cur.execute("""
                                SELECT w.headword, pos.code, d.definition_text, de.edition_year
                                FROM definitions d
                                JOIN word_entries we ON d.entry_id = we.id
                                JOIN words w ON we.word_id = w.id
                                LEFT JOIN parts_of_speech pos ON d.pos_id = pos.id
                                LEFT JOIN dictionary_editions de ON we.edition_id = de.id
                                WHERE (d.definition_text LIKE '%(กลอน)%' 
                                   OR d.definition_text LIKE '%(โบ)%' 
                                   OR d.definition_text LIKE '%(แผลง)%'
                                   OR d.definition_text LIKE '%(ราชา)%')
                                ORDER BY random()
                                LIMIT 8;
                            """)
                        elif style == "formal":
                            cur.execute("""
                                SELECT w.headword, pos.code, d.definition_text, de.edition_year
                                FROM definitions d
                                JOIN word_entries we ON d.entry_id = we.id
                                JOIN words w ON we.word_id = w.id
                                LEFT JOIN parts_of_speech pos ON d.pos_id = pos.id
                                LEFT JOIN dictionary_editions de ON we.edition_id = de.id
                                WHERE (d.register_level = 'FORMAL' OR d.definition_text LIKE '%ราชการ%' OR d.definition_text LIKE '%ทางกฎหมาย%')
                                ORDER BY random()
                                LIMIT 8;
                            """)
                        elif style == "dialect":
                            cur.execute("""
                                SELECT dialect_word, 'คำถิ่น', local_meaning, 'ฉบับภาษาถิ่น'
                                FROM dialect_entries
                                ORDER BY random()
                                LIMIT 8;
                            """)
                        else:
                            cur.execute("""
                                SELECT w.headword, pos.code, d.definition_text, de.edition_year
                                FROM definitions d
                                JOIN word_entries we ON d.entry_id = we.id
                                JOIN words w ON we.word_id = w.id
                                LEFT JOIN parts_of_speech pos ON d.pos_id = pos.id
                                LEFT JOIN dictionary_editions de ON we.edition_id = de.id
                                ORDER BY random()
                                LIMIT 8;
                            """)

                    for row in cur.fetchall():
                        hw = row[0]
                        if hw not in seen_words and len(hw) >= 2:
                            seen_words.add(hw)
                            candidates.append({
                                "headword": hw,
                                "pos": row[1] or "น.",
                                "definition": row[2],
                                "edition": str(row[3] or "2554")
                            })

        except Exception as e:
            logger.warning(f"Failed to retrieve candidates from DB ({e}). Using fallback candidates.")
            if mode == "beautify":
                candidates = [
                    {"headword": "โอชาหาร", "pos": "น.", "definition": "อาหารอันมีรสอร่อย, อาหารที่น่าพึงใจ", "edition": "2554"},
                    {"headword": "สถิตเสถียร", "pos": "ว.", "definition": "มั่นคง, ตั้งอยู่นาน", "edition": "2554"},
                    {"headword": "รื่นรมย์", "pos": "ว.", "definition": "สบายใจ, น่าเพลิดเพลิน", "edition": "2554"},
                    {"headword": "วิจิตร", "pos": "ว.", "definition": "งามประณีต, งามแปลกตา", "edition": "2554"},
                    {"headword": "สหายสนิท", "pos": "น.", "definition": "มิตรผู้รู้ใจ, เพื่อนร่วมใจ", "edition": "2554"},
                    {"headword": "ยิ่งยวด", "pos": "ว.", "definition": "เป็นที่สุด, เกินขนาด, ยิ่งนัก", "edition": "2554"},
                ]
            else:
                candidates = [
                    {"headword": "ระโหยโรยแรง", "pos": "ว.", "definition": "อ่อนเพลียหมดกำลัง, อ่อนระโหย", "edition": "2554"},
                    {"headword": "นิวาสสถาน", "pos": "น.", "definition": "ที่อยู่, ที่พักอาศัย", "edition": "2554"},
                    {"headword": "จำศีล", "pos": "ก.", "definition": "ถือศีล, การที่สัตว์บางชนิดหลบอยู่นิ่ง ๆ ในที่พัก", "edition": "2554"},
                    {"headword": "บริโภค", "pos": "ก.", "definition": "กิน (ใช้เฉพาะอาหาร), ใช้สอย", "edition": "2554"},
                    {"headword": "สหาย", "pos": "น.", "definition": "เพื่อน, มิตร, ผู้ร่วมธุระ", "edition": "2554"},
                ]

        return candidates[:limit]

    def _call_gemini(self, system_prompt: str, user_prompt: str) -> Optional[str]:
        if not self.gemini_key:
            return None

        for model_name in CANDIDATE_GEMINI_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.gemini_key}"
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {"text": f"{system_prompt}\n\n---\n\n{user_prompt}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.65,
                    "maxOutputTokens": 2048,
                    "responseMimeType": "application/json"
                }
            }
            try:
                with httpx.Client(timeout=15.0) as client:
                    resp = client.post(url, json=payload, headers={"Content-Type": "application/json"})
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["candidates"][0]["content"]["parts"][0]["text"]
                    elif resp.status_code == 429:
                        logger.warning(f"Gemini model {model_name} rate limited (429). Trying next...")
                        continue
                    else:
                        logger.warning(f"Gemini {model_name} HTTP {resp.status_code}: {resp.text[:100]}")
            except Exception as e:
                logger.warning(f"Gemini error with {model_name}: {e}")
                continue
        return None

    def _heuristic_fallback(
        self,
        sentence: str,
        style: str,
        mode: str,
        candidates: List[Dict[str, Any]]
    ) -> QuirkifyResponse:
        """Heuristic fallback engine that strictly substitutes words in the sentence without rewriting structure."""
        tokens = [t for t in ThaiNLPTokenizer.extract_keywords(sentence) if len(t) > 1]
        if not tokens:
            tokens = [t for t in ThaiNLPTokenizer.tokenize(sentence) if len(t.strip()) > 1]

        selected_candidates = candidates[:2] if candidates else []
        word_mappings: List[WordMappingItem] = []

        transformed = sentence
        for idx, cand in enumerate(selected_candidates):
            if idx >= len(tokens):
                break
            target_token = tokens[idx]
            replaced_hw = cand["headword"]

            if target_token in transformed and len(target_token) >= 2:
                transformed = transformed.replace(target_token, f"'{replaced_hw}'", 1)
                word_mappings.append(
                    WordMappingItem(
                        original_phrase=target_token,
                        replaced_word=replaced_hw,
                        part_of_speech=cand.get("pos", "น."),
                        official_definition=cand.get("definition", "ความหมายตามพจนานุกรมทางการ"),
                        source_edition=f"สำนักงานราชบัณฑิตยสภา (ฉบับ {cand.get('edition', '2554')})",
                        quirk_reason="สุ่มเปลี่ยนคำในประโยคด้วยคำศัพท์จากคลังพจนานุกรม"
                    )
                )

        return QuirkifyResponse(
            original_sentence=sentence,
            quirkified_sentence=transformed,
            vibe_style="สุ่มเปลี่ยนคำในประโยค (Word Scrambler)",
            punchline_explanation="สุ่มเปลี่ยนเฉพาะคำในประโยคโดยรักษาโครงสร้างประโยคเดิม พร้อมนิยามจากพจนานุกรมราชบัณฑิตยสภา",
            word_mappings=word_mappings
        )


    def quirkify(self, request: QuirkifyRequest) -> QuirkifyResponse:
        sentence = request.sentence.strip()
        mode = (request.mode or "quirkify").lower()
        style = (request.style or "ancient").lower()

        if mode == "beautify":
            system_prompt = BEAUTIFY_SYSTEM_PROMPT
            style_label = STYLE_LABELS_BEAUTIFY.get(style, "วรรณศิลป์ร้อยแก้วสละสลวย")
            prompt_instruction = "จงขัดเกลาประโยคนี้ให้ออกมาไพเราะ สละสลวย สุภาพ และงดงามทางวรรณศิลป์ที่สุด โดยเลือกคำจากคลังคำข้างต้น และคืนค่าผลลัพธ์เป็น JSON ตาม Schema ที่กำหนดเท่านั้น"
        else:
            system_prompt = QUIRKIFY_SYSTEM_PROMPT
            style_label = STYLE_LABELS_QUIRKIFY.get(style, "โบราณพงศาวดาร")
            prompt_instruction = "จงแปลงประโยคนี้ให้ออกมาแปลก/ปั่นที่สุด โดยเลือกคำจากคลังคำข้างต้น และคืนค่าผลลัพธ์เป็น JSON ตาม Schema ที่กำหนดเท่านั้น"

        # 1. Retrieve candidates from DB
        candidates = self.retrieve_candidate_words(sentence, style=style, mode=mode, limit=12)

        # 2. Build user prompt
        candidate_summary = json.dumps([
            {
                "word": c["headword"],
                "pos": c.get("pos", "น."),
                "definition": c["definition"],
                "edition": c.get("edition", "2554")
            }
            for c in candidates
        ], ensure_ascii=False, indent=2)

        user_prompt = f"""ประโยคของผู้ใช้:
"{sentence}"

โหมด: {mode}
สไตล์ที่ต้องการ: {style_label}

คลังคำศัพท์ที่ค้นพบจากฐานข้อมูล (Candidate Words from PostgreSQL):
{candidate_summary}

{prompt_instruction}"""

        # 3. Call LLM
        raw_llm_output = self._call_gemini(system_prompt, user_prompt)

        # 4. Parse LLM output
        if raw_llm_output:
            try:
                cleaned_text = re.sub(r"^```(?:json)?\s*", "", raw_llm_output.strip())
                cleaned_text = re.sub(r"\s*```$", "", cleaned_text.strip())
                data = json.loads(cleaned_text)

                word_mappings = [
                    WordMappingItem(
                        original_phrase=m.get("original_phrase", ""),
                        replaced_word=m.get("replaced_word", ""),
                        part_of_speech=m.get("part_of_speech"),
                        official_definition=m.get("official_definition", ""),
                        source_edition=m.get("source_edition", "สำนักงานราชบัณฑิตยสภา"),
                        quirk_reason=m.get("quirk_reason", "คำสละสลวยจากคลังพจนานุกรม")
                    )
                    for m in data.get("word_mappings", [])
                ]

                quirkified_sentence = data.get("quirkified_sentence", sentence)
                quoted_tokens = re.findall(r"['\"“‘]([^'\"“”‘’]+)['\"”’]", quirkified_sentence)
                existing_words = {m.replaced_word.strip() for m in word_mappings if m.replaced_word}

                for qt in quoted_tokens:
                    clean_qt = qt.strip()
                    if not clean_qt or clean_qt in existing_words:
                        continue

                    # Search PostgreSQL for official grounding
                    found_db = False
                    try:
                        with psycopg.connect(self.db_url, connect_timeout=2) as conn:
                            with conn.cursor() as cur:
                                cur.execute("""
                                    SELECT w.headword, pos.code, d.definition_text, de.edition_year
                                    FROM words w
                                    JOIN word_entries we ON we.word_id = w.id
                                    JOIN definitions d ON d.entry_id = we.id
                                    LEFT JOIN parts_of_speech pos ON d.pos_id = pos.id
                                    LEFT JOIN dictionary_editions de ON we.edition_id = de.id
                                    WHERE w.headword = %s
                                    LIMIT 1;
                                """, (clean_qt,))
                                row = cur.fetchone()
                                if row:
                                    word_mappings.append(WordMappingItem(
                                        original_phrase="คำในประโยค",
                                        replaced_word=clean_qt,
                                        part_of_speech=row[1] or "น.",
                                        official_definition=row[2] or "นิยามตามพจนานุกรมราชบัณฑิตยสภา",
                                        source_edition=f"พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. {row[3] or '2554'}",
                                        quirk_reason="สุ่มเปลี่ยนคำในประโยคด้วยศัพท์จากคลังพจนานุกรมราชบัณฑิตยสภา"
                                    ))
                                    existing_words.add(clean_qt)
                                    found_db = True
                    except Exception as err:
                        logger.warning(f"Error grounding quoted token '{clean_qt}' from DB: {err}")

                    if not found_db:
                        # Fallback candidate check
                        cand = next((c for c in candidates if c.get("headword") == clean_qt), None)
                        if cand:
                            word_mappings.append(WordMappingItem(
                                original_phrase="คำในประโยค",
                                replaced_word=clean_qt,
                                part_of_speech=cand.get("pos", "น."),
                                official_definition=cand.get("definition", "นิยามตามพจนานุกรมราชบัณฑิตยสภา"),
                                source_edition=f"สำนักงานราชบัณฑิตยสภา (ฉบับ {cand.get('edition', '2554')})",
                                quirk_reason="สุ่มเปลี่ยนคำในประโยคด้วยศัพท์จากคลังพจนานุกรม"
                            ))
                        else:
                            word_mappings.append(WordMappingItem(
                                original_phrase="คำในประโยค",
                                replaced_word=clean_qt,
                                part_of_speech="น./ก./ว.",
                                official_definition="คำศัพท์ภาษาไทยที่ได้รับการรับรองความหมายตามหลักภาษาพจนานุกรม",
                                source_edition="สำนักงานราชบัณฑิตยสภา",
                                quirk_reason="สุ่มเปลี่ยนคำในประโยคโดยเชื่อมโยงกับคลังพจนานุกรมราชบัณฑิตยสภา"
                            ))
                        existing_words.add(clean_qt)

                return QuirkifyResponse(
                    original_sentence=sentence,
                    quirkified_sentence=quirkified_sentence,
                    vibe_style=data.get("vibe_style", style_label),
                    punchline_explanation=data.get("punchline_explanation", "ขัดเกลาสำนวนอย่างมีศิลปะ"),
                    word_mappings=word_mappings
                )
            except Exception as e:
                logger.warning(f"Failed to parse LLM quirkify response: {e}. Output was: {raw_llm_output[:200]}")

        # 5. Fallback heuristic
        return self._heuristic_fallback(sentence, style, mode, candidates)

quirkifier_service = QuirkifierService()
