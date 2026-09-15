import { Test, TestingModule } from '@nestjs/testing';
import { DictionaryService } from './dictionary.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('DictionaryService', () => {
  let service: DictionaryService;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      word: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.headword === 'ประสิทธิภาพ') {
            return Promise.resolve({
              headword: 'ประสิทธิภาพ',
              charLength: 11,
              entries: [
                {
                  edition: {
                    editionYear: '2569',
                    title: 'พจนานุกรม ๒๕๖๙',
                    source: { name: 'สำนักงานราชบัณฑิตยสภา' },
                  },
                  pronunciation: 'ปฺระ-สิด-ทิ-พาบ',
                  pageNumber: 820,
                  definitions: [
                    {
                      pos: { abbrThai: 'น.', nameThai: 'คำนาม' },
                      senseOrder: 1,
                      definitionText: 'ความสามารถในการปฏิบัติการที่ให้ผลลัพธ์สูงสุด',
                      registerLevel: 'FORMAL',
                      subjectDomain: 'การบริหาร',
                      examples: [],
                    },
                  ],
                  semanticMappings: [],
                },
              ],
              relationshipsAsSource: [],
              relationshipsAsTarget: [],
            });
          }
          return Promise.resolve(null);
        }),
      },
      dictionaryEdition: {
        findMany: jest.fn().mockResolvedValue([
          { id: '1', editionYear: '2542', title: 'ฉบับ ๒๕๔๒' },
          { id: '2', editionYear: '2554', title: 'ฉบับ ๒๕๕๔' },
        ]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DictionaryService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<DictionaryService>(DictionaryService);
  });

  it('should return word details with separated officialData and aiAssistance', async () => {
    const res = await service.getWordDetail('ประสิทธิภาพ');
    expect(res.word).toBe('ประสิทธิภาพ');
    expect(res.officialData.entries.length).toBe(1);
    expect(res.aiAssistance).toBeDefined();
    expect(res.aiAssistance.summary).toContain('ประสิทธิภาพ');
  });

  it('should return evolution timeline with editionYear and status', async () => {
    const res = await service.getWordEvolution('ประสิทธิภาพ');
    expect(res.word).toBe('ประสิทธิภาพ');
    expect(res.timeline).toBeDefined();
    expect(res.timeline.length).toBeGreaterThan(0);
    expect(res.timeline[0].editionYear).toBe('2569');
    expect(res.timeline[0].status).toBe('ADDED');
  });

  it('should return curated evolution timeline for สมานฉันท์', async () => {
    const res = await service.getWordEvolution('สมานฉันท์');
    expect(res.word).toBe('สมานฉันท์');
    expect(res.timeline).toHaveLength(3);
    expect(res.timeline[0].editionYear).toBe('2542');
    expect(res.timeline[0].status).toBe('ORIGINAL');
    expect(res.timeline[1].editionYear).toBe('2554');
    expect(res.timeline[1].status).toBe('CHANGED');
    expect(res.timeline[2].editionYear).toBe('2569');
    expect(res.timeline[2].status).toBe('EXPANDED');
  });

  it('should throw NotFoundException if word does not exist in evolution', async () => {
    await expect(service.getWordEvolution('คำไม่มีอยู่จริง_xyz')).rejects.toThrow(NotFoundException);
  });
});
