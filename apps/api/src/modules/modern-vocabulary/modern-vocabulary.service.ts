import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { QueryModernVocabularyDto, SuggestModernTermDto, ReviewSubmissionDto } from './dto/modern-vocabulary.dto';

@Injectable()
export class ModernVocabularyService {
  private readonly logger = new Logger(ModernVocabularyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List modern terms with optional multi-facet filtering and pagination
   */
  async listTerms(query: QueryModernVocabularyDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { isSearchable: true };

    if (query.category) {
      where.categories = {
        some: {
          category: { equals: query.category.trim().toUpperCase(), mode: 'insensitive' },
        },
      };
    }

    if (query.type) {
      where.termType = { equals: query.type.trim().toUpperCase() };
    }

    if (query.status) {
      where.status = { equals: query.status.trim().toUpperCase() };
    }

    if (query.register) {
      where.register = { equals: query.register.trim().toUpperCase() };
    }

    if (query.origin) {
      where.origin = { equals: query.origin.trim().toUpperCase() };
    }

    if (query.q) {
      const qClean = query.q.trim();
      where.OR = [
        { term: { contains: qClean, mode: 'insensitive' } },
        { normalizedTerm: { contains: qClean.toLowerCase(), mode: 'insensitive' } },
        { transliteration: { contains: qClean, mode: 'insensitive' } },
        { description: { contains: qClean, mode: 'insensitive' } },
        { englishMeaning: { contains: qClean, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.modernTerm.count({ where }),
      this.prisma.modernTerm.findMany({
        where,
        include: {
          categories: true,
          definitions: {
            take: 2,
            orderBy: { createdAt: 'asc' },
          },
          sources: {
            take: 2,
            orderBy: { createdAt: 'asc' },
          },
          examples: {
            take: 1,
          },
        },
        orderBy: [{ confidence: 'desc' }, { term: 'asc' }],
        skip,
        take: limit,
      }),
    ]);

    const formatted = items.map((item) => ({
      id: item.id,
      term: item.term,
      slug: item.slug,
      language: item.language,
      term_type: item.termType,
      status: item.status,
      origin: item.origin,
      register: item.register,
      audience: item.audience,
      confidence: Number(item.confidence),
      categories: item.categories.map((c) => c.category),
      primary_definition: item.definitions[0]?.definition || item.description || '',
      definition_type: item.definitions[0]?.definitionType || 'SOURCE_DEFINED',
      primary_source: item.sources[0]
        ? {
            type: item.sources[0].sourceType,
            name: item.sources[0].sourceName,
            verification_status: item.sources[0].verificationStatus,
          }
        : null,
      transliteration: item.transliteration,
      english_meaning: item.englishMeaning,
      pronunciation: item.pronunciation,
      usage_warning: item.usageWarning,
      has_official_record: Boolean(item.officialWordId),
    }));

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters: {
        category: query.category || null,
        type: query.type || null,
        status: query.status || null,
        register: query.register || null,
        origin: query.origin || null,
        q: query.q || null,
      },
      results: formatted,
    };
  }

  /**
   * Get full detail for a modern term including sources provenance, definitions, examples,
   * relationships, foreigner mode data, and official dictionary comparison if linked.
   */
  async getTermDetail(termOrSlug: string) {
    const clean = termOrSlug.trim();
    const normalized = clean.toLowerCase().replace(/[\s\-_.,'"?!()[\]{}:;]/g, '');

    const term = await this.prisma.modernTerm.findFirst({
      where: {
        OR: [
          { slug: clean },
          { slug: normalized },
          { term: clean },
          { normalizedTerm: normalized },
        ],
      },
      include: {
        categories: true,
        sources: {
          orderBy: { createdAt: 'asc' },
        },
        definitions: {
          orderBy: { createdAt: 'asc' },
        },
        examples: {
          orderBy: { createdAt: 'asc' },
        },
        relationshipsAsSource: {
          include: {
            targetModernTerm: {
              select: { term: true, slug: true, termType: true },
            },
          },
        },
        officialWord: {
          include: {
            entries: {
              include: {
                definitions: {
                  include: { pos: true },
                },
                edition: {
                  include: { source: true },
                },
              },
              orderBy: { edition: { editionYear: 'desc' } },
            },
          },
        },
      },
    });

    if (!term) {
      throw new NotFoundException(`ไม่พบข้อมูลคำศัพท์สมัยใหม่ "${termOrSlug}"`);
    }

    // Official dictionary timeline comparison
    let officialComparison = null;
    if (term.officialWord) {
      officialComparison = {
        word: term.officialWord.headword,
        found_in_official: true,
        relationship: 'BOTH', // Exists in both official dictionary and modern usage
        editions: term.officialWord.entries.map((entry) => ({
          edition_year: entry.edition?.editionYear,
          edition_title: entry.edition?.title,
          source: entry.edition?.source?.name || entry.edition?.title || 'พจนานุกรม ฉบับราชบัณฑิตยสถาน',
          definitions: entry.definitions.map((d) => ({
            text: d.definitionText,
            pos: d.pos ? d.pos.abbrThai : null,
          })),
        })),
        note: `คำว่า "${term.term}" มีปรากฏทั้งในพจนานุกรมทางการและมีการใช้งานในบริบทภาษาร่วมสมัย โดยความหมายอาจมีเฉดหรือบริบทที่ต่อยอด`,
      };
    } else {
      officialComparison = {
        word: term.term,
        found_in_official: false,
        relationship: 'MODERN_ONLY',
        editions: [
          { edition_year: '2542', status: 'ไม่พบข้อมูล' },
          { edition_year: '2554', status: 'ไม่พบข้อมูล' },
          { edition_year: '2569', status: 'ไม่พบข้อมูล' },
        ],
        note: `คำว่า "${term.term}" ไม่ปรากฏในพจนานุกรมฉบับทางการ แต่มีการใช้งานจริงในภาษาร่วมสมัยตามแหล่งอ้างอิงที่ระบุ`,
      };
    }

    // Build timeline from sources and seen dates
    const timeline = [];
    if (term.firstSeenAt) {
      timeline.push({
        year: term.firstSeenAt.getFullYear().toString(),
        milestone: 'เริ่มพบหลักฐานการใช้งานแรกสุด',
        evidence: `บันทึกการใช้งานตั้งแต่ ${term.firstSeenAt.toISOString().split('T')[0]}`,
      });
    }

    for (const src of term.sources) {
      if (src.sourceDate) {
        timeline.push({
          year: src.sourceDate.split('-')[0] || src.sourceDate,
          milestone: `ปรากฏใน ${src.sourceName}`,
          evidence: src.excerpt || `สืบค้นพบจากแหล่งอ้างอิง ${src.sourceType}`,
          source_url: src.sourceUrl,
        });
      }
    }

    if (term.lastSeenAt) {
      timeline.push({
        year: term.lastSeenAt.getFullYear().toString(),
        milestone: 'ยังคงพบการใช้งานในปัจจุบัน',
        evidence: `บันทึกการใช้งานล่าสุด ${term.lastSeenAt.toISOString().split('T')[0]}`,
      });
    }

    // Sort timeline chronologically
    timeline.sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));

    return {
      term: term.term,
      slug: term.slug,
      language: term.language,
      term_type: term.termType,
      status: term.status,
      origin: term.origin,
      register: term.register,
      audience: term.audience,
      description: term.description,
      confidence: Number(term.confidence),
      first_seen_at: term.firstSeenAt,
      last_seen_at: term.lastSeenAt,
      categories: term.categories.map((c) => c.category),
      definitions: term.definitions.map((d) => ({
        id: d.id,
        definition: d.definition,
        definition_type: d.definitionType,
        generated_by: d.generatedBy,
        verified: d.verified,
        label: d.definitionType === 'SOURCE_DEFINED'
          ? 'ความหมายจากแหล่งข้อมูล'
          : d.definitionType === 'AI_GENERATED'
          ? 'คำอธิบายโดย THAI CONTEXT AI'
          : d.definitionType === 'EDITOR_REVIEWED'
          ? 'ตรวจทานโดยบรรณาธิการ'
          : 'ความหมายจากชุมชนผู้ใช้งาน',
      })),
      sources: term.sources.map((s) => ({
        id: s.id,
        source_type: s.sourceType,
        source_name: s.sourceName,
        source_url: s.sourceUrl,
        source_date: s.sourceDate,
        excerpt: s.excerpt,
        license: s.license,
        verification_status: s.verificationStatus,
      })),
      examples: term.examples.map((ex) => ({
        id: ex.id,
        example_text: ex.exampleText,
        context_note: ex.contextNote,
        source_attribution: ex.sourceAttribution,
        register: ex.register || term.register,
      })),
      relationships: term.relationshipsAsSource.map((r) => ({
        target_term: r.targetTerm,
        target_slug: r.targetModernTerm?.slug || null,
        relationship_type: r.relationshipType,
        source_type: r.sourceType,
        confidence: Number(r.confidence),
        notes: r.notes,
      })),
      foreigner_support: {
        transliteration: term.transliteration,
        pronunciation: term.pronunciation,
        english_meaning: term.englishMeaning,
        usage_warning: term.usageWarning,
      },
      dictionary_evolution: officialComparison,
      timeline,
      data_provenance_summary: {
        source_count: term.sourceCount,
        has_verified_source: term.sources.some((s) => s.verificationStatus === 'VERIFIED'),
        primary_license: term.sources[0]?.license || 'CC-BY-SA 4.0',
      },
    };
  }

  /**
   * List all categories with counts
   */
  async getCategories() {
    const rawCategories = await this.prisma.modernTermCategory.groupBy({
      by: ['category'],
      _count: {
        modernTermId: true,
      },
      orderBy: {
        _count: {
          modernTermId: 'desc',
        },
      },
    });

    const categoryLabels: Record<string, string> = {
      AI: 'ปัญญาประดิษฐ์ (AI)',
      TECHNOLOGY: 'เทคโนโลยีและคอมพิวเตอร์',
      SOCIAL_MEDIA: 'โซเชียลมีเดีย',
      INTERNET: 'อินเทอร์เน็ตและเว็บ',
      BUSINESS: 'ธุรกิจและการตลาด',
      FINANCE: 'การเงินและการลงทุน',
      GAMING: 'เกมและอีสปอร์ต',
      POP_CULTURE: 'วัฒนธรรมป๊อปและบันเทิง',
      YOUTH: 'ศัพท์วัยรุ่นและสแลง',
      WORKPLACE: 'การทำงานและองค์กร',
      LIFESTYLE: 'การใช้ชีวิตและอาหาร',
      EDUCATION: 'การศึกษาและวิชาการ',
      SCIENCE: 'วิทยาศาสตร์',
      ENTERTAINMENT: 'ความบันเทิง',
    };

    return rawCategories.map((c) => ({
      category: c.category,
      label_thai: categoryLabels[c.category] || c.category,
      count: c._count.modernTermId,
    }));
  }

  /**
   * Search modern vocabulary with keyword and optional semantic query
   */
  async searchModern(q: string, category?: string, limit = 10) {
    const cleanQ = q.trim();
    if (!cleanQ) return [];

    const where: any = { isSearchable: true };
    if (category) {
      where.categories = {
        some: { category: { equals: category.toUpperCase() } },
      };
    }

    where.OR = [
      { term: { equals: cleanQ, mode: 'insensitive' } },
      { term: { contains: cleanQ, mode: 'insensitive' } },
      { normalizedTerm: { contains: cleanQ.toLowerCase(), mode: 'insensitive' } },
      { transliteration: { contains: cleanQ, mode: 'insensitive' } },
      { description: { contains: cleanQ, mode: 'insensitive' } },
      { englishMeaning: { contains: cleanQ, mode: 'insensitive' } },
      { definitions: { some: { definition: { contains: cleanQ, mode: 'insensitive' } } } },
    ];

    const results = await this.prisma.modernTerm.findMany({
      where,
      include: {
        categories: true,
        definitions: { take: 1 },
        sources: { take: 1 },
      },
      take: limit,
      orderBy: [{ confidence: 'desc' }],
    });

    return results.map((r) => ({
      type: 'MODERN',
      word: r.term,
      slug: r.slug,
      termType: r.termType,
      status: r.status,
      register: r.register,
      origin: r.origin,
      categories: r.categories.map((c) => c.category),
      definition: r.definitions[0]?.definition || r.description || '',
      source: r.sources[0]?.sourceName || 'คลังคำศัพท์สมัยใหม่',
      sourceType: r.sources[0]?.sourceType || 'DEMO',
      confidence: Number(r.confidence),
      is_official: false,
    }));
  }

  /**
   * Submit modern term contribution from users (always starts as PENDING_REVIEW)
   */
  async suggestTerm(dto: SuggestModernTermDto) {
    const cleanTerm = dto.term.trim();
    if (!cleanTerm) {
      throw new BadRequestException('กรุณาระบุคำศัพท์');
    }

    const submission = await this.prisma.modernTermSubmission.create({
      data: {
        term: cleanTerm,
        definition: dto.definition.trim(),
        context: dto.context?.trim() || null,
        example: dto.example?.trim() || null,
        category: dto.category?.trim().toUpperCase() || null,
        sourceName: dto.sourceName?.trim() || null,
        sourceUrl: dto.sourceUrl?.trim() || null,
        submitterName: dto.submitterName?.trim() || null,
        submitterEmail: dto.submitterEmail?.trim() || null,
        status: 'PENDING_REVIEW',
      },
    });

    return {
      success: true,
      message: 'ส่งคำศัพท์เข้าสู่ระบบเรียบร้อยแล้ว คำศัพท์จะเข้าสู่ขั้นตอนตรวจสอบหลักฐานก่อนเผยแพร่',
      submission_id: submission.id,
      status: submission.status,
      submitted_at: submission.createdAt,
    };
  }

  /**
   * Get overall insights & analytics for modern vocabulary layer
   */
  async getInsights() {
    const [totalTerms, categoryCounts, statusCounts, registerCounts, originCounts, sourceCounts] =
      await Promise.all([
        this.prisma.modernTerm.count(),
        this.prisma.modernTermCategory.groupBy({
          by: ['category'],
          _count: { modernTermId: true },
        }),
        this.prisma.modernTerm.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        this.prisma.modernTerm.groupBy({
          by: ['register'],
          _count: { id: true },
        }),
        this.prisma.modernTerm.groupBy({
          by: ['origin'],
          _count: { id: true },
        }),
        this.prisma.modernTermSource.groupBy({
          by: ['sourceType'],
          _count: { id: true },
        }),
      ]);

    return {
      total_terms: totalTerms,
      categories: categoryCounts.map((c) => ({ category: c.category, count: c._count.modernTermId })),
      statuses: statusCounts.map((s) => ({ status: s.status, count: s._count.id })),
      registers: registerCounts.map((r) => ({ register: r.register || 'NOT_SPECIFIED', count: r._count.id })),
      origins: originCounts.map((o) => ({ origin: o.origin, count: o._count.id })),
      source_types: sourceCounts.map((s) => ({ source_type: s.sourceType, count: s._count.id })),
      disclaimer: 'สถิติแสดงการกระจายตัวของคลังข้อมูลในระบบ มิได้แสดงความถี่การใช้งานจริงในประชากรทั้งหมด',
    };
  }

  /**
   * Compare modern term vs traditional term or alternative
   */
  async compareTerms(wordA: string, wordB: string) {
    const cleanA = wordA.trim();
    const cleanB = wordB.trim();

    // Check modern term database
    const [modernA, modernB, officialA, officialB] = await Promise.all([
      this.prisma.modernTerm.findFirst({
        where: { OR: [{ term: cleanA }, { slug: cleanA }] },
        include: { definitions: true, sources: true, examples: true },
      }),
      this.prisma.modernTerm.findFirst({
        where: { OR: [{ term: cleanB }, { slug: cleanB }] },
        include: { definitions: true, sources: true, examples: true },
      }),
      this.prisma.word.findFirst({
        where: { OR: [{ headword: cleanA }, { headwordClean: cleanA }] },
        include: {
          entries: {
            include: { definitions: { include: { pos: true } }, edition: true },
            orderBy: { edition: { editionYear: 'desc' } },
            take: 1,
          },
        },
      }),
      this.prisma.word.findFirst({
        where: { OR: [{ headword: cleanB }, { headwordClean: cleanB }] },
        include: {
          entries: {
            include: { definitions: { include: { pos: true } }, edition: true },
            orderBy: { edition: { editionYear: 'desc' } },
            take: 1,
          },
        },
      }),
    ]);

    const formatWordInfo = (modern: any, official: any, termName: string) => {
      if (modern) {
        return {
          word: modern.term,
          type: 'MODERN',
          term_type: modern.termType,
          status: modern.status,
          register: modern.register || 'INFORMAL',
          audience: modern.audience || 'GENERAL',
          origin: modern.origin,
          definition: modern.definitions[0]?.definition || modern.description || '',
          source: modern.sources[0]?.sourceName || 'คลังคำศัพท์ร่วมสมัย',
          is_official: false,
          example: modern.examples[0]?.exampleText || null,
        };
      }
      if (official) {
        const def = official.entries[0]?.definitions[0];
        return {
          word: official.headword,
          type: 'OFFICIAL',
          term_type: 'WORD',
          status: 'OFFICIAL_STANDARD',
          register: 'FORMAL',
          audience: 'GENERAL',
          origin: 'THAI',
          definition: def?.definitionText || '',
          source: official.entries[0]?.edition?.title || 'พจนานุกรม ฉบับราชบัณฑิตยสถาน',
          is_official: true,
          example: def?.examples?.[0]?.exampleText || null,
        };
      }
      return {
        word: termName,
        type: 'UNVERIFIED',
        term_type: 'WORD',
        status: 'UNKNOWN',
        register: 'NEUTRAL',
        audience: 'GENERAL',
        origin: 'UNKNOWN',
        definition: `คำว่า "${termName}" ไม่พบในคลังข้อมูลที่ระบบรองรับ`,
        source: 'ไม่มีข้อมูล',
        is_official: false,
        example: null,
      };
    };

    const infoA = formatWordInfo(modernA, officialA, cleanA);
    const infoB = formatWordInfo(modernB, officialB, cleanB);

    // Contextual usage guidance
    let guidance = '';
    if (infoA.type === 'MODERN' && infoB.type === 'OFFICIAL') {
      guidance = `ควรใช้ "${infoB.word}" เมื่อเขียนรายงานวิชาการ เอกสารราชการ หรือการสื่อสารทางการ — ในขณะที่ "${infoA.word}" เหมาะสำหรับการสื่อสารบนสื่อสังคมออนไลน์ การตลาด หรือบทสนทนาร่วมสมัย`;
    } else if (infoA.type === 'OFFICIAL' && infoB.type === 'MODERN') {
      guidance = `ควรใช้ "${infoA.word}" เมื่อเขียนรายงานวิชาการ เอกสารราชการ — ในขณะที่ "${infoB.word}" เหมาะสำหรับสื่อสังคมออนไลน์และการสื่อสารภาษาปาก`;
    } else {
      guidance = `พิจารณาเลือกใช้ตามระดับภาษาและกลุ่มเป้าหมายผู้รับสาร`;
    }

    return {
      wordA: infoA,
      wordB: infoB,
      guidance,
      context_comparison: {
        formality_contrast: `${infoA.word} (${infoA.register}) vs ${infoB.word} (${infoB.register})`,
        audience_contrast: `${infoA.audience} vs ${infoB.audience}`,
      },
    };
  }

  /**
   * Admin: Get pending submissions
   */
  async getPendingSubmissions() {
    return this.prisma.modernTermSubmission.findMany({
      where: { status: 'PENDING_REVIEW' },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Approve submission and promote to modern terms
   */
  async approveSubmission(id: string) {
    const sub = await this.prisma.modernTermSubmission.findUnique({
      where: { id },
    });
    if (!sub) throw new NotFoundException('ไม่พบรายการเสนอคำศัพท์นี้');

    const cleanTerm = sub.term.trim();
    const normalized = cleanTerm.toLowerCase().replace(/[\s\-_.,'"?!()[\]{}:;]/g, '');
    const slug = normalized.replace(/[^a-z0-9ก-๙]/g, '-');

    // Create Modern Term
    const modernTerm = await this.prisma.modernTerm.create({
      data: {
        term: cleanTerm,
        normalizedTerm: normalized,
        slug,
        status: 'COMMUNITY_TERM',
        termType: 'WORD',
        origin: 'COMMUNITY',
        register: 'INFORMAL',
        description: sub.definition,
        sources: {
          create: {
            sourceType: 'USER_SUBMITTED',
            sourceName: sub.sourceName || `การเสนอโดยผู้ใช้ (${sub.submitterName || 'ไม่ระบุนาม'})`,
            sourceUrl: sub.sourceUrl || null,
            verificationStatus: 'VERIFIED',
          },
        },
        definitions: {
          create: {
            definition: sub.definition,
            definitionType: 'COMMUNITY_DEFINED',
            verified: true,
          },
        },
        categories: sub.category
          ? {
              create: {
                category: sub.category.toUpperCase(),
              },
            }
          : undefined,
        examples: sub.example
          ? {
              create: {
                exampleText: sub.example,
                contextNote: sub.context || null,
              },
            }
          : undefined,
      },
    });

    await this.prisma.modernTermSubmission.update({
      where: { id },
      data: { status: 'APPROVED', reviewedAt: new Date() },
    });

    return {
      success: true,
      message: 'อนุมัติและเพิ่มคำศัพท์เข้าสู่ Modern Vocabulary Layer เรียบร้อยแล้ว',
      modern_term_id: modernTerm.id,
    };
  }

  /**
   * Admin: Reject submission
   */
  async rejectSubmission(id: string, dto?: ReviewSubmissionDto) {
    const sub = await this.prisma.modernTermSubmission.findUnique({
      where: { id },
    });
    if (!sub) throw new NotFoundException('ไม่พบรายการเสนอคำศัพท์นี้');

    await this.prisma.modernTermSubmission.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewNotes: dto?.reviewNotes || 'ข้อมูลไม่ผ่านเกณฑ์การตรวจสอบแหล่งอ้างอิง',
        reviewedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'ปฏิเสธรายการเสนอคำศัพท์เรียบร้อยแล้ว',
    };
  }
}
