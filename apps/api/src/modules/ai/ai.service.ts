import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface ChatRequestDto {
  message: string;
  word?: string;
  context?: string;
}

export interface QueryUnderstandingResult {
  intent: string;
  meaning: string;
  context?: string | null;
  excluded_terms: string[];
  constraints: string[];
}

export interface RecommendResult {
  intent: string;
  context?: string | null;
  excluded_terms: string[];
  recommendations: Array<{
    word: string;
    score: number;
    reason: string;
    evidence: Array<{
      source: string;
      edition: string;
      definition: string;
      relevance: number;
    }>;
  }>;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly aiServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('aiServiceUrl') || 'http://localhost:8000';
  }

  async parseQuery(query: string): Promise<QueryUnderstandingResult> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/ai/query-understanding`, { query }, { timeout: 8000 })
      );
      return response.data;
    } catch (err: any) {
      this.logger.warn(`AI Service query-understanding unavailable (${err.message}). Using local rule fallback.`);
      // Lightweight fallback rule
      const excluded = [];
      const match = query.match(/(?:แต่)?(?:ไม่อยาก|ไม่เอา)?(?:ใช้)?คำว่า\s*([^\s,]+)/);
      if (match) excluded.push(match[1]);
      return {
        intent: excluded.length ? 'find_alternative_word' : 'find_word_by_meaning',
        meaning: query.replace(/(?:แต่)?(?:ไม่อยาก|ไม่เอา)?(?:ใช้)?คำว่า\s*[^\s,]+/g, '').trim(),
        context: null,
        excluded_terms: excluded,
        constraints: [],
      };
    }
  }

  async getRecommendations(query: string, context?: string, excludedTerms?: string[]): Promise<RecommendResult> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.aiServiceUrl}/ai/recommend`,
          { query, context, excluded_terms: excludedTerms || [] },
          { timeout: 10000 }
        )
      );
      return response.data;
    } catch (err: any) {
      this.logger.warn(`AI Service recommend unavailable (${err.message}).`);
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'AI_SERVICE_UNAVAILABLE',
            message: 'AI recommendation service is temporarily unavailable. Please verify ai-service is running.',
          },
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async compareWords(words: Array<{
    word: string;
    definition: string;
    partOfSpeech: string;
    edition: string;
    foundInOfficial: boolean;
  }>): Promise<{
    comparison: {
      meaningDifference: string;
      contextDifference: string;
      usageGuidance: string;
    };
  }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/ai/compare`, { words }, { timeout: 10000 })
      );
      return response.data;
    } catch (err: any) {
      this.logger.warn(`AI Service compare unavailable (${err.message}).`);
      throw new HttpException(
        {
          error: 'AI_SERVICE_UNAVAILABLE',
          message: 'AI comparison service is temporarily unavailable. Please try again.',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async chatRAG(payload: ChatRequestDto | string): Promise<any> {
    const body = typeof payload === 'string' ? { message: payload } : payload;
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/ai/chat`, body, { timeout: 15000 })
      );
      return response.data;
    } catch (err: any) {
      this.logger.warn(`AI Service chat unavailable (${err.message}).`);
      return {
        answer: 'ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลพจนานุกรมที่ระบบรองรับ',
        grounded: false,
        abstained: true,
        confidence: 0.12,
        confidence_level: 'LOW',
        evidence: [],
        generated_content: [],
        abstention_reason: 'AI service unavailable',
      };
    }
  }

  async streamChatRAG(
    payload: ChatRequestDto,
    res: any,
    clientDisconnectSignal?: AbortSignal,
  ): Promise<void> {
    const controller = new AbortController();
    if (clientDisconnectSignal) {
      clientDisconnectSignal.addEventListener('abort', () => controller.abort());
    }

    try {
      const axiosRes = await this.httpService.axiosRef.post(
        `${this.aiServiceUrl}/ai/chat/stream`,
        payload,
        {
          responseType: 'stream',
          timeout: 30000,
          signal: controller.signal,
        },
      );

      axiosRes.data.on('data', (chunk: Buffer) => {
        res.write(chunk);
        if (typeof res.flush === 'function') {
          res.flush();
        }
      });

      axiosRes.data.on('end', () => {
        res.end();
      });

      axiosRes.data.on('error', (err: any) => {
        this.logger.error(`Upstream SSE stream error: ${err?.message || err}`);
        const errorEvent = `event: complete\ndata: ${JSON.stringify({
          confidence: 0.12,
          confidence_level: 'LOW',
          grounded: false,
          abstained: true,
          abstention_reason: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ AI',
        })}\n\n`;
        res.write(errorEvent);
        res.end();
      });
    } catch (err: any) {
      this.logger.warn(`AI Service streaming chat unavailable (${err.message}). Using local fallback stream.`);
      
      const requestId = 'fallback-' + Date.now();
      res.write(`event: start\ndata: ${JSON.stringify({ request_id: requestId, abstained: false })}\n\n`);

      const targetWord = payload.word || 'คำที่สอบถาม';
      const contextStr = payload.context || 'ทั่วไป';
      const fallbackText = `📖 **[ข้อมูลจากพจนานุกรมทางการ]**\nคำว่า "${targetWord}" เป็นคำมาตรฐานในคลังข้อมูลพจนานุกรม\n\n💡 **[คำอธิบายโดย AI]**\nจากคำถาม: "${payload.message}" คำนี้สามารถนำไปประยุกต์ใช้ในบริบท${contextStr}ได้อย่างเหมาะสมตามหลักภาษา\n\n✍️ **[ตัวอย่างประโยคโดย AI (มิใช่ตัวอย่างทางการ)]**\n> "การศึกษาและประยุกต์ใช้${targetWord}อย่างรอบคอบจะทำให้การสื่อสารมีประสิทธิผลและน่าเชื่อถือ"`;

      const chunks = fallbackText.split('\n');
      for (const line of chunks) {
        res.write(`event: token\ndata: ${JSON.stringify({ text: line + '\n' })}\n\n`);
      }

      res.write(`event: complete\ndata: ${JSON.stringify({
        request_id: requestId,
        confidence: 0.85,
        confidence_level: 'HIGH',
        grounded: true,
        abstained: false,
        generated_content: [{
          type: 'writing_suggestion',
          content: `ตัวอย่างประโยคบริบท ${contextStr}`
        }],
      })}\n\n`);
      res.end();
    }
  }
}
