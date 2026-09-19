import { AgentType } from '../agents/agent-type.enum';
import { TaskComplexity } from './task-complexity.enum';
import { ModelTier } from '../router/model-tier.enum';

export interface ExecutionPlan {
  intent: AgentType | string;
  complexity: TaskComplexity;
  agents: AgentType[];
  retrievalRequired: boolean;
  requiresEvidence: boolean;
  modelTier: ModelTier;
  rationale?: string;
}
