import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'The search query executed by the user', example: 'ทำงานได้ดี ใช้เวลาน้อย' })
  @Transform(({ value, obj }) => (value ?? obj?.query ?? '').trim())
  @IsNotEmpty({ message: 'queryText or query must not be empty' })
  @IsString()
  queryText: string;

  @ApiPropertyOptional({ description: 'Alternative alias for queryText', example: 'ทำงานได้ดี' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'The recommended word selected by the user', example: 'ประสิทธิภาพ' })
  @Transform(({ value, obj }) => (value ?? obj?.selectedWord ?? '')?.trim() || undefined)
  @IsOptional()
  @IsString()
  recommendedWord?: string;

  @ApiPropertyOptional({ description: 'Alternative alias for recommendedWord', example: 'ประสิทธิภาพ' })
  @IsOptional()
  @IsString()
  selectedWord?: string;

  @ApiProperty({ description: 'User action taken', example: 'THUMBS_UP', enum: ['CLICK', 'COPY', 'THUMBS_UP', 'THUMBS_DOWN'] })
  @Transform(({ value, obj }) => {
    if (value) return value;
    if (typeof obj?.relevanceScore === 'number') {
      return obj.relevanceScore > 0 ? 'THUMBS_UP' : 'THUMBS_DOWN';
    }
    return value;
  })
  @IsNotEmpty({ message: 'userAction or relevanceScore must be provided' })
  @IsIn(['CLICK', 'COPY', 'THUMBS_UP', 'THUMBS_DOWN'])
  userAction: string;

  @ApiPropertyOptional({ description: 'Relevance score (-1, 1, or 1 to 5)', example: 1 })
  @IsOptional()
  relevanceScore?: number;

  @ApiPropertyOptional({ description: 'User rating from 1 to 5', example: 5 })
  @Transform(({ value, obj }) => {
    if (typeof value === 'number') return value;
    if (typeof obj?.relevanceScore === 'number') {
      if (obj.relevanceScore === 1) return 5;
      if (obj.relevanceScore === -1) return 1;
      return Math.min(Math.max(Math.round(obj.relevanceScore), 1), 5);
    }
    return value;
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'User comments or notes', example: 'แนะนำได้ตรงใจมาก' })
  @Transform(({ value, obj }) => (value ?? obj?.userComment ?? '')?.trim() || undefined)
  @IsOptional()
  @IsString()
  feedbackNotes?: string;

  @ApiPropertyOptional({ description: 'Alternative alias for feedbackNotes', example: 'แนะนำได้ตรงใจมาก' })
  @IsOptional()
  @IsString()
  userComment?: string;

  @ApiPropertyOptional({ description: 'Client session identifier', example: 'sess_abc123' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
