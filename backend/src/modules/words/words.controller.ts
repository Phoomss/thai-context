import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WordsService } from './words.service';

@ApiTags('Words')
@Controller('api/v1/words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get(':headword/detail')
  @ApiOperation({ summary: 'Get full linguistic details of a headword' })
  getDetail(@Param('headword') headword: string) {
    return this.wordsService.getWordDetail(headword);
  }

  @Get(':headword/evolution')
  @ApiOperation({ summary: 'Get 3-Era Evolution Timeline (2542 -> 2554 -> 2569) with Semantic Diff' })
  getEvolution(@Param('headword') headword: string) {
    return this.wordsService.getWordEvolution(headword);
  }

  @Post('compare')
  @ApiOperation({ summary: 'Compare two or more words side-by-side' })
  compare(@Body() body: { headwords: string[] }) {
    return this.wordsService.compareWords(body.headwords || []);
  }
}
