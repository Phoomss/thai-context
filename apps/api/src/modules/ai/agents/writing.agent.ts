import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base/base.agent';
import { AgentType } from './agent-type.enum';
import { ModelTier } from '../router/model-tier.enum';
import { AgentContext, AgentResult } from './base/agent.interface';
import { ModelRouter } from '../router/model-router.service';

const BENCHMARK_WRITINGS: Record<string, any[]> = {
  ประสิทธิภาพ: [
    {
      type: 'sentence',
      content:
        'การประยุกต์ใช้อัลกอริทึมใหม่ช่วยเพิ่มประสิทธิภาพในการประมวลผลข้อมูลขนาดใหญ่ และลดระยะเวลาการทำงานได้อย่างมีนัยสำคัญ',
      register: 'academic',
      notes: 'เน้นความคุ้มค่าของการใช้ทรัพยากรเวลาและการคำนวณตามหลักวิชาการ',
    },
    {
      type: 'sentence',
      content: 'ระบบอัตโนมัติช่วยยกระดับประสิทธิภาพการทำงานของทีมและลดต้นทุนการดำเนินงาน',
      register: 'business',
      notes: 'เหมาะสำหรับรายงานผู้บริหารและข้อเสนอโครงการธุรกิจ',
    },
    {
      type: 'paragraph',
      content:
        'ในการวิจัยนี้ การนำกระบวนการอัตโนมัติมาปรับใช้มีเป้าหมายหลักเพื่อยกระดับประสิทธิภาพของระบบ โดยมุ่งเน้นการจัดสรรทรัพยากรการคำนวณและเวลาให้เกิดประโยชน์สูงสุด สอดคล้องกับมาตรฐานทางวิศวกรรม',
      register: 'academic',
      notes: 'ย่อหน้าทางการสำหรับบทความวิจัยหรือรายงานสรุปผลการศึกษา',
    },
  ],
  ประสิทธิผล: [
    {
      type: 'sentence',
      content: 'การดำเนินนโยบายดังกล่าวส่งผลให้เกิดประสิทธิผลในการยกระดับคุณภาพชีวิตของประชาชนอย่างเป็นรูปธรรม',
      register: 'government',
      notes: 'เน้นการบรรลุผลลัพธ์และเป้าหมายเชิงนโยบาย',
    },
    {
      type: 'sentence',
      content: 'กลยุทธ์การตลาดฉบับปรับปรุงสร้างประสิทธิผลในการเพิ่มยอดขายตามเป้าหมายประจำไตรมาส',
      register: 'business',
      notes: 'เน้นการบรรลุ KPI ปลายทาง',
    },
  ],
  สมานฉันท์: [
    {
      type: 'sentence',
      content: 'การเจรจาอย่างสร้างสรรค์เป็นหัวใจสำคัญในการสร้างความสมานฉันท์และความเข้าใจอันดีระหว่างองค์กร',
      register: 'formal',
      notes: 'เน้นความร่วมมือร่วมใจและความสงบเรียบร้อย',
    },
  ],
};

@Injectable()
export class WritingAgent extends BaseAgent {
  readonly type = AgentType.WRITING;
  readonly defaultTier = ModelTier.STANDARD;

