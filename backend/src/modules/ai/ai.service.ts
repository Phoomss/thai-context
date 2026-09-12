import { Injectable, Logger } from '@nestjs/common';
import { QueryParserService } from './services/query-parser.service';
import { EmbeddingCacheService } from './services/embedding-cache.service';
import { HybridRetrieverService } from './services/hybrid-retriever.service';
import { GroundedRAGService } from './services/grounded-rag.service';
import { GuardrailService } from './services/guardrail.service';
import { AISearchResult } from './interfaces/ai.interface';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private readonly queryParser: QueryParserService,
    private readonly embeddingCache: EmbeddingCacheService,
    private readonly hybridRetriever: HybridRetrieverService,
    private readonly ragService: GroundedRAGService,
    private readonly guardrail: GuardrailService
  ) {}

  async executeMeaningSearch(rawQuery: string): Promise<AISearchResult> {
    const startTime = Date.now();

    // 1. Query Understanding & Intent Parsing (Gemini 3.8 Flash)
    const intent = await this.queryParser.parseIntent(rawQuery);

    // 2. Check In-Memory Embedding Cache (or compute embedding)
    const cachedVector = this.embeddingCache.get(intent.detected_meaning);

    // 3. Hybrid Retrieval (Dense pgvector + Sparse Trigram + RRF)
    const candidates = await this.hybridRetriever.searchCandidates(
      cachedVector,
      intent.detected_meaning,
      intent.excluded_words,
      5
    );

    // 4. Hallucination Guardrail Check (< 0.72)
    const guardrailResult = this.guardrail.evaluate(candidates, rawQuery);

    if (!guardrailResult.passed) {
      this.logger.warn(`🛡️ Safe Abstention Triggered for query: "${rawQuery}"`);
      return {
        query_understanding: intent,
        recommendations: [],
        guardrail: {
          passed: false,
          confidence_score: guardrailResult.confidenceScore,
          abstention_triggered: true,
          message: guardrailResult.reason,
        },
      };
    }

    // 5. Grounded RAG Synthesis with Evidence Citations
    const recommendations = await this.ragService.synthesizeRecommendations(intent, candidates);

    const totalDuration = Date.now() - startTime;
    this.logger.log(`⚡ Meaning Search completed in ${totalDuration}ms. Found ${recommendations.length} words.`);

    return {
      query_understanding: intent,
      recommendations,
      guardrail: {
        passed: true,
        confidence_score: guardrailResult.confidenceScore,
        abstention_triggered: false,
      },
    };
  }
}
