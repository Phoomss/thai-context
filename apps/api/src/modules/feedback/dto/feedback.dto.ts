import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'The search query executed by the user', example: 'ทำงานได้ดี ใช้เวลาน้อย' })
  @IsNotEmpty()
  @IsString()
  queryText: string;

  @ApiPropertyOptional({ description: 'The recommended word selected by the user', example: 'ประสิทธิภาพ' })
  @IsOptional()
  @IsString()
  recommendedWord?: string;

  @ApiProperty({ description: 'User action taken', example: 'CLICK', enum: ['CLICK', 'COPY', 'THUMBS_UP', 'THUMBS_DOWN'] })
  @IsNotEmpty()
  @IsIn(['CLICK', 'COPY', 'THUMBS_UP', 'THUMBS_DOWN'])
  userAction: string;

  @ApiPropertyOptional({ description: 'User rating from 1 to 5', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'User comments or notes', example: 'แนะนำได้ตรงใจมาก' })
  @IsOptional()
  @IsString()
  feedbackNotes?: string;

  @ApiPropertyOptional({ description: 'Client session identifier', example: 'sess_abc123' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
