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
  speechApi()?.cancel();
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

  if (
    !speechApi() ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    fail(token);
    return;
  }

  try {
    utterance = new SpeechSynthesisUtterance(word.headword);
    utterance.lang = word.pronunciation?.locale ?? "th-TH";
    utterance.rate = 0.85;
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
    speechApi()?.speak(utterance);
  } catch (error) {
    console.warn("[TTS] Browser speech fallback failed.", error);
    fail(token);
  }
};

export const audioManager = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
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

    const controller = new AbortController();
    requestController = controller;
    requestTimer = setTimeout(() => controller.abort(), 8000);

    try {
      const result = await synthesizeSpeech(headword, controller.signal);
      if (generation !== token) return;
      if (requestTimer) clearTimeout(requestTimer);
      requestTimer = null;
      requestController = null;

      objectUrl = URL.createObjectURL(result.blob);
      audio = new Audio(objectUrl);
      audio.preload = "auto";
      audio.onplaying = () => {
        if (generation === token) notify("playing");
      };
      audio.onended = () => complete(token);
      audio.onerror = () =>
        browserFallback(word, token, new Error("Audio decoding failed"));

      try {
        await audio.play();
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
