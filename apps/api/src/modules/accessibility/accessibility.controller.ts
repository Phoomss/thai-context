import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AccessibilityService } from './accessibility.service';
import { WordAccessibilityResponseDto } from './dto/word-accessibility.dto';

@ApiTags('Accessibility & Multilingual')
@Controller('api/v1/dictionary/words')
export class AccessibilityController {
  constructor(private readonly accessibilityService: AccessibilityService) {}

  @Get(':word/accessibility')
  @ApiOperation({
    summary: 'Get complete accessibility pack for a word (Pronunciation, RTGS Romanization, English Translation, and Thai Sign Language)',
  })
  @ApiParam({ name: 'word', example: 'ประสิทธิภาพ' })
  @ApiResponse({ status: 200, type: WordAccessibilityResponseDto })
  async getAccessibility(@Param('word') word: string): Promise<WordAccessibilityResponseDto> {
    return this.accessibilityService.getWordAccessibility(word);
  }

  @Get(':word/pronunciation')
  @ApiOperation({ summary: 'Get official pronunciation and RTGS transliteration' })
  @ApiParam({ name: 'word', example: 'ประสิทธิภาพ' })
  async getPronunciation(@Param('word') word: string) {
    return this.accessibilityService.getPronunciation(word);
  }

  @Get(':word/translations')
  @ApiOperation({ summary: 'Get official and AI-grounded English translations with source provenance' })
  @ApiParam({ name: 'word', example: 'ประสิทธิภาพ' })
  async getTranslations(@Param('word') word: string) {
    return this.accessibilityService.getTranslations(word);
  }

  @Get(':word/sign-language')
  @ApiOperation({ summary: 'Get Thai Sign Language (TSL) video references, handshape descriptions, and verification status' })
  @ApiParam({ name: 'word', example: 'ประสิทธิภาพ' })
  async getSignLanguage(@Param('word') word: string) {
    return this.accessibilityService.getSignLanguage(word);
  }
}
