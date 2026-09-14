import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFeedbackDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createFeedback(dto: CreateFeedbackDto) {
    let wordId: string | null = null;
    const targetWord = (dto.recommendedWord || dto.selectedWord || '').trim();
    if (targetWord) {
      const word = await this.prisma.word.findUnique({
        where: { headword: targetWord },
      });
      if (word) {
        wordId = word.id;
      }
    }

    const action =
      dto.userAction ||
      (typeof dto.relevanceScore === 'number'
        ? dto.relevanceScore > 0
          ? 'THUMBS_UP'
          : 'THUMBS_DOWN'
        : 'THUMBS_UP');

    const score =
      typeof dto.rating === 'number'
        ? dto.rating
        : typeof dto.relevanceScore === 'number'
        ? dto.relevanceScore === 1
          ? 5
          : dto.relevanceScore === -1
          ? 1
          : Math.min(Math.max(Math.round(dto.relevanceScore), 1), 5)
        : undefined;

    const feedback = await this.prisma.searchFeedback.create({
      data: {
        queryText: (dto.queryText || dto.query || '').trim(),
        recommendedWordId: wordId,
        userAction: action,
        rating: score,
        feedbackNotes: (dto.feedbackNotes || dto.userComment || '').trim() || null,
        sessionId: dto.sessionId || null,
      },
    });

    return {
      success: true,
      feedbackId: feedback.id,
      message: 'Feedback recorded successfully',
    };
  }
}
