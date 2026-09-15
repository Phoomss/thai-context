import { Injectable } from '@nestjs/common';
import { LanguageAgent } from '../agent.interface';
import { AgentTask, WorkspaceContext, ContextInfo, ContextType } from '../workspace.types';

@Injectable()
export class ContextAgent implements LanguageAgent {
  readonly name = 'ContextAgent';
  readonly description = 'วิเคราะห์บริบท ระดับภาษา กลุ่มเป้าหมาย และเจตนาการสื่อสาร';

  canHandle(task: AgentTask): boolean {
    return task === 'CONTEXT_ANALYSIS';
  }

  async execute(_task: AgentTask, context: WorkspaceContext): Promise<WorkspaceContext> {
    const text = (context.message + ' ' + (context.currentText || '')).toLowerCase();

    // Check if user provided context explicitly
    if (context.userContext && context.userContext.type) {
      context.inferredContext = {
        type: context.userContext.type,
        tone: context.userContext.tone || 'formal',
        audience: context.userContext.audience || 'ทั่วไป',
        source: 'USER_PROVIDED',
      };
    } else {
      // AI Inferred context based on lexical patterns
      let detectedType: ContextType = 'general';
      let detectedTone = 'neutral';
      let detectedAudience = 'ผู้อ่านทั่วไป';

      if (text.includes('รายงาน') || text.includes('มหาวิทยาลัย') || text.includes('วิชาการ') || text.includes('วิจัย') || text.includes('วิทยานิพนธ์')) {
        detectedType = 'academic';
        detectedTone = 'formal';
        detectedAudience = 'อาจารย์ / คณะกรรมการวิชาการ';
      } else if (text.includes('ราชการ') || text.includes('หนังสือราชการ') || text.includes('สารบรรณ') || text.includes('กระทรวง') || text.includes('ประกาศ')) {
        detectedType = 'government';
        detectedTone = 'formal';
        detectedAudience = 'หน่วยงานราชการและประชาชน';
      } else if (text.includes('บริษัท') || text.includes('ธุรกิจ') || text.includes('ประชุม') || text.includes('ลูกค้า') || text.includes('อีเมล')) {
        detectedType = 'business';
        detectedTone = 'professional';
        detectedAudience = 'ผู้บริหาร / คู่ค้าธุรกิจ';
      } else if (text.includes('เพื่อน') || text.includes('คุย') || text.includes('แชท') || text.includes('สบาย') || text.includes('ปาก')) {
        detectedType = 'casual';
        detectedTone = 'conversational';
        detectedAudience = 'เพื่อนร่วมงาน / คนสนิท';
      } else {
        detectedType = 'professional';
        detectedTone = 'polite';
        detectedAudience = 'ผู้อ่านทั่วไป';
      }

      context.inferredContext = {
        type: detectedType,
        tone: detectedTone,
        audience: detectedAudience,
        source: 'AI_INFERRED',
      };
    }

    context.agentTraces.push({
      agent: this.name,
      status: 'completed',
      summary: `วิเคราะห์บริบท: ${context.inferredContext.type} (${context.inferredContext.tone}) [${context.inferredContext.source}]`,
    });

    return context;
  }
}
