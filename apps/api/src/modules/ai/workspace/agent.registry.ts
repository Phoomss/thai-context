import { Injectable } from '@nestjs/common';
import { LanguageAgent } from './agent.interface';
import { AgentTask, WorkspaceContext } from './workspace.types';
import { ContextAgent } from './agents/context.agent';
import { WordDiscoveryAgent } from './agents/word-discovery.agent';
import { WordCompareAgent } from './agents/word-compare.agent';
import { WritingAgent } from './agents/writing.agent';
import { RewriteAgent } from './agents/rewrite.agent';
import { LanguageCheckerAgent } from './agents/language-checker.agent';
import { LanguageBridgeAgent } from './agents/language-bridge.agent';
import { DialectAgent } from './agents/dialect.agent';

@Injectable()
export class AgentRegistry {
  private readonly agents: LanguageAgent[];

  constructor(
    contextAgent: ContextAgent,
    wordDiscoveryAgent: WordDiscoveryAgent,
    wordCompareAgent: WordCompareAgent,
    writingAgent: WritingAgent,
    rewriteAgent: RewriteAgent,
    languageCheckerAgent: LanguageCheckerAgent,
    languageBridgeAgent: LanguageBridgeAgent,
    dialectAgent: DialectAgent,
  ) {
    this.agents = [
      contextAgent,
      wordDiscoveryAgent,
      wordCompareAgent,
      writingAgent,
      rewriteAgent,
      languageCheckerAgent,
      languageBridgeAgent,
      dialectAgent,
    ];
  }

  getAgent(task: AgentTask, context: WorkspaceContext): LanguageAgent | undefined {
    return this.agents.find((agent) => agent.canHandle(task, context));
  }

  getAllAgents(): LanguageAgent[] {
    return [...this.agents];
  }
}
