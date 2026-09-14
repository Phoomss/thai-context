import { afterEach, expect, it, vi } from "vitest";
import {
  parseTtsResponse,
  synthesizeSpeech,
  TtsClientError,
} from "../src/lib/tts-client";

afterEach(() => vi.unstubAllGlobals());

it("validates and decodes the real NestJS TTS response contract", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json({
        audioBase64: "UklGRg==",
        format: "wav",
        provider: "AI_SERVICE_TTS",
        cached: true,
        durationMs: 720,
      }),
    ),
  );

  const result = await synthesizeSpeech(" วิจัย ", new AbortController().signal);

  expect(result.blob.type).toBe("audio/wav");
  expect(result.blob.size).toBe(4);
  expect(result.metadata).toEqual({
    format: "wav",
    provider: "AI_SERVICE_TTS",
    cached: true,
    durationMs: 720,
  });
  expect(fetch).toHaveBeenCalledWith(
    "/api/v1/tts/synthesize",
    expect.objectContaining({ body: JSON.stringify({ text: "วิจัย" }) }),
  );
});

it.each([
  null,
  {},
  { audioBase64: "", format: "wav", provider: "x", cached: false },
  { audioBase64: "UklGRg==", format: "wav", provider: "x", cached: "no" },
  { audioBase64: "UklGRg==", format: "wav", provider: "x", cached: false, durationMs: -1 },
])("rejects an invalid TTS payload %#", (payload) => {
  expect(() => parseTtsResponse(payload)).toThrow(TtsClientError);
});

it("rejects HTTP, malformed JSON, and invalid base64 responses", async () => {
  const controller = new AbortController();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValueOnce(new Response(null, { status: 500 })),
  );
  await expect(synthesizeSpeech("วิจัย", controller.signal)).rejects.toMatchObject({
    kind: "http",
  });

  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValueOnce(new Response("not-json", { status: 200 })),
  );
  await expect(synthesizeSpeech("วิจัย", controller.signal)).rejects.toMatchObject({
    kind: "response",
  });

  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValueOnce(
      Response.json({
        audioBase64: "%%%",
        format: "wav",
        provider: "test",
        cached: false,
      }),
    ),
  );
  await expect(synthesizeSpeech("วิจัย", controller.signal)).rejects.toMatchObject({
    kind: "decode",
  });
});
