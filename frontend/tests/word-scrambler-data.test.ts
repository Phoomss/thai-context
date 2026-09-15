import { describe, it, expect } from "vitest";
import {
  segmentThaiClusters,
  scrambleClusters,
  formatChallengeShare,
  CHALLENGE_WORDS,
  CHALLENGE_CATEGORIES,
  segmentThaiWords,
  shuffleSentenceWords,
  substituteSentenceWords,
  SENTENCE_PRESETS,
} from "@/lib/word-scrambler-data";

describe("Word Scrambler Data & Utilities", () => {
  it("segments Thai words into natural grapheme clusters without detaching diacritics", () => {
    const clusters = segmentThaiClusters("สวัสดี");
    expect(clusters.length).toBeGreaterThanOrEqual(3);
    // Vowels like 'ั' and 'ี' should remain attached to base consonants
    expect(clusters).toContain("ส");
    expect(clusters).toContain("ดี");
    expect(clusters.join("")).toBe("สวัสดี");
  });

  it("segments 'สับปะรด' correctly preserving all characters", () => {
    const clusters = segmentThaiClusters("สับปะรด");
    expect(clusters.join("")).toBe("สับปะรด");
  });

  it("handles single characters and empty strings gracefully", () => {
    expect(segmentThaiClusters("")).toEqual([]);
    expect(segmentThaiClusters("ก")).toEqual(["ก"]);
  });

  it("scrambles clusters while preserving the multiset of characters", () => {
    const original = ["ส", "วั", "ส", "ดี"];
    const scrambled = scrambleClusters(original);

    expect(scrambled).toHaveLength(original.length);
    // Check that every element exists with the same frequency
    const sortOrig = [...original].sort();
    const sortScram = [...scrambled].sort();
    expect(sortScram).toEqual(sortOrig);
  });

  it("formats challenge share string with box formatting and hint", () => {
    const shareText = formatChallengeShare("สับปะรด", "ผลไม้มีตารอบตัว", [
      "ด",
      "สั",
      "ปะ",
      "ร",
      "บ",
    ]);

    expect(shareText).toContain("THAI CONTEXT Word Scrambler");
    expect(shareText).toContain("[ ด ]");
    expect(shareText).toContain("ผลไม้มีตารอบตัว");
    expect(shareText).toContain("ความยาว 7 ตัวอักษร");
  });

  it("provides curated challenge words across all required categories", () => {
    expect(CHALLENGE_WORDS.length).toBeGreaterThanOrEqual(15);

    const categories = new Set(CHALLENGE_WORDS.map((w) => w.category));
    expect(categories.has("general")).toBe(true);
    expect(categories.has("literary")).toBe(true);
    expect(categories.has("food")).toBe(true);
    expect(categories.has("spoonerism")).toBe(true);

    // Verify all challenge words have official definitions
    for (const word of CHALLENGE_WORDS) {
      expect(word.headword).toBeTruthy();
      expect(word.pos).toBeTruthy();
      expect(word.definition).toBeTruthy();
    }
  });

  it("contains valid Thai spoonerisms with explanations", () => {
    const spoonerisms = CHALLENGE_WORDS.filter((w) => w.category === "spoonerism");
    expect(spoonerisms.length).toBeGreaterThanOrEqual(5);

    for (const sp of spoonerisms) {
      expect(sp.spoonerism).toBeDefined();
      expect(sp.spoonerism?.puanResult).toBeTruthy();
      expect(sp.spoonerism?.explanation).toBeTruthy();
      expect(sp.spoonerism?.funMeaning).toBeTruthy();
    }
  });

  it("segments Thai sentences into words correctly", () => {
    const words = segmentThaiWords("วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว");
    expect(words.length).toBeGreaterThan(3);
    expect(words.some((w) => w.includes("เหนื่อย") || w.includes("นอน"))).toBe(true);
  });

  it("shuffles word positions in a sentence", () => {
    const original = "วันนี้ เหนื่อย มาก อยาก นอน";
    const shuffled = shuffleSentenceWords(original);
    expect(shuffled).toBeTruthy();
    const origWords = segmentThaiWords(original).filter((w) => !/^\s+$/.test(w)).sort();
    const shufWords = segmentThaiWords(shuffled).filter((w) => !/^\s+$/.test(w)).sort();
    expect(shufWords).toEqual(origWords);
  });

  it("substitutes targeted words in sentence while keeping structure intact", () => {
    const input = "วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว";
    const { scrambledSentence, mappings } = substituteSentenceWords(input, 2);

    expect(scrambledSentence).toBeTruthy();
    expect(mappings.length).toBeGreaterThan(0);
    // Replaced words should be enclosed in quotes
    expect(scrambledSentence).toContain("'");
    for (const m of mappings) {
      expect(m.original_phrase).toBeTruthy();
      expect(m.replaced_word).toBeTruthy();
      expect(m.official_definition).toBeTruthy();
    }
  });

  it("provides sentence presets with categories and labels", () => {
    expect(SENTENCE_PRESETS.length).toBeGreaterThanOrEqual(5);
    for (const p of SENTENCE_PRESETS) {
      expect(p.id).toBeTruthy();
      expect(p.text).toBeTruthy();
      expect(p.category).toBeTruthy();
    }
  });
});

