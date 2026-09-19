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
import { DialectAgent } from './workspace/agents/dialect.agent';
import { AgentRegistry } from './workspace/agent.registry';
import { WorkspaceOrchestratorService } from './workspace/workspace-orchestrator.service';
import { DialectModule } from '../dialect/dialect.module';

@Global()
@Module({
  imports: [HttpModule, DialectModule],
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
    DialectAgent,
    AgentRegistry,
    WorkspaceOrchestratorService,
  ],
  exports: [AIService, WorkspaceOrchestratorService],
})
export class AIModule {}
