import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CompareWordsDto {
  @ApiProperty({
    example: ['อนุมัติ', 'เห็นชอบ'],
    description: 'Array of 2 to 5 words to compare',
  })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((word) => (typeof word === 'string' ? word.trim() : word))
      : value,
  )
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(5)
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(100, { each: true })
  @Matches(/[\u0E00-\u0E7F]/u, {
    each: true,
    message: 'each word must contain Thai text',
  })
  words: string[];
}
