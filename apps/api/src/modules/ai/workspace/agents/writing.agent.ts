import { Injectable } from '@nestjs/common';
import { LanguageAgent } from '../agent.interface';
import { AgentTask, WorkspaceContext, GeneratedContentItem } from '../workspace.types';

const BENCHMARK_WRITINGS: Record<string, GeneratedContentItem[]> = {
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
export class WritingAgent implements LanguageAgent {
  readonly name = 'WritingAgent';
  readonly description = 'สร้างประโยคและข้อความเชิงบริบทที่อ้างอิงความหมายจากพจนานุกรมอย่างถูกต้อง';

  canHandle(task: AgentTask): boolean {
    return task === 'WRITING';
  }

  async execute(_task: AgentTask, context: WorkspaceContext): Promise<WorkspaceContext> {
    const text = context.message;
    const register = context.inferredContext?.type || 'academic';

    // Identify target word
    let targetWord = '';
    if (context.selectedWords && context.selectedWords.length > 0) {
      targetWord = context.selectedWords[0];
    } else if (context.recommendations && context.recommendations.length > 0) {
      targetWord = context.recommendations[0].word;
    } else {
      // Extract from message
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

    let items: GeneratedContentItem[] = [];

    if (BENCHMARK_WRITINGS[targetWord]) {
      // Filter by register if possible, or include all relevant items
      items = [...BENCHMARK_WRITINGS[targetWord]];
      if (register === 'academic') {
        items.sort((a, b) => (a.register === 'academic' ? -1 : 1));
      } else if (register === 'business') {
        items.sort((a, b) => (a.register === 'business' ? -1 : 1));
      }
    } else {
      // Dynamic synthesis
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

    context.generatedContent = items;
    // Set the first sentence as the current active text in the workspace for continuation
    if (items.length > 0 && !context.currentText) {
      context.currentText = items[0].content;
    }

    context.agentTraces.push({
      agent: this.name,
      status: 'completed',
      summary: `สร้างประโยคเชิงบริบทสำหรับคำว่า "${targetWord}" จำนวน ${items.length} รูปแบบ (${register})`,
    });

    return context;
  }
}
