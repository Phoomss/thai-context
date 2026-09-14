"use client";

import React, { useEffect, useState } from "react";
import type { SignResourceItem } from "@/lib/sign-language-types";
import { getSignResource } from "@/lib/sign-motion-data";
import SignMotionPlayer from "./SignMotionPlayer";
import SignContributionModal from "./SignContributionModal";
import Icon from "../ui/Icon";

export interface SignLanguageSectionProps {
  word: string;
  initialResource?: SignResourceItem;
  onOpenFullModal?: () => void;
  compact?: boolean;
}

export default function SignLanguageSection({
  word,
  initialResource,
  onOpenFullModal,
  compact = false,
}: SignLanguageSectionProps) {
  const [resource, setResource] = useState<SignResourceItem | null>(initialResource ?? null);
  const [loading, setLoading] = useState(!initialResource);
  const [isContribOpen, setIsContribOpen] = useState(false);

  useEffect(() => {
    if (initialResource) {
      setResource(initialResource);
      setLoading(false);
      return;
    }

    const clean = word.trim();
    if (!clean) return;

    // Instant local catalog resolution (offline-first & avoids extra fetch in test runners)
    const local = getSignResource(clean);
    setResource(local);
    setLoading(false);
  }, [word, initialResource]);

  if (loading) {
    return (
      <section
        className="tsl-section font-thai-reading"
        aria-busy="true"
        aria-label="กำลังโหลดข้อมูลภาษามือไทย"
        style={{
          padding: "16px",
          borderRadius: "16px",
          background: "#f8fafc",
          border: "1px solid var(--border, #e2e8f0)",
          textAlign: "center",
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        กำลังตรวจสอบข้อมูลภาษามือไทย...
      </section>
    );
  }

  const currentStatus = resource?.status || "NOT_AVAILABLE";
  const isDemo = resource?.source?.type === "DEMO_DATA";
  const isExternal = currentStatus === "EXTERNAL_RESOURCE";
  const isVerified = currentStatus === "VERIFIED";
  const isNotAvailable = currentStatus === "NOT_AVAILABLE" || (!isVerified && !isExternal);

  return (
    <section
      className="tsl-section font-thai-reading"
      aria-labelledby="tsl-section-title"
      style={{
        marginTop: "16px",
        padding: "18px",
        borderRadius: "16px",
        background: "#ffffff",
        border: "1px solid var(--border, #e2e8f0)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>🤟</span>
          <h4
            id="tsl-section-title"
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--ink, #0f172a)",
            }}
          >
            ภาษามือไทย (Thai Sign Language)
          </h4>
        </div>

        {/* Status Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {isVerified && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "3px 8px",
                borderRadius: "6px",
                background: isDemo ? "#fef3c7" : "#ecfdf5",
                color: isDemo ? "#92400e" : "#065f46",
                fontSize: "11px",
                fontWeight: 700,
                border: `1px solid ${isDemo ? "#fde68a" : "#a7f3d0"}`,
              }}
            >
              {isDemo ? "⚡ DEMO (ต้นแบบ)" : "✓ Verified"}
            </span>
          )}

          {isExternal && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "3px 8px",
                borderRadius: "6px",
                background: "#f1f5f9",
                color: "#475569",
                fontSize: "11px",
                fontWeight: 600,
                border: "1px solid #cbd5e1",
              }}
            >
              🌐 External Resource
            </span>
          )}

          {isNotAvailable && (
            <span
              style={{
                padding: "3px 8px",
                borderRadius: "6px",
                background: "#fef2f2",
                color: "#991b1b",
                fontSize: "11px",
                fontWeight: 600,
                border: "1px solid #fecaca",
              }}
            >
              ยังไม่มีข้อมูลที่ผ่านการตรวจสอบ
            </span>
          )}

          {onOpenFullModal && (
            <button
              type="button"
              onClick={onOpenFullModal}
              aria-label="ขยายแบบเต็มหน้าต่าง"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "var(--accent, #0284c7)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              [ขยาย ⤢]
            </button>
          )}
        </div>
      </div>

      {/* STATE 1: VERIFIED */}
      {isVerified && resource && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <SignMotionPlayer resource={resource} initialSpeed={1.0} autoPlay={false} />

          {/* Provenance & Verification Metadata */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
              color: "#475569",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "8px",
            }}
          >
            <div>
              <strong style={{ color: "#1e293b" }}>แหล่งที่มา (Source):</strong>
              <div>{resource.source?.name || "THAI CONTEXT Gesture Lab"}</div>
              {resource.source?.license && (
                <div style={{ color: "#64748b", fontSize: "11px" }}>
                  สัญญาอนุญาต: {resource.source.license}
                </div>
              )}
            </div>

            <div>
              <strong style={{ color: "#1e293b" }}>สถานะการตรวจสอบ (Verification):</strong>
              <div style={{ color: isDemo ? "#92400e" : "#059669", fontWeight: 600 }}>
                {isDemo
                  ? `ข้อมูลตัวอย่างต้นแบบ (ตรวจทานโดย: ${resource.verification?.verified_by || "Demo Prototype"})`
                  : `✓ รับรองโดย ${resource.verification?.verified_by || "ผู้ทรงคุณวุฒิ"}`}
              </div>
              {resource.verification?.notes && (
                <div style={{ color: "#64748b", fontSize: "11px" }}>
                  {resource.verification.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: EXTERNAL RESOURCE */}
      {isExternal && resource && (
        <div
          style={{
            padding: "20px",
            borderRadius: "14px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <span style={{ fontSize: "28px" }}>🌐</span>
            <div>
              <h5 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: "#1e293b" }}>
                ข้อมูลภาษามือมีอยู่จากแหล่งภายนอก
              </h5>
              <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
                คำนี้มีแหล่งข้อมูลภาษามือที่บันทึกไว้ในเว็บไซต์ภายนอก THAI CONTEXT ปฏิบัติตามหลัก Data Governance
                โดยไม่ดาวน์โหลด คัดลอก หรือทำซ้ำสื่อที่มีลิขสิทธิ์ แต่เชื่อมโยงให้คุณเข้าถึงแหล่งต้นฉบับได้โดยตรง
              </p>
            </div>
          </div>

          <div
            style={{
              paddingTop: "12px",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              แหล่งข้อมูล: <strong>{resource.source?.name || "สารานุกรมภาษามือภายนอก"}</strong>
            </div>

            {resource.source?.url && (
              <a
                href={resource.source.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  background: "var(--accent, #0284c7)",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                <span>เปิดแหล่งข้อมูลต้นฉบับ</span>
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* STATE 3: NOT AVAILABLE */}
      {isNotAvailable && (
        <div
          style={{
            padding: "20px",
            borderRadius: "14px",
            background: "#fffbeb",
            border: "1px solid #fef3c7",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <span style={{ fontSize: "28px" }}>ℹ️</span>
            <div>
              <h5 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 700, color: "#92400e" }}>
                ยังไม่มีข้อมูลภาษามือไทยที่ผ่านการตรวจสอบสำหรับคำนี้
              </h5>
              <p style={{ margin: 0, fontSize: "13px", color: "#78350f", lineHeight: 1.6 }}>
                THAI CONTEXT <strong>จะไม่สร้างหรือคาดเดาท่ามือขึ้นเองโดยไม่มีแหล่งอ้างอิงที่ตรวจสอบได้</strong>{" "}
                เพื่อป้องกันความเข้าใจผิดและรักษาความถูกต้องของภาษามือไทยตามหลักมาตรฐานสากล
              </p>
            </div>
          </div>

          <div
            style={{
              paddingTop: "12px",
              borderTop: "1px solid #fde68a",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "12px", color: "#92400e" }}>
              คุณรู้จักแหล่งข้อมูลภาษามือที่เชื่อถือได้สำหรับคำนี้หรือไม่?
            </span>
            <button
              type="button"
              onClick={() => setIsContribOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "10px",
                background: "#ffffff",
                color: "#92400e",
                border: "1px solid #d97706",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              <span>+ เสนอแหล่งข้อมูล (Contribute)</span>
            </button>
          </div>
        </div>
      )}

      {/* User Contribution Modal */}
      <SignContributionModal
        word={word}
        isOpen={isContribOpen}
        onClose={() => setIsContribOpen(false)}
      />
    </section>
  );
}
