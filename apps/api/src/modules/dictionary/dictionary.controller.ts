import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DictionaryService } from './dictionary.service';

@ApiTags('Dictionary')
@Controller('api/v1/dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get('words/:word')
  @ApiOperation({ summary: 'Get word detail across official editions and AI guidance' })
  @ApiParam({ name: 'word', example: 'ประสิทธิภาพ' })
  @ApiResponse({ status: 200, description: 'Comprehensive word detail' })
  async getWordDetail(@Param('word') word: string) {
    return this.dictionaryService.getWordDetail(decodeURIComponent(word));
  }

  @Get('words/:word/evolution')
  @ApiOperation({ summary: 'Get evolution timeline across 2542, 2554, and 2569 editions' })
  @ApiParam({ name: 'word', example: 'ประสิทธิภาพ' })
  @ApiResponse({ status: 200, description: 'Evolution timeline' })
  async getWordEvolution(@Param('word') word: string) {
    return this.dictionaryService.getWordEvolution(decodeURIComponent(word));
  }

  @Get('compare/:word')
  @ApiOperation({ summary: 'Detect dictionary definition changes across editions' })
  @ApiParam({ name: 'word', example: 'ประสิทธิภาพ' })
  @ApiResponse({ status: 200, description: 'Edition change detection status (ADDED, CHANGED, UNCHANGED, NO_DATA)' })
  async compareEditions(@Param('word') word: string) {
    return this.dictionaryService.compareWordEditions(decodeURIComponent(word));
  }
}
