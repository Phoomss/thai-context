import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { ContextAgent } from './workspace/agents/context.agent';
import { WordDiscoveryAgent } from './workspace/agents/word-discovery.agent';
import { WordCompareAgent } from './workspace/agents/word-compare.agent';
import { WritingAgent } from './workspace/agents/writing.agent';
import { RewriteAgent } from './workspace/agents/rewrite.agent';
import { LanguageCheckerAgent } from './workspace/agents/language-checker.agent';
import { LanguageBridgeAgent } from './workspace/agents/language-bridge.agent';
import { AgentRegistry } from './workspace/agent.registry';
import { WorkspaceOrchestratorService } from './workspace/workspace-orchestrator.service';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [AIController],
  providers: [
    AIService,
    ContextAgent,
    WordDiscoveryAgent,
    WordCompareAgent,
    WritingAgent,
    RewriteAgent,
    LanguageCheckerAgent,
    LanguageBridgeAgent,
    AgentRegistry,
    WorkspaceOrchestratorService,
  ],
  exports: [AIService, WorkspaceOrchestratorService],
})
export class AIModule {}
