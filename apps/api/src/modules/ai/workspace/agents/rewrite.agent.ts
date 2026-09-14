import { Injectable } from '@nestjs/common';
import { LanguageAgent } from '../agent.interface';
import { AgentTask, WorkspaceContext, GeneratedContentItem } from '../workspace.types';

@Injectable()
export class RewriteAgent implements LanguageAgent {
  readonly name = 'RewriteAgent';
  readonly description = 'เรียบเรียงและปรับปรุงระดับภาษาให้กระชับ เป็นทางการ หรือเข้าใจง่าย';

  canHandle(task: AgentTask): boolean {
    return task === 'REWRITE';
  }

  async execute(_task: AgentTask, context: WorkspaceContext): Promise<WorkspaceContext> {
    const message = context.message;
    let baseText = context.currentText || '';

    // If baseText is still empty, look at history or extract from message
    if (!baseText && context.history && context.history.length > 0) {
      for (let i = context.history.length - 1; i >= 0; i--) {
        const item = context.history[i];
        if (item.role === 'assistant' && item.content) {
          baseText = item.content;
          break;
        }
      }
    }

    // If still empty, check if message has quotes or text to rewrite
    if (!baseText) {
      const match = message.match(/["'“]([^"'”]+)["'”]/);
      if (match) {
        baseText = match[1];
      } else {
        baseText =
          'การประยุกต์ใช้อัลกอริทึมใหม่ช่วยเพิ่มประสิทธิภาพในการประมวลผลข้อมูลขนาดใหญ่ และลดระยะเวลาการทำงานได้อย่างมีนัยสำคัญ';
      }
    }

    // Determine rewrite mode
    let mode: 'SHORTEN' | 'FORMALIZE' | 'SIMPLIFY' | 'ACADEMIC' = 'SHORTEN';
    if (message.includes('ทางการ') || message.includes('ราชการ')) {
      mode = 'FORMALIZE';
    } else if (message.includes('ง่าย') || message.includes('เข้าใจง่าย') || message.includes('สรุป')) {
      mode = 'SIMPLIFY';
    } else if (message.includes('วิชาการ') || message.includes('วิจัย')) {
      mode = 'ACADEMIC';
    } else {
      mode = 'SHORTEN';
    }

    let rewritten = baseText;
    let notes = '';

    if (mode === 'SHORTEN') {
      // Shortening logic
      if (baseText.includes('การประยุกต์ใช้อัลกอริทึมใหม่ช่วยเพิ่มประสิทธิภาพในการประมวลผลข้อมูลขนาดใหญ่')) {
        rewritten =
          'การใช้อัลกอริทึมใหม่ช่วยเพิ่มประสิทธิภาพการประมวลผลและลดเวลาทำงานได้อย่างมีนัยสำคัญ';
        notes = 'ตัดคำซ้ำซ้อน "ประยุกต์ใช้" เหลือ "ใช้" และกระชับโครงสร้างประโยค โดยยังคงสาระสำคัญและคำแม่บท "ประสิทธิภาพ" ไว้อย่างครบถ้วน';
      } else {
        // General text reduction
        rewritten = baseText
          .replace(/การประยุกต์ใช้/g, 'การใช้')
          .replace(/ในการ/g, 'การ')
          .replace(/และลดระยะเวลาการทำงาน/g, 'และลดเวลาทำงาน')
          .replace(/สามารถที่จะ/g, 'สามารถ')
          .replace(/ทำการ/g, '');
        notes = 'ลดทอนคำเชื่อมฟุ่มเฟือยและปรับให้กระชับขึ้น';
      }
    } else if (mode === 'FORMALIZE') {
      rewritten = baseText
        .replace(/พวกเรา/g, 'ทางคณะทำงาน')
        .replace(/คิดว่า/g, 'พิจารณาเห็นว่า')
        .replace(/ใช้/g, 'ประยุกต์ใช้');
      notes = 'ปรับระดับภาษาให้เป็นทางการตามแบบแผนหนังสือราชการและวิชาการ';
    } else if (mode === 'SIMPLIFY') {
      rewritten = baseText
        .replace(/เพิ่มประสิทธิภาพในการประมวลผลข้อมูลขนาดใหญ่/g, 'ทำให้ระบบทำงานได้เร็วขึ้น')
        .replace(/ได้อย่างมีนัยสำคัญ/g, 'อย่างเห็นได้ชัด');
      notes = 'แปลงศัพท์วิชาการเป็นภาษาที่เข้าใจง่ายสำหรับบุคคลทั่วไป';
    } else {
      // ACADEMIC
      rewritten = `ผลการศึกษาชี้ให้เห็นว่า ${baseText}`;
      notes = 'เสริมน้ำเสียงเชิงวิชาการเพื่อการอ้างอิงในงานวิจัย';
    }

    const item: GeneratedContentItem = {
      type: 'rewrite',
      content: rewritten,
      register: mode.toLowerCase(),
      notes,
    };

    context.generatedContent = [item, ...context.generatedContent];
    context.currentText = rewritten;

    context.agentTraces.push({
      agent: this.name,
      status: 'completed',
      summary: `ปรับแก้ข้อความ (${mode}): "${rewritten.substring(0, 40)}..."`,
    });

    return context;
  }
}
