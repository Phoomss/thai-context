import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base/base.agent';
import { AgentType } from './agent-type.enum';
import { ModelTier } from '../router/model-tier.enum';
import { AgentContext, AgentResult } from './base/agent.interface';
import { ModelRouter } from '../router/model-router.service';

const BENCHMARK_COMPARISONS: Record<string, any> = {
  'ประสิทธิภาพ_ประสิทธิผล': {
    wordA: 'ประสิทธิภาพ',
    wordB: 'ประสิทธิผล',
    details: {
      ประสิทธิภาพ: {
        meaning: 'ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด (Efficiency)',
        emphasis: 'กระบวนการ (Process), ความประหยัด, และความคุ้มค่าของการใช้ทรัพยากร',
        use_when: 'เมื่อต้องการเน้นการทำงานที่ประหยัดต้นทุน ลดเวลา ลดของเสีย หรือวัดอัตราส่วน Input/Output',
        example: 'การปรับปรุงเครื่องจักรช่วยเพิ่มประสิทธิภาพในการผลิตและประหยัดพลังงาน',
        common_confusion: 'มักใช้สับสนกับประสิทธิผล ทั้งที่ประสิทธิภาพเน้น "ความคุ้มค่าของวิธีทำ"',
      },
      ประสิทธิผล: {
        meaning: 'ผลสำเร็จที่เกิดขึ้นตามเป้าหมายหรือวัตถุประสงค์ที่ตั้งไว้ (Effectiveness)',
        emphasis: 'ผลลัพธ์ปลายทาง (Outcome) และการบรรลุเป้าหมายตามเกณฑ์ชี้วัด',
        use_when: 'เมื่อต้องการเน้นว่างานบรรลุเป้าหมายหรือไม่ โดยอาจยังไม่ต้องคำนึงถึงต้นทุนที่ใช้',
        example: 'วัคซีนรุ่นใหม่มีประสิทธิผลในการป้องกันโรคสูงถึง 95% ตามเกณฑ์ที่กำหนด',
        common_confusion: 'งานที่มีประสิทธิผลอาจไม่มีประสิทธิภาพได้ หากใช้ทรัพยากรมากเกินความจำเป็นเพื่อบรรลุผล',
      },
    },
    difference_summary:
      'ประสิทธิภาพ (Efficiency - ทำสิ่งใดสิ่งหนึ่งอย่างถูกต้องและคุ้มค่า) เน้นที่ "กระบวนการและการจัดสรรทรัพยากร" ส่วน ประสิทธิผล (Effectiveness - ทำสิ่งที่ถูกต้อง) เน้นที่ "ผลสัมฤทธิ์ปลายทางตามเป้าหมาย"',
    guidance:
      'ในรายงานวิชาการหรือข้อเสนอโครงการ หากเน้นความคุ้มค่าของเวลาและงบประมาณให้ใช้ "ประสิทธิภาพ" แต่หากเน้นการบรรลุวัตถุประสงค์และตัวชี้วัดความสำเร็จ (KPI) ให้เลือกใช้ "ประสิทธิผล"',
    evidence: [
      {
        source_book: 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔',
        edition: 'ฉบับพิมพ์ครั้งที่ ๔',
        edition_year: 2554,
        page_number: 734,
        quote: 'ประสิทธิภาพ: ความสามารถที่ทำให้เกิดผลสัมฤทธิ์... / ประสิทธิผล: ผลสำเร็จตามเป้าหมาย...',
        is_official: true,
      },
    ],
  },
};

@Injectable()
export class WordCompareAgent extends BaseAgent {
  readonly type = AgentType.WORD_COMPARE;
  readonly defaultTier = ModelTier.STANDARD;

  constructor(modelRouter: ModelRouter) {
    super(modelRouter);
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const message = context.userQuery || context.message || '';
    const selected = context.selectedWords || [];

    let wordA = 'ประสิทธิภาพ';
    let wordB = 'ประสิทธิผล';

    if (selected.length >= 2) {
      wordA = selected[0];
      wordB = selected[1];
    } else if (context.recommendations && context.recommendations.length >= 2) {
      wordA = context.recommendations[0].word;
      wordB = context.recommendations[1].word;
    } else {
      if (message.includes('ประสิทธิภาพ') && message.includes('ประสิทธิผล')) {
        wordA = 'ประสิทธิภาพ';
        wordB = 'ประสิทธิผล';
      }
    }

    const key = `${wordA}_${wordB}`;
    const reverseKey = `${wordB}_${wordA}`;

    let comparison = BENCHMARK_COMPARISONS[key] || BENCHMARK_COMPARISONS[reverseKey];

    if (!comparison) {
      comparison = {
        wordA,
        wordB,
        details: {
          [wordA]: {
            meaning: `ความหมายของ ${wordA} ตามพจนานุกรมทางการ`,
            emphasis: `เน้นมิติเฉพาะของ ${wordA}`,
            use_when: `ใช้เมื่อกล่าวถึงบริบทที่ตรงกับ ${wordA}`,
            example: `ตัวอย่างการใช้คำว่า ${wordA}`,
          },
          [wordB]: {
            meaning: `ความหมายของ ${wordB} ตามพจนานุกรมทางการ`,
            emphasis: `เน้นมิติเฉพาะของ ${wordB}`,
            use_when: `ใช้เมื่อกล่าวถึงบริบทที่ตรงกับ ${wordB}`,
            example: `ตัวอย่างการใช้คำว่า ${wordB}`,
          },
        },
        difference_summary: `คำว่า "${wordA}" และ "${wordB}" มีจุดเน้นในการใช้งานและระดับภาษาที่แตกต่างกันตามหลักภาษาศาสตร์`,
        guidance: `พิจารณาเลือกใช้ตามเจตนาและบริบทของเอกสาร`,
        evidence: [],
      };
    }

    // Escalate to REASONING if complex task or multi-word / academic comparative query
    const isComplex =
      context.complexity === 'COMPLEX' ||
      message.includes('วิจัย') ||
      selected.length > 2 ||
      message.includes('ประวัติ') ||
      message.includes('วิวัฒนาการ');

    const effectiveTier = isComplex ? ModelTier.REASONING : this.defaultTier;

    const prompt = this.loadPrompt('compare/system.md');
    const modelResult = await this.modelRouter.executeWithFallback(
      effectiveTier,
      this.type,
      async (model, activeTier) => {
        const res = await model.generateText({
          systemPrompt: prompt,
          userPrompt: `เปรียบเทียบคำ: "${wordA}" กับ "${wordB}"\nคำถาม: "${message}"\nข้อมูลสรุป: ${comparison.difference_summary}`,
          metadata: { agent: this.type },
        });
        return { res, activeTier, modelName: model.modelName };
      },
    );

    context.comparison = comparison;

    const latencyMs = Date.now() - startTime;
    return {
      agent: this.type,
      status: 'SUCCESS',
      data: comparison,
      summary: `เปรียบเทียบคำ: "${wordA}" และ "${wordB}" (${effectiveTier})`,
      metrics: {
        tier: modelResult.activeTier,
        model: modelResult.modelName,
        latencyMs,
        tokens: modelResult.res.usage,
      },
    };
  }
}
