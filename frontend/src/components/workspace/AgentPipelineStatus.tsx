"use client";

import React from "react";
import type { AgentTrace } from "@/lib/workspace-types";

interface AgentPipelineStatusProps {
  traces: AgentTrace[];
  isLoading?: boolean;
}

const AGENT_LABELS: Record<string, { th: string; icon: string }> = {
  ContextAgent: { th: "วิเคราะห์บริบท", icon: "🎯" },
  WordDiscoveryAgent: { th: "ค้นพบคลังคำ", icon: "📖" },
  WordCompareAgent: { th: "เปรียบเทียบเฉดคำ", icon: "⚖️" },
  WritingAgent: { th: "สร้างประโยคบริบท", icon: "✍️" },
  RewriteAgent: { th: "ปรับแต่งระดับภาษา", icon: "✨" },
  LanguageCheckerAgent: { th: "ตรวจทานไวยากรณ์", icon: "🔍" },
  LanguageBridgeAgent: { th: "สะพานภาษาข้ามวัฒนธรรม", icon: "🌐" },
  HallucinationGuard: { th: "ตรวจความถูกต้องคลังข้อมูล", icon: "🛡️" },
};

export default function AgentPipelineStatus({ traces, isLoading }: AgentPipelineStatusProps) {
  if (!traces || traces.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="สถานะการทำงานของ Sub-Agents"
      className="p-4 rounded-xl border border-sky-800/40 bg-slate-900/80 backdrop-blur-md shadow-lg mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
            AI Sub-Agent Orchestration Pipeline
          </span>
        </div>
        <span className="text-xs text-slate-400">
          {traces.length} sub-agents executed
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {traces.map((trace, idx) => {
          const meta = AGENT_LABELS[trace.agent] || { th: trace.agent, icon: "⚡" };
          return (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs transition-all hover:bg-slate-800"
            >
              <span className="text-base" aria-hidden="true">{meta.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-medium text-slate-200 truncate">
                    {meta.th}
                  </span>
                  {trace.duration_ms !== undefined && (
                    <span className="text-[10px] text-slate-400">
                      {trace.duration_ms}ms
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5" title={trace.summary}>
                  {trace.summary}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
