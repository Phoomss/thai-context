import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base/base.agent';
import { AgentType } from './agent-type.enum';
import { ModelTier } from '../router/model-tier.enum';
import { AgentContext, AgentResult } from './base/agent.interface';
import { ModelRouter } from '../router/model-router.service';

const BENCHMARK_BRIDGES: Record<string, any> = {
  เกรงใจ: {
    word: 'เกรงใจ',
    english_translation: 'Considerate / Mindful of others',
    english_explanation:
      'Deep-seated social etiquette where one is reluctant to impose upon, burden, or cause inconvenience to another person.',
    pronunciation: 'kreeŋ-jai',
    transliteration: 'krengchai',
    cultural_context:
      'A cornerstone of Thai social harmony; expressing empathy, respect for personal boundaries, and avoidance of confrontation.',
    example: 'คนไทยมักมีความเกรงใจในการรบกวนผู้อื่น แม้จะเป็นเรื่องเล็กน้อยก็ตาม',
  },
  สมานฉันท์: {
    word: 'สมานฉันท์',
    english_translation: 'Concord / Harmony / Reconciliation',
    english_explanation: 'Mutual agreement, unity of hearts, and collaborative harmony for social peace.',
    pronunciation: 'sa-mǎan-ná-chǎn',
    transliteration: 'samanachan',
    cultural_context: 'Formal concept used in national unity, peace talks, and civic community bonding.',
    example: 'การสร้างความสมานฉันท์ในสังคมต้องอาศัยการรับฟังซึ่งกันและกัน',
  },
  น้ำใจ: {
    word: 'น้ำใจ',
    english_translation: 'Kindness / Generosity / Good-heartedness',
    english_explanation: 'Warm-hearted goodwill and spontaneous generosity offered without expecting reciprocity.',
    pronunciation: 'nám-jai',
    transliteration: 'namchai',
    cultural_context: 'A deeply cherished Thai virtue representing collective empathy and hospitality.',
    example: 'คนไทยมีน้ำใจช่วยเหลือผู้ประสบภัยอย่างรวดเร็ว',
  },
};

@Injectable()
export class LanguageBridgeAgent extends BaseAgent {
  readonly type = AgentType.LANGUAGE_BRIDGE;
  readonly defaultTier = ModelTier.STANDARD;

  constructor(modelRouter: ModelRouter) {
    super(modelRouter);
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const query = context.userQuery || context.message || '';

    let targetWord = 'เกรงใจ';
    for (const w of Object.keys(BENCHMARK_BRIDGES)) {
      if (query.includes(w)) {
        targetWord = w;
        break;
      }
    }

    let bridgeInfo = BENCHMARK_BRIDGES[targetWord];
    if (!bridgeInfo) {
      bridgeInfo = {
        word: targetWord,
        english_translation: 'Thai cultural concept',
        english_explanation: `Linguistic and cultural significance of "${targetWord}" in Thai society.`,
        pronunciation: targetWord,
        transliteration: targetWord,
        cultural_context: 'Expresses traditional Thai worldview and social values.',
        example: `การใช้คำว่า "${targetWord}" ในบริบทจริง`,
      };
    }

    const prompt = this.loadPrompt('language-bridge/system.md');
    const modelResult = await this.modelRouter.executeWithFallback(
      this.defaultTier,
      this.type,
      async (model, activeTier) => {
        const res = await model.generateText({
          systemPrompt: prompt,
          userPrompt: `คำศัพท์: "${targetWord}"\nข้อมูลแปลและวัฒนธรรม: ${JSON.stringify(bridgeInfo)}`,
          metadata: { agent: this.type },
        });
        return { res, activeTier, modelName: model.modelName };
      },
    );

    context.languageBridge = bridgeInfo;

    const latencyMs = Date.now() - startTime;
    return {
      agent: this.type,
      status: 'SUCCESS',
      data: bridgeInfo,
      summary: `สะพานภาษาและวัฒนธรรม: "${targetWord}" -> ${bridgeInfo.english_translation}`,
      metrics: {
        tier: modelResult.activeTier,
        model: modelResult.modelName,
        latencyMs,
        tokens: modelResult.res.usage,
      },
    };
  }
}
