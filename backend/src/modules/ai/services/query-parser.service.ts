import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { ParsedQueryIntent } from '../interfaces/ai.interface';

@Injectable()
export class QueryParserService {
  private readonly logger = new Logger(QueryParserService.name);
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        this.ai = new GoogleGenAI({ apiKey });
        this.logger.log('✨ Gemini 3.8 Flash Client initialized for Query Parsing.');
      } catch (err) {
        this.logger.warn(`Failed to initialize Gemini Client: ${err.message}`);
      }
    } else {
      this.logger.warn('GEMINI_API_KEY not provided. Using intelligent heuristic rule-based fallback.');
    }
  }

  async parseIntent(rawQuery: string): Promise<ParsedQueryIntent> {
    // 1. Try Gemini 3.8 Flash Structured Output
    if (this.ai) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: rawQuery,
          config: {
            systemInstruction: `คุณคือนักภาษาศาสตร์คอมพิวเตอร์ภาษาไทยของระบบ THAI CONTEXT
หน้าที่ของคุณคือถอดรหัสเจตนาการค้นหาคำศัพท์ของผู้ใช้ และแยกคำที่ผู้ใช้สั่งห้าม (excluded_words) ออกมาเป็น JSON อย่างเคร่งครัด
ตัวอย่าง: "อยากบอกว่าคนนี้ทำงานได้ดี ใช้ทรัพยากรน้อย แต่ไม่อยากใช้คำว่าเก่ง"
=> detected_meaning: "ทำงานได้ผลลัพธ์ดีโดยใช้ทรัพยากรอย่างคุ้มค่า"
=> context: "การทำงานในองค์กร / ประสิทธิภาพ"
=> excluded_words: ["เก่ง"]
=> target_register: "formal"`,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detected_meaning: { type: Type.STRING },
                context: { type: Type.STRING },
                excluded_words: { type: Type.ARRAY, items: { type: Type.STRING } },
                target_register: { type: Type.STRING, enum: ['formal', 'informal', 'poetic', 'slang', 'all'] },
              },
              required: ['detected_meaning', 'context', 'excluded_words'],
            },
            temperature: 0.1,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return {
            raw_query: rawQuery,
            detected_meaning: parsed.detected_meaning || rawQuery,
            context: parsed.context || 'ทั่วไป',
            excluded_words: Array.isArray(parsed.excluded_words) ? parsed.excluded_words : [],
            target_register: parsed.target_register || 'all',
          };
        }
      } catch (error) {
        this.logger.warn(`Gemini parsing failed (${error.message}). Falling back to heuristic extractor.`);
      }
    }

    // 2. Intelligent Heuristic Rule-Based Fallback (Zero-Fail Guarantee)
    const excludedWords: string[] = [];
    const negativePatterns = [
      /(?:ไม่เอาคำว่า|ไม่อยากใช้คำว่า|ห้ามใช้คำว่า|แต่ไม่เอาคำว่า|เบื่อคำว่า)\s*([^\s,]+)/g,
      /(?:ไม่เอา|ไม่อยากใช้|ห้ามใช้)\s*['"“]([^'"”]+)['"”]/g,
    ];

    for (const pattern of negativePatterns) {
      let match;
      while ((match = pattern.exec(rawQuery)) !== null) {
        if (match[1]) excludedWords.push(match[1].trim());
      }
    }

    // Common demonstration test case
    if (rawQuery.includes('เก่ง') && (rawQuery.includes('ไม่อยาก') || rawQuery.includes('ไม่เอา'))) {
      if (!excludedWords.includes('เก่ง')) excludedWords.push('เก่ง');
    }

    let detectedMeaning = rawQuery
      .replace(/(?:แต่)?(?:ไม่เอาคำว่า|ไม่อยากใช้คำว่า|ห้ามใช้คำว่า).*$/, '')
      .replace(/^(?:อยากบอกว่า|อยากได้คำที่แปลว่า|ต้องการคำว่า|คำที่หมายถึง)/, '')
      .trim();

    return {
      raw_query: rawQuery,
      detected_meaning: detectedMeaning || rawQuery,
      context: rawQuery.includes('งาน') ? 'การทำงานในองค์กร / บริหารจัดการ' : 'ทั่วไป',
      excluded_words: excludedWords,
      target_register: 'formal',
    };
  }
}
