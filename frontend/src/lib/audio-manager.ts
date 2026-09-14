import type { Recommendation } from "./search-types";
export type AudioStatus = "idle" | "loading" | "playing" | "paused" | "error";
let audio: HTMLAudioElement | null = null;
let utterance: SpeechSynthesisUtterance | null = null;
let status: AudioStatus = "idle";
let activeWord = "";
let generation = 0;
const listeners = new Set<() => void>();
const notify = (next: AudioStatus) => { status = next; listeners.forEach(fn => fn()); };
export const audioManager = {
  subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
  snapshot: () => status,
  active: () => activeWord,
  stop() {
    generation++;
    if (audio) { audio.pause(); audio.removeAttribute("src"); audio.load(); audio = null; }
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    utterance = null; activeWord = ""; notify("idle");
  },
  async toggle(word: Recommendation) {
    if (activeWord === word.headword && status === "playing") {
      if (audio) audio.pause(); else window.speechSynthesis.pause();
      notify("paused"); return;
    }
    if (activeWord === word.headword && status === "paused") {
      const token = generation;
      try { if (audio) await audio.play(); else window.speechSynthesis.resume(); if (generation === token) notify("playing"); }
      catch { if (generation === token) notify("error"); }
      return;
    }
    this.stop();
    const token = generation;
    activeWord = word.headword; notify("loading");
    const update = (next: AudioStatus) => { if (generation === token) notify(next); };
    if (word.pronunciation?.audio_url) {
      audio = new Audio(word.pronunciation.audio_url);
      audio.onplaying = () => update("playing");
      audio.onended = () => update("idle");
      audio.onerror = () => update("error");
      try { await audio.play(); } catch { update("error"); }
    } else if ("speechSynthesis" in window) {
      utterance = new SpeechSynthesisUtterance(word.headword);
      utterance.lang = word.pronunciation?.locale ?? "th-TH";
      utterance.rate = 0.85;
      utterance.onstart = () => update("playing");
      utterance.onend = () => update("idle");
      utterance.onerror = () => update("error");
      window.speechSynthesis.speak(utterance);
    } else update("error");
  },
};
