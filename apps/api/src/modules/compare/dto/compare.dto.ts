import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, ArrayMaxSize, IsString } from 'class-validator';

export class CompareWordsDto {
  @ApiProperty({
    example: ['อนุมัติ', 'เห็นชอบ'],
    description: 'Array of 2 to 5 words to compare',
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  words: string[];
}
