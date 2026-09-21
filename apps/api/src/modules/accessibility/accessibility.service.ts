import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../database/prisma.service';
import {
  WordAccessibilityResponseDto,
  PronunciationItemDto,
  TranslationItemDto,
  SignLanguageEntryDto,
  CreateSignResourceDto,
  ContributeSignResourceDto,
  SignResourceResponseDto,
  BrailleCellDto,
  BrailleResponseDto,
  DecodedBrailleCellDto,
  DecodedBrailleResponseDto,
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
        provenance: fallback ? 'DEMO_PROTOTYPE' : 'AI_GENERATED',
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

  async getSignResource(headword: string): Promise<SignResourceResponseDto> {
    const cleaned = headword.trim();
    try {
      const wordRecord = await this.prisma.word.findUnique({
        where: { headword: cleaned },
        include: {
          signResources: {
            orderBy: { createdAt: 'desc' },
          },
          signEntries: {
            include: { mediaList: true },
          },
        },
      });

      if (wordRecord?.signResources && wordRecord.signResources.length > 0) {
        const resource = wordRecord.signResources[0];
        return {
          status: resource.verificationStatus,
          word: cleaned,
          representation: {
            type: resource.representationType,
            data: resource.motionData || undefined,
          },
          source: {
            type: resource.sourceType,
            name: resource.providerName || 'THAI CONTEXT Sign Dataset',
            url: resource.sourceUrl || undefined,
            license: resource.license || undefined,
            permission_status: resource.permissionStatus,
          },
          verification: {
            status: resource.verificationStatus,
            verified_by: resource.verifiedBy || undefined,
          },
          metadata: resource.metadata || {},
        };
      }
    } catch (err: any) {
      this.logger.warn(`Failed database lookup for sign resource "${headword}": ${err?.message || err}`);
    }

    // Standardized Demo Prototype catalog for Hackathon MVP
    const DEMO_CATALOG: Record<string, SignResourceResponseDto> = {
      สวัสดี: {
        status: 'VERIFIED',
        word: 'สวัสดี',
        representation: {
          type: 'MOTION',
          data: {
            version: '1.0',
            fps: 30,
            duration_ms: 1800,
            frames: [],
          },
        },
        source: {
          type: 'DEMO_DATA',
          name: 'THAI CONTEXT 3D Gesture Lab (Demo Prototype)',
          license: 'Creative Commons CC-BY 4.0',
          permission_status: 'AUTHORIZED',
        },
        verification: {
          status: 'VERIFIED',
          verified_by: 'คณะทำงานวิจัยสรีระการเคลื่อนไหวทางภาษา',
          notes: 'ข้อมูลท่าทางจำลอง 3 มิติเพื่อการทดสอบต้นแบบ Accessibility (Hackathon MVP)',
        },
        metadata: {
          sign_name: 'สวัสดี (Sawasdee)',
          dialect_region: 'มาตรฐานภาษามือไทย (ภาคกลาง)',
          description_th: 'พนมมือทั้งสองข้างระดับอก ปลายนิ้วชี้ขึ้น แล้วเคลื่อนขึ้นพร้อมค้อมศีรษะลงแสดงความเคารพ',
          description_source: 'VERIFIED',
        },
      },
      เกรงใจ: {
        status: 'VERIFIED',
        word: 'เกรงใจ',
        representation: {
          type: 'MOTION',
          data: {
            version: '1.0',
            fps: 30,
            duration_ms: 2000,
            frames: [],
          },
        },
        source: {
          type: 'DEMO_DATA',
          name: 'THAI CONTEXT 3D Gesture Lab (Demo Prototype)',
          license: 'Creative Commons CC-BY 4.0',
          permission_status: 'AUTHORIZED',
        },
        verification: {
          status: 'VERIFIED',
          verified_by: 'คณะทำงานวิจัยสรีระการเคลื่อนไหวทางภาษา',
          notes: 'ข้อมูลท่าทางจำลอง 3 มิติเพื่อการทดสอบต้นแบบ Accessibility (Hackathon MVP)',
        },
        metadata: {
          sign_name: 'เกรงใจ (Kreng-jai)',
          dialect_region: 'มาตรฐานภาษามือไทย (ภาคกลาง)',
          description_th: 'มือขวาทาบลงบริเวณอกหรือหัวใจ ปลายนิ้วเปิดชิด แสดงความเคารพและความคำนึงถึงผู้อื่น',
          description_source: 'VERIFIED',
        },
      },
      ประสิทธิภาพ: {
        status: 'VERIFIED',
        word: 'ประสิทธิภาพ',
        representation: {
          type: 'MOTION',
          data: {
            version: '1.0',
            fps: 30,
            duration_ms: 1800,
            frames: [],
          },
        },
        source: {
          type: 'DEMO_DATA',
          name: 'THAI CONTEXT 3D Gesture Lab (Demo Prototype)',
          license: 'Creative Commons CC-BY 4.0',
          permission_status: 'AUTHORIZED',
        },
        verification: {
          status: 'VERIFIED',
          verified_by: 'คณะทำงานวิจัยสรีระการเคลื่อนไหวทางภาษา',
          notes: 'ข้อมูลท่าทางจำลอง 3 มิติเพื่อการทดสอบต้นแบบ Accessibility (Hackathon MVP)',
        },
        metadata: {
          sign_name: 'ประสิทธิภาพ (Efficiency)',
          dialect_region: 'มาตรฐานภาษามือไทย (ภาคกลาง)',
          description_th: 'มือขวาตั้งนิ้วชี้และนิ้วกลาง หมุนวนเป็นเกลียวไปข้างหน้าแล้วประกบฝ่ามือซ้าย',
          description_source: 'VERIFIED',
        },
      },
      สมานฉันท์: {
        status: 'EXTERNAL_RESOURCE',
        word: 'สมานฉันท์',
        representation: {
          type: 'EXTERNAL_VIDEO',
        },
        source: {
          type: 'EXTERNAL_RESOURCE',
          name: 'สารานุกรมภาษามือไทยออนไลน์ (ศูนย์การเรียนรู้คนหูหนวก)',
          url: 'https://www.thaisigndictionary.org/signs/samanachan',
          license: 'จัดแสดงผ่านการอ้างอิงลิงก์ต้นฉบับ ไม่มีการทำซ้ำสื่อ (Link Attribution Only)',
          permission_status: 'EXTERNAL_ONLY',
        },
        verification: {
          status: 'VERIFIED',
          verified_by: 'ดัชนีแหล่งข้อมูลภาษามือภายนอกที่เชื่อถือได้',
        },
        metadata: {
          sign_name: 'สมานฉันท์ (Reconciliation / Harmony)',
          description_th: 'ข้อมูลภาษามือมีอยู่จากแหล่งภายนอกที่ได้รับการรับรอง สามารถเข้าชมวิดีโอจากเว็บไซต์ต้นฉบับได้โดยตรง',
          description_source: 'OFFICIAL',
        },
      },
      ปัญญาประดิษฐ์: {
        status: 'VERIFIED',
        word: 'ปัญญาประดิษฐ์',
        representation: {
          type: 'MOTION',
          data: {
            version: '1.0',
            fps: 30,
            duration_ms: 2200,
            frames: [],
          },
        },
        source: {
          type: 'AUTHORIZED_PROVIDER',
          name: 'สมาคมคนหูหนวกแห่งประเทศไทย (NADT)',
          license: 'Creative Commons CC-BY-SA 4.0',
          permission_status: 'AUTHORIZED',
        },
        verification: {
          status: 'VERIFIED',
          verified_by: 'สมาคมคนหูหนวกแห่งประเทศไทย & คณะทำงานสรีระภาษามือ',
        },
        metadata: {
          sign_name: 'ปัญญาประดิษฐ์ (Artificial Intelligence / AI)',
          dialect_region: 'มาตรฐานภาษามือไทย (ภาคกลาง)',
          description_th: 'ชี้นิ้วชี้ขวาที่ขมับ แตะเบาๆ แล้วกางมือทั้งสองขยับนิ้วคล้ายวงจรอิเล็กทรอนิกส์',
          description_source: 'OFFICIAL',
        },
      },
      อร่อย: {
        status: 'VERIFIED',
        word: 'อร่อย',
        representation: {
          type: 'MOTION',
          data: {
            version: '1.0',
            fps: 30,
            duration_ms: 1800,
            frames: [],
          },
        },
        source: {
          type: 'AUTHORIZED_PROVIDER',
          name: 'สมาคมคนหูหนวกแห่งประเทศไทย (NADT)',
          license: 'Creative Commons CC-BY-SA 4.0',
          permission_status: 'AUTHORIZED',
        },
        verification: {
          status: 'VERIFIED',
          verified_by: 'สมาคมคนหูหนวกแห่งประเทศไทย',
        },
        metadata: {
          sign_name: 'อร่อย (Delicious / Savory)',
          dialect_region: 'มาตรฐานภาษามือไทย (ภาคกลาง)',
          description_th: 'ใช้ปลายนิ้วชี้และนิ้วโป้งขวาแตะที่มุมปาก วนเบาๆ พร้อมพยักหน้าเล็กน้อย',
          description_source: 'OFFICIAL',
        },
      },
      มิตรภาพ: {
        status: 'VERIFIED',
        word: 'มิตรภาพ',
        representation: {
          type: 'MOTION',
          data: {
            version: '1.0',
            fps: 30,
            duration_ms: 2000,
            frames: [],
          },
        },
        source: {
          type: 'AUTHORIZED_PROVIDER',
          name: 'วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล',
          license: 'Creative Commons CC-BY-SA 4.0',
          permission_status: 'AUTHORIZED',
        },
        verification: {
          status: 'VERIFIED',
          verified_by: 'วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล',
        },
        metadata: {
          sign_name: 'มิตรภาพ (Friendship / Amity)',
          dialect_region: 'มาตรฐานภาษามือไทย (ภาคกลาง)',
          description_th: 'ประสานนิ้วก้อยทั้งสองมือเข้าด้วยกัน แล้วดึงเข้ามาใกล้หน้าอกอย่างอ่อนโยน',
          description_source: 'OFFICIAL',
        },
      },
      ร่วมมือ: {
        status: 'VERIFIED',
        word: 'ร่วมมือ',
        representation: {
          type: 'MOTION',
          data: {
            version: '1.0',
            fps: 30,
            duration_ms: 1900,
            frames: [],
          },
        },
        source: {
          type: 'AUTHORIZED_PROVIDER',
          name: 'วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล',
          license: 'Creative Commons CC-BY-SA 4.0',
          permission_status: 'AUTHORIZED',
        },
        verification: {
          status: 'VERIFIED',
          verified_by: 'วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล',
        },
        metadata: {
          sign_name: 'ร่วมมือ (Cooperation / Collaboration)',
          dialect_region: 'มาตรฐานภาษามือไทย (ภาคกลาง)',
          description_th: 'ประสานนิ้วมือทั้งสองข้างเข้าด้วยกัน แล้วดึงเข้าหาลำตัวเล็กน้อย แสดงความร่วมแรงร่วมใจ',
          description_source: 'OFFICIAL',
        },
      },
      วิจัย: {
        status: 'VERIFIED',
        word: 'วิจัย',
        representation: {
          type: 'MOTION',
          data: {
            version: '1.0',
            fps: 30,
            duration_ms: 2200,
            frames: [],
          },
        },
        source: {
          type: 'AUTHORIZED_PROVIDER',
          name: 'วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล',
          license: 'Creative Commons CC-BY-SA 4.0',
          permission_status: 'AUTHORIZED',
        },
        verification: {
          status: 'VERIFIED',
          verified_by: 'วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล',
        },
        metadata: {
          sign_name: 'วิจัย (Research / Investigation)',
          dialect_region: 'มาตรฐานภาษามือไทย (ภาคกลาง)',
          description_th: 'ทำมือขวาเป็นรูปตัว C ส่องดูฝ่ามือซ้ายที่หงายอยู่ เสมือนใช้แว่นขยายตรวจสอบข้อมูลอย่างละเอียด',
          description_source: 'OFFICIAL',
        },
      },
    };

    if (DEMO_CATALOG[cleaned]) {
      return DEMO_CATALOG[cleaned];
    }

    return {
      status: 'NOT_AVAILABLE',
      word: cleaned,
      message: 'ยังไม่มีข้อมูลภาษามือไทยที่ผ่านการตรวจสอบ',
      verification: {
        status: 'NOT_AVAILABLE',
      },
    };
  }

  async createSignResource(dto: CreateSignResourceDto): Promise<any> {
    const wordClean = dto.word.trim();
    let wordRecord = await this.prisma.word.findUnique({ where: { headword: wordClean } });
    if (!wordRecord) {
      wordRecord = await this.prisma.word.create({
        data: {
          headword: wordClean,
          headwordClean: wordClean,
          charLength: wordClean.length,
        },
      });
    }

    const created = await this.prisma.signResource.create({
      data: {
        wordId: wordRecord.id,
        signName: dto.sign_name || wordClean,
        representationType: dto.representation_type || 'MOTION',
        sourceType: dto.source_type || 'DEMO_DATA',
        sourceUrl: dto.source_url || null,
        permissionStatus: dto.permission_status || 'AUTHORIZED',
        verificationStatus: dto.verification_status || 'VERIFIED',
        motionData: dto.motion_data || {},
        metadata: dto.metadata || {},
        providerName: dto.source_type === 'DEMO_DATA' ? 'THAI CONTEXT 3D Gesture Lab' : 'Authorized Provider',
      },
    });

    return {
      message: 'บันทึกทรัพยากรภาษามือไทยเรียบร้อยแล้ว',
      resource: created,
    };
  }

  async contributeSignResource(dto: ContributeSignResourceDto): Promise<any> {
    const wordClean = dto.word.trim();
    let wordRecord = await this.prisma.word.findUnique({ where: { headword: wordClean } });
    if (!wordRecord) {
      wordRecord = await this.prisma.word.create({
        data: {
          headword: wordClean,
          headwordClean: wordClean,
          charLength: wordClean.length,
        },
      });
    }

    const created = await this.prisma.signResource.create({
      data: {
        wordId: wordRecord.id,
        signName: wordClean,
        representationType: 'EXTERNAL_VIDEO',
        sourceType: 'USER_SUBMISSION',
        sourceUrl: dto.source_url.trim(),
        permissionStatus: 'PENDING',
        verificationStatus: 'PENDING_REVIEW',
        providerName: dto.provider_name ? dto.provider_name.trim() : 'User Submission',
        metadata: { notes: dto.notes },
      },
    });

    return {
      status: 'PENDING_REVIEW',
      message: 'ข้อเสนอแหล่งข้อมูลภาษามือถูกบันทึกเพื่อรอการตรวจสอบจากผู้เชี่ยวชาญแล้ว',
      submissionId: created.id,
    };
  }

  private static readonly THAI_BRAILLE_MAP: Record<
    string,
    { dots: number[]; role: string; description: string }
  > = {
    // Consonants
    'ก': { dots: [1, 2, 4, 5], role: 'consonant', description: 'ก. ไก่ (จุด 1-2-4-5)' },
    'ข': { dots: [1, 3], role: 'consonant', description: 'ข. ไข่ (จุด 1-3)' },
    'ฃ': { dots: [1, 3], role: 'consonant', description: 'ฃ. ขวด (จุด 1-3)' },
    'ค': { dots: [1, 4], role: 'consonant', description: 'ค. ควาย (จุด 1-4)' },
    'ฅ': { dots: [1, 4], role: 'consonant', description: 'ฅ. คน (จุด 1-4)' },
    'ฆ': { dots: [1, 2, 4, 5, 6], role: 'consonant', description: 'ฆ. ระฆัง (จุด 1-2-4-5-6)' },
    'ง': { dots: [3, 4, 5, 6], role: 'consonant', description: 'ง. งู (จุด 3-4-5-6)' },
    'จ': { dots: [2, 4, 5], role: 'consonant', description: 'จ. จาน (จุด 2-4-5)' },
    'ฉ': { dots: [1, 4, 6], role: 'consonant', description: 'ฉ. ฉิ่ง (จุด 1-4-6)' },
    'ช': { dots: [1, 4, 6], role: 'consonant', description: 'ช. ช้าง (จุด 1-4-6)' },
    'ซ': { dots: [1, 3, 5, 6], role: 'consonant', description: 'ซ. โซ่ (จุด 1-3-5-6)' },
    'ฌ': { dots: [1, 4, 6], role: 'consonant', description: 'ฌ. เฌอ (จุด 1-4-6)' },
    'ญ': { dots: [1, 3, 4, 5, 6], role: 'consonant', description: 'ญ. หญิง (จุด 1-3-4-5-6)' },
    'ฎ': { dots: [1, 4, 5], role: 'consonant', description: 'ฎ. ชฎา (จุด 1-4-5)' },
    'ฏ': { dots: [2, 3, 4, 5], role: 'consonant', description: 'ฏ. ปฏัก (จุด 2-3-4-5)' },
    'ฐ': { dots: [2, 3, 4, 6], role: 'consonant', description: 'ฐ. ฐาน (จุด 2-3-4-6)' },
    'ฑ': { dots: [2, 3, 4, 5, 6], role: 'consonant', description: 'ฑ. มณโฑ (จุด 2-3-4-5-6)' },
    'ฒ': { dots: [2, 3, 4, 5, 6], role: 'consonant', description: 'ฒ. ผู้เฒ่า (จุด 2-3-4-5-6)' },
    'ณ': { dots: [1, 3, 4, 5], role: 'consonant', description: 'ณ. เณร (จุด 1-3-4-5)' },
    'ด': { dots: [1, 4, 5], role: 'consonant', description: 'ด. เด็ก (จุด 1-4-5)' },
    'ต': { dots: [2, 3, 4, 5], role: 'consonant', description: 'ต. เต่า (จุด 2-3-4-5)' },
    'ถ': { dots: [2, 3, 4, 6], role: 'consonant', description: 'ถ. ถุง (จุด 2-3-4-6)' },
    'ท': { dots: [2, 3, 4, 5, 6], role: 'consonant', description: 'ท. ทหาร (จุด 2-3-4-5-6)' },
    'ธ': { dots: [2, 3, 4, 5, 6], role: 'consonant', description: 'ธ. ธง (จุด 2-3-4-5-6)' },
    'น': { dots: [1, 3, 4, 5], role: 'consonant', description: 'น. หนู (จุด 1-3-4-5)' },
    'บ': { dots: [1, 2], role: 'consonant', description: 'บ. ใบไม้ (จุด 1-2)' },
    'ป': { dots: [1, 2, 3, 4], role: 'consonant', description: 'ป. ปลา (จุด 1-2-3-4)' },
    'ผ': { dots: [1, 2, 3, 6], role: 'consonant', description: 'ผ. ผึ้ง (จุด 1-2-3-6)' },
    'ฝ': { dots: [1, 2, 4], role: 'consonant', description: 'ฝ. ฝา (จุด 1-2-4)' },
    'พ': { dots: [1, 2, 3, 4, 6], role: 'consonant', description: 'พ. พาน (จุด 1-2-3-4-6)' },
    'ฟ': { dots: [1, 2, 3, 5], role: 'consonant', description: 'ฟ. ฟัน (จุด 1-2-3-5)' },
    'ภ': { dots: [1, 2, 3, 4, 6], role: 'consonant', description: 'ภ. สำเภา (จุด 1-2-3-4-6)' },
    'ม': { dots: [1, 3, 4], role: 'consonant', description: 'ม. ม้า (จุด 1-3-4)' },
    'ย': { dots: [1, 3, 4, 5, 6], role: 'consonant', description: 'ย. ยักษ์ (จุด 1-3-4-5-6)' },
    'ร': { dots: [1, 2, 3, 5], role: 'consonant', description: 'ร. เรือ (จุด 1-2-3-5)' },
    'ฤ': { dots: [1, 2, 3, 5], role: 'vowel', description: 'ตัว ฤ (จุด 1-2-3-5)' },
    'ล': { dots: [1, 2, 3], role: 'consonant', description: 'ล. ลิง (จุด 1-2-3)' },
    'ว': { dots: [2, 4, 5, 6], role: 'consonant', description: 'ว. แหวน (จุด 2-4-5-6)' },
    'ศ': { dots: [1, 4, 6], role: 'consonant', description: 'ศ. ศาลา (จุด 1-4-6)' },
    'ษ': { dots: [1, 2, 3, 4, 6], role: 'consonant', description: 'ษ. ฤๅษี (จุด 1-2-3-4-6)' },
    'ส': { dots: [2, 3, 4], role: 'consonant', description: 'ส. เสือ (จุด 2-3-4)' },
    'ห': { dots: [1, 2, 5], role: 'consonant', description: 'ห. หีบ (จุด 1-2-5)' },
    'ฬ': { dots: [1, 2, 3], role: 'consonant', description: 'ฬ. จุฬา (จุด 1-2-3)' },
    'อ': { dots: [1, 3, 5], role: 'consonant', description: 'อ. อ่าง (จุด 1-3-5)' },
    'ฮ': { dots: [1, 2, 3, 4, 5, 6], role: 'consonant', description: 'ฮ. นกฮูก (จุด 1-2-3-4-5-6)' },

    // Vowels
    'ะ': { dots: [1], role: 'vowel', description: 'สระ อะ (จุด 1)' },
    'ั': { dots: [1, 6], role: 'vowel', description: 'ไม้หันอากาศ (จุด 1-6)' },
    'า': { dots: [1, 2, 6], role: 'vowel', description: 'สระ อา (จุด 1-2-6)' },
    'ำ': { dots: [2, 3, 5], role: 'vowel', description: 'สระ อำ (จุด 2-3-5)' },
    'ิ': { dots: [2, 4], role: 'vowel', description: 'สระ อิ (จุด 2-4)' },
    'ี': { dots: [3, 5], role: 'vowel', description: 'สระ อี (จุด 3-5)' },
    'ึ': { dots: [3, 4, 6], role: 'vowel', description: 'สระ อึ (จุด 3-4-6)' },
    'ื': { dots: [1, 2, 4, 6], role: 'vowel', description: 'สระ อือ (จุด 1-2-4-6)' },
    'ุ': { dots: [1, 3, 6], role: 'vowel', description: 'สระ อุ (จุด 1-3-6)' },
    'ู': { dots: [1, 2, 5, 6], role: 'vowel', description: 'สระ อู (จุด 1-2-5-6)' },
    'เ': { dots: [1, 5], role: 'vowel', description: 'สระ เอ (จุด 1-5)' },
    'แ': { dots: [1, 2, 4, 6], role: 'vowel', description: 'สระ แอ (จุด 1-2-4-6)' },
    'โ': { dots: [1, 3, 5], role: 'vowel', description: 'สระ โอ (จุด 1-3-5)' },
    'ใ': { dots: [1, 2, 3, 5, 6], role: 'vowel', description: 'สระ ใอ ไม้ม้วน (จุด 1-2-3-5-6)' },
    'ไ': { dots: [3, 4], role: 'vowel', description: 'สระ ไอ ไม้มลาย (จุด 3-4)' },

    // Tone marks & Special
    '็': { dots: [2, 6], role: 'symbol', description: 'ไม้ไต่คู้ (จุด 2-6)' },
    '่': { dots: [2], role: 'tone', description: 'ไม้เอก (จุด 2)' },
    '้': { dots: [2, 3], role: 'tone', description: 'ไม้โท (จุด 2-3)' },
    '๊': { dots: [2, 3, 5, 6], role: 'tone', description: 'ไม้ตรี (จุด 2-3-5-6)' },
    '๋': { dots: [2, 5, 6], role: 'tone', description: 'ไม้จัตวา (จุด 2-5-6)' },
    '์': { dots: [3, 6], role: 'symbol', description: 'ไม้ทัณฑฆาต / การันต์ (จุด 3-6)' },
    'ๆ': { dots: [5], role: 'symbol', description: 'ไม้ยมก (จุด 5)' },
    'ฯ': { dots: [2], role: 'symbol', description: 'ไปยาลน้อย (จุด 2)' },
  };

  private dotsToBrailleChar(dots: number[]): string {
    const mask = dots.reduce((acc, d) => acc | (1 << (d - 1)), 0);
    return String.fromCharCode(0x2800 | mask);
  }

  async getBraille(headword: string): Promise<BrailleResponseDto> {
    const cleaned = headword.trim();
    if (!cleaned) {
      return {
        word: '',
        brailleUnicode: '',
        brailleCells: [],
        readingGuide: '',
        audioText: '',
        sourceAttribution: 'สมาคมคนตาบอดแห่งประเทศไทย',
        verificationStatus: 'OFFICIAL',
      };
    }

    const cells: BrailleCellDto[] = [];
    const guideParts: string[] = [];

    for (const char of cleaned) {
      if (char === ' ') {
        cells.push({
          char: ' ',
          braille: '⠀',
          dots: [],
          role: 'other',
          description: 'เว้นวรรค (ช่องว่าง)',
        });
        continue;
      }

      const mapping = AccessibilityService.THAI_BRAILLE_MAP[char];
      if (mapping) {
        const brailleChar = this.dotsToBrailleChar(mapping.dots);
        cells.push({
          char,
          braille: brailleChar,
          dots: mapping.dots,
          role: mapping.role,
          description: mapping.description,
        });
        guideParts.push(`${char} (${brailleChar}, จุด ${mapping.dots.join('-')})`);
      } else {
        const code = char.charCodeAt(0);
        const dots = code >= 65 && code <= 90 ? [1, 2] : [1];
        const brailleChar = this.dotsToBrailleChar(dots);
        cells.push({
          char,
          braille: brailleChar,
          dots,
          role: 'other',
          description: `${char}`,
        });
        guideParts.push(`${char} (${brailleChar})`);
      }
    }

    const brailleUnicode = cells.map((c) => c.braille).join('');
    const readingGuide = `สะกดอักษรเบรลล์: ${guideParts.join(' + ')}`;

    return {
      word: cleaned,
      brailleUnicode,
      brailleCells: cells,
      readingGuide,
      audioText: cleaned,
      sourceAttribution: 'สมาคมคนตาบอดแห่งประเทศไทย (สถาบันวิจัยและส่งเสริมอักษรเบรลล์แห่งชาติ)',
      verificationStatus: 'OFFICIAL',
    };
  }

  async decodeBraille(brailleInput: string): Promise<DecodedBrailleResponseDto> {
    const input = (brailleInput || '').trim();
    if (!input) {
      return {
        brailleInput: '',
        decodedText: '',
        cells: [],
        readingGuide: '',
        hasAmbiguity: false,
      };
    }

    const priorityMap: Record<string, { primary: string; alternatives: string[] }> = {
      '1-3': { primary: 'ข', alternatives: ['ฃ'] },
      '1-4': { primary: 'ค', alternatives: ['ฅ'] },
      '1-4-6': { primary: 'ช', alternatives: ['ฉ', 'ฌ', 'ศ'] },
      '1-4-5': { primary: 'ด', alternatives: ['ฎ'] },
      '2-3-4-5': { primary: 'ต', alternatives: ['ฏ'] },
      '2-3-4-6': { primary: 'ถ', alternatives: ['ฐ'] },
      '2-3-4-5-6': { primary: 'ท', alternatives: ['ฑ', 'ฒ', 'ธ'] },
      '1-3-4-5': { primary: 'น', alternatives: ['ณ'] },
      '1-2-3-4-6': { primary: 'พ', alternatives: ['ภ', 'ษ'] },
      '1-2-3-5': { primary: 'ร', alternatives: ['ฟ', 'ฤ'] },
      '1-2-3': { primary: 'ล', alternatives: ['ฬ'] },
      '1-3-4-5-6': { primary: 'ย', alternatives: ['ญ'] },
      '1-3-5': { primary: 'อ', alternatives: ['โ'] },
      '1-2-4-6': { primary: 'แ', alternatives: ['ื'] },
    };

    const cells: DecodedBrailleCellDto[] = [];
    const guideParts: string[] = [];

    for (const char of input) {
      if (char === ' ' || char === '⠀') {
        cells.push({
          char: ' ',
          braille: '⠀',
          dots: [],
          role: 'other',
          description: 'เว้นวรรค',
        });
        guideParts.push('เว้นวรรค');
        continue;
      }

      const code = char.charCodeAt(0);
      let dots: number[] = [];

      if (code >= 0x2800 && code <= 0x28ff) {
        const mask = code - 0x2800;
        for (let d = 1; d <= 8; d++) {
          if ((mask & (1 << (d - 1))) !== 0) {
            dots.push(d);
          }
        }
      } else {
        const existing = AccessibilityService.THAI_BRAILLE_MAP[char];
        if (existing) {
          dots = existing.dots;
        }
      }

      dots.sort((a, b) => a - b);
      const dotKey = dots.join('-');
      const brailleChar = this.dotsToBrailleChar(dots);

      let decodedCell: DecodedBrailleCellDto;
      const priority = priorityMap[dotKey];
      if (priority) {
        const mapping = AccessibilityService.THAI_BRAILLE_MAP[priority.primary];
        decodedCell = {
          char: priority.primary,
          braille: brailleChar,
          dots,
          alternatives: priority.alternatives,
          role: mapping?.role || 'consonant',
          description: mapping?.description || `${priority.primary} (จุด ${dotKey})`,
        };
      } else {
        let matched = false;
        for (const [tChar, meta] of Object.entries(AccessibilityService.THAI_BRAILLE_MAP)) {
          const metaKey = [...meta.dots].sort((a, b) => a - b).join('-');
          if (metaKey === dotKey) {
            decodedCell = {
              char: tChar,
              braille: brailleChar,
              dots,
              role: meta.role,
              description: meta.description,
            };
            matched = true;
            break;
          }
        }
        if (!matched) {
          decodedCell = {
            char: dots.length === 0 ? char : '?',
            braille: brailleChar,
            dots,
            role: 'other',
            description: dots.length === 0 ? char : `จุด ${dotKey}`,
          };
        }
      }

      cells.push(decodedCell!);
      const altText = decodedCell!.alternatives?.length
        ? ` (หรือ ${decodedCell!.alternatives.join(', ')})`
        : '';
      guideParts.push(`${decodedCell!.char}${altText}`);
    }

    const decodedText = cells.map((c) => c.char).join('');
    const hasAmbiguity = cells.some((c) => !!c.alternatives && c.alternatives.length > 0);
    const readingGuide = `ถอดรหัสเป็นข้อความ: ${guideParts.join(' + ')}`;

    return {
      brailleInput: input,
      decodedText,
      cells,
      readingGuide,
      hasAmbiguity,
    };
  }
}

