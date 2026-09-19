import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base/base.agent';
import { AgentType } from './agent-type.enum';
import { ModelTier } from '../router/model-tier.enum';
import { AgentContext, AgentResult } from './base/agent.interface';
import { ModelRouter } from '../router/model-router.service';

interface LanguageIssue {
  type: 'REDUNDANCY' | 'AWKWARD_WORDING' | 'WORD_MISUSE' | 'FORMALITY_MISMATCH' | 'AMBIGUITY';
  text: string;
  suggestion: string;
  rule_type: 'FACTUAL_DICTIONARY_ISSUE' | 'AI_LANGUAGE_SUGGESTION';
  description: string;
}

const STATIC_GRAMMAR_RULES: Array<{
  pattern: RegExp;
  suggestion: string;
  type: LanguageIssue['type'];
  rule_type: LanguageIssue['rule_type'];
  description: string;
}> = [
  {
    pattern: /สามารถที่จะ/g,
    suggestion: 'สามารถ',
    type: 'REDUNDANCY',
    rule_type: 'AI_LANGUAGE_SUGGESTION',
    description: 'คำว่า "ที่จะ" เป็นคำเชื่อมซ้ำซ้อนหลัง "สามารถ"',
  },
  {
    pattern: /ทำการ([ก-๙]+)/g,
    suggestion: '$1',
    type: 'REDUNDANCY',
    rule_type: 'AI_LANGUAGE_SUGGESTION',
    description: 'การใช้ "ทำการ" นำหน้ากริยาเป็นคำฟุ่มเฟือยที่ได้รับอิทธิพลจากภาษาต่างประเทศ',
  },
  {
    pattern: /มีความจำเป็นที่จะต้อง/g,
    suggestion: 'จำเป็นต้อง',
    type: 'REDUNDANCY',
    rule_type: 'AI_LANGUAGE_SUGGESTION',
    description: 'วลีเยิ่นเย้อ ควรตัดทอนให้กระชับ',
  },
  {
    pattern: /ในส่วนของ/g,
    suggestion: 'สำหรับ / ส่วน',
    type: 'AWKWARD_WORDING',
    rule_type: 'AI_LANGUAGE_SUGGESTION',
    description: 'สำนวนแปลตรงตัว (In terms of) ทำให้โครงสร้างประโยคติดขัด',
  },
  {
    pattern: /มันเป็นเรื่องของ/g,
    suggestion: 'เป็นเรื่องของ',
    type: 'AWKWARD_WORDING',
    rule_type: 'AI_LANGUAGE_SUGGESTION',
    description: 'การใช้ "มัน" ขึ้นต้นประโยคเป็นสำนวนภาษาต่างประเทศ (It is...)',
  },
];

@Injectable()
export class LanguageCheckerAgent extends BaseAgent {
  readonly type = AgentType.LANGUAGE_CHECKER;
  readonly defaultTier = ModelTier.STANDARD;

  constructor(modelRouter: ModelRouter) {
    super(modelRouter);
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const textToCheck =
      context.currentText ||
      context.userQuery ||
      context.message ||
      'ระบบนี้สามารถที่จะทำการประมวลผลได้อย่างรวดเร็ว';

    const issues: LanguageIssue[] = [];

    // 1. Deterministic Rule & Pattern Matching Engine
    for (const rule of STATIC_GRAMMAR_RULES) {
      const match = textToCheck.match(rule.pattern);
      if (match) {
        issues.push({
          type: rule.type,
          text: match[0],
          suggestion: rule.suggestion,
          rule_type: rule.rule_type,
          description: rule.description,
        });
      }
    }

    // 2. Score Calculation
    let score = 100;
    score -= issues.length * 12;
    if (score < 50) score = 50;

    let status: 'OPTIMAL' | 'ACCEPTABLE' | 'NEEDS_IMPROVEMENT' = 'OPTIMAL';
    if (score < 75) {
      status = 'NEEDS_IMPROVEMENT';
    } else if (score < 90) {
      status = 'ACCEPTABLE';
    }

    let summary = '';
    if (issues.length === 0) {
      summary = 'ไม่พบจุดผิดพลาดหรือคำฟุ่มเฟือย โครงสร้างประโยคถูกต้อง สื่อความหมายชัดเจนตามแบบแผนภาษาไทย';
    } else {
      summary = `พบจุดที่ควรปรับปรุง ${issues.length} รายการ (ส่วนใหญ่เป็นคำฟุ่มเฟือยและสำนวนแปล) แนะนำให้ปรับแก้เพื่อให้กระชับและเป็นมืออาชีพยิ่งขึ้น`;
    }

    const checkResult = {
      score,
      status,
      issues,
      summary,
    };

    // 3. LLM Augmentation via Router
    const prompt = this.loadPrompt('checker/system.md');
    const modelResult = await this.modelRouter.executeWithFallback(
      this.defaultTier,
      this.type,
      async (model, activeTier) => {
        const res = await model.generateText({
          systemPrompt: prompt,
          userPrompt: `ข้อความที่ตรวจ: "${textToCheck}"\nผลการตรวจเบื้องต้นจากกฎ: พบ ${issues.length} ประเด็น`,
          metadata: { agent: this.type },
        });
        return { res, activeTier, modelName: model.modelName };
      },
    );

    context.languageCheck = checkResult;

    const latencyMs = Date.now() - startTime;
    return {
      agent: this.type,
      status: 'SUCCESS',
      data: checkResult,
      summary: `ตรวจทานภาษา: ได้คะแนน ${score}/100 (${status}) พบ ${issues.length} จุดที่ควรปรับปรุง`,
      metrics: {
        tier: modelResult.activeTier,
        model: modelResult.modelName,
        latencyMs,
        tokens: modelResult.res.usage,
      },
    };
  }
}
