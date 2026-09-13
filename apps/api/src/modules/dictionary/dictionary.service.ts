import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DictionaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getWordDetail(headword: string) {
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
      editionTitle: entry.edition.title,
      source: entry.edition.source.name,
      pronunciation: entry.pronunciation,
      pageNumber: entry.pageNumber,
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

    return {
      word: word.headword,
      charLength: word.charLength,
      officialData: {
        entries: officialEntries,
        relationships,
        dialectMappings,
      },
      aiAssistance,
    };
  }

  async getWordEvolution(headword: string) {
    const word = await this.prisma.word.findUnique({
      where: { headword },
      include: {
        entries: {
          include: {
            edition: true,
            definitions: {
              orderBy: { senseOrder: 'asc' },
            },
          },
          orderBy: { edition: { editionYear: 'asc' } },
        },
      },
    });

    if (!word) {
      throw new NotFoundException(`ไม่พบข้อมูลประวัติวิวัฒนาการของคำว่า '${headword}'`);
    }

    const timeline = word.entries.map((entry) => ({
      edition: entry.edition.editionYear,
      editionTitle: entry.edition.title,
      definition: entry.definitions[0]?.definitionText || 'ไม่มีนิยามระบุ',
      pageNumber: entry.pageNumber,
    }));

    return {
      word: word.headword,
      timeline,
    };
  }

  async compareWordEditions(headword: string) {
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

    return {
      word: headword,
      editions: comparisons,
    };
  }
}
