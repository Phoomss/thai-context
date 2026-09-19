import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelemetryRecord, ModelUsage } from './ai-usage.interface';
import { ModelTier } from '../router/model-tier.enum';

@Injectable()
export class AITelemetryService {
  private readonly logger = new Logger(AITelemetryService.name);
  private readonly records: TelemetryRecord[] = [];
  private readonly maxRecords = 1000;

  constructor(private readonly configService: ConfigService) {}

  calculateCost(tier: ModelTier, inputTokens: number, outputTokens: number): number | null {
    const pricing = this.configService.get<any>('gemini.pricing');
    if (!pricing) return null;

    let inPrice: number | undefined;
    let outPrice: number | undefined;

    switch (tier) {
      case ModelTier.FAST:
        inPrice = pricing.fastInputPrice;
        outPrice = pricing.fastOutputPrice;
        break;
      case ModelTier.STANDARD:
        inPrice = pricing.standardInputPrice;
        outPrice = pricing.standardOutputPrice;
        break;
      case ModelTier.REASONING:
        inPrice = pricing.reasoningInputPrice;
        outPrice = pricing.reasoningOutputPrice;
        break;
    }

    if (inPrice === undefined || outPrice === undefined || isNaN(inPrice) || isNaN(outPrice)) {
      return null;
    }

    return Number((inputTokens * inPrice + outputTokens * outPrice).toFixed(8));
  }

  recordUsage(record: Omit<TelemetryRecord, 'timestamp' | 'estimatedCost'> & { estimatedCost?: number | null }): TelemetryRecord {
    const estimatedCost = record.estimatedCost !== undefined
      ? record.estimatedCost
      : this.calculateCost(record.tier, record.inputTokens, record.outputTokens);

    const completeRecord: TelemetryRecord = {
      ...record,
      estimatedCost,
      timestamp: Date.now(),
    };

    if (this.records.length >= this.maxRecords) {
      this.records.shift();
    }
    this.records.push(completeRecord);

    // Sanitized structured log (never expose API keys, tokens, or credentials)
    const logPayload = {
      event: 'ai_execution',
      requestId: completeRecord.requestId,
      agent: completeRecord.agent,
      tier: completeRecord.tier,
      model: completeRecord.model,
      latencyMs: completeRecord.latencyMs,
      inputTokens: completeRecord.inputTokens,
      outputTokens: completeRecord.outputTokens,
      totalTokens: completeRecord.totalTokens,
      retryCount: completeRecord.retryCount,
      fallback: completeRecord.fallback,
      error: completeRecord.error || null,
      estimatedCost: completeRecord.estimatedCost,
    };

    if (completeRecord.error) {
      this.logger.warn(`AI telemetry execution error: ${JSON.stringify(logPayload)}`);
    } else {
      this.logger.log(`AI telemetry execution: ${JSON.stringify(logPayload)}`);
    }

    return completeRecord;
  }

  getMetricsSummary(): {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageLatencyMs: number;
    errorCount: number;
    fallbackCount: number;
    byTier: Record<ModelTier, { count: number; tokens: number; cost: number }>;
  } {
    const summary = {
      totalRequests: this.records.length,
      totalTokens: 0,
      totalCost: 0,
      averageLatencyMs: 0,
      errorCount: 0,
      fallbackCount: 0,
      byTier: {
        [ModelTier.FAST]: { count: 0, tokens: 0, cost: 0 },
        [ModelTier.STANDARD]: { count: 0, tokens: 0, cost: 0 },
        [ModelTier.REASONING]: { count: 0, tokens: 0, cost: 0 },
      },
    };

    let totalLatency = 0;

    for (const r of this.records) {
      summary.totalTokens += r.totalTokens;
      summary.totalCost += r.estimatedCost || 0;
      totalLatency += r.latencyMs;
      if (r.error) summary.errorCount++;
      if (r.fallback) summary.fallbackCount++;

      const tierStat = summary.byTier[r.tier];
      if (tierStat) {
        tierStat.count++;
        tierStat.tokens += r.totalTokens;
        tierStat.cost += r.estimatedCost || 0;
      }
    }

    summary.averageLatencyMs = this.records.length > 0 ? Math.round(totalLatency / this.records.length) : 0;
    summary.totalCost = Number(summary.totalCost.toFixed(6));

    return summary;
  }

  getRecentRecords(limit = 50): TelemetryRecord[] {
    return this.records.slice(-limit);
  }
}
