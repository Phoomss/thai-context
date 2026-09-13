import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DialectFilterDto {
  @ApiPropertyOptional({ description: 'Filter by region code (NORTH, NORTHEAST, SOUTH, CENTRAL) or Thai name', example: 'NORTH' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: 'Filter by dialect word keyword', example: 'ลำ' })
  @IsOptional()
  @IsString()
  word?: string;

  @ApiPropertyOptional({ description: 'Filter by meaning text', example: 'อร่อย' })
  @IsOptional()
  @IsString()
  meaning?: string;
}
