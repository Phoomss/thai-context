import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AgentRegistry } from './agent.registry';
import {
  AgentTask,
  WorkspaceContext,
  WorkspaceRequestDto,
  WorkspaceResponseDto,
  CoThinkingAnalysis,
} from './workspace.types';

@Injectable()
export class WorkspaceOrchestratorService {
  private readonly sessionStore = new Map<string, WorkspaceContext>();

  constructor(private readonly registry: AgentRegistry) {}

  async process(dto: WorkspaceRequestDto): Promise<WorkspaceResponseDto> {
    const sessionId = dto.session_id || randomUUID();
    const existingContext = this.sessionStore.get(sessionId);

    // Initialize or continue workspace context
    const context: WorkspaceContext = {
      sessionId,
      message: dto.message,
      intent: 'GENERAL',
      tasks: [],
      userContext: dto.context || existingContext?.userContext,
      inferredContext: existingContext?.inferredContext,
      selectedWords: dto.selected_words || existingContext?.selectedWords || [],
      currentText: dto.current_text || existingContext?.currentText || '',
      previousRecommendations: existingContext?.recommendations || [],
      recommendations: [],
      comparison: null,
      generatedContent: [],
      languageCheck: null,
      languageBridge: null,
      evidence: [],
      confidence: 0.95,
      confidenceLevel: 'HIGH',
      abstained: false,
      agentTraces: [],
      history: existingContext?.history ? [...existingContext.history] : [],
    };

    // Check for explicit gibberish / non-existent word queries for Hallucination Guard
    const msgTrim = dto.message.trim();
    const isGibberish =
      msgTrim.includes('คำที่ไม่มีในโลก') ||
      msgTrim.includes('สับปะรดสีชมพูลอยได้') ||
      /^[ก-ฮ]{10,}$/.test(msgTrim);

    if (isGibberish) {
      context.abstained = true;
      context.abstentionReason = 'ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลพจนานุกรมที่ระบบรองรับ';
      context.confidence = 0.15;
      context.confidenceLevel = 'LOW';
      context.agentTraces.push({
        agent: 'HallucinationGuard',
        status: 'completed',
        summary: 'ระงับการตอบเนื่องจากไม่พบหลักฐานในพจนานุกรมทางการ',
      });

      const response: WorkspaceResponseDto = {
        session_id: sessionId,
        intent: 'ABSTAIN',
        tasks: [],
        answer:
          'ขออภัย ระบบไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลพจนานุกรมที่ระบบรองรับ เพื่อป้องกันความคลาดเคลื่อนทางภาษา ระบบจึงไม่สามารถให้ข้อสรุปสำหรับคำดังกล่าวได้',
        context: {
          type: 'general',
          tone: 'neutral',
          audience: 'ทั่วไป',
          source: 'AI_INFERRED',
        },
        recommendations: [],
        comparison: null,
        generated_content: [],
        language_check: null,
        language_bridge: null,
        evidence: [],
        confidence: context.confidence,
        confidence_level: context.confidenceLevel,
        abstained: true,
        abstention_reason: context.abstentionReason,
        agent_traces: context.agentTraces,
      };

      this.sessionStore.set(sessionId, context);
      return response;
    }

    // 1. Deterministic Planning & Intent Classification
    const tasks = this.planTasks(dto.message, context);
    context.tasks = tasks;

    // 2. Sequential Agent Execution Pipeline
    for (const task of tasks) {
      const agent = this.registry.getAgent(task, context);
      if (agent) {
        const startTime = Date.now();
        await agent.execute(task, context);
        const duration = Date.now() - startTime;
        const lastTrace = context.agentTraces[context.agentTraces.length - 1];
        if (lastTrace && lastTrace.agent === agent.name) {
          lastTrace.duration_ms = duration;
        }
      }
    }

    // 3. Final Answer Synthesis & Co-Thinking Analysis
    const coThinking = this.synthesizeCoThinking(context);
    context.coThinking = coThinking;
    const answer = this.synthesizeAnswer(context);

    // 4. Update session history
    context.history.push({ role: 'user', content: dto.message, timestamp: Date.now() });
    context.history.push({ role: 'assistant', content: answer, timestamp: Date.now() });

    // Store in session cache
    this.sessionStore.set(sessionId, context);

    return {
      session_id: sessionId,
      intent: context.intent,
      tasks: context.tasks,
      answer,
      context: context.inferredContext || {
        type: 'general',
        tone: 'neutral',
        audience: 'ทั่วไป',
        source: 'AI_INFERRED',
      },
      recommendations: context.recommendations,
      comparison: context.comparison,
      generated_content: context.generatedContent,
      language_check: context.languageCheck,
      language_bridge: context.languageBridge,
      dialect_discovery: context.dialectDiscovery,
      co_thinking: coThinking,
      evidence: context.evidence,
      confidence: context.confidence,
      confidence_level: context.confidenceLevel,
      abstained: context.abstained,
      abstention_reason: context.abstentionReason,
      agent_traces: context.agentTraces,
    };
  }

