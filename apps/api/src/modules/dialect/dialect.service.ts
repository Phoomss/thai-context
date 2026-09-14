import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DialectFilterDto } from './dto/dialect.dto';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class DialectService {
  private readonly logger = new Logger(DialectService.name);
  private readonly cache = new Map<string, CacheEntry<any>>();
  private readonly TTL_MS = 1000 * 60 * 15; // 15 mins

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
    if (this.cache.size > 500) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, expiresAt: Date.now() + this.TTL_MS });
  }

  async listDialects(filter: DialectFilterDto) {
    const whereClause: any = {};

    if (filter.region) {
      whereClause.region = {
        OR: [
          { code: { equals: filter.region, mode: 'insensitive' } },
          { nameThai: { contains: filter.region } },
        ],
      };
    }

    if (filter.word) {
      whereClause.OR = [
        { dialectWord: { contains: filter.word } },
        { dialectWordClean: { contains: filter.word } },
      ];
    }

    if (filter.meaning) {
      whereClause.localMeaning = { contains: filter.meaning };
    }

    const entries = await this.prisma.dialectEntry.findMany({
      where: whereClause,
      include: {
        region: true,
        edition: {
          include: { source: true },
        },
        semanticMappings: {
          include: {
            standardEntry: {
              include: { word: true },
            },
          },
        },
      },
      orderBy: { dialectWord: 'asc' },
    });

    const result = {
      count: entries.length,
      results: entries.map((e) => ({
        id: e.id,
        dialectWord: e.dialectWord,
        region: e.region.nameThai,
        regionCode: e.region.code,
        meaning: e.localMeaning,
        culturalNotes: e.culturalNotes,
        standardEquivalents: e.semanticMappings.map((sm) => ({
          standardWord: sm.standardEntry.word.headword,
          confidence: Number(sm.confidenceScore),
          type: sm.sourceType === 'OFFICIAL_DATA' ? 'OFFICIAL' : 'AI_INFERRED',
        })),
        source: e.edition.source.name,
        edition: e.edition.editionYear,
      })),
    };
    return result;
  }

  async getStandardDialectMapping(standardWord: string): Promise<any> {
    const cacheKey = `dialect_map:${standardWord}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const word = await this.prisma.word.findUnique({
      where: { headword: standardWord },
      include: {
        entries: {
          include: {
            semanticMappings: {
              include: {
                dialectEntry: {
                  include: { region: true },
                },
              },
            },
          },
        },
      },
    });

    if (!word) {
      throw new NotFoundException(`ไม่พบข้อมูลคำมาตรฐาน '${standardWord}'`);
    }

    const mappings = [];
    const seen = new Set<string>();

    for (const entry of word.entries) {
      for (const sm of entry.semanticMappings) {
        const diaWord = sm.dialectEntry.dialectWord;
        const regionName = sm.dialectEntry.region.nameThai;
        const key = `${diaWord}-${regionName}`;
        if (!seen.has(key)) {
          seen.add(key);
          mappings.push({
            word: diaWord,
            region: regionName,
            regionCode: sm.dialectEntry.region.code,
            meaning: sm.dialectEntry.localMeaning,
            confidence: Number(sm.confidenceScore),
            type: sm.sourceType === 'OFFICIAL_DATA' ? 'OFFICIAL' : 'AI_INFERRED',
            culturalNotes: sm.dialectEntry.culturalNotes,
          });
        }
      }
    }

    const result = {
      standardWord,
      mappings,
    };
    this.setCache(cacheKey, result);
    return result;
  }
}
