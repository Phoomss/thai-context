import { IsString, IsOptional, IsInt, Min, Max, IsEnum, IsUrl, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QueryModernVocabularyDto {
  @ApiPropertyOptional({ description: 'Category filter (e.g. AI, TECHNOLOGY, SOCIAL_MEDIA)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Term type filter (e.g. WORD, SLANG, TECHNICAL_TERM, BORROWED_WORD)' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Status filter (e.g. EMERGING, COMMON, TRENDING, SLANG)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Register filter (e.g. FORMAL, SEMI_FORMAL, NEUTRAL, INFORMAL, SLANG, SPECIALIZED)' })
  @IsOptional()
  @IsString()
  register?: string;

  @ApiPropertyOptional({ description: 'Origin filter (e.g. THAI, ENGLISH_BORROWING, INTERNET, COMMUNITY)' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ description: 'Search term substring or keyword' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Limit per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class SuggestModernTermDto {
  @ApiProperty({ description: 'Term or phrase to suggest', example: 'เจนแซด' })
  @IsString()
  @Length(1, 255)
  term: string;

  @ApiProperty({ description: 'Definition or meaning', example: 'คนรุ่น Generation Z' })
  @IsString()
  @Length(3, 2000)
  definition: string;

  @ApiPropertyOptional({ description: 'Usage context or register', example: 'Social Media / Youth' })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiPropertyOptional({ description: 'Example sentence', example: 'เจนแซดให้ความสำคัญกับสมดุลชีวิตและการทำงาน' })
  @IsOptional()
  @IsString()
  example?: string;

  @ApiPropertyOptional({ description: 'Category', example: 'YOUTH' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Source name where term was encountered', example: 'บทความการตลาดออนไลน์' })
  @IsOptional()
  @IsString()
  sourceName?: string;

  @ApiPropertyOptional({ description: 'URL reference if available', example: 'https://example.com/article' })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'Submitter name or handle' })
  @IsOptional()
  @IsString()
  submitterName?: string;

  @ApiPropertyOptional({ description: 'Submitter contact email' })
  @IsOptional()
  @IsString()
  submitterEmail?: string;
}

export class ReviewSubmissionDto {
  @ApiProperty({ description: 'Review notes from editor' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
