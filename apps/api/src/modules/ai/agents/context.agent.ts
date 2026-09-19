import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base/base.agent';
import { AgentType } from './agent-type.enum';
import { ModelTier } from '../router/model-tier.enum';
import { AgentContext, AgentResult } from './base/agent.interface';
import { ModelRouter } from '../router/model-router.service';

@Injectable()
export class ContextAgent extends BaseAgent {
  readonly type = AgentType.CONTEXT;
  readonly defaultTier = ModelTier.STANDARD;

  constructor(modelRouter: ModelRouter) {
    super(modelRouter);
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const query = (context.userQuery || context.message || '').toLowerCase();

    let contextType = 'general';
    let tone = 'สุภาพและเป็นกลาง';
    let audience = 'บุคคลทั่วไป';
    let domain = 'ภาษาศาสตร์ทั่วไป';
    let source: 'USER_PROVIDED' | 'AI_INFERRED' = 'AI_INFERRED';

    // 1. Check user provided context
    if (context.userContext?.type) {
      contextType = context.userContext.type;
      source = 'USER_PROVIDED';
      if (context.userContext.tone) tone = context.userContext.tone;
      if (context.userContext.audience) audience = context.userContext.audience;
    } else {
      // 2. Deterministic rule-based inference
      if (query.includes('วิชาการ') || query.includes('วิจัย') || query.includes('วิทยานิพนธ์') || query.includes('รายงาน')) {
        contextType = 'academic';
        tone = 'ทางการและเป็นกลางตามหลักวิชาการ';
        audience = 'นักวิชาการ, อาจารย์, คณะกรรมการประเมิน';
        domain = 'งานวิจัยและการศึกษา';
      } else if (query.includes('ธุรกิจ') || query.includes('บริษัท') || query.includes('ลูกค้า') || query.includes('ผู้บริหาร')) {
        contextType = 'business';
        tone = 'มืออาชีพและน่าเชื่อถือ';
        audience = 'ผู้บริหาร, หุ้นส่วนธุรกิจ, ลูกค้า';
        domain = 'การบริหารธุรกิจและการพาณิชย์';
      } else if (query.includes('ราชการ') || query.includes('ประกาศ') || query.includes('คำสั่ง')) {
        contextType = 'government';
        tone = 'ทางการสูงและถูกต้องตามแบบแผนราชการ';
        audience = 'ประชาชน, ข้าราชการ, หน่วยงานรัฐ';
        domain = 'ระเบียบแบบแผนทางราชการ';
      } else if (query.includes('คุยเล่น') || query.includes('เพื่อน') || query.includes('กันเอง')) {
        contextType = 'casual';
        tone = 'เป็นกันเองและเข้าถึงง่าย';
        audience = 'เพื่อน, ผู้ติดตามในโซเชียลมีเดีย';
        domain = 'การสื่อสารในชีวิตประจำวัน';
      }
    }

    const contextInfo = {
      type: contextType,
      tone,
      audience,
      domain,
      source,
    };

    context.inferredContext = contextInfo;

    const latencyMs = Date.now() - startTime;
    return {
      agent: this.type,
      status: 'SUCCESS',
      data: contextInfo,
      summary: `วิเคราะห์บริบท: ${contextType} (ระดับภาษา: ${tone}, กลุ่มเป้าหมาย: ${audience})`,
      metrics: {
        tier: this.defaultTier,
        model: 'context-resolver',
        latencyMs,
      },
    };
  }
}
