import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';

class MeaningSearchDto {
  query: string;
  filters?: {
    register?: string;
    edition_year?: number;
  };
}

@ApiTags('Search')
@Controller('api/v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('meaning')
  @ApiOperation({ summary: 'Meaning-first search with Intent extraction, RRF ranking & Grounded RAG' })
  async searchMeaning(@Body() body: MeaningSearchDto) {
    const result = await this.searchService.searchMeaning(body.query);
    return { success: true, data: result };
  }

  @Get('keyword')
  @ApiOperation({ summary: 'Fuzzy keyword autocomplete using pg_trgm GIN index' })
  async searchKeyword(@Query('q') query: string) {
    return this.searchService.searchKeyword(query || '');
  }
}
