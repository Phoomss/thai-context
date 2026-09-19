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

    const officialMapped = definitions.map((d) => {
      const rawDef = d.definitionText || '';
      const cleanDef = rawDef.replace(/^\[SAMPLE DEFINITION\s*—\s*\d+\]\s*/i, '').trim();
      return {
        type: 'OFFICIAL',
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
        metadata: {
          ...(typeof d.entry.metadata === 'object' && d.entry.metadata ? d.entry.metadata : {}),
          type: 'OFFICIAL',
          is_official: true,
        },
      };
    });

    // Query modern terms if not restricted to official edition or official source
    let modernMapped: any[] = [];
    if (!queryDto.edition && (!queryDto.source || queryDto.source === 'MODERN')) {
      try {
        const modernTerms = await this.prisma.modernTerm.findMany({
          where: {
            isSearchable: true,
            OR: isExact
              ? [
                  { term: { equals: q, mode: 'insensitive' } },
                  { normalizedTerm: { equals: q.toLowerCase(), mode: 'insensitive' } },
                ]
              : [
                  { term: { contains: q, mode: 'insensitive' } },
                  { normalizedTerm: { contains: q.toLowerCase(), mode: 'insensitive' } },
                  { transliteration: { contains: q, mode: 'insensitive' } },
                  { description: { contains: q, mode: 'insensitive' } },
                  { englishMeaning: { contains: q, mode: 'insensitive' } },
                  { definitions: { some: { definition: { contains: q, mode: 'insensitive' } } } },
                ],
          },
          include: {
            categories: true,
            definitions: { take: 1 },
            sources: { take: 1 },
          },
          take: take * 2,
        });

        modernMapped = modernTerms.map((m) => {
          const primaryDef = m.definitions[0]?.definition || m.description || '';
          const primarySource = m.sources[0]?.sourceName || 'คลังคำศัพท์สมัยใหม่ THAI CONTEXT';
          const primarySourceCode = m.sources[0]?.sourceType || 'DEMO';
          const cats = m.categories.map((c) => c.category);

          return {
            type: 'MODERN',
            word: m.term,
            headwordClean: m.normalizedTerm,
            definition: primaryDef,
            partOfSpeech: m.termType || 'คำศัพท์ร่วมสมัย',
            source: primarySource,
            sourceCode: primarySourceCode,
            edition: 'MODERN',
            editionTitle: 'คำศัพท์สมัยใหม่ (Modern Thai Vocabulary)',
            editionCode: 'MODERN_VOCABULARY',
            subjectDomain: cats[0] || 'เทคโนโลยี/ร่วมสมัย',
            pageNumber: null,
            metadata: {
              type: 'MODERN',
              termType: m.termType,
              status: m.status,
              register: m.register,
              origin: m.origin,
              audience: m.audience,
              categories: cats,
              confidence: Number(m.confidence),
              verificationStatus: m.sources[0]?.verificationStatus || 'UNVERIFIED',
              sourceType: primarySourceCode,
              slug: m.slug,
              transliteration: m.transliteration,
              englishMeaning: m.englishMeaning,
              pronunciation: m.pronunciation,
              usageWarning: m.usageWarning,
              is_official: false,
            },
          };
        });
      } catch (err: any) {
        this.logger.warn(`Failed to query modern terms in keywordSearch: ${err.message}`);
      }
    }

    const combined = [...officialMapped, ...modernMapped];

    // Re-rank results: Exact headword match > startsWith > contains in headword > definition text
    const qLower = q.toLowerCase();
    combined.sort((a, b) => {
      const aHead = a.word.toLowerCase();
      const bHead = b.word.toLowerCase();

      const aRank = aHead === qLower ? 4 : aHead.startsWith(qLower) ? 3 : aHead.includes(qLower) ? 2 : 1;
      const bRank = bHead === qLower ? 4 : bHead.startsWith(qLower) ? 3 : bHead.includes(qLower) ? 2 : 1;

      if (aRank !== bRank) return bRank - aRank;

      // Secondary sort: modern or latest edition year
      const aYear = parseInt(a.edition, 10) || (a.type === 'MODERN' ? 2026 : 0);
      const bYear = parseInt(b.edition, 10) || (b.type === 'MODERN' ? 2026 : 0);
      return bYear - aYear;
    });

    const paginatedResults = combined.slice(0, take);

    return {
      query: q,
      total: combined.length,
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
    let aiResult: any = { intent: 'find_word_by_meaning', recommendations: [] };
    try {
      aiResult = await this.aiService.getRecommendations(rawQuery);
    } catch {
      this.logger.warn('AI recommendation unavailable, using direct semantic matching');
    }

    // 2. Also search modern terms for semantic/keyword matches on the raw query
    let modernMatches: any[] = [];
    try {
      const modernTerms = await this.prisma.modernTerm.findMany({
        where: {
          isSearchable: true,
          OR: [
            { term: { contains: rawQuery, mode: 'insensitive' } },
            { normalizedTerm: { contains: rawQuery.toLowerCase(), mode: 'insensitive' } },
            { description: { contains: rawQuery, mode: 'insensitive' } },
            { englishMeaning: { contains: rawQuery, mode: 'insensitive' } },
            { definitions: { some: { definition: { contains: rawQuery, mode: 'insensitive' } } } },
          ],
        },
        include: {
          categories: true,
          definitions: { take: 1 },
          sources: { take: 1 },
        },
        take: 3,
      });

      modernMatches = modernTerms.map((m) => {
        const topDef = m.definitions[0]?.definition || m.description || '';
        const topSrc = m.sources[0];
        return {
          word: m.term,
          score: 0.95,
          reason: `ตรงกับความหมายในภาษาร่วมสมัย (${m.termType || 'คำศัพท์สมัยใหม่'}) หมวด ${m.categories.map((c) => c.category).join(', ')}`,
          type: 'MODERN',
          evidence: [
            {
              source: topSrc?.sourceName || 'ศูนย์สำรวจภาษาร่วมสมัย THAI CONTEXT',
              edition: 'ร่วมสมัย',
              definition: topDef,
              relevance: 0.95,
              source_type: topSrc?.sourceType || 'DEMO',
              verification_status: topSrc?.verificationStatus || 'UNVERIFIED',
              is_official: false,
            },
          ],
          categories: m.categories.map((c) => c.category),
          register: m.register,
          origin: m.origin,
          slug: m.slug,
        };
      });
    } catch {
      // Fall through
    }

    const aiRecs = aiResult?.recommendations || [];
    const existingWords = new Set(aiRecs.map((r: any) => r.word));
    const mergedRecs = [...aiRecs];

    for (const mm of modernMatches) {
      if (!existingWords.has(mm.word)) {
        existingWords.add(mm.word);
        mergedRecs.unshift(mm); // Prioritize direct modern match
      }
    }

    const formattedResults = mergedRecs.map((item) => {
      const topEvidence = item.evidence?.[0];
      const isModern = item.type === 'MODERN' || topEvidence?.is_official === false;
      return {
        type: isModern ? 'MODERN' : 'OFFICIAL',
        word: item.word,
        score: item.score,
        reason: item.reason,
        definition: topEvidence ? topEvidence.definition : item.reason,
        source: {
          name: topEvidence ? topEvidence.source : 'สำนักงานราชบัณฑิตยสภา',
          edition: topEvidence ? topEvidence.edition : '2554',
          is_official: !isModern,
        },
        categories: item.categories || undefined,
        register: item.register || undefined,
      };
    });

    const recommendations = mergedRecs.map((item, idx) => {
      const topEvidence = item.evidence?.[0];
      const isModern = item.type === 'MODERN' || topEvidence?.is_official === false;
      const edYear = topEvidence?.edition ? parseInt(topEvidence.edition, 10) : 2554;
      return {
        id: `rec-${item.word}-${idx}`,
        type: isModern ? 'MODERN' : 'OFFICIAL',
        headword: item.word,
        score: Number(Math.max(0.1, Math.min(1.0, item.score)).toFixed(2)),
        definition: topEvidence?.definition || item.reason,
        ai_explanation: item.reason,
        evidence: {
          source_book: topEvidence?.source || (isModern ? 'คลังคำศัพท์สมัยใหม่' : 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔'),
          edition: isModern ? 'ภาษาร่วมสมัย' : `พ.ศ. ${topEvidence?.edition || '2554'}`,
          edition_year: isModern ? 2026 : isNaN(edYear) ? 2554 : edYear,
          quote: topEvidence?.definition || item.reason,
          is_official: !isModern,
          source_type: topEvidence?.source_type || (isModern ? 'DEMO' : 'OFFICIAL'),
        },
        registers: [item.register || (isModern ? 'ไม่เป็นทางการ/ร่วมสมัย' : 'ทางการ')],
        contexts: item.categories || ['ทั่วไป'],
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
