import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModelTier } from './model-tier.enum';
import { ModelPolicy } from './model-policy.interface';
import { ModelPolicyService } from './model-policy.service';
import { ModelOverrideService } from './model-override.service';
import { AIModel, AIStreamChunk } from '../providers/ai-model.interface';
import { GeminiProvider, GeminiError } from '../providers/gemini.provider';
import { AITelemetryService } from '../telemetry/ai-telemetry.service';

export interface IModelRouter {
  resolve(tier: ModelTier, options?: Partial<ModelPolicy>): AIModel;
  executeWithFallback<T>(
    tier: ModelTier,
    agentName: string,
    operation: (model: AIModel, activeTier: ModelTier) => Promise<T>,
  ): Promise<T>;
  executeStreamWithFallback(
    tier: ModelTier,
    agentName: string,
    operation: (model: AIModel, activeTier: ModelTier) => AsyncIterable<AIStreamChunk>,
  ): AsyncIterable<AIStreamChunk>;
}

@Injectable()
export class ModelRouter implements IModelRouter {
  private readonly logger = new Logger(ModelRouter.name);
  private readonly apiKey: string;
  private readonly enableFallback: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly policyService: ModelPolicyService,
    private readonly overrideService: ModelOverrideService,
    private readonly telemetryService: AITelemetryService,
  ) {
    this.apiKey = this.configService.get<string>('gemini.apiKey') || '';
    this.enableFallback = this.configService.get<boolean>('gemini.enableFallback') ?? true;
  }

  resolve(tier: ModelTier, options?: Partial<ModelPolicy>): AIModel {
    const basePolicy = this.policyService.getPolicy(tier);
    const policy: ModelPolicy = {
      ...basePolicy,
      ...options,
      tier,
    };

    // Never log full secrets or API keys
    this.logger.debug(
      `Resolving model provider for tier [${tier}] -> model [${policy.modelName}] (maxTokens: ${policy.maxOutputTokens}, temp: ${policy.temperature})`,
    );

    return new GeminiProvider(
      policy.modelName,
      policy.tier,
      this.apiKey,
      policy,
      this.telemetryService,
    );
  }

  async executeWithFallback<T>(
    tier: ModelTier,
    agentName: string,
    operation: (model: AIModel, activeTier: ModelTier) => Promise<T>,
  ): Promise<T> {
    const activeTier = this.overrideService.resolveTier(agentName, tier);
    const currentModel = this.resolve(activeTier);

    try {
      return await operation(currentModel, activeTier);
    } catch (err: any) {
      const isTransient =
        err instanceof GeminiError
          ? err.isTransient
          : [429, 500, 502, 503, 504].includes(err.status) || err.code === 'ECONNABORTED';

      const policy = this.policyService.getPolicy(activeTier);
      const fallbackTier = policy.fallbackTier;

      if (this.enableFallback && isTransient && fallbackTier && fallbackTier !== activeTier) {
        const fallbackReason =
          err.status === 429
            ? 'RATE_LIMIT'
            : err.status >= 500
              ? 'SERVICE_UNAVAILABLE'
              : 'TIMEOUT_OR_NETWORK';

        this.logger.warn(
          JSON.stringify({
            event: 'model_fallback',
            agent: agentName,
            from: activeTier,
            to: fallbackTier,
            reason: fallbackReason,
            error: err.message,
          }),
        );

        const fallbackModel = this.resolve(fallbackTier);
        return await operation(fallbackModel, fallbackTier);
      }

      // Non-transient errors (400, 401, 403, validation) are rethrown immediately without fallback
      throw err;
    }
  }

  async *executeStreamWithFallback(
    tier: ModelTier,
    agentName: string,
    operation: (model: AIModel, activeTier: ModelTier) => AsyncIterable<AIStreamChunk>,
  ): AsyncIterable<AIStreamChunk> {
    const activeTier = this.overrideService.resolveTier(agentName, tier);
    const currentModel = this.resolve(activeTier);

    try {
      for await (const chunk of operation(currentModel, activeTier)) {
        yield chunk;
      }
    } catch (err: any) {
      const isTransient =
        err instanceof GeminiError
          ? err.isTransient
          : [429, 500, 502, 503, 504].includes(err.status) || err.code === 'ECONNABORTED';

      const policy = this.policyService.getPolicy(activeTier);
      const fallbackTier = policy.fallbackTier;

      if (this.enableFallback && isTransient && fallbackTier && fallbackTier !== activeTier) {
        const fallbackReason = err.status === 429 ? 'RATE_LIMIT' : 'PROVIDER_ERROR';
        this.logger.warn(
          JSON.stringify({
            event: 'model_fallback',
            agent: agentName,
            from: activeTier,
            to: fallbackTier,
            reason: fallbackReason,
            stream: true,
          }),
        );

        const fallbackModel = this.resolve(fallbackTier);
        for await (const chunk of operation(fallbackModel, fallbackTier)) {
          yield chunk;
        }
        return;
      }

      throw err;
    }
  }
}
