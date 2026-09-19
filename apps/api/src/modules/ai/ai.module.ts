import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { DatabaseModule } from '../../database/database.module';
import { AccessibilityModule } from '../accessibility/accessibility.module';

// Model Router & Policies
import { ModelPolicyService } from './router/model-policy.service';
import { ModelOverrideService } from './router/model-override.service';
import { ModelRouter } from './router/model-router.service';

// Telemetry & Guard
import { AITelemetryService } from './telemetry/ai-telemetry.service';
import { EvidenceGuard } from './evidence/evidence-guard.service';

// Sub-Agents
import { CentralAgentRegistry } from './agents/agent.registry';
import { WordDiscoveryAgent as CentralWordDiscoveryAgent } from './agents/word-discovery.agent';
import { ContextAgent as CentralContextAgent } from './agents/context.agent';
import { WritingAgent as CentralWritingAgent } from './agents/writing.agent';
import { RewriteAgent as CentralRewriteAgent } from './agents/rewrite.agent';
import { LanguageCheckerAgent as CentralLanguageCheckerAgent } from './agents/language-checker.agent';
import { WordCompareAgent as CentralWordCompareAgent } from './agents/word-compare.agent';
import { DialectAgent } from './agents/dialect.agent';
import { ModernVocabularyAgent } from './agents/modern-vocabulary.agent';
import { LanguageBridgeAgent as CentralLanguageBridgeAgent } from './agents/language-bridge.agent';
import { AccessibilityAgent } from './agents/accessibility.agent';
import { RAGAgent } from './agents/rag.agent';

// Orchestrator
import { IntentClassifierService } from './orchestrator/intent-classifier.service';
import { AIOrchestratorService } from './orchestrator/ai-orchestrator.service';

// Legacy Workspace Compatibility
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
    // Router & Telemetry
    ModelPolicyService,
    ModelOverrideService,
    ModelRouter,
    AITelemetryService,
    EvidenceGuard,
    // Central Sub-Agents
    CentralWordDiscoveryAgent,
    CentralContextAgent,
    CentralWritingAgent,
    CentralRewriteAgent,
    CentralLanguageCheckerAgent,
    CentralWordCompareAgent,
    DialectAgent,
    ModernVocabularyAgent,
    CentralLanguageBridgeAgent,
    AccessibilityAgent,
    RAGAgent,
    CentralAgentRegistry,
    // Orchestrator
    IntentClassifierService,
    AIOrchestratorService,
    // Legacy Workspace
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
  exports: [
    AIService,
    ModelRouter,
    ModelPolicyService,
    ModelOverrideService,
    AITelemetryService,
    EvidenceGuard,
    CentralAgentRegistry,
    AIOrchestratorService,
    WorkspaceOrchestratorService,
  ],
})
export class AIModule {}

