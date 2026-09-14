import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { ITtsProvider, TtsSynthesizeOptions, TtsSynthesizeResult } from './tts.interface';
import { AiServiceTtsProvider } from './providers/ai-service-tts.provider';
import { LocalMockTtsProvider } from './providers/local-mock-tts.provider';

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);
  private readonly providers: ITtsProvider[];
  private readonly memoryCache = new Map<string, { result: TtsSynthesizeResult; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly aiServiceTtsProvider: AiServiceTtsProvider,
    private readonly localMockTtsProvider: LocalMockTtsProvider,
  ) {
    this.providers = [this.aiServiceTtsProvider, this.localMockTtsProvider];
  }

  private generateCacheKey(text: string, voice: string, speed: number): string {
    return crypto
      .createHash('sha256')
      .update(`${text.trim()}:${voice}:${speed.toFixed(2)}`)
      .digest('hex');
  }

  async synthesize(text: string, options?: TtsSynthesizeOptions): Promise<TtsSynthesizeResult> {
    const defaultVoice = this.config.get<string>('tts.voiceThai', 'th-TH-PremwadeeNeural');
    const voice = options?.voice || defaultVoice;
    const speed = options?.speed || 1.0;
    const cacheKey = this.generateCacheKey(text, voice, speed);

    // 1. Memory Cache Hit
    const memCached = this.memoryCache.get(cacheKey);
    if (memCached && Date.now() < memCached.expiresAt) {
      return { ...memCached.result, cached: true };
    }

    // 2. Database Cache Hit
    try {
      const dbCached = await this.prisma.ttsCache.findUnique({
        where: { cacheKey },
      });
      if (dbCached && dbCached.audioStoragePath) {
        const result: TtsSynthesizeResult = {
          audioBase64: dbCached.audioStoragePath,
          format: 'mp3',
          provider: `${dbCached.providerName}_DB_CACHE`,
          cached: true,
          durationMs: dbCached.durationMs || undefined,
        };
        this.memoryCache.set(cacheKey, { result, expiresAt: Date.now() + this.CACHE_TTL_MS });
        return result;
      }
    } catch (dbErr: any) {
      this.logger.debug(`TtsCache DB read skipped: ${dbErr?.message || dbErr}`);
    }

    // 3. Provider Sequence with Fallback
    let lastError: Error | null = null;
    for (const provider of this.providers) {
      try {
        const isAvail = await provider.isAvailable();
        if (!isAvail && provider !== this.localMockTtsProvider) {
          continue;
        }

        const synthesisResult = await provider.synthesize(text, { voice, speed });

        // Save to memory cache
        this.memoryCache.set(cacheKey, {
          result: synthesisResult,
          expiresAt: Date.now() + this.CACHE_TTL_MS,
        });

        // Save to Database Cache asynchronously
        this.saveToDbCache(cacheKey, text, synthesisResult.provider, voice, synthesisResult.audioBase64, synthesisResult.durationMs);

        return synthesisResult;
      } catch (err: any) {
        lastError = err;
        this.logger.warn(`Provider ${provider.name} failed for "${text}": ${err?.message || err}. Trying fallback.`);
      }
    }

    // Guaranteed Local Fallback if all else somehow failed
    return this.localMockTtsProvider.synthesize(text, { voice, speed });
  }

  private async saveToDbCache(
    cacheKey: string,
    text: string,
    providerName: string,
    voiceId: string,
    audioBase64: string,
    durationMs?: number,
  ): Promise<void> {
    try {
      await this.prisma.ttsCache.upsert({
        where: { cacheKey },
        update: { audioStoragePath: audioBase64, durationMs },
        create: {
          cacheKey,
          textContent: text,
          providerName,
          voiceId,
          audioStoragePath: audioBase64,
          durationMs,
        },
      });
    } catch (e: any) {
      this.logger.debug(`Failed to save TTS cache to DB: ${e?.message || e}`);
    }
  }

  async getStatus(): Promise<{ providers: { name: string; available: boolean }[]; activeDefault: string }> {
    const statuses = await Promise.all(
      this.providers.map(async (p) => ({
        name: p.name,
        available: await p.isAvailable(),
      })),
    );
    return {
      providers: statuses,
      activeDefault: this.config.get<string>('tts.activeProvider', 'AI_SERVICE'),
    };
  }
}
