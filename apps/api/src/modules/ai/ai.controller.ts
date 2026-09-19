import { Controller, Post, Get, Delete, Body, Res, Req, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { Response, Request } from 'express';
import { AIService } from './ai.service';
import { WorkspaceOrchestratorService } from './workspace/workspace-orchestrator.service';
import { WorkspaceResponseDto } from './workspace/workspace.types';
import { ModelPolicyService } from './router/model-policy.service';
import { ModelOverrideService } from './router/model-override.service';
import { AITelemetryService } from './telemetry/ai-telemetry.service';
import { AIOrchestratorService } from './orchestrator/ai-orchestrator.service';
import { ModelTier } from './router/model-tier.enum';

export class ChatDto {
  @ApiProperty({
    example: 'คำว่า ประสิทธิภาพ ใช้ในรายงานวิชาการได้ไหม',
    description: 'Message to the RAG AI writing assistant',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    example: 'ประสิทธิภาพ',
    description: 'Target Thai word (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  word?: string;

  @ApiProperty({
    example: 'academic',
    description: 'Context: academic, business, formal, casual, legal, general (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  context?: string;
}

export class WorkspaceContextDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  audience?: string;
}

export class WorkspaceApiDto {
  @ApiProperty({
    example: 'หาคำที่หมายถึงทำงานได้ดีและใช้ทรัพยากรน้อย',
    description: 'User intent or message to workspace',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  session_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  context?: WorkspaceContextDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  current_text?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  selected_words?: string[];
}

export class QuirkifyDto {
  @ApiProperty({
    example: 'วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว',
    description: 'Original Thai sentence (1-300 chars)',
  })
  @IsNotEmpty()
  @IsString()
  sentence: string;

  @ApiProperty({
    example: 'ancient',
    description: 'Target style: ancient | formal | meme | literary | dialect | poetic | gentle',
    required: false,
  })
  @IsOptional()
  @IsString()
  style?: string;

  @ApiProperty({
    example: 'quirkify',
    description: 'Mode: quirkify (make quirky) | beautify (reverse: make beautiful)',
    required: false,
  })
  @IsOptional()
  @IsString()
  mode?: string;
}

@ApiTags('AI Assistant')
@Controller('api/v1/ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly workspaceOrchestrator: WorkspaceOrchestratorService,
    private readonly policyService: ModelPolicyService,
    private readonly overrideService: ModelOverrideService,
    private readonly telemetryService: AITelemetryService,
    private readonly aiOrchestrator: AIOrchestratorService,
  ) {}

  @Get('models')
  @ApiOperation({ summary: 'List active model tier policies and Gemini configuration' })
  async getModels() {
    return {
      policies: this.policyService.getAllPolicies(),
      overrides: this.overrideService.getOverrides(),
    };
  }

  @Get('telemetry')
  @ApiOperation({ summary: 'Get AI telemetry metrics and usage summary' })
  async getTelemetry() {
    return this.telemetryService.getMetricsSummary();
  }

  @Post('admin/override')
  @ApiOperation({ summary: 'Set administrative model tier override' })
  async setOverride(
    @Body() body: { globalTier?: ModelTier | null; agent?: string; agentTier?: ModelTier | null },
  ) {
    if (body.globalTier !== undefined) {
      this.overrideService.setGlobalOverride(body.globalTier);
    }
    if (body.agent && body.agentTier !== undefined) {
      this.overrideService.setAgentOverride(body.agent, body.agentTier);
    }
    return {
      success: true,
      overrides: this.overrideService.getOverrides(),
    };
  }

  @Delete('admin/override')
  @ApiOperation({ summary: 'Clear administrative model tier overrides' })
  async clearOverride() {
    this.overrideService.clearOverrides();
    return { success: true, message: 'All model tier overrides cleared' };
  }

  @Post('orchestrator')
  @ApiOperation({ summary: 'Execute multi-agent orchestration via Model Router' })
  async orchestrate(@Body() body: WorkspaceApiDto) {
    return this.aiOrchestrator.orchestrate({
      message: body.message,
      sessionId: body.session_id,
      context: body.context,
      currentText: body.current_text,
      selectedWords: body.selected_words,
    });
  }

  @Post('orchestrator/stream')
  @ApiOperation({ summary: 'Stream multi-agent orchestration SSE events' })
  async orchestrateStream(
    @Body() body: WorkspaceApiDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const abortController = new AbortController();
    req.on('close', () => abortController.abort());

    try {
      for await (const sse of this.aiOrchestrator.streamOrchestrate({
        message: body.message,
        sessionId: body.session_id,
        context: body.context,
        currentText: body.current_text,
        selectedWords: body.selected_words,
      })) {
        if (abortController.signal.aborted) break;
        res.write(`event: ${sse.event}\ndata: ${JSON.stringify(sse.data)}\n\n`);
      }
      res.end();
    } catch (err: any) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: err.message || 'Stream error' })}\n\n`);
      res.end();
    }
  }


  @Post('quirkify')
  @ApiOperation({ summary: 'Transform ordinary sentence into quirky linguistic paraphrase' })
  @ApiResponse({ status: 200, description: 'Quirkified sentence and grounded word mappings' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async quirkify(@Body() body: QuirkifyDto) {
    return this.aiService.quirkify(body);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat with Grounded RAG AI Assistant (Synchronous)' })
  @ApiResponse({ status: 200, description: 'AI answer with verified dictionary evidence and confidence metrics' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async chat(@Body() body: ChatDto) {
    return this.aiService.chatRAG(body);
  }

  @Post('chat/stream')
  @ApiOperation({ summary: 'Chat with Grounded RAG AI Assistant (SSE Streaming)' })
  @ApiResponse({ status: 200, description: 'Server-Sent Events stream emitting start, token, evidence, and complete' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async chatStream(
    @Body() body: ChatDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const abortController = new AbortController();
    req.on('close', () => {
      abortController.abort();
    });

    await this.aiService.streamChatRAG(body, res, abortController.signal);
  }

  @Post('workspace')
  @ApiOperation({ summary: 'Process multi-agent query in Thai Context AI Language Workspace' })
  @ApiResponse({ status: 200, description: 'Structured response with recommendations, comparison, writing, language check, and traces' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async workspace(@Body() body: WorkspaceApiDto): Promise<WorkspaceResponseDto> {
    return this.workspaceOrchestrator.process(body);
  }

  @Post('workspace/stream')
  @ApiOperation({ summary: 'Stream multi-agent workspace workflow and tokens via SSE' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async workspaceStream(
    @Body() body: WorkspaceApiDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const abortController = new AbortController();
    req.on('close', () => {
      abortController.abort();
    });

    try {
      res.write(`data: ${JSON.stringify({ type: 'start', message: 'เริ่มกระบวนการ AI Language Workspace' })}\n\n`);

      const result = await this.workspaceOrchestrator.process(body);

      // Emit traces as agents progress
      for (const trace of result.agent_traces) {
        res.write(`data: ${JSON.stringify({ type: 'trace', trace })}\n\n`);
      }

      // Stream answer tokens in chunks
      const chunkSize = 25;
      for (let i = 0; i < result.answer.length; i += chunkSize) {
        if (abortController.signal.aborted) break;
        const chunk = result.answer.substring(i, i + chunkSize);
        res.write(`data: ${JSON.stringify({ type: 'token', token: chunk })}\n\n`);
      }

      // Emit full final payload
      res.write(`data: ${JSON.stringify({ type: 'complete', result })}\n\n`);
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: err.message || 'Workspace processing error' })}\n\n`);
      res.end();
    }
  }
}
