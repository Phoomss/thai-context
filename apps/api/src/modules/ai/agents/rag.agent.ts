import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base/base.agent';
import { AgentType } from './agent-type.enum';
import { ModelTier } from '../router/model-tier.enum';
import { AgentContext, AgentResult } from './base/agent.interface';
import { ModelRouter } from '../router/model-router.service';
import { Evidence } from '../evidence/evidence.interface';
import { EvidenceGuard } from '../evidence/evidence-guard.service';

export interface RAGFilterOptions {
  topK?: number;
  minRelevanceScore?: number;
  sourceFilter?: string;
  editionFilter?: string;
  regionFilter?: string;
}

@Injectable()
export class RAGAgent extends BaseAgent {
  readonly type = AgentType.RAG;
  readonly defaultTier = ModelTier.STANDARD;

  constructor(
    modelRouter: ModelRouter,
    private readonly evidenceGuard: EvidenceGuard,
  ) {
    super(modelRouter);
  }

  filterAndDeduplicateEvidence(
    evidenceList: Evidence[],
    options: RAGFilterOptions = {},
  ): Evidence[] {
    const minScore = options.minRelevanceScore ?? 0.7;
    const topK = options.topK ?? 5;

    const seen = new Set<string>();
    const filtered: Evidence[] = [];

    for (const ev of evidenceList) {
      if ((ev.relevanceScore ?? 1.0) < minScore) continue;
      if (options.sourceFilter && !ev.source.includes(options.sourceFilter)) continue;
      if (options.editionFilter && ev.edition !== options.editionFilter) continue;

      const dedupeKey = `${ev.word}-${ev.source}-${ev.edition || ''}`;
      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        filtered.push(ev);
      }

      if (filtered.length >= topK) break;
    }

    return filtered;
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const query = context.userQuery || context.message || '';
    const rawEvidence = (context.retrievedEvidence || context.evidence || []) as Evidence[];

    // 1. Filter, deduplicate, and enforce Top-K
    const validEvidence = this.filterAndDeduplicateEvidence(rawEvidence);

    // 2. Validate Groundedness via EvidenceGuard
    const guardResult = this.evidenceGuard.validateWordGroundedness(
      context.selectedWords || [],
      validEvidence,
      query,
    );

    if (guardResult.abstained) {
      context.abstained = true;
      context.abstentionReason = guardResult.abstentionReason;
      return {
        agent: this.type,
        status: 'ABSTAINED',
        data: { answer: guardResult.sanitizedContent },
        evidence: [],
        summary: guardResult.abstentionReason,
        metrics: {
          tier: this.defaultTier,
          model: 'evidence-guard-abstain',
          latencyMs: Date.now() - startTime,
        },
      };
    }

    // 3. Grounded Generation via Router
    const prompt = this.loadPrompt('rag/system.md');
    const modelResult = await this.modelRouter.executeWithFallback(
      this.defaultTier,
      this.type,
      async (model, activeTier) => {
        const res = await model.generateText({
          systemPrompt: prompt,
          userPrompt: `คำถาม: "${query}"\nหลักฐานพจนานุกรมทางการ: ${JSON.stringify(validEvidence)}`,
          metadata: { agent: this.type },
        });
        return { res, activeTier, modelName: model.modelName };
      },
    );

    const latencyMs = Date.now() - startTime;
    return {
      agent: this.type,
      status: 'SUCCESS',
      data: {
        answer: modelResult.res.text,
        evidenceCount: validEvidence.length,
      },
      evidence: validEvidence,
      summary: `RAG คำตอบอ้างอิงหลักฐานพจนานุกรม ${validEvidence.length} รายการ`,
      metrics: {
        tier: modelResult.activeTier,
        model: modelResult.modelName,
        latencyMs,
        tokens: modelResult.res.usage,
      },
    };
  }
}
