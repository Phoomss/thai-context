import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CentralAgentRegistry } from '../agents/agent.registry';
import { AgentType } from '../agents/agent-type.enum';
import { ModelTier } from '../router/model-tier.enum';
import { TaskComplexity } from './task-complexity.enum';
import { ExecutionPlan } from './execution-plan.interface';
import { IntentClassifierService } from './intent-classifier.service';
import { EvidenceGuard } from '../evidence/evidence-guard.service';
import { Evidence } from '../evidence/evidence.interface';
import { AgentContext, AgentResult } from '../agents/base/agent.interface';
import { AITelemetryService } from '../telemetry/ai-telemetry.service';

export interface OrchestratorRequest {
  message: string;
  sessionId?: string;
  context?: {
    type?: string;
    tone?: string;
    audience?: string;
  };
  currentText?: string;
  selectedWords?: string[];
  metadata?: Record<string, unknown>;
}

export interface OrchestratorResponse {
  sessionId: string;
  intent: string;
  complexity: TaskComplexity;
  modelTier: ModelTier;
  plan: ExecutionPlan;
  answer: string;
  recommendations?: any[];
  comparison?: any;
  generatedContent?: any[];
  languageCheck?: any;
  languageBridge?: any;
  evidence: Evidence[];
  confidence: number;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  abstained: boolean;
  abstentionReason?: string;
  agentTraces: Array<{
    agent: string;
    status: 'running' | 'completed' | 'skipped' | 'abstained';
    summary: string;
    durationMs?: number;
  }>;
}

export interface SSEEvent {
  event:
    | 'agent.started'
    | 'agent.progress'
    | 'retrieval.completed'
    | 'agent.completed'
    | 'evidence.validated'
    | 'generation.delta'
    | 'generation.completed'
    | 'error'
    // Legacy events
    | 'start'
    | 'trace'
    | 'token'
    | 'evidence'
    | 'complete';
  data: any;
}

@Injectable()
export class AIOrchestratorService {
  private readonly logger = new Logger(AIOrchestratorService.name);
  private readonly sessionStore = new Map<string, AgentContext>();

  constructor(
    private readonly registry: CentralAgentRegistry,
    private readonly intentClassifier: IntentClassifierService,
    private readonly evidenceGuard: EvidenceGuard,
    private readonly telemetryService: AITelemetryService,
  ) {}

