export type TtsSynthesisResponse = {
  audioBase64: string;
  format: string;
  provider: string;
  cached: boolean;
  durationMs?: number;
};

export type TtsAudio = {
  blob: Blob;
  metadata: Omit<TtsSynthesisResponse, "audioBase64">;
};

export class TtsClientError extends Error {
  constructor(
    message: string,
    readonly kind: "http" | "response" | "decode",
  ) {
    super(message);
    this.name = "TtsClientError";
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const mimeTypeFor = (format: string) => {
  const normalized = format.trim().toLowerCase();
  if (normalized === "wav" || normalized === "wave") return "audio/wav";
  if (normalized === "mp3" || normalized === "mpeg") return "audio/mpeg";
  if (normalized === "m4a") return "audio/mp4";
  if (/^[a-z0-9.+-]+$/.test(normalized)) return `audio/${normalized}`;
  throw new TtsClientError("Invalid audio format", "response");
};

export function parseTtsResponse(value: unknown): TtsSynthesisResponse {
  if (
    !isObject(value) ||
    typeof value.audioBase64 !== "string" ||
    !value.audioBase64.trim() ||
    typeof value.format !== "string" ||
    !value.format.trim() ||
    typeof value.provider !== "string" ||
    typeof value.cached !== "boolean" ||
    (value.durationMs !== undefined &&
      (typeof value.durationMs !== "number" ||
        !Number.isFinite(value.durationMs) ||
        value.durationMs < 0))
  )
    throw new TtsClientError("Invalid TTS response", "response");

  return {
    audioBase64: value.audioBase64,
    format: value.format,
    provider: value.provider,
    cached: value.cached,
    durationMs: value.durationMs as number | undefined,
  };
}

function decodeAudio(response: TtsSynthesisResponse): Blob {
  let decoded: string;
  try {
    decoded = atob(response.audioBase64);
  } catch {
    throw new TtsClientError("Invalid base64 audio", "decode");
  }
  if (!decoded.length)
    throw new TtsClientError("Empty audio response", "decode");

  const bytes = new Uint8Array(decoded.length);
  for (let index = 0; index < decoded.length; index++)
    bytes[index] = decoded.charCodeAt(index);

  return new Blob([bytes], { type: mimeTypeFor(response.format) });
}

export async function synthesizeSpeech(
  text: string,
  signal: AbortSignal,
): Promise<TtsAudio> {
  const normalized = text.trim();
  if (!normalized)
    throw new TtsClientError("Missing text to synthesize", "response");

  const response = await fetch("/api/v1/tts/synthesize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: normalized }),
    signal,
  });
  if (!response.ok)
    throw new TtsClientError(
      `TTS request failed with HTTP ${response.status}`,
      "http",
    );

  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    throw new TtsClientError("Invalid JSON response", "response");
  }
  const parsed = parseTtsResponse(raw);
  return {
    blob: decodeAudio(parsed),
    metadata: {
      format: parsed.format,
      provider: parsed.provider,
      cached: parsed.cached,
      durationMs: parsed.durationMs,
    },
  };
}
