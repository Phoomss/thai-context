import { Injectable, Logger } from '@nestjs/common';
import { Evidence } from './evidence.interface';

export interface GuardValidationResult<T = any> {
  allowed: boolean;
  sanitizedContent: string;
  abstained: boolean;
  abstentionReason?: string;
  confidenceScore: number;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  unsupportedClaimsDetected: string[];
  verifiedEvidence: Evidence[];
  data?: T;
}

@Injectable()
export class EvidenceGuard {
  private readonly logger = new Logger(EvidenceGuard.name);

  static readonly INSUFFICIENT_EVIDENCE_MESSAGE =
    'ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลพจนานุกรมที่ระบบรองรับ';

  validateWordGroundedness(
    targetWords: string[],
    evidenceList: Evidence[],
    generatedText: string,
  ): GuardValidationResult {
    // 1. Guard against empty evidence
    if (!evidenceList || evidenceList.length === 0) {
      this.logger.warn(`EvidenceGuard: No evidence provided for [${targetWords.join(', ')}]. Abstaining.`);
      return {
        allowed: false,
        sanitizedContent: EvidenceGuard.INSUFFICIENT_EVIDENCE_MESSAGE,
        abstained: true,
        abstentionReason: EvidenceGuard.INSUFFICIENT_EVIDENCE_MESSAGE,
        confidenceScore: 0.1,
        confidenceLevel: 'LOW',
        unsupportedClaimsDetected: targetWords,
        verifiedEvidence: [],
      };
    }

    // 2. Identify which words have verified evidence
    const evidenceWords = new Set(
      evidenceList.map((e) => e.word.trim().toLowerCase()),
    );

    const unsupportedWords = targetWords.filter(
      (w) => !evidenceWords.has(w.trim().toLowerCase()),
    );

    // If all target words are unsupported, abstain
    if (targetWords.length > 0 && unsupportedWords.length === targetWords.length) {
      this.logger.warn(`EvidenceGuard: Target words [${unsupportedWords.join(', ')}] completely lack evidence. Abstaining.`);
      return {
        allowed: false,
        sanitizedContent: EvidenceGuard.INSUFFICIENT_EVIDENCE_MESSAGE,
        abstained: true,
        abstentionReason: EvidenceGuard.INSUFFICIENT_EVIDENCE_MESSAGE,
        confidenceScore: 0.15,
        confidenceLevel: 'LOW',
        unsupportedClaimsDetected: unsupportedWords,
        verifiedEvidence: [],
      };
    }

    // 3. Prompt Injection Defense: treat dictionary content as data, ensure system instructions are not echoed
    let sanitized = generatedText;
    const injectionPatterns = [
      /ignore previous instructions/gi,
      /you are now in developer mode/gi,
      /jailbreak/gi,
      /system prompt:/gi,
      /role:\s*admin/gi,
    ];

    for (const pat of injectionPatterns) {
      sanitized = sanitized.replace(pat, '[FILTERED]');
    }

    const verifiedEv = evidenceList.filter((e) => e.verified);
    const confidenceScore = unsupportedWords.length === 0 ? 0.95 : 0.65;
    const confidenceLevel = confidenceScore >= 0.85 ? 'HIGH' : 'MEDIUM';

    return {
      allowed: true,
      sanitizedContent: sanitized,
      abstained: false,
      confidenceScore,
      confidenceLevel,
      unsupportedClaimsDetected: unsupportedWords,
      verifiedEvidence: verifiedEv,
    };
  }

  validateDialectClaim(
    dialectWord: string,
    region: string,
    evidenceList: Evidence[],
  ): { allowed: boolean; message?: string } {
    const cleanWord = dialectWord.trim().toLowerCase();
    const match = evidenceList.find(
      (e) => e.word.trim().toLowerCase() === cleanWord && e.verified,
    );

    if (!match) {
      this.logger.warn(`EvidenceGuard: Dialect word "${dialectWord}" (${region}) not verified in database. Rejecting claim.`);
      return {
        allowed: false,
        message: `ไม่พบข้อมูลคำศัพท์ภาษาถิ่น "${dialectWord}" ในฐานข้อมูลภาษาถิ่นที่ผ่านการรับรอง`,
      };
    }

    return { allowed: true };
  }

  validateAccessibilityClaim(
    operation: 'BRAILLE' | 'TTS' | 'SIGN_LANGUAGE',
    isDeterministicOrVerified: boolean,
  ): { allowed: boolean; message?: string } {
    if (!isDeterministicOrVerified) {
      this.logger.warn(`EvidenceGuard: Accessibility operation ${operation} attempted non-deterministic/unverified generation. Rejecting.`);
      return {
        allowed: false,
        message: 'ไม่อนุญาตให้สร้างข้อมูลการเข้าถึง (อักษรเบรลล์/ภาษามือ) โดยปราศจากตารางมาตรฐานหรือแหล่งข้อมูลที่ผ่านการรับรอง',
      };
    }
    return { allowed: true };
  }
}
