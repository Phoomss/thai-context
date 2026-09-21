"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { ModernTerm } from "@/lib/modern-vocabulary-types";
import { audioManager } from "@/lib/audio-manager";
import ModernTermBadge from "./ModernTermBadge";

interface ModernTermCardProps {
  term: ModernTerm;
  onViewDetail: (term: ModernTerm) => void;
  onCompareWithFormal?: (modernTerm: string, formalCandidate?: string) => void;
  foreignerMode?: boolean;
}

const DEFINITION_TYPE_BADGES: Record<
  string,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  SOURCE_DEFINED: { label: "นิยามจากแหล่งอ้างอิง", icon: "🌐", color: "#0369a1", bg: "#e0f2fe", border: "#bae6fd" },
  EDITOR_REVIEWED: { label: "บรรณาธิการตรวจรับรอง", icon: "✓", color: "#15803d", bg: "#dcfce7", border: "#bbf7d0" },
  AI_GENERATED: { label: "AI สังเคราะห์ความหมาย", icon: "🤖", color: "#6d28d9", bg: "#ede9fe", border: "#ddd6fe" },
  COMMUNITY_DEFINED: { label: "ชุมชนผู้ใช้ระบุ", icon: "👥", color: "#c2410c", bg: "#ffedd5", border: "#fed7aa" },
};

const CATEGORY_MAP: Record<
  string,
  { label: string; icon: string; bg: string; text: string; border: string }
