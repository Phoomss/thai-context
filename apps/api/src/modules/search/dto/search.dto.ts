import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class KeywordSearchQueryDto {
  @ApiProperty({ description: 'Search term (word or part of word or definition text)', example: 'ประสิทธิภาพ' })
  @IsNotEmpty()
  @IsString()
  q: string;

  @ApiPropertyOptional({ description: 'Filter by dictionary edition year (e.g. 2542, 2554, 2569)', example: '2554' })
  @IsOptional()
  @IsString()
  edition?: string;

  @ApiPropertyOptional({ description: 'Filter by source code (e.g. ROYAL_SOCIETY, DIALECT_INSTITUTE)', example: 'ROYAL_SOCIETY' })
  @IsOptional()
  @IsString()
  source?: string;
}

export class MeaningSearchDto {
  @ApiProperty({
    description: 'Natural language description of desired meaning',
    example: 'ทำงานได้ดี ใช้เวลาและทรัพยากรน้อย',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  query: string;
}

export class ContextSearchDto {
  @ApiProperty({
    description: 'Natural language query, potentially with constraints or excluded words',
    example: 'อยากบอกว่าทำงานเร็ว แต่ไม่อยากใช้คำว่าเร็ว',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  query: string;

  @ApiPropertyOptional({
    description: 'Target context or register (e.g. รายงานมหาวิทยาลัย, ภาษาทางการ)',
    example: 'รายงานมหาวิทยาลัย',
  })
  @IsOptional()
  @IsString()
  context?: string;
}
