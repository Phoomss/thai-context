import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AIService } from '../ai/ai.service';
import { CompareWordsDto } from './dto/compare.dto';

@Injectable()
export class CompareService {
  private readonly logger = new Logger(CompareService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
  ) {}

  async compareWords(dto: CompareWordsDto) {
    const headwords = dto.words.map((w) => w.trim());

    // 1. Fetch Official Dictionary Data & Modern Vocabulary Data for each word
    const wordsData = await Promise.all(
      headwords.map(async (hw) => {
        const wordPromise = this.prisma.word?.findUnique
          ? this.prisma.word.findUnique({
              where: { headword: hw },
              include: {
                entries: {
                  include: {
                    definitions: {
                      include: { pos: true },
                      orderBy: { senseOrder: 'asc' },
                    },
                    edition: { include: { source: true } },
                  },
                  orderBy: { edition: { editionYear: 'desc' } },
                },
              },
            })
          : Promise.resolve(null);

        const modernPromise = this.prisma.modernTerm?.findFirst
          ? this.prisma.modernTerm.findFirst({
              where: {
                OR: [
                  { term: hw },
                  { slug: hw.toLowerCase().replace(/[^a-z0-9ก-๙]/g, '-') },
                  { normalizedTerm: hw.toLowerCase().replace(/[\s\-_.,'"?!()[\]{}:;]/g, '') },
                ],
              },
              include: {
                definitions: { take: 1 },
                sources: { take: 1 },
                examples: { take: 1 },
                categories: true,
              },
            })
          : Promise.resolve(null);

        const [word, modernTerm] = await Promise.all([wordPromise, modernPromise]);

        const latestEntry = word?.entries[0];
        const latestDef = latestEntry?.definitions[0];

        if (modernTerm && !word) {
          // Pure modern term
          return {
            word: modernTerm.term,
            type: 'MODERN',
            definition: modernTerm.definitions[0]?.definition || modernTerm.description || '',
            partOfSpeech: modernTerm.termType || 'คำศัพท์สมัยใหม่',
            edition: 'MODERN',
            editionTitle: 'คำศัพท์สมัยใหม่ (Modern Vocabulary)',
            source: modernTerm.sources[0]?.sourceName || 'คลังคำศัพท์สมัยใหม่ THAI CONTEXT',
            sourceType: modernTerm.sources[0]?.sourceType || 'DEMO',
            register: modernTerm.register || 'INFORMAL',
            audience: modernTerm.audience || 'GENERAL',
            origin: modernTerm.origin || 'UNKNOWN',
            categories: modernTerm.categories.map((c) => c.category),
            example: modernTerm.examples[0]?.exampleText || null,
            foundInOfficial: false,
            foundInModern: true,
          };
        }

        if (word && modernTerm) {
          // Exists in both official dictionary and modern usage
          return {
            word: word.headword,
            type: 'BOTH',
            definition: latestDef?.definitionText || modernTerm.definitions[0]?.definition || '',
            modernDefinition: modernTerm.definitions[0]?.definition || null,
            partOfSpeech: latestDef?.pos ? latestDef.pos.abbrThai : modernTerm.termType,
            edition: latestEntry?.edition?.editionYear || '2554',
            editionTitle: latestEntry?.edition?.title || 'พจนานุกรม ฉบับราชบัณฑิตยสถาน',
            source: 'สำนักงานราชบัณฑิตยสภา / ภาษาร่วมสมัย',
            sourceType: 'OFFICIAL_AND_MODERN',
            register: 'FORMAL_AND_INFORMAL',
            audience: 'GENERAL',
            origin: modernTerm.origin || 'THAI',
            categories: modernTerm.categories.map((c) => c.category),
            example: modernTerm.examples[0]?.exampleText || null,
            foundInOfficial: true,
            foundInModern: true,
          };
        }

        if (word) {
          // Pure official word
          return {
            word: word.headword,
            type: 'OFFICIAL',
            definition: latestDef?.definitionText || 'ไม่มีนิยามในระบบ',
            partOfSpeech: latestDef?.pos ? latestDef.pos.abbrThai : 'ไม่ระบุ',
            edition: latestEntry?.edition?.editionYear || '2554',
            editionTitle: latestEntry?.edition?.title || 'พจนานุกรม ฉบับราชบัณฑิตยสถาน',
            source: latestEntry?.edition?.source?.name || 'สำนักงานราชบัณฑิตยสภา',
            sourceType: 'OFFICIAL',
            register: 'FORMAL',
            audience: 'GENERAL',
            origin: 'THAI',
            categories: ['มาตรฐาน'],
            example: null,
            foundInOfficial: true,
            foundInModern: false,
          };
        }

        // Neither found
        return {
          word: hw,
          type: 'UNVERIFIED',
          definition: 'ไม่พบข้อมูลในคลังคำศัพท์ที่ระบบรองรับ',
          partOfSpeech: 'ไม่ระบุ',
          edition: 'ไม่พบข้อมูล',
          editionTitle: 'ไม่มีข้อมูล',
          source: 'ไม่พบแหล่งอ้างอิง',
          sourceType: 'UNVERIFIED',
          register: 'NEUTRAL',
          audience: 'GENERAL',
          origin: 'UNKNOWN',
          categories: [],
          example: null,
          foundInOfficial: false,
          foundInModern: false,
        };
      })
    );

    // 2. Call AI Service to get nuanced comparison grounded in definitions
    const aiComparison = await this.aiService.compareWords(
      wordsData.map((w) => ({
        word: w.word,
        definition: w.definition,
        partOfSpeech: w.partOfSpeech,
        edition: w.edition,
        foundInOfficial: w.foundInOfficial,
      }))
    );
    const comparisonResult = aiComparison.comparison;

    // 3. Assemble verified evidence from official entries and modern sources
    const evidence = wordsData.map((w) => ({
      word: w.word,
      source: w.source,
      edition: w.edition,
      definition: w.definition,
      source_type: w.sourceType,
      is_official: w.foundInOfficial,
      relevance: 1.0,
    }));

    return {
      words: wordsData.map((w) => ({
        headword: w.word,
        type: w.type,
        definition: w.definition,
        partOfSpeech: w.partOfSpeech,
        edition: w.edition,
        editionTitle: w.editionTitle,
        source: w.source,
        register: w.register,
        audience: w.audience,
        origin: w.origin,
        categories: w.categories,
        example: w.example,
        is_official: w.foundInOfficial,
      })),
      comparison: comparisonResult,
      evidence,
    };
  }
}
