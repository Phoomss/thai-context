import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class PronunciationItemDto {
  @ApiProperty({ example: 'ประ-สิด-ทิ-พาบ' })
  phoneticSpelling: string;

  @ApiProperty({ example: 'pra-sit-thi-phap' })
  transliterationRtgs: string;

  @ApiPropertyOptional({ example: 'praʔ˨˩.sit̚˨˩.tʰi˦˥.pʰaːp̚˥˩' })
  ipaNotation?: string;

  @ApiPropertyOptional({ example: 'L-L-H-L' })
  tonePattern?: string;

  @ApiProperty({ example: ['pra', 'sit', 'thi', 'phap'] })
  syllables: string[];

  @ApiProperty({ example: 'OFFICIAL_DATA' })
  sourceType: string;
}

export class TranslationItemDto {
  @ApiProperty({ example: 'efficiency' })
  translatedWord: string;

  @ApiProperty({ example: 'en' })
  languageCode: string;

  @ApiPropertyOptional({ example: ['competence', 'productivity'] })
  secondaryTranslations?: string[];

  @ApiPropertyOptional({ example: 'The capacity to deliver maximum productive output with least consumption of inputs.' })
  contextualExplanation?: string;

  @ApiPropertyOptional({ example: 'Formal administrative register.' })
  usageNuance?: string;

  @ApiProperty({ example: 'OFFICIAL_CURATED' })
  provenance: string;

  @ApiPropertyOptional({ example: 1.0 })
  confidenceScore?: number;
}

export class SignMediaDto {
  @ApiProperty({ example: 'VIDEO_MP4' })
  mediaType: string;

  @ApiProperty({ example: 'https://assets.thai-context.org/tsl/videos/prasitthiphap.mp4' })
  mediaUrl: string;

  @ApiPropertyOptional({ example: 'https://assets.thai-context.org/tsl/thumbs/prasitthiphap.jpg' })
  thumbnailUrl?: string;

  @ApiProperty({ example: true })
  isPrimary: boolean;
}

export class SignLanguageEntryDto {
  @ApiProperty({ example: 'ประสิทธิภาพ' })
  signName: string;

  @ApiPropertyOptional({ example: 'มือขวาตั้งนิ้วชี้และนิ้วกลาง หมุนวนเป็นเกลียวไปข้างหน้าแล้วประกบฝ่ามือซ้าย' })
  handshapeDescription?: string;

  @ApiProperty({ example: 'CENTRAL' })
  dialectRegion: string;

  @ApiProperty({ example: 'OFFICIAL' })
  verificationStatus: string;

  @ApiPropertyOptional({ example: 'วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล' })
  sourceAttribution?: string;

  @ApiPropertyOptional({ example: 'CC-BY-SA 4.0' })
  license?: string;

  @ApiProperty({ type: [SignMediaDto] })
  media: SignMediaDto[];
}

export class BrailleCellDto {
  @ApiProperty({ example: 'ป' })
  char: string;

  @ApiProperty({ example: '⠏' })
  braille: string;

  @ApiProperty({ example: [1, 2, 3, 4] })
  dots: number[];

  @ApiProperty({ example: 'consonant' })
  role: string;

  @ApiProperty({ example: 'ป. ปลา (จุด 1-2-3-4)' })
  description: string;
}

export class BrailleResponseDto {
  @ApiProperty({ example: 'ประสิทธิภาพ' })
  word: string;

  @ApiProperty({ example: '⠏⠗⠁⠎⠊⠾⠾⠊⠯⠣⠯' })
  brailleUnicode: string;

  @ApiProperty({ type: [BrailleCellDto] })
  brailleCells: BrailleCellDto[];

  @ApiPropertyOptional({
    example: 'สะกดอักษรเบรลล์: ป (⠏, จุด 1-2-3-4) + ร (⠗, จุด 1-2-3-5)...',
  })
  readingGuide?: string;

  @ApiPropertyOptional({ example: 'ประสิทธิภาพ' })
  audioText?: string;

  @ApiPropertyOptional({ example: 'สมาคมคนตาบอดแห่งประเทศไทย' })
  sourceAttribution?: string;

  @ApiProperty({ example: 'OFFICIAL' })
  verificationStatus: string;
}

