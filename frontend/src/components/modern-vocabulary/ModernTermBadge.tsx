"use client";

import React from "react";
import { ModernTermRegister, ModernTermStatus } from "@/lib/modern-vocabulary-types";

interface ModernTermBadgeProps {
  type?: "MODERN" | "OFFICIAL" | "DIALECT";
  status?: ModernTermStatus | string;
  register?: ModernTermRegister | string;
  isOfficial?: boolean;
  confidence?: number;
  sourcesCount?: number;
  verified?: boolean;
  className?: string;
  compact?: boolean;
}

const REGISTER_LABELS: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
  SLANG: { label: "สแลงร่วมสมัย", icon: "🔥", color: "#c2410c", bg: "#fff7ed", border: "#ffedd5" },
  INFORMAL: { label: "ภาษาปาก", icon: "💬", color: "#0284c7", bg: "#f0f9ff", border: "#e0f2fe" },
  NEUTRAL: { label: "ภาษาระดับกลาง", icon: "📝", color: "#475569", bg: "#f8fafc", border: "#e2e8f0" },
  SEMI_FORMAL: { label: "กึ่งทางการ", icon: "📜", color: "#4338ca", bg: "#eef2ff", border: "#e0e7ff" },
  FORMAL: { label: "ภาษาทางการ", icon: "🏛️", color: "#15803d", bg: "#f0fdf4", border: "#dcfce7" },
  SPECIALIZED: { label: "ศัพท์เฉพาะทาง", icon: "💻", color: "#7c3aed", bg: "#faf5ff", border: "#ede9fe" },
  TABOO: { label: "ระวังการใช้", icon: "⚠️", color: "#b91c1c", bg: "#fef2f2", border: "#fee2e2" },
};

const STATUS_LABELS: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
  EMERGING: { label: "คำเกิดใหม่", icon: "✨", color: "#c2410c", bg: "#fff7ed", border: "#ffedd5" },
  TRENDING: { label: "กำลังนิยม", icon: "📈", color: "#be185d", bg: "#fdf2f8", border: "#fce7f3" },
  COMMON: { label: "ใช้แพร่หลาย", icon: "✓", color: "#047857", bg: "#ecfdf5", border: "#d1fae5" },
  SPECIALIZED: { label: "เฉพาะกลุ่ม", icon: "🎯", color: "#6d28d9", bg: "#faf5ff", border: "#ede9fe" },
  DECLINING: { label: "ความนิยมลดลง", icon: "📉", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
  HISTORICAL: { label: "คำในอดีต", icon: "⏳", color: "#78716c", bg: "#f5f5f4", border: "#e7e5e4" },
};

export default function ModernTermBadge({
  type = "MODERN",
  status,
  register,
  isOfficial = false,
  confidence,
  sourcesCount,
  verified = true,
  className = "",
  compact = false,
}: ModernTermBadgeProps) {
  const regMeta = register ? REGISTER_LABELS[register.toUpperCase()] : null;
  const statMeta = status ? STATUS_LABELS[status.toUpperCase()] : null;

  return (
    <div
      className={`modern-badges-container flex flex-wrap items-center gap-1.5 ${className}`}
      style={{ display: "inline-flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}
    >
      {/* Primary Tier Badge */}
      {isOfficial ? (
        <span
          className="badge-official inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{
            backgroundColor: "#ecfdf5",
            color: "#065f46",
            border: "1px solid #a7f3d0",
            fontSize: "11px",
            fontWeight: 600,
            borderRadius: "9999px",
            padding: "2px 8px",
          }}
          title="คำศัพท์ปรากฏในพจนานุกรมฉบับราชบัณฑิตยสถานอย่างเป็นทางการ"
        >
          <span>🏛️</span>
          <span>พจนานุกรมทางการ</span>
        </span>
      ) : (
        <span
          className="badge-modern inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{
            backgroundColor: "#eff6ff",
            color: "#1d4ed8",
            border: "1px solid #bfdbfe",
            fontSize: "11px",
            fontWeight: 600,
            borderRadius: "9999px",
            padding: "2px 8px",
          }}
          title="คำศัพท์ภาษาไทยร่วมสมัย มีการใช้งานจริงและมีแหล่งอ้างอิง ไม่ใช่คำทางการราชบัณฑิต"
        >
          <span>⚡</span>
          <span>คำศัพท์สมัยใหม่</span>
        </span>
      )}

      {/* Register / Formality Badge */}
      {regMeta && (
        <span
          className="badge-register inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold"
          style={{
            backgroundColor: regMeta.bg,
            color: regMeta.color,
            border: `1px solid ${regMeta.border}`,
            fontSize: "11px",
            fontWeight: 600,
            borderRadius: "9999px",
            padding: "2px 8px",
          }}
          title={`ระดับภาษา: ${regMeta.label}`}
        >
          <span>{regMeta.icon}</span>
          <span>{regMeta.label}</span>
        </span>
      )}

      {/* Status Badge */}
      {statMeta && (
        <span
          className="badge-status inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: statMeta.bg,
            color: statMeta.color,
            border: `1px solid ${statMeta.border}`,
            fontSize: "11px",
            fontWeight: 500,
            borderRadius: "9999px",
            padding: "2px 7px",
          }}
          title={`สถานะการใช้: ${statMeta.label}`}
        >
          <span>{statMeta.icon}</span>
          <span>{statMeta.label}</span>
        </span>
      )}

      {/* Source Provenance count */}
      {!compact && typeof sourcesCount === "number" && sourcesCount > 0 && (
        <span
          className="badge-sources inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md"
          style={{
            backgroundColor: "#f8fafc",
            color: "#475569",
            border: "1px solid #e2e8f0",
            fontSize: "10.5px",
            fontWeight: 500,
            borderRadius: "6px",
            padding: "1px 6px",
          }}
          title={`${sourcesCount} แหล่งข้อมูลอ้างอิง`}
        >
          <span>🌐</span>
          <span>{sourcesCount} แหล่งอ้างอิง</span>
          {verified && <span style={{ color: "#059669" }}>✓</span>}
        </span>
      )}

      {/* Confidence metric */}
      {!compact && typeof confidence === "number" && confidence > 0 && (
        <span
          className="badge-confidence text-xs font-medium"
          style={{
            color: "#64748b",
            fontSize: "10.5px",
            marginLeft: "2px",
          }}
          title="ความสมบูรณ์และหลักฐานของข้อมูลคำศัพท์"
        >
          ความมั่นใจ {Math.round(confidence * 100)}%
        </span>
      )}
    </div>
  );
}
