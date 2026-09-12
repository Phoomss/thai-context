import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';

class FeedbackDto {
  query: string;
  word_id?: string;
  is_relevant: boolean;
  comments?: string;
}

@ApiTags('Feedback')
@Controller('api/v1/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Submit user relevance feedback on recommended words' })
  submit(@Body() body: FeedbackDto) {
    return this.feedbackService.submitFeedback(body);
  }
}