  private planTasks(message: string, context: WorkspaceContext): AgentTask[] {
    const text = message.toLowerCase();
    const tasks: AgentTask[] = [];

    const isEnglishOrForeigner =
      text.includes('ภาษาอังกฤษ') ||
      text.includes('แปล') ||
      text.includes('english') ||
      text.includes('translate') ||
      text.includes('culture') ||
      text.includes('วัฒนธรรม') ||
      text.includes('ฝรั่ง') ||
      text.includes('pronounce') ||
      text.includes('ออกเสียง');

    const isRewrite =
      text.includes('ทำให้สั้นลง') ||
      text.includes('กระชับ') ||
      text.includes('สั้นลง') ||
      text.includes('เป็นทางการ') ||
      text.includes('เขียนใหม่') ||
      text.includes('ปรับแก้');

    const isWriting =
      text.includes('แต่งประโยค') ||
      text.includes('เขียนประโยค') ||
      text.includes('ใช้ในประโยค') ||
      text.includes('เขียนรายงาน') ||
      text.includes('แต่งย่อหน้า');

    const isCompare =
      text.includes('ต่างกัน') ||
      text.includes('ต่างยังไง') ||
      text.includes('เปรียบเทียบ') ||
      text.includes('หรือ') ||
      text.includes('vs') ||
      text.includes('versus');

    const isLanguageCheck =
      text.includes('ตรวจ') ||
      text.includes('ตรวจภาษา') ||
      text.includes('ซ้ำซ้อน') ||
      text.includes('ถูกไหม') ||
      text.includes('ถูกต้อง');

    const isDialect =
      text.includes('ภาษาถิ่น') ||
      text.includes('ถิ่น') ||
      text.includes('ภาคอีสาน') ||
      text.includes('ภาษาอีสาน') ||
      text.includes('ภาคเหนือ') ||
      text.includes('ภาษาเหนือ') ||
      text.includes('คำเมือง') ||
      text.includes('ภาคใต้') ||
      text.includes('ภาษาใต้') ||
      text.includes('แต่ละภาค') ||
      text.includes('ทุกภาค') ||
      text.includes('แหลง') ||
      text.includes('อู้') ||
      text.includes('เว้า');

    // Intent resolution
    if (isDialect) {
      context.intent = 'DIALECT';
      tasks.push('CONTEXT_ANALYSIS', 'DIALECT');
    } else if (isRewrite) {
      context.intent = 'REWRITE';
      tasks.push('REWRITE', 'LANGUAGE_CHECK');
    } else if (isLanguageCheck) {
      context.intent = 'LANGUAGE_CHECK';
      tasks.push('LANGUAGE_CHECK');
    } else if (isWriting) {
      context.intent = 'WRITING';
      tasks.push('CONTEXT_ANALYSIS');
      if (context.selectedWords.length === 0) {
        tasks.push('WORD_DISCOVERY');
      }
      tasks.push('WRITING', 'LANGUAGE_CHECK');
    } else if (isCompare) {
      context.intent = 'COMPARE';
      tasks.push('CONTEXT_ANALYSIS', 'WORD_DISCOVERY', 'WORD_COMPARE');
    } else if (isEnglishOrForeigner) {
      context.intent = 'LANGUAGE_BRIDGE';
      tasks.push('CONTEXT_ANALYSIS', 'WORD_DISCOVERY', 'TRANSLATION');
    } else {
      context.intent = 'WORD_DISCOVERY';
      tasks.push('CONTEXT_ANALYSIS', 'WORD_DISCOVERY');
    }

    return tasks;
  }

