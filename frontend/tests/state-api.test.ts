// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  experienceReducer as reduce,
  initialExperience as initial,
} from "../src/lib/experience-state";
import { mockSearch } from "../src/lib/mock-search";
import { parseResponse } from "../src/lib/search-types";
import { POST } from "../src/app/api/search/route";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
const req = (query: unknown) =>
  new Request("http://localhost/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
describe("request races and API boundary", () => {
  it("validates sources even when legacy evidence is also present", () => {
    const result = mockSearch("ทำงาน");
    const word = result.recommendations[0];
    expect(() => parseResponse({ ...result, recommendations: [{ ...word, sources: [{ source_book: 7 }] }] })).toThrow("Invalid evidence");
  });
  it("ignores stale results and invalid composer submissions during cinematic", () => {
    const s = reduce(initial, { type: "HERO_SEARCH", id: 2, query: "วิจัย" });
    expect(
      reduce(s, { type: "RESOLVE", id: 1, result: mockSearch("ช่วยกัน") }),
    ).toBe(s);
    expect(reduce(s, { type: "COMPOSER_SEARCH", id: 3, query: "รอ" })).toBe(s);
    const white = reduce(reduce(s, { type: "CINEMATIC" }), { type: "WHITE" });
    expect(white.loading).toBe(true);
    expect(white.result).toBeNull();
    const late = reduce(white, {
      type: "RESOLVE",
      id: 2,
      result: mockSearch("วิจัย"),
    });
    expect(late.loading).toBe(false);
    expect(late.result?.recommendations).toHaveLength(1);
  });
  it("retains prior cards on repeat failure and permits retry", () => {
    let s = reduce(initial, { type: "HERO_SEARCH", id: 1, query: "วิจัย" });
    s = reduce(s, { type: "RESOLVE", id: 1, result: mockSearch("วิจัย") });
    s = reduce(s, { type: "WHITE" });
    s = reduce(s, { type: "COMPOSER_SEARCH", id: 2, query: "ใหม่" });
    s = reduce(s, { type: "REJECT", id: 2, error: "offline" });
    expect(s.result?.recommendations).toHaveLength(1);
    expect(s.state).toBe("results-active");
    expect(s.loading).toBe(false);
  });
  it.each(["", " ".repeat(2), "a".repeat(601), 42])(
    "rejects invalid query %s",
    async (q) => {
      expect((await POST(req(q))).status).toBe(400);
    },
  );
  it("serves explicitly labelled demo through the real route handler", async () => {
    vi.stubEnv("THAI_CONTEXT_API_URL", "");
    const r = await POST(req("ช่วยกัน"));
    expect(r.status).toBe(200);
    const data = await r.json();
    expect(data.mode).toBe("demo");
    expect(data.recommendations).toHaveLength(2);
  });
  it("validates a configured backend response envelope", async () => {
    vi.stubEnv("THAI_CONTEXT_API_URL", "https://example.test/search");
    vi.stubEnv("THAI_CONTEXT_USE_MOCK", "false");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ data: mockSearch("วิจัย") })),
    );
    const data = await (await POST(req("วิจัย"))).json();
    expect(data.mode).toBe("live");
    expect(data.recommendations).toHaveLength(1);
  });
  it("falls back visibly when backend fails or returns malformed data", async () => {
    vi.stubEnv("THAI_CONTEXT_API_URL", "https://example.test/search");
    vi.stubEnv("THAI_CONTEXT_USE_MOCK", "false");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ recommendations: "invalid" })),
    );
    const data = await (await POST(req("ทำงาน"))).json();
    expect(data.mode).toBe("fallback");
    expect(data.recommendations).toHaveLength(3);
  });
  it("rejects unsafe schema values before they reach rendering", () => {
    const r = mockSearch("วิจัย");
    expect(() =>
      parseResponse({
        ...r,
        recommendations: [{ ...r.recommendations[0], score: Infinity }],
      }),
    ).toThrow();
    expect(() =>
      parseResponse({
        ...r,
        recommendations: [
          {
            ...r.recommendations[0],
            evidence: { source_book: {}, quote: "x" },
          },
        ],
      }),
    ).toThrow();
  });
});
