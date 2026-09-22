"use client";

import React, { useState } from "react";
import type {
  WorkspaceResponsePayload,
  WordRecommendation,
  GeneratedContentItem,
} from "@/lib/workspace-types";
import { audioManager } from "@/lib/audio-manager";
import type { Recommendation } from "@/lib/search-types";
import {
  Layers,
  BookOpen,
  Scale,
  PenTool,
  CheckCircle2,
  Globe,
  Accessibility,
  Volume2,
  Copy,
  Check,
} from "lucide-react";
import SignLanguageSection from "../tsl/SignLanguageSection";
import BrailleModal from "../braille/BrailleModal";
import SignLanguageModal from "../tsl/SignLanguageModal";

export type WorkspaceResultTab = "all" | "words" | "compare" | "writing" | "check" | "bridge" | "access";

interface WorkspaceResultCardProps {
  result: WorkspaceResponsePayload;
  onSelectAction?: (prompt: string) => void;
  activeDraftText?: string;
  onUpdateDraft?: (text: string) => void;
  activeTab?: WorkspaceResultTab;
  onTabChange?: (tab: WorkspaceResultTab) => void;
}

export default function WorkspaceResultCard({
  result,
  onSelectAction,
  activeDraftText,
  onUpdateDraft,
  activeTab: controlledTab,
  onTabChange,
}: WorkspaceResultCardProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedGeneral, setCopiedGeneral] = useState(false);
  const [selectedWordSet, setSelectedWordSet] = useState<Set<string>>(new Set());
  const [internalTab, setInternalTab] = useState<WorkspaceResultTab>("all");
  const [accessView, setAccessView] = useState<"both" | "sign" | "braille">("both");
  const [selectedSignIdx, setSelectedSignIdx] = useState<number>(0);
  const [brailleCopied, setBrailleCopied] = useState(false);
  const [brailleGuideCopied, setBrailleGuideCopied] = useState(false);
  const [activeSignModalWord, setActiveSignModalWord] = useState<string | null>(null);
  const [isBrailleModalOpen, setIsBrailleModalOpen] = useState(false);
  const activeTab = controlledTab ?? internalTab;

  const handleCopyBrailleUnicode = (text: string) => {
    navigator.clipboard?.writeText(text);
    setBrailleCopied(true);
    setTimeout(() => setBrailleCopied(false), 2000);
  };

  const handleCopyBrailleWithGuide = (unicode: string, guide: string | any[]) => {
    const guideText = Array.isArray(guide)
      ? guide.map((g: any) => `${g.char || ""}: ${g.braille_cell || ""} (จุด ${g.braille_dots || ""})`).join(", ")
      : String(guide || "");
    const full = `[อักษรเบรลล์ไทย]: ${unicode}\n[แจกแจงอักขระ]: ${guideText}`;
    navigator.clipboard?.writeText(full);
    setBrailleGuideCopied(true);
    setTimeout(() => setBrailleGuideCopied(false), 2000);
  };

  const handleDownloadBrailleTxt = (unicode: string, guide: string | any[]) => {
    const guideText = Array.isArray(guide)
      ? guide.map((g: any) => `${g.char || ""}: ${g.braille_cell || ""} (จุด ${g.braille_dots || ""})`).join("\n")
      : String(guide || "");
    const content = `=== THAI CONTEXT: Thai Braille Unicode Export ===\n\n[อักษรเบรลล์ (Unicode)]:\n${unicode}\n\n[การแจกแจงทีละอักขระ]:\n${guideText}\n\nมาตรฐาน: สมาคมคนตาบอดแห่งประเทศไทย (มอก. 2565 / W3C WCAG 2.1)`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thai-braille-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTabSelect = (tab: WorkspaceResultTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  const {
    context,
    recommendations,
    comparison,
    generated_content,
    language_check,
    language_bridge,
    accessibility_layer,
    co_thinking,
    evidence,
    confidence_level,
    confidence,
    abstained,
    abstention_reason,
  } = result;

  const handleCopy = (text: string, idx?: number) => {
    navigator.clipboard?.writeText(text);
    if (idx !== undefined) {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } else {
      setCopiedGeneral(true);
      setTimeout(() => setCopiedGeneral(false), 2000);
    }
  };

  const handleSpeak = (word: string) => {
    audioManager.toggle({
      headword: word,
      pronunciation: { phonetic: word, locale: "th-TH" },
      pos: "น.",
      definition: "",
    } as unknown as Recommendation);
  };

  const toggleWordSelection = (word: string) => {
    const next = new Set(selectedWordSet);
    if (next.has(word)) next.delete(word);
    else next.add(word);
    setSelectedWordSet(next);
  };

  const selectedArray = Array.from(selectedWordSet);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Meta Bar */}
      <div
        className="workspace-card"
        style={{
          padding: "16px 22px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: 0,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
          {/* Context Tag */}
          <span className="workspace-badge-tag" style={{ fontSize: "12px" }}>
            🎯 บริบท: {context.type} ({context.tone})
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 500,
              background: "var(--bg-subtle)",
              color: "var(--muted)",
              border: "1px solid var(--border)",
            }}
          >
            กลุ่มเป้าหมาย: {context.audience}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: "6px",
              fontSize: "10px",
              fontFamily: "monospace",
              textTransform: "uppercase",
              fontWeight: 700,
              background: context.source === "USER_PROVIDED" ? "#f3e8ff" : "#e0e7ff",
              color: context.source === "USER_PROVIDED" ? "#7e22ce" : "#4338ca",
              border: "1px solid var(--border)",
            }}
          >
            {context.source}
          </span>
        </div>

        {/* Confidence Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>ระดับความถูกต้อง:</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 700,
              background:
                confidence_level === "HIGH"
                  ? "#f0fdf4"
                  : confidence_level === "MEDIUM"
                  ? "#fffbeb"
                  : "#fff1f2",
              color:
                confidence_level === "HIGH"
                  ? "#166534"
                  : confidence_level === "MEDIUM"
                  ? "#b45309"
                  : "#be123c",
              border: `1px solid ${
                confidence_level === "HIGH"
                  ? "#bbf7d0"
                  : confidence_level === "MEDIUM"
                  ? "#fde68a"
                  : "#fecdd3"
              }`,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background:
                  confidence_level === "HIGH"
                    ? "#22c55e"
                    : confidence_level === "MEDIUM"
                    ? "#f59e0b"
                    : "#ef4444",
              }}
            />
            {confidence_level} ({Math.round(confidence * 100)}%)
          </span>
        </div>
      </div>

      {/* Abstention Warning if Hallucination Guard Triggered */}
      {abstained && (
        <div
          role="alert"
          className="workspace-card"
          style={{
            background: "#fff1f2",
            borderColor: "#fecdd3",
            color: "#9f1239",
            marginBottom: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>
            <span>🛡️</span> ระงับการสรุปผลเนื่องจากหลักฐานไม่เพียงพอ
          </div>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6 }}>{abstention_reason}</p>
        </div>
      )}

      {/* AI Co-Thinking Partner Card (สมองช่วยคิดและต่อยอด อิงจากฐานข้อมูล) */}
      {co_thinking && !abstained && (
        <div
          className="workspace-card"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f4f8fe 100%)",
            borderColor: "#bfdbfe",
            padding: "24px 28px",
            marginBottom: 0,
            boxShadow: "0 8px 30px rgba(47, 120, 207, 0.08)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>🧠</span>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                  AI Co-Thinking Partner (สมองช่วยคิดและต่อยอด)
                </h3>
                <span style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 600 }}>
                  วิเคราะห์เชื่อมโยงและกลั่นกรองจากฐานข้อมูลพจนานุกรมทางการ
                </span>
              </div>
            </div>
            <span
              className="workspace-badge-tag"
              style={{ background: "#e0f2fe", color: "#0369a1", borderColor: "#7dd3fc" }}
            >
              ✦ Strategic Angle
            </span>
          </div>

          {/* Strategic Recommendation */}
          <div
            style={{
              padding: "16px 18px",
              borderRadius: "14px",
              background: "white",
              border: "1px solid #dbeafe",
              fontSize: "14px",
              lineHeight: 1.75,
              color: "var(--ink)",
              marginBottom: "12px",
            }}
          >
            {co_thinking.strategic_recommendation}
          </div>

          {/* Nuance & Risk Warning Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px", marginBottom: "16px" }}>
            {co_thinking.nuance_breakdown && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1px solid var(--border)",
                  fontSize: "12px",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: "var(--ink)" }}>🔍 วิเคราะห์ความต่าง:</strong> {co_thinking.nuance_breakdown}
              </div>
            )}
            {co_thinking.risk_warning && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  fontSize: "12px",
                  color: "#92400e",
                  lineHeight: 1.6,
                }}
              >
                {co_thinking.risk_warning}
              </div>
            )}
          </div>

          {/* Next-Step Building Blocks */}
          {co_thinking.next_step_ideas && co_thinking.next_step_ideas.length > 0 && (
            <div style={{ paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink)", marginBottom: "8px" }}>
                🚀 สั่งให้ AI ต่อยอดเป็นผลงานรูปแบบอื่นได้ทันที (Next-Step Actions):
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {co_thinking.next_step_ideas.map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectAction?.(idea.replace(/^[^\s]+\s/, ""))}
                    className="workspace-draft-btn"
                    style={{
                      fontSize: "12px",
                      padding: "6px 14px",
                      background: "white",
                      borderColor: "#cbd5e1",
                      color: "var(--ink)",
                      fontWeight: 500,
                    }}
                  >
                    {idea} ➔
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section Filter Tabs */}
      <div className="workspace-tabs" role="tablist" aria-label="แถบตัวกรองผลลัพธ์">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "all"}
          onClick={() => handleTabSelect("all")}
          className={`workspace-tab-btn ${activeTab === "all" ? "active" : ""}`}
        >
          <Layers className="w-4 h-4" />
          <span>แสดงทั้งหมด</span>
        </button>
        {recommendations && recommendations.length > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "words"}
            onClick={() => handleTabSelect("words")}
            className={`workspace-tab-btn ${activeTab === "words" ? "active" : ""}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>คำศัพท์ ({recommendations.length})</span>
          </button>
        )}
        {comparison && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "compare"}
            onClick={() => handleTabSelect("compare")}
            className={`workspace-tab-btn ${activeTab === "compare" ? "active" : ""}`}
          >
            <Scale className="w-4 h-4" />
            <span>เปรียบเทียบคำ</span>
          </button>
        )}
        {generated_content && generated_content.length > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "writing"}
            onClick={() => handleTabSelect("writing")}
            className={`workspace-tab-btn ${activeTab === "writing" ? "active" : ""}`}
          >
            <PenTool className="w-4 h-4" />
            <span>ข้อความที่สร้าง ({generated_content.length})</span>
          </button>
        )}
        {language_check && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "check"}
            onClick={() => handleTabSelect("check")}
            className={`workspace-tab-btn ${activeTab === "check" ? "active" : ""}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ตรวจภาษา ({language_check.score}/100)</span>
          </button>
        )}
        {language_bridge && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "bridge"}
            onClick={() => handleTabSelect("bridge")}
            className={`workspace-tab-btn ${activeTab === "bridge" ? "active" : ""}`}
          >
            <Globe className="w-4 h-4" />
            <span>Bridge (EN)</span>
          </button>
        )}
        {accessibility_layer && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "access"}
            onClick={() => handleTabSelect("access")}
            className={`workspace-tab-btn ${activeTab === "access" ? "active" : ""}`}
          >
            <Accessibility className="w-4 h-4" />
            <span>การเข้าถึง ({accessibility_layer.readiness_score}%)</span>
          </button>
        )}
      </div>

      {/* Word Recommendations Section */}
      {(activeTab === "all" || activeTab === "words") && recommendations && recommendations.length > 0 && (
        <section aria-labelledby="recommendations-heading" className="workspace-card" style={{ marginBottom: 0 }}>
          <div className="workspace-card-header">
            <h3 id="recommendations-heading" className="workspace-card-title">
              <span>📖</span> คำศัพท์ที่คัดสรรจากพจนานุกรมทางการ
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
              พบ {recommendations.length} คำ
            </span>
          </div>

          <div className="workspace-word-grid">
            {recommendations.map((rec, i) => {
              const isSelected = selectedWordSet.has(rec.word);
              return (
                <div
                  key={i}
                  className="workspace-word-card"
                  style={{
                    borderColor: isSelected ? "var(--accent)" : "var(--border)",
                    boxShadow: isSelected ? "0 0 0 2px rgba(47, 120, 207, 0.2)" : undefined,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => toggleWordSelection(rec.word)}
                          style={{
                            background: "transparent",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                          title="คลิกเพื่อเลือกคำนี้"
                        >
                          <span style={{ color: isSelected ? "var(--accent)" : "var(--text-muted)", fontSize: "14px" }}>
                            {isSelected ? "☑" : "☐"}
                          </span>
                          <span className="workspace-word-headword font-thai-reading">
                            {rec.word}
                          </span>
                        </button>
                        {rec.pos && (
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "var(--bg-subtle)",
                              color: "var(--muted)",
                              fontWeight: 600,
                            }}
                          >
                            {rec.pos}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSpeak(rec.word)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            display: "inline-flex",
                            alignItems: "center",
                            color: "var(--muted)",
                          }}
                          title="ฟังเสียงอ่าน"
                          aria-label={`ฟังเสียงอ่านคำว่า ${rec.word}`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      {rec.edition && (
                        <span
                          className="workspace-badge-tag"
                          style={{ fontSize: "11px", padding: "2px 8px" }}
                        >
                          พ.ศ. {rec.edition}
                        </span>
                      )}
                    </div>

                    <p className="workspace-word-def font-thai-reading">
                      {rec.definition}
                    </p>

                    {rec.reason && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--muted)",
                          background: "var(--bg-subtle)",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1px solid var(--border)",
                          marginBottom: "12px",
                        }}
                      >
                        <strong style={{ color: "var(--accent)" }}>เหตุผลที่แนะนำ:</strong>{" "}
                        {rec.reason}
                      </div>
                    )}
                  </div>

                  {/* Word Action Buttons */}
                  <div className="workspace-word-actions">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectAction?.(`แต่งประโยคคำว่า ${rec.word} สำหรับรายงานวิชาการ`)
                      }
                      className="workspace-draft-btn"
                      style={{ fontSize: "12px", padding: "6px 12px" }}
                    >
                      ✍️ แต่งประโยค
                    </button>
                    {onUpdateDraft && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextText = activeDraftText ? `${activeDraftText} ${rec.word}` : rec.word;
                          onUpdateDraft(nextText);
                        }}
                        className="workspace-draft-btn"
                        style={{ fontSize: "11px", padding: "6px 10px", color: "var(--accent)" }}
                      >
                        นำไปใส่หน้าต่างตอบกลับ ➔
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Comparison Bar for Multi-selection */}
          {selectedArray.length >= 2 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderRadius: "14px",
                background: "#eef6fd",
                border: "1px solid #bfdbfe",
                marginTop: "16px",
                fontSize: "13px",
              }}
            >
              <span style={{ color: "var(--ink)", fontWeight: 500 }}>
                เลือกไว้ {selectedArray.length} คำ: <strong>{selectedArray.join(", ")}</strong>
              </span>
              <button
                type="button"
                onClick={() =>
                  onSelectAction?.(
                    `${selectedArray[0]} หรือ ${selectedArray[1]} ต่างกันอย่างไร`
                  )
                }
                className="workspace-submit-btn"
                style={{ width: "auto", minHeight: "36px", padding: "6px 16px", fontSize: "12px" }}
              >
                ⚖️ เปรียบเทียบ 2 คำนี้ทันที
              </button>
            </div>
          )}
        </section>
      )}

      {/* Comparison Matrix Card */}
      {(activeTab === "all" || activeTab === "compare") && comparison && (
        <section aria-labelledby="comparison-heading" className="workspace-card" style={{ marginBottom: 0 }}>
          <div className="workspace-card-header">
            <h3 id="comparison-heading" className="workspace-card-title">
              <span>⚖️</span> เปรียบเทียบความหมาย: {comparison.wordA} vs {comparison.wordB}
            </h3>
            <span className="workspace-badge-tag">
              Nuance Delta
            </span>
          </div>

          <p
            style={{
              fontSize: "14px",
              color: "var(--ink)",
              lineHeight: 1.7,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              padding: "14px 18px",
              borderRadius: "14px",
              margin: "0 0 16px",
            }}
          >
            {comparison.difference_summary}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "16px" }}>
            {[comparison.wordA, comparison.wordB].map((wordKey) => {
              const detail = comparison.details?.[wordKey];
              if (!detail) return null;
              return (
                <div
                  key={wordKey}
                  style={{
                    padding: "18px",
                    borderRadius: "16px",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <h4 className="font-thai-reading" style={{ fontSize: "20px", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                      {wordKey}
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        onSelectAction?.(`แต่งประโยคคำว่า ${wordKey} สำหรับรายงานวิชาการ`)
                      }
                      className="workspace-draft-btn"
                      style={{ fontSize: "11px", padding: "4px 10px" }}
                    >
                      ✍️ แต่งประโยค
                    </button>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--muted)" }}>
                    <li>
                      <strong style={{ color: "var(--ink)" }}>จุดเน้น:</strong>{" "}
                      {detail.emphasis}
                    </li>
                    <li>
                      <strong style={{ color: "var(--ink)" }}>ใช้เมื่อ:</strong>{" "}
                      {detail.use_when}
                    </li>
                    <li style={{ fontStyle: "italic" }}>
                      <strong style={{ fontStyle: "normal", color: "var(--ink)" }}>ตัวอย่าง:</strong>{" "}
                      &ldquo;{detail.example}&rdquo;
                    </li>
                    {detail.common_confusion && (
                      <li style={{ color: "#b45309", background: "#fffbeb", padding: "6px 10px", borderRadius: "8px", border: "1px solid #fde68a" }}>
                        <strong>ข้อควรระวัง:</strong> {detail.common_confusion}
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>

          {comparison.guidance && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "14px 18px",
                borderRadius: "14px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                fontSize: "13px",
                color: "#166534",
                lineHeight: 1.6,
              }}
            >
              <span style={{ fontSize: "18px" }}>💡</span>
              <div>
                <strong>คำแนะนำในการเลือกใช้:</strong> {comparison.guidance}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Generated Content Box */}
      {(activeTab === "all" || activeTab === "writing") && generated_content && generated_content.length > 0 && (
        <section aria-labelledby="generated-heading" className="workspace-card" style={{ marginBottom: 0 }}>
          <div className="workspace-card-header">
            <h3 id="generated-heading" className="workspace-card-title">
              <span>✍️</span> ข้อความที่สร้างและปรับแต่งตามบริบท
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {generated_content.length} รูปแบบ
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {generated_content.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: "18px",
                  borderRadius: "16px",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "10px" }}>
                  <span className="workspace-badge-tag" style={{ textTransform: "uppercase" }}>
                    {item.register} ({item.type})
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.content, idx)}
                      className="workspace-draft-btn"
                      style={{ fontSize: "12px" }}
                    >
                      {copiedIdx === idx ? "✓ คัดลอกแล้ว" : "📋 คัดลอกข้อความ"}
                    </button>
                    {onUpdateDraft && (
                      <button
                        type="button"
                        onClick={() => onUpdateDraft(item.content)}
                        className="workspace-draft-btn"
                        style={{ fontSize: "12px", color: "var(--accent)" }}
                      >
                        นำไปใส่หน้าต่างตอบกลับ ➔
                      </button>
                    )}
                  </div>
                </div>

                <div
                  className="font-thai-reading"
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    background: "white",
                    border: "1px solid var(--border)",
                    fontSize: "15px",
                    lineHeight: 1.8,
                    color: "var(--ink)",
                    marginBottom: "8px",
                  }}
                >
                  &ldquo;{item.content}&rdquo;
                </div>

                {item.notes && (
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", margin: "4px 0 0" }}>
                    ℹ️ {item.notes}
                  </p>
                )}

                {/* Instant Transformation Action Bar */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginRight: "4px" }}>ปรับแต่งต่อ:</span>
                  <button
                    type="button"
                    onClick={() => onSelectAction?.("ทำให้สั้นลง")}
                    className="workspace-draft-btn"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                  >
                    ✂️ ทำให้สั้นลง
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectAction?.("ปรับให้เป็นทางการยิ่งขึ้น")}
                    className="workspace-draft-btn"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                  >
                    🎩 ทำให้เป็นทางการ
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectAction?.("ปรับให้เข้าใจง่ายสำหรับคนทั่วไป")}
                    className="workspace-draft-btn"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                  >
                    💡 สรุปเข้าใจง่าย
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectAction?.("ช่วยตรวจภาษาข้อความนี้")}
                    className="workspace-draft-btn"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                  >
                    🔍 ตรวจสอบไวยากรณ์
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Language Check Results */}
      {(activeTab === "all" || activeTab === "check") && language_check && (
        <section aria-labelledby="check-heading" className="workspace-card" style={{ marginBottom: 0 }}>
          <div className="workspace-card-header">
            <h3 id="check-heading" className="workspace-card-title">
              <span>🔍</span> ผลการตรวจทานภาษาและความสละสลวย
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontFamily: "monospace", padding: "4px 10px", borderRadius: "999px", background: "var(--bg-subtle)", border: "1px solid var(--border)", fontWeight: 700 }}>
                คะแนน: {language_check.score}/100
              </span>
              <span
                style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontWeight: 700,
                  background: language_check.status === "OPTIMAL" ? "#f0fdf4" : "#fffbeb",
                  color: language_check.status === "OPTIMAL" ? "#166534" : "#b45309",
                  border: `1px solid ${language_check.status === "OPTIMAL" ? "#bbf7d0" : "#fde68a"}`,
                }}
              >
                {language_check.status}
              </span>
            </div>
          </div>

          <p style={{ fontSize: "14px", color: "var(--ink)", lineHeight: 1.6, margin: "0 0 14px" }}>
            {language_check.summary}
          </p>

          {language_check.issues && language_check.issues.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {language_check.issues.map((issue, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 700, color: "#be123c", textDecoration: "line-through" }}>
                      {issue.text}
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>➔</span>
                    <span style={{ fontWeight: 700, color: "#15803d" }}>
                      {issue.suggestion}
                    </span>
                    <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "white", border: "1px solid var(--border)", fontFamily: "monospace", color: "var(--muted)" }}>
                      {issue.rule_type}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: "12px" }}>
                    {issue.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "12px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                fontSize: "13px",
              }}
            >
              ✓ ไม่พบคำซ้ำซ้อนหรือข้อผิดพลาดทางไวยากรณ์ ข้อความมีความกระชับและถูกต้องตามแบบแผนทางการ
            </div>
          )}
        </section>
      )}

      {/* Thai-English Cultural Bridge */}
      {(activeTab === "all" || activeTab === "bridge") && language_bridge && (
        <section aria-labelledby="bridge-heading" className="workspace-card" style={{ marginBottom: 0 }}>
          <div className="workspace-card-header">
            <h3 id="bridge-heading" className="workspace-card-title">
              <span>🌐</span> Thai-English Cultural & Language Bridge
            </h3>
            <span className="workspace-badge-tag">
              Cross-Cultural Context
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "10px", padding: "14px", borderRadius: "12px", background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
              <span className="font-thai-reading" style={{ fontSize: "24px", fontWeight: 800, color: "var(--ink)" }}>
                {language_bridge.word}
              </span>
              <span style={{ fontSize: "13px", fontFamily: "monospace", color: "var(--text-muted)" }}>
                [{language_bridge.pronunciation}]
              </span>
              <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "6px", background: "white", border: "1px solid var(--border)", fontFamily: "monospace", color: "var(--muted)" }}>
                RTGS: {language_bridge.transliteration}
              </span>
              <button
                type="button"
                onClick={() => handleSpeak(language_bridge.word)}
                className="workspace-draft-btn"
                style={{ fontSize: "11px", padding: "4px 8px" }}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>ฟังเสียง</span>
              </button>
            </div>

            <div style={{ padding: "16px", borderRadius: "14px", background: "var(--bg-subtle)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--ink)" }}>
              <div>
                <strong style={{ color: "var(--accent)" }}>English Translation:</strong>{" "}
                {language_bridge.english_translation}
              </div>
              <div>
                <strong style={{ color: "var(--accent)" }}>Nuance & Concept:</strong>{" "}
                {language_bridge.english_explanation}
              </div>
              <div>
                <strong style={{ color: "var(--accent)" }}>Cultural Etiquette Context:</strong>{" "}
                {language_bridge.cultural_context}
              </div>
              <div style={{ paddingTop: "8px", borderTop: "1px solid var(--border)", fontStyle: "italic", color: "var(--muted)" }}>
                <strong style={{ fontStyle: "normal", color: "var(--accent)" }}>Example:</strong>{" "}
                {language_bridge.example}
              </div>

              {/* Thai Sign Language Accessibility Layer */}
              <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
                <SignLanguageSection word={language_bridge.word} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ♿ Accessibility Layer — User-Friendly Card */}
      {(activeTab === "all" || activeTab === "access") && accessibility_layer && (
        <section aria-labelledby="access-heading" className="workspace-card" style={{ marginBottom: 0 }}>

          {/* ── Header row ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "12px",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", flexShrink: 0,
              }}>♿</div>
              <div>
                <h3 id="access-heading" style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--ink)" }}>
                  ความพร้อมการเข้าถึง
                </h3>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>Accessibility Layer · WCAG 2.1</p>
              </div>
            </div>

            {/* Score Gauge */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "26px", fontWeight: 800, lineHeight: 1,
                  color: accessibility_layer.readiness_score >= 80 ? "#16a34a" : "#d97706",
                }}>
                  {accessibility_layer.readiness_score}%
                </div>
                <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Readiness
                </div>
              </div>
              <div style={{ width: 6, height: 48, borderRadius: "99px", background: "#e2e8f0", overflow: "hidden", flexShrink: 0 }}>
                <div style={{
                  width: "100%",
                  height: `${accessibility_layer.readiness_score}%`,
                  borderRadius: "99px",
                  background: accessibility_layer.readiness_score >= 80
                    ? "linear-gradient(to top, #16a34a, #4ade80)"
                    : "linear-gradient(to top, #d97706, #fbbf24)",
                  transition: "height 0.6s ease",
                }} />
              </div>
              <span style={{
                padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700,
                background: accessibility_layer.readiness_score >= 80 ? "#dcfce7" : "#fef3c7",
                color: accessibility_layer.readiness_score >= 80 ? "#15803d" : "#b45309",
              }}>
                {accessibility_layer.readiness_rating === "HIGH" ? "🟢 สูง" :
                 accessibility_layer.readiness_rating === "MODERATE" ? "🟡 ปานกลาง" : "🔴 ต้องปรับปรุง"}
              </span>
            </div>
          </div>

          {/* ── Disclaimer — collapsible info bar ── */}
          <details style={{ marginBottom: "20px" }}>
            <summary style={{
              cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", gap: "6px",
              fontSize: "12px", color: "#92400e", fontWeight: 600,
              padding: "8px 12px", borderRadius: "8px",
              background: "#fffbeb", border: "1px solid #fde68a",
              userSelect: "none",
            }}>
              <span>ℹ️</span> ข้อควรทราบด้านมาตรฐาน (คลิกเพื่อดู)
            </summary>
            <div style={{
              padding: "10px 14px", marginTop: "6px", borderRadius: "8px",
              background: "#fffbeb", border: "1px solid #fde68a",
              fontSize: "12px", color: "#92400e", lineHeight: 1.6,
            }}>
              🛡️ {accessibility_layer.disclaimer}
            </div>
          </details>

          {/* ── Sub-view Toggle: Separate Sign Language & Braille ── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "20px",
            padding: "10px 14px",
            borderRadius: "14px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink)" }}>
                📑 มุมมองการเข้าถึง:
              </span>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                เลือกดูแยกส่วนอย่างชัดเจนหรือดูรวม
              </span>
            </div>
            <div role="tablist" aria-label="เลือกการแสดงผลการเข้าถึง" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                type="button"
                role="tab"
                aria-selected={accessView === "both"}
                onClick={() => setAccessView("both")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: accessView === "both" ? 700 : 500,
                  border: "1px solid",
                  borderColor: accessView === "both" ? "#4f46e5" : "#cbd5e1",
                  background: accessView === "both" ? "#4f46e5" : "#ffffff",
                  color: accessView === "both" ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>⚡ แสดงทั้ง 2 ส่วน</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={accessView === "sign"}
                onClick={() => setAccessView("sign")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: accessView === "sign" ? 700 : 500,
                  border: "1px solid",
                  borderColor: accessView === "sign" ? "#6366f1" : "#cbd5e1",
                  background: accessView === "sign" ? "#6366f1" : "#ffffff",
                  color: accessView === "sign" ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>🤟 ภาษามือไทย (TSL)</span>
                {accessibility_layer.detected_sign_terms.length > 0 && (
                  <span style={{
                    padding: "1px 6px",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: 700,
                    background: accessView === "sign" ? "#e0e7ff" : "#ede9fe",
                    color: accessView === "sign" ? "#3730a3" : "#4f46e5",
                  }}>
                    {accessibility_layer.detected_sign_terms.length} คำ
                  </span>
                )}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={accessView === "braille"}
                onClick={() => setAccessView("braille")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: accessView === "braille" ? 700 : 500,
                  border: "1px solid",
                  borderColor: accessView === "braille" ? "#0891b2" : "#cbd5e1",
                  background: accessView === "braille" ? "#0891b2" : "#ffffff",
                  color: accessView === "braille" ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>⠿ อักษรเบรลล์ไทย (Thai Braille)</span>
              </button>
            </div>
          </div>

          {/* ── Separated Sections Container ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* ── SECTION 1: THAI SIGN LANGUAGE ── */}
            {(accessView === "both" || accessView === "sign") && (
              <div style={{
                borderRadius: "18px",
                overflow: "hidden",
                border: "1.5px solid #c7d2fe",
                background: "#fafafe",
                boxShadow: "0 4px 16px rgba(99, 102, 241, 0.05)",
                display: "flex",
                flexDirection: "column",
              }}>
                {/* Header */}
                <div style={{
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                  background: "linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)",
                  borderBottom: "1px solid #c7d2fe",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "24px" }} aria-hidden="true">🤟</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "15px", color: "#312e81" }}>
                        ภาษามือไทย (Thai Sign Language · TSL)
                      </div>
                      <div style={{ fontSize: "11px", color: "#6366f1" }}>
                        เพื่อผู้มีความบกพร่องทางการได้ยินและล่ามภาษามือ (Hearing Accessibility · WCAG 2.1)
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: accessibility_layer.detected_sign_terms.length > 0 ? "#dcfce7" : "#fef3c7",
                      color: accessibility_layer.detected_sign_terms.length > 0 ? "#15803d" : "#b45309",
                      border: `1px solid ${accessibility_layer.detected_sign_terms.length > 0 ? "#bbf7d0" : "#fde68a"}`,
                    }}>
                      {accessibility_layer.detected_sign_terms.length > 0
                        ? `✓ พบในสารบบ ${accessibility_layer.detected_sign_terms.length} คำ`
                        : "🤲 แนะนำสะกดนิ้วมือ (Finger Spelling)"}
                    </span>

                    {accessibility_layer.detected_sign_terms.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const activeTerm = accessibility_layer.detected_sign_terms[selectedSignIdx] || accessibility_layer.detected_sign_terms[0];
                          if (activeTerm) setActiveSignModalWord(activeTerm.word);
                        }}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: "#ffffff",
                          border: "1px solid #c7d2fe",
                          color: "#4338ca",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>🔍 ขยายดูท่าแบบ 3D</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: "18px 20px" }}>
                  {accessibility_layer.detected_sign_terms.length > 0 ? (
                    <div>
                      {/* Word Selector Chips if multiple */}
                      {accessibility_layer.detected_sign_terms.length > 1 && (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                          marginBottom: "16px",
                          padding: "8px 12px",
                          background: "#ffffff",
                          borderRadius: "10px",
                          border: "1px solid #e0e7ff",
                        }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>
                            เลือกดูท่าคำ:
                          </span>
                          {accessibility_layer.detected_sign_terms.map((term, tIdx) => {
                            const isSelected = selectedSignIdx === tIdx;
                            return (
                              <button
                                key={tIdx}
                                type="button"
                                onClick={() => setSelectedSignIdx(tIdx)}
                                style={{
                                  padding: "4px 12px",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  fontWeight: isSelected ? 700 : 500,
                                  border: `1.5px solid ${isSelected ? "#6366f1" : "#cbd5e1"}`,
                                  background: isSelected ? "#ede9fe" : "#ffffff",
                                  color: isSelected ? "#3730a3" : "#475569",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {term.word}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Display cards for detected terms */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {accessibility_layer.detected_sign_terms.map((term, idx) => {
                          const isFocused = selectedSignIdx === idx;
                          return (
                            <div
                              key={idx}
                              style={{
                                padding: "16px 18px",
                                background: "#ffffff",
                                borderRadius: "14px",
                                border: `1.5px solid ${isFocused ? "#818cf8" : "#e0e7ff"}`,
                                boxShadow: isFocused ? "0 4px 12px rgba(99, 102, 241, 0.08)" : "none",
                                transition: "border-color 0.2s ease",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <span style={{
                                    width: 32, height: 32, borderRadius: "10px",
                                    background: "#ede9fe", display: "flex", alignItems: "center",
                                    justifyContent: "center", fontSize: "16px", flexShrink: 0,
                                  }}>🖐️</span>
                                  <strong className="font-thai-reading" style={{ fontSize: "18px", color: "#1e1b4b" }}>
                                    {term.word}
                                  </strong>
                                  <span style={{
                                    fontSize: "10px", padding: "3px 8px",
                                    borderRadius: "999px", background: "#dcfce7", color: "#15803d", fontWeight: 700,
                                  }}>✓ รับรองแล้ว</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setActiveSignModalWord(term.word)}
                                  style={{
                                    fontSize: "11px",
                                    color: "#4f46e5",
                                    background: "#f5f3ff",
                                    border: "1px solid #ddd6fe",
                                    padding: "4px 10px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                  }}
                                >
                                  ดูท่าขนาดใหญ่ ↗
                                </button>
                              </div>

                              <SignLanguageSection word={term.word} compact={accessView === "both"} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      textAlign: "center",
                      padding: "32px 20px",
                      background: "#ffffff",
                      borderRadius: "14px",
                      border: "1px solid #e0e7ff",
                      color: "var(--muted)",
                    }}>
                      <div style={{ fontSize: "36px", marginBottom: "10px" }}>🤲</div>
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b", marginBottom: "6px" }}>
                        ยังไม่พบคำที่มีท่าภาษามือมาตรฐานเฉพาะคำในข้อความนี้
                      </div>
                      <div style={{ fontSize: "13px", lineHeight: 1.6, maxWidth: "560px", margin: "0 auto", color: "#64748b" }}>
                        ในกรณีคำศัพท์เฉพาะหรือคำที่ยังไม่มีท่ามาตรฐาน สามารถใช้ <strong>การสะกดนิ้วมือภาษาไทย (Thai Finger Spelling)</strong> ทีละตัวอักษร หรือใช้คำที่มีความหมายใกล้เคียงเพื่อสื่อสารความหมายได้อย่างครบถ้วนตามหลักสากล
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── SECTION 2: THAI BRAILLE ── */}
            {(accessView === "both" || accessView === "braille") && (
              <div style={{
                borderRadius: "18px",
                overflow: "hidden",
                border: "1.5px solid #a5f3fc",
                background: "#f0fdfa",
                boxShadow: "0 4px 16px rgba(14, 116, 144, 0.05)",
                display: "flex",
                flexDirection: "column",
              }}>
                {/* Header */}
                <div style={{
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                  background: "linear-gradient(135deg, #cffafe 0%, #e0f2fe 100%)",
                  borderBottom: "1px solid #a5f3fc",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "24px" }} aria-hidden="true">⠿</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "15px", color: "#0e7490" }}>
                        อักษรเบรลล์ไทย (Thai Braille · Unicode)
                      </div>
                      <div style={{ fontSize: "11px", color: "#06b6d4" }}>
                        เพื่อผู้มีความบกพร่องทางการมองเห็นและจอแสดงผลเบรลล์ (Visual Accessibility · มอก. 2565)
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: "#e0f2fe",
                      color: "#0369a1",
                      border: "1px solid #bae6fd",
                    }}>
                      มาตรฐาน 6-Dot Unicode
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsBrailleModalOpen(true)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "#ffffff",
                        border: "1px solid #a5f3fc",
                        color: "#0e7490",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>⌨️ ห้องทดลองพิมพ์เบรลล์</span>
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Big Braille display banner */}
                  <div style={{
                    padding: "24px 20px",
                    background: "#ffffff",
                    borderRadius: "14px",
                    border: "2px solid #a5f3fc",
                    textAlign: "center",
                    fontSize: "36px",
                    fontFamily: "monospace",
                    letterSpacing: "6px",
                    wordBreak: "break-all",
                    lineHeight: 1.4,
                    color: "#0e7490",
                    minHeight: "84px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "inset 0 2px 8px rgba(14, 116, 144, 0.04)",
                  }}>
                    {accessibility_layer.braille_unicode || "⠀"}
                  </div>

                  {/* Actions Toolbar */}
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => handleCopyBrailleUnicode(accessibility_layer.braille_unicode)}
                      style={{
                        flex: 1,
                        minWidth: "180px",
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "none",
                        background: brailleCopied ? "#16a34a" : "linear-gradient(135deg, #06b6d4, #0e7490)",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "background 0.2s ease",
                      }}
                    >
                      <span>{brailleCopied ? "✓" : "📋"}</span>
                      <span>{brailleCopied ? "คัดลอกรหัสเบรลล์แล้ว!" : "คัดลอกรหัสเบรลล์ (Unicode)"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyBrailleWithGuide(accessibility_layer.braille_unicode, accessibility_layer.braille_guide)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        background: brailleGuideCopied ? "#f0fdf4" : "#ffffff",
                        color: brailleGuideCopied ? "#15803d" : "#334155",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>{brailleGuideCopied ? "✓" : "📄"}</span>
                      <span>{brailleGuideCopied ? "คัดลอกพร้อมคำอ่านแล้ว" : "คัดลอกพร้อมแจกแจง"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadBrailleTxt(accessibility_layer.braille_unicode, accessibility_layer.braille_guide)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#334155",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>💾</span>
                      <span>ดาวน์โหลด (.txt)</span>
                    </button>
                  </div>

                  {/* Character-by-character guide */}
                  {Array.isArray(accessibility_layer.braille_guide) && accessibility_layer.braille_guide.length > 0 && (
                    <div style={{
                      background: "#ffffff",
                      borderRadius: "14px",
                      border: "1px solid #cffafe",
                      padding: "14px 16px",
                    }}>
                      <div style={{
                        fontSize: "12px",
                        color: "#0e7490",
                        fontWeight: 700,
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}>
                        <span>🔍 คำอธิบายทีละอักขระและตำแหน่งจุด (Character & Dot Breakdown)</span>
                        <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 500 }}>
                          {accessibility_layer.braille_guide.length} เซลล์
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))", gap: "8px" }}>
                        {(accessibility_layer.braille_guide as any[]).map((item: any, idx: number) => (
                          <div key={idx} style={{
                            padding: "8px 6px",
                            borderRadius: "10px",
                            background: "#f8ffff",
                            border: "1px solid #a5f3fc",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "3px",
                            textAlign: "center",
                          }}>
                            <span style={{ fontSize: "24px", color: "#0e7490", fontFamily: "monospace", lineHeight: 1 }}>
                              {item.braille_cell}
                            </span>
                            <span style={{ color: "#1e293b", fontWeight: 700, fontSize: "14px" }}>
                              {item.char}
                            </span>
                            <span style={{
                              color: "#0369a1",
                              background: "#e0f2fe",
                              padding: "1px 5px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontFamily: "monospace",
                              fontWeight: 600,
                            }}>
                              จุด {item.braille_dots}
                            </span>
                            {item.description && (
                              <span style={{ color: "#64748b", fontSize: "9px", marginTop: "2px", lineHeight: 1.2 }}>
                                {item.description}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!Array.isArray(accessibility_layer.braille_guide) && accessibility_layer.braille_guide && (
                    <div style={{
                      padding: "12px 14px",
                      background: "#ffffff",
                      borderRadius: "10px",
                      border: "1px solid #cffafe",
                      fontSize: "13px",
                      color: "#334155",
                      lineHeight: 1.6,
                    }}>
                      {String(accessibility_layer.braille_guide)}
                    </div>
                  )}

                  {/* Standard reading note */}
                  <div style={{
                    fontSize: "11px",
                    color: "#0e7490",
                    background: "#ecfeff",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cffafe",
                    lineHeight: 1.5,
                  }}>
                    💡 <strong>หลักเกณฑ์อักษรเบรลล์ไทย (มอก. 2565):</strong> ออกแบบให้เรียงลำดับตามตัวอักษรที่ปรากฏ เพื่อให้สามารถใช้งานร่วมกับ Refreshable Braille Display และเครื่องพิมพ์เบรลล์ได้อย่างถูกต้องตามมาตรฐานสมาคมคนตาบอดแห่งประเทศไทย
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Checklist strip ── */}
          {accessibility_layer.checklist && accessibility_layer.checklist.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                ✅ รายการตรวจสอบความพร้อม ({accessibility_layer.checklist.filter((i: any) => i.status === "PASS" || i.passed === true).length}/{accessibility_layer.checklist.length} ผ่าน)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "8px" }}>
                {accessibility_layer.checklist.map((item: any, idx: number) => {
                  const isPassed = item.status === "PASS" || item.passed === true;
                  const isWarn = item.status === "WARN";
                  const title = item.title || item.item || "เกณฑ์การตรวจทาน";
                  const detail = item.detail || item.note || "";
                  return (
                    <div key={idx} style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: `1px solid ${isPassed ? "#bbf7d0" : isWarn ? "#fde68a" : "#e2e8f0"}`,
                      background: isPassed ? "#f0fdf4" : isWarn ? "#fffbeb" : "#f8fafc",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: "6px", flexShrink: 0,
                        background: isPassed ? "#dcfce7" : isWarn ? "#fef3c7" : "#f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: 800,
                        color: isPassed ? "#16a34a" : isWarn ? "#d97706" : "#94a3b8",
                      }}>
                        {isPassed ? "✓" : isWarn ? "!" : "–"}
                      </span>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>{title}</div>
                        {detail && <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px", lineHeight: 1.4 }}>{detail}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </section>
      )}

      {/* Official Evidence Citations */}
      {evidence && evidence.length > 0 && (
        <section aria-labelledby="evidence-heading" className="workspace-card" style={{ marginBottom: 0 }}>
          <div className="workspace-card-header">
            <h4 id="evidence-heading" className="workspace-card-title" style={{ fontSize: "15px" }}>
              <span>📜</span> หลักฐานอ้างอิงพจนานุกรมทางการ ({evidence.length} แหล่งข้อมูล)
            </h4>
            <span style={{ fontSize: "12px", color: "var(--green)", fontWeight: 600 }}>
              ✓ ตรวจสอบความถูกต้องแล้ว
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {evidence.map((ev, idx) => (
              <div
                key={idx}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>
                    {ev.source_book} {ev.edition && `(${ev.edition})`}
                  </span>
                  {ev.page_number && (
                    <span style={{ fontFamily: "monospace", fontSize: "11px" }}>
                      หน้า {ev.page_number}
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontStyle: "italic", color: "var(--muted)", lineHeight: 1.6 }}>
                  &ldquo;{ev.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Interactive Braille Lab Modal */}
      {isBrailleModalOpen && (
        <BrailleModal
          word={(result.context as any)?.target_word || recommendations?.[0]?.word || "ข้อความ"}
          isOpen={isBrailleModalOpen}
          onClose={() => setIsBrailleModalOpen(false)}
        />
      )}

      {/* Interactive 3D Motion Sign Language Modal */}
      {activeSignModalWord && (
        <SignLanguageModal
          word={activeSignModalWord}
          isOpen={Boolean(activeSignModalWord)}
          onClose={() => setActiveSignModalWord(null)}
        />
      )}
    </div>
  );
}
