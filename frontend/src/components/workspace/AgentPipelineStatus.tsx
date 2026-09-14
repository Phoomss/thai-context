"use client";

import React, { useState } from "react";
import type { AgentTrace } from "@/lib/workspace-types";

interface AgentPipelineStatusProps {
  traces: AgentTrace[];
  isLoading?: boolean;
}

const AGENT_LABELS: Record<string, { th: string; icon: string; bg: string; border: string; text: string }> = {
  ContextAgent: { th: "วิเคราะห์บริบท", icon: "🎯", bg: "#f5f3ff", border: "#ddd6fe", text: "#6b21a8" },
  WordDiscoveryAgent: { th: "ค้นพบคลังคำ", icon: "📖", bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  WordCompareAgent: { th: "เปรียบเทียบเฉดคำ", icon: "⚖️", bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca" },
  WritingAgent: { th: "สร้างประโยคบริบท", icon: "✍️", bg: "#ecfeff", border: "#a5f3fc", text: "#0e7490" },
  RewriteAgent: { th: "ปรับแต่งระดับภาษา", icon: "✨", bg: "#fffbeb", border: "#fde68a", text: "#b45309" },
  LanguageCheckerAgent: { th: "ตรวจทานไวยากรณ์", icon: "🔍", bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
  LanguageBridgeAgent: { th: "สะพานภาษาข้ามวัฒนธรรม", icon: "🌐", bg: "#f0fdfa", border: "#99f6e4", text: "#0f766e" },
  HallucinationGuard: { th: "ตรวจความถูกต้องคลังข้อมูล", icon: "🛡️", bg: "#fff1f2", border: "#fecdd3", text: "#be123c" },
};

export default function AgentPipelineStatus({ traces, isLoading }: AgentPipelineStatusProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!traces || traces.length === 0) return null;

  const totalMs = traces.reduce((acc, t) => acc + (t.duration_ms || 0), 0);

  return (
    <div
      role="region"
      aria-label="สถานะการทำงานของ Sub-Agents"
      className="workspace-pipeline-panel"
    >
      <div className="workspace-pipeline-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "var(--accent)" }} />
          <h3 className="workspace-pipeline-title">
            AI Sub-Agent Orchestration Pipeline
          </h3>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "999px",
              background: "#e2ebf5",
              color: "var(--ink)",
              fontWeight: 600,
            }}
          >
            {traces.length} Agents {totalMs > 0 && `· ${totalMs}ms`}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="workspace-draft-btn"
          style={{ minHeight: "32px", padding: "4px 10px" }}
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? "ย่อมุมมอง" : "ดูเบื้องหลัง"}</span>
          <span style={{ fontSize: "10px" }}>{isExpanded ? "▲" : "▼"}</span>
        </button>
      </div>

      {isExpanded && (
        <div className="workspace-pipeline-list">
          {traces.map((trace, idx) => {
            const meta = AGENT_LABELS[trace.agent] || {
              th: trace.agent,
              icon: "⚡",
              bg: "#f8fafc",
              border: "var(--border)",
              text: "var(--ink)",
            };
            return (
              <div
                key={idx}
                className="workspace-agent-badge"
                style={{
                  background: meta.bg,
                  borderColor: meta.border,
                  color: meta.text,
                }}
              >
                <span style={{ fontSize: "20px", flexShrink: 0 }} aria-hidden="true">
                  {meta.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                    <strong style={{ fontSize: "13px", fontWeight: 700, color: meta.text }}>
                      {meta.th}
                    </strong>
                    {trace.duration_ms !== undefined && (
                      <span style={{ fontSize: "10px", opacity: 0.8, fontFamily: "monospace" }}>
                        {trace.duration_ms}ms
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "11px",
                      color: "var(--muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={trace.summary}
                  >
                    {trace.summary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
