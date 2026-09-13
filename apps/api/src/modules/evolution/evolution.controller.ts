import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EvolutionService } from './evolution.service';

@ApiTags('Evolution')
@Controller('api/v1/evolution')
export class EvolutionController {
  constructor(private readonly evolutionService: EvolutionService) {}

  @Get(':word')
  @ApiOperation({ summary: 'Get evolution timeline of a word' })
  @ApiParam({ name: 'word', example: 'ประสิทธิภาพ' })
  @ApiResponse({ status: 200, description: 'Evolution timeline across official dictionary editions' })
  async getEvolution(@Param('word') word: string) {
    return this.evolutionService.getEvolution(decodeURIComponent(word));
  }
}