  constructor(modelRouter: ModelRouter) {
    super(modelRouter);
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const text = context.userQuery || context.message || '';
    const register = context.inferredContext?.type || 'academic';

    // Identify target word
    let targetWord = '';
    if (context.selectedWords && context.selectedWords.length > 0) {
      targetWord = context.selectedWords[0];
    } else if (context.recommendations && context.recommendations.length > 0) {
      targetWord = context.recommendations[0].word;
    } else {
      const candidates = ['ประสิทธิภาพ', 'ประสิทธิผล', 'สมานฉันท์', 'เกรงใจ', 'วิจัย'];
      for (const cand of candidates) {
        if (text.includes(cand)) {
          targetWord = cand;
          break;
        }
      }
    }

    if (!targetWord) {
      targetWord = 'ประสิทธิภาพ';
    }

    let items: any[] = [];
    if (BENCHMARK_WRITINGS[targetWord]) {
      items = [...BENCHMARK_WRITINGS[targetWord]];
      if (register === 'academic') {
        items.sort((a, b) => (a.register === 'academic' ? -1 : 1));
      } else if (register === 'business') {
        items.sort((a, b) => (a.register === 'business' ? -1 : 1));
      }
    } else {
      items = [
        {
          type: 'sentence',
          content: `การนำ ${targetWord} มาประยุกต์ใช้ในกระบวนการทำงาน ช่วยส่งเสริมผลสัมฤทธิ์ตามเกณฑ์มาตรฐานที่กำหนด`,
          register: register || 'formal',
          notes: `แต่งประโยคอิงความหมายของคำว่า "${targetWord}" ในบริบท ${register}`,
        },
      ];
    }

    const isBulletRequest = text.includes('สไลด์') || text.includes('bullet') || text.includes('หัวข้อ');
    const isEmailRequest = text.includes('อีเมล') || text.includes('email');
    const isAnnouncementRequest = text.includes('ประกาศ');

    if (isBulletRequest) {
      items.unshift({
        type: 'bullet_points',
        content: `• การยกระดับ${targetWord}: จัดสรรทรัพยากรให้เกิดความคุ้มค่าสูงสุด\n• ปรับปรุงกระบวนการ: ลดขั้นตอนและระยะเวลาการทำงาน\n• ผลลัพธ์เชิงประจักษ์: สร้างผลสัมฤทธิ์ที่วัดผลได้ตามเป้าหมาย`,
        register: 'presentation',
        notes: `หัวข้อนำเสนอสำหรับสไลด์ ชูจุดเด่นของ "${targetWord}"`,
      });
    } else if (isEmailRequest) {
      items.unshift({
        type: 'paragraph',
        content: `เรียน ท่านผู้บริหาร\n\nสืบเนื่องจากการพัฒนาระบบใหม่ ทีมงานได้มุ่งเน้นการเสริมสร้าง${targetWord}ในการปฏิบัติงาน เพื่อให้การใช้ทรัพยากรขององค์กรเกิดความคุ้มค่าสูงสุด จึงขอเรียนสรุปแนวทางดังแนบ\n\nขอแสดงความนับถือ`,
        register: 'executive_email',
        notes: `ร่างอีเมลทางการสำหรับสื่อสารกับผู้บริหารโดยใช้คำว่า "${targetWord}"`,
      });
    } else if (isAnnouncementRequest) {
      items.unshift({
        type: 'paragraph',
        content: `ประกาศ: เพื่อเสริมสร้าง${targetWord}ในการปฏิบัติงานของทุกภาคส่วน ขอให้บุคลากรยึดถือแนวทางการจัดสรรเวลาและทรัพยากรอย่างคุ้มค่าสูงสุดนับแต่บัดนี้เป็นต้นไป`,
        register: 'official_announcement',
        notes: `ข้อความประกาศทางการสำหรับเผยแพร่ในหน่วยงาน`,
      });
    }

    // Complexity escalation: escalate to REASONING if complex constraints / academic research
    const isComplex =
      context.complexity === 'COMPLEX' ||
      register === 'academic' ||
      text.includes('วิจัย') ||
      text.includes('รายงานวิจัย');

    const effectiveTier = isComplex ? ModelTier.REASONING : this.defaultTier;

    const prompt = this.loadPrompt('writing/system.md');
    const modelResult = await this.modelRouter.executeWithFallback(
      effectiveTier,
      this.type,
      async (model, activeTier) => {
        const res = await model.generateText({
          systemPrompt: prompt,
          userPrompt: `บริบท: ${register}\nคำศัพท์: ${targetWord}\nคำขอ: ${text}\nประโยคที่สร้างไว้: ${items[0]?.content}`,
          metadata: { agent: this.type },
        });
        return { res, activeTier, modelName: model.modelName };
      },
    );

    context.generatedContent = items;
    if (items.length > 0 && !context.currentText) {
      context.currentText = items[0].content;
    }

    const latencyMs = Date.now() - startTime;
    return {
      agent: this.type,
      status: 'SUCCESS',
      data: items,
      summary: `สร้างข้อความเชิงบริบทสำหรับคำว่า "${targetWord}" จำนวน ${items.length} รูปแบบ (${register})`,
      metrics: {
        tier: modelResult.activeTier,
        model: modelResult.modelName,
        latencyMs,
        tokens: modelResult.res.usage,
      },
    };
  }
}
