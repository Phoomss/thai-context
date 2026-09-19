import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModelTier } from './model-tier.enum';
import { ModelPolicy } from './model-policy.interface';

@Injectable()
export class ModelPolicyService {
  private readonly policies: Map<ModelTier, ModelPolicy> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializePolicies();
  }

  private initializePolicies(): void {
    const fastModel = this.configService.get<string>('gemini.fastModel') || 'gemini-2.5-flash-lite';
    const standardModel = this.configService.get<string>('gemini.standardModel') || 'gemini-2.5-flash';
    const reasoningModel = this.configService.get<string>('gemini.reasoningModel') || 'gemini-2.5-pro';

    const maxRetries = this.configService.get<number>('gemini.maxRetries') || 3;
    const timeoutMs = this.configService.get<number>('gemini.timeoutMs') || 30000;
    const tempDefault = this.configService.get<number>('gemini.temperatureDefault') || 0.2;

    this.policies.set(ModelTier.FAST, {
      tier: ModelTier.FAST,
      modelName: fastModel,
      temperature: 0.1,
      maxOutputTokens: 1024,
      timeoutMs: Math.min(15000, timeoutMs),
      maxRetries,
      fallbackTier: ModelTier.STANDARD,
    });

    this.policies.set(ModelTier.STANDARD, {
      tier: ModelTier.STANDARD,
      modelName: standardModel,
      temperature: tempDefault,
      maxOutputTokens: 4096,
      timeoutMs,
      maxRetries,
      fallbackTier: ModelTier.REASONING,
    });

    this.policies.set(ModelTier.REASONING, {
      tier: ModelTier.REASONING,
      modelName: reasoningModel,
      temperature: 0.1,
      maxOutputTokens: 8192,
      timeoutMs: Math.max(60000, timeoutMs),
      maxRetries,
      fallbackTier: ModelTier.STANDARD,
    });
  }

  getPolicy(tier: ModelTier): ModelPolicy {
    const policy = this.policies.get(tier);
    if (!policy) {
      return this.policies.get(ModelTier.STANDARD)!;
    }
    return { ...policy };
  }

  setPolicy(tier: ModelTier, custom: Partial<ModelPolicy>): void {
    const existing = this.getPolicy(tier);
    this.policies.set(tier, {
      ...existing,
      ...custom,
      tier,
    });
  }

  getAllPolicies(): Record<ModelTier, ModelPolicy> {
    return {
      [ModelTier.FAST]: this.getPolicy(ModelTier.FAST),
      [ModelTier.STANDARD]: this.getPolicy(ModelTier.STANDARD),
      [ModelTier.REASONING]: this.getPolicy(ModelTier.REASONING),
    };
  }
}
