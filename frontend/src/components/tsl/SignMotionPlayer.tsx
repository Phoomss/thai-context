"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { MotionData, SignResourceItem } from "@/lib/sign-language-types";
import SignAvatarCanvas from "./SignAvatarCanvas";
import Icon from "../ui/Icon";

export interface SignMotionPlayerProps {
  resource: SignResourceItem;
  initialSpeed?: number;
  autoPlay?: boolean;
}

export default function SignMotionPlayer({
  resource,
  initialSpeed = 1.0,
  autoPlay = true,
}: SignMotionPlayerProps) {
  const motionData = resource.representation?.data as MotionData | undefined;
  const duration = motionData?.duration_ms || 1800;

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(initialSpeed);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"AVATAR" | "SKELETON">("AVATAR");
  const [isLoop, setIsLoop] = useState<boolean>(true);

  const lastFrameTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Stop / play animation loop
  const stepAnimation = useCallback(
    (now: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = now;
      }
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      setCurrentTimeMs((prev) => {
        const next = prev + delta * playbackSpeed;
        if (next >= duration) {
          if (isLoop) {
            return 0;
          } else {
            setIsPlaying(false);
            return duration;
          }
        }
        return next;
      });

      if (isPlaying) {
        animFrameIdRef.current = requestAnimationFrame(stepAnimation);
      }
    },
    [isPlaying, playbackSpeed, duration, isLoop]
  );

  useEffect(() => {
    if (isPlaying) {
      lastFrameTimeRef.current = null;
      animFrameIdRef.current = requestAnimationFrame(stepAnimation);
    } else {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      lastFrameTimeRef.current = null;
    }
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, stepAnimation]);

  const togglePlay = () => {
    if (!isPlaying && currentTimeMs >= duration) {
      setCurrentTimeMs(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleReplay = () => {
    setCurrentTimeMs(0);
    setIsPlaying(true);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTimeMs(val);
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      togglePlay();
    } else if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      handleReplay();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setCurrentTimeMs((prev) => Math.max(0, prev - 150));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setCurrentTimeMs((prev) => Math.min(duration, prev + 150));
    }
  };

  const currentSeconds = (currentTimeMs / 1000).toFixed(1);
  const totalSeconds = (duration / 1000).toFixed(1);

  const descSource = resource.metadata?.description_source || "VERIFIED";
  const descSourceLabel =
    descSource === "OFFICIAL"
      ? "คำอธิบายทางการ (Official)"
      : descSource === "VERIFIED"
      ? "ผ่านการตรวจสอบ (Verified)"
      : "AI แนะนำ (AI-Generated)";

  return (
    <div
      className="sign-motion-player font-thai-reading"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={`เครื่องเล่นการเคลื่อนไหวภาษามือไทยสำหรับคำว่า ${resource.word}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        background: "#ffffff",
        borderRadius: "16px",
        padding: "16px",
        border: "1px solid var(--border, #e2e8f0)",
        outline: "none",
      }}
    >
      {/* 3D Avatar / Skeleton Canvas */}
      {motionData ? (
        <SignAvatarCanvas
          motionData={motionData}
          currentTimeMs={currentTimeMs}
          viewMode={viewMode}
          isPaused={!isPlaying}
        />
      ) : (
        <div
          style={{
            height: "220px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8fafc",
            borderRadius: "12px",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          ไม่มีข้อมูลการเคลื่อนไหว 3 มิติ
        </div>
      )}

      {/* Progress Timeline Scrubber */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "#64748b",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span>{currentSeconds}s</span>
          <span>{totalSeconds}s</span>
        </div>
        <input
          type="range"
          min={0}
          max={duration}
          step={20}
          value={Math.round(currentTimeMs)}
          onChange={handleScrub}
          aria-label="แถบเลื่อนความคืบหน้าท่าภาษามือ"
          style={{
            width: "100%",
            accentColor: "var(--accent, #0284c7)",
            cursor: "pointer",
            height: "6px",
            borderRadius: "3px",
          }}
        />
      </div>

      {/* Player Controls Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          paddingTop: "6px",
        }}
      >
        {/* Left: Play/Pause/Replay Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "หยุดชั่วคราว (Pause)" : "เล่นท่ามือ (Play)"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "10px",
              background: "var(--accent, #0284c7)",
              color: "white",
              border: "none",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <Icon name={isPlaying ? "pause" : "play"} />
            <span>{isPlaying ? "พัก (Pause)" : "เล่น (Play)"}</span>
          </button>

          <button
            type="button"
            onClick={handleReplay}
            aria-label="เล่นอีกครั้ง (Replay)"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "10px",
              background: "#f1f5f9",
              color: "#334155",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <span>↻</span>
            <span>เล่นอีกครั้ง</span>
          </button>

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#475569",
              cursor: "pointer",
              marginLeft: "4px",
            }}
          >
            <input
              type="checkbox"
              checked={isLoop}
              onChange={(e) => setIsLoop(e.target.checked)}
              style={{ accentColor: "var(--accent, #0284c7)" }}
            />
            <span>วนซ้ำ</span>
          </label>
        </div>

        {/* Right: Speed & View Mode */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Speed Presets */}
          <div
            role="group"
            aria-label="ความเร็วการเล่น (Playback Speed)"
            style={{
              display: "inline-flex",
              background: "#f1f5f9",
              padding: "2px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            {[0.5, 1.0, 1.5].map((speed) => {
              const active = playbackSpeed === speed;
              return (
                <button
                  key={speed}
                  type="button"
                  onClick={() => handleSpeedChange(speed)}
                  aria-pressed={active}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    border: "none",
                    background: active ? "white" : "transparent",
                    color: active ? "var(--accent, #0284c7)" : "#64748b",
                    fontWeight: active ? 700 : 500,
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {speed}x
                </button>
              );
            })}
          </div>

          {/* Toggle Avatar vs Skeleton */}
          <button
            type="button"
            onClick={() => setViewMode((m) => (m === "AVATAR" ? "SKELETON" : "AVATAR"))}
            aria-label={`สลับมุมมอง: ขณะนี้แสดง ${viewMode === "AVATAR" ? "3D อวตาร" : "โครงกระดูก"}`}
            style={{
              padding: "5px 10px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              background: viewMode === "SKELETON" ? "#ecfdf5" : "#f8fafc",
              color: viewMode === "SKELETON" ? "#047857" : "#334155",
              border: `1px solid ${viewMode === "SKELETON" ? "#a7f3d0" : "#cbd5e1"}`,
              cursor: "pointer",
            }}
          >
            {viewMode === "AVATAR" ? "🦴 ดูโครงกระดูก" : "👤 ดู 3D อวตาร"}
          </button>
        </div>
      </div>

      {/* Text Description Fallback (Section 14 & 15 Accessibility) */}
      {resource.metadata?.description_th && (
        <div
          className="tsl-text-description"
          style={{
            marginTop: "6px",
            padding: "10px 14px",
            borderRadius: "10px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: "13px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}
          >
            <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "12px" }}>
              🤟 คำอธิบายท่าทาง (Gesture Description)
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: "4px",
                background: descSource === "OFFICIAL" ? "#dbeafe" : "#fef3c7",
                color: descSource === "OFFICIAL" ? "#1e40af" : "#92400e",
              }}
            >
              {descSourceLabel}
            </span>
          </div>
          <p style={{ margin: 0, color: "#334155", lineHeight: 1.6 }}>
            {resource.metadata.description_th}
          </p>
          {resource.metadata.description_en && (
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "12px", fontStyle: "italic" }}>
              {resource.metadata.description_en}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
