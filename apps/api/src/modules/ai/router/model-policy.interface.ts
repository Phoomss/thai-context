import { ModelTier } from './model-tier.enum';

export interface ModelPolicy {
  tier: ModelTier;
  modelName: string;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  maxRetries?: number;
  fallbackTier?: ModelTier;
}

export interface ModelPricing {
  inputPricePerToken: number;
  outputPricePerToken: number;
}
