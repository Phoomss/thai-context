import { afterEach, expect, it, vi } from "vitest";
import { audioManager } from "../src/lib/audio-manager";

afterEach(() => { audioManager.stop(); vi.unstubAllGlobals(); });

it("ignores a pending resume after playback is stopped for a new search", async () => {
  let resume!: () => void;
  const element = {
    play: vi.fn().mockResolvedValueOnce(undefined).mockImplementationOnce(() => new Promise<void>(resolve => { resume = resolve; })),
    pause: vi.fn(), load: vi.fn(), removeAttribute: vi.fn(),
    onplaying: () => {}, onended: () => {}, onerror: () => {},
  };
  vi.stubGlobal("Audio", class { constructor() { return element; } });
  const word = { headword: "วิจัย", definition: "test", pronunciation: { audio_url: "/test.wav" } };
  await audioManager.toggle(word);
  element.onplaying();
  await audioManager.toggle(word);
  expect(audioManager.snapshot()).toBe("paused");
  const pending = audioManager.toggle(word);
  audioManager.stop();
  resume();
  await pending;
  expect(audioManager.snapshot()).toBe("idle");
  expect(audioManager.active()).toBe("");
});