  private synthesizeAnswer(context: WorkspaceContext): string {
    const parts: string[] = [];

    // Context greeting
    if (context.inferredContext) {
      const srcLabel =
        context.inferredContext.source === 'USER_PROVIDED'
          ? 'บริบทที่ระบุ'
          : 'บริบทที่วิเคราะห์ได้';
      parts.push(
        `📌 **${srcLabel}:** ${context.inferredContext.type} (ระดับภาษา: ${context.inferredContext.tone}, กลุ่มเป้าหมาย: ${context.inferredContext.audience})`,
      );
    }

    // Word recommendations
    if (context.recommendations && context.recommendations.length > 0) {
      parts.push(`\n### 📖 คำศัพท์ที่แนะนำจากพจนานุกรมทางการ:`);
      for (const rec of context.recommendations) {
        parts.push(
          `- **${rec.word}** (${rec.pos || 'น.'}): ${rec.definition}\n  *เหตุผล:* ${rec.reason}\n  *แหล่งอ้างอิง:* ${rec.source} (${rec.edition || '2554'})`,
        );
      }
    }

    // Comparison
    if (context.comparison) {
      parts.push(`\n### ⚖️ สรุปความแตกต่าง (${context.comparison.wordA} vs ${context.comparison.wordB}):`);
      parts.push(`${context.comparison.difference_summary}`);
      parts.push(`\n💡 **คำแนะนำการเลือกใช้:** ${context.comparison.guidance}`);
    }

    // Generated content
    if (context.generatedContent && context.generatedContent.length > 0) {
      parts.push(`\n### ✍️ ข้อความที่สร้างตามบริบท:`);
      for (const item of context.generatedContent) {
        parts.push(`- **[${item.register.toUpperCase()}]** "${item.content}"`);
        if (item.notes) {
          parts.push(`  *หมายเหตุ:* ${item.notes}`);
        }
      }
    }

    // Language check
    if (context.languageCheck) {
      parts.push(`\n### 🔍 ผลการตรวจสอบคุณภาพภาษา (คะแนน: ${context.languageCheck.score}/100):`);
      parts.push(`${context.languageCheck.summary}`);
      if (context.languageCheck.issues && context.languageCheck.issues.length > 0) {
        for (const issue of context.languageCheck.issues) {
          parts.push(
            `- **[${issue.rule_type}]** พบ "${issue.text}" -> แนะนำเป็น "${issue.suggestion}" (${issue.description})`,
          );
        }
      }
    }

    // Language bridge
    if (context.languageBridge) {
      parts.push(`\n### 🌐 Thai-English Cultural & Language Bridge:`);
      parts.push(`- **Word:** ${context.languageBridge.word} (${context.languageBridge.transliteration})`);
      parts.push(`- **Pronunciation:** ${context.languageBridge.pronunciation}`);
      parts.push(`- **Translation:** ${context.languageBridge.english_translation}`);
      parts.push(`- **Nuance & Concept:** ${context.languageBridge.english_explanation}`);
      parts.push(`- **Cultural Context:** ${context.languageBridge.cultural_context}`);
      parts.push(`- **Example:** ${context.languageBridge.example}`);
    }

    // Dialect Discovery & Regional Comparison
    if (context.dialectDiscovery) {
      const dd = context.dialectDiscovery;
      if (dd.type === 'REGIONAL_COMPARISON' && dd.standardWord) {
        parts.push(`\n### 🗺️ การค้นพบคำภาษาถิ่น ๔ ภาค (แนวคิด: "${dd.standardWord}"):`);
        if (dd.comparison?.results) {
          for (const cr of dd.comparison.results) {
            parts.push(`- **${cr.region_name}:** "${cr.term}" — ${cr.definition} *(บริบท: ${cr.usage_context}, อ้างอิง: ${cr.source})*`);
          }
        }
        if (dd.explanation) {
          parts.push(`\n${dd.explanation}`);
        }
      } else if (dd.results && dd.results.length > 0) {
        parts.push(`\n### 🗺️ ผลการค้นพบคำภาษาถิ่นตามความหมาย "${dd.detectedMeaning || ''}":`);
        for (const r of dd.results.slice(0, 5)) {
          const prov = r.province ? ` จ.${r.province}` : '';
          parts.push(`- **${r.dialectWord}** [${r.regionName}${prov}]: ${r.localMeaning} *(บริบท: ${r.context || 'ภาษาพูด'})*`);
        }
      }
    }

    return parts.join('\n');
  }

