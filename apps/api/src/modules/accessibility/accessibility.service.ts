import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../database/prisma.service';
import {
  WordAccessibilityResponseDto,
  PronunciationItemDto,
  TranslationItemDto,
  SignLanguageEntryDto,
} from './dto/word-accessibility.dto';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AccessibilityService {
  private readonly logger = new Logger(AccessibilityService.name);
  private readonly aiServiceUrl: string;
  private readonly cache = new Map<string, { data: any; expiresAt: number }>();
  private readonly TTL_MS = 1000 * 60 * 30; // 30 minutes

  private readonly transliterationThaiToEn = new Map<string, string>();
  private readonly transliterationEnToThai = new Map<string, string>();
  private readonly technicalTermsMap = new Map<string, { enTerm: string; field: string }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.aiServiceUrl = this.config.get<string>('aiServiceUrl', 'http://localhost:8000');
    this.loadProcessedData();
  }

  private loadProcessedData(): void {
    const candidates = [
      path.resolve(process.cwd(), 'data/processed'),
      path.resolve(__dirname, '../../../../data/processed'),
      path.resolve(__dirname, '../../../data/processed'),
      '/app/data/processed',
    ];
    const baseDir = candidates.find((p) => fs.existsSync(p));
    if (!baseDir) return;

    try {
      // 1. Load Royal Society Transliterations
      const transPath = path.join(baseDir, 'termsTransliteration', 'terms_transliteration.json');
      if (fs.existsSync(transPath)) {
        const transList = JSON.parse(fs.readFileSync(transPath, 'utf-8'));
        for (const item of transList) {
          const th = item.transliteration_thai?.trim();
          const en = item.term_english?.trim();
          if (th && en) {
            this.transliterationThaiToEn.set(th, en);
            this.transliterationEnToThai.set(en.toLowerCase(), th);
          }
        }
        this.logger.log(`Loaded ${this.transliterationThaiToEn.size} Royal Society transliterations from data/processed`);
      }

      // 2. Load Royal Society Coined Terms
      const termsDir = path.join(baseDir, 'terms');
      if (fs.existsSync(termsDir)) {
        const files = fs.readdirSync(termsDir).filter((f) => f.endsWith('.json'));
        let count = 0;
        for (const file of files) {
          const items = JSON.parse(fs.readFileSync(path.join(termsDir, file), 'utf-8'));
          for (const item of items) {
            const en = item.term?.trim();
            const defs = item.definition?.trim();
            const field = item.field || 'ศัพท์บัญญัติ';
            if (en && defs) {
              for (const part of defs.split(',')) {
                const cleanPart = part.trim();
                if (cleanPart && !this.technicalTermsMap.has(cleanPart)) {
                  this.technicalTermsMap.set(cleanPart, { enTerm: en, field });
                  count++;
                }
              }
            }
          }
        }
        this.logger.log(`Loaded ${count} Royal Society coined terms from data/processed`);
      }
    } catch (e: any) {
      this.logger.warn(`Failed to load processed data in AccessibilityService: ${e?.message || e}`);
    }
  }

  private getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  private setCache<T>(key: string, data: T): void {
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, expiresAt: Date.now() + this.TTL_MS });
  }

  async getWordAccessibility(headword: string): Promise<WordAccessibilityResponseDto> {
    const cacheKey = `accessibility:${headword.trim()}`;
    const cached = this.getFromCache<WordAccessibilityResponseDto>(cacheKey);
    if (cached) return cached;

    const [pronunciation, translations, signLanguage] = await Promise.all([
      this.getPronunciation(headword),
      this.getTranslations(headword),
      this.getSignLanguage(headword),
    ]);

    const result: WordAccessibilityResponseDto = {
      headword,
      pronunciation,
      translations,
      signLanguage,
      tts: {
        supported: true,
        synthesizeEndpoint: '/api/v1/tts/synthesize',
      },
    };

    this.setCache(cacheKey, result);
    return result;
  }

  async getPronunciation(headword: string): Promise<PronunciationItemDto> {
    const cleaned = headword.trim();

    // 1. Check DB word_pronunciations table
    try {
      const wordRecord = await (this.prisma as any).word.findUnique({
        where: { headword: cleaned },
        include: {
          entries: {
            include: {
              pronunciations: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (wordRecord && wordRecord.entries?.length > 0) {
        for (const entry of wordRecord.entries) {
          if (entry.pronunciations && entry.pronunciations.length > 0) {
            const p = entry.pronunciations[0];
            return {
              phoneticSpelling: p.phoneticSpelling,
              transliterationRtgs: p.transliterationRtgs,
              ipaNotation: p.ipaNotation || undefined,
              tonePattern: p.tonePattern || undefined,
              syllables: p.transliterationRtgs.split('-'),
              sourceType: p.sourceType,
            };
          }
          if (entry.pronunciation) {
            // Entry has raw pronunciation string in word_entries
            return this.fetchPhoneticsFromAi(cleaned, entry.pronunciation);
          }
        }
      }
    } catch (e: any) {
      this.logger.warn(`Database lookup for pronunciation failed: ${e?.message || e}`);
    }

    // 2. Fallback to AI Service / PyThaiNLP
    return this.fetchPhoneticsFromAi(cleaned);
  }

  private async fetchPhoneticsFromAi(word: string, knownSpelling?: string): Promise<PronunciationItemDto> {
    try {
      const res = await axios.post(
        `${this.aiServiceUrl}/ai/phonetics`,
        { word, known_spelling: knownSpelling },
        { timeout: 2500 },
      );
      return {
        phoneticSpelling: res.data.phonetic_spelling,
        transliterationRtgs: res.data.transliteration_rtgs,
        ipaNotation: res.data.ipa_notation,
        tonePattern: res.data.tone_pattern,
        syllables: res.data.syllables,
        sourceType: res.data.source_type,
      };
    } catch (err: any) {
      this.logger.warn(`AI Service phonetics failed for "${word}": ${err?.message || err}. Using local rule-based fallback.`);
      return {
        phoneticSpelling: knownSpelling || word,
        transliterationRtgs: word,
        ipaNotation: undefined,
        tonePattern: 'M',
        syllables: [word],
        sourceType: knownSpelling ? 'OFFICIAL_DATA' : 'AI_INFERRED',
      };
    }
  }

  async getTranslations(headword: string): Promise<TranslationItemDto[]> {
    const cleaned = headword.trim();

    // 1. Query Database word_translations
    try {
      const wordRecord = await this.prisma.word.findUnique({
        where: { headword: cleaned },
        include: {
          translations: true,
          entries: {
            include: {
              definitions: {
                include: { pos: true },
              },
            },
            take: 1,
          },
        },
      });

      if (wordRecord?.translations && wordRecord.translations.length > 0) {
        return wordRecord.translations.map((t: any) => ({
          translatedWord: t.translatedWord,
          languageCode: t.languageCode,
          contextualExplanation: t.contextualExplanation || undefined,
          provenance: t.provenance,
          confidenceScore: t.confidenceScore ? Number(t.confidenceScore) : 1.0,
        }));
      }

      // If no translation in DB, check if we have a definition to feed RAG bilingual translator
      const primaryDef = wordRecord?.entries?.[0]?.definitions?.[0];
      if (primaryDef) {
        const aiTrans = await this.fetchTranslationFromAi(
          cleaned,
          primaryDef.definitionText,
          primaryDef.pos?.nameThai,
          primaryDef.subjectDomain || undefined,
        );
        return [aiTrans];
      }
    } catch (dbErr: any) {
      this.logger.warn(`DB translations lookup failed: ${dbErr?.message || dbErr}`);
    }

    // 2. Check in-memory processed data (Royal Society Transliterations & Coined Terms)
    if (this.transliterationThaiToEn.has(cleaned)) {
      const en = this.transliterationThaiToEn.get(cleaned)!;
      return [
        {
          translatedWord: en,
          languageCode: 'en',
          contextualExplanation: `คำทับศัพท์ภาษาไทยตามประกาศสำนักงานราชบัณฑิตยสภา จากคำภาษาอังกฤษ "${en}"`,
          provenance: 'OFFICIAL_ROYAL_TRANSLITERATION',
          confidenceScore: 1.0,
        },
      ];
    }

    if (this.transliterationEnToThai.has(cleaned.toLowerCase())) {
      const th = this.transliterationEnToThai.get(cleaned.toLowerCase())!;
      return [
        {
          translatedWord: th,
          languageCode: 'th',
          contextualExplanation: `Official Royal Society Thai transliteration for "${cleaned}"`,
          provenance: 'OFFICIAL_ROYAL_TRANSLITERATION',
          confidenceScore: 1.0,
        },
      ];
    }

    if (this.technicalTermsMap.has(cleaned)) {
      const t = this.technicalTermsMap.get(cleaned)!;
      return [
        {
          translatedWord: t.enTerm,
          languageCode: 'en',
          contextualExplanation: `ศัพท์บัญญัติสำนักงานราชบัณฑิตยสภา สาขา ${t.field} (${t.enTerm})`,
          provenance: 'OFFICIAL_ROYAL_COINED',
          confidenceScore: 1.0,
        },
      ];
    }

    // 3. Direct call to AI service
    const fallbackTrans = await this.fetchTranslationFromAi(cleaned);
    return [fallbackTrans];
  }

  private async fetchTranslationFromAi(
    word: string,
    definition?: string,
    pos?: string,
    domain?: string,
  ): Promise<TranslationItemDto> {
    try {
      const res = await axios.post(
        `${this.aiServiceUrl}/ai/bilingual-explanation`,
        { word, definition, pos, domain },
        { timeout: 3500 },
      );
      return {
        translatedWord: res.data.primary_translation,
        languageCode: 'en',
        secondaryTranslations: res.data.secondary_translations,
        contextualExplanation: res.data.contextual_explanation_en,
        usageNuance: res.data.usage_nuance_en,
        provenance: res.data.provenance,
        confidenceScore: res.data.confidence_score,
      };
    } catch (err: any) {
      this.logger.warn(`AI bilingual translation failed for "${word}": ${err?.message || err}`);
      const localKnown: Record<string, { trans: string; sec: string[]; exp: string }> = {
        สวัสดี: {
          trans: 'hello / greetings',
          sec: ['good morning / afternoon', 'good day'],
          exp: 'Universal Thai greeting used at any time of day to say hello or goodbye.',
        },
        คิดถึง: {
          trans: 'miss / think of',
          sec: ['yearn for', 'long for'],
          exp: 'To recall or think of someone with affection or concern.',
        },
        ขอบคุณ: {
          trans: 'thank you / thanks',
          sec: ['grateful', 'appreciate'],
          exp: 'Standard Thai expression of gratitude and appreciation.',
        },
        อร่อย: {
          trans: 'delicious',
          sec: ['tasty', 'flavorful', 'savory'],
          exp: 'Highly pleasant to the taste; having a savory flavor.',
        },
      };

      const fallback = localKnown[word];
      return {
        translatedWord: fallback ? fallback.trans : word,
        languageCode: 'en',
        secondaryTranslations: fallback ? fallback.sec : [],
        contextualExplanation: fallback ? fallback.exp : definition || 'No verified bilingual explanation found.',
        provenance: fallback ? 'OFFICIAL_CURATED' : 'AI_GENERATED',
        confidenceScore: fallback ? 0.95 : 0.5,
      };
    }
  }

  async getSignLanguage(headword: string): Promise<SignLanguageEntryDto[]> {
    const cleaned = headword.trim();
    try {
      const wordRecord = await this.prisma.word.findUnique({
        where: { headword: cleaned },
        include: {
          signEntries: {
            include: {
              mediaList: true,
            },
          },
        },
      });

      if (!wordRecord || !wordRecord.signEntries || wordRecord.signEntries.length === 0) {
        return [];
      }

      return wordRecord.signEntries.map((sign: any) => ({
        signName: sign.signName,
        handshapeDescription: sign.handshapeDescription || undefined,
        dialectRegion: sign.dialectRegion,
        verificationStatus: sign.verificationStatus,
        sourceAttribution: sign.sourceAttribution || undefined,
        license: sign.license || undefined,
        media: sign.mediaList.map((m: any) => ({
          mediaType: m.mediaType,
          mediaUrl: m.mediaUrl,
          thumbnailUrl: m.thumbnailUrl || undefined,
          isPrimary: m.isPrimary,
        })),
      }));
    } catch (err: any) {
      this.logger.warn(`Failed to fetch sign language for "${headword}": ${err?.message || err}`);
      return [];
    }
  }
}
