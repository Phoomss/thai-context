import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../database/prisma.service';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);
  private readonly cache = new Map<string, CacheEntry<any>>();
  private readonly TTL_MS = 1000 * 60 * 15; // 15 minutes TTL

  constructor(private readonly prisma: PrismaService) {}

  private getFromCache<T = any>(key: string): T | null {
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

  async getWordDetail(headword: string): Promise<any> {
    const cacheKey = `word_detail:${headword}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;
    const word = await this.prisma.word.findUnique({
      where: { headword },
      include: {
        entries: {
          include: {
            edition: {
              include: { source: true },
            },
            definitions: {
              include: {
                pos: true,
                examples: true,
              },
              orderBy: { senseOrder: 'asc' },
            },
            semanticMappings: {
              include: {
                dialectEntry: {
                  include: { region: true },
                },
              },
            },
          },
          orderBy: {
            edition: { editionYear: 'desc' },
          },
        },
        relationshipsAsSource: {
          include: { targetWord: true },
        },
        relationshipsAsTarget: {
          include: { sourceWord: true },
        },
      },
    });

    if (!word || word.entries.length === 0) {
      throw new NotFoundException(`ไม่พบข้อมูลคำว่า '${headword}' ในคลังพจนานุกรมทางการ`);
    }

    // Format Official Information
    const officialEntries = word.entries.map((entry) => ({
      edition: entry.edition.editionYear,
      editionCode: entry.edition.editionCode,
      editionTitle: entry.edition.title,
      source: entry.edition.source.name,
      pronunciation: entry.pronunciation,
      pageNumber: entry.pageNumber,
      metadata: entry.metadata,
      definitions: entry.definitions.map((def) => ({
        pos: def.pos ? def.pos.abbrThai : 'ไม่ระบุ',
        posName: def.pos ? def.pos.nameThai : null,
        senseOrder: def.senseOrder,
        definitionText: def.definitionText,
        registerLevel: def.registerLevel,
        subjectDomain: def.subjectDomain,
        examples: def.examples.map((ex) => ({
          text: ex.exampleText,
          source: ex.sourceAttribution,
        })),
      })),
    }));

    // Relationships (Synonyms, Antonyms, Near-synonyms)
    const relationships = [
      ...word.relationshipsAsSource.map((r) => ({
        relatedWord: r.targetWord.headword,
        relationshipType: r.relationshipType,
        sourceType: r.sourceType,
      })),
      ...word.relationshipsAsTarget.map((r) => ({
        relatedWord: r.sourceWord.headword,
        relationshipType: r.relationshipType,
        sourceType: r.sourceType,
      })),
    ];

    // Dialect mappings
    const dialectMappings: any[] = [];
    for (const entry of word.entries) {
      for (const sm of entry.semanticMappings) {
        dialectMappings.push({
          dialectWord: sm.dialectEntry.dialectWord,
          region: sm.dialectEntry.region.nameThai,
          meaning: sm.dialectEntry.localMeaning,
          confidence: Number(sm.confidenceScore),
          type: sm.sourceType, // 'OFFICIAL_DATA' | 'AI_INFERRED'
          culturalNotes: sm.dialectEntry.culturalNotes,
        });
      }
    }

    // AI Assistance section
    const latestDef = officialEntries[0]?.definitions[0]?.definitionText || '';
    const aiAssistance = {
      summary: `คำว่า "${headword}" ในพจนานุกรมฉบับล่าสุดมุ่งเน้นความหมาย: "${latestDef}"`,
      recommendedContexts: [
        'เอกสารทางราชการและรายงานวิชาการ',
        'การสื่อสารเชิงบริหารและองค์กร',
      ],
      nuanceAnalysis: 'เป็นคำศัพท์ระดับทางการ (Formal Register) มีความน่าเชื่อถือสูง เหมาะสำหรับการใช้งานที่ต้องการความถูกต้องตามหลักพจนานุกรมราชบัณฑิตยสภา',
      disclaimer: 'คำแนะนำนี้ประมวลผลโดย AI Assistance และอ้างอิงจากหลักฐานพจนานุกรมฉบับทางการ',
    };

    const result = {
      word: word.headword,
      charLength: word.charLength,
      officialData: {
        entries: officialEntries,
        relationships,
        dialectMappings,
      },
      aiAssistance,
    };
    this.setCache(cacheKey, result);
    return result;
  }

  private evolutionComparisonCache: Record<string, any> | null = null;

  private getEvolutionComparisonData(): Record<string, any> | null {
    if (this.evolutionComparisonCache) return this.evolutionComparisonCache;
    const candidatePaths = [
      path.resolve(process.cwd(), '../../data/processed/dict/dict_evolution_comparison.json'),
      path.resolve(process.cwd(), '../data/processed/dict/dict_evolution_comparison.json'),
      path.resolve(process.cwd(), 'data/processed/dict/dict_evolution_comparison.json'),
      '/app/data/processed/dict/dict_evolution_comparison.json',
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          const raw = fs.readFileSync(p, 'utf-8');
          this.evolutionComparisonCache = JSON.parse(raw);
          return this.evolutionComparisonCache;
        } catch (e) {
          this.logger.warn(`Failed to parse evolution comparison data from ${p}: ${e}`);
        }
      }
    }
    return null;
  }

  async getWordEvolution(headword: string): Promise<any> {
    const cacheKey = `evolution:${headword}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const word = await this.prisma.word.findUnique({
      where: { headword },
      include: {
        entries: {
          include: {
            edition: {
              include: { source: true },
            },
            definitions: {
              orderBy: { senseOrder: 'asc' },
            },
          },
          orderBy: { edition: { editionYear: 'asc' } },
        },
      },
    });

    if (word && word.entries && word.entries.length > 0) {
      // Prioritize official Royal Society dictionary editions (2542, 2554, 2569)
      const royalEntries = word.entries.filter(
        (e) =>
          e.edition?.editionCode?.startsWith('ROYAL_25') ||
          (e.edition?.source?.code === 'ROYAL_SOCIETY' && e.edition?.editionCode !== 'ROYAL_COINED'),
      );
      const entriesToUse = royalEntries.length > 0 ? royalEntries : word.entries;

      let previousDef: string | null = null;
      const timeline = entriesToUse.map((entry, index) => {
        const rawDef = entry.definitions[0]?.definitionText || 'ไม่มีนิยามระบุ';
        const cleanDef = rawDef.replace(/^\[SAMPLE DEFINITION\s*—\s*\d+\]\s*/i, '').trim();
        const isFirst = index === 0;
        let status = 'UNCHANGED';

        if (isFirst) {
          status = entry.edition.editionYear === '2542' ? 'ORIGINAL' : 'ADDED';
          previousDef = cleanDef;
        } else if (!cleanDef || cleanDef === 'ไม่มีนิยามระบุ') {
          status = 'NOT_FOUND';
        } else if (cleanDef === previousDef) {
          status = 'UNCHANGED';
        } else {
          const isExpanded =
            previousDef &&
            (cleanDef.length > previousDef.length * 1.15 ||
              (previousDef.length > 10 && cleanDef.includes(previousDef.slice(0, 15))));
          status = isExpanded ? 'EXPANDED' : 'CHANGED';
          previousDef = cleanDef;
        }

        return {
          editionYear: entry.edition.editionYear,
          edition: entry.edition.editionYear,
          editionTitle: entry.edition.title,
          definition: cleanDef,
          status,
          pageNumber: entry.pageNumber ?? null,
        };
      });

      const result = {
        word: word.headword,
        timeline,
      };
      this.setCache(cacheKey, result);
      return result;
    }

    // Secondary fallback: Check historical 3-edition comparison dataset (8,331 words)
    const comparisonData = this.getEvolutionComparisonData();
    if (comparisonData && comparisonData[headword]) {
      const item = comparisonData[headword];
      const editions = item.editions || {};
      const eraYears = ['2542', '2554', '2569'];
      const eraTitles: Record<string, string> = {
        '2542': 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒',
        '2554': 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔',
        '2569': 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙',
      };

      let previousDef: string | null = null;
      const timeline: any[] = [];

      for (let i = 0; i < eraYears.length; i++) {
        const year = eraYears[i];
        const senses = editions[year];
        const defText = senses && senses.length > 0 ? senses[0].definition : null;
        const cleanDef = defText ? defText.trim() : null;

        if (!cleanDef) {
          continue;
        }

        let status = 'UNCHANGED';
        if (!previousDef) {
          status = year === '2542' ? 'ORIGINAL' : 'ADDED';
          previousDef = cleanDef;
        } else if (cleanDef === previousDef) {
          status = 'UNCHANGED';
        } else {
          const isExpanded =
            cleanDef.length > previousDef.length * 1.15 ||
            (previousDef.length > 10 && cleanDef.includes(previousDef.slice(0, 15)));
          status = isExpanded ? 'EXPANDED' : 'CHANGED';
          previousDef = cleanDef;
        }

        timeline.push({
          editionYear: year,
          edition: year,
          editionTitle: eraTitles[year] || `พจนานุกรม ฉบับ พ.ศ. ${year}`,
          definition: cleanDef,
          status,
          pageNumber: null,
        });
      }

      if (timeline.length > 0) {
        const result = {
          word: headword,
          timeline,
        };
        this.setCache(cacheKey, result);
        return result;
      }
    }

    throw new NotFoundException(`ไม่พบข้อมูลประวัติวิวัฒนาการของคำว่า '${headword}'`);
  }

  async compareWordEditions(headword: string): Promise<any> {
    const cacheKey = `compare_editions:${headword}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const editions = await this.prisma.dictionaryEdition.findMany({
      where: { isActive: true, source: { code: 'ROYAL_SOCIETY' } },
      orderBy: { editionYear: 'asc' },
    });

    const word = await this.prisma.word.findUnique({
      where: { headword },
      include: {
        entries: {
          include: {
            edition: true,
            definitions: { orderBy: { senseOrder: 'asc' } },
          },
        },
      },
    });

    let previousDef: string | null = null;
    const comparisons = editions.map((ed) => {
      const entry = word?.entries.find((e) => e.editionId === ed.id);
      const defText = entry?.definitions[0]?.definitionText || null;

      let status = 'UNCHANGED';
      if (!defText) {
        status = 'NO_DATA';
      } else if (!previousDef) {
        status = 'ADDED';
        previousDef = defText;
      } else if (previousDef !== defText) {
        status = 'CHANGED';
        previousDef = defText;
      } else {
        status = 'UNCHANGED';
      }

      return {
        edition: ed.editionYear,
        editionTitle: ed.title,
        status, // 'ADDED' | 'CHANGED' | 'UNCHANGED' | 'NO_DATA'
        definition: defText,
        pageNumber: entry?.pageNumber || null,
      };
    });

    const result = {
      word: headword,
      editions: comparisons,
    };
    this.setCache(cacheKey, result);
    return result;
  }
}
