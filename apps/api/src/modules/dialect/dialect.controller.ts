import { Controller, Get, Query, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DialectService } from './dialect.service';
import { DialectFilterDto } from './dto/dialect.dto';

@ApiTags('Dialect')
@Controller('api/v1/dialect')
export class DialectController {
  constructor(private readonly dialectService: DialectService) {}

  @Get()
  @ApiOperation({ summary: 'Explore Thai regional dialects with filters' })
  @ApiResponse({ status: 200, description: 'Filtered list of dialect entries' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async listDialects(@Query() filter: DialectFilterDto) {
    return this.dialectService.listDialects(filter);
  }

  @Get('mapping/:word')
  @ApiOperation({ summary: 'Get standard word to dialect mappings with OFFICIAL vs AI_INFERRED badges' })
  @ApiParam({ name: 'word', example: 'อร่อย' })
  @ApiResponse({ status: 200, description: 'Mapped regional dialect terms' })
  async getMapping(@Param('word') word: string) {
    return this.dialectService.getStandardDialectMapping(decodeURIComponent(word));
  }
}