  async orchestrate(req: OrchestratorRequest): Promise<OrchestratorResponse> {
    const sessionId = req.sessionId || randomUUID();
    const existingContext = this.sessionStore.get(sessionId);

    // 1. Intent Detection & Task Complexity
    const plan = this.intentClassifier.classify(req.message, req.context);

    // 2. Initialize AgentContext
    const context: AgentContext = {
      userQuery: req.message,
      message: req.message,
      sessionId,
      intent: plan.intent,
      complexity: plan.complexity,
      userContext: req.context || existingContext?.userContext,
      inferredContext: existingContext?.inferredContext,
      selectedWords: req.selectedWords || existingContext?.selectedWords || [],
      currentText: req.currentText || existingContext?.currentText || '',
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
      metadata: req.metadata,
    };

    // 3. Early Abstention Guard (Gibberish or non-existent entity)
    if (plan.intent === 'ABSTAIN') {
      context.abstained = true;
      context.abstentionReason = EvidenceGuard.INSUFFICIENT_EVIDENCE_MESSAGE;
      context.confidence = 0.15;
      context.confidenceLevel = 'LOW';
      context.agentTraces.push({
        agent: 'EvidenceGuard',
        status: 'completed',
        summary: 'ระงับการให้ข้อมูลเนื่องจากไม่พบหลักฐานในพจนานุกรมทางการ',
        durationMs: 1,
      });

      const abstainedAnswer =
        'ขออภัย ระบบไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลพจนานุกรมที่ระบบรองรับ เพื่อป้องกันความคลาดเคลื่อนทางภาษา ระบบจึงไม่สามารถให้ข้อสรุปสำหรับคำดังกล่าวได้';

      const response: OrchestratorResponse = {
        sessionId,
        intent: 'ABSTAIN',
        complexity: plan.complexity,
        modelTier: plan.modelTier,
        plan,
        answer: abstainedAnswer,
        recommendations: [],
        comparison: null,
        generatedContent: [],
        languageCheck: null,
        languageBridge: null,
        evidence: [],
        confidence: context.confidence,
        confidenceLevel: context.confidenceLevel,
        abstained: true,
        abstentionReason: context.abstentionReason,
        agentTraces: context.agentTraces,
      };

      this.sessionStore.set(sessionId, context);
      return response;
    }

    // 4. Sequential Sub-Agent Execution Pipeline
    for (const agentType of plan.agents) {
      const agent = this.registry.getAgent(agentType);
      if (agent) {
        const start = Date.now();
        try {
          const result = await agent.execute(context);
          const durationMs = Date.now() - start;

          context.agentTraces.push({
            agent: agentType,
            status: result.status === 'SUCCESS' ? 'completed' : 'abstained',
            summary: result.summary || `Agent ${agentType} execution finished`,
            durationMs,
          });

          if (result.status === 'ABSTAINED') {
            context.abstained = true;
            context.abstentionReason = result.summary;
          }
        } catch (err: any) {
          this.logger.error(`Error executing agent ${agentType}: ${err.message}`);
          context.agentTraces.push({
            agent: agentType,
            status: 'abstained',
            summary: `Agent error: ${err.message}`,
            durationMs: Date.now() - start,
          });
        }
      }
    }

    // 5. Evidence Guard Verification
    if (plan.requiresEvidence && context.selectedWords && context.selectedWords.length > 0) {
      const guardCheck = this.evidenceGuard.validateWordGroundedness(
        context.selectedWords,
        context.evidence as Evidence[],
        context.currentText || req.message,
      );

      if (guardCheck.abstained && !context.recommendations?.length) {
        context.abstained = true;
        context.abstentionReason = guardCheck.abstentionReason;
        context.confidence = guardCheck.confidenceScore;
        context.confidenceLevel = guardCheck.confidenceLevel;
      }
    }

    // 6. Synthesize Final Answer
    const answer = this.synthesizeAnswer(context);

    // 7. Update Session History
    context.history.push({ role: 'user', content: req.message, timestamp: Date.now() });
    context.history.push({ role: 'assistant', content: answer, timestamp: Date.now() });
    this.sessionStore.set(sessionId, context);

    return {
      sessionId,
      intent: plan.intent,
      complexity: plan.complexity,
      modelTier: plan.modelTier,
      plan,
      answer,
      recommendations: context.recommendations,
      comparison: context.comparison,
      generatedContent: context.generatedContent,
      languageCheck: context.languageCheck,
      languageBridge: context.languageBridge,
      evidence: (context.evidence as Evidence[]) || [],
      confidence: context.confidence,
      confidenceLevel: context.confidenceLevel,
      abstained: context.abstained,
      abstentionReason: context.abstentionReason,
      agentTraces: context.agentTraces,
    };
  }

  async *streamOrchestrate(req: OrchestratorRequest): AsyncIterable<SSEEvent> {
    const sessionId = req.sessionId || randomUUID();
    const plan = this.intentClassifier.classify(req.message, req.context);

    // 1. Initial Started Event
    yield {
      event: 'agent.started',
      data: {
        sessionId,
        intent: plan.intent,
        complexity: plan.complexity,
        modelTier: plan.modelTier,
      },
    };
    yield {
      event: 'start',
      data: { session_id: sessionId, intent: plan.intent },
    };

    // 2. Execute Orchestration
    const response = await this.orchestrate(req);

    // 3. Emit Agent Traces
    for (const trace of response.agentTraces) {
      yield {
        event: 'agent.completed',
        data: trace,
      };
      yield {
        event: 'trace',
        data: trace,
      };
    }

    // 4. Emit Verified Evidence
    if (response.evidence && response.evidence.length > 0) {
      yield {
        event: 'evidence.validated',
        data: response.evidence,
      };
      yield {
        event: 'evidence',
        data: response.evidence,
      };
    }

    // 5. Stream Generation Tokens
    const chunkSize = 25;
    for (let i = 0; i < response.answer.length; i += chunkSize) {
      const chunk = response.answer.substring(i, i + chunkSize);
      yield {
        event: 'generation.delta',
        data: { delta: chunk },
      };
      yield {
        event: 'token',
        data: { token: chunk, text: chunk },
      };
    }

    // 6. Complete Event
    yield {
      event: 'generation.completed',
      data: {
        sessionId,
        answer: response.answer,
        confidence: response.confidence,
        confidenceLevel: response.confidenceLevel,
        abstained: response.abstained,
      },
    };
    yield {
      event: 'complete',
      data: response,
    };
  }

  private synthesizeAnswer(context: AgentContext): string {
    if (context.abstained) {
      return (
        context.abstentionReason ||
        'ขออภัย ระบบไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลพจนานุกรมที่ระบบรองรับ เพื่อป้องกันความคลาดเคลื่อนทางภาษา ระบบจึงไม่สามารถให้ข้อสรุปสำหรับคำดังกล่าวได้'
      );
    }

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
        parts.push(`- **[${item.register?.toUpperCase() || 'FORMAL'}]** "${item.content}"`);
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

    return parts.join('\n');
  }
}
