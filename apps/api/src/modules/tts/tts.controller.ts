import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TtsService } from './tts.service';
import { TtsSynthesizeDto } from './dto/tts-synthesize.dto';

@ApiTags('TTS (Text-to-Speech)')
@Controller('api/v1/tts')
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post('synthesize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Synthesize Thai text or word into speech audio (with caching and zero-crash fallback)' })
  @ApiResponse({ status: 200, description: 'Returns base64 encoded audio with metadata' })
  async synthesize(@Body() dto: TtsSynthesizeDto) {
    return this.ttsService.synthesize(dto.text, {
      voice: dto.voice,
      speed: dto.speed,
    });
  }

  @Get('status')
  @ApiOperation({ summary: 'Check available TTS engine providers and active fallback state' })
  async getStatus() {
    return this.ttsService.getStatus();
  }
}
