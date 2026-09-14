import { Test, TestingModule } from '@nestjs/testing';
import { CompareService } from './compare.service';
import { PrismaService } from '../../database/prisma.service';
import { AIService } from '../ai/ai.service';

describe('CompareService', () => {
  let service: CompareService;
  let prisma: { word: { findUnique: jest.Mock } };
  let ai: { compareWords: jest.Mock };

  beforeEach(async () => {
    prisma = {
      word: {
        findUnique: jest.fn().mockImplementation(({ where }) =>
          Promise.resolve({
            headword: where.headword,
            entries: [{
              edition: { editionYear: '2554' },
              definitions: [{
                definitionText: `นิยามของ${where.headword}`,
                pos: { abbrThai: 'น.' },
              }],
            }],
          }),
        ),
      },
    };
    ai = {
      compareWords: jest.fn().mockResolvedValue({
        comparison: {
          meaningDifference: 'ความหมายต่างกัน',
          contextDifference: 'บริบทต่างกัน',
          usageGuidance: 'เลือกตามนิยาม',
        },
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompareService,
        { provide: PrismaService, useValue: prisma },
        { provide: AIService, useValue: ai },
      ],
    }).compile();
    service = module.get(CompareService);
  });

  it('compares and returns every requested word with official evidence', async () => {
    const result = await service.compareWords({ words: [' คำหนึ่ง ', 'คำสอง', 'คำสาม'] });

    expect(ai.compareWords).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ word: 'คำหนึ่ง', edition: '2554' }),
      expect.objectContaining({ word: 'คำสาม', edition: '2554' }),
    ]));
    expect(result.words).toHaveLength(3);
    expect(result.words[0]).toEqual(expect.objectContaining({
      headword: 'คำหนึ่ง',
      definition: 'นิยามของคำหนึ่ง',
      partOfSpeech: 'น.',
      edition: '2554',
    }));
    expect(result.evidence).toHaveLength(3);
    expect(result.comparison.meaningDifference).toBe('ความหมายต่างกัน');
  });

  it('does not replace an AI service failure with a synthetic comparison', async () => {
    ai.compareWords.mockRejectedValue(new Error('AI unavailable'));
    await expect(service.compareWords({ words: ['คำหนึ่ง', 'คำสอง'] }))
      .rejects.toThrow('AI unavailable');
  });
});
