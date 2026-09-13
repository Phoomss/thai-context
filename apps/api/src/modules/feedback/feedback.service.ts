import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFeedbackDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createFeedback(dto: CreateFeedbackDto) {
    let wordId: string | null = null;
    if (dto.recommendedWord) {
      const word = await this.prisma.word.findUnique({
        where: { headword: dto.recommendedWord.trim() },
      });
      if (word) {
        wordId = word.id;
      }
    }

    const feedback = await this.prisma.searchFeedback.create({
      data: {
        queryText: dto.queryText,
        recommendedWordId: wordId,
        userAction: dto.userAction,
        rating: dto.rating,
        feedbackNotes: dto.feedbackNotes,
        sessionId: dto.sessionId,
      },
    });

    return {
      success: true,
      feedbackId: feedback.id,
      message: 'Feedback recorded successfully',
    };
  }
}
