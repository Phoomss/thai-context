"use client";

import type { ProvenanceType } from "@/lib/accessibility-types";

export interface ProvenanceBadgeProps {
  provenance: ProvenanceType;
  className?: string;
  showIcon?: boolean;
}

interface BadgeConfig {
  icon: string;
  label: string;
  tier: "official" | "ai" | "default";
  title: string;
}

export const PROVENANCE_CONFIGS: Record<string, BadgeConfig> = {
  OFFICIAL_ROYAL_TRANSLITERATION: {
    icon: "🏛️",
    label: "คำทับศัพท์ทางการ",
    tier: "official",
    title: "คำทับศัพท์ทางการตามประกาศสำนักงานราชบัณฑิตยสภา",
  },
  OFFICIAL_ROYAL_COINED: {
    icon: "📜",
    label: "ศัพท์บัญญัติราชบัณฑิต",
    tier: "official",
    title: "ศัพท์บัญญัติเฉพาะทางโดยสำนักงานราชบัณฑิตยสภา",
  },
  AI_GENERATED: {
    icon: "🤖",
    label: "AI แนะนำ",
    tier: "ai",
    title: "คำแปลแนะนำโดย AI เพื่อความเข้าใจเชิงบริบท (ยังไม่ได้รับรองอย่างเป็นทางการ)",
  },
  OFFICIAL_CURATED: {
    icon: "✓",
    label: "รับรองแล้ว",
    tier: "official",
    title: "ข้อมูลผ่านการตรวจสอบโดยผู้เชี่ยวชาญ",
  },
};

export default function ProvenanceBadge({
  provenance,
  className = "",
  showIcon = true,
}: ProvenanceBadgeProps) {
  const config: BadgeConfig = PROVENANCE_CONFIGS[provenance] ?? {
    icon: "ℹ️",
    label: provenance || "แหล่งข้อมูล",
    tier: "default",
    title: `ที่มา: ${provenance}`,
  };

  return (
    <span
      className={`provenance-badge tier-${config.tier} ${className}`.trim()}
      title={config.title}
      role="status"
      aria-label={`แหล่งที่มา: ${config.label}`}
      data-provenance={provenance}
      data-tier={config.tier}
    >
      {showIcon && (
        <span className="badge-icon" aria-hidden="true">
          {config.icon}
        </span>
      )}
      <span className="badge-label font-thai-reading">{config.label}</span>
    </span>
  );
}
