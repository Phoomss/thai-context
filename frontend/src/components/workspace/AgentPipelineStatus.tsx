"use client";

import React, { useState } from "react";
import type { AgentTrace } from "@/lib/workspace-types";

interface AgentPipelineStatusProps {
  traces: AgentTrace[];
  isLoading?: boolean;
}

const AGENT_LABELS: Record<string, { th: string; icon: string; color: string }> = {
  ContextAgent: { th: "วิเคราะห์บริบท", icon: "🎯", color: "text-purple-400 border-purple-800/50 bg-purple-950/40" },
  WordDiscoveryAgent: { th: "ค้นพบคลังคำ", icon: "📖", color: "text-sky-400 border-sky-800/50 bg-sky-950/40" },
  WordCompareAgent: { th: "เปรียบเทียบเฉดคำ", icon: "⚖️", color: "text-indigo-400 border-indigo-800/50 bg-indigo-950/40" },
  WritingAgent: { th: "สร้างประโยคบริบท", icon: "✍️", color: "text-cyan-400 border-cyan-800/50 bg-cyan-950/40" },
  RewriteAgent: { th: "ปรับแต่งระดับภาษา", icon: "✨", color: "text-amber-400 border-amber-800/50 bg-amber-950/40" },
  LanguageCheckerAgent: { th: "ตรวจทานไวยากรณ์", icon: "🔍", color: "text-emerald-400 border-emerald-800/50 bg-emerald-950/40" },
  LanguageBridgeAgent: { th: "สะพานภาษาข้ามวัฒนธรรม", icon: "🌐", color: "text-teal-400 border-teal-800/50 bg-teal-950/40" },
  HallucinationGuard: { th: "ตรวจความถูกต้องคลังข้อมูล", icon: "🛡️", color: "text-rose-400 border-rose-800/50 bg-rose-950/40" },
};

export default function AgentPipelineStatus({ traces, isLoading }: AgentPipelineStatusProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!traces || traces.length === 0) return null;

  const totalMs = traces.reduce((acc, t) => acc + (t.duration_ms || 0), 0);

  return (
    <div
      role="region"
      aria-label="สถานะการทำงานของ Sub-Agents"
      className="p-4 rounded-2xl border border-sky-800/40 bg-slate-900/90 backdrop-blur-md shadow-xl transition-all mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
          </span>
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-300">
            AI Sub-Agent Orchestration Pipeline
          </span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {traces.length} Agents {totalMs > 0 && `· ${totalMs}ms`}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors flex items-center gap-1.5"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? "ย่อมุมมอง" : "ดูเบื้องหลัง"}</span>
          <span className="text-[10px]">{isExpanded ? "▲" : "▼"}</span>
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-800/80">
          {traces.map((trace, idx) => {
            const meta = AGENT_LABELS[trace.agent] || {
              th: trace.agent,
              icon: "⚡",
              color: "text-slate-300 border-slate-700 bg-slate-800/50",
            };
            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs transition-all hover:scale-[1.01] ${meta.color}`}
              >
                <span className="text-lg select-none" aria-hidden="true">
                  {meta.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-100 truncate">
                      {meta.th}
                    </span>
                    {trace.duration_ms !== undefined && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {trace.duration_ms}ms
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300/90 truncate mt-0.5" title={trace.summary}>
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
