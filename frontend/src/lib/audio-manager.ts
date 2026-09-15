import type { Recommendation } from "./search-types";
import { synthesizeSpeech } from "./tts-client";

export type AudioStatus = "idle" | "loading" | "playing" | "paused" | "error";

let audio: HTMLAudioElement | null = null;
let objectUrl: string | null = null;
let utterance: SpeechSynthesisUtterance | null = null;
let requestController: AbortController | null = null;
let requestTimer: ReturnType<typeof setTimeout> | null = null;
let status: AudioStatus = "idle";
let activeWord = "";
let generation = 0;
let fallbackGeneration = -1;
const listeners = new Set<() => void>();

const speechApi = () => {
  if (typeof window === "undefined") return null;
  const candidate = window.speechSynthesis;
  return candidate &&
    typeof candidate.cancel === "function" &&
    typeof candidate.speak === "function"
    ? candidate
    : null;
};

const notify = (next: AudioStatus) => {
  status = next;
  listeners.forEach((listener) => listener());
};

const clearRequest = () => {
  requestController?.abort();
  requestController = null;
  if (requestTimer) clearTimeout(requestTimer);
  requestTimer = null;
};

const clearAudio = () => {
  if (audio) {
    audio.onplaying = null;
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    audio = null;
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
};

const clearSpeech = () => {
  if (utterance) {
    utterance.onstart = null;
    utterance.onend = null;
    utterance.onerror = null;
    utterance = null;
  }
  const speech = speechApi();
  if (speech) {
    try {
      speech.cancel();
      if (typeof speech.resume === "function") {
        speech.resume();
      }
    } catch {
      // Ignore cancel error
    }
  }
};

const complete = (token: number) => {
  if (generation !== token) return;
  clearRequest();
  clearAudio();
  clearSpeech();
  activeWord = "";
  notify("idle");
};

const fail = (token: number) => {
  if (generation !== token) return;
  clearRequest();
  clearAudio();
  clearSpeech();
  notify("error");
};

const browserFallback = (word: Recommendation, token: number, reason: unknown) => {
  if (generation !== token || fallbackGeneration === token) return;
  fallbackGeneration = token;
  clearAudio();
  console.warn("[TTS] Server audio failed; trying browser speech fallback.", reason);

  const speech = speechApi();
  if (
    !speech ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    fail(token);
    return;
  }

  try {
    speech.cancel();
    if (typeof speech.resume === "function") {
      speech.resume();
    }

    utterance = new SpeechSynthesisUtterance(word.headword);
    const targetLocale = word.pronunciation?.locale ?? "th-TH";
    utterance.lang = targetLocale;
    utterance.rate = 0.85;

    try {
      const voices = speech.getVoices?.() || [];
      const match = voices.find(
        (v) =>
          v.lang?.toLowerCase() === targetLocale.toLowerCase() ||
          v.lang?.toLowerCase().startsWith("th"),
      );
      if (match) utterance.voice = match;
    } catch {
      // Ignore voice lookup error
    }

    utterance.onstart = () => {
      if (generation !== token) return;
      if (requestTimer) clearTimeout(requestTimer);
      requestTimer = null;
      notify("playing");
    };
    utterance.onend = () => complete(token);
    utterance.onerror = () => fail(token);
    requestTimer = setTimeout(() => {
      if (generation === token && status === "loading") fail(token);
    }, 4000);
    speech.speak(utterance);
    if (speech.paused && typeof speech.resume === "function") {
      speech.resume();
    }
  } catch (error) {
    console.warn("[TTS] Browser speech fallback failed.", error);
    fail(token);
  }
};

export const audioManager = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  snapshot: () => status,
  active: () => activeWord,
  stop(expectedWord?: string) {
    if (expectedWord && activeWord !== expectedWord) return;
    generation++;
    fallbackGeneration = -1;
    clearRequest();
    clearAudio();
    clearSpeech();
    activeWord = "";
    notify("idle");
  },
  async toggle(word: Recommendation) {
    const headword = word.headword.trim();
    if (!headword) return;

    if (activeWord === headword && status === "loading") return;
    if (activeWord === headword && status === "playing") {
      if (audio) audio.pause();
      else {
        const speech = speechApi();
        if (speech && typeof speech.pause === "function") speech.pause();
        else {
          fail(generation);
          return;
        }
      }
      notify("paused");
      return;
    }
    if (activeWord === headword && status === "paused") {
      const token = generation;
      try {
        if (audio) await audio.play();
        else {
          const speech = speechApi();
          if (!speech || typeof speech.resume !== "function")
            throw new Error("No audio source to resume");
          speech.resume();
        }
        if (generation === token) notify("playing");
      } catch (error) {
        console.warn("[TTS] Audio resume failed.", error);
        fail(token);
      }
      return;
    }

    this.stop();
    const token = generation;
    fallbackGeneration = -1;
    activeWord = headword;
    notify("loading");

    // Initialize HTMLAudioElement synchronously within the user gesture context
    let pendingAudio: HTMLAudioElement | null = null;
    if (typeof Audio !== "undefined") {
      try {
        pendingAudio = new Audio();
        audio = pendingAudio;
      } catch {
        // Fall back if Audio constructor fails in test/headless environment
      }
    }

    const controller = new AbortController();
    requestController = controller;
    requestTimer = setTimeout(() => controller.abort(), 15000);

    try {
      const result = await synthesizeSpeech(headword, controller.signal);
      if (generation !== token) return;
      if (requestTimer) clearTimeout(requestTimer);
      requestTimer = null;
      requestController = null;

      objectUrl = URL.createObjectURL(result.blob);
      const targetAudio = pendingAudio ?? (typeof Audio !== "undefined" ? new Audio() : null);
      if (!targetAudio) {
        throw new Error("HTML Audio not supported");
      }
      audio = targetAudio;
      targetAudio.preload = "auto";
      targetAudio.src = objectUrl;
      targetAudio.onplaying = () => {
        if (generation === token) notify("playing");
      };
      targetAudio.onended = () => complete(token);
      targetAudio.onerror = () =>
        browserFallback(word, token, new Error("Audio decoding failed"));

      try {
        await targetAudio.play();
        if (generation === token) notify("playing");
      } catch (error) {
        browserFallback(word, token, error);
      }
    } catch (error) {
      if (generation !== token) return;
      if (requestTimer) clearTimeout(requestTimer);
      requestTimer = null;
      requestController = null;
      browserFallback(word, token, error);
    }
  },
};
