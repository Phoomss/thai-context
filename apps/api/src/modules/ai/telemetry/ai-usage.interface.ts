import { ModelTier } from '../router/model-tier.enum';

export interface ModelUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost?: number | null;
}

export interface TelemetryRecord {
  requestId: string;
  conversationId?: string;
  sessionId?: string;
  agent: string;
  tier: ModelTier;
  model: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  retryCount: number;
  fallback: boolean;
  error?: string | null;
  estimatedCost?: number | null;
  timestamp?: number;
}
