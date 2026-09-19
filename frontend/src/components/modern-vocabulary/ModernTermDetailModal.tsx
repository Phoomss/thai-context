"use client";

import React, { useEffect } from "react";
import { ModernTerm } from "@/lib/modern-vocabulary-types";
import ModernTermBadge from "./ModernTermBadge";

interface ModernTermDetailModalProps {
  term: ModernTerm | null;
  onClose: () => void;
  onCompareWithFormal?: (modernTerm: string, formalCandidate?: string) => void;
}

export default function ModernTermDetailModal({
  term,
  onClose,
  onCompareWithFormal,
}: ModernTermDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!term) return null;

  const formalRelation = term.relationships?.find(
    (r) => r.relationship_type === "FORMAL_EQUIVALENT"
  );

  return (
    <div
      className="modern-detail-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        className="modern-detail-modal relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          maxWidth: "680px",
          width: "100%",
          maxHeight: "88vh",
          overflowY: "auto",
          padding: "28px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-term-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดหน้าต่างรายละเอียด"
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            color: "#64748b",
            fontSize: "16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ marginBottom: "8px" }}>
            <ModernTermBadge
              status={term.status}
              register={term.register}
              isOfficial={false}
              sourcesCount={term.sources?.length}
              confidence={term.confidence}
            />
          </div>
          <h2
            id="modal-term-title"
            style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}
          >
            {term.term}
          </h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", color: "#64748b", fontSize: "13px" }}>
            {term.pronunciation && <span>การออกเสียง: <strong>/{term.pronunciation}/</strong></span>}
            {term.transliteration && <span>คำทับศัพท์/ถอดเสียง: <strong>{term.transliteration}</strong></span>}
            {term.origin && <span>ที่มา: <strong>{term.origin}</strong></span>}
          </div>
        </div>

        {/* Governance Banner: Not Official Notice */}
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "10px",
            fontSize: "12px",
            color: "#1e40af",
            marginBottom: "20px",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "16px" }}>ℹ️</span>
          <div>
            <strong>ข้อกำหนดด้านความถูกต้องของข้อมูล (Governance Notice):</strong>
            <div style={{ marginTop: "2px" }}>
              คำนี้ถูกจัดเก็บใน <em>คลังคำศัพท์ภาษาไทยร่วมสมัย</em> เพื่อบันทึกการใช้งานจริงในสังคมและเทคโนโลยี โดยมิได้มีสถานะเป็นคำในพจนานุกรมฉบับราชบัณฑิตยสถาน
            </div>
          </div>
        </div>

        {/* Warning if any */}
        {term.usage_warning && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#fef3c7",
              border: "1px solid #fde68a",
              borderRadius: "10px",
              fontSize: "12px",
              color: "#92400e",
              marginBottom: "20px",
            }}
          >
            ⚠️ <strong>ข้อควรระวังในการใช้งาน:</strong> {term.usage_warning}
          </div>
        )}

        {/* Section 1: Definitions */}
        <section style={{ marginBottom: "24px" }}>
          <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "10px" }}>
            📖 ความหมายและการนิยาม (Definitions)
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {term.definitions && term.definitions.length > 0 ? (
              term.definitions.map((def, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "12px 14px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: "4px",
                        backgroundColor: def.definition_type === "SOURCE_DEFINED" ? "#e0f2fe" : def.definition_type === "EDITOR_REVIEWED" ? "#dcfce7" : "#ede9fe",
                        color: def.definition_type === "SOURCE_DEFINED" ? "#0369a1" : def.definition_type === "EDITOR_REVIEWED" ? "#15803d" : "#6d28d9",
                      }}
                    >
                      {def.definition_type === "SOURCE_DEFINED"
                        ? "นิยามจากแหล่งอ้างอิง"
                        : def.definition_type === "EDITOR_REVIEWED"
                        ? "กองบรรณาธิการตรวจรับรอง"
                        : "AI สังเคราะห์ความหมาย"}
                    </span>
                    {def.generated_by && (
                      <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>
                        โดย: {def.generated_by}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: "13.5px", color: "#1e293b", lineHeight: 1.6 }}>
                    {def.definition}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "13.5px", color: "#475569" }}>{term.description}</p>
            )}
          </div>
        </section>

        {/* Section 2: Sources & Provenance */}
        <section style={{ marginBottom: "24px" }}>
          <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "10px" }}>
            🌐 แหล่งข้อมูลอ้างอิงและการพิสูจน์ทราบ (Sources & Provenance)
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {term.sources && term.sources.length > 0 ? (
              term.sources.map((src, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "10px 14px",
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>
                      [{src.source_type}] {src.source_name}
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        color: src.verification_status === "VERIFIED" ? "#15803d" : "#ca8a04",
                      }}
                    >
                      {src.verification_status === "VERIFIED" ? "✓ ยืนยันแล้ว" : "รอยืนยัน"}
                    </span>
                  </div>
                  {src.excerpt && (
                    <div style={{ marginTop: "4px", color: "#475569", fontStyle: "italic", fontSize: "12px" }}>
                      &ldquo;{src.excerpt}&rdquo;
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "12px", marginTop: "6px", fontSize: "11px", color: "#94a3b8" }}>
                    {src.source_date && <span>วันที่บันทึก: {src.source_date}</span>}
                    {src.source_url && (
                      <a
                        href={src.source_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={{ color: "#2563eb", textDecoration: "underline" }}
                      >
                        เปิดลิงก์แหล่งที่มา ↗
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "12px", color: "#94a3b8" }}>ไม่มีข้อมูลแหล่งอ้างอิงเฉพาะ</p>
            )}
          </div>
        </section>

        {/* Section 3: Official Dictionary Check Timeline */}
        <section style={{ marginBottom: "24px" }}>
          <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "10px" }}>
            🏛️ การตรวจสอบเทียบพจนานุกรมฉบับทางการ (Official Comparison)
          </h4>
          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "#f8fafc",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              fontSize: "12.5px",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "10px" }}>
              {["2542", "2554", "2569"].map((year) => {
                const edMatch = term.official_comparison?.editions?.find(
                  (e) => e.edition_year === year && e.status !== "ไม่พบข้อมูล"
                );
                return (
                  <div
                    key={year}
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      backgroundColor: edMatch ? "#ecfdf5" : "#ffffff",
                      border: `1px solid ${edMatch ? "#a7f3d0" : "#e2e8f0"}`,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>ฉบับ {year}</div>
                    <div style={{ fontSize: "11px", color: edMatch ? "#059669" : "#94a3b8", marginTop: "2px" }}>
                      {edMatch ? "✓ พบคำศัพท์" : "ไม่พบในฉบับนี้"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ color: "#475569", fontSize: "12px" }}>
              {term.official_comparison?.note ||
                `คำว่า "${term.term}" เป็นคำภาษาร่วมสมัย ยังไม่ปรากฏในพจนานุกรมฉบับทางการ`}
            </div>
          </div>
        </section>

        {/* Section 4: Foreigner Support */}
        {term.foreigner_support && (
          <section style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "10px" }}>
              🇬🇧 คำแนะนำสำหรับผู้เรียนภาษาไทย (Foreigner Support)
            </h4>
            <div
              style={{
                padding: "12px 14px",
                backgroundColor: "#f0fdf4",
                borderRadius: "10px",
                border: "1px solid #bbf7d0",
                fontSize: "12.5px",
                color: "#166534",
              }}
            >
              <div style={{ marginBottom: "4px" }}>
                <strong>English Meaning:</strong> {term.foreigner_support.english_meaning || term.english_meaning}
              </div>
              {term.foreigner_support.transliteration && (
                <div style={{ marginBottom: "4px" }}>
                  <strong>Pronunciation / IPA:</strong> {term.foreigner_support.transliteration}
                </div>
              )}
              {term.foreigner_support.usage_guidance && (
                <div>
                  <strong>Usage Note:</strong> {term.foreigner_support.usage_guidance}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
          {formalRelation && onCompareWithFormal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onCompareWithFormal(term.term, formalRelation.target_headword || formalRelation.target_id);
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              เปรียบเทียบกับ &ldquo;{formalRelation.target_headword || formalRelation.target_id}&rdquo; ➔
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f1f5f9",
              color: "#334155",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
