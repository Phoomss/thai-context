import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base/base.agent';
import { AgentType } from './agent-type.enum';
import { ModelTier } from '../router/model-tier.enum';
import { AgentContext, AgentResult } from './base/agent.interface';
import { ModelRouter } from '../router/model-router.service';

export interface ModernVocabItem {
  word: string;
  sourceType: 'OFFICIAL' | 'MODERN' | 'EXTERNAL' | 'AI_INFERRED';
  meaning: string;
  usageContext: string;
  isOfficialInDictionary: boolean;
}

const CURATED_MODERN_TERMS: Record<string, ModernVocabItem> = {
  ช็อตฟีล: {
    word: 'ช็อตฟีล',
    sourceType: 'MODERN',
    meaning: 'อาการที่ถูกขัดจังหวะหรือดับอารมณ์/ความรู้สึกที่กำลังเพลิดเพลินอยู่กะทันหัน',
    usageContext: 'ภาษาปาก / สื่อสังคมออนไลน์',
    isOfficialInDictionary: false,
  },
  แกง: {
    word: 'แกง',
    sourceType: 'MODERN',
    meaning: 'แกล้ง หลอก หรือทำให้เข้าใจผิดในเชิงขบขัน',
    usageContext: 'สแลงร่วมสมัย',
    isOfficialInDictionary: false,
  },
  ดิจิทัล: {
    word: 'ดิจิทัล',
    sourceType: 'OFFICIAL',
    meaning: 'เชิงเลข ที่เกี่ยวกับระบบตัวเลข หรือระบบคอมพิวเตอร์',
    usageContext: 'ศัพท์บัญญัติราชบัณฑิตยสภา (Digital)',
    isOfficialInDictionary: true,
  },
};

@Injectable()
export class ModernVocabularyAgent extends BaseAgent {
  readonly type = AgentType.MODERN_VOCABULARY;
  readonly defaultTier = ModelTier.STANDARD;

  constructor(modelRouter: ModelRouter) {
    super(modelRouter);
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const query = (context.userQuery || context.message || '').trim();

    let termInfo: ModernVocabItem | null = null;
    for (const [term, data] of Object.entries(CURATED_MODERN_TERMS)) {
      if (query.includes(term)) {
        termInfo = data;
        break;
      }
    }

    if (!termInfo) {
      termInfo = {
        word: query,
        sourceType: 'AI_INFERRED',
        meaning: `คำศัพท์หรือสแลงร่วมสมัยที่ใช้ในการสื่อสารยุคใหม่`,
        usageContext: 'ภาษาพูดร่วมสมัย',
        isOfficialInDictionary: false,
      };
    }

    const prompt = this.loadPrompt('modern-vocabulary/system.md');
    const modelResult = await this.modelRouter.executeWithFallback(
      this.defaultTier,
      this.type,
      async (model, activeTier) => {
        const res = await model.generateText({
          systemPrompt: prompt,
          userPrompt: `วิเคราะห์คำศัพท์ร่วมสมัย: "${termInfo!.word}"\nประเภทแหล่งที่มา: ${termInfo!.sourceType}\nความหมาย: ${termInfo!.meaning}`,
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
        term: termInfo,
        analysis: modelResult.res.text,
      },
      summary: `วิเคราะห์คำศัพท์ร่วมสมัย "${termInfo.word}" (ประเภท: ${termInfo.sourceType}, บรรจุในพจนานุกรมทางการ: ${termInfo.isOfficialInDictionary})`,
      metrics: {
        tier: modelResult.activeTier,
        model: modelResult.modelName,
        latencyMs,
        tokens: modelResult.res.usage,
      },
    };
  }
}
