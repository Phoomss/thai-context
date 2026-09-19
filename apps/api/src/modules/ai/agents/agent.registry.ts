import { Injectable } from '@nestjs/common';
import { SubAgent } from './base/agent.interface';
import { AgentType } from './agent-type.enum';
import { ModelTier } from '../router/model-tier.enum';
import { WordDiscoveryAgent } from './word-discovery.agent';
import { ContextAgent } from './context.agent';
import { WritingAgent } from './writing.agent';
import { RewriteAgent } from './rewrite.agent';
import { LanguageCheckerAgent } from './language-checker.agent';
import { WordCompareAgent } from './word-compare.agent';
import { DialectAgent } from './dialect.agent';
import { ModernVocabularyAgent } from './modern-vocabulary.agent';
import { LanguageBridgeAgent } from './language-bridge.agent';
import { AccessibilityAgent } from './accessibility.agent';
import { RAGAgent } from './rag.agent';

export const AGENT_DEFAULT_POLICIES: Record<AgentType, ModelTier> = {
  [AgentType.WORD_DISCOVERY]: ModelTier.STANDARD,
  [AgentType.CONTEXT]: ModelTier.STANDARD,
  [AgentType.WRITING]: ModelTier.STANDARD,
  [AgentType.REWRITE]: ModelTier.STANDARD,
  [AgentType.LANGUAGE_CHECKER]: ModelTier.STANDARD,
  [AgentType.WORD_COMPARE]: ModelTier.STANDARD,
  [AgentType.DIALECT]: ModelTier.STANDARD,
  [AgentType.MODERN_VOCABULARY]: ModelTier.STANDARD,
  [AgentType.LANGUAGE_BRIDGE]: ModelTier.STANDARD,
  [AgentType.ACCESSIBILITY]: ModelTier.FAST,
  [AgentType.RAG]: ModelTier.STANDARD,
};

@Injectable()
export class CentralAgentRegistry {
  private readonly agents: Map<AgentType, SubAgent> = new Map();

  constructor(
    wordDiscoveryAgent: WordDiscoveryAgent,
    contextAgent: ContextAgent,
    writingAgent: WritingAgent,
    rewriteAgent: RewriteAgent,
    languageCheckerAgent: LanguageCheckerAgent,
    wordCompareAgent: WordCompareAgent,
    dialectAgent: DialectAgent,
    modernVocabularyAgent: ModernVocabularyAgent,
    languageBridgeAgent: LanguageBridgeAgent,
    accessibilityAgent: AccessibilityAgent,
    ragAgent: RAGAgent,
  ) {
    this.register(wordDiscoveryAgent);
    this.register(contextAgent);
    this.register(writingAgent);
    this.register(rewriteAgent);
    this.register(languageCheckerAgent);
    this.register(wordCompareAgent);
    this.register(dialectAgent);
    this.register(modernVocabularyAgent);
    this.register(languageBridgeAgent);
    this.register(accessibilityAgent);
    this.register(ragAgent);
  }

  register(agent: SubAgent): void {
    this.agents.set(agent.type, agent);
  }

  getAgent(type: AgentType): SubAgent | undefined {
    return this.agents.get(type);
  }

  getAllAgents(): SubAgent[] {
    return Array.from(this.agents.values());
  }

  getDefaultTier(type: AgentType): ModelTier {
    return AGENT_DEFAULT_POLICIES[type] || ModelTier.STANDARD;
  }
}
