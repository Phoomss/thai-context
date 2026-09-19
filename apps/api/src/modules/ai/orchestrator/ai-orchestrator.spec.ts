import { Test, TestingModule } from '@nestjs/testing';
import { AIOrchestratorService } from './ai-orchestrator.service';
import { IntentClassifierService } from './intent-classifier.service';
import { CentralAgentRegistry } from '../agents/agent.registry';
import { EvidenceGuard } from '../evidence/evidence-guard.service';
import { AITelemetryService } from '../telemetry/ai-telemetry.service';
import { AgentType } from '../agents/agent-type.enum';
import { ModelTier } from '../router/model-tier.enum';
import { TaskComplexity } from './task-complexity.enum';
import { ConfigService } from '@nestjs/config';

describe('AIOrchestrator & Complexity Routing (Section 13, 14, 29)', () => {
  let orchestrator: AIOrchestratorService;
  let classifier: IntentClassifierService;

  const mockAgent = (type: AgentType, tier: ModelTier) => ({
    type,
    defaultTier: tier,
    execute: jest.fn().mockImplementation(async (ctx) => {
      if (type === AgentType.WORD_DISCOVERY) {
        ctx.recommendations = [
          {
            word: 'ประสิทธิภาพ',
            score: 0.95,
            definition: 'ความสามารถที่ทำให้เกิดผลสัมฤทธิ์...',
            source: 'สำนักงานราชบัณฑิตยสภา',
            edition: '2554',
          },
        ];
        ctx.selectedWords = ['ประสิทธิภาพ'];
      } else if (type === AgentType.WORD_COMPARE) {
        ctx.comparison = {
          wordA: 'ประสิทธิภาพ',
          wordB: 'ประสิทธิผล',
          difference_summary: 'ประสิทธิภาพเน้นความคุ้มค่า ส่วนประสิทธิผลเน้นผลสัมฤทธิ์',
          guidance: 'ใช้ตามบริบท',
        };
      }
      return {
        agent: type,
        status: 'SUCCESS',
        summary: `${type} completed`,
        data: {},
      };
    }),
  });

  const mockRegistry = {
    getAgent: jest.fn((type: AgentType) => mockAgent(type, ModelTier.STANDARD)),
    getAllAgents: jest.fn().mockReturnValue([]),
    getDefaultTier: jest.fn().mockReturnValue(ModelTier.STANDARD),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIOrchestratorService,
        IntentClassifierService,
        EvidenceGuard,
        AITelemetryService,
        { provide: CentralAgentRegistry, useValue: mockRegistry },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    orchestrator = module.get<AIOrchestratorService>(AIOrchestratorService);
    classifier = module.get<IntentClassifierService>(IntentClassifierService);
  });

  describe('Intent & Complexity Classification', () => {
    it('routes simple shortening request to SIMPLE complexity and FAST model tier', () => {
      const plan = classifier.classify('ทำให้สั้นลงและกระชับขึ้น');
      expect(plan.intent).toBe(AgentType.REWRITE);
      expect(plan.complexity).toBe(TaskComplexity.SIMPLE);
      expect(plan.modelTier).toBe(ModelTier.FAST);
      expect(plan.agents).toContain(AgentType.REWRITE);
    });

    it('routes standard word discovery to NORMAL complexity and STANDARD model tier', () => {
      const plan = classifier.classify('หาคำที่หมายถึงทำงานได้ดีและใช้ทรัพยากรน้อย');
      expect(plan.intent).toBe(AgentType.WORD_DISCOVERY);
      expect(plan.complexity).toBe(TaskComplexity.NORMAL);
      expect(plan.modelTier).toBe(ModelTier.STANDARD);
      expect(plan.agents).toContain(AgentType.WORD_DISCOVERY);
    });

    it('routes multi-word academic research comparison to COMPLEX complexity and REASONING model tier', () => {
      const plan = classifier.classify(
        'ประสิทธิภาพ กับ ประสิทธิผล ต่างกันอย่างไร และถ้าจะใช้ในรายงานวิจัยควรใช้คำไหน',
      );
      expect(plan.intent).toBe(AgentType.WORD_COMPARE);
      expect(plan.complexity).toBe(TaskComplexity.COMPLEX);
      expect(plan.modelTier).toBe(ModelTier.REASONING);
      expect(plan.agents).toContain(AgentType.WORD_COMPARE);
      expect(plan.agents).toContain(AgentType.CONTEXT);
      expect(plan.agents).toContain(AgentType.LANGUAGE_CHECKER);
    });

    it('detects gibberish queries and flags ABSTAIN immediately', () => {
      const plan = classifier.classify('คำที่ไม่มีในโลกนี้เลย สับปะรดสีชมพูลอยได้');
      expect(plan.intent).toBe('ABSTAIN');
      expect(plan.agents).toHaveLength(0);
    });
  });

  describe('Orchestration Execution Pipeline', () => {
    it('executes multi-agent query and returns grounded answer and traces', async () => {
      const res = await orchestrator.orchestrate({
        message: 'ประสิทธิภาพ กับ ประสิทธิผล ต่างกันอย่างไร และถ้าจะใช้ในรายงานวิจัยควรใช้คำไหน',
      });

      expect(res.intent).toBe(AgentType.WORD_COMPARE);
      expect(res.complexity).toBe(TaskComplexity.COMPLEX);
      expect(res.modelTier).toBe(ModelTier.REASONING);
      expect(res.agentTraces.length).toBeGreaterThanOrEqual(2);
      expect(res.answer).toBeDefined();
      expect(res.abstained).toBe(false);
      expect(res.confidenceLevel).toBe('HIGH');
    });

    it('abstains with low confidence when user asks for non-existent gibberish words', async () => {
      const res = await orchestrator.orchestrate({
        message: 'คำที่ไม่มีในโลกนี้เลย สับปะรดสีชมพูลอยได้',
      });

      expect(res.abstained).toBe(true);
      expect(res.confidenceLevel).toBe('LOW');
      expect(res.answer).toContain('ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลพจนานุกรมที่ระบบรองรับ');
      expect(res.recommendations).toHaveLength(0);
    });

    it('yields structured SSE events in streamOrchestrate', async () => {
      const events: string[] = [];
      for await (const sse of orchestrator.streamOrchestrate({
        message: 'หาคำที่หมายถึงทำงานได้ดีและใช้ทรัพยากรน้อย',
      })) {
        events.push(sse.event);
      }

      expect(events).toContain('agent.started');
      expect(events).toContain('start');
      expect(events).toContain('generation.delta');
      expect(events).toContain('token');
      expect(events).toContain('generation.completed');
      expect(events).toContain('complete');
    });
  });
});
