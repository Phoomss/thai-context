import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TtsSynthesizeDto {
  @ApiProperty({ description: 'Text or headword to synthesize into speech', example: 'ประสิทธิภาพ' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({ description: 'Voice identifier', example: 'th-TH-PremwadeeNeural' })
  @IsString()
  @IsOptional()
  voice?: string;

  @ApiPropertyOptional({ description: 'Speech rate speed (0.5 to 2.0)', example: 1.0 })
  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  @IsOptional()
  speed?: number;
}
