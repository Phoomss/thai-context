import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as modernVocabListHandler } from "../src/app/api/v1/modern-vocabulary/route";
import { GET as modernVocabDetailHandler } from "../src/app/api/v1/modern-vocabulary/[term]/route";
import { GET as categoriesHandler } from "../src/app/api/v1/modern-vocabulary/categories/route";
import { POST as suggestHandler } from "../src/app/api/v1/modern-vocabulary/suggest/route";
import { GET as compareHandler } from "../src/app/api/v1/modern-vocabulary/compare/route";
import { GET as searchHandler } from "../src/app/api/v1/search/route";

describe("Modern Thai Vocabulary Layer APIs", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("GET /api/v1/modern-vocabulary", () => {
    it("returns list of modern vocabulary terms with provenance", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/modern-vocabulary");
      const res = await modernVocabListHandler(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeGreaterThanOrEqual(1);

      const item = data.items[0];
      expect(item.term).toBeDefined();
      expect(item.register).toBeDefined();
      expect(item.status).toBeDefined();
      expect(Array.isArray(item.categories)).toBe(true);
    });

    it("filters modern terms by category=AI", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/modern-vocabulary?category=AI");
      const res = await modernVocabListHandler(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThanOrEqual(1);
      expect(data.items.every((t: any) => t.categories.includes("AI"))).toBe(true);
    });
  });

  describe("GET /api/v1/modern-vocabulary/[term]", () => {
    it("returns full detail for 'ป้ายยา' with foreigner support and official check", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/modern-vocabulary/ป้ายยา");
      const res = await modernVocabDetailHandler(req, {
        params: Promise.resolve({ term: "ป้ายยา" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.term).toBe("ป้ายยา");
      expect(data.register).toBe("SLANG");
      expect(data.foreigner_support).toBeDefined();
      expect(data.official_comparison).toBeDefined();
      expect(data.official_comparison.relationship).toBeDefined();
      expect(data.sources.length).toBeGreaterThanOrEqual(1);
      expect(data.definitions.length).toBeGreaterThanOrEqual(1);
    });

    it("returns 404 for unknown modern term", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/modern-vocabulary/xyzunknown123");
      const res = await modernVocabDetailHandler(req, {
        params: Promise.resolve({ term: "xyzunknown123" }),
      });

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/v1/modern-vocabulary/categories", () => {
    it("returns categories with term counts", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/modern-vocabulary/categories");
      const res = await categoriesHandler(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.categories)).toBe(true);
      expect(data.categories.length).toBeGreaterThanOrEqual(1);
      expect(data.categories[0].category).toBeDefined();
      expect(typeof data.categories[0].count).toBe("number");
    });
  });

  describe("POST /api/v1/modern-vocabulary/suggest", () => {
    it("accepts user suggestion and returns PENDING_REVIEW", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/modern-vocabulary/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: "ช็อตฟีล",
          suggested_meaning: "ทำให้เสียอารมณ์หรือหยุดความตื่นเต้นอย่างกะทันหัน",
          category: "SLANG",
          context_sentence: "กำลังพูดเรื่องสนุกๆ โดนช็อตฟีลเฉยเลย",
          submitter_name: "ทดสอบ",
        }),
      });
      const res = await suggestHandler(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.term).toBe("ช็อตฟีล");
      expect(data.status).toBe("PENDING_REVIEW");
    });

    it("returns 400 when term or meaning is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/modern-vocabulary/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: "" }),
      });
      const res = await suggestHandler(req);

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/modern-vocabulary/compare", () => {
    it("returns structured comparison between modern and formal words", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/v1/modern-vocabulary/compare?modern_term=ป้ายยา&formal_term=โน้มน้าว"
      );
      const res = await compareHandler(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.modern_term.term).toBe("ป้ายยา");
      expect(data.formal_term.headword).toBe("โน้มน้าว");
      expect(data.comparison.usage_recommendation).toBeDefined();
      expect(data.comparison.when_to_use_modern).toBeDefined();
      expect(data.comparison.when_to_use_formal).toBeDefined();
    });
  });

  describe("Search API integration with Modern Vocabulary", () => {
    it("finds modern word 'ป้ายยา' and marks type as MODERN and is_official as false", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/search?q=%E0%B8%9B%E0%B9%89%E0%B8%B2%E0%B8%A2%E0%B8%A2%E0%B8%B2");
      const res = await searchHandler(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.results.length).toBeGreaterThanOrEqual(1);

      const modernResult = data.results.find((r: any) => r.word === "ป้ายยา");
      expect(modernResult).toBeDefined();
      expect(modernResult.edition).toBe("ภาษาร่วมสมัย");
      expect(modernResult.metadata?.type).toBe("MODERN");
      expect(modernResult.metadata?.is_official).toBe(false);
    });
  });
});
