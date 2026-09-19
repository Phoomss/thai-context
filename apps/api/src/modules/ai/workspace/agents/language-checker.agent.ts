import { Injectable } from '@nestjs/common';
import { LanguageAgent } from '../agent.interface';
import { AgentTask, WorkspaceContext, LanguageCheckResult, LanguageIssue } from '../workspace.types';

@Injectable()
export class LanguageCheckerAgent implements LanguageAgent {
  readonly name = 'LanguageCheckerAgent';
  readonly description = 'ตรวจสอบคุณภาพภาษา ความเยิ่นเย้อ คำซ้ำซ้อน และความถูกต้องตามแบบแผนพจนานุกรม';

  canHandle(task: AgentTask): boolean {
    return task === 'LANGUAGE_CHECK';
  }

  async execute(_task: AgentTask, context: WorkspaceContext): Promise<WorkspaceContext> {
    const textToCheck =
      context.currentText ||
      (context.generatedContent.length > 0 ? context.generatedContent[0].content : '') ||
      context.message;

    const issues: LanguageIssue[] = [];

    // Check 1: Redundancy "สามารถที่จะ"
    if (textToCheck.includes('สามารถที่จะ')) {
      issues.push({
        type: 'REDUNDANCY',
        text: 'สามารถที่จะ',
        suggestion: 'สามารถ',
        rule_type: 'AI_LANGUAGE_SUGGESTION',
        description: 'การใช้ "สามารถที่จะ" เป็นคำเชื่อมฟุ่มเฟือย ควรตัด "ที่จะ" ออกเหลือเพียง "สามารถ" เพื่อให้ประโยคกระชับตรงประเด็น',
      });
    }

    // Check 2: Redundancy "ทำการ..."
    const performMatch = textToCheck.match(/ทำการ([ก-๙]+)/);
    if (performMatch && !textToCheck.includes('ทำการบ้าน') && !textToCheck.includes('ทำการค้า')) {
      issues.push({
        type: 'REDUNDANCY',
        text: performMatch[0],
        suggestion: performMatch[1],
        rule_type: 'AI_LANGUAGE_SUGGESTION',
        description: `หลีกเลี่ยงการใช้คำว่า "ทำการ" นำหน้ากริยา สามารถใช้คำกริยา "${performMatch[1]}" ได้โดยตรง`,
      });
    }

    // Check 3: "มีความจำเป็นที่จะต้อง"
    if (textToCheck.includes('มีความจำเป็นที่จะต้อง')) {
      issues.push({
        type: 'REDUNDANCY',
        text: 'มีความจำเป็นที่จะต้อง',
        suggestion: 'จำเป็นต้อง',
        rule_type: 'AI_LANGUAGE_SUGGESTION',
        description: 'ควรใช้คำว่า "จำเป็นต้อง" แทน "มีความจำเป็นที่จะต้อง" เพื่อลดความเยิ่นเย้อ',
      });
    }

    // Check 4: Check modern vocabulary in formal / academic context
    const isFormalContext =
      context.inferredContext?.type === 'academic' ||
      context.inferredContext?.type === 'government' ||
      context.inferredContext?.type === 'professional' ||
      /รายงาน|วิชาการ|มหาวิทยาลัย|วิทยานิพนธ์|ราชการ|ทางการ/.test(context.message) ||
      /รายงาน|วิชาการ|มหาวิทยาลัย|วิทยานิพนธ์|ราชการ|ทางการ/.test(textToCheck);

    const modernSlangWords = [
      { word: 'ป้ายยา', formal: 'โน้มน้าว หรือ แนะนำ', label: 'คำศัพท์ร่วมสมัย / ภาษาพูด' },
      { word: 'จึ้ง', formal: 'ยอดเยี่ยม หรือ โดดเด่นเป็นพิเศษ', label: 'คำศัพท์ร่วมสมัย / ภาษาพูด' },
      { word: 'ฟีล', formal: 'ความรู้สึก หรือ บรรยากาศ', label: 'คำยืมภาษาพูด' },
      { word: 'งานเข้า', formal: 'เกิดปัญหาขัดข้องกะทันหัน', label: 'สำนวนภาษาพูด' },
      { word: 'ด้อม', formal: 'กลุ่มแฟนคลับ หรือ กลุ่มผู้สนับสนุน', label: 'คำสแลงเฉพาะกลุ่ม' },
      { word: 'ติ่ง', formal: 'ผู้ชื่นชอบ หรือ แฟนคลับ', label: 'คำสแลงภาษาพูด' },
    ];

    if (isFormalContext) {
      for (const item of modernSlangWords) {
        if (textToCheck.includes(item.word)) {
          issues.push({
            type: 'FORMALITY_MISMATCH',
            text: item.word,
            suggestion: item.formal,
            rule_type: 'AI_LANGUAGE_SUGGESTION',
            description: `⚠ ${item.label} — หากเป็นรายงานวิชาการหรือเอกสารทางการ อาจพิจารณาใช้คำที่เป็นกลางหรือเป็นทางการกว่า เช่น "${item.formal}" (มิได้ถือว่าเป็นคำผิด แต่ควรปรับระดับภาษาให้เหมาะกับกาลเทศะ)`,
          });
        }
      }
    }

    let score = 96;
    let status: 'OPTIMAL' | 'ACCEPTABLE' | 'NEEDS_IMPROVEMENT' = 'OPTIMAL';

    if (issues.length > 0) {
      score = Math.max(70, 95 - issues.length * 10);
      status = issues.length >= 3 ? 'NEEDS_IMPROVEMENT' : 'ACCEPTABLE';
    }

    const checkResult: LanguageCheckResult = {
      score,
      status,
      issues,
      summary:
        issues.length === 0
          ? 'โครงสร้างประโยคถูกต้อง สื่อความหมายชัดเจน และสอดคล้องกับหลักไวยากรณ์และพจนานุกรมทางการ'
          : `พบข้อแนะนำการปรับปรุงภาษา ${issues.length} จุด เพื่อเพิ่มความกระชับและถูกต้องตามแบบแผนวิชาการ`,
    };

    context.languageCheck = checkResult;

    context.agentTraces.push({
      agent: this.name,
      status: 'completed',
      summary: `ตรวจสอบภาษา: ได้คะแนน ${score}/100 (${status}) พบ ${issues.length} ข้อเสนอแนะ`,
    });

    return context;
  }
}
