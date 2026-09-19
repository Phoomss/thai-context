"use client";

import React, { useState } from "react";
import { ModernTerm } from "@/lib/modern-vocabulary-types";
import ModernTermBadge from "./ModernTermBadge";

interface ModernTermCardProps {
  term: ModernTerm;
  onViewDetail: (term: ModernTerm) => void;
  onCompareWithFormal?: (modernTerm: string, formalCandidate?: string) => void;
  foreignerMode?: boolean;
}

const DEFINITION_TYPE_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  SOURCE_DEFINED: { label: "นิยามจากแหล่งอ้างอิง", color: "#0369a1", bg: "#e0f2fe" },
  EDITOR_REVIEWED: { label: "บรรณาธิการตรวจสอบ", color: "#15803d", bg: "#dcfce7" },
  AI_GENERATED: { label: "AI สังเคราะห์ความหมาย", color: "#6d28d9", bg: "#ede9fe" },
  COMMUNITY_DEFINED: { label: "นิยามจากชุมชนผู้ใช้", color: "#c2410c", bg: "#ffedd5" },
};

export default function ModernTermCard({
  term,
  onViewDetail,
  onCompareWithFormal,
  foreignerMode = false,
}: ModernTermCardProps) {
  const [copied, setCopied] = useState(false);

  const primaryDef = term.definitions?.[0];
  const defTypeMeta = primaryDef
    ? DEFINITION_TYPE_BADGES[primaryDef.definition_type]
    : null;

  const formalRelation = term.relationships?.find(
    (r) => r.relationship_type === "FORMAL_EQUIVALENT"
  );

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(term.term);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const primaryExample = term.examples?.[0];

  return (
    <article
      className="modern-term-card group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md"
      style={{
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "14px",
      }}
    >
      {/* Top row: Badges and Copy */}
      <div className="flex flex-wrap items-start justify-between gap-2" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <ModernTermBadge
          status={term.status}
          register={term.register}
          isOfficial={false}
          sourcesCount={term.sources?.length}
          confidence={term.confidence}
        />
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`คัดลอกคำว่า ${term.term}`}
          className="copy-btn inline-flex items-center text-xs text-slate-500 hover:text-slate-800"
          style={{
            fontSize: "11px",
            padding: "2px 8px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            backgroundColor: copied ? "#ecfdf5" : "#f8fafc",
            color: copied ? "#059669" : "#64748b",
            cursor: "pointer",
          }}
        >
          {copied ? "คัดลอกแล้ว ✓" : "📋 คัดลอก"}
        </button>
      </div>

      {/* Headword & Pronunciation */}
      <div>
        <div className="flex items-baseline gap-2.5 flex-wrap" style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
          <h3
            className="text-xl font-bold tracking-tight text-slate-900 m-0"
            style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#0f172a" }}
          >
            {term.term}
          </h3>
          {term.pronunciation && (
            <span
              className="text-xs text-slate-500 font-medium"
              style={{ fontSize: "12px", color: "#64748b" }}
            >
              /{term.pronunciation}/
            </span>
          )}
          {term.transliteration && (
            <span
              className="text-xs text-slate-500 italic"
              style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}
            >
              ({term.transliteration})
            </span>
          )}
        </div>

        {/* Categories tags */}
        {term.categories && term.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2" style={{ display: "flex", gap: "4px", marginTop: "8px", flexWrap: "wrap" }}>
            {term.categories.map((cat, i) => (
              <span
                key={`${cat}-${i}`}
                style={{
                  fontSize: "10.5px",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  fontWeight: 500,
                }}
              >
                #{cat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Foreigner Mode: English meaning and Pronunciation */}
      {(foreignerMode || term.english_meaning) && (
        <div
          className="foreigner-support-box"
          style={{
            padding: "8px 12px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#166534",
          }}
        >
          <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <span>🇬🇧 English & Pronunciation:</span>
          </div>
          <div style={{ marginTop: "2px" }}>
            <strong>Meaning:</strong> {term.english_meaning || "Not specified"}
          </div>
          {term.pronunciation && (
            <div style={{ marginTop: "2px" }}>
              <strong>Pronounced:</strong> {term.pronunciation}
            </div>
          )}
        </div>
      )}

      {/* Primary Definition */}
      <div style={{ fontSize: "13.5px", color: "#334155", lineHeight: 1.6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          {defTypeMeta && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                padding: "1px 5px",
                borderRadius: "4px",
                backgroundColor: defTypeMeta.bg,
                color: defTypeMeta.color,
              }}
            >
              {defTypeMeta.label}
            </span>
          )}
        </div>
        <p style={{ margin: 0 }}>
          {primaryDef?.definition || term.description}
        </p>
      </div>

      {/* Example sentence */}
      {primaryExample && (
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            borderLeft: "3px solid #3b82f6",
            fontSize: "12.5px",
            color: "#475569",
          }}
        >
          <div style={{ fontSize: "10.5px", fontWeight: 600, color: "#64748b", marginBottom: "2px" }}>
            💬 ตัวอย่างการใช้งาน:
          </div>
          <div style={{ fontStyle: "italic" }}>
            &ldquo;{primaryExample.example_text}&rdquo;
          </div>
        </div>
      )}

      {/* Formal Equivalent Teaser */}
      {formalRelation && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "11.5px",
            backgroundColor: "#f8fafc",
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
          }}
        >
          <span style={{ color: "#64748b" }}>
            คำทางการที่เทียบเคียง: <strong style={{ color: "#0f172a" }}>{formalRelation.target_headword || formalRelation.target_id}</strong>
          </span>
          {onCompareWithFormal && (
            <button
              type="button"
              onClick={() => onCompareWithFormal(term.term, formalRelation.target_headword || formalRelation.target_id)}
              style={{
                fontSize: "11px",
                color: "#2563eb",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              เปรียบเทียบ ➔
            </button>
          )}
        </div>
      )}

      {/* Bottom Action Row */}
      <div
        className="flex items-center justify-between pt-2 border-t border-slate-100"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #f1f5f9",
          paddingTop: "10px",
          marginTop: "4px",
        }}
      >
        <button
          type="button"
          onClick={() => onViewDetail(term)}
          style={{
            fontSize: "12px",
            color: "#1d4ed8",
            fontWeight: 600,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
          }}
        >
          🔍 ดูหลักฐาน & ที่มา ↗
        </button>

        {term.sources && term.sources.length > 0 && (
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
            {term.sources[0].source_name.split("/")[0].trim()}
          </span>
        )}
      </div>
    </article>
  );
}
