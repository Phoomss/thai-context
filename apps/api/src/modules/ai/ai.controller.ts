import { Controller, Post, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AIService } from './ai.service';

export class ChatDto {
  @ApiProperty({
    example: 'ถ้าจะใช้คำว่ามีประสิทธิภาพในรายงานมหาวิทยาลัย ควรเขียนอย่างไร?',
    description: 'Message to the RAG AI assistant',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}

@ApiTags('AI Assistant')
@Controller('api/v1/ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with Grounded RAG AI Assistant' })
  @ApiResponse({ status: 200, description: 'AI answer with verified dictionary evidence' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async chat(@Body() body: ChatDto) {
    return this.aiService.chatRAG(body.message);
  }
}
