import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DialectService } from './dialect.service';
import {
  DialectFilterDto,
  MeaningFirstDialectSearchDto,
  DialectCompareDto,
  DialectExplainDto,
} from './dto/dialect.dto';

@ApiTags('Dialect')
@Controller('api/v1/dialect')
export class DialectController {
  constructor(private readonly dialectService: DialectService) {}

  @Get()
  @ApiOperation({ summary: 'Explore Thai regional dialects with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Filtered list of dialect entries' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async listDialects(@Query() filter: DialectFilterDto) {
    return this.dialectService.listDialects(filter);
  }

  @Get('regions')
  @ApiOperation({ summary: 'Get all dialect regions (North, Northeast, Central, South) and provincial hierarchy' })
  @ApiResponse({ status: 200, description: 'Hierarchical list of regions' })
  async getRegions() {
    return this.dialectService.getRegions();
  }

  @Get('provinces')
  @ApiOperation({ summary: 'Get provinces with dialect records, optionally filtered by region' })
  @ApiQuery({ name: 'region', required: false, example: 'NORTHEAST' })
  @ApiResponse({ status: 200, description: 'List of provinces' })
  async getProvinces(@Query('region') region?: string) {
    return this.dialectService.getProvinces(region);
  }

  @Get('search')
  @ApiOperation({ summary: 'Direct dialect word search (exact, partial, normalized, region)' })
  @ApiQuery({ name: 'q', required: true, example: 'ลำ' })
  @ApiQuery({ name: 'region', required: false, example: 'NORTH' })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Direct search results' })
  async searchDirect(
    @Query('q') q: string,
    @Query('region') region?: string,
    @Query('limit') limit?: number
  ) {
    return this.dialectService.searchDirect(q || '', region, limit ? Number(limit) : 20);
  }

  @Post('search/meaning')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Meaning-first dialect discovery using semantic search and query understanding (P0)' })
  @ApiResponse({ status: 200, description: 'Discovered dialect terms grouped by region' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchMeaning(@Body() dto: MeaningFirstDialectSearchDto) {
    return this.dialectService.searchMeaning(dto);
  }

  @Get('mapping/:word')
  @ApiOperation({ summary: 'Get standard Thai word to regional dialect mappings with provenance' })
  @ApiParam({ name: 'word', example: 'กิน' })
  @ApiResponse({ status: 200, description: 'Mapped regional dialect terms' })
  async getMapping(@Param('word') word: string) {
    return this.dialectService.getStandardDialectMapping(word);
  }

  @Post('compare')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Compare concept across regions (Central, North, Northeast, South) with usage and evidence (P0)' })
  @ApiResponse({ status: 200, description: 'Structured regional comparison matrix' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async compare(@Body() dto: DialectCompareDto) {
    return this.dialectService.compareDialects(dto);
  }

  @Post('explain')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI Grounded explanation of dialect differences using retrieved evidence only' })
  @ApiResponse({ status: 200, description: 'Grounded AI explanation with citations' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async explain(@Body() dto: DialectExplainDto) {
    return this.dialectService.explainDialects(dto);
  }

  @Get(':term')
  @ApiOperation({ summary: 'Get comprehensive detail for a dialect term (definitions, sources, examples, cultural notes)' })
  @ApiParam({ name: 'term', example: 'แซ่บ' })
  @ApiResponse({ status: 200, description: 'Dialect term detail' })
  @ApiResponse({ status: 404, description: 'Term not found' })
  async getTermDetail(@Param('term') term: string) {
    return this.dialectService.getDialectDetail(term);
  }
}
