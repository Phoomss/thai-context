import { Test, TestingModule } from '@nestjs/testing';
import { CentralAgentRegistry, AGENT_DEFAULT_POLICIES } from './agent.registry';
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
import { ModelRouter } from '../router/model-router.service';
import { PrismaService } from '../../../database/prisma.service';
import { AccessibilityService } from '../../accessibility/accessibility.service';
import { EvidenceGuard } from '../evidence/evidence-guard.service';

describe('Agent Policy & Central Registry (Section 12 & 29)', () => {
  let registry: CentralAgentRegistry;

  const mockModelRouter = {
    resolve: jest.fn(),
    executeWithFallback: jest.fn(),
  };

  const mockPrisma = {
    word: { findMany: jest.fn().mockResolvedValue([]) },
    dialectEntry: { findMany: jest.fn().mockResolvedValue([]) },
  };

  const mockAccessibilityService = {
    getBraille: jest.fn().mockResolvedValue({ brailleUnicode: '⠅⠁' }),
    getSignResource: jest.fn().mockResolvedValue({ status: 'VERIFIED' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CentralAgentRegistry,
        WordDiscoveryAgent,
        ContextAgent,
        WritingAgent,
        RewriteAgent,
        LanguageCheckerAgent,
        WordCompareAgent,
        DialectAgent,
        ModernVocabularyAgent,
        LanguageBridgeAgent,
        AccessibilityAgent,
        RAGAgent,
        EvidenceGuard,
        { provide: ModelRouter, useValue: mockModelRouter },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AccessibilityService, useValue: mockAccessibilityService },
      ],
    }).compile();

    registry = module.get<CentralAgentRegistry>(CentralAgentRegistry);
  });

  it('verifies default tiers for all 11 sub-agents', () => {
    expect(registry.getDefaultTier(AgentType.WORD_DISCOVERY)).toBe(ModelTier.STANDARD);
    expect(registry.getDefaultTier(AgentType.CONTEXT)).toBe(ModelTier.STANDARD);
    expect(registry.getDefaultTier(AgentType.WRITING)).toBe(ModelTier.STANDARD);
    expect(registry.getDefaultTier(AgentType.REWRITE)).toBe(ModelTier.STANDARD);
    expect(registry.getDefaultTier(AgentType.LANGUAGE_CHECKER)).toBe(ModelTier.STANDARD);
    expect(registry.getDefaultTier(AgentType.WORD_COMPARE)).toBe(ModelTier.STANDARD);
    expect(registry.getDefaultTier(AgentType.DIALECT)).toBe(ModelTier.STANDARD);
    expect(registry.getDefaultTier(AgentType.MODERN_VOCABULARY)).toBe(ModelTier.STANDARD);
    expect(registry.getDefaultTier(AgentType.LANGUAGE_BRIDGE)).toBe(ModelTier.STANDARD);
    expect(registry.getDefaultTier(AgentType.ACCESSIBILITY)).toBe(ModelTier.FAST);
    expect(registry.getDefaultTier(AgentType.RAG)).toBe(ModelTier.STANDARD);
  });

  it('registers all 11 agents in CentralAgentRegistry', () => {
    const allAgents = registry.getAllAgents();
    expect(allAgents.length).toBe(11);

    for (const type of Object.values(AgentType)) {
      const agent = registry.getAgent(type);
      expect(agent).toBeDefined();
      expect(agent?.type).toBe(type);
    }
  });
});
