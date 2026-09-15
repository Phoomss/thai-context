import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ITtsProvider, TtsSynthesizeOptions, TtsSynthesizeResult } from '../tts.interface';

@Injectable()
export class AiServiceTtsProvider implements ITtsProvider {
  readonly name = 'AI_SERVICE_TTS';
  private readonly logger = new Logger(AiServiceTtsProvider.name);
  private readonly aiServiceUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: ConfigService) {
    this.aiServiceUrl = this.config.get<string>('aiServiceUrl', 'http://localhost:8000');
    this.timeoutMs = this.config.get<number>('tts.timeoutMs', 8000);
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await axios.get(`${this.aiServiceUrl}/health`, { timeout: 1000 });
      return res.status === 200;
    } catch {
      return false;
    }
  }

  async synthesize(text: string, options?: TtsSynthesizeOptions): Promise<TtsSynthesizeResult> {
    try {
      const res = await axios.post(
        `${this.aiServiceUrl}/ai/tts-synthesize`,
        {
          text,
          voice: options?.voice || this.config.get<string>('tts.voiceThai', 'th-TH-PremwadeeNeural'),
          speed: options?.speed || 1.0,
        },
        { timeout: this.timeoutMs }
      );
      return {
        audioBase64: res.data.audio_base64,
        format: res.data.format || 'mp3',
        provider: this.name,
        cached: Boolean(res.data.cached),
        durationMs: res.data.duration_ms,
      };
    } catch (err: any) {
      this.logger.warn(`AI Service TTS call failed: ${err?.message || err}. Falling back.`);
      throw err;
    }
  }
}
