import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../../database/prisma.service';
import { AIService } from '../ai/ai.service';

describe('SearchService', () => {
  let service: SearchService;
  let prismaService: any;
  let aiService: any;

  beforeEach(async () => {
    prismaService = {
      definition: {
        findMany: jest.fn().mockResolvedValue([
          {
            definitionText: 'ความสามารถที่ทำให้เกิดผลสัมฤทธิ์',
            pos: { abbrThai: 'น.' },
            entry: {
              word: { headword: 'ประสิทธิภาพ' },
              edition: {
                editionYear: '2554',
                source: { name: 'สำนักงานราชบัณฑิตยสภา' },
              },
            },
          },
        ]),
      },
    };

    aiService = {
      getRecommendations: jest.fn().mockResolvedValue({
        intent: 'find_word_by_meaning',
        context: null,
        excluded_terms: [],
        recommendations: [
          {
            word: 'ประสิทธิภาพ',
            score: 0.94,
            reason: 'สอดคล้องกับความหมายการทำงานได้ผลดี',
            evidence: [
              {
                source: 'สำนักงานราชบัณฑิตยสภา',
                edition: '2554',
                definition: 'ความสามารถที่ทำให้เกิดผลสัมฤทธิ์',
                relevance: 0.94,
              },
            ],
          },
        ],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: prismaService },
        { provide: AIService, useValue: aiService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('keywordSearch should return structured results from official definitions', async () => {
    const result = await service.keywordSearch({ q: 'ประสิทธิภาพ' });
    expect(result.query).toBe('ประสิทธิภาพ');
    expect(result.results.length).toBe(1);
    expect(result.results[0].word).toBe('ประสิทธิภาพ');
    expect(result.results[0].edition).toBe('2554');
    expect(result.filters.edition).toBeNull();
  });

  it('keywordSearch should support edition and source filters', async () => {
    const result = await service.keywordSearch({
      q: 'ประสิทธิภาพ',
      edition: '2554',
      source: 'ROYAL_SOCIETY',
      exact: true,
    });
    expect(prismaService.definition.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          entry: expect.objectContaining({
            edition: {
              editionYear: '2554',
              source: { code: 'ROYAL_SOCIETY' },
            },
          }),
        }),
      })
    );
    expect(result.filters.edition).toBe('2554');
    expect(result.filters.source).toBe('ROYAL_SOCIETY');
    expect(result.filters.exact).toBe(true);
  });

  it('meaningSearch should call AI recommendation and format results', async () => {
    const result = await service.meaningSearch({ query: 'ทำงานได้ดี ใช้เวลาน้อย' });
    expect(result.query).toBe('ทำงานได้ดี ใช้เวลาน้อย');
    expect(result.results.length).toBe(1);
    expect(result.results[0].word).toBe('ประสิทธิภาพ');
    expect(result.results[0].score).toBe(0.94);
  });
});
