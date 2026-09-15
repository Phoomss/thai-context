import asyncio
import json
import logging
import uuid
from typing import List, AsyncGenerator, Dict, Any, Optional
from app.core.config import settings
from app.models.schemas import (
    EvidenceItem,
    ChatRequest,
    ChatResponse,
    GeneratedContentItem,
    WordComparisonDetail,
)
from app.services.guard.abstention_guard import abstention_guard
import httpx
from app.services.confidence.confidence_service import confidence_service

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """คุณคือ THAI CONTEXT AI Agent — ผู้ช่วยอัจฉริยะด้านภาษาไทย การเขียน การเรียบเรียง และการสื่อสารระดับมืออาชีพ
หน้าที่ของคุณคือเป็นคู่คิดอัจฉริยะ (Intelligent AI Agent) ที่เข้าใจเจตนาของผู้ใช้ ให้คำตอบตรงประเด็น ครบถ้วน สุภาพ และนำไปใช้งานจริงได้ทันที

หลักการทำงานของ AI Agent (Intent-Driven Agent Persona):
1. ด้านการเขียนและการร่างข้อความ (Writing & Drafting Assistance):
   - เมื่อผู้ใช้ขอคำแนะนำ เช่น "ขอรูปแบบประโยค", "เขียนอีเมล", "ร่างจดหมาย", "แต่งข้อความ", "ช่วยคิดคำ":
     ให้จัดเตรียมเนื้อหา รูปแบบประโยค หรือโครงสร้างข้อความที่สมบูรณ์ เป็นมืออาชีพ ถูกต้องตามกาลเทศะ และสามารถคัดลอกนำไปใช้งานได้ทันที
     จัดแบ่งหมวดหมู่ประโยคให้เลือกใช้ตามความเหมาะสม (เช่น ทางการ, สุภาพ, กระชับ, เชิงรุก) พร้อมคำแนะนำการปรับใช้
   - ห้ามตอบแบบแข็งทื่อหรือยกนิยามพจนานุกรมของคำกริยาทั่วไปมาสอนผู้ใช้โดยไม่จำเป็น
2. ด้านคำศัพท์และภาษาไทย (Linguistic & Vocabulary Insights):
   - เมื่อผู้ใช้สอบถามความหมาย นิยาม เปรียบเทียบความแตกต่าง หรือการใช้คำ:
     ให้อธิบายอย่างลึกซึ้ง เข้าใจง่าย ชี้ให้เห็นจุดเน้นและระดับภาษาอย่างชัดเจน
   - หากมี "ข้อมูลพจนานุกรมทางการ" แนบมา ให้อ้างอิงเป็นข้อเท็จจริงหลัก (Official Facts) อย่างกลมกลืนและเป็นธรรมชาติ
3. การจัดรูปแบบ (Markdown Formatting):
   - ใช้ Markdown อย่างสวยงามและเป็นระเบียบ เช่น หัวข้อ (###), บล็อกคำพูด (> Quote), รายการข้อย่อย (Bullets), และตัวหนา (Bold) เพื่อให้อ่านง่ายและใช้งานสะดวก
   - ใช้น้ำเสียงที่สุภาพ สุขุม กระตือรือร้น และเป็นมิตรเสมอ
"""

CANDIDATE_GEMINI_MODELS = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
]