export class WordAccessibilityResponseDto {
  @ApiProperty({ example: 'ประสิทธิภาพ' })
  headword: string;

  @ApiProperty({ type: PronunciationItemDto })
  pronunciation: PronunciationItemDto;

  @ApiProperty({ type: [TranslationItemDto] })
  translations: TranslationItemDto[];

  @ApiProperty({ type: [SignLanguageEntryDto] })
  signLanguage: SignLanguageEntryDto[];

  @ApiPropertyOptional({ type: BrailleResponseDto })
  braille?: BrailleResponseDto;

  @ApiProperty({
    example: {
      supported: true,
      synthesizeEndpoint: '/api/v1/tts/synthesize',
    },
  })
  tts: {
    supported: boolean;
    synthesizeEndpoint: string;
  };
}

export class DecodeBrailleRequestDto {
  @ApiProperty({ example: '⠏⠇⠣' })
  @IsString()
  @IsNotEmpty()
  braille: string;
}

export class DecodedBrailleCellDto {
  @ApiProperty({ example: '⠏' })
  braille: string;

  @ApiProperty({ example: [1, 2, 3, 4] })
  dots: number[];

  @ApiProperty({ example: 'ป' })
  char: string;

  @ApiPropertyOptional({ example: ['ฉ', 'ฌ'] })
  alternatives?: string[];

  @ApiProperty({ example: 'consonant' })
  role: string;

  @ApiProperty({ example: 'ป. ปลา (จุด 1-2-3-4)' })
  description: string;
}

export class DecodedBrailleResponseDto {
  @ApiProperty({ example: '⠏⠇⠣' })
  brailleInput: string;

  @ApiProperty({ example: 'ปลา' })
  decodedText: string;

  @ApiProperty({ type: [DecodedBrailleCellDto] })
  cells: DecodedBrailleCellDto[];

  @ApiProperty({ example: 'ถอดรหัสเป็นข้อความ: ป + ล (หรือ ฬ) + า' })
  readingGuide: string;

  @ApiProperty({ example: true })
  hasAmbiguity: boolean;
}

export class CreateSignResourceDto {
  @ApiProperty({ example: 'สวัสดี' })
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiPropertyOptional({ example: 'สวัสดี' })
  @IsOptional()
  @IsString()
  sign_name?: string;

  @ApiProperty({ example: 'MOTION' })
  @IsString()
  @IsNotEmpty()
  representation_type: string;

  @ApiPropertyOptional({ example: 'DEMO_DATA' })
  @IsOptional()
  @IsString()
  source_type?: string;

  @ApiPropertyOptional({ example: 'AUTHORIZED' })
  @IsOptional()
  @IsString()
  permission_status?: string;

  @ApiPropertyOptional({ example: 'VERIFIED' })
  @IsOptional()
  @IsString()
  verification_status?: string;

  @ApiPropertyOptional({ example: 'https://example.com/signs/samanachan' })
  @IsOptional()
  @IsString()
  source_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  motion_data?: any;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;
}

export class ContributeSignResourceDto {
  @ApiProperty({ example: 'สวัสดี' })
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiProperty({ example: 'https://example.com/tsl-source' })
  @IsString()
  @IsNotEmpty()
  source_url: string;

  @ApiPropertyOptional({ example: 'สมาคมคนหูหนวกแห่งประเทศไทย' })
  @IsOptional()
  @IsString()
  provider_name?: string;

  @ApiPropertyOptional({ example: 'มีบันทึกท่ามือชัดเจน' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SignResourceResponseDto {
  @ApiProperty({ example: 'VERIFIED' })
  status: string;

  @ApiProperty({ example: 'สวัสดี' })
  word: string;

  @ApiPropertyOptional()
  representation?: {
    type: string;
    data?: any;
  };

  @ApiPropertyOptional()
  source?: {
    type: string;
    name: string;
    url?: string;
    license?: string;
    permission_status?: string;
  };

  @ApiPropertyOptional()
  verification?: {
    status: string;
    verified_by?: string;
    notes?: string;
  };

  @ApiPropertyOptional()
  metadata?: any;

  @ApiPropertyOptional({ example: 'ยังไม่มีข้อมูลภาษามือไทยที่ผ่านการตรวจสอบ' })
  message?: string;
}

