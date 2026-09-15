"use client";

import React, { useState } from "react";
import type {
  WorkspaceResponsePayload,
  WordRecommendation,
  GeneratedContentItem,
} from "@/lib/workspace-types";
import { audioManager } from "@/lib/audio-manager";
import type { Recommendation } from "@/lib/search-types";
import SignLanguageSection from "../tsl/SignLanguageSection";

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
  const activeTab = controlledTab ?? internalTab;

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
      <div className="workspace-tabs">
        <button
          type="button"
          onClick={() => handleTabSelect("all")}
          className={`workspace-tab-btn ${activeTab === "all" ? "active" : ""}`}
        >
          🌟 แสดงทั้งหมด
        </button>
        {recommendations && recommendations.length > 0 && (
          <button
            type="button"
            onClick={() => handleTabSelect("words")}
            className={`workspace-tab-btn ${activeTab === "words" ? "active" : ""}`}
          >
            📖 คำศัพท์ ({recommendations.length})
          </button>
        )}
        {comparison && (
          <button
            type="button"
            onClick={() => handleTabSelect("compare")}
            className={`workspace-tab-btn ${activeTab === "compare" ? "active" : ""}`}
          >
            ⚖️ เปรียบเทียบคำ
          </button>
        )}
        {generated_content && generated_content.length > 0 && (
          <button
            type="button"
            onClick={() => handleTabSelect("writing")}
            className={`workspace-tab-btn ${activeTab === "writing" ? "active" : ""}`}
          >
            ✍️ ข้อความที่สร้าง ({generated_content.length})
          </button>
        )}
        {language_check && (
          <button
            type="button"
            onClick={() => handleTabSelect("check")}
            className={`workspace-tab-btn ${activeTab === "check" ? "active" : ""}`}
          >
            🔍 ตรวจภาษา ({language_check.score}/100)
          </button>
        )}
        {language_bridge && (
          <button
            type="button"
            onClick={() => handleTabSelect("bridge")}
            className={`workspace-tab-btn ${activeTab === "bridge" ? "active" : ""}`}
          >
            🌐 Bridge (EN)
          </button>
        )}
        {accessibility_layer && (
          <button
            type="button"
            onClick={() => handleTabSelect("access")}
            className={`workspace-tab-btn ${activeTab === "access" ? "active" : ""}`}
          >
            ♿ การเข้าถึง ({accessibility_layer.readiness_score}%)
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
                            fontSize: "14px",
                            padding: "2px",
                          }}
                          title="ฟังเสียงอ่าน"
                          aria-label={`ฟังเสียงอ่านคำว่า ${rec.word}`}
                        >
                          🔊
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
                        นำไปใส่กล่องร่าง ➔
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
                        นำไปใส่กล่องร่าง ➔
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
                🔊 ฟังเสียง
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

      {/* Accessibility Layer Section */}
      {(activeTab === "all" || activeTab === "access") && accessibility_layer && (
        <section aria-labelledby="access-heading" className="workspace-card" style={{ marginBottom: 0 }}>
          <div className="workspace-card-header">
            <h3 id="access-heading" className="workspace-card-title">
              <span>♿</span> ความพร้อมด้านการเข้าถึง (Accessibility Layer)
            </h3>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 700,
                background: accessibility_layer.readiness_score >= 80 ? "#f0fdf4" : "#fffbeb",
                color: accessibility_layer.readiness_score >= 80 ? "#166534" : "#b45309",
                border: `1px solid ${accessibility_layer.readiness_score >= 80 ? "#bbf7d0" : "#fde68a"}`,
              }}
            >
              Readiness: {accessibility_layer.readiness_score}% ({accessibility_layer.readiness_rating})
            </span>
          </div>

          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              background: "#fffbeb",
              border: "1px solid #fef3c7",
              marginBottom: "16px",
              fontSize: "12px",
              color: "#92400e",
              lineHeight: 1.5,
            }}
          >
            🛡️ <strong>ข้อควรทราบทางกฎหมายและมาตรฐาน:</strong> {accessibility_layer.disclaimer}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {/* 1. Thai Sign Language Terms Detected */}
            <div style={{ padding: "16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "18px" }}>🤟</span>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--ink)" }}>
                  ภาษามือไทยที่ตรวจพบ ({accessibility_layer.detected_sign_terms.length} คำ)
                </h4>
              </div>

              {accessibility_layer.detected_sign_terms.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {accessibility_layer.detected_sign_terms.map((term, idx) => (
                    <div key={idx} style={{ padding: "10px", background: "#ffffff", borderRadius: "10px", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                        <strong className="font-thai-reading" style={{ fontSize: "15px" }}>{term.word}</strong>
                        <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "999px", background: "#dcfce7", color: "#15803d", fontWeight: 700 }}>
                          ✓ ผ่านการรับรอง
                        </span>
                      </div>
                      <SignLanguageSection word={term.word} compact />
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>
                  ยังไม่พบคำศัพท์หลักในสารบบภาษามือไทยสำหรับข้อความนี้ สามารถใช้การสะกดนิ้วมือทดแทนได้
                </p>
              )}
            </div>

            {/* 2. Braille Unicode Output & Export */}
            <div style={{ padding: "16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "18px" }}>⠠</span>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--ink)" }}>
                    แปลงเป็นอักษรเบรลล์ไทย (Unicode Braille)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(accessibility_layer.braille_unicode)}
                  style={{
                    padding: "3px 8px",
                    fontSize: "11px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    background: "#ffffff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  📋 คัดลอกเบรลล์
                </button>
              </div>

              <div
                style={{
                  padding: "12px 14px",
                  background: "#ffffff",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  fontSize: "24px",
                  fontFamily: "monospace",
                  letterSpacing: "3px",
                  wordBreak: "break-all",
                  marginBottom: "8px",
                }}
              >
                {accessibility_layer.braille_unicode}
              </div>
              <div style={{ color: "var(--muted)", fontSize: "11px", marginBottom: "8px" }}>
                {Array.isArray(accessibility_layer.braille_guide) ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {accessibility_layer.braille_guide.map((item: any, idx: number) => (
                      <span
                        key={idx}
                        style={{
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "#ffffff",
                          border: "1px solid #cbd5e1",
                          fontFamily: "monospace",
                          fontSize: "11px",
                        }}
                      >
                        {item.char}: <strong style={{ fontSize: "13px" }}>{item.braille_cell}</strong> ({item.braille_dots})
                      </span>
                    ))}
                  </div>
                ) : (
                  <span>{String(accessibility_layer.braille_guide || "")}</span>
                )}
              </div>

              {/* Checklist */}
              {accessibility_layer.checklist && accessibility_layer.checklist.length > 0 && (
                <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {accessibility_layer.checklist.map((item: any, idx: number) => {
                    const isPassed = item.status === "PASS" || item.passed === true;
                    const title = item.title || item.item || "เกณฑ์การตรวจทาน";
                    const detail = item.detail || item.note || "";
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "6px", fontSize: "12px", color: "#334155" }}>
                        <span style={{ color: isPassed ? "#16a34a" : "#d97706" }}>
                          {isPassed ? "✓" : "⚠️"}
                        </span>
                        <span><strong>{title}:</strong> {detail}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
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
    </div>
  );
}
