import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TtsService } from './tts.service';
import { PrismaService } from '../../database/prisma.service';
import { AiServiceTtsProvider } from './providers/ai-service-tts.provider';
import { LocalMockTtsProvider } from './providers/local-mock-tts.provider';

describe('TtsService', () => {
  let service: TtsService;
  let localMockProvider: LocalMockTtsProvider;

  beforeEach(async () => {
    const prismaService = {
      ttsCache: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({}),
      },
    };

    const aiServiceTtsProvider = {
      name: 'AI_SERVICE_TTS',
      isAvailable: jest.fn().mockResolvedValue(false), // Simulating offline AI Service
      synthesize: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TtsService,
        LocalMockTtsProvider,
        { provide: PrismaService, useValue: prismaService },
        { provide: AiServiceTtsProvider, useValue: aiServiceTtsProvider },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultVal: any) => {
              if (key === 'tts.voiceThai') return 'th-TH-PremwadeeNeural';
              if (key === 'tts.activeProvider') return 'AI_SERVICE';
              return defaultVal;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TtsService>(TtsService);
    localMockProvider = module.get<LocalMockTtsProvider>(LocalMockTtsProvider);
  });

  it('should gracefully fallback to LocalMockTtsProvider when AI Service is unavailable', async () => {
    const res = await service.synthesize('ประสิทธิภาพ');
    expect(res).toBeDefined();
    expect(res.audioBase64).toBeDefined();
    expect(res.audioBase64.length).toBeGreaterThan(0);
    expect(res.provider).toBe('LOCAL_MOCK_FALLBACK');
    expect(res.format).toBe('wav');
  });

  it('should return provider availability status', async () => {
    const status = await service.getStatus();
    expect(status).toBeDefined();
    expect(status.providers.length).toBe(2);
    expect(status.providers.some((p) => p.name === 'LOCAL_MOCK_FALLBACK' && p.available === true)).toBe(true);
  });
});
