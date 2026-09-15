"use client";

import React, { useState, useEffect } from "react";
import type { AccessibilityProfile, BrailleData } from "@/lib/accessibility-types";
import type { SignResourceItem } from "@/lib/sign-language-types";
import { getSignResource } from "@/lib/sign-motion-data";
import { encodeThaiToBraille } from "@/lib/braille-encoder";
import { audioManager } from "@/lib/audio-manager";
import SignMotionPlayer from "../tsl/SignMotionPlayer";
import SignContributionModal from "../tsl/SignContributionModal";
import BrailleModal from "../braille/BrailleModal";
import Icon from "../ui/Icon";

export interface LanguageRepresentationCardProps {
  word: string;
  definition?: string;
  phonetic?: string;
  english?: string;
  initialMode?: "text" | "audio" | "sign" | "braille";
  compact?: boolean;
  onOpenFullSignModal?: () => void;
  onOpenFullBrailleModal?: () => void;
}

export default function LanguageRepresentationCard({
  word,
  definition,
  phonetic,
  english,
  initialMode,
  compact = false,
  onOpenFullSignModal,
  onOpenFullBrailleModal,
}: LanguageRepresentationCardProps) {
  // Mode selection state
  const [activeMode, setActiveMode] = useState<"text" | "audio" | "sign" | "braille">(() => {
    if (initialMode) return initialMode;
    if (typeof window !== "undefined") {
      const savedProfile = localStorage.getItem("thai_context_access_profile") as AccessibilityProfile | null;
      if (savedProfile && savedProfile !== "auto") {
        return savedProfile;
      }
    }
    return "text";
  });

  // Sign language state
  const [signResource, setSignResource] = useState<SignResourceItem>(() => getSignResource(word));
  const [signSpeed, setSignSpeed] = useState<number>(1.0);
  const [isContribOpen, setIsContribOpen] = useState(false);
  const [showReverseSearchInfo, setShowReverseSearchInfo] = useState(false);

  // Braille state
  const [brailleData, setBrailleData] = useState<BrailleData>(() => encodeThaiToBraille(word));
  const [brailleCopied, setBrailleCopied] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);
  const [internalBrailleModalOpen, setInternalBrailleModalOpen] = useState(false);

  // Audio playing state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    setSignResource(getSignResource(word));
    setBrailleData(encodeThaiToBraille(word));
  }, [word]);

  const handleModeChange = (mode: "text" | "audio" | "sign" | "braille") => {
    setActiveMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("thai_context_access_profile", mode);
    }
    if (mode === "audio") {
      handlePlayAudio();
    }
  };

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    audioManager.toggle({
      headword: word,
      pronunciation: { phonetic: phonetic || word, locale: "th-TH" },
      pos: "น.",
      definition: definition || "",
    } as any);
    setTimeout(() => setIsPlayingAudio(false), 2000);
  };

  const handleCopyBraille = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(brailleData.brailleUnicode);
      setBrailleCopied(true);
      setTimeout(() => setBrailleCopied(false), 2000);
    }
  };

  const handleExportTextAndBraille = () => {
    const content = `[คำศัพท์ภาษาไทย]: ${word}\n[อักษรเบรลล์ไทย (Unicode)]: ${brailleData.brailleUnicode}\n[คำอ่านสะกดเบรลล์]: ${brailleData.readingGuide}\n[นิยาม]: ${definition || "-"}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(content);
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2000);
    }
  };

  const handleDownloadBrailleFile = () => {
    const content = `คำศัพท์: ${word}\nอักษรเบรลล์: ${brailleData.brailleUnicode}\nคำอ่าน: ${brailleData.readingGuide}\nความหมาย: ${definition || "-"}\nมาตรฐาน: สมาคมคนตาบอดแห่งประเทศไทย (THAI CONTEXT Braille Layer)`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `braille-${word}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isSignVerified = signResource.status === "VERIFIED";
  const isSignExternal = signResource.status === "EXTERNAL_RESOURCE";
  const isSignUnavailable = signResource.status === "NOT_AVAILABLE";

  return (
    <div
      className={`lang-repr-card ${compact ? "compact" : ""}`}
      style={{
        borderRadius: "16px",
        border: "1px solid var(--border, #e2e8f0)",
        background: "var(--surface, #ffffff)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
        overflow: "hidden",
        margin: "12px 0",
      }}
    >
      {/* 1. Multimodal Mode Selector Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          padding: "10px 14px",
          background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
          borderBottom: "1px solid var(--border, #e2e8f0)",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px" }} aria-hidden="true">🌐</span>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink, #0f172a)" }}>
            มิติการเข้าถึงและการสื่อสาร
          </span>
        </div>

        {/* Mode Selector Pills */}
        <div
          role="tablist"
          aria-label="เลือกรูปแบบการแสดงผลภาษา"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "#ffffff",
            padding: "3px",
            borderRadius: "10px",
            border: "1px solid var(--border, #cbd5e1)",
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === "text"}
            onClick={() => handleModeChange("text")}
            style={{
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: activeMode === "text" ? 700 : 500,
              borderRadius: "7px",
              border: "none",
              background: activeMode === "text" ? "var(--accent, #2563eb)" : "transparent",
              color: activeMode === "text" ? "#ffffff" : "#475569",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            ข้อความ
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeMode === "audio"}
            onClick={() => handleModeChange("audio")}
            style={{
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: activeMode === "audio" ? 700 : 500,
              borderRadius: "7px",
              border: "none",
              background: activeMode === "audio" ? "var(--accent, #2563eb)" : "transparent",
              color: activeMode === "audio" ? "#ffffff" : "#475569",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            🔊 เสียง
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeMode === "sign"}
            onClick={() => handleModeChange("sign")}
            style={{
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: activeMode === "sign" ? 700 : 500,
              borderRadius: "7px",
              border: "none",
              background: activeMode === "sign" ? "var(--accent, #2563eb)" : "transparent",
              color: activeMode === "sign" ? "#ffffff" : "#475569",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>🤟 ภาษามือ</span>
            {isSignVerified && (
              <span
                style={{
                  fontSize: "9px",
                  padding: "1px 4px",
                  borderRadius: "999px",
                  background: activeMode === "sign" ? "#dbeafe" : "#dcfce7",
                  color: activeMode === "sign" ? "#1e40af" : "#15803d",
                  fontWeight: 700,
                }}
              >
                มีท่า
              </span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeMode === "braille"}
            onClick={() => handleModeChange("braille")}
            style={{
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: activeMode === "braille" ? 700 : 500,
              borderRadius: "7px",
              border: "none",
              background: activeMode === "braille" ? "var(--accent, #2563eb)" : "transparent",
              color: activeMode === "braille" ? "#ffffff" : "#475569",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            ⠠ เบรลล์
          </button>
        </div>
      </div>

      {/* 2. Content Body by Mode */}
      <div style={{ padding: compact ? "12px 14px" : "16px 20px" }}>
        {/* MODE A: TEXT */}
        {activeMode === "text" && (
          <div className="mode-content-text">
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--ink, #0f172a)" }}>
                  {word}
                </span>
                {english && (
                  <span style={{ fontSize: "13px", color: "var(--muted, #64748b)" }}>
                    ({english})
                  </span>
                )}
                {phonetic && (
                  <span style={{ fontSize: "12px", color: "#0284c7", background: "#f0f9ff", padding: "2px 6px", borderRadius: "4px" }}>
                    /{phonetic}/
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handlePlayAudio}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "6px",
                  border: "1px solid var(--border, #cbd5e1)",
                  background: "#f8fafc",
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                <span>🔊</span>
                <span>ฟังสัทศาสตร์</span>
              </button>
            </div>
            {definition && (
              <p style={{ margin: "10px 0 0", fontSize: "14px", lineHeight: 1.6, color: "#334155" }}>
                {definition}
              </p>
            )}
          </div>
        )}

        {/* MODE B: AUDIO */}
        {activeMode === "audio" && (
          <div className="mode-content-audio" style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={handlePlayAudio}
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  border: "none",
                  background: isPlayingAudio ? "#10b981" : "var(--accent, #2563eb)",
                  color: "#ffffff",
                  fontSize: "24px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
                  transition: "transform 0.15s ease",
                }}
                title="กดเพื่อฟังเสียงออกเสียงภาษาไทย"
                aria-label={`ฟังเสียงคำว่า ${word}`}
              >
                {isPlayingAudio ? "⏸" : "🔊"}
              </button>
              <div>
                <strong style={{ fontSize: "18px", color: "var(--ink, #0f172a)" }}>{word}</strong>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  การออกเสียงสัทอักษรไทย: <strong>/{phonetic || word}/</strong>
                </p>
                <small style={{ color: "#94a3b8", fontSize: "11px" }}>
                  รองรับเสียงสังเคราะห์ไทยตามมาตรฐาน W3C Speech API
                </small>
              </div>
            </div>
          </div>
        )}

        {/* MODE C: THAI SIGN LANGUAGE (TSL) */}
        {activeMode === "sign" && (
          <div className="mode-content-sign">
            {/* Provenance and Integrity Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "12px",
                padding: "8px 12px",
                borderRadius: "10px",
                background: isSignVerified ? "#f0fdf4" : isSignExternal ? "#eff6ff" : "#fff7ed",
                border: `1px solid ${isSignVerified ? "#bbf7d0" : isSignExternal ? "#bfdbfe" : "#fed7aa"}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "15px" }}>
                  {isSignVerified ? "✓" : isSignExternal ? "🔗" : "ℹ️"}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: isSignVerified ? "#15803d" : isSignExternal ? "#1d4ed8" : "#c2410c",
                  }}
                >
                  {isSignVerified
                    ? "✓ ผ่านการตรวจสอบความถูกต้อง (Verified TSL)"
                    : isSignExternal
                    ? "🔗 ข้อมูลจากแหล่งภายนอกที่ได้รับการรับรอง"
                    : "ไม่มีข้อมูลภาษามือไทยที่ผ่านการตรวจสอบ"}
                </span>
              </div>

              {/* Speed Controller for Motion */}
              {isSignVerified && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>ความเร็ว:</span>
                  {[0.5, 1.0, 1.5, 2.0].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSignSpeed(s)}
                      style={{
                        padding: "2px 6px",
                        fontSize: "11px",
                        borderRadius: "4px",
                        border: "1px solid var(--border, #cbd5e1)",
                        background: signSpeed === s ? "var(--accent, #2563eb)" : "#ffffff",
                        color: signSpeed === s ? "#ffffff" : "#475569",
                        cursor: "pointer",
                        fontWeight: signSpeed === s ? 700 : 500,
                      }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sub-view: Verified Motion Player */}
            {isSignVerified && signResource.representation?.type === "MOTION" && (
              <div>
                <SignMotionPlayer
                  resource={signResource}
                  initialSpeed={signSpeed}
                  autoPlay={true}
                />
                {signResource.metadata?.description_th && (
                  <div style={{ marginTop: "10px", padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", fontSize: "12px", color: "#334155" }}>
                    <strong>คำอธิบายท่ามือ:</strong> {signResource.metadata.description_th}
                  </div>
                )}
              </div>
            )}

            {/* Sub-view: External Resource */}
            {isSignExternal && (
              <div style={{ padding: "16px", textAlign: "center", background: "#f8fafc", borderRadius: "12px" }}>
                <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#334155" }}>
                  {signResource.metadata?.description_th || "ข้อมูลภาษามือมีอยู่จากสารานุกรมภาษามือไทยภายนอก"}
                </p>
                {signResource.source?.url && (
                  <a
                    href={signResource.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 14px",
                      background: "var(--accent, #2563eb)",
                      color: "#ffffff",
                      borderRadius: "8px",
                      fontSize: "12px",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    <span>เข้าชมวิดีโอจากเว็บไซต์ต้นฉบับ</span>
                    <span>↗</span>
                  </a>
                )}
              </div>
            )}

            {/* Sub-view: Unavailable (Strict Governance) */}
            {isSignUnavailable && (
              <div style={{ padding: "16px", textAlign: "center", background: "#fffbeb", borderRadius: "12px", border: "1px dashed #fde68a" }}>
                <span style={{ fontSize: "24px" }} aria-hidden="true">🛡️</span>
                <h5 style={{ margin: "6px 0 4px", fontSize: "14px", color: "#92400e" }}>
                  ยังไม่มีข้อมูลภาษามือไทยที่ผ่านการรับรองสำหรับ &ldquo;{word}&rdquo;
                </h5>
                <p style={{ margin: 0, fontSize: "12px", color: "#78350f", lineHeight: 1.5 }}>
                  THAI CONTEXT ยึดหลักความถูกต้องตามหลักภาษามือไทย จึงไม่สร้างท่าทางจำลองขึ้นเองโดยปราศจากข้อมูลอ้างอิงจากผู้เชี่ยวชาญ
                </p>
                <button
                  type="button"
                  onClick={() => setIsContribOpen(true)}
                  style={{
                    marginTop: "10px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    borderRadius: "6px",
                    border: "1px solid #d97706",
                    background: "#ffffff",
                    color: "#b45309",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  + ส่งข้อมูลแนะนำท่าภาษามือสำหรับคำนี้
                </button>
              </div>
            )}

            {/* Future Feature: Reverse Search from Sign Language */}
            <div style={{ marginTop: "12px", borderTop: "1px dashed var(--border, #e2e8f0)", paddingTop: "10px" }}>
              <button
                type="button"
                onClick={() => setShowReverseSearchInfo(!showReverseSearchInfo)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: "11px",
                  color: "var(--accent, #2563eb)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: 600,
                }}
              >
                <span>🤟 ค้นหาจากภาษามือไทย (Reverse Sign Search)</span>
                <span style={{ fontSize: "10px", padding: "1px 5px", background: "#e0e7ff", color: "#3730a3", borderRadius: "4px" }}>เร็ว ๆ นี้</span>
              </button>
              {showReverseSearchInfo && (
                <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#64748b", lineHeight: 1.5 }}>
                  ระบบกล้องคอมพิวเตอร์วิทัศน์ (Vision-based Hand Landmark) สำหรับแปลภาษามือแบบเรียลไทม์เป็นคำศัพท์ภาษาไทย อยู่ในแผนพัฒนาขั้นถัดไปเพื่อสนับสนุนการสื่อสารสองทาง
                </p>
              )}
            </div>
          </div>
        )}

        {/* MODE D: BRAILLE */}
        {activeMode === "braille" && (
          <div className="mode-content-braille">
            {/* Braille Unicode Display Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                color: "#ffffff",
                marginBottom: "12px",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Unicode Thai Braille
                </span>
                <div
                  style={{
                    fontSize: "32px",
                    letterSpacing: "4px",
                    fontFamily: "monospace",
                    margin: "4px 0",
                    color: "#38bdf8",
                  }}
                  aria-label={`อักษรเบรลล์: ${brailleData.brailleUnicode}`}
                >
                  {brailleData.brailleUnicode}
                </div>
                <span style={{ fontSize: "12px", color: "#cbd5e1" }}>
                  {brailleData.readingGuide}
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <button
                  type="button"
                  onClick={handleCopyBraille}
                  style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    border: "none",
                    background: brailleCopied ? "#10b981" : "#ffffff",
                    color: brailleCopied ? "#ffffff" : "#0f172a",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{brailleCopied ? "✓" : "📋"}</span>
                  <span>{brailleCopied ? "คัดลอกเบรลล์แล้ว" : "คัดลอกเบรลล์"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportTextAndBraille}
                  style={{
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: 500,
                    borderRadius: "6px",
                    border: "1px solid #475569",
                    background: "transparent",
                    color: "#e2e8f0",
                    cursor: "pointer",
                  }}
                >
                  {exportCopied ? "คัดลอกคู่ข้อความแล้ว ✓" : "คัดลอกคู่ข้อความ"}
                </button>
              </div>
            </div>

            {/* Braille Dot Matrix Preview for each letter */}
            <div style={{ marginTop: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted, #64748b)" }}>
                  โครงสร้างจุดนูนมาตรฐาน 6 จุด (Dot Matrix):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenFullBrailleModal) onOpenFullBrailleModal();
                    else setInternalBrailleModalOpen(true);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: "11px",
                    color: "var(--accent, #2563eb)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  เปิดแป้นพิมพ์ & ตัวถอดรหัสเบรลล์ ↗
                </button>
              </div>

              {/* Grid of Braille Cells */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {brailleData.brailleCells.map((cell, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "6px 8px",
                      borderRadius: "8px",
                      background: "#f8fafc",
                      border: "1px solid var(--border, #e2e8f0)",
                      minWidth: "44px",
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink, #0f172a)" }}>
                      {cell.char}
                    </span>
                    <span style={{ fontSize: "20px", color: "var(--accent, #2563eb)", margin: "2px 0" }}>
                      {cell.braille}
                    </span>
                    <span style={{ fontSize: "10px", color: "#64748b" }}>
                      {cell.dots.length > 0 ? cell.dots.join("-") : "เว้น"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Toolbar */}
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", borderTop: "1px dashed var(--border, #e2e8f0)", paddingTop: "10px" }}>
              <button
                type="button"
                onClick={handleDownloadBrailleFile}
                style={{
                  padding: "4px 10px",
                  fontSize: "11px",
                  borderRadius: "6px",
                  border: "1px solid var(--border, #cbd5e1)",
                  background: "#f8fafc",
                  color: "#334155",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>💾</span>
                <span>บันทึกเป็นไฟล์ TXT สำหรับเครื่องพิมพ์เบrลล์</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isContribOpen && (
        <SignContributionModal
          word={word}
          isOpen={isContribOpen}
          onClose={() => setIsContribOpen(false)}
        />
      )}

      {internalBrailleModalOpen && (
        <BrailleModal
          word={word}
          isOpen={internalBrailleModalOpen}
          onClose={() => setInternalBrailleModalOpen(false)}
          initialData={brailleData}
        />
      )}
    </div>
  );
}
