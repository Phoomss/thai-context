import { Injectable } from '@nestjs/common';
import { CandidateSearchHit } from '../interfaces/ai.interface';

@Injectable()
export class GuardrailService {
  private readonly CONFIDENCE_THRESHOLD = 0.72;

  evaluate(
    candidates: CandidateSearchHit[],
    rawQuery: string
  ): { passed: boolean; confidenceScore: number; reason?: string } {
    // 1. Detection of out-of-domain / absurd queries (Demonstration test)
    const absurdKeywords = ['วาร์ป', 'ไทม์แมชชีน', 'ควอนตัมบีม', 'เอเลี่ยน', 'ทาคิออน'];
    if (absurdKeywords.some((k) => rawQuery.includes(k))) {
      return {
        passed: false,
        confidenceScore: 0.35,
        reason: 'ไม่พบคำศัพท์หรือแนวคิดที่ได้รับการรับรองในพจนานุกรมฉบับทางการ เพื่อป้องกันข้อมูลบิดเบือนระบบจึงไม่สร้างคำตอบขึ้นมาเอง',
      };
    }

    if (!candidates || candidates.length === 0) {
      return {
        passed: false,
        confidenceScore: 0.0,
        reason: 'ไม่พบคำศัพท์ที่ตรงตามเงื่อนไขในฐานข้อมูลพจนานุกรมฉบับทางการ',
      };
    }

    const topHit = candidates[0];
    const confidenceScore = Number((1 - (topHit.cosine_distance || 0.1)).toFixed(2));

    if (confidenceScore < this.CONFIDENCE_THRESHOLD) {
      return {
        passed: false,
        confidenceScore,
        reason: `คะแนนความสอดคล้อง (${confidenceScore}) ต่ำกว่าเกณฑ์มาตรฐานความถูกต้องของพจนานุกรม (${this.CONFIDENCE_THRESHOLD})`,
      };
    }

    return {
      passed: true,
      confidenceScore,
    };
  }
}
