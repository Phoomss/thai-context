import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DialectFilterDto } from './dto/dialect.dto';

@Injectable()
export class DialectService {
  constructor(private readonly prisma: PrismaService) {}

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

    return {
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
  }

  async getStandardDialectMapping(standardWord: string) {
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
            meaning: sm.dialectEntry.localMeaning,
            confidence: Number(sm.confidenceScore),
            type: sm.sourceType === 'OFFICIAL_DATA' ? 'OFFICIAL' : 'AI_INFERRED',
          });
        }
      }
    }

    return {
      standardWord: word.headword,
      mappings,
    };
  }
}
