import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AIService } from '../ai/ai.service';
import { KeywordSearchQueryDto, MeaningSearchDto, ContextSearchDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
  ) {}

  async keywordSearch(queryDto: KeywordSearchQueryDto) {
    const q = queryDto.q.trim();

    // Query official words and definitions
    const definitions = await this.prisma.definition.findMany({
      where: {
        OR: [
          { entry: { word: { headword: { contains: q, mode: 'insensitive' } } } },
          { entry: { word: { headwordClean: { contains: q, mode: 'insensitive' } } } },
          { definitionText: { contains: q, mode: 'insensitive' } },
          { subjectDomain: { contains: q, mode: 'insensitive' } },
        ],
        ...(queryDto.edition
          ? { entry: { edition: { editionYear: queryDto.edition } } }
          : {}),
        ...(queryDto.source
          ? { entry: { edition: { source: { code: queryDto.source } } } }
          : {}),
      },
      include: {
        pos: true,
        entry: {
          include: {
            word: true,
            edition: {
              include: { source: true },
            },
          },
        },
      },
      take: 20,
    });

    const results = definitions.map((d) => ({
      word: d.entry.word.headword,
      definition: d.definitionText,
      partOfSpeech: d.pos ? d.pos.abbrThai : 'ไม่ระบุ',
      source: d.entry.edition.source.name,
      edition: d.entry.edition.editionYear,
      editionTitle: d.entry.edition.title,
      editionCode: d.entry.edition.editionCode,
      subjectDomain: d.subjectDomain,
      metadata: d.entry.metadata,
    }));

    return {
      query: q,
      results,
    };
  }

  async meaningSearch(dto: MeaningSearchDto) {
    const rawQuery = dto.query.trim();

    // 1. Call AI Service for query understanding & recommendation
    const aiResult = await this.aiService.getRecommendations(rawQuery);

    const formattedResults = aiResult.recommendations.map((item) => {
      const topEvidence = item.evidence[0];
      return {
        word: item.word,
        score: item.score,
        reason: item.reason,
        source: {
          name: topEvidence ? topEvidence.source : 'สำนักงานราชบัณฑิตยสภา',
          edition: topEvidence ? topEvidence.edition : '2554',
        },
      };
    });

    return {
      query: rawQuery,
      intent: aiResult.intent || 'find_word_by_meaning',
      results: formattedResults,
    };
  }

  async contextSearch(dto: ContextSearchDto) {
    const rawQuery = dto.query.trim();

    // Call AI recommendation pipeline with explicit context
    const aiResult = await this.aiService.getRecommendations(rawQuery, dto.context);

    return {
      intent: aiResult.intent || 'find_alternative_word',
      context: aiResult.context || dto.context || null,
      excludedTerms: aiResult.excluded_terms || [],
      results: aiResult.recommendations,
    };
  }
}