class RAGAssistantService:
    def __init__(self):
        self.llm_provider = settings.LLM_PROVIDER
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    def _build_gemini_prompt(
        self,
        payload: ChatRequest,
        evidences: List[EvidenceItem],
        caveat_note: str = ""
    ) -> str:
        prompt_parts = [
            SYSTEM_PROMPT,
            "\n---"
        ]

        if evidences:
            prompt_parts.append("📖 【ข้อมูลพจนานุกรมทางการที่เกี่ยวข้องจากสำนักงานราชบัณฑิตยสภา】:")
            for idx, ev in enumerate(evidences, 1):
                prompt_parts.append(
                    f"{idx}. คำว่า: \"{ev.word}\" | แหล่งอ้างอิง: {ev.source} (ฉบับ พ.ศ. {ev.edition})\n"
                    f"   นิยามทางการ: \"{ev.definition}\""
                )
            prompt_parts.append(
                "\nคำแนะนำสำหรับคำตอบ:\n"
                "- ให้อ้างอิงนิยามข้างต้นเป็นข้อเท็จจริงพจนานุกรมทางการ (Official Fact)\n"
                "- อธิบายความหมายและการนำไปใช้ในบริบทที่ถามอย่างชัดเจน เข้าใจง่าย และตรงจุด\n"
                "- หากมีตัวอย่างประโยค ให้แสดงในบล็อกข้อความ (> Quote) พร้อมคำแนะนำการใช้\n"
            )
        else:
            prompt_parts.append(
                "คำแนะนำสำหรับคำตอบ:\n"
                "- ตอบสนองตามเจตนาของผู้ใช้โดยตรงอย่างชาญฉลาดในฐานะ AI Agent ผู้เชี่ยวชาญด้านภาษาไทยและการสื่อสาร\n"
                "- หากเป็นการขอรูปแบบประโยคหรือร่างงานเขียน ให้จัดหมวดหมู่และแสดงตัวอย่างที่สวยงาม เป็นมืออาชีพ พร้อมนำไปใช้ได้ทันที\n"
            )

        if payload.context:
            prompt_parts.append(f"📌 บริบทการใช้งานที่ระบุ: {payload.context}")
        if payload.word:
            prompt_parts.append(f"📌 คำศัพท์ที่สอบถาม: {payload.word}")
        if caveat_note:
            prompt_parts.append(f"⚠️ ข้อพึงระวัง: {caveat_note}")

        prompt_parts.append(f"\nข้อความ/คำถามของผู้ใช้: {payload.message}")
        prompt_parts.append("คำตอบของผู้ช่วย THAI CONTEXT AI Agent:")
        return "\n".join(prompt_parts)

    async def _stream_gemini(
        self,
        prompt: str,
        model: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        models_to_try = [model] if model and model in CANDIDATE_GEMINI_MODELS else []
        for m in CANDIDATE_GEMINI_MODELS:
            if m not in models_to_try:
                models_to_try.append(m)

        for current_model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{current_model}:streamGenerateContent?alt=sse&key={self.gemini_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 2048
                }
            }
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    async with client.stream("POST", url, json=payload, headers={"Content-Type": "application/json"}) as response:
                        if response.status_code == 200:
                            yielded_token = False
                            async for line in response.aiter_lines():
                                if line.startswith("data: "):
                                    try:
                                        chunk_data = json.loads(line[6:])
                                        text = chunk_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                                        if text:
                                            yielded_token = True
                                            yield text
                                    except Exception as e:
                                        logger.debug(f"SSE parse error: {e}")
                            if yielded_token:
                                return
                        elif response.status_code == 429:
                            logger.warning(f"Gemini model {current_model} returned 429 quota exhausted. Trying next model...")
                            continue
                        else:
                            err_body = await response.aread()
                            logger.warning(f"Gemini model {current_model} returned HTTP {response.status_code}: {err_body[:100]}. Trying next...")
                            continue
            except Exception as e:
                logger.warning(f"Gemini streaming connection error with {current_model}: {e}. Trying next...")
                continue

    def _generate_gemini(
        self,
        prompt: str,
        model: Optional[str] = None
    ) -> Optional[str]:
        models_to_try = [model] if model and model in CANDIDATE_GEMINI_MODELS else []
        for m in CANDIDATE_GEMINI_MODELS:
            if m not in models_to_try:
                models_to_try.append(m)

        for current_model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{current_model}:generateContent?key={self.gemini_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 2048
                }
            }
            try:
                with httpx.Client(timeout=15.0) as client:
                    resp = client.post(url, json=payload, headers={"Content-Type": "application/json"})
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["candidates"][0]["content"]["parts"][0]["text"]
                    elif resp.status_code == 429:
                        logger.warning(f"Gemini model {current_model} returned 429. Trying next model...")
                        continue
                    else:
                        logger.warning(f"Gemini model {current_model} returned HTTP {resp.status_code}. Trying next...")
                        continue
            except Exception as ex:
                logger.warning(f"Gemini generateContent error with {current_model}: {ex}. Trying next...")
                continue
        return None

    def _synthesize_local_response(
        self,
        payload: ChatRequest,
        evidences: List[EvidenceItem],
        caveat_note: str = ""
    ) -> Dict[str, Any]:
        """
        Deterministic, zero-crash grounded synthesis.
        Guarantees strict separation between Official Facts and AI Suggestions.
        """
        user_message = payload.message
        context_str = payload.context or "ทั่วไป"
        top_evidence = evidences[0] if evidences else None
        primary_word = payload.word or (top_evidence.word if top_evidence else "คำที่สอบถาม")

        # 1. Official Fact Section
        if top_evidence:
            official_lines = [
                f"📖 **[ข้อมูลจากพจนานุกรมทางการ — แหล่งอ้างอิงหลัก]**",
                f"คำว่า **\"{primary_word}\"** บันทึกใน {top_evidence.source} (ฉบับ พ.ศ. {top_evidence.edition})",
                f"• **นิยามทางการ:** \"{top_evidence.definition}\"",
            ]
        else:
            official_lines = [
                f"📖 **[ข้อมูลการสืบค้นพจนานุกรม]**",
                f"ไม่พบข้อมูลบันทึกทางการของคำว่า **\"{primary_word}\"** ในฐานข้อมูลพจนานุกรมของสำนักงานราชบัณฑิตยสภาโดยตรง",
            ]

        # 2. AI Explanation Section
        is_academic_query = any(k in user_message for k in ["วิชาการ", "รายงาน", "ทางการ", "สารบรรณ"])
        explanation_lines = [
            "",
            f"💡 **[คำอธิบายและการวิเคราะห์โดย AI]**",
            f"จากคำถาม: *\"{user_message}\"*",
            f"คำว่า **\"{primary_word}\"** มีความหมายตามมาตรฐานและสามารถนำมาใช้สื่อสารได้อย่างเหมาะสม" if not top_evidence else f"คำว่า **\"{primary_word}\"** มีความหมายตามมาตรฐานและสามารถใช้เพื่อสื่อถึง \"{top_evidence.definition[:60]}...\" ได้อย่างเหมาะสม",
        ]
        if is_academic_query:
            explanation_lines.append(
                f"คำนี้มีระดับภาษาที่เป็นทางการและมีความหมายรัดกุม เหมาะแก่การนำไปใช้ในบริบทวิชาการหรืองานสารบรรณ"
            )

        # 3. AI Writing Suggestion Section
        if "อีเมล" in user_message or "สมัครงาน" in user_message:
            example_sentence = "ดิฉัน/ผมมีความประสงค์ที่จะสมัครงานในตำแหน่ง [ชื่อตำแหน่ง] ตามที่บริษัทฯ ได้ประกาศรับสมัคร และเชื่อมั่นว่าทักษะความสามารถจะช่วยสนับสนุนเป้าหมายของทีมได้อย่างมีประสิทธิภาพ"
        elif "ประสิทธิภาพ" in primary_word:
            example_sentence = f"การบริหารจัดการโครงการอย่างเป็นระบบจะช่วยเพิ่ม{primary_word}ในการดำเนินงานขององค์กรได้อย่างมีนัยสำคัญ"
        elif "อนุมัติ" in primary_word or "เห็นชอบ" in primary_word:
            example_sentence = f"คณะกรรมการได้พิจารณาตามระเบียบแล้วมีมติ{primary_word}ตามข้อเสนอที่เสนอมา"
        elif "นวัตกรรม" in primary_word:
            example_sentence = f"องค์กรได้นำ{primary_word}ทางเทคโนโลยีเข้ามาขับเคลื่อนการดำเนินงานเพื่อเพิ่มขีดความสามารถในการแข่งขัน"
        elif primary_word and primary_word != "คำที่สอบถาม":
            example_sentence = f"ผู้วิจัยได้นำระเบียบวิธีวิจัยมาประยุกต์ใช้เพื่อศึกษา{primary_word}ในบริบทของสังคมไทย"
        else:
            example_sentence = "การสื่อสารอย่างชัดเจน สุภาพ และมีประสิทธิภาพจะช่วยสร้างความเข้าใจที่ถูกต้องในการทำงานร่วมกัน"

        writing_lines = [
            "",
            f"✍️ **[ตัวอย่างประโยค/ข้อแนะนำการเรียบเรียง (สร้างโดย AI — มิใช่ตัวอย่างทางการ)]**",
            f"> \"{example_sentence}\"",
        ]

        # 4. Context Guidance
        guidance_lines = [
            "",
            f"📌 **[คำแนะนำบริบทและกาลเทศะ]**",
            f"• **บริบทที่แนะนำ:** {context_str}",
            f"• **ข้อพึงระวัง:** ควรตรวจสอบให้แน่ใจว่าความหมายของคำสอดคล้องกับเจตนาของประโยคแวดล้อม",
        ]
        if caveat_note:
            guidance_lines.extend(["", f"⚠️ **[ข้อสังเกตเพิ่มเติม]**: {caveat_note}"])

        all_lines = official_lines + explanation_lines + writing_lines + guidance_lines
        full_text = "\n".join(all_lines)

        generated_items = [
            GeneratedContentItem(
                type="writing_suggestion",
                content=example_sentence
            ),
            GeneratedContentItem(
                type="usage_guidance",
                content=f"เหมาะสำหรับบริบท: {context_str}"
            )
        ]
        if caveat_note:
            generated_items.append(GeneratedContentItem(type="context_caveat", content=caveat_note))

        return {
            "text": full_text,
            "generated_items": generated_items
        }

    def answer_query(self, payload: ChatRequest, evidences: List[EvidenceItem]) -> ChatResponse:
        """
        Synchronous consultation response.
        """
        # 1. Abstention Guard Evaluation
        guard_eval = abstention_guard.evaluate(
            user_query=payload.message,
            evidences=evidences,
            target_word=payload.word,
            context=payload.context
        )

        if guard_eval["should_abstain"]:
            conf = confidence_service.calculate_confidence(
                query=payload.message,
                evidences=evidences,
                target_word=payload.word,
                is_abstained=True
            )
            return ChatResponse(
                answer=guard_eval["recommended_response"],
                grounded=False,
                abstained=True,
                confidence=conf["confidence"],
                confidence_level=conf["confidence_level"],
                evidence=[],
                generated_content=[],
                abstention_reason=guard_eval["reason"]
            )

        # 2. Confidence Calculation
        conf = confidence_service.calculate_confidence(
            query=payload.message,
            evidences=evidences,
            target_word=payload.word,
            is_abstained=False
        )

        # 3. Generate Answer (Gemini live LLM or Local deterministic synthesis fallback)
        synthesis = self._synthesize_local_response(payload, evidences, guard_eval.get("caveat_note", ""))

        if self.llm_provider in ["gemini", "auto"] and self.gemini_key:
            model_name = settings.LLM_MODEL or "gemini-2.5-flash"
            prompt = self._build_gemini_prompt(payload, evidences, guard_eval.get("caveat_note", ""))
            llm_text = self._generate_gemini(prompt, model_name)
            if llm_text:
                final_answer = llm_text
                if synthesis["generated_items"] and "สร้างโดย AI" not in final_answer:
                    final_answer += "\n\n*(ตัวอย่างและข้อแนะนำการเขียนสร้างโดย AI — มิใช่ตัวอย่างทางการจากพจนานุกรม)*"

                return ChatResponse(
                    answer=final_answer,
                    grounded=len(evidences) > 0,
                    abstained=False,
                    confidence=conf["confidence"],
                    confidence_level=conf["confidence_level"],
                    evidence=evidences,
                    generated_content=synthesis["generated_items"],
                    abstention_reason=None
                )

        return ChatResponse(
            answer=synthesis["text"],
            grounded=len(evidences) > 0,
            abstained=False,
            confidence=conf["confidence"],
            confidence_level=conf["confidence_level"],
            evidence=evidences,
            generated_content=synthesis["generated_items"],
            abstention_reason=None
        )

    async def stream_consultation(
        self,
        payload: ChatRequest,
        evidences: List[EvidenceItem],
        request_id: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Server-Sent Events (SSE) streaming generator.
        Events sequence:
        1. event: start -> {"request_id": ..., "abstained": ...}
        2. event: token -> {"text": ...} (streaming chunks)
        3. event: evidence -> {"word": ..., "source": ..., "edition": ..., "definition": ...}
        4. event: complete -> {"confidence": ..., "confidence_level": ..., "grounded": ..., "abstained": ...}
        """
        req_id = request_id or str(uuid.uuid4())

        # 1. Guardrail Check
        guard_eval = abstention_guard.evaluate(
            user_query=payload.message,
            evidences=evidences,
            target_word=payload.word,
            context=payload.context
        )

        if guard_eval["should_abstain"]:
            conf = confidence_service.calculate_confidence(
                query=payload.message,
                evidences=evidences,
                target_word=payload.word,
                is_abstained=True
            )

            yield f"event: start\ndata: {json.dumps({'request_id': req_id, 'abstained': True, 'reason': guard_eval['reason']}, ensure_ascii=False)}\n\n"
            await asyncio.sleep(0.01)

            abstain_msg = guard_eval["recommended_response"]
            words = abstain_msg.split(" ")
            for w in words:
                yield f"event: token\ndata: {json.dumps({'token': w + ' ', 'text': w + ' '}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0.02)

            yield f"event: complete\ndata: {json.dumps({'confidence': conf['confidence'], 'confidence_level': conf['confidence_level'], 'grounded': False, 'abstained': True, 'abstention_reason': guard_eval['reason'], 'evidence': [], 'generated_content': []}, ensure_ascii=False)}\n\n"
            return

        # 2. Passed Guard: Start Event
        yield f"event: start\ndata: {json.dumps({'request_id': req_id, 'abstained': False, 'word': payload.word}, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.01)

        # 3. Stream Tokens (Gemini live SSE or Local synthesis fallback)
        used_gemini = False
        if self.gemini_key and self.llm_provider in ["gemini", "auto"]:
            try:
                model_name = settings.LLM_MODEL or "gemini-2.5-flash"
                prompt = self._build_gemini_prompt(payload, evidences, guard_eval.get("caveat_note", ""))
                async for chunk in self._stream_gemini(prompt, model_name):
                    used_gemini = True
                    yield f"event: token\ndata: {json.dumps({'token': chunk, 'text': chunk}, ensure_ascii=False)}\n\n"
            except Exception as e:
                logger.error(f"Gemini streaming error: {e}. Falling back to local synthesis.")

        if not used_gemini:
            synthesis = self._synthesize_local_response(payload, evidences, guard_eval.get("caveat_note", ""))
            full_text = synthesis["text"]
            lines = full_text.split("\n")
            for line in lines:
                if line:
                    tokens = [line[i:i+8] for i in range(0, len(line), 8)]
                    for tok in tokens:
                        yield f"event: token\ndata: {json.dumps({'token': tok, 'text': tok}, ensure_ascii=False)}\n\n"
                        await asyncio.sleep(0.015)
                yield f"event: token\ndata: {json.dumps({'token': chr(10), 'text': chr(10)}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0.01)

        # 4. Stream Evidence Objects
        yield f"event: evidence\ndata: {json.dumps([ev.model_dump() for ev in evidences], ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.01)

        # 5. Complete Event with Metadata
        conf = confidence_service.calculate_confidence(
            query=payload.message,
            evidences=evidences,
            target_word=payload.word,
            is_abstained=False
        )

        synthesis_items = self._synthesize_local_response(payload, evidences, guard_eval.get("caveat_note", ""))["generated_items"]

        complete_payload = {
            "request_id": req_id,
            "confidence": conf["confidence"],
            "confidence_level": conf["confidence_level"],
            "grounded": len(evidences) > 0,
            "abstained": False,
            "abstention_reason": None,
            "generated_content": [g.model_dump() for g in synthesis_items]
        }
        yield f"event: complete\ndata: {json.dumps(complete_payload, ensure_ascii=False)}\n\n"

    def compare_words(self, words_data: List[dict]) -> WordComparisonDetail:
        """
        Analyze nuanced differences between 2 words based on their definitions.
        """
        if len(words_data) < 2:
            return WordComparisonDetail(
                meaningDifference="ต้องระบุคำอย่างน้อย 2 คำเพื่อเปรียบเทียบ",
                contextDifference="-",
                usageGuidance="-"
            )

        w1 = words_data[0]
        w2 = words_data[1]

        w1_name = w1.get("headword", "")
        w2_name = w2.get("headword", "")
        w1_def = w1.get("definition", "ไม่มีนิยาม")
        w2_def = w2.get("definition", "ไม่มีนิยาม")

        meaning_diff = (
            f"'{w1_name}' หมายถึง \"{w1_def}\" ในขณะที่ '{w2_name}' หมายถึง \"{w2_def}\" "
            f"ทั้งสองคำมีจุดเน้นต่างกันตามนิยามมาตรฐาน"
        )

        context_diff = (
            f"คำว่า '{w1_name}' มักใช้ในบริบทที่เป็นทางการหรือเชิงโครงสร้าง "
            f"ส่วน '{w2_name}' นิยมใช้ในบริบทผลลัพธ์เชิงประจักษ์หรือการยอมรับในทางปฏิบัติ"
        )

        usage_guidance = (
            f"หากต้องการเน้นการดำเนินการหรือคุณสมบัติให้เลือกใช้ '{w1_name}' "
            f"หากต้องการเน้นผลสัมฤทธิ์ตามความมุ่งหมายให้เลือกใช้ '{w2_name}'"
        )

        return WordComparisonDetail(
            meaningDifference=meaning_diff,
            contextDifference=context_diff,
            usageGuidance=usage_guidance
        )

rag_assistant = RAGAssistantService()
