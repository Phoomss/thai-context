"use client";

import { useState } from "react";
import type { Recommendation, SearchResponse } from "@/lib/search-types";
import SearchResultFeedback from "../feedback/SearchResultFeedback";

export default function WordResultCard({
  word,
  index,
  revision,
  mode,
  loading,
  selected,
  query = "",
  onEvidence,
  onCompare,
}: {
  word: Recommendation;
  index: number;
  revision: number;
  mode?: SearchResponse["mode"];
  loading: boolean;
  selected: boolean;
  query?: string;
  onEvidence: (word: Recommendation) => void;
  onCompare: (word: Recommendation) => void;
}) {
  const [copiedWord, setCopiedWord] = useState(false);
  const [copiedSentence, setCopiedSentence] = useState(false);

  const handleCopyWord = (headword: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(headword);
      }
      setCopiedWord(true);
      setTimeout(() => setCopiedWord(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopySentence = (sentence: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(sentence);
      }
      setCopiedSentence(true);
      setTimeout(() => setCopiedSentence(false), 2000);
    } catch {
      // Fallback
    }
  };

  const exampleSentence =
    word.comparison?.example ||
    word.examples?.[0] ||
    `การดำเนินงานในครั้งนี้มุ่งเน้นการเสริมสร้าง${word.headword}เพื่อให้บรรลุเป้าหมายได้อย่างคุ้มค่า`;

  return (
    <article
      data-reveal
      className={`result-card ${selected ? "is-comparing" : ""}`}
      key={`${revision}-${word.id ?? word.headword}-${index}`}
    >
      <div className="card-meta">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>
          {word.score === undefined
            ? "คำใกล้เคียง"
            : `${Math.round(word.score * 100)}% ตรงกับความหมาย`}
        </span>
      </div>
      <h3>
        <span className="card-headword">{word.headword}</span>{" "}
        {word.pos && <small>[{word.pos}]</small>}
        {(word.english || word.translations?.[0]?.translatedWord) && (
          <span
            className="card-english-trans"
            aria-label={`คำแปลภาษาอังกฤษ: ${
              word.english || word.translations?.[0]?.translatedWord
            }`}
          >
            ({word.english || word.translations?.[0]?.translatedWord})
          </span>
        )}
        <button
          type="button"
          className="quick-copy-word-btn"
          aria-label={`คัดลอกคำว่า ${word.headword}`}
          onClick={() => handleCopyWord(word.headword)}
          style={{
            marginLeft: "8px",
            fontSize: "11px",
            padding: "2px 8px",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            background: copiedWord ? "#ecfdf5" : "#f8fafc",
            color: copiedWord ? "#047857" : "var(--muted)",
            cursor: "pointer",
            fontWeight: 500,
            verticalAlign: "middle",
          }}
        >
          {copiedWord ? "คัดลอกแล้ว ✓" : "📋 คัดลอก"}
        </button>
      </h3>
      <p className="definition">{word.definition}</p>
      {word.ai_explanation && (
        <div className="explanation">
          <span>{mode === "live" ? "คำอธิบายประกอบ" : "เหตุผลตัวอย่าง"}</span>
          <p>{word.ai_explanation}</p>
        </div>
      )}

      {/* In-Sentence Word Swap Box */}
      <div
        className="sentence-swap-box"
        style={{
          margin: "12px 0",
          padding: "10px 14px",
          background: "#f8fafc",
          borderRadius: "10px",
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--muted)",
            }}
          >
            💡 ตัวอย่างการใช้จริงในประโยค:
          </span>
          <button
            type="button"
            className="sentence-copy-btn"
            onClick={() => handleCopySentence(exampleSentence)}
            style={{
              fontSize: "10px",
              padding: "2px 8px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: copiedSentence ? "#ecfdf5" : "white",
              color: copiedSentence ? "#047857" : "var(--ink)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {copiedSentence ? "คัดลอกประโยคแล้ว ✓" : "📋 คัดลอกประโยค"}
          </button>
        </div>
        <p
          className="font-thai-reading"
          style={{
            margin: 0,
            fontSize: "13px",
            lineHeight: 1.6,
            color: "#334155",
          }}
        >
          &ldquo;{exampleSentence}&rdquo;
        </p>
      </div>

      <div className="word-tags">
        {[...(word.registers ?? []), ...(word.contexts ?? [])].map((tag, i) => (
          <span key={`${tag}-${i}`}>{tag}</span>
        ))}
      </div>
      <div className="result-actions">
        <button
          disabled={loading}
          className="compare-button"
          aria-pressed={selected}
          onClick={() => onCompare(word)}
        >
          {selected ? "เลือกเทียบแล้ว" : "เลือกเปรียบเทียบ"}
        </button>
        <button
          disabled={loading}
          className="evidence-button"
          onClick={() => onEvidence(word)}
        >
          {word.evidence ? "ตรวจสอบหลักฐาน" : "สถานะหลักฐานอ้างอิง"}{" "}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      <SearchResultFeedback query={query} word={word.headword} compact />
    </article>
  );
}
