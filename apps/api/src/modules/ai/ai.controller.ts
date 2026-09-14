import { Controller, Post, Body, Res, Req, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Response, Request } from 'express';
import { AIService } from './ai.service';

export class ChatDto {
  @ApiProperty({
    example: 'คำว่า ประสิทธิภาพ ใช้ในรายงานวิชาการได้ไหม',
    description: 'Message to the RAG AI writing assistant',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    example: 'ประสิทธิภาพ',
    description: 'Target Thai word (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  word?: string;

  @ApiProperty({
    example: 'academic',
    description: 'Context: academic, business, formal, casual, legal, general (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  context?: string;
}

@ApiTags('AI Assistant')
@Controller('api/v1/ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with Grounded RAG AI Assistant (Synchronous)' })
  @ApiResponse({ status: 200, description: 'AI answer with verified dictionary evidence and confidence metrics' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async chat(@Body() body: ChatDto) {
    return this.aiService.chatRAG(body);
  }

  @Post('chat/stream')
  @ApiOperation({ summary: 'Chat with Grounded RAG AI Assistant (SSE Streaming)' })
  @ApiResponse({ status: 200, description: 'Server-Sent Events stream emitting start, token, evidence, and complete' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async chatStream(
    @Body() body: ChatDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const abortController = new AbortController();
    req.on('close', () => {
      abortController.abort();
    });

    await this.aiService.streamChatRAG(body, res, abortController.signal);
  }
}
