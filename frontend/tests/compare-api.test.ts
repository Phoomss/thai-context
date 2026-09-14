// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/v1/compare/route";
import { normalizeCompareWords, parseCompareResponse } from "@/lib/compare-types";

const request = (body: unknown) => new Request("http://localhost/api/v1/compare", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("compare API boundary", () => {
  it.each([
    { words: ["คำเดียว"] },
    { words: ["หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก"] },
    { words: ["ดี", " ดี "] },
    { words: ["ภาษาไทย", "   "] },
    { words: ["thai", "word"] },
  ])("rejects invalid comparison input %#", async (body) => {
    expect((await POST(request(body))).status).toBe(400);
  });

  it("forwards normalized Thai words and preserves the upstream response", async () => {
    // The existing project also permits this variable to contain a full
    // endpoint used by search. Compare must resolve it back to the API origin.
    vi.stubEnv(
      "THAI_CONTEXT_API_URL",
      "https://api.example.test/api/v1/search/meaning",
    );
    const payload = {
      words: [
        { headword: "ประสิทธิภาพ", definition: "นิยามหนึ่ง", edition: "2554" },
        { headword: "ประสิทธิผล", definition: "นิยามสอง", edition: "2554" },
      ],
      comparison: {
        meaningDifference: "ต่างกัน",
        contextDifference: "บริบทต่างกัน",
        usageGuidance: "เลือกตามนิยาม",
      },
      evidence: [],
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(payload));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request({ words: [" ประสิทธิภาพ ", "ประสิทธิผล"] }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/compare",
      expect.objectContaining({ body: JSON.stringify({ words: ["ประสิทธิภาพ", "ประสิทธิผล"] }) }),
    );
  });

  it("preserves upstream errors and does not fabricate a comparison", async () => {
    const upstreamError = { success: false, error: { message: "AI unavailable" } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(upstreamError, { status: 503 })));
    const response = await POST(request({ words: ["คำหนึ่ง", "คำสอง"] }));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual(upstreamError);
  });
});

describe("compare response contract", () => {
  it("normalizes the legacy word field without inventing missing evidence", () => {
    const parsed = parseCompareResponse({
      words: [{ word: "คำหนึ่ง", definition: "นิยาม" }, { word: "คำสอง", definition: "นิยาม" }],
      comparison: { meaningDifference: "ก", contextDifference: "ข", usageGuidance: "ค" },
    });
    expect(parsed.words[0].headword).toBe("คำหนึ่ง");
    expect(parsed.evidence).toEqual([]);
  });

  it("trims valid input and rejects duplicates", () => {
    expect(normalizeCompareWords([" คำหนึ่ง ", "คำสอง"])).toEqual(["คำหนึ่ง", "คำสอง"]);
    expect(() => normalizeCompareWords(["คำหนึ่ง", " คำหนึ่ง "])).toThrow(/ไม่ซ้ำ/);
  });
});
