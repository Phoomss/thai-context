import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { QueryParserService } from './services/query-parser.service';
import { EmbeddingCacheService } from './services/embedding-cache.service';
import { HybridRetrieverService } from './services/hybrid-retriever.service';
import { GroundedRAGService } from './services/grounded-rag.service';
import { GuardrailService } from './services/guardrail.service';

@Module({
  providers: [
    AIService,
    QueryParserService,
    EmbeddingCacheService,
    HybridRetrieverService,
    GroundedRAGService,
    GuardrailService,
  ],
  exports: [AIService],
})
export class AIModule {}
