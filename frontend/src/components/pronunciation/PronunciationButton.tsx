"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { audioManager } from "@/lib/audio-manager";
import type { Recommendation } from "@/lib/search-types";
import Icon from "../ui/Icon";
export default function PronunciationButton({ word }: { word: Recommendation }) {
  const [supported, setSupported] = useState(false);
  const status = useSyncExternalStore(audioManager.subscribe, audioManager.snapshot, () => "idle");
  useEffect(() => { setSupported(!!word.pronunciation?.audio_url || "speechSynthesis" in window); return () => audioManager.stop(); }, [word]);
  if (!supported) return null;
  const playing = status === "playing" && audioManager.active() === word.headword;
  const paused = status === "paused" && audioManager.active() === word.headword;
  return <div className="audio-control">
    <button className="icon-button" aria-label={playing ? `หยุดเสียงคำว่า ${word.headword} ชั่วคราว` : `อ่านออกเสียงคำว่า ${word.headword}`} aria-pressed={playing} disabled={status === "loading"} onClick={() => audioManager.toggle(word)} title="อ่านออกเสียง">
      <Icon name={playing ? "pause" : paused ? "play" : "volume"} />
      <span>{status === "loading" ? "กำลังโหลด" : playing ? "หยุดชั่วคราว" : paused ? "ฟังต่อ" : "ฟังเสียง"}</span>
    </button>
    {status === "error" && <small role="status">ไม่สามารถเล่นเสียงได้ ลองอีกครั้ง</small>}
  </div>;
}
