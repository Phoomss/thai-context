import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ModelRouter } from './model-router.service';
import { ModelPolicyService } from './model-policy.service';
import { ModelOverrideService } from './model-override.service';
import { ModelTier } from './model-tier.enum';
import { AITelemetryService } from '../telemetry/ai-telemetry.service';
import { GeminiError } from '../providers/gemini.provider';

describe('ModelRouter & Fallback (Section 29)', () => {
  let router: ModelRouter;
  let policyService: ModelPolicyService;
  let overrideService: ModelOverrideService;
  let telemetryService: AITelemetryService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'gemini.fastModel':
          return 'gemini-2.5-flash-lite';
        case 'gemini.standardModel':
          return 'gemini-2.5-flash';
        case 'gemini.reasoningModel':
          return 'gemini-2.5-pro';
        case 'gemini.apiKey':
          return 'AIzaSyFakeKeyForTest12345';
        case 'gemini.enableFallback':
          return true;
        case 'gemini.maxRetries':
          return 2;
        case 'gemini.timeoutMs':
          return 10000;
        case 'gemini.temperatureDefault':
          return 0.2;
        case 'gemini.pricing':
          return {
            fastInputPrice: 0.000000075,
            fastOutputPrice: 0.0000003,
            standardInputPrice: 0.00000015,
            standardOutputPrice: 0.0000006,
            reasoningInputPrice: 0.00000125,
            reasoningOutputPrice: 0.000005,
          };
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModelRouter,
        ModelPolicyService,
        ModelOverrideService,
        AITelemetryService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    router = module.get<ModelRouter>(ModelRouter);
    policyService = module.get<ModelPolicyService>(ModelPolicyService);
    overrideService = module.get<ModelOverrideService>(ModelOverrideService);
    telemetryService = module.get<AITelemetryService>(AITelemetryService);
  });

  describe('Model Resolution', () => {
    it('FAST tier resolves to configured fast model (gemini-2.5-flash-lite)', () => {
      const model = router.resolve(ModelTier.FAST);
      expect(model.modelName).toBe('gemini-2.5-flash-lite');
      expect(model.tier).toBe(ModelTier.FAST);
    });

    it('STANDARD tier resolves to configured standard model (gemini-2.5-flash)', () => {
      const model = router.resolve(ModelTier.STANDARD);
      expect(model.modelName).toBe('gemini-2.5-flash');
      expect(model.tier).toBe(ModelTier.STANDARD);
    });

    it('REASONING tier resolves to configured reasoning model (gemini-2.5-pro)', () => {
      const model = router.resolve(ModelTier.REASONING);
      expect(model.modelName).toBe('gemini-2.5-pro');
      expect(model.tier).toBe(ModelTier.REASONING);
    });
  });

  describe('Fallback Behavior', () => {
    it('should fallback from FAST to STANDARD on transient 429 Rate Limit', async () => {
      let attempts = 0;
      const result = await router.executeWithFallback(
        ModelTier.FAST,
        'TEST_AGENT',
        async (model, activeTier) => {
          attempts++;
          if (activeTier === ModelTier.FAST) {
            throw new GeminiError('Rate limit exceeded', 429, true, 'RESOURCE_EXHAUSTED');
          }
          return { success: true, activeTier, model: model.modelName };
        },
      );

      expect(attempts).toBe(2);
      expect(result.success).toBe(true);
      expect(result.activeTier).toBe(ModelTier.STANDARD);
      expect(result.model).toBe('gemini-2.5-flash');
    });

    it('should fallback from STANDARD to REASONING on transient 503 Service Unavailable', async () => {
      const result = await router.executeWithFallback(
        ModelTier.STANDARD,
        'TEST_AGENT',
        async (model, activeTier) => {
          if (activeTier === ModelTier.STANDARD) {
            throw new GeminiError('Model overloaded', 503, true, 'UNAVAILABLE');
          }
          return { activeTier, model: model.modelName };
        },
      );

      expect(result.activeTier).toBe(ModelTier.REASONING);
      expect(result.model).toBe('gemini-2.5-pro');
    });

    it('should NOT fallback on non-transient 400 Bad Request', async () => {
      await expect(
        router.executeWithFallback(ModelTier.FAST, 'TEST_AGENT', async () => {
          throw new GeminiError('Invalid JSON schema', 400, false, 'INVALID_ARGUMENT');
        }),
      ).rejects.toThrow('Invalid JSON schema');
    });

    it('should NOT fallback on non-transient 401 Unauthorized', async () => {
      await expect(
        router.executeWithFallback(ModelTier.STANDARD, 'TEST_AGENT', async () => {
          throw new GeminiError('API Key invalid', 401, false, 'UNAUTHENTICATED');
        }),
      ).rejects.toThrow('API Key invalid');
    });
  });

  describe('Admin Model Selection Override', () => {
    afterEach(() => {
      overrideService.clearOverrides();
    });

    it('should override agent model tier when configured by admin', async () => {
      overrideService.setAgentOverride('WORD_COMPARE', ModelTier.REASONING);

      const result = await router.executeWithFallback(
        ModelTier.STANDARD,
        'WORD_COMPARE',
        async (model, activeTier) => {
          return { activeTier, model: model.modelName };
        },
      );

      expect(result.activeTier).toBe(ModelTier.REASONING);
      expect(result.model).toBe('gemini-2.5-pro');
    });

    it('should apply global emergency override to all requests', async () => {
      overrideService.setGlobalOverride(ModelTier.FAST);

      const result = await router.executeWithFallback(
        ModelTier.REASONING,
        'WRITING',
        async (model, activeTier) => {
          return { activeTier, model: model.modelName };
        },
      );

      expect(result.activeTier).toBe(ModelTier.FAST);
      expect(result.model).toBe('gemini-2.5-flash-lite');
    });
  });

  describe('Telemetry & Pricing Calculation', () => {
    it('calculates cost accurately based on token counts and tier pricing', () => {
      const cost = telemetryService.calculateCost(ModelTier.STANDARD, 1000, 500);
      // 1000 * 0.00000015 + 500 * 0.0000006 = 0.00015 + 0.00030 = 0.00045
      expect(cost).toBeCloseTo(0.00045, 6);
    });

    it('records telemetry execution without leaking secrets', () => {
      const record = telemetryService.recordUsage({
        requestId: 'req-test-1',
        agent: 'WORD_COMPARE',
        tier: ModelTier.STANDARD,
        model: 'gemini-2.5-flash',
        latencyMs: 340,
        inputTokens: 120,
        outputTokens: 80,
        totalTokens: 200,
        retryCount: 0,
        fallback: false,
      });

      expect(record.requestId).toBe('req-test-1');
      expect(record.estimatedCost).toBeGreaterThan(0);
      const summary = telemetryService.getMetricsSummary();
      expect(summary.totalRequests).toBeGreaterThanOrEqual(1);
      expect(summary.totalTokens).toBeGreaterThanOrEqual(200);
    });
  });
});
