import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty, IsArray, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class DialectFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by region code (NORTH, NORTHEAST, SOUTH, CENTRAL) or Thai name',
    example: 'NORTH',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'Filter by province (e.g. เชียงใหม่, ขอนแก่น, สงขลา)',
    example: 'เชียงใหม่',
  })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({
    description: 'Filter by dialect word keyword or partial term',
    example: 'ลำ',
  })
  @IsOptional()
  @IsString()
  word?: string;

  @ApiPropertyOptional({
    description: 'Filter by meaning text',
    example: 'อร่อย',
  })
  @IsOptional()
  @IsString()
  meaning?: string;

  @ApiPropertyOptional({
    description: 'Filter by category (conversation, kinship, body_parts)',
    example: 'conversation',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page limit', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class MeaningFirstDialectSearchDto {
  @ApiProperty({
    description: 'Meaning or intent query text (e.g. คำที่หมายถึงการกินอาหารในภาคอีสาน, คิดถึง, อร่อย)',
    example: 'คำที่หมายถึงการกินอาหารในภาคอีสาน',
  })
  @IsNotEmpty()
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Target region code (NORTH, NORTHEAST, SOUTH, CENTRAL, or ALL)',
    example: 'NORTHEAST',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'Target province (e.g. ขอนแก่น, เชียงใหม่, สงขลา)',
    example: 'ขอนแก่น',
  })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: 'Maximum results to return', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class DialectCompareDto {
  @ApiProperty({
    description: 'Concept or standard Thai word to compare across regions (e.g. กิน, อร่อย, คิดถึง, พูด, โกหก)',
    example: 'กิน',
  })
  @IsNotEmpty()
  @IsString()
  word: string;

  @ApiPropertyOptional({
    description: 'Regions to compare across',
    example: ['CENTRAL', 'NORTH', 'NORTHEAST', 'SOUTH'],
  })
  @IsOptional()
  @IsArray()
  regions?: string[];
}

export class DialectExplainDto {
  @ApiProperty({
    description: 'User question for dialect differences, cultural context, and usage guidance',
    example: 'คำว่า กิ๋น, กิน, โสภ ต่างกันอย่างไร และคำไหนใช้ในบริบทไหน?',
  })
  @IsNotEmpty()
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'List of dialect entries or terms to explain',
    example: ['กิ๋น', 'กิน', 'โสภ'],
  })
  @IsOptional()
  @IsArray()
  entries?: any[];

  @ApiPropertyOptional({
    description: 'Underlying concept or standard Thai word',
    example: 'กิน',
  })
  @IsOptional()
  @IsString()
  concept?: string;
}
