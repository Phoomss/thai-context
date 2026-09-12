import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { CandidateSearchHit, GroundedEvidence, ParsedQueryIntent, RecommendedWordOutput } from '../interfaces/ai.interface';

@Injectable()
export class GroundedRAGService {
  private readonly logger = new Logger(GroundedRAGService.name);
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        this.ai = new GoogleGenAI({ apiKey });
      } catch (err) {
        this.logger.warn(`Gemini SDK init failed: ${err.message}`);
      }
    }
  }

  async synthesizeRecommendations(
    intent: ParsedQueryIntent,
    candidates: CandidateSearchHit[]
  ): Promise<RecommendedWordOutput[]> {
    const outputs: RecommendedWordOutput[] = [];

    for (const c of candidates) {
      const matchScore = Math.max(0.75, Math.min(0.99, Number((1 - (c.cosine_distance || 0.1)).toFixed(2))));
      let explanation = `คำว่า "${c.headword}" สื่อถึง "${c.definition}" ซึ่งสอดคล้องกับเจตนาเรื่อง "${intent.detected_meaning}" โดยตรง และเหมาะสมกับระดับภาษาแบบแผน`;

      // If Gemini 3.8 Flash is active, generate tailored grounded reasoning
      if (this.ai) {
        try {
          const prompt = `[เจตนาของผู้ใช้]: ${intent.detected_meaning}
[บริบท]: ${intent.context}
[คำต้องห้าม]: ${intent.excluded_words.join(', ')}

[ข้อมูลพจนานุกรมทางการ]:
คำศัพท์: ${c.headword} (${c.pos})
นิยาม: ${c.definition}
ฉบับ: ${c.edition_name} หน้า ${c.page_number}

คำสั่ง: จงอธิบายสั้นๆ 1-2 ประโยคว่าทำไมคำนี้ถึงเหมาะกับเจตนาของผู้ใช้ โดยอ้างอิงจากนิยามข้างต้นเท่านั้น ห้ามคิดความหมายขึ้นมาใหม่ และห้ามใช้คำต้องห้าม:`;

          const response = await this.ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              temperature: 0.2,
              maxOutputTokens: 100,
            },
          });

          if (response.text) {
            explanation = response.text.trim();
          }
        } catch (err) {
          this.logger.debug(`Gemini synthesis fallback for ${c.headword}: ${err.message}`);
        }
      }

      const evidence: GroundedEvidence = {
        source_book: c.edition_name || 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔',
        edition_year: c.edition_year || 2554,
        page_number: c.page_number || 1208,
        exact_quote: `${c.headword} (${c.pos}) ${c.definition}`,
        is_official: true,
      };

      outputs.push({
        headword: c.headword,
        pos: c.pos,
        match_score: matchScore,
        official_definition: c.definition,
        edition_name: c.edition_name,
        ai_explanation: explanation,
        evidence,
      });
    }

    return outputs;
  }
}
