"use client";

import { useEffect, useSyncExternalStore } from "react";
import { audioManager } from "@/lib/audio-manager";
import type { Recommendation } from "@/lib/search-types";
import Icon from "../ui/Icon";

export default function PronunciationButton({ word }: { word: Recommendation }) {
  const status = useSyncExternalStore(
    audioManager.subscribe,
    audioManager.snapshot,
    () => "idle",
  );
  const headword = word.headword.trim();
  const active = audioManager.active() === headword;
  const loading = active && status === "loading";
  const playing = active && status === "playing";
  const paused = active && status === "paused";
  const error = active && status === "error";

  useEffect(
    () => () => audioManager.stop(headword),
    [headword],
  );

  const label = loading
    ? `กำลังสร้างเสียงคำว่า ${word.headword}`
    : playing
      ? `หยุดเสียงคำว่า ${word.headword} ชั่วคราว`
      : paused
        ? `ฟังเสียงคำว่า ${word.headword} ต่อ`
        : error
          ? `ลองฟังการออกเสียงคำว่า ${word.headword} อีกครั้ง`
          : `ฟังการออกเสียงคำว่า ${word.headword}`;

  return (
    <div className="audio-control">
      <button
        className="icon-button"
        type="button"
        aria-label={label}
        aria-pressed={playing}
        aria-busy={loading}
        disabled={loading}
        onClick={() => void audioManager.toggle(word)}
        title={label}
      >
        <Icon name={playing ? "pause" : paused ? "play" : "volume"} />
        <span>
          {loading
            ? "กำลังโหลด"
            : playing
              ? "หยุดชั่วคราว"
              : paused
                ? "ฟังต่อ"
                : error
                  ? "ลองอีกครั้ง"
                  : "ฟังเสียง"}
        </span>
      </button>
      {error && (
        <small role="status" aria-live="polite">
          ไม่สามารถเล่นเสียงได้ ลองอีกครั้ง
        </small>
      )}
    </div>
  );
}
