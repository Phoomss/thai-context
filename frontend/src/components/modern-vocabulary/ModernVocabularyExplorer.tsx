"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ModernTerm } from "@/lib/modern-vocabulary-types";
import ModernTermCard from "./ModernTermCard";
import ModernTermDetailModal from "./ModernTermDetailModal";
import ModernTermSubmissionModal from "./ModernTermSubmissionModal";

interface ModernVocabularyExplorerProps {
  initialTerms?: ModernTerm[];
  onCompareWithFormal?: (modernTerm: string, formalCandidate?: string) => void;
}

const CATEGORIES = [
  { id: "ALL", label: "ทั้งหมด" },
  { id: "AI", label: "🤖 ปัญญาประดิษฐ์ (AI)" },
  { id: "TECHNOLOGY", label: "💻 เทคโนโลยี" },
  { id: "SOCIAL_MEDIA", label: "📱 โซเชียลมีเดีย" },
  { id: "SLANG", label: "🔥 สแลงร่วมสมัย" },
  { id: "WORKPLACE", label: "💼 ภาษาออฟฟิศ" },
  { id: "POP_CULTURE", label: "🎬 บันเทิง & ป็อปคัลเจอร์" },
  { id: "FANDOM", label: "🌟 แฟนดอม" },
];

export default function ModernVocabularyExplorer({
  initialTerms = [],
  onCompareWithFormal,
}: ModernVocabularyExplorerProps) {
  const [terms, setTerms] = useState<ModernTerm[]>(initialTerms);
  const [loading, setLoading] = useState(initialTerms.length === 0);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedRegister, setSelectedRegister] = useState("ALL");
  const [foreignerMode, setForeignerMode] = useState(false);
  const [sortBy, setSortBy] = useState("confidence");

  // Modals state
  const [activeDetailTerm, setActiveDetailTerm] = useState<ModernTerm | null>(null);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

  // Fetch terms on mount if initialTerms is empty
  useEffect(() => {
    if (initialTerms.length > 0) return;
    if (typeof window === "undefined" || process.env.NODE_ENV === "test") {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/v1/modern-vocabulary?limit=50")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          setTerms(data.items);
        }
      })
      .catch(() => {
        // Silently catch in offline or testing
      })
      .finally(() => setLoading(false));
  }, [initialTerms]);

  // Client-side filtering and sorting for instant responsiveness
  const filteredTerms = useMemo(() => {
    let result = [...terms];

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.english_meaning && t.english_meaning.toLowerCase().includes(q)) ||
          (t.transliteration && t.transliteration.toLowerCase().includes(q)) ||
          t.categories.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== "ALL") {
      result = result.filter((t) =>
        t.categories.some((c) => c.toUpperCase() === selectedCategory)
      );
    }

    if (selectedRegister !== "ALL") {
      result = result.filter((t) => t.register.toUpperCase() === selectedRegister);
    }

    if (sortBy === "alphabetical") {
      result.sort((a, b) => a.term.localeCompare(b.term, "th"));
    } else if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.first_seen_at || 0).getTime() - new Date(a.first_seen_at || 0).getTime()
      );
    } else {
      result.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
    }

    return result;
  }, [terms, query, selectedCategory, selectedRegister, sortBy]);

  return (
    <section
      id="modern-vocabulary"
      className="modern-vocabulary-section py-12 px-4 md:px-8 max-w-7xl mx-auto"
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "48px 24px",
      }}
    >
      {/* Section Header */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            borderRadius: "9999px",
            backgroundColor: "#eff6ff",
            color: "#1d4ed8",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "12px",
            border: "1px solid #bfdbfe",
          }}
        >
          <span>⚡ Modern Thai Vocabulary Layer</span>
        </div>
        <h2
          style={{
            fontSize: "32px",
            fontWeight: 800,
            color: "#0f172a",
            margin: "0 0 12px 0",
            letterSpacing: "-0.02em",
          }}
        >
          คลังคำศัพท์ภาษาไทยร่วมสมัย
        </h2>
        <p
          style={{
            fontSize: "16px",
            color: "#64748b",
            maxWidth: "680px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          บันทึกคำศัพท์ที่ใช้จริงในสังคมยุคดิจิทัล ทั้งคำศัพท์ AI, เทคโนโลยี, สื่อสังคม และสแลง
          โดยแยกสถานะจากพจนานุกรมทางการอย่างชัดเจน พร้อมแหล่งอ้างอิงและระดับความเป็นทางการ
        </p>

        {/* Governance banner */}
        <div
          style={{
            maxWidth: "760px",
            margin: "18px auto 0 auto",
            padding: "10px 16px",
            borderRadius: "10px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: "12.5px",
            color: "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span>🏛️</span>
          <span>
            <strong>หลักธรรมาภิบาลข้อมูล:</strong> ข้อมูลชุดนี้มิใช่ประกาศทางการของสำนักงานราชบัณฑิตยสภา ทุกคำระบุที่มาและระดับการใช้งานเพื่อการศึกษาและพัฒนาเทคโนโลยีภาษา
          </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div
        className="controls-bar"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "28px",
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        {/* Search Input & Action Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ flex: "1 1 300px", position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: "16px",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาคำศัพท์ร่วมสมัย เช่น ป้ายยา, RAG, จึ้ง, Prompt..."
              style={{
                width: "100%",
                padding: "10px 14px 10px 38px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                outline: "none",
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Foreigner Friendly Toggle */}
            <button
              type="button"
              onClick={() => setForeignerMode(!foreignerMode)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                border: "1px solid",
                borderColor: foreignerMode ? "#86efac" : "#cbd5e1",
                backgroundColor: foreignerMode ? "#f0fdf4" : "#ffffff",
                color: foreignerMode ? "#166534" : "#475569",
                cursor: "pointer",
              }}
            >
              <span>🇬🇧</span>
              <span>โหมดผู้เรียนต่างชาติ (English & Phonetics)</span>
            </button>

            {/* Suggest New Word Button */}
            <button
              type="button"
              onClick={() => setIsSuggestModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span>✨</span>
              <span>เสนอคำศัพท์ใหม่</span>
            </button>
          </div>
        </div>

        {/* Categories Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12.5px",
                  fontWeight: active ? 700 : 500,
                  backgroundColor: active ? "#1e293b" : "#f1f5f9",
                  color: active ? "#ffffff" : "#475569",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Secondary filters: Register and Sort */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            borderTop: "1px solid #f1f5f9",
            paddingTop: "12px",
            fontSize: "12.5px",
            color: "#64748b",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>ระดับภาษา:</span>
            <select
              value={selectedRegister}
              onChange={(e) => setSelectedRegister(e.target.value)}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "12px",
                backgroundColor: "#ffffff",
              }}
            >
              <option value="ALL">ทุกระดับภาษา</option>
              <option value="SLANG">สแลง (Slang)</option>
              <option value="INFORMAL">ภาษาปาก (Informal)</option>
              <option value="SPECIALIZED">เฉพาะทาง (Specialized)</option>
              <option value="SEMI_FORMAL">กึ่งทางการ</option>
              <option value="FORMAL">ทางการ</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>เรียงตาม:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "12px",
                backgroundColor: "#ffffff",
              }}
            >
              <option value="confidence">ความมั่นใจข้อมูล (Confidence)</option>
              <option value="alphabetical">เรียงตามตัวอักษร (ก-ฮ / A-Z)</option>
              <option value="newest">บันทึกล่าสุด (Newest)</option>
            </select>
            <span style={{ marginLeft: "6px", color: "#0f172a", fontWeight: 600 }}>
              พบ {filteredTerms.length} คำ
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Terms */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
          กำลังโหลดคลังคำศัพท์ภาษาไทยร่วมสมัย...
        </div>
      ) : filteredTerms.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "#f8fafc",
            borderRadius: "16px",
            border: "1px dashed #cbd5e1",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</div>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1e293b", margin: "0 0 6px 0" }}>
            ไม่พบคำศัพท์ที่ตรงกับเงื่อนไขการค้นหา
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>
            คุณสามารถช่วยเพิ่มคำนี้เข้าสู่คลังคำศัพท์ภาษาไทยร่วมสมัยได้
          </p>
          <button
            type="button"
            onClick={() => setIsSuggestModalOpen(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              borderRadius: "8px",
              border: "none",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            เสนอคำว่า &ldquo;{query}&rdquo; เข้าสู่ระบบ ➔
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredTerms.map((term) => (
            <ModernTermCard
              key={term.id || term.term}
              term={term}
              foreignerMode={foreignerMode}
              onViewDetail={(t) => setActiveDetailTerm(t)}
              onCompareWithFormal={onCompareWithFormal}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ModernTermDetailModal
        term={activeDetailTerm}
        onClose={() => setActiveDetailTerm(null)}
        onCompareWithFormal={onCompareWithFormal}
      />

      <ModernTermSubmissionModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
      />
    </section>
  );
}
