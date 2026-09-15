import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { HttpException } from '@nestjs/common';

describe('AIService', () => {
  let service: AIService;
  let httpService: any;

  beforeEach(async () => {
    httpService = {
      post: jest.fn(),
      axiosRef: {
        post: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: HttpService,
          useValue: httpService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:8000'),
          },
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('compareWords', () => {
    const words = [
      { word: 'ประสิทธิภาพ', definition: 'นิยามหนึ่ง', partOfSpeech: 'น.', edition: '2554', foundInOfficial: true },
      { word: 'ประสิทธิผล', definition: 'นิยามสอง', partOfSpeech: 'น.', edition: '2554', foundInOfficial: true },
    ];

    it('returns the real AI comparison response', async () => {
      const upstream = {
        comparison: {
          meaningDifference: 'ต่างกัน',
          contextDifference: 'คนละบริบท',
          usageGuidance: 'เลือกให้ตรงความหมาย',
        },
      };
      httpService.post.mockReturnValue(of({ data: upstream }));
      await expect(service.compareWords(words)).resolves.toEqual(upstream);
    });

    it('propagates AI unavailability as HTTP 503', async () => {
      httpService.post.mockImplementation(() => { throw new Error('Connection refused'); });
      await expect(service.compareWords(words)).rejects.toMatchObject({
        status: 503,
      });
    });
  });

  describe('chatRAG', () => {
    it('should return grounded chat response from AI service', async () => {
      const mockResult = {
        answer: 'คำว่า ประสิทธิภาพ ใช้ในรายงานวิชาการได้',
        grounded: true,
        abstained: false,
        confidence: 0.92,
        confidence_level: 'HIGH',
        evidence: [
          {
            word: 'ประสิทธิภาพ',
            edition: '2554',
            source: 'สำนักงานราชบัณฑิตยสภา',
            definition: 'ความสามารถที่ทำให้เกิดผลในการทำงาน',
            source_type: 'OFFICIAL',
            relevance: 0.95,
          },
        ],
        generated_content: [
          {
            type: 'writing_suggestion',
            content: 'การปรับปรุงกระบวนการช่วยเพิ่มประสิทธิภาพในการทำงาน',
          },
        ],
      };

      httpService.post.mockReturnValue(of({ data: mockResult }));

      const result = await service.chatRAG({
        message: 'คำว่า ประสิทธิภาพ ใช้ในรายงานวิชาการได้ไหม',
        word: 'ประสิทธิภาพ',
        context: 'academic',
      });

      expect(result.grounded).toBe(true);
      expect(result.abstained).toBe(false);
      expect(result.confidence).toBe(0.92);
      expect(result.evidence.length).toBeGreaterThan(0);
    });

    it('should gracefully fallback when upstream AI service is down', async () => {
      httpService.post.mockImplementation(() => {
        throw new Error('Connection refused');
      });

      const result = await service.chatRAG({
        message: 'คำว่า ไม่ทราบ มีหรือไม่',
      });

      expect(result.grounded).toBe(false);
      expect(result.abstained).toBe(true);
      expect(result.confidence_level).toBe('LOW');
    });
  });

  describe('streamChatRAG', () => {
    it('should stream fallback SSE events if upstream is unavailable', async () => {
      httpService.axiosRef.post.mockRejectedValue(new Error('Downstream unreachable'));

      const chunksWritten: string[] = [];
      const mockRes = {
        write: jest.fn((chunk) => chunksWritten.push(chunk)),
        end: jest.fn(),
      };

      await service.streamChatRAG(
        { message: 'ช่วยแต่งประโยคคำว่า ประสิทธิภาพ', word: 'ประสิทธิภาพ', context: 'formal' },
        mockRes,
      );

      expect(mockRes.write).toHaveBeenCalled();
      expect(mockRes.end).toHaveBeenCalled();
      const allText = chunksWritten.join('');
      expect(allText).toContain('event: start');
      expect(allText).toContain('event: token');
      expect(allText).toContain('event: complete');
    });
  });
});