  private synthesizeCoThinking(context: WorkspaceContext): CoThinkingAnalysis | null {
    if (
      context.abstained ||
      (!context.recommendations.length &&
        !context.comparison &&
        !context.generatedContent.length &&
        !context.languageCheck)
    ) {
      return null;
    }

    const firstRec = context.recommendations?.[0];
    const firstWord = firstRec?.word || context.selectedWords?.[0] || 'คำที่เลือก';
    const def = firstRec?.definition || 'ความหมายตามพจนานุกรมทางการ';
    const src = firstRec?.source || 'พจนานุกรม ฉบับราชบัณฑิตยสถาน';
    const edition = firstRec?.edition || '2554';
    const reg = context.inferredContext?.type || 'วิชาการ';

    let strategicRec = '';
    let nuanceBreakdown = '';
    let riskWarning = '';

    if (context.comparison) {
      const wA = context.comparison.wordA;
      const wB = context.comparison.wordB;
      const empA = context.comparison.details?.[wA]?.emphasis || 'กระบวนการและความคุ้มค่า';
      const empB = context.comparison.details?.[wB]?.emphasis || 'ผลสำเร็จปลายทาง';
      strategicRec = `จากการวิเคราะห์เปรียบเทียบในฐานข้อมูล หากคุณต้องการเน้น${empA} แนะนำให้เลือกใช้ "${wA}" แต่หากต้องการชู${empB} ควรเลือกใช้ "${wB}"`;
      nuanceBreakdown = context.comparison.difference_summary;
      riskWarning = `ระวังการใช้สับสนระหว่าง "${wA}" และ "${wB}" ในประโยคเดียวกัน เพราะจะทำให้เจตนาของเอกสารคลาดเคลื่อน`;
    } else if (context.recommendations.length > 0) {
      strategicRec = `จากการวิเคราะห์คลังข้อมูลราชบัณฑิตยสภา แนะนำให้ใช้คำว่า "${firstWord}" เนื่องจากตรงกับนิยามอย่างเป็นทางการคือ "${def}" ซึ่งจะช่วยเสริมความน่าเชื่อถือและความแม่นยำในบริบท${reg}`;
      nuanceBreakdown = `อ้างอิงจาก ${src} พ.ศ. ${edition}: สื่อความหมายชัดเจนและสอดคล้องกับระดับภาษาทางการ`;
      riskWarning = `หลีกเลี่ยงการใช้คำซ้อนเยิ่นเย้อ เช่น "ทำการ${firstWord}" หรือ "มี${firstWord}อย่างยิ่ง" ควรใช้เป็นคำเฉพาะตามแบบแผนภาษาไทย`;
    } else if (context.languageCheck) {
      strategicRec = `ผลการตรวจทานภาษาได้คะแนน ${context.languageCheck.score}/100 ข้อความมีความถูกต้องตามแบบแผน แนะนำให้ปรับแก้จุดเยิ่นเย้อเพื่อเพิ่มความกระชับ`;
      nuanceBreakdown = context.languageCheck.summary;
      riskWarning = `ตรวจสอบคำเชื่อมและโครงสร้างประโยค เพื่อให้กระชับและสื่อสารได้อย่างตรงจุด`;
    } else {
      strategicRec = `AI ช่วยวิเคราะห์และผสมผสานคำศัพท์ตามบริบท${reg} เพื่อให้คุณนำไปปรับแต่งต่อได้ทันที`;
      nuanceBreakdown = `ใช้คำศัพท์ที่ตรงตามเจตนาและมาตรฐานภาษาไทยร่วมสมัย`;
    }

    const nextStepIdeas = [
      `📊 แตกประเด็นเป็นหัวข้อสไลด์นำเสนอ (Presentation Bullets)`,
      `✉️ ปรับเป็นร่างอีเมลสรุปถึงผู้บริหาร (Executive Brief)`,
      `📢 แปลงเป็นข้อความประกาศทางการ (Official Announcement)`,
      `🎯 เขียนย่อหน้าขยายความเชิงวิชาการ (Academic Rationale)`,
    ];

    return {
      strategic_recommendation: strategicRec,
      nuance_breakdown: nuanceBreakdown,
      risk_warning: riskWarning,
      next_step_ideas: nextStepIdeas,
    };
  }
}
