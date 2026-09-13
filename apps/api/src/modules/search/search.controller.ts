import { Controller, Get, Post, Query, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { KeywordSearchQueryDto, MeaningSearchDto, ContextSearchDto } from './dto/search.dto';

@ApiTags('Search')
@Controller('api/v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Keyword search (exact, partial, definition, edition, source)' })
  @ApiResponse({ status: 200, description: 'Search results' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async keywordSearch(@Query() queryDto: KeywordSearchQueryDto) {
    return this.searchService.keywordSearch(queryDto);
  }

  @Post('meaning')
  @ApiOperation({ summary: 'Meaning-first search (“ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน”)' })
  @ApiResponse({ status: 200, description: 'Semantic recommendations with relevance scores and evidence' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async meaningSearch(@Body() body: MeaningSearchDto) {
    return this.searchService.meaningSearch(body);
  }

  @Post('context')
  @ApiOperation({ summary: 'Context-aware search with excluded words handling' })
  @ApiResponse({ status: 200, description: 'Ranked results tailored for specific register or situation' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async contextSearch(@Body() body: ContextSearchDto) {
    return this.searchService.contextSearch(body);
  }
}
