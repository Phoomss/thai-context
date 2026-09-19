import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base/base.agent';
import { AgentType } from './agent-type.enum';
import { ModelTier } from '../router/model-tier.enum';
import { AgentContext, AgentResult } from './base/agent.interface';
import { ModelRouter } from '../router/model-router.service';
import { AccessibilityService } from '../../accessibility/accessibility.service';
import { EvidenceGuard } from '../evidence/evidence-guard.service';

@Injectable()
export class AccessibilityAgent extends BaseAgent {
  readonly type = AgentType.ACCESSIBILITY;
  readonly defaultTier = ModelTier.FAST;

  constructor(
    modelRouter: ModelRouter,
    private readonly accessibilityService: AccessibilityService,
    private readonly evidenceGuard: EvidenceGuard,
  ) {
    super(modelRouter);
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const query = context.userQuery || context.message || '';
    const word = context.selectedWords?.[0] || 'สวัสดี';

    // 1. Deterministic Braille Conversion (Code Table based, never LLM hallucinated)
    const brailleData = await this.accessibilityService.getBraille(word);

    // 2. Verified Sign Language Resource
    const signData = await this.accessibilityService.getSignResource(word);

    // 3. Evidence Guard Verification
    const guardBraille = this.evidenceGuard.validateAccessibilityClaim('BRAILLE', true);
    const guardSign = this.evidenceGuard.validateAccessibilityClaim(
      'SIGN_LANGUAGE',
      signData.status === 'VERIFIED' || signData.status === 'EXTERNAL_RESOURCE' || signData.status === 'NOT_AVAILABLE',
    );

    if (!guardBraille.allowed || !guardSign.allowed) {
      return {
        agent: this.type,
        status: 'ABSTAINED',
        data: null,
        summary: 'ระงับการแสดงผลเนื่องจากข้อมูลการเข้าถึงไม่ผ่านเกณฑ์การรับรอง',
      };
    }

    // 4. Gemini used ONLY for explanation / assistive guidance (FAST tier)
    const prompt = this.loadPrompt('accessibility/system.md');
    const modelResult = await this.modelRouter.executeWithFallback(
      this.defaultTier,
      this.type,
      async (model, activeTier) => {
        const res = await model.generateText({
          systemPrompt: prompt,
          userPrompt: `คำศัพท์: "${word}"\nข้อมูลอักษรเบรลล์: ${brailleData.brailleUnicode}\nสถานะภาษามือ: ${signData.status}`,
          metadata: { agent: this.type },
        });
        return { res, activeTier, modelName: model.modelName };
      },
    );

    const latencyMs = Date.now() - startTime;
    return {
      agent: this.type,
      status: 'SUCCESS',
      data: {
        word,
        braille: brailleData,
        signLanguage: signData,
        guidance: modelResult.res.text,
      },
      summary: `บริการเข้าถึง (Accessibility): อักษรเบรลล์ "${brailleData.brailleUnicode}", ภาษามือไทย [${signData.status}]`,
      metrics: {
        tier: modelResult.activeTier,
        model: modelResult.modelName,
        latencyMs,
        tokens: modelResult.res.usage,
      },
    };
  }
}
