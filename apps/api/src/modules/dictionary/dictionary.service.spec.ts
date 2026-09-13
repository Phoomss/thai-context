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

  it('should throw NotFoundException if word does not exist', async () => {
    await expect(service.getWordDetail('คำไม่มีอยู่จริง')).rejects.toThrow(NotFoundException);
  });
});
