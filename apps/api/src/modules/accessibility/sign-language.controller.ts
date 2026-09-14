import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AccessibilityService } from './accessibility.service';
import {
  CreateSignResourceDto,
  ContributeSignResourceDto,
  SignResourceResponseDto,
} from './dto/word-accessibility.dto';

@ApiTags('Thai Sign Language (TSL) Accessibility')
@Controller('api/v1/sign-language')
export class SignLanguageController {
  constructor(private readonly accessibilityService: AccessibilityService) {}

  @Get('resources/:word')
  @ApiOperation({ summary: 'Get structured Thai Sign Language motion data, representation, and provenance' })
  @ApiParam({ name: 'word', example: 'สวัสดี' })
  @ApiResponse({ status: 200, type: SignResourceResponseDto })
  async getSignResource(@Param('word') word: string): Promise<SignResourceResponseDto> {
    return this.accessibilityService.getSignResource(word);
  }

  @Post('resources')
  @ApiOperation({ summary: 'Admin/Internal: Register a new verified or demo sign language motion resource' })
  @ApiResponse({ status: 201 })
  async createResource(@Body() body: CreateSignResourceDto) {
    return this.accessibilityService.createSignResource(body);
  }

  @Post('contribute')
  @ApiOperation({ summary: 'Community: Suggest a trusted external sign language resource for expert review' })
  @ApiResponse({ status: 202 })
  async contributeResource(@Body() body: ContributeSignResourceDto) {
    return this.accessibilityService.contributeSignResource(body);
  }
}
