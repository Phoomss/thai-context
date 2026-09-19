import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ModernVocabularyService } from './modern-vocabulary.service';
import { QueryModernVocabularyDto, SuggestModernTermDto, ReviewSubmissionDto } from './dto/modern-vocabulary.dto';

@ApiTags('Modern Vocabulary')
@Controller('api/v1/modern-vocabulary')
export class ModernVocabularyController {
  constructor(private readonly modernVocabularyService: ModernVocabularyService) {}

  @Get()
  @ApiOperation({ summary: 'List and filter modern Thai vocabulary (category, type, register, origin, status)' })
  @ApiResponse({ status: 200, description: 'Paginated list of modern terms with provenance and categories' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async listTerms(@Query() query: QueryModernVocabularyDto) {
    return this.modernVocabularyService.listTerms(query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all modern vocabulary categories with term counts' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getCategories() {
    return this.modernVocabularyService.getCategories();
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get insights and distribution analytics for modern vocabulary layer' })
  @ApiResponse({ status: 200, description: 'Analytics and distribution metrics' })
  async getInsights() {
    return this.modernVocabularyService.getInsights();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search modern vocabulary with keyword and category filters' })
  @ApiQuery({ name: 'q', description: 'Search term or keyword', required: true })
  @ApiQuery({ name: 'category', description: 'Category filter', required: false })
  @ApiQuery({ name: 'limit', description: 'Maximum results', required: false })
  async search(
    @Query('q') q: string,
    @Query('category') category?: string,
    @Query('limit') limit?: number,
  ) {
    return this.modernVocabularyService.searchModern(q || '', category, limit ? Number(limit) : 10);
  }

  @Get('compare')
  @ApiOperation({ summary: 'Compare modern term vs formal term or traditional equivalent' })
  @ApiQuery({ name: 'wordA', required: true, example: 'คอนเทนต์' })
  @ApiQuery({ name: 'wordB', required: true, example: 'เนื้อหา' })
  async compare(
    @Query('wordA') wordA: string,
    @Query('wordB') wordB: string,
  ) {
    return this.modernVocabularyService.compareTerms(wordA, wordB);
  }

  @Post('suggest')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Suggest a new modern Thai vocabulary term (stores as PENDING_REVIEW)' })
  @ApiResponse({ status: 201, description: 'Submission received for review' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async suggestTerm(@Body() dto: SuggestModernTermDto) {
    return this.modernVocabularyService.suggestTerm(dto);
  }

  @Get(':term')
  @ApiOperation({ summary: 'Get comprehensive detail for a modern term (definitions, sources, examples, timeline, evolution)' })
  @ApiParam({ name: 'term', description: 'Term headword or URL slug (e.g. "RAG", "ป้ายยา", "rag")' })
  @ApiResponse({ status: 200, description: 'Rich modern term detail' })
  @ApiResponse({ status: 404, description: 'Term not found' })
  async getTermDetail(@Param('term') term: string) {
    return this.modernVocabularyService.getTermDetail(term);
  }
}

@ApiTags('Admin Modern Vocabulary')
@Controller('api/v1/admin/modern-vocabulary')
export class AdminModernVocabularyController {
  constructor(private readonly modernVocabularyService: ModernVocabularyService) {}

  @Get('pending')
  @ApiOperation({ summary: 'List pending user submissions for editorial review' })
  async getPending() {
    return this.modernVocabularyService.getPendingSubmissions();
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve user submission and publish to Modern Vocabulary Layer' })
  async approve(@Param('id') id: string) {
    return this.modernVocabularyService.approveSubmission(id);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject user submission' })
  async reject(@Param('id') id: string, @Body() dto?: ReviewSubmissionDto) {
    return this.modernVocabularyService.rejectSubmission(id, dto);
  }
}
