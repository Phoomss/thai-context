"use client";

import React, { useState, useEffect, useRef } from "react";
import AgentPipelineStatus from "./AgentPipelineStatus";
import WorkspaceResultCard from "./WorkspaceResultCard";
import { executeWorkspace } from "@/lib/api-client";
import type {
  WorkspaceResponsePayload,
  WorkspaceRequestPayload,
} from "@/lib/workspace-types";

const DEMO_PRESETS = [
  {
    label: "🚀 ค้นหาคำจากเจตนา",
    query: "หาคำที่หมายถึงทำงานได้ดีและใช้ทรัพยากรน้อย",
    context: { type: "academic", tone: "formal", audience: "คณะกรรมการวิชาการ" },
  },
  {
    label: "⚖️ เปรียบเทียบเฉดคำ",
    query: "ประสิทธิภาพ หรือ ประสิทธิผล ต่างกันอย่างไร",
    context: { type: "academic", tone: "formal", audience: "คณะกรรมการวิชาการ" },
  },
  {
    label: "✍️ แต่งประโยควิชาการ",
    query: "แต่งประโยคคำว่า ประสิทธิภาพ สำหรับรายงานวิชาการ",
    context: { type: "academic", tone: "formal", audience: "คณะกรรมการวิชาการ" },
  },
  {
    label: "⚡ ทำให้สั้นลง (Continuation)",
    query: "ทำให้สั้นลงและกระชับขึ้น",
    context: { type: "academic", tone: "formal", audience: "คณะกรรมการวิชาการ" },
  },
  {
    label: "🔍 ตรวจทานภาษา",
    query: "ช่วยตรวจภาษาประโยคนี้ให้หน่อย: ระบบนี้สามารถที่จะทำการประมวลผลได้อย่างรวดเร็ว",
    context: { type: "academic", tone: "formal", audience: "คณะกรรมการวิชาการ" },
  },
  {
    label: "🌐 Bridge: คำว่า 'เกรงใจ'",
    query: "คำว่า เกรงใจ แปลเป็นภาษาอังกฤษและมีบริบททางวัฒนธรรมอย่างไร",
    context: { type: "general", tone: "polite", audience: "ชาวต่างชาติ/สากล" },
  },
];

export default function WorkspaceView() {
  const [query, setQuery] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [selectedContext, setSelectedContext] = useState<string>("academic");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<WorkspaceResponsePayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Initialize session id
  useEffect(() => {
    setSessionId(`session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
  }, []);

  const handleSend = async (messageToSend?: string, overrideContext?: any) => {
    const text = (messageToSend ?? query).trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    const payload: WorkspaceRequestPayload = {
      message: text,
      session_id: sessionId,
      context: overrideContext || {
        type: selectedContext,
        tone: selectedContext === "academic" ? "formal" : "professional",
        audience: selectedContext === "academic" ? "คณะกรรมการวิชาการ" : "ผู้อ่านทั่วไป",
      },
      current_text: currentResult?.generated_content?.[0]?.content,
      selected_words: currentResult?.recommendations?.map((r) => r.word),
    };

    try {
      const response = await executeWorkspace(payload);
      setCurrentResult(response);
      if (messageToSend) {
        setQuery("");
      }
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: any) {
      setErrorMessage(err?.message || "เกิดข้อผิดพลาดในการประมวลผล Workspace");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSession = () => {
    setSessionId(`session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
    setCurrentResult(null);
    setQuery("");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Workspace Banner */}
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 text-sky-400 border border-sky-800/60 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              Unified AI Language Workspace
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-300">
              THAI CONTEXT Workspace
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1 max-w-2xl">
              &ldquo;ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน&rdquo; — ค้นพบ เปรียบเทียบ แต่งประโยค เรียบเรียง และตรวจทานภาษาไทยในพื้นที่เดียว
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleResetSession}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
              title="เริ่มเซสชันใหม่ เคลียร์บริบทที่จำไว้"
            >
              🔄 เริ่มเซสชันใหม่
            </button>
          </div>
        </div>

        {/* Query Input Section */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl mb-6">
          {/* Context Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">ระดับบริบท:</span>
              {(["academic", "business", "government", "casual"] as const).map((ctx) => (
                <button
                  key={ctx}
                  type="button"
                  onClick={() => setSelectedContext(ctx)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    selectedContext === ctx
                      ? "bg-sky-600 text-white shadow-sm"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {ctx === "academic"
                    ? "🎓 วิชาการ"
                    : ctx === "business"
                    ? "💼 ธุรกิจ"
                    : ctx === "government"
                    ? "🏛️ ราชการ"
                    : "💬 สนทนา"}
                </button>
              ))}
            </div>

            {sessionId && (
              <span className="text-[11px] font-mono text-slate-400">
                ID: {sessionId.substring(0, 16)}...
              </span>
            )}
          </div>

          {/* Textarea Composer */}
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="พิมพ์เจตนาที่ต้องการ เช่น 'หาคำที่หมายถึงทำงานได้ดีและใช้ทรัพยากรน้อย' หรือ 'แต่งประโยคคำว่า ประสิทธิภาพ สำหรับรายงานวิชาการ'..."
              rows={3}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm resize-none"
            />

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-400">
                กด <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300">Ctrl + Enter</kbd> เพื่อประมวลผล
              </span>

              <button
                type="button"
                disabled={isLoading || !query.trim()}
                onClick={() => handleSend()}
                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  isLoading || !query.trim()
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25"
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    กำลังประมวลผล...
                  </>
                ) : (
                  <>
                    <span>ประมวลผล Workspace</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Demo Presets */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              💡 ตัวอย่างสถานการณ์จำลอง (One-Click Demo):
            </span>
            <div className="flex flex-wrap gap-2">
              {DEMO_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(preset.query);
                    handleSend(preset.query, preset.context);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/60 hover:border-sky-600/50 transition-colors text-left"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 mb-6 rounded-xl bg-rose-950/60 border border-rose-600 text-rose-200 text-sm"
          >
            {errorMessage}
          </div>
        )}

        {/* Results View Container */}
        <div ref={resultsRef} className="space-y-6">
          {currentResult && (
            <>
              {/* Active Agent Pipeline Bar */}
              <AgentPipelineStatus
                traces={currentResult.agent_traces}
                isLoading={isLoading}
              />

              {/* Comprehensive Result Card */}
              <WorkspaceResultCard
                result={currentResult}
                onSelectAction={(followUpPrompt) => {
                  setQuery(followUpPrompt);
                  handleSend(followUpPrompt);
                }}
              />

              {/* Continuation Action Bar */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
                <span className="text-xs font-semibold text-slate-400 block mb-2.5">
                  ⚡ ขั้นตอนถัดไปที่คุณสามารถทำต่อได้ทันที (Next Actions):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSend("ทำให้สั้นลงและกระชับขึ้น")}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                  >
                    ✂️ ทำให้สั้นลง
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend("ปรับให้เป็นทางการตามระเบียบงานสารบรรณ")}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                  >
                    🏛️ ปรับให้เป็นภาษาทางการ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend("ช่วยตรวจภาษาและคำซ้ำซ้อน")}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                  >
                    🔍 ตรวจสอบคำซ้ำซ้อน
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend("แปลเป็นภาษาอังกฤษและอธิบายบริบทวัฒนธรรม")}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                  >
                    🌐 อธิบายเป็นภาษาอังกฤษ (Cross-Cultural)
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
