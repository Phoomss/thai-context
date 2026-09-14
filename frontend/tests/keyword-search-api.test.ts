import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as searchHandler } from "../src/app/api/v1/search/route";

describe("Keyword & Edition Search API (/api/v1/search)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 400 when query parameter 'q' is missing or empty", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/search?q=");
    const res = await searchHandler(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("กรุณาระบุคำค้นหา");
  });

  it("returns keyword search results for 'ประสิทธิภาพ' with correct structure", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/v1/search?q=%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%9E"
    );
    const res = await searchHandler(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.query).toBe("ประสิทธิภาพ");
    expect(body.total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(body.results)).toBe(true);

    const first = body.results[0];
    expect(first.word).toBe("ประสิทธิภาพ");
    expect(first.definition).toBeDefined();
    expect(first.edition).toBeDefined();
    expect(first.source).toBeDefined();
  });

  it("filters results by edition=2554", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/v1/search?q=%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%9E&edition=2554"
    );
    const res = await searchHandler(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.filters.edition).toBe("2554");
    expect(body.results.every((r: any) => r.edition === "2554")).toBe(true);
  });

  it("filters results by source=ROYAL_SOCIETY", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/v1/search?q=%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%9E&source=ROYAL_SOCIETY"
    );
    const res = await searchHandler(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.filters.source).toBe("ROYAL_SOCIETY");
    expect(
      body.results.every(
        (r: any) =>
          r.sourceCode === "ROYAL_SOCIETY" ||
          r.source.includes("ราชบัณฑิตยสภา")
      )
    ).toBe(true);
  });

  it("supports exact match filter (exact=true)", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/v1/search?q=%E0%B8%AA%E0%B8%A1%E0%B8%B2%E0%B8%99%E0%B8%89%E0%B8%B1%E0%B8%99%E0%B8%97%E0%B9%8C&exact=true"
    );
    const res = await searchHandler(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.filters.exact).toBe(true);
    expect(body.results.every((r: any) => r.word === "สมานฉันท์")).toBe(true);
  });

  it("supports pagination with page and limit", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/v1/search?q=%E0%B8%81&page=1&limit=5"
    );
    const res = await searchHandler(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.page).toBe(1);
    expect(body.limit).toBe(5);
    expect(body.results.length).toBeLessThanOrEqual(5);
  });
});
