import { Injectable } from '@nestjs/common';

export interface DialectRankingWeights {
  semantic_similarity: number;
  keyword_score: number;
  region_match: number;
  definition_match: number;
  source_reliability: number;
}

export const DEFAULT_DIALECT_RANKING_WEIGHTS: DialectRankingWeights = {
  semantic_similarity: 0.50,
  keyword_score: 0.20,
  region_match: 0.15,
  definition_match: 0.10,
  source_reliability: 0.05,
};

export interface DialectCandidate {
  id: string;
  dialectWord: string;
  dialectWordClean?: string;
  localMeaning: string;
  regionCode: string;
  regionName: string;
  province?: string | null;
  ipaPhonetic?: string | null;
  status: string;
  context?: string | null;
  sourceName?: string;
  sourceType?: string;
  semanticSimilarity?: number;
  standardWord?: string | null;
}

export interface RankedDialectResult extends DialectCandidate {
  finalScore: number;
  scoreBreakdown: {
    semanticScore: number;
    keywordScore: number;
    regionScore: number;
    definitionScore: number;
    sourceScore: number;
  };
}

@Injectable()
export class DialectRankingService {
  private weights: DialectRankingWeights = { ...DEFAULT_DIALECT_RANKING_WEIGHTS };

  setWeights(customWeights: Partial<DialectRankingWeights>) {
    this.weights = { ...this.weights, ...customWeights };
  }

  getWeights(): DialectRankingWeights {
    return { ...this.weights };
  }

  calculateSourceReliability(sourceType?: string, status?: string): number {
    if (status === 'OFFICIAL_SOURCE' || sourceType === 'ROYAL_SOCIETY') return 1.0;
    if (status === 'VERIFIED' || sourceType === 'DIALECT_DICTIONARY') return 0.95;
    if (sourceType === 'RESEARCH_DATA' || sourceType === 'ORGANIZER_DATA') return 0.90;
    if (sourceType === 'OPEN_DATA') return 0.80;
    if (sourceType === 'EXTERNAL' || status === 'EXTERNAL_SOURCE') return 0.70;
    if (sourceType === 'DEMO' || status === 'DEMO') return 0.50;
    return 0.40; // UNVERIFIED / AI_INFERRED
  }

  scoreAndRank(
    candidates: DialectCandidate[],
    query: string,
    targetRegion?: string,
    customWeights?: Partial<DialectRankingWeights>
  ): RankedDialectResult[] {
    const w = { ...this.weights, ...customWeights };
    const qClean = query.trim().toLowerCase();
    const regionClean = targetRegion?.trim().toUpperCase();

    const ranked: RankedDialectResult[] = candidates.map((c) => {
      // 1. Semantic Similarity (0.0 - 1.0)
      const semanticScore = c.semanticSimilarity ?? 0.5;

      // 2. Keyword Match on term (0.0 - 1.0)
      const termClean = (c.dialectWordClean || c.dialectWord).toLowerCase();
      let keywordScore = 0.0;
      if (termClean === qClean) {
        keywordScore = 1.0;
      } else if (termClean.startsWith(qClean) || qClean.startsWith(termClean)) {
        keywordScore = 0.8;
      } else if (termClean.includes(qClean) || qClean.includes(termClean)) {
        keywordScore = 0.6;
      } else if (c.standardWord && c.standardWord.toLowerCase() === qClean) {
        keywordScore = 0.9;
      }

      // 3. Region Match (0.0 - 1.0)
      let regionScore = 0.5; // neutral if no target region specified
      if (regionClean && regionClean !== 'ALL') {
        const matchesCode = c.regionCode.toUpperCase() === regionClean;
        const matchesName = c.regionName.toUpperCase().includes(regionClean);
        const matchesProvince = c.province && c.province.toUpperCase().includes(regionClean);
        if (matchesCode || matchesName || matchesProvince) {
          regionScore = 1.0;
        } else {
          regionScore = 0.0;
        }
      }

      // 4. Definition Match (0.0 - 1.0)
      const defClean = c.localMeaning.toLowerCase();
      let definitionScore = 0.0;
      if (defClean.includes(qClean)) {
        definitionScore = 0.9;
      } else {
        // Token match
        const tokens = qClean.split(/\s+/).filter((t) => t.length > 1);
        if (tokens.length > 0) {
          const matched = tokens.filter((t) => defClean.includes(t));
          definitionScore = matched.length / tokens.length;
        }
      }

      // 5. Source Reliability (0.0 - 1.0)
      const sourceScore = this.calculateSourceReliability(c.sourceType, c.status);

      // Final weighted score
      const finalScore =
        semanticScore * w.semantic_similarity +
        keywordScore * w.keyword_score +
        regionScore * w.region_match +
        definitionScore * w.definition_match +
        sourceScore * w.source_reliability;

      return {
        ...c,
        finalScore: Math.round(finalScore * 10000) / 10000,
        scoreBreakdown: {
          semanticScore,
          keywordScore,
          regionScore,
          definitionScore,
          sourceScore,
        },
      };
    });

    return ranked.sort((a, b) => b.finalScore - a.finalScore);
  }
}
