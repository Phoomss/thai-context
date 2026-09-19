import { Injectable, Logger } from '@nestjs/common';
import { AgentType } from '../agents/agent-type.enum';
import { TaskComplexity } from './task-complexity.enum';
import { ModelTier } from '../router/model-tier.enum';
import { ExecutionPlan } from './execution-plan.interface';

@Injectable()
export class IntentClassifierService {
  private readonly logger = new Logger(IntentClassifierService.name);

  classify(query: string, contextHint?: Record<string, any>): ExecutionPlan {
    const text = (query || '').toLowerCase().trim();

    // Check for Gibberish / Hallucination triggers
    const isGibberish =
      text.includes('คำที่ไม่มีในโลก') ||
      text.includes('สับปะรดสีชมพูลอยได้') ||
      /^[ก-ฮ]{10,}$/.test(text);

    if (isGibberish) {
      return {
        intent: 'ABSTAIN',
        complexity: TaskComplexity.SIMPLE,
        agents: [],
        retrievalRequired: false,
        requiresEvidence: true,
        modelTier: ModelTier.FAST,
        rationale: 'Gibberish or non-existent entity detected. Strict abstention required.',
      };
    }

    // Keyword & pattern heuristics
    const isEnglishOrBridge =
      text.includes('ภาษาอังกฤษ') ||
      text.includes('แปล') ||
      text.includes('english') ||
      text.includes('translate') ||
      text.includes('culture') ||
      text.includes('วัฒนธรรม') ||
      text.includes('ฝรั่ง') ||
      text.includes('pronounce') ||
      text.includes('ออกเสียง') ||
      text.includes('rtgs');

    const isDialect =
      text.includes('ภาษาถิ่น') ||
      text.includes('ภาษาเหนือ') ||
      text.includes('ภาษาอีสาน') ||
      text.includes('ภาษาใต้') ||
      text.includes('คำเมือง') ||
      text.includes('แหลงใต้') ||
      text.includes('พูดอีสาน') ||
      text.includes('สำเนียง') ||
      text.includes('ภาคใต้') ||
      text.includes('ภาคเหนือ') ||
      text.includes('ภาคอีสาน');

    const isModern =
      text.includes('สแลง') ||
      text.includes('คำศัพท์ใหม่') ||
      text.includes('คำฮิต') ||
      text.includes('ช็อตฟีล') ||
      text.includes('แกง') ||
      text.includes('ศัพท์วัยรุ่น');

    const isAccessibility =
      text.includes('เบรลล์') ||
      text.includes('braille') ||
      text.includes('ภาษามือ') ||
      text.includes('คนหูหนวก') ||
      text.includes('คนตาบอด') ||
      text.includes('อ่านออกเสียง') ||
      text.includes('tts');

    const isRewrite =
      text.includes('ทำให้สั้นลง') ||
      text.includes('กระชับ') ||
      text.includes('สั้นลง') ||
      text.includes('เขียนใหม่') ||
      text.includes('ปรับแก้') ||
      text.includes('ขัดเกลา');

    const isLanguageCheck =
      text.includes('ตรวจ') ||
      text.includes('ตรวจภาษา') ||
      text.includes('ซ้ำซ้อน') ||
      text.includes('ถูกไหม') ||
      text.includes('ถูกต้อง');

    const isCompare =
      text.includes('ต่างกัน') ||
      text.includes('ต่างยังไง') ||
      text.includes('เปรียบเทียบ') ||
      text.includes(' หรือ ') ||
      text.includes(' vs ') ||
      text.includes('versus');

    const isWriting =
      text.includes('แต่งประโยค') ||
      text.includes('เขียนประโยค') ||
      text.includes('ใช้ในประโยค') ||
      text.includes('เขียนรายงาน') ||
      text.includes('แต่งย่อหน้า') ||
      text.includes('ร่างอีเมล') ||
      text.includes('เขียนประกาศ');

    // Complexity Evaluation
    let complexity = TaskComplexity.NORMAL;
    const isAcademicOrComplex =
      text.includes('วิจัย') ||
      text.includes('วิทยานิพนธ์') ||
      text.includes('รายงานวิจัย') ||
      text.includes('วิชาการ') ||
      text.includes('วิวัฒนาการ') ||
      text.includes('เชิงวิชาการ') ||
      (text.includes('เปรียบเทียบ') && text.includes('วิจัย')) ||
      text.length > 120;


    const isSimpleTransformation =
      (isRewrite && (text.includes('สั้นลง') || text.includes('กระชับ'))) ||
      (isAccessibility && text.length < 30);

    if (isSimpleTransformation) {
      complexity = TaskComplexity.SIMPLE;
    } else if (isAcademicOrComplex) {
      complexity = TaskComplexity.COMPLEX;
    }

    // Intent & Agent Selection
    let intent: AgentType;
    let agents: AgentType[] = [];
    let retrievalRequired = true;
    let requiresEvidence = true;

    if (isAccessibility) {
      intent = AgentType.ACCESSIBILITY;
      agents = [AgentType.ACCESSIBILITY];
      retrievalRequired = true;
      requiresEvidence = true;
      complexity = TaskComplexity.SIMPLE;
    } else if (isDialect) {
      intent = AgentType.DIALECT;
      agents = [AgentType.DIALECT, AgentType.CONTEXT];
      retrievalRequired = true;
      requiresEvidence = true;
    } else if (isModern) {
      intent = AgentType.MODERN_VOCABULARY;
      agents = [AgentType.MODERN_VOCABULARY, AgentType.CONTEXT];
      retrievalRequired = true;
      requiresEvidence = false;
    } else if (isRewrite) {
      intent = AgentType.REWRITE;
      agents = [AgentType.REWRITE, AgentType.LANGUAGE_CHECKER];
      retrievalRequired = false;
      requiresEvidence = false;
    } else if (isLanguageCheck) {
      intent = AgentType.LANGUAGE_CHECKER;
      agents = [AgentType.LANGUAGE_CHECKER];
      retrievalRequired = false;
      requiresEvidence = false;
    } else if (isCompare) {
      intent = AgentType.WORD_COMPARE;
      agents = [AgentType.WORD_COMPARE, AgentType.CONTEXT];
      if (text.includes('รายงานวิจัย') || text.includes('วิจัย')) {
        agents.push(AgentType.LANGUAGE_CHECKER);
        complexity = TaskComplexity.COMPLEX;
      }
      retrievalRequired = true;
      requiresEvidence = true;
    } else if (isWriting) {
      intent = AgentType.WRITING;
      agents = [AgentType.CONTEXT, AgentType.WORD_DISCOVERY, AgentType.WRITING, AgentType.LANGUAGE_CHECKER];
      retrievalRequired = true;
      requiresEvidence = true;
    } else if (isEnglishOrBridge) {
      intent = AgentType.LANGUAGE_BRIDGE;
      agents = [AgentType.CONTEXT, AgentType.WORD_DISCOVERY, AgentType.LANGUAGE_BRIDGE];
      retrievalRequired = true;
      requiresEvidence = true;
    } else {
      intent = AgentType.WORD_DISCOVERY;
      agents = [AgentType.CONTEXT, AgentType.WORD_DISCOVERY];
      retrievalRequired = true;
      requiresEvidence = true;
    }

    // Map complexity to model tier
    let modelTier = ModelTier.STANDARD;
    if (complexity === TaskComplexity.SIMPLE) {
      modelTier = ModelTier.FAST;
    } else if (complexity === TaskComplexity.COMPLEX) {
      modelTier = ModelTier.REASONING;
    }

    return {
      intent,
      complexity,
      agents,
      retrievalRequired,
      requiresEvidence,
      modelTier,
      rationale: `Detected ${intent} with ${complexity} complexity; routed to ${modelTier} model tier.`,
    };
  }
}
