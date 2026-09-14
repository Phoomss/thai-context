// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/v1/tts/synthesize/route";

const request = (body: unknown) =>
  new Request("http://localhost/api/v1/tts/synthesize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("TTS API boundary", () => {
  it.each([{}, { text: "" }, { text: "   " }, { text: 42 }])(
    "rejects an invalid body %#",
    async (body) => {
      expect((await POST(request(body))).status).toBe(400);
    },
  );

  it("forwards only the normalized text to the configured NestJS endpoint", async () => {
    vi.stubEnv(
      "THAI_CONTEXT_TTS_API_URL",
      "https://api.example.test/api/v1/tts/synthesize",
    );
    const payload = {
      audioBase64: "UklGRg==",
      format: "wav",
      provider: "LOCAL_MOCK_FALLBACK",
      cached: false,
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(payload));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request({ text: "  วิจัย  ", ignored: true }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/v1/tts/synthesize",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ text: "วิจัย" }),
        cache: "no-store",
      }),
    );
  });

  it("converts upstream HTTP and network failures into safe responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(new Response(null, { status: 503 })),
    );
    expect((await POST(request({ text: "วิจัย" }))).status).toBe(503);

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    expect((await POST(request({ text: "วิจัย" }))).status).toBe(502);
  });
});
