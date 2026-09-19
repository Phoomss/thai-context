import { AgentType } from '../agent-type.enum';
import { ModelTier } from '../../router/model-tier.enum';
import { Evidence } from '../../evidence/evidence.interface';

export interface AgentContext {
  userQuery: string;
  intent?: string;
  complexity?: string;
  retrievedEvidence?: Evidence[];
  previousResults?: AgentResult[];
  metadata?: Record<string, unknown>;
  sessionId?: string;
  selectedWords?: string[];
  currentText?: string;
  userContext?: {
    type?: string;
    tone?: string;
    audience?: string;
  };
  inferredContext?: any;
  recommendations?: any[];
  comparison?: any;
  generatedContent?: any[];
  languageCheck?: any;
  languageBridge?: any;
  coThinking?: any;
  evidence?: any[];
  confidence?: number;
  confidenceLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  abstained?: boolean;
  abstentionReason?: string;
  agentTraces?: any[];
  history?: any[];
  [key: string]: any;
}

export interface AgentResult {
  agent: AgentType;
  status: 'SUCCESS' | 'FAILED' | 'ABSTAINED' | 'SKIPPED';
  data: any;
  evidence?: Evidence[];
  summary?: string;
  metrics?: {
    tier: ModelTier;
    model: string;
    latencyMs: number;
    tokens?: {
      input?: number;
      output?: number;
      total?: number;
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
    };
  };

}

export interface SubAgent {
  readonly type: AgentType;
  readonly defaultTier: ModelTier;
  execute(context: AgentContext): Promise<AgentResult>;
}