> = {
  AI: { label: "AI", icon: "🤖", bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  TECHNOLOGY: { label: "เทคโนโลยี", icon: "💻", bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  SOCIAL_MEDIA: { label: "โซเชียล", icon: "📱", bg: "#fdf2f8", text: "#be185d", border: "#fbcfe8" },
  INTERNET: { label: "อินเทอร์เน็ต", icon: "🌐", bg: "#e0f2fe", text: "#0369a1", border: "#bae6fd" },
  SLANG: { label: "สแลง", icon: "🔥", bg: "#fff7ed", text: "#c2410c", border: "#ffedd5" },
  WORKPLACE: { label: "ออฟฟิศ", icon: "💼", bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe" },
  POP_CULTURE: { label: "บันเทิง & ป็อป", icon: "🎬", bg: "#fef3c7", text: "#b45309", border: "#fde68a" },
  FANDOM: { label: "แฟนดอม", icon: "🌟", bg: "#fdf4ff", text: "#a21caf", border: "#f5d0fe" },
  LIFESTYLE: { label: "ไลฟ์สไตล์", icon: "✨", bg: "#f1f5f9", text: "#334155", border: "#e2e8f0" },
  BUSINESS: { label: "ธุรกิจ", icon: "💼", bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" },
  YOUTH: { label: "วัยรุ่น", icon: "⚡", bg: "#fffbeb", text: "#d97706", border: "#fef3c7" },
  EDUCATION: { label: "การศึกษา", icon: "📚", bg: "#f0f9ff", text: "#0284c7", border: "#e0f2fe" },
};

function renderHighlightedText(text: string, termToHighlight: string) {
  if (!text || !termToHighlight) return text;
  const escaped = termToHighlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, index) =>
    part.toLowerCase() === termToHighlight.toLowerCase() ? (
      <mark key={index} className="modern-card-highlight-mark">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function ModernTermCard({
  term,
  onViewDetail,
  onCompareWithFormal,
  foreignerMode = false,
}: ModernTermCardProps) {
  const [copiedTerm, setCopiedTerm] = useState(false);
  const [copiedSentence, setCopiedSentence] = useState(false);

  // Audio Pronunciation Hook
  const audioStatus = useSyncExternalStore(
    audioManager.subscribe,
    audioManager.snapshot,
    () => "idle",
  );
  const headword = term.term.trim();
  const isAudioActive = audioManager.active() === headword;
  const isAudioLoading = isAudioActive && audioStatus === "loading";
  const isAudioPlaying = isAudioActive && audioStatus === "playing";

  useEffect(() => {
    return () => {
      audioManager.stop(headword);
    };
  }, [headword]);

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    void audioManager.toggle({
      headword: term.term,
      definition: term.description,
      pronunciation: {
        phonetic: term.pronunciation || undefined,
        locale: "th-TH",
      },
    } as any);
  };

  const handleCopyTerm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(term.term);
      setCopiedTerm(true);
      setTimeout(() => setCopiedTerm(false), 2000);
    }
  };

  const handleCopySentence = (e: React.MouseEvent, sentence: string) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(sentence);
      setCopiedSentence(true);
      setTimeout(() => setCopiedSentence(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onViewDetail(term);
    }
  };

  const primaryDef = term.definitions?.[0];
  const defTypeMeta = primaryDef
    ? DEFINITION_TYPE_BADGES[primaryDef.definition_type]
    : null;

  const formalRelation = term.relationships?.find(
    (r) => r.relationship_type === "FORMAL_EQUIVALENT"
  );

  const primaryExample = term.examples?.[0];

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`คำศัพท์ ${term.term}: ${term.description}`}
      onClick={() => onViewDetail(term)}
      onKeyDown={handleKeyDown}
      className="modern-term-card group"
    >
      {/* Top Meta Bar: Badges & Quick Action Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
          <ModernTermBadge
            status={term.status}
            register={term.register}
            isOfficial={false}
            compact={true}
          />
        </div>

        {/* Quick Actions (Audio pronunciation + Copy) */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Audio Pronunciation Button */}
          <button
            type="button"
            onClick={handlePlayAudio}
            disabled={isAudioLoading}
            className={`modern-card-action-btn ${isAudioPlaying ? "is-active" : ""}`}
            aria-label={`ฟังเสียงการออกเสียงคำว่า ${term.term}`}
            title={isAudioPlaying ? "หยุดชั่วคราว" : "ฟังการออกเสียง"}
          >
            <span>{isAudioLoading ? "⏳" : isAudioPlaying ? "⏸️" : "🔊"}</span>
            <span>{isAudioLoading ? "กำลังโหลด" : isAudioPlaying ? "กำลังเล่น" : "ออกเสียง"}</span>
          </button>

          {/* Copy Term Button */}
          <button
            type="button"
            onClick={handleCopyTerm}
            className={`modern-card-action-btn ${copiedTerm ? "is-copied" : ""}`}
            aria-label={`คัดลอกคำว่า ${term.term}`}
            title="คัดลอกคำศัพท์"
          >
            <span>{copiedTerm ? "✓" : "📋"}</span>
            <span>{copiedTerm ? "คัดลอกแล้ว" : "คัดลอก"}</span>
          </button>
        </div>
      </div>

      {/* Headword & Linguistic Details */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <h3 className="headword-title">{term.term}</h3>

          {term.pronunciation && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 8px",
                borderRadius: "6px",
                backgroundColor: "#f1f5f9",
                color: "#475569",
                fontSize: "12px",
                fontWeight: 600,
                border: "1px solid #e2e8f0",
              }}
              title="สัทอักษร / คำอ่านออกเสียง"
            >
              /{term.pronunciation}/
            </span>
          )}

          {term.transliteration && (
            <span
              style={{
                fontSize: "12px",
                color: "#64748b",
                fontStyle: "italic",
                fontWeight: 500,
              }}
              title="คำทับศัพท์ / โรมันสคริปต์"
            >
              ({term.transliteration})
            </span>
          )}
        </div>

        {/* Categories Pills */}
        {term.categories && term.categories.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "8px",
            }}
          >
            {term.categories.map((cat, idx) => {
              const meta = CATEGORY_MAP[cat.toUpperCase()] || {
                label: cat,
                icon: "#",
                bg: "#f1f5f9",
                text: "#475569",
                border: "#e2e8f0",
              };
              return (
                <span
                  key={`${cat}-${idx}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    backgroundColor: meta.bg,
                    color: meta.text,
                    border: `1px solid ${meta.border}`,
                  }}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Foreigner Support / English Meaning */}
      {(foreignerMode || term.english_meaning) && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "12px",
            fontSize: "12.5px",
            color: "#166534",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontWeight: 700,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <span>🇬🇧</span>
              <span>English Meaning:</span>
            </span>
            {term.pronunciation && (
              <span style={{ fontSize: "11.5px", color: "#15803d", fontWeight: 500 }}>
                Pronounced: /{term.pronunciation}/
              </span>
            )}
          </div>
          <div style={{ lineHeight: 1.5, color: "#14532d" }}>
            {term.english_meaning || term.description}
          </div>
        </div>
      )}

      {/* Primary Definition & Source Tag */}
      <div style={{ fontSize: "14px", color: "#334155", lineHeight: 1.65 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "6px",
          }}
        >
          {defTypeMeta && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "10.5px",
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: "6px",
                backgroundColor: defTypeMeta.bg,
                color: defTypeMeta.color,
                border: `1px solid ${defTypeMeta.border}`,
              }}
            >
              <span>{defTypeMeta.icon}</span>
              <span>{defTypeMeta.label}</span>
            </span>
          )}
        </div>
        <p
          className="font-thai-reading"
          style={{ margin: 0, fontSize: "14px", color: "#1e293b" }}
        >
          {primaryDef?.definition || term.description}
        </p>

        {/* Usage Warning Tip */}
        {term.usage_warning && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              marginTop: "10px",
              padding: "8px 12px",
              borderRadius: "10px",
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
              fontSize: "12px",
              color: "#92400e",
              lineHeight: 1.5,
            }}
          >
            <span style={{ fontSize: "14px", flexShrink: 0 }}>💡</span>
            <div>
              <strong style={{ fontWeight: 700 }}>ข้อควรระวังการใช้:</strong> {term.usage_warning}
            </div>
          </div>
        )}
      </div>

      {/* Real-world Contextual Example */}
      {primaryExample && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            borderLeft: "4px solid #3b82f6",
            borderTop: "1px solid #f1f5f9",
            borderRight: "1px solid #f1f5f9",
            borderBottom: "1px solid #f1f5f9",
            fontSize: "13px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#2563eb",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>💬</span>
              <span>ตัวอย่างการใช้งานจริง:</span>
            </span>
            <button
              type="button"
              onClick={(e) => handleCopySentence(e, primaryExample.example_text)}
              className={`modern-card-action-btn ${copiedSentence ? "is-copied" : ""}`}
              style={{ padding: "2px 7px", minHeight: "22px", fontSize: "10.5px" }}
              aria-label="คัดลอกตัวอย่างประโยค"
              title="คัดลอกประโยคตัวอย่าง"
            >
              <span>{copiedSentence ? "✓" : "📋"}</span>
              <span>{copiedSentence ? "คัดลอกแล้ว" : "คัดลอกประโยค"}</span>
            </button>
          </div>
          <p
            className="font-thai-reading"
            style={{ margin: 0, color: "#334155", lineHeight: 1.6, fontSize: "13px" }}
          >
            &ldquo;{renderHighlightedText(primaryExample.example_text, term.term)}&rdquo;
          </p>
          {primaryExample.context_note && (
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              📌 {primaryExample.context_note}
            </div>
          )}
        </div>
      )}

      {/* Formal Equivalent Comparison Banner */}
      {formalRelation && (
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            if (onCompareWithFormal) {
              onCompareWithFormal(
                term.term,
                formalRelation.target_headword || formalRelation.target_id
              );
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              if (onCompareWithFormal) {
                onCompareWithFormal(
                  term.term,
                  formalRelation.target_headword || formalRelation.target_id
                );
              }
            }
          }}
          className="formal-compare-banner"
          title={`เปรียบเทียบความหมายกับคำทางการ: ${
            formalRelation.target_headword || formalRelation.target_id
          }`}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#475569",
            }}
          >
            <span>🏛️</span>
            <span>
              คำทางการเทียบเคียง:{" "}
              <strong style={{ color: "#0f172a", fontWeight: 700 }}>
                {formalRelation.target_headword || formalRelation.target_id}
              </strong>
            </span>
          </div>
          <span className="compare-cta">
            <span>เปรียบเทียบ</span>
            <span>➔</span>
          </span>
        </div>
      )}

      {/* Card Footer: Provenance & View Detail Link */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "12px",
          borderTop: "1px solid #f1f5f9",
          marginTop: "auto",
          fontSize: "11.5px",
          color: "#64748b",
        }}
      >
        {/* Source & Confidence */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {term.sources && term.sources.length > 0 ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 8px",
                borderRadius: "6px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#475569",
                fontWeight: 500,
              }}
              title={`แหล่งข้อมูล: ${term.sources[0].source_name}`}
            >
              <span>🌐</span>
              <span>{term.sources[0].source_name.split("/")[0].trim()}</span>
              {term.sources[0].verification_status === "VERIFIED" && (
                <span style={{ color: "#059669", fontWeight: 700 }}>✓</span>
              )}
            </span>
          ) : (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 8px",
                borderRadius: "6px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#64748b",
              }}
            >
              <span>🌐</span>
              <span>คลังคำร่วมสมัย</span>
            </span>
          )}

          {typeof term.confidence === "number" && term.confidence > 0 && (
            <span
              style={{
                fontSize: "11px",
                color: "#64748b",
                fontWeight: 500,
              }}
              title="ระดับความเชื่อมั่นของข้อมูล"
            >
              ⭐ {Math.round(term.confidence * 100)}%
            </span>
          )}
        </div>

        {/* View Details CTA Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail(term);
          }}
          className="view-detail-link"
          aria-label={`ดูหลักฐานและที่มาของคำว่า ${term.term}`}
        >
          <span>ดูหลักฐาน & ที่มา</span>
          <span className="arrow-icon">➔</span>
        </button>
      </div>
    </article>
  );
}
