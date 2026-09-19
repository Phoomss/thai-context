import { Test, TestingModule } from '@nestjs/testing';
import { DialectService } from './dialect.service';
import { DialectRankingService } from './dialect-ranking.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('DialectService & DialectRankingService', () => {
  let dialectService: DialectService;
  let rankingService: DialectRankingService;
  let prisma: any;

  const mockRegionNorth = {
    id: 'reg-north',
    code: 'NORTH',
    nameThai: 'ภาคเหนือ',
    nameEng: 'Northern Thailand',
    type: 'REGION',
    parentRegionId: null,
  };

  const mockRegionNortheast = {
    id: 'reg-isan',
    code: 'NORTHEAST',
    nameThai: 'ภาคอีสาน',
    nameEng: 'Northeastern Thailand',
    type: 'REGION',
    parentRegionId: null,
  };

  const mockRegionSouth = {
    id: 'reg-south',
    code: 'SOUTH',
    nameThai: 'ภาคใต้',
    nameEng: 'Southern Thailand',
    type: 'REGION',
    parentRegionId: null,
  };

  const mockRegionCentral = {
    id: 'reg-central',
    code: 'CENTRAL',
    nameThai: 'ภาคกลาง',
    nameEng: 'Central Thailand',
    type: 'REGION',
    parentRegionId: null,
  };

  const mockDialectEntryKinNorth = {
    id: 'de-kin-north',
    dialectWord: 'กิ๋น',
    dialectWordClean: 'กิ๋น',
    localMeaning: 'รับประทานอาหาร เคี้ยวกลืนอาหาร',
    regionId: 'reg-north',
    province: 'เชียงใหม่',
    languageVariant: 'คำเมือง / ล้านนา',
    partOfSpeech: 'กริยา',
    ipaPhonetic: 'kin˥˩',
    context: 'ใช้ในชีวิตประจำวัน สุภาพ สนทนาทั่วไป',
    status: 'OFFICIAL_SOURCE',
    region: mockRegionNorth,
    sources: [
      {
        id: 'src-1',
        sourceName: 'พจนานุกรมคำเมือง-ไทย ฉบับราชบัณฑิตยสภา',
        sourceType: 'OFFICIAL_DICTIONARY',
        sourceUrl: 'https://orst.go.th',
        verificationStatus: 'VERIFIED',
      },
    ],
    definitions: [
      {
        id: 'def-1',
        definition: 'กิน, รับประทาน',
        definitionType: 'OFFICIAL',
        verified: true,
      },
    ],
    examples: [
      {
        id: 'ex-1',
        exampleText: 'ไปกิ๋นข้าวแลงตวยกั๋นบ่',
        meaningTh: 'ไปกินข้าวเย็นด้วยกันไหม',
        contextNote: 'ชวนกินข้าว ชวนเพื่อน',
      },
    ],
    relationships: [
      {
        id: 'rel-1',
        targetId: 'กิน',
        relationshipType: 'EXACT_EQUIVALENT',
        confidenceScore: 1.0,
        isInferred: false,
      },
    ],
    word: {
      id: 'w-kin',
      headword: 'กิน',
    },
  };

  const mockDialectEntryZabNortheast = {
    id: 'de-zab-isan',
    dialectWord: 'แซ่บ',
    dialectWordClean: 'แซ่บ',
    localMeaning: 'อร่อย ถูกปาก มีรสชาติจัดจ้าน',
    regionId: 'reg-isan',
    province: 'ขอนแก่น',
    languageVariant: 'ภาษาลาว-อีสาน',
    partOfSpeech: 'คำวิเศษณ์',
    ipaPhonetic: 'sɛːp˥˩',
    context: 'ใช้ในการชมอาหาร หรือเปรียบเทียบสิ่งที่ถูกใจ',
    status: 'OFFICIAL_SOURCE',
    region: mockRegionNortheast,
    sources: [
      {
        id: 'src-2',
        sourceName: 'พจนานุกรมภาษาถิ่นอีสาน สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย',
        sourceType: 'ACADEMIC',
        sourceUrl: null,
        verificationStatus: 'VERIFIED',
      },
    ],
    definitions: [
      {
        id: 'def-2',
        definition: 'อร่อย, รสชาติดีมาก',
        definitionType: 'OFFICIAL',
        verified: true,
      },
    ],
    examples: [
      {
        id: 'ex-2',
        exampleText: 'ส้มตำจานนี้แซ่บอีหลี',
        meaningTh: 'ส้มตำจานนี้อร่อยจริงๆ',
        contextNote: 'ชมรสชาติอาหาร',
      },
    ],
    relationships: [
      {
        id: 'rel-2',
        targetId: 'อร่อย',
        relationshipType: 'EXACT_EQUIVALENT',
        confidenceScore: 0.98,
        isInferred: false,
      },
    ],
    word: {
      id: 'w-aroi',
      headword: 'อร่อย',
    },
  };

  const mockStandardWordKin = {
    id: 'w-kin',
    headword: 'กิน',
    dialectEntries: [mockDialectEntryKinNorth],
    dialectRelationships: [
      {
        confidenceScore: 1.0,
        isInferred: false,
        dialectEntry: mockDialectEntryKinNorth,
      },
    ],
    entries: [
      {
        semanticMappings: [],
      },
    ],
  };

  beforeEach(async () => {
    prisma = {
      dialectRegion: {
        findMany: jest.fn().mockImplementation(({ where }) => {
          if (where?.type === 'PROVINCE') {
            return Promise.resolve([
              {
                id: 'prov-cm',
                code: 'CHIANG_MAI',
                nameThai: 'เชียงใหม่',
                parentRegionId: 'reg-north',
                parentRegion: mockRegionNorth,
              },
            ]);
          }
          return Promise.resolve([
            mockRegionCentral,
            mockRegionNorth,
            mockRegionNortheast,
            mockRegionSouth,
          ]);
        }),
      },
      dialectEntry: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockImplementation(({ where }) => {
          // Check for query matches
          const stringified = JSON.stringify(where || {});
          if (stringified.includes('กิ๋น') || stringified.includes('กิน')) {
            return Promise.resolve([mockDialectEntryKinNorth]);
          }
          if (stringified.includes('อร่อย') || stringified.includes('แซ่บ')) {
            return Promise.resolve([mockDialectEntryZabNortheast]);
          }
          if (stringified.includes('ไม่มีคำนี้')) {
            return Promise.resolve([]);
          }
          // Default for list with no filters
          return Promise.resolve([mockDialectEntryKinNorth]);
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          const str = JSON.stringify(where || {});
          if (str.includes('กิ๋น') || str.includes('กิน')) {
            return Promise.resolve(mockDialectEntryKinNorth);
          }
          if (str.includes('แซ่บ') || str.includes('อร่อย')) {
            return Promise.resolve(mockDialectEntryZabNortheast);
          }
          return Promise.resolve(null);
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where?.id === 'de-kin-north') return Promise.resolve(mockDialectEntryKinNorth);
          return Promise.resolve(null);
        }),
      },
      word: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where?.headword === 'กิน') return Promise.resolve(mockStandardWordKin);
          return Promise.resolve(null);
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where?.headword === 'กิน') return Promise.resolve(mockStandardWordKin);
          return Promise.resolve(null);
        }),
      },
      $queryRaw: jest.fn().mockImplementation((query) => {
        const queryStr = String(query);
        if (queryStr.includes('ไม่มีคำนี้')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([{ entity_id: 'de-kin-north', similarity: 0.92 }]);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DialectService,
        DialectRankingService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    dialectService = module.get<DialectService>(DialectService);
    rankingService = module.get<DialectRankingService>(DialectRankingService);
  });

  describe('DialectRankingService', () => {
    it('should use default ranking weights summing to 1.0', () => {
      const weights = rankingService.getWeights();
      expect(weights.semantic_similarity).toBe(0.5);
      expect(weights.keyword_score).toBe(0.2);
      expect(weights.region_match).toBe(0.15);
      expect(weights.definition_match).toBe(0.1);
      expect(weights.source_reliability).toBe(0.05);

      const sum =
        weights.semantic_similarity +
        weights.keyword_score +
        weights.region_match +
        weights.definition_match +
        weights.source_reliability;
      expect(Math.round(sum * 100) / 100).toBe(1.0);
    });

    it('should rank candidates with higher keyword and semantic similarity first', () => {
      const candidates = [
        {
          id: '1',
          dialectWord: 'กิ๋น',
          localMeaning: 'เคี้ยวกลืน รับประทานอาหาร',
          regionCode: 'NORTH',
          regionName: 'ภาคเหนือ',
          status: 'OFFICIAL_SOURCE',
          sourceType: 'ROYAL_SOCIETY',
          semanticSimilarity: 0.95,
        },
        {
          id: '2',
          dialectWord: 'โสภ',
          localMeaning: 'การรับประทานอาหาร',
          regionCode: 'NORTHEAST',
          regionName: 'ภาคอีสาน',
          status: 'COMMUNITY',
          sourceType: 'COMMUNITY',
          semanticSimilarity: 0.6,
        },
      ];

      const ranked = rankingService.scoreAndRank(candidates, 'กิน', 'NORTH');
      expect(ranked.length).toBe(2);
      expect(ranked[0].id).toBe('1');
      expect(ranked[0].finalScore).toBeGreaterThan(ranked[1].finalScore);
      expect(ranked[0].scoreBreakdown.regionScore).toBe(1.0);
    });
  });

  describe('DialectService - Discovery & Search', () => {
    it('should retrieve list of dialect regions', async () => {
      const result = await dialectService.getRegions();
      expect(result).toBeDefined();
      expect(result.regions).toBeDefined();
      expect(result.regions.length).toBe(4);
      expect(prisma.dialectRegion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { parentRegionId: null } }),
      );
    });

    it('should retrieve list of dialect provinces', async () => {
      const result = await dialectService.getProvinces();
      expect(result).toBeDefined();
      expect(result.provinces).toBeDefined();
      expect(result.provinces.length).toBe(1);
      expect(result.provinces[0].name_thai).toBe('เชียงใหม่');
    });

    it('should perform list/filter search with pagination', async () => {
      const result = await dialectService.listDialects({
        word: 'กิ๋น',
        page: 1,
        limit: 10,
      });

      expect(result.results).toHaveLength(1);
      expect(result.results[0].dialect_word).toBe('กิ๋น');
      expect(result.results[0].region).toBe('ภาคเหนือ');
      expect(result.results[0].sources).toBeDefined();
      expect(result.results[0].sources[0].source_name).toContain('ราชบัณฑิตยสภา');
    });

    it('should perform meaning-first dialect search across regions', async () => {
      const result: any = await dialectService.searchMeaning({
        query: 'กิน',
        limit: 10,
      });

      expect(result.query_understanding).toBeDefined();
      expect(result.regional_grouped).toBeDefined();
      expect(result.regional_grouped.NORTH).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].dialectWord).toBe('กิ๋น');
    });
  });

  describe('DialectService - Standard Mapping & Cross-regional Comparison', () => {
    it('should return standard to dialect mappings for a valid standard word', async () => {
      const mapping = await dialectService.getStandardDialectMapping('กิน');
      expect(mapping.standard_word).toBe('กิน');
      expect(mapping.has_mappings).toBe(true);
      expect(mapping.regional_grouping.NORTH).toBeDefined();
      expect(mapping.regional_grouping.NORTH[0].word).toBe('กิ๋น');
      expect(mapping.regional_grouping.NORTH[0].source).toBeDefined();
    });

    it('should return empty mappings notice gracefully if neither word nor dialect entry is found', async () => {
      const mapping = await dialectService.getStandardDialectMapping('ไม่มีคำนี้ในระบบทดสอบอย่างแน่นอน12345');
      expect(mapping.has_mappings).toBe(false);
      expect(mapping.mappings).toHaveLength(0);
      expect(mapping.notice).toContain('ยังไม่พบข้อมูล');
    });

    it('should compare regional variants and construct comparison matrix', async () => {
      const comp = await dialectService.compareDialects({
        word: 'กิน',
        regions: ['NORTH', 'NORTHEAST'],
      });

      expect(comp.concept).toBe('กิน');
      expect(comp.results).toBeDefined();
      const northResult = comp.results.find((r: any) => r.region === 'NORTH');
      expect(northResult).toBeDefined();
      expect(northResult.term).toBe('กิ๋น');
      expect(northResult.found).toBe(true);
    });
  });

  describe('DialectService - Grounded AI Explanation & Hallucination Guard', () => {
    it('should produce grounded explanation using verified facts and sources', async () => {
      const explanation = await dialectService.explainDialects({
        query: 'คำว่า กิ๋น หมายถึงอะไรและใช้อย่างไร',
        concept: 'กิน',
      });

      expect(explanation.grounded).toBe(true);
      expect(explanation.abstained).toBe(false);
      expect(explanation.evidence.length).toBeGreaterThan(0);
      expect(explanation.answer).toBeDefined();
    });

    it('should trigger hallucination guard and abstain when no dialect evidence exists', async () => {
      prisma.dialectEntry.findMany.mockResolvedValue([]);
      prisma.$queryRaw.mockResolvedValue([]);

      const explanation = await dialectService.explainDialects({
        query: 'คำประหลาดไม่มีข้อมูลจริง99999',
      });

      expect(explanation.abstained).toBe(true);
      expect(explanation.grounded).toBe(false);
      expect(explanation.confidence).toBeLessThanOrEqual(0.3);
      expect(explanation.answer).toContain(
        'ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลภาษาถิ่นที่ระบบรองรับ',
      );
      expect(explanation.evidence).toHaveLength(0);
    });
  });
});
