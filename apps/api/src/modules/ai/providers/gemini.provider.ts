import { Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  AIModel,
  AIRequest,
  AIResponse,
  StructuredAIRequest,
  AIStreamChunk,
} from './ai-model.interface';
import { ModelPolicy } from '../router/model-policy.interface';
import { AITelemetryService } from '../telemetry/ai-telemetry.service';
import { ModelTier } from '../router/model-tier.enum';

export class GeminiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly isTransient: boolean = false,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

export class GeminiProvider implements AIModel {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly axiosClient: AxiosInstance;

  constructor(
    public readonly modelName: string,
    public readonly tier: string,
    private readonly apiKey: string,
    private readonly policy: ModelPolicy,
    private readonly telemetryService?: AITelemetryService,
  ) {
    this.axiosClient = axios.create({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      timeout: policy.timeoutMs || 30000,
    });
  }

  private sanitizeMessage(msg: string): string {
    if (!this.apiKey) return msg;
    return msg.split(this.apiKey).join('[REDACTED_API_KEY]');
  }

  private isTransientStatus(status?: number): boolean {
    if (!status) return true; // network error / timeout
    return [429, 500, 502, 503, 504].includes(status);
  }

  private async sleepWithBackoff(attempt: number): Promise<void> {
    const baseDelay = 500;
    const maxDelay = 4000;
    const exponential = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
    const jitter = Math.random() * 200;
    await new Promise((resolve) => setTimeout(resolve, exponential + jitter));
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const maxRetries: number = Number(request.metadata?.maxRetries ?? this.policy.maxRetries ?? 3);
    let retryCount = 0;


    // Offline / Mock mode if no API key is provided
    if (!this.apiKey || this.apiKey.trim() === '' || this.apiKey === 'MOCK_KEY') {
      const mockResult = this.generateMockCompletion(request);
      const latencyMs = Date.now() - startTime;
      const usage = {
        inputTokens: Math.max(20, request.userPrompt.length / 2),
        outputTokens: Math.max(30, mockResult.length / 2),
        totalTokens: Math.max(50, (request.userPrompt.length + mockResult.length) / 2),
      };

      if (this.telemetryService) {
        this.telemetryService.recordUsage({
          requestId: (request.metadata?.requestId as string) || `req-${Date.now()}`,
          agent: (request.metadata?.agent as string) || 'GENERIC',
          tier: this.policy.tier,
          model: this.modelName,
          latencyMs,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          retryCount: 0,
          fallback: false,
        });
      }

      return {
        text: mockResult,
        model: this.modelName,
        usage,
        latencyMs,
        finishReason: 'STOP',
      };
    }

    const endpoint = `/models/${this.modelName}:generateContent`;
    const contents: any[] = [];

    if (request.systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: `System instruction:\n${request.systemPrompt}` }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: request.userPrompt }],
    });

    const body: any = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? this.policy.temperature ?? 0.2,
        maxOutputTokens: request.maxOutputTokens ?? this.policy.maxOutputTokens ?? 2048,
      },
    };

    if (request.responseSchema) {
      body.generationConfig.responseMimeType = 'application/json';
      body.generationConfig.responseSchema = request.responseSchema;
    }

    while (true) {
      try {
        const response = await this.axiosClient.post(endpoint, body, {
          params: { key: this.apiKey },
          headers: { 'Content-Type': 'application/json' },
        });

        const latencyMs = Date.now() - startTime;
        const candidate = response.data.candidates?.[0];
        const text = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';
        const usageMetadata = response.data.usageMetadata;
        const usage = {
          inputTokens: usageMetadata?.promptTokenCount || 0,
          outputTokens: usageMetadata?.candidatesTokenCount || 0,
          totalTokens: usageMetadata?.totalTokenCount || 0,
        };

        if (this.telemetryService) {
          this.telemetryService.recordUsage({
            requestId: (request.metadata?.requestId as string) || `req-${Date.now()}`,
            agent: (request.metadata?.agent as string) || 'GENERIC',
            tier: this.policy.tier,
            model: this.modelName,
            latencyMs,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
            retryCount,
            fallback: false,
          });
        }

        return {
          text,
          model: this.modelName,
          usage,
          latencyMs,
          finishReason: candidate?.finishReason || 'STOP',
        };
      } catch (err: any) {
        const status = err.response?.status;
        const isTransient = this.isTransientStatus(status) || err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT';
        const rawErrMsg = err.response?.data?.error?.message || err.message || 'Gemini API Error';
        const sanitizedErr = this.sanitizeMessage(rawErrMsg);

        if (isTransient && retryCount < maxRetries) {
          retryCount++;
          this.logger.warn(`Gemini transient error (status ${status}) on ${this.modelName}, retry attempt ${retryCount}/${maxRetries}...`);
          await this.sleepWithBackoff(retryCount);
          continue;
        }

        if (this.telemetryService) {
          this.telemetryService.recordUsage({
            requestId: (request.metadata?.requestId as string) || `req-${Date.now()}`,
            agent: (request.metadata?.agent as string) || 'GENERIC',
            tier: this.policy.tier,
            model: this.modelName,
            latencyMs: Date.now() - startTime,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            retryCount,
            fallback: false,
            error: sanitizedErr,
          });
        }

        throw new GeminiError(sanitizedErr, status, isTransient, err.code);
      }
    }
  }

  async generateStructured<T>(request: StructuredAIRequest<T>): Promise<T> {
    const jsonReq: AIRequest = {
      ...request,
      systemPrompt: (request.systemPrompt ? request.systemPrompt + '\n\n' : '') +
        'CRITICAL: You must return STRICT, VALID JSON only. Do not include markdown formatting codeblocks or preamble.',
    };

    const response = await this.generateText(jsonReq);
    let cleaned = response.text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();

    try {
      if (request.parser) {
        return request.parser(cleaned);
      }
      return JSON.parse(cleaned) as T;
    } catch (parseErr: any) {
      this.logger.warn(`Failed to parse structured response from ${this.modelName}: ${parseErr.message}`);
      throw new GeminiError(`Invalid JSON generated by model: ${parseErr.message}`, 422, false, 'PARSE_ERROR');
    }
  }

  async *generateStream(request: AIRequest): AsyncIterable<AIStreamChunk> {
    if (!this.apiKey || this.apiKey.trim() === '' || this.apiKey === 'MOCK_KEY') {
      const mockResult = this.generateMockCompletion(request);
      const chunks = mockResult.split('\n');
      for (const chunk of chunks) {
        yield {
          text: chunk + '\n',
          model: this.modelName,
          finishReason: 'CONTINUE',
        };
      }
      yield {
        text: '',
        model: this.modelName,
        finishReason: 'STOP',
        usage: {
          inputTokens: Math.max(15, request.userPrompt.length / 2),
          outputTokens: Math.max(25, mockResult.length / 2),
          totalTokens: Math.max(40, (request.userPrompt.length + mockResult.length) / 2),
        },
      };
      return;
    }

    const endpoint = `/models/${this.modelName}:streamGenerateContent?alt=sse&key=${this.apiKey}`;
    const contents: any[] = [];

    if (request.systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: `System instruction:\n${request.systemPrompt}` }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: request.userPrompt }],
    });

    const body: any = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? this.policy.temperature ?? 0.2,
        maxOutputTokens: request.maxOutputTokens ?? this.policy.maxOutputTokens ?? 2048,
      },
    };

    try {
      const response = await this.axiosClient.post(endpoint, body, {
        responseType: 'stream',
        headers: { 'Content-Type': 'application/json' },
      });

      let buffer = '';
      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.substring(6).trim();
            if (rawData === '[DONE]') continue;
            try {
              const parsed = JSON.parse(rawData);
              const partText = parsed.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';
              if (partText) {
                yield {
                  text: partText,
                  model: this.modelName,
                  finishReason: parsed.candidates?.[0]?.finishReason,
                };
              }
            } catch {
              // Ignore partial JSON chunk line
            }
          }
        }
      }
    } catch (err: any) {
      const status = err.response?.status;
      const isTransient = this.isTransientStatus(status);
      const sanitized = this.sanitizeMessage(err.message || 'Stream error');
      throw new GeminiError(sanitized, status, isTransient);
    }
  }

  private generateMockCompletion(request: AIRequest): string {
    const p = request.userPrompt;
    if (p.includes('ทำงานได้ดี') || p.includes('ประสิทธิภาพ')) {
      return JSON.stringify({
        recommendations: [
          {
            word: 'ประสิทธิภาพ',
            score: 0.95,
            definition: 'ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด',
            reason: 'ตรงกับแนวคิดการทำงานที่ให้ผลดีโดยใช้ทรัพยากรอย่างคุ้มค่า',
          },
          {
            word: 'ประสิทธิผล',
            score: 0.88,
            definition: 'ผลสำเร็จที่เกิดขึ้นตามเป้าหมายที่ตั้งไว้',
            reason: 'เหมาะกับบริบทที่เน้นผลสัมฤทธิ์ปลายทาง',
          },
        ],
      });
    }

    if (p.includes('เกรงใจ')) {
      return JSON.stringify({
        word: 'เกรงใจ',
        english_translation: 'Considerate / Mindful of others',
        english_explanation: 'Deep social awareness to avoid imposing upon or inconveniencing another person.',
        pronunciation: 'kreeŋ-jai',
        transliteration: 'krengchai',
        cultural_context: 'A cornerstone of Thai social harmony and interpersonal respect.',
        example: 'คนไทยมักมีความเกรงใจในการรบกวนผู้อื่น',
      });
    }

    if (p.includes('เปรียบเทียบ') || p.includes('ต่างกัน')) {
      return JSON.stringify({
        difference_summary: 'ประสิทธิภาพ (Efficiency) เน้นความคุ้มค่าของปัจจัยนำเข้า ในขณะที่ ประสิทธิผล (Effectiveness) เน้นความสำเร็จตามวัตถุประสงค์',
        guidance: 'ใช้ประสิทธิภาพเมื่อพูดถึงกระบวนการและการจัดสรรทรัพยากร ใช้ประสิทธิผลเมื่อพูดถึงการบรรลุเป้าหมาย',
      });
    }

    return `คำตอบเชิงภาษาศาสตร์สำหรับ: "${p}" อิงตามมาตรฐานพจนานุกรมและหลักภาษาไทย`;
  }
}
