export type ComparedWord = {
  headword: string;
  definition: string;
  partOfSpeech?: string;
  edition?: string;
};

export type ComparisonSummary = {
  meaningDifference: string;
  contextDifference: string;
  usageGuidance: string;
};

export type ComparisonEvidence = {
  word?: string;
  source: string;
  edition: string;
  definition: string;
  relevance?: number;
  sourceType?: string;
};

export type CompareResponse = {
  words: ComparedWord[];
  comparison: ComparisonSummary;
  evidence: ComparisonEvidence[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function parseCompareResponse(value: unknown): CompareResponse {
  if (!isRecord(value) || !Array.isArray(value.words) || !isRecord(value.comparison)) {
    throw new Error("Invalid comparison response");
  }

  const words = value.words.map((item) => {
    if (!isRecord(item)) throw new Error("Invalid compared word");
    const headword = item.headword ?? item.word;
    if (typeof headword !== "string" || typeof item.definition !== "string") {
      throw new Error("Invalid compared word");
    }
    if (item.partOfSpeech !== undefined && typeof item.partOfSpeech !== "string") {
      throw new Error("Invalid compared word");
    }
    if (item.edition !== undefined && typeof item.edition !== "string") {
      throw new Error("Invalid compared word");
    }
    return {
      headword,
      definition: item.definition,
      ...(typeof item.partOfSpeech === "string" ? { partOfSpeech: item.partOfSpeech } : {}),
      ...(typeof item.edition === "string" ? { edition: item.edition } : {}),
    };
  });

  const comparison = value.comparison;
  for (const key of ["meaningDifference", "contextDifference", "usageGuidance"] as const) {
    if (typeof comparison[key] !== "string") {
      throw new Error("Invalid comparison summary");
    }
  }

  const rawEvidence = value.evidence ?? [];
  if (!Array.isArray(rawEvidence)) throw new Error("Invalid comparison evidence");
  const evidence = rawEvidence.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.source !== "string" ||
      typeof item.edition !== "string" ||
      typeof item.definition !== "string"
    ) {
      throw new Error("Invalid comparison evidence");
    }
    if (item.word !== undefined && typeof item.word !== "string") {
      throw new Error("Invalid comparison evidence");
    }
    if (
      item.relevance !== undefined &&
      (typeof item.relevance !== "number" || !Number.isFinite(item.relevance))
    ) {
      throw new Error("Invalid comparison evidence");
    }
    const sourceType = item.sourceType ?? item.source_type;
    if (sourceType !== undefined && typeof sourceType !== "string") {
      throw new Error("Invalid comparison evidence");
    }
    return {
      ...(typeof item.word === "string" ? { word: item.word } : {}),
      source: item.source,
      edition: item.edition,
      definition: item.definition,
      ...(typeof item.relevance === "number" ? { relevance: item.relevance } : {}),
      ...(typeof sourceType === "string" ? { sourceType } : {}),
    };
  });

  return {
    words,
    comparison: {
      meaningDifference: comparison.meaningDifference as string,
      contextDifference: comparison.contextDifference as string,
      usageGuidance: comparison.usageGuidance as string,
    },
    evidence,
  };
}

export function normalizeCompareWords(words: string[]): string[] {
  const normalized = words.map((word) => word.trim());
  if (normalized.length < 2 || normalized.length > 5) {
    throw new Error("กรุณาระบุคำภาษาไทย 2–5 คำ");
  }
  if (normalized.some((word) => !word || !/[\u0E00-\u0E7F]/u.test(word))) {
    throw new Error("กรุณาระบุคำภาษาไทยให้ครบทุกช่อง");
  }
  if (new Set(normalized).size !== normalized.length) {
    throw new Error("กรุณาเลือกคำที่ไม่ซ้ำกัน");
  }
  return normalized;
}
