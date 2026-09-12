import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DialectsService } from './dialects.service';

@ApiTags('Dialects')
@Controller('api/v1/dialects')
export class DialectsController {
  constructor(private readonly dialectsService: DialectsService) {}

  @Get('explore')
  @ApiOperation({ summary: 'Explore Thai regional dialects by region' })
  explore(@Query('region') region?: string) {
    return this.dialectsService.exploreDialects(region);
  }

  @Get('map/:headword')
  @ApiOperation({ summary: 'Map standard Thai headword to 4 regional dialects' })
  getDialectMap(@Param('headword') headword: string) {
    return this.dialectsService.getDialectMap(headword);
  }
}
