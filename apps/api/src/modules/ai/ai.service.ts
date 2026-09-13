import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface ChatRequestDto {
  message: string;
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
    } catch (err) {
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
    } catch (err) {
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

  async compareWords(words: any[]): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/ai/compare`, { words }, { timeout: 10000 })
      );
      return response.data;
    } catch (err) {
      this.logger.warn(`AI Service compare unavailable (${err.message}).`);
      return {
        words: words.map((w) => {
          const hw = typeof w === 'string' ? w : w.word || w.headword;
          return { headword: hw, definition: 'รอเชื่อมต่อ AI service', edition: '-' };
        }),
        comparison: {
          meaningDifference: 'ไม่สามารถเรียก AI service เพื่อเปรียบเทียบได้ในขณะนี้',
          contextDifference: '-',
          usageGuidance: '-',
        },
        evidence: [],
      };
    }
  }

  async chatRAG(message: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/ai/chat`, { message }, { timeout: 15000 })
      );
      return response.data;
    } catch (err) {
      this.logger.warn(`AI Service chat unavailable (${err.message}).`);
      return {
        answer: 'ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลพจนานุกรมที่ระบบรองรับ',
        grounded: false,
        evidence: [],
      };
    }
  }
}
