import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AccessibilityService } from './accessibility.service';
import { PrismaService } from '../../database/prisma.service';

describe('AccessibilityService', () => {
  let service: AccessibilityService;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      word: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.headword === 'ประสิทธิภาพ') {
            return Promise.resolve({
              headword: 'ประสิทธิภาพ',
              entries: [
                {
                  pronunciations: [
                    {
                      phoneticSpelling: 'ประ-สิด-ทิ-พาบ',
                      transliterationRtgs: 'pra-sit-thi-phap',
                      ipaNotation: 'praʔ˨˩.sit̚˨˩.tʰi˦˥.pʰaːp̚˥˩',
                      tonePattern: 'L-L-H-L',
                      sourceType: 'OFFICIAL_DATA',
                    },
                  ],
                },
              ],
              translations: [
                {
                  translatedWord: 'efficiency',
                  languageCode: 'en',
                  contextualExplanation: 'Capacity to deliver maximum output',
                  provenance: 'OFFICIAL_CURATED',
                  confidenceScore: 1.0,
                },
              ],
              signEntries: [
                {
                  signName: 'ประสิทธิภาพ',
                  handshapeDescription: 'มือขวาตั้งนิ้วชี้และนิ้วกลาง',
                  dialectRegion: 'CENTRAL',
                  verificationStatus: 'OFFICIAL',
                  sourceAttribution: 'วิทยาลัยราชสุดา',
                  mediaList: [
                    {
                      mediaType: 'VIDEO_MP4',
                      mediaUrl: 'https://assets.thai-context.org/tsl/videos/prasitthiphap.mp4',
                      isPrimary: true,
                    },
                  ],
                },
              ],
            });
          }
          return Promise.resolve(null);
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessibilityService,
        { provide: PrismaService, useValue: prismaService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:8000'),
          },
        },
      ],
    }).compile();

    service = module.get<AccessibilityService>(AccessibilityService);
  });

  it('should return complete word accessibility pack for "ประสิทธิภาพ"', async () => {
    const res = await service.getWordAccessibility('ประสิทธิภาพ');
    expect(res).toBeDefined();
    expect(res.headword).toBe('ประสิทธิภาพ');
    expect(res.pronunciation.phoneticSpelling).toBe('ประ-สิด-ทิ-พาบ');
    expect(res.pronunciation.transliterationRtgs).toBe('pra-sit-thi-phap');
    expect(res.translations.length).toBeGreaterThan(0);
    expect(res.translations[0].translatedWord).toBe('efficiency');
    expect(res.signLanguage.length).toBeGreaterThan(0);
    expect(res.signLanguage[0].verificationStatus).toBe('OFFICIAL');
    expect(res.tts.supported).toBe(true);
  });

  it('should return empty sign language array when word has no signs', async () => {
    const res = await service.getSignLanguage('คำที่ไม่มีภาษามือ');
    expect(res).toEqual([]);
  });
});
