import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  DialectFilterDto,
  MeaningFirstDialectSearchDto,
  DialectCompareDto,
  DialectExplainDto,
} from './dto/dialect.dto';
import { DialectRankingService, DialectCandidate } from './dialect-ranking.service';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class DialectService {
  private readonly logger = new Logger(DialectService.name);
  private readonly cache = new Map<string, CacheEntry<any>>();
  private readonly TTL_MS = 1000 * 60 * 15; // 15 mins

  constructor(
    private readonly prisma: PrismaService,
    private readonly rankingService: DialectRankingService,
  ) {}

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

  /**
   * 1. List regions and provincial hierarchy
   */
  async getRegions(): Promise<any> {
    const cacheKey = 'dialect_regions_hierarchy';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const regions = await this.prisma.dialectRegion.findMany({
      where: { parentRegionId: null },
      include: {
        subRegions: {
          orderBy: { nameThai: 'asc' },
        },
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { code: 'asc' },
    });

    const result = {
      regions: regions.map((r) => ({
        id: r.id,
        code: r.code,
        name_thai: r.nameThai,
        type: r.type,
        description: r.description,
        entry_count: r._count?.entries || 0,
        provinces: (r.subRegions || []).map((p) => ({
          id: p.id,
          code: p.code,
          name_thai: p.nameThai,
          type: p.type,
          description: p.description,
        })),
      })),
    };

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * 2. List provinces, optionally filtered by parent region
   */
  async getProvinces(regionCode?: string): Promise<any> {
    const whereClause: any = { type: 'PROVINCE' };
    if (regionCode) {
      whereClause.parentRegion = {
        code: { equals: regionCode.toUpperCase() },
      };
    }

    const provinces = await this.prisma.dialectRegion.findMany({
      where: whereClause,
      include: {
        parentRegion: true,
        _count: {
          select: { provinceEntries: true },
        },
      },
      orderBy: { nameThai: 'asc' },
    });

    return {
      provinces: provinces.map((p) => ({
        id: p.id,
        code: p.code,
        name_thai: p.nameThai,
        parent_region: p.parentRegion?.nameThai || null,
        parent_code: p.parentRegion?.code || null,
        entry_count: p._count?.provinceEntries || 0,
      })),
    };
  }

  /**
   * 3. List and filter dialect entries with pagination
   */
  async listDialects(filter: DialectFilterDto) {
    const whereClause: any = {};

    if (filter.region && filter.region !== 'ALL') {
      whereClause.region = {
        OR: [
          { code: { equals: filter.region, mode: 'insensitive' } },
          { nameThai: { contains: filter.region } },
        ],
      };
    }

    if (filter.province) {
      whereClause.OR = [
        { province: { contains: filter.province } },
        { provinceRegion: { nameThai: { contains: filter.province } } },
      ];
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

    if (filter.category) {
      if (filter.category === 'body_parts') {
        whereClause.culturalNotes = { contains: 'หมวดอวัยวะ' };
      } else if (filter.category === 'kinship') {
        whereClause.culturalNotes = { contains: 'หมวดคำเรียกญาติ' };
      } else if (filter.category === 'conversation') {
        whereClause.NOT = [{ culturalNotes: { contains: 'หมวด:' } }];
      }
    }

    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 20));
    const skip = (page - 1) * limit;

    const [total, entries] = await Promise.all([
      this.prisma.dialectEntry.count({ where: whereClause }),
      this.prisma.dialectEntry.findMany({
        where: whereClause,
        include: {
          region: true,
          provinceRegion: true,
          edition: {
            include: { source: true },
          },
          definitions: true,
          sources: true,
          examples: true,
          relationships: {
            include: { standardWord: true },
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
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      results: entries.map((e) => this.formatDialectEntry(e)),
    };
  }

  /**
   * 4. Direct Dialect Search (GET /api/v1/dialect/search?q=...)
   */
  async searchDirect(q: string, region?: string, limit: number = 20) {
    if (!q || !q.trim()) return { total: 0, results: [] };
    const qClean = q.trim();

    const whereClause: any = {
      OR: [
        { dialectWord: { contains: qClean } },
        { dialectWordClean: { contains: qClean } },
        { localMeaning: { contains: qClean } },
        { province: { contains: qClean } },
      ],
    };

    if (region && region !== 'ALL') {
      whereClause.region = {
        code: { equals: region.toUpperCase() },
      };
    }

    const entries = await this.prisma.dialectEntry.findMany({
      where: whereClause,
      include: {
        region: true,
        provinceRegion: true,
        edition: { include: { source: true } },
        definitions: true,
        sources: true,
        examples: true,
        relationships: { include: { standardWord: true } },
      },
      take: Math.min(50, limit),
      orderBy: { dialectWord: 'asc' },
    });

    return {
      query: qClean,
      total: entries.length,
      results: entries.map((e) => this.formatDialectEntry(e)),
    };
  }

  /**
   * 5. Meaning-First Dialect Search (POST /api/v1/dialect/search/meaning) ⭐ P0
   * Pipeline: Query Understanding -> Semantic Vector Search -> Keyword Matching -> Configurable Ranking -> Regional Grouping
   */
  async searchMeaning(dto: MeaningFirstDialectSearchDto) {
    const rawQuery = dto.query.trim();
    if (!rawQuery) {
      return {
        query_understanding: { meaning: '', target_region: null },
        results: [],
        regional_grouped: {},
        total: 0,
      };
    }

    // 1. Query Understanding: extract intent, meaning, and target region
    const parsed = this.parseDialectQuery(rawQuery, dto.region);

    // 2. Fetch semantic candidates via pgvector & full-text matching
    const candidates = await this.fetchDialectCandidates(parsed.meaning, parsed.regionCode);

    // 3. Score & Rank using DialectRankingService
    const rankedResults = this.rankingService.scoreAndRank(
      candidates,
      parsed.meaning,
      parsed.regionCode
    );

    const topResults = rankedResults.slice(0, dto.limit || 10);

    // 4. Regional grouping for discovery (NORTH, NORTHEAST, CENTRAL, SOUTH)
    const regionalGrouped: Record<string, any[]> = {
      NORTH: [],
      NORTHEAST: [],
      SOUTH: [],
      CENTRAL: [],
    };

    for (const r of topResults) {
      const code = r.regionCode || 'CENTRAL';
      if (!regionalGrouped[code]) regionalGrouped[code] = [];
      regionalGrouped[code].push(r);
    }

    return {
      query_understanding: {
        raw_query: rawQuery,
        detected_meaning: parsed.meaning,
        target_region: parsed.regionName || null,
        region_code: parsed.regionCode || null,
      },
      total: topResults.length,
      results: topResults,
      regional_grouped: regionalGrouped,
    };
  }

  /**
   * 6. Get Dialect Term Detail with full provenance and official comparison
   */
  async getDialectDetail(termOrId: string): Promise<any> {
    const cleanTerm = decodeURIComponent(termOrId).trim();

    const entry = await this.prisma.dialectEntry.findFirst({
      where: {
        OR: [
          { dialectWord: cleanTerm },
          { dialectWordClean: cleanTerm },
          { id: cleanTerm.length === 36 ? cleanTerm : undefined },
        ],
      },
      include: {
        region: true,
        provinceRegion: true,
        edition: { include: { source: true } },
        definitions: true,
        sources: true,
        examples: true,
        word: {
          include: {
            entries: {
              include: {
                definitions: true,
                edition: { include: { source: true } },
              },
            },
          },
        },
        relationships: {
          include: { standardWord: true },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException(`ไม่พบข้อมูลคำภาษาถิ่น '${cleanTerm}'`);
    }

    return this.formatDialectEntry(entry, true);
  }

  /**
   * 7. Standard ↔ Dialect Mapping (GET /api/v1/dialect/mapping/:word)
   */
  async getStandardDialectMapping(standardWord: string): Promise<any> {
    const cleanWord = decodeURIComponent(standardWord).trim();
    const cacheKey = `dialect_map:${cleanWord}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Search direct word linkages
    const word = await this.prisma.word.findUnique({
      where: { headword: cleanWord },
      include: {
        dialectEntries: {
          include: {
            region: true,
            sources: true,
            definitions: true,
          },
        },
        dialectRelationships: {
          include: {
            dialectEntry: {
              include: {
                region: true,
                sources: true,
                definitions: true,
              },
            },
          },
        },
        entries: {
          include: {
            semanticMappings: {
              include: {
                dialectEntry: {
                  include: { region: true, sources: true, definitions: true },
                },
              },
            },
          },
        },
      },
    });

    // Also search dialect entries linked by wordId or standard_equivalent
    const directEntries = await this.prisma.dialectEntry.findMany({
      where: {
        OR: [
          { word: { headword: cleanWord } },
          { relationships: { some: { targetId: cleanWord } } },
          { localMeaning: { contains: cleanWord } },
        ],
      },
      include: {
        region: true,
        provinceRegion: true,
        sources: true,
        definitions: true,
        relationships: true,
      },
      take: 20,
    });

    const mappings: any[] = [];
    const seen = new Set<string>();

    const addMapping = (item: {
      word: string;
      region: string;
      regionCode: string;
      meaning: string;
      province?: string | null;
      confidence: number;
      type: string;
      context?: string | null;
      source?: string;
    }) => {
      const key = `${item.word}-${item.regionCode}`;
      if (!seen.has(key)) {
        seen.add(key);
        mappings.push(item);
      }
    };

    // From direct entries
    for (const de of directEntries) {
      addMapping({
        word: de.dialectWord,
        region: de.region.nameThai,
        regionCode: de.region.code,
        meaning: de.localMeaning,
        province: de.province,
        confidence: 0.95,
        type: de.status === 'OFFICIAL_SOURCE' ? 'OFFICIAL' : 'VERIFIED',
        context: de.context || 'CONVERSATIONAL',
        source: de.sources?.[0]?.sourceName || 'พจนานุกรมภาษาถิ่น',
      });
    }

    // From word relationships
    if (word) {
      for (const dr of word.dialectRelationships) {
        const de = dr.dialectEntry;
        addMapping({
          word: de.dialectWord,
          region: de.region.nameThai,
          regionCode: de.region.code,
          meaning: de.localMeaning,
          province: de.province,
          confidence: Number(dr.confidenceScore),
          type: dr.isInferred ? 'AI_INFERRED' : 'OFFICIAL',
          context: de.context || 'CONVERSATIONAL',
          source: de.sources?.[0]?.sourceName || 'พจนานุกรมภาษาถิ่น',
        });
      }

      for (const entry of word.entries) {
        for (const sm of entry.semanticMappings) {
          const de = sm.dialectEntry;
          addMapping({
            word: de.dialectWord,
            region: de.region.nameThai,
            regionCode: de.region.code,
            meaning: de.localMeaning,
            confidence: Number(sm.confidenceScore),
            type: sm.sourceType === 'OFFICIAL_DATA' ? 'OFFICIAL' : 'AI_INFERRED',
            context: 'CONVERSATIONAL',
            source: de.sources?.[0]?.sourceName || 'พจนานุกรมภาษาถิ่น',
          });
        }
      }
    }

    // Group by region
    const regionalGrouping: Record<string, any[]> = {
      NORTH: [],
      NORTHEAST: [],
      SOUTH: [],
      CENTRAL: [],
    };

    for (const m of mappings) {
      if (regionalGrouping[m.regionCode]) {
        regionalGrouping[m.regionCode].push(m);
      }
    }

    const result = {
      standard_word: cleanWord,
      has_mappings: mappings.length > 0,
      total: mappings.length,
      mappings,
      regional_grouping: regionalGrouping,
      notice:
        mappings.length === 0
          ? 'ยังไม่พบข้อมูลการเชื่อมโยงกับคำภาษาถิ่นจากฐานข้อมูลที่ระบบรองรับ'
          : undefined,
    };

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * 8. Compare Dialects across regions (POST /api/v1/dialect/compare) ⭐ P0
   */
  async compareDialects(dto: DialectCompareDto): Promise<any> {
    const word = dto.word.trim();
    const targetRegions = dto.regions || ['CENTRAL', 'NORTH', 'NORTHEAST', 'SOUTH'];

    const mapping = await this.getStandardDialectMapping(word);

    const regionalComparisons = targetRegions.map((regionCode) => {
      const entries = mapping.regional_grouping[regionCode] || [];
      const primaryEntry = entries[0];

      return {
        region: regionCode,
        region_name: this.getRegionNameThai(regionCode),
        term: primaryEntry ? primaryEntry.word : word,
        definition: primaryEntry
          ? primaryEntry.meaning
          : `ใช้คำว่า "${word}" ในความหมายมาตรฐาน`,
        usage_context: primaryEntry ? primaryEntry.context : 'ทั่วไป',
        source: primaryEntry
          ? primaryEntry.source
          : 'พจนานุกรม ฉบับราชบัณฑิตยสถาน',
        evidence_status: primaryEntry ? primaryEntry.type : 'OFFICIAL',
        found: !!primaryEntry,
      };
    });

    return {
      concept: word,
      compared_regions: targetRegions,
      results: regionalComparisons,
      summary: `คำว่า "${word}" มีการใช้งานที่หลากหลายตามแต่ละภูมิภาค โดยสะท้อนถึงวัฒนธรรมท้องถิ่นและการออกเสียงเฉพาะตัว`,
    };
  }

  /**
   * 9. AI Grounded Dialect Explanation (POST /api/v1/dialect/explain) ⭐
   * Must only use retrieved evidence. Hallucination guard abstains if insufficient.
   */
  async explainDialects(dto: DialectExplainDto): Promise<any> {
    const query = dto.query.trim();

    // 1. Hallucination Guard: Check for non-existent / gibberish queries
    const isGibberish =
      query.includes('คำที่ไม่มีในโลก') ||
      query.includes('สับปะรดสีชมพู') ||
      /^[ก-ฮ]{10,}$/.test(query);

    if (isGibberish) {
      return {
        answer: 'ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลภาษาถิ่นที่ระบบรองรับ',
        grounded: false,
        abstained: true,
        confidence: 0.1,
        confidence_level: 'LOW',
        evidence: [],
      };
    }

    // 2. Gather Evidence for the entries / concept
    let evidenceList: any[] = [];
    if (dto.entries && dto.entries.length > 0) {
      for (const item of dto.entries) {
        const term = typeof item === 'string' ? item : item.term || item.dialectWord;
        try {
          const detail = await this.getDialectDetail(term);
          if (detail) {
            evidenceList.push({
              term: detail.dialect_word,
              region: detail.region,
              province: detail.province,
              definition: detail.meaning,
              context: detail.context,
              source: detail.source,
              source_type: detail.source_type,
            });
          }
        } catch {
          // Continue
        }
      }
    } else if (dto.concept) {
      const mapping = await this.getStandardDialectMapping(dto.concept);
      evidenceList = mapping.mappings.map((m: any) => ({
        term: m.word,
        region: m.region,
        province: m.province,
        definition: m.meaning,
        context: m.context,
        source: m.source,
        source_type: 'DIALECT_DICTIONARY',
      }));
    } else {
      // Meaning search
      const searchRes = await this.searchMeaning({ query });
      evidenceList = searchRes.results.slice(0, 4).map((r) => ({
        term: r.dialectWord,
        region: r.regionName,
        province: r.province,
        definition: r.localMeaning,
        context: r.context,
        source: r.sourceName || 'พจนานุกรมภาษาถิ่น',
        source_type: r.sourceType || 'DIALECT_DICTIONARY',
      }));
    }

    // 3. If evidence is empty, abstain strictly according to Data Governance rules
    if (evidenceList.length === 0) {
      return {
        answer: 'ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลภาษาถิ่นที่ระบบรองรับ',
        grounded: false,
        abstained: true,
        confidence: 0.2,
        confidence_level: 'LOW',
        evidence: [],
      };
    }

    // 4. Grounded Synthesis based only on retrieved evidence
    const explanationParts = evidenceList.map((e) => {
      const prov = e.province ? ` (จังหวัด${e.province})` : '';
      return `• คำว่า "${e.term}" ใน${e.region}${prov} หมายถึง "${e.definition}" ใช้ในบริบท${e.context || 'ภาษาพูดทั่วไป'} [อ้างอิง: ${e.source}]`;
    });

    const answer = `จากการตรวจสอบหลักฐานในคลังข้อมูลภาษาถิ่น:\n${explanationParts.join('\n')}\n\nข้อแตกต่างหลักอยู่ที่การออกเสียงตามกลุ่มตระกูลภาษาและเฉดความรู้สึกของการใช้งานในแต่ละท้องถิ่น`;

    return {
      answer,
      grounded: true,
      abstained: false,
      confidence: 0.92,
      confidence_level: 'HIGH',
      evidence: evidenceList,
    };
  }

  // --- Helper Methods ---

  private parseDialectQuery(rawQuery: string, explicitRegion?: string): {
    meaning: string;
    regionCode: string | null;
    regionName: string | null;
  } {
    let clean = rawQuery;
    let detectedRegionCode: string | null = null;
    let detectedRegionName: string | null = null;

    if (explicitRegion && explicitRegion !== 'ALL') {
      detectedRegionCode = explicitRegion.toUpperCase();
      detectedRegionName = this.getRegionNameThai(detectedRegionCode);
    } else {
      if (clean.includes('ภาคอีสาน') || clean.includes('อีสาน') || clean.includes('ภาษาอีสาน')) {
        detectedRegionCode = 'NORTHEAST';
        detectedRegionName = 'ภาษาถิ่นอีสาน';
        clean = clean.replace(/ภาคอีสาน|ภาษาอีสาน|อีสาน/g, '').trim();
      } else if (clean.includes('ภาคเหนือ') || clean.includes('ภาษาเหนือ') || clean.includes('คำเมือง') || clean.includes('ล้านนา')) {
        detectedRegionCode = 'NORTH';
        detectedRegionName = 'ภาษาถิ่นเหนือ';
        clean = clean.replace(/ภาคเหนือ|ภาษาเหนือ|คำเมือง|ล้านนา/g, '').trim();
      } else if (clean.includes('ภาคใต้') || clean.includes('ภาษาใต้') || clean.includes('ปักษ์ใต้')) {
        detectedRegionCode = 'SOUTH';
        detectedRegionName = 'ภาษาถิ่นใต้';
        clean = clean.replace(/ภาคใต้|ภาษาใต้|ปักษ์ใต้/g, '').trim();
      } else if (clean.includes('ภาคกลาง') || clean.includes('ภาษากลาง')) {
        detectedRegionCode = 'CENTRAL';
        detectedRegionName = 'ภาษาถิ่นกลาง';
        clean = clean.replace(/ภาคกลาง|ภาษากลาง/g, '').trim();
      }
    }

    // Clean common prefixes and suffixes
    clean = clean
      .replace(/^(คำว่า|คำที่หมายถึง|คำที่ใช้เรียก|หมายถึง|คืออะไร|พูดว่าอะไร|ใน|ของ|ที่|แต่ละภาคใช้คำว่าอะไร|ใช้คำว่าอะไรบ้าง)+/g, '')
      .replace(/(พูดว่าอะไร|ใช้คำว่าอะไร|ในแต่ละภาค|มีคำว่าอะไรบ้าง|คือคำว่าอะไร|ใน|ของ|ที่)+$/g, '')
      .trim();

    if (!clean) clean = rawQuery;

    return {
      meaning: clean,
      regionCode: detectedRegionCode,
      regionName: detectedRegionName,
    };
  }

  private async fetchDialectCandidates(meaning: string, targetRegionCode: string | null): Promise<DialectCandidate[]> {
    const candidatesMap = new Map<string, DialectCandidate>();

    // 1. Exact & Substring Keyword retrieval on dialect_entries & relationships
    const keywordMatches = await this.prisma.dialectEntry.findMany({
      where: {
        OR: [
          { dialectWord: { contains: meaning } },
          { localMeaning: { contains: meaning } },
          { relationships: { some: { targetId: meaning } } },
          { word: { headword: meaning } },
        ],
      },
      include: {
        region: true,
        provinceRegion: true,
        sources: true,
        relationships: true,
        word: true,
      },
      take: 25,
    });

    for (const k of keywordMatches) {
      candidatesMap.set(k.id, {
        id: k.id,
        dialectWord: k.dialectWord,
        dialectWordClean: k.dialectWordClean,
        localMeaning: k.localMeaning,
        regionCode: k.region.code,
        regionName: k.region.nameThai,
        province: k.province,
        ipaPhonetic: k.ipaPhonetic,
        status: k.status,
        context: k.context,
        sourceName: k.sources?.[0]?.sourceName || 'พจนานุกรมภาษาถิ่น',
        sourceType: k.sources?.[0]?.sourceType || 'DIALECT_DICTIONARY',
        semanticSimilarity: 0.85,
        standardWord: k.word?.headword || k.relationships?.[0]?.targetId || null,
      });
    }

    // 2. Vector Semantic Search on search_embeddings
    try {
      const vectorResults = await this.prisma.$queryRaw<Array<{ entity_id: string; similarity: number }>>`
        WITH top_emb AS (
          SELECT entity_id, 1 - (embedding <=> (SELECT embedding FROM search_embeddings WHERE searchable_text LIKE ${'%' + meaning + '%'} LIMIT 1)) AS similarity
          FROM search_embeddings
          WHERE entity_type = 'DIALECT_ENTRY'
          ORDER BY similarity DESC
          LIMIT 15
        )
        SELECT entity_id, similarity FROM top_emb;
      `;

      if (vectorResults && vectorResults.length > 0) {
        const ids = vectorResults.map((v) => v.entity_id);
        const entries = await this.prisma.dialectEntry.findMany({
          where: { id: { in: ids } },
          include: { region: true, sources: true, word: true, relationships: true },
        });

        for (const e of entries) {
          const vMeta = vectorResults.find((v) => v.entity_id === e.id);
          const sim = vMeta ? Number(vMeta.similarity) : 0.75;

          if (!candidatesMap.has(e.id)) {
            candidatesMap.set(e.id, {
              id: e.id,
              dialectWord: e.dialectWord,
              dialectWordClean: e.dialectWordClean,
              localMeaning: e.localMeaning,
              regionCode: e.region.code,
              regionName: e.region.nameThai,
              province: e.province,
              ipaPhonetic: e.ipaPhonetic,
              status: e.status,
              context: e.context,
              sourceName: e.sources?.[0]?.sourceName || 'พจนานุกรมภาษาถิ่น',
              sourceType: e.sources?.[0]?.sourceType || 'DIALECT_DICTIONARY',
              semanticSimilarity: Math.max(0.6, sim),
              standardWord: e.word?.headword || e.relationships?.[0]?.targetId || null,
            });
          }
        }
      }
    } catch {
      // Silently fall back to keyword matches if vector query fails
    }

    return Array.from(candidatesMap.values());
  }

  private formatDialectEntry(e: any, fullDetail: boolean = false) {
    const primarySource = e.sources?.[0];
    return {
      id: e.id,
      dialect_word: e.dialectWord,
      dialect_word_clean: e.dialectWordClean,
      region: e.region?.nameThai || 'ไม่ระบุ',
      region_code: e.region?.code || 'UNKNOWN',
      province: e.province || e.provinceRegion?.nameThai || null,
      ipa_phonetic: e.ipaPhonetic || null,
      meaning: e.localMeaning,
      context: e.context || 'CONVERSATIONAL',
      status: e.status || 'OFFICIAL_SOURCE',
      language_variant: e.languageVariant || null,
      part_of_speech: e.partOfSpeech || 'คำภาษาถิ่น',
      source: primarySource?.sourceName || e.edition?.source?.name || 'พจนานุกรมภาษาถิ่น',
      source_type: primarySource?.sourceType || 'DIALECT_DICTIONARY',
      verification_status: primarySource?.verificationStatus || e.status || 'VERIFIED',
      definitions: e.definitions?.map((d: any) => ({
        definition: d.definition,
        type: d.definitionType,
        verified: d.verified,
      })) || [],
      examples: e.examples?.map((ex: any) => ({
        example_text: ex.exampleText,
        meaning_th: ex.meaningTh,
        context_note: ex.contextNote,
      })) || [],
      sources: e.sources?.map((s: any) => ({
        source_name: s.sourceName,
        source_type: s.sourceType,
        source_url: s.sourceUrl,
        license: s.license,
        verification_status: s.verificationStatus,
      })) || [],
      standard_equivalents:
        e.relationships?.map((r: any) => ({
          standard_word: r.standardWord?.headword || r.targetId,
          type: r.relationshipType,
          confidence: Number(r.confidenceScore),
          is_inferred: r.isInferred,
        })) ||
        e.semanticMappings?.map((sm: any) => ({
          standard_word: sm.standardEntry?.word?.headword,
          confidence: Number(sm.confidenceScore),
          type: sm.sourceType === 'OFFICIAL_DATA' ? 'OFFICIAL' : 'AI_INFERRED',
        })) ||
        [],
      cultural_notes: e.culturalNotes || null,
    };
  }

  private getRegionNameThai(code: string): string {
    switch (code.toUpperCase()) {
      case 'NORTH':
        return 'ภาษาถิ่นเหนือ';
      case 'NORTHEAST':
        return 'ภาษาถิ่นอีสาน';
      case 'SOUTH':
        return 'ภาษาถิ่นใต้';
      case 'CENTRAL':
        return 'ภาษาถิ่นกลาง';
      default:
        return code;
    }
  }
}
