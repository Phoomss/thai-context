import { afterEach, expect, it, vi } from "vitest";
import { audioManager } from "../src/lib/audio-manager";

const word = (headword: string) => ({ headword, definition: "test" });
const response = () =>
  new Response(
    JSON.stringify({
      audioBase64: "UklGRg==",
      format: "wav",
      provider: "LOCAL_MOCK_FALLBACK",
      cached: false,
      durationMs: 600,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );

function mockAudio(play: () => Promise<void> = () => Promise.resolve()) {
  const element = {
    play: vi.fn(play),
    pause: vi.fn(),
    load: vi.fn(),
    removeAttribute: vi.fn(),
    preload: "",
    onplaying: null as null | (() => void),
    onended: null as null | (() => void),
    onerror: null as null | (() => void),
  };
  vi.stubGlobal(
    "Audio",
    class {
      constructor() {
        return element;
      }
    },
  );
  return element;
}

afterEach(() => {
  audioManager.stop();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("uses server TTS first and cleans up audio and its object URL", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response()));
  const element = mockAudio();
  const revoke = vi.spyOn(URL, "revokeObjectURL");

  await audioManager.toggle(word("วิจัย"));

  expect(fetch).toHaveBeenCalledWith(
    "/api/v1/tts/synthesize",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ text: "วิจัย" }),
    }),
  );
  expect(audioManager.snapshot()).toBe("playing");
  expect(audioManager.active()).toBe("วิจัย");

  element.onended?.();
  expect(audioManager.snapshot()).toBe("idle");
  expect(audioManager.active()).toBe("");
  expect(element.pause).toHaveBeenCalled();
  expect(revoke).toHaveBeenCalledTimes(1);
});

it("does not duplicate a request while the same word is loading", async () => {
  const pendingFetch = vi.fn(
    (_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        );
      }),
  );
  vi.stubGlobal("fetch", pendingFetch);

  const first = audioManager.toggle(word("ร่วมมือ"));
  await audioManager.toggle(word("ร่วมมือ"));

  expect(pendingFetch).toHaveBeenCalledTimes(1);
  expect(audioManager.snapshot()).toBe("loading");
  audioManager.stop();
  await first;
  expect(audioManager.snapshot()).toBe("idle");
});

it("aborts stale synthesis before playing a different word", async () => {
  const fetchMock = vi
    .fn()
    .mockImplementationOnce(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    )
    .mockResolvedValueOnce(response());
  vi.stubGlobal("fetch", fetchMock);
  mockAudio();

  const stale = audioManager.toggle(word("คำเก่า"));
  await audioManager.toggle(word("คำใหม่"));
  await stale;

  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(audioManager.active()).toBe("คำใหม่");
  expect(audioManager.snapshot()).toBe("playing");
});

it("handles playback rejection without an unhandled promise", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response()));
  mockAudio(() => Promise.reject(new DOMException("Blocked", "NotAllowedError")));
  vi.stubGlobal("SpeechSynthesisUtterance", undefined);

  await audioManager.toggle(word("ประสิทธิภาพ"));

  expect(audioManager.snapshot()).toBe("error");
  expect(audioManager.active()).toBe("ประสิทธิภาพ");
});

it("uses browser speech only after server TTS fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
  let utterance:
    | (SpeechSynthesisUtterance & {
        onstart: (() => void) | null;
        onend: (() => void) | null;
      })
    | undefined;
  class FakeUtterance {
    lang = "";
    rate = 1;
    onstart: (() => void) | null = null;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(readonly text: string) {
      utterance = this as unknown as typeof utterance;
    }
  }
  const speech = {
    cancel: vi.fn(),
    speak: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  };
  vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
  vi.stubGlobal("speechSynthesis", speech);

  await audioManager.toggle(word("ภาษาไทย"));
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(speech.speak).toHaveBeenCalledTimes(1);

  utterance?.onstart?.();
  expect(audioManager.snapshot()).toBe("playing");
  utterance?.onend?.();
  expect(audioManager.snapshot()).toBe("idle");
});

it("leaves loading and becomes retryable if browser fallback never starts", async () => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
  vi.stubGlobal(
    "SpeechSynthesisUtterance",
    class {
      lang = "";
      rate = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
    },
  );
  vi.stubGlobal("speechSynthesis", {
    cancel: vi.fn(),
    speak: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  });

  await audioManager.toggle(word("เสียงค้าง"));
  expect(audioManager.snapshot()).toBe("loading");
  await vi.advanceTimersByTimeAsync(4000);
  expect(audioManager.snapshot()).toBe("error");
});

it("ignores a pending resume after playback is stopped", async () => {
  let resume!: () => void;
  const element = mockAudio(
    vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockImplementationOnce(
        () => new Promise<void>((resolve) => (resume = resolve)),
      ),
  );
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response()));

  await audioManager.toggle(word("วิจัย"));
  element.onplaying?.();
  await audioManager.toggle(word("วิจัย"));
  expect(audioManager.snapshot()).toBe("paused");
  const pending = audioManager.toggle(word("วิจัย"));
  audioManager.stop();
  resume();
  await pending;

  expect(audioManager.snapshot()).toBe("idle");
  expect(audioManager.active()).toBe("");
});
