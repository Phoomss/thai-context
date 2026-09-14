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

    // 1. Fetch Official Dictionary Data for each word
    const wordsOfficialData = await Promise.all(
      headwords.map(async (hw) => {
        const word = await this.prisma.word.findUnique({
          where: { headword: hw },
          include: {
            entries: {
              include: {
                definitions: {
                  include: { pos: true },
                  orderBy: { senseOrder: 'asc' },
                },
                edition: true,
              },
              orderBy: { edition: { editionYear: 'desc' } },
            },
          },
        });

        const latestEntry = word?.entries[0];
        const latestDef = latestEntry?.definitions[0];

        return {
          word: hw,
          definition: latestDef?.definitionText || 'ไม่มีข้อมูลในพจนานุกรมทางการ',
          partOfSpeech: latestDef?.pos ? latestDef.pos.abbrThai : 'ไม่ระบุ',
          edition: latestEntry?.edition?.editionYear || '2554',
          foundInOfficial: Boolean(word),
        };
      })
    );

    // 2. Call AI Service to get nuanced comparison grounded in definitions
    const aiComparison = await this.aiService.compareWords(wordsOfficialData);

    // 3. Assemble verified evidence from official entries
    const evidence = wordsOfficialData
      .filter((w) => w.foundInOfficial)
      .map((w) => ({
        word: w.word,
        source: 'สำนักงานราชบัณฑิตยสภา',
        edition: w.edition,
        definition: w.definition,
        relevance: 1.0,
      }));

    return {
      words: wordsOfficialData.map((w) => ({
        headword: w.word,
        definition: w.definition,
        partOfSpeech: w.partOfSpeech,
        edition: w.edition,
      })),
      comparison: aiComparison.comparison,
      evidence,
    };
  }
}
