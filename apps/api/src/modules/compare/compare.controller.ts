import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CompareService } from './compare.service';
import { CompareWordsDto } from './dto/compare.dto';

@ApiTags('Compare')
@Controller('api/v1/compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  @Post()
  @ApiOperation({ summary: 'Compare nuanced differences between 2 to 5 words' })
  @ApiResponse({ status: 200, description: 'Comparison analysis with grounded dictionary evidence' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async compare(@Body() body: CompareWordsDto) {
    return this.compareService.compareWords(body);
  }
}
