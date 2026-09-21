import { describe, it, expect } from "vitest";
import {
  generateDeterministicVector,
  calculateCosineSimilarity,
  searchMeaningRealVector,
  getRealDictionaryIndex,
} from "../src/lib/vector-semantic-search";

describe("Vector Semantic Search Engine (1536-D Cosine Math & AI Hybrid)", () => {
  it("generates 1536-dimensional L2 unit vectors", () => {
    const vecA = generateDeterministicVector("ประสิทธิภาพ");
    const vecB = generateDeterministicVector("ประสิทธิผล");

    expect(vecA).toHaveLength(1536);
    expect(vecB).toHaveLength(1536);

    // Verify L2 Euclidean norm is approximately 1.0
    const normA = Math.sqrt(vecA.reduce((sum, v) => sum + v * v, 0));
    expect(normA).toBeCloseTo(1.0, 4);

    const normB = Math.sqrt(vecB.reduce((sum, v) => sum + v * v, 0));
    expect(normB).toBeCloseTo(1.0, 4);
  });

  it("calculates accurate cosine similarity bounded between -1.0 and 1.0", () => {
    const vecA = generateDeterministicVector("ความซื่อสัตย์สุจริต");
    const vecIdentical = generateDeterministicVector("ความซื่อสัตย์สุจริต");
    const vecDifferent = generateDeterministicVector("อาหารเครื่องดื่มรสเผ็ด");

    const simSelf = calculateCosineSimilarity(vecA, vecIdentical);
    const simDiff = calculateCosineSimilarity(vecA, vecDifferent);

    expect(simSelf).toBeCloseTo(1.0, 3);
    expect(simDiff).toBeLessThan(simSelf);
  });

  it("indexes over 30,000 real dictionary entries from official sources", () => {
    const index = getRealDictionaryIndex();
    expect(index.size).toBeGreaterThan(30000);
    expect(index.has("ประสิทธิภาพ")).toBe(true);
    expect(index.has("ซื่อสัตย์")).toBe(true);
    expect(index.has("วิจัย")).toBe(true);
    expect(index.has("ป้ายยา")).toBe(true);
    expect(index.has("RAG")).toBe(true);
  });

  it("matches real words with genuine definitions, sources, and sentence patterns for 'วันนี้คุณอยากสื่ออะไร?'", () => {
    const result = searchMeaningRealVector("วันนี้คุณอยากสื่ออะไร?");

    expect(result.mode).toBe("live");
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1);

    const headwords = result.recommendations.map((r) => r.headword);
    expect(headwords).toContain("สื่อสาร");

    const topRec = result.recommendations[0];
    expect(topRec.definition).toBeTruthy();
    expect(topRec.evidence?.source_book).toBeTruthy();
    expect(topRec.comparison?.sentence_pattern).toBeDefined();
    expect(topRec.comparison?.emphasis).toBeDefined();
  });

  it("accurately finds modern vocabulary and slang like 'ป้ายยา' and 'RAG'", () => {
    const resultSlang = searchMeaningRealVector("แนะนำสินค้าบนโซเชียลมีเดียจนอยากซื้อตาม");
    expect(resultSlang.recommendations.some((r) => r.headword === "ป้ายยา")).toBe(true);

    const resultTech = searchMeaningRealVector("RAG");
    expect(resultTech.recommendations.some((r) => r.headword === "RAG")).toBe(true);
  });

  it("honors negative constraints by excluding forbidden headwords", () => {
    const result = searchMeaningRealVector("ทำงานให้ได้ผล ไม่เอาคำว่า ประสิทธิภาพ");
    const headwords = result.recommendations.map((r) => r.headword);

    expect(headwords).not.toContain("ประสิทธิภาพ");
    expect(result.query_understanding.excluded_words).toContain("ประสิทธิภาพ");
  });

  it("returns zero results cleanly for unfindable or nonsense queries", () => {
    const result = searchMeaningRealVector("ไม่พบคำนี้xyz");
    expect(result.recommendations).toHaveLength(0);
  });
});
