import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { PrismaService } from '../../database/prisma.service';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      word: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.headword === 'ประสิทธิภาพ') {
            return Promise.resolve({ id: 'word-uuid-1', headword: 'ประสิทธิภาพ' });
          }
          return Promise.resolve(null);
        }),
      },
      searchFeedback: {
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: 'feedback-uuid-999',
            ...data,
            createdAt: new Date(),
          })
        ),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully record feedback with standard dto', async () => {
    const result = await service.createFeedback({
      queryText: 'ทำงานสำเร็จ',
      recommendedWord: 'ประสิทธิภาพ',
      userAction: 'THUMBS_UP',
      rating: 5,
      feedbackNotes: 'ตรงใจมาก',
      sessionId: 'sess-123',
    });

    expect(result).toEqual({
      success: true,
      feedbackId: 'feedback-uuid-999',
      message: 'Feedback recorded successfully',
    });

    expect(prismaService.searchFeedback.create).toHaveBeenCalledWith({
      data: {
        queryText: 'ทำงานสำเร็จ',
        recommendedWordId: 'word-uuid-1',
        userAction: 'THUMBS_UP',
        rating: 5,
        feedbackNotes: 'ตรงใจมาก',
        sessionId: 'sess-123',
      },
    });
  });

  it('should record feedback with handoff guide format (query, selectedWord, relevanceScore)', async () => {
    const result = await service.createFeedback({
      query: 'ทำงานได้ดี รวดเร็ว',
      selectedWord: 'ประสิทธิภาพ',
      relevanceScore: 1,
      userComment: 'ยอดเยี่ยม',
    } as any);

    expect(result.success).toBe(true);
    expect(prismaService.searchFeedback.create).toHaveBeenCalledWith({
      data: {
        queryText: 'ทำงานได้ดี รวดเร็ว',
        recommendedWordId: 'word-uuid-1',
        userAction: 'THUMBS_UP',
        rating: 5,
        feedbackNotes: 'ยอดเยี่ยม',
        sessionId: null,
      },
    });
  });

  it('should handle THUMBS_DOWN (relevanceScore = -1)', async () => {
    const result = await service.createFeedback({
      query: 'ทำงานไม่ทัน',
      selectedWord: 'ไม่พบในคลัง',
      relevanceScore: -1,
      userComment: 'คำไม่ตรงความหมาย',
    } as any);

    expect(result.success).toBe(true);
    expect(prismaService.searchFeedback.create).toHaveBeenCalledWith({
      data: {
        queryText: 'ทำงานไม่ทัน',
        recommendedWordId: null,
        userAction: 'THUMBS_DOWN',
        rating: 1,
        feedbackNotes: 'คำไม่ตรงความหมาย',
        sessionId: null,
      },
    });
  });
});
