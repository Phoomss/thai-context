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
    const isExact = queryDto.exact === true || queryDto.exact === 'true';
    const take = queryDto.limit ? Math.min(100, Math.max(1, parseInt(String(queryDto.limit), 10))) : 20;
    const page = queryDto.page ? Math.max(1, parseInt(String(queryDto.page), 10)) : 1;

    const editionConditions: any = {};
    if (queryDto.edition) {
      editionConditions.editionYear = queryDto.edition;
    }
    if (queryDto.source) {
      editionConditions.source = { code: queryDto.source };
    }

    const whereConditions: any = {
      ...(Object.keys(editionConditions).length > 0
        ? { entry: { edition: editionConditions } }
        : {}),
    };

    if (isExact) {
      whereConditions.OR = [
        { entry: { word: { headword: { equals: q, mode: 'insensitive' } } } },
        { entry: { word: { headwordClean: { equals: q, mode: 'insensitive' } } } },
      ];
    } else {
      whereConditions.OR = [
        { entry: { word: { headword: { contains: q, mode: 'insensitive' } } } },
        { entry: { word: { headwordClean: { contains: q, mode: 'insensitive' } } } },
        { definitionText: { contains: q, mode: 'insensitive' } },
        { subjectDomain: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Query official words and definitions
    const definitions = await this.prisma.definition.findMany({
      where: whereConditions,
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
      take: take * 2,
    });

    const mapped = definitions.map((d) => {
      const rawDef = d.definitionText || '';
      const cleanDef = rawDef.replace(/^\[SAMPLE DEFINITION\s*—\s*\d+\]\s*/i, '').trim();
      return {
        word: d.entry.word.headword,
        headwordClean: d.entry.word.headwordClean,
        definition: cleanDef,
        partOfSpeech: d.pos ? d.pos.abbrThai : 'ไม่ระบุ',
        source: d.entry.edition.source.name,
        sourceCode: d.entry.edition.source.code,
        edition: d.entry.edition.editionYear,
        editionTitle: d.entry.edition.title,
        editionCode: d.entry.edition.editionCode,
        subjectDomain: d.subjectDomain,
        pageNumber: d.entry.pageNumber,
        metadata: d.entry.metadata,
      };
    });

    // Re-rank results: Exact headword match > startsWith > contains in headword > definition text
    const qLower = q.toLowerCase();
    mapped.sort((a, b) => {
      const aHead = a.word.toLowerCase();
      const bHead = b.word.toLowerCase();

      const aRank = aHead === qLower ? 4 : aHead.startsWith(qLower) ? 3 : aHead.includes(qLower) ? 2 : 1;
      const bRank = bHead === qLower ? 4 : bHead.startsWith(qLower) ? 3 : bHead.includes(qLower) ? 2 : 1;

      if (aRank !== bRank) return bRank - aRank;

      // Secondary sort: latest edition year first
      const aYear = parseInt(a.edition, 10) || 0;
      const bYear = parseInt(b.edition, 10) || 0;
      return bYear - aYear;
    });

    const paginatedResults = mapped.slice(0, take);

    return {
      query: q,
      total: mapped.length,
      page,
      limit: take,
      filters: {
        edition: queryDto.edition || null,
        source: queryDto.source || null,
        exact: isExact,
      },
      results: paginatedResults,
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
        definition: topEvidence ? topEvidence.definition : item.reason,
        source: {
          name: topEvidence ? topEvidence.source : 'สำนักงานราชบัณฑิตยสภา',
          edition: topEvidence ? topEvidence.edition : '2554',
        },
      };
    });

    const recommendations = aiResult.recommendations.map((item, idx) => {
      const topEvidence = item.evidence[0];
      const edYear = topEvidence?.edition ? parseInt(topEvidence.edition, 10) : 2554;
      return {
        id: `rec-${item.word}-${idx}`,
        headword: item.word,
        score: Number(Math.max(0.1, Math.min(1.0, item.score)).toFixed(2)),
        definition: topEvidence?.definition || item.reason,
        ai_explanation: item.reason,
        evidence: {
          source_book: topEvidence?.source || 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔',
          edition: `พ.ศ. ${topEvidence?.edition || '2554'}`,
          edition_year: isNaN(edYear) ? 2554 : edYear,
          quote: topEvidence?.definition || item.reason,
          is_official: true,
        },
        registers: ['ทางการ'],
        contexts: ['ทั่วไป'],
      };
    });

    return {
      query: rawQuery,
      intent: aiResult.intent || 'find_word_by_meaning',
      results: formattedResults,
      query_understanding: {
        raw_query: rawQuery,
        detected_meaning: rawQuery,
        context: aiResult.context || undefined,
        excluded_words: aiResult.excluded_terms || [],
      },
      recommendations,
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
