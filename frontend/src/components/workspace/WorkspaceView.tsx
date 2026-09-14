"use client";

import React, { useState, useEffect, useRef } from "react";
import AgentPipelineStatus from "./AgentPipelineStatus";
import WorkspaceResultCard from "./WorkspaceResultCard";
import { executeWorkspace } from "@/lib/api-client";
import { audioManager } from "@/lib/audio-manager";
import type { Recommendation } from "@/lib/search-types";
import type {
  WorkspaceResponsePayload,
  WorkspaceRequestPayload,
} from "@/lib/workspace-types";

const DEMO_PRESETS = [
  {
    label: "🚀 ค้นหาคำจากเจตนา",
    desc: "ค้นหาคำที่ตรงกับความหมายโดยไม่ต้องรู้คำล่วงหน้า",
    query: "หาคำที่หมายถึงทำงานได้ดีและใช้ทรัพยากรน้อย",
    context: { type: "academic", tone: "formal", audience: "คณะกรรมการวิชาการ" },
  },
  {
    label: "⚖️ เปรียบเทียบเฉดคำ",
    desc: "เปรียบเทียบจุดเน้นและวิธีการใช้งานของสองคำที่คล้ายกัน",
    query: "ประสิทธิภาพ หรือ ประสิทธิผล ต่างกันอย่างไร",
    context: { type: "academic", tone: "formal", audience: "คณะกรรมการวิชาการ" },
  },
  {
    label: "✍️ แต่งประโยควิชาการ",
    desc: "แต่งประโยคเชิงวิชาการที่อิงนิยามจากพจนานุกรมอย่างถูกต้อง",
    query: "แต่งประโยคคำว่า ประสิทธิภาพ สำหรับรายงานวิชาการ",
    context: { type: "academic", tone: "formal", audience: "คณะกรรมการวิชาการ" },
  },
  {
    label: "⚡ ทำให้สั้นลง (Continuation)",
    desc: "ตัดคำฟุ่มเฟือยและกระชับข้อความโดยคงแม่คำสำคัญไว้",
    query: "ทำให้สั้นลงและกระชับขึ้น",
    context: { type: "academic", tone: "formal", audience: "คณะกรรมการวิชาการ" },
  },
  {
    label: "🔍 ตรวจทานภาษา",
    desc: "ตรวจหาคำซ้ำซ้อนและความเยิ่นเย้อตามแบบแผนทางการ",
    query: "ช่วยตรวจภาษาประโยคนี้ให้หน่อย: ระบบนี้สามารถที่จะทำการประมวลผลได้อย่างรวดเร็ว",
    context: { type: "academic", tone: "formal", audience: "คณะกรรมการวิชาการ" },
  },
  {
    label: "🌐 Bridge: คำว่า 'เกรงใจ'",
    desc: "อธิบายมิติวัฒนธรรมและการออกเสียงสำหรับชาวต่างชาติ",
    query: "คำว่า เกรงใจ แปลเป็นภาษาอังกฤษและมีบริบททางวัฒนธรรมอย่างไร",
    context: { type: "general", tone: "polite", audience: "ชาวต่างชาติ/สากล" },
  },
];

const USE_CASES = [
  {
    icon: "🎓",
    title: "นักวิจัยและบทความวิชาการ",
    sample: "แต่งประโยคคำว่า ประสิทธิภาพ สำหรับรายงานวิชาการ",
    tag: "Academic",
  },
  {
    icon: "💼",
    title: "เอกสารธุรกิจและการบริหาร",
    sample: "ประสิทธิภาพ หรือ ประสิทธิผล ต่างกันอย่างไร",
    tag: "Business",
  },
  {
    icon: "🏛️",
    title: "ระเบียบงานสารบรรณราชการ",
    sample: "ช่วยตรวจภาษาประโยคนี้ให้หน่อย: ระบบนี้สามารถที่จะทำการประมวลผลได้อย่างรวดเร็ว",
    tag: "Government",
  },
  {
    icon: "🌐",
    title: "การสื่อสารสากลข้ามวัฒนธรรม",
    sample: "คำว่า เกรงใจ แปลเป็นภาษาอังกฤษและมีบริบททางวัฒนธรรมอย่างไร",
    tag: "Cultural Bridge",
  },
];

export default function WorkspaceView() {
  const [query, setQuery] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [selectedContext, setSelectedContext] = useState<string>("academic");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<WorkspaceResponsePayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeDraft, setActiveDraft] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Initialize session id
  useEffect(() => {
    setSessionId(`session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
  }, []);

  // Synchronize draft text whenever a result arrives with generated content
  useEffect(() => {
    if (currentResult?.generated_content && currentResult.generated_content.length > 0) {
      setActiveDraft(currentResult.generated_content[0].content);
    }
  }, [currentResult]);

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
      current_text: activeDraft || currentResult?.generated_content?.[0]?.content,
      selected_words: currentResult?.recommendations?.map((r) => r.word),
    };

    try {
      const response = await executeWorkspace(payload);
      setCurrentResult(response);
      if (messageToSend) {
        setQuery("");
      }
      setTimeout(() => {
        if (typeof resultsRef.current?.scrollIntoView === "function") {
          resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
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
    setActiveDraft("");
    setErrorMessage(null);
    showToast("เริ่มเซสชันใหม่เรียบร้อยแล้ว");
  };

  const handleDraftSpeak = () => {
    if (!activeDraft) return;
    audioManager.toggle({
      headword: activeDraft,
      pronunciation: { phonetic: activeDraft, locale: "th-TH" },
      pos: "ข้อความ",
      definition: "",
    } as unknown as Recommendation);
  };

  const handleDraftCopy = () => {
    if (!activeDraft) return;
    navigator.clipboard?.writeText(activeDraft);
    showToast("คัดลอกข้อความร่างลงคลิปบอร์ดแล้ว");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-cyan-950 text-cyan-200 border border-cyan-500/60 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Workspace Banner & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 text-sky-400 border border-sky-800/60 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Unified AI Language Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-100 to-indigo-300">
              THAI CONTEXT Workspace
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              &ldquo;ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน&rdquo; — ค้นพบ เปรียบเทียบ แต่งประโยค เรียบเรียง และตรวจทานภาษาไทยในพื้นที่เดียว
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleResetSession}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all shadow-sm flex items-center gap-1.5"
              title="เริ่มเซสชันใหม่ เคลียร์บริบทที่จำไว้"
            >
              <span>🔄</span>
              <span>เริ่มเซสชันใหม่</span>
            </button>
          </div>
        </div>

        {/* Guided Workflow Stepper */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between overflow-x-auto gap-2 text-xs font-medium text-slate-400 pb-1 sm:pb-0">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold whitespace-nowrap">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-[10px]">1</span>
              <span>ระบุเจตนา</span>
            </div>
            <span className="text-slate-600">➔</span>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center text-[10px]">2</span>
              <span>ค้นพบคำศัพท์</span>
            </div>
            <span className="text-slate-600">➔</span>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center text-[10px]">3</span>
              <span>เปรียบเทียบเฉด</span>
            </div>
            <span className="text-slate-600">➔</span>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center text-[10px]">4</span>
              <span>แต่งและเรียบเรียง</span>
            </div>
            <span className="text-slate-600">➔</span>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center text-[10px]">5</span>
              <span>ตรวจทานภาษา</span>
            </div>
          </div>
        </div>

        {/* Query Input Section */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl">
          {/* Context Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">ระดับบริบท:</span>
              {(["academic", "business", "government", "casual"] as const).map((ctx) => (
                <button
                  key={ctx}
                  type="button"
                  onClick={() => setSelectedContext(ctx)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                    selectedContext === ctx
                      ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/50"
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
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
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
              className="w-full p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-sm sm:text-base leading-relaxed resize-none shadow-inner"
            />

            <div className="flex items-center justify-between mt-3 pt-2">
              <span className="text-xs text-slate-400 hidden sm:inline">
                กด <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-mono">Ctrl + Enter</kbd> เพื่อประมวลผลทันที
              </span>

              <button
                type="button"
                disabled={isLoading || !query.trim()}
                onClick={() => handleSend()}
                className={`ml-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                  isLoading || !query.trim()
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 hover:scale-[1.01]"
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
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <span>💡</span> ตัวอย่างสถานการณ์จำลอง (One-Click Demo):
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {DEMO_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(preset.query);
                    handleSend(preset.query, preset.context);
                  }}
                  className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/60 hover:border-sky-500/50 transition-all text-left group"
                >
                  <div className="text-xs font-bold text-sky-300 group-hover:text-cyan-300 mb-0.5">
                    {preset.label}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {preset.query}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-rose-950/60 border border-rose-600 text-rose-200 text-sm shadow-xl"
          >
            {errorMessage}
          </div>
        )}

        {/* Interactive Drafting Studio Box (If Draft exists) */}
        {activeDraft && (
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-cyan-800/50 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">📝</span>
                <h3 className="text-sm sm:text-base font-bold text-cyan-300">
                  สมุดร่างข้อความที่ใช้งานอยู่ (Active Drafting Studio)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono">
                  {activeDraft.length} ตัวอักษร
                </span>
                <button
                  type="button"
                  onClick={handleDraftSpeak}
                  className="text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1"
                >
                  🔊 ฟังเสียง
                </button>
                <button
                  type="button"
                  onClick={handleDraftCopy}
                  className="text-xs px-3 py-1 rounded-lg bg-sky-900/60 hover:bg-sky-800 text-sky-200 border border-sky-700 transition-colors flex items-center gap-1 font-semibold"
                >
                  📋 คัดลอก
                </button>
              </div>
            </div>

            <textarea
              value={activeDraft}
              onChange={(e) => setActiveDraft(e.target.value)}
              rows={3}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm sm:text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />

            {/* Instant Action Pills for Active Draft */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400 mr-1">สั่ง AI ปรับแต่งข้อความนี้ทันที:</span>
              <button
                type="button"
                onClick={() => handleSend("ทำให้สั้นลงและกระชับขึ้น")}
                className="px-3 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                ✂️ ทำให้สั้นลง
              </button>
              <button
                type="button"
                onClick={() => handleSend("ปรับให้เป็นทางการตามระเบียบงานสารบรรณ")}
                className="px-3 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                🏛️ ปรับให้เป็นภาษาทางการ
              </button>
              <button
                type="button"
                onClick={() => handleSend("ปรับให้เป็นภาษาเขียนเชิงวิชาการ")}
                className="px-3 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                🎓 เชิงวิชาการ
              </button>
              <button
                type="button"
                onClick={() => handleSend("ช่วยตรวจภาษาและคำซ้ำซ้อน")}
                className="px-3 py-1 text-xs rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 transition-colors font-medium"
              >
                🔍 ตรวจสอบคำซ้ำซ้อน
              </button>
            </div>
          </div>
        )}

        {/* Empty State / Inspiration Showcase when no results yet */}
        {!currentResult && !isLoading && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80">
            <h3 className="text-base font-bold text-slate-200 mb-1">
              ✨ คลังแรงบันดาลใจและรูปแบบการใช้งาน (Use-Case Inspiration)
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-5">
              เลือกสถานการณ์ที่ตรงกับความต้องการของคุณเพื่อเริ่มต้นทันที:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {USE_CASES.map((uc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setQuery(uc.sample);
                    handleSend(uc.sample);
                  }}
                  className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 text-left border border-slate-800 hover:border-sky-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{uc.icon}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {uc.tag}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-1">
                    {uc.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    &ldquo;{uc.sample}&rdquo;
                  </p>
                </button>
              ))}
            </div>
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
                activeDraftText={activeDraft}
                onUpdateDraft={setActiveDraft}
              />

              {/* Continuation Action Bar */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
                <span className="text-xs font-bold text-slate-300 block mb-3 flex items-center gap-1.5">
                  <span>⚡</span> ขั้นตอนถัดไปที่คุณสามารถทำต่อได้ทันที (Next Actions):
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSend("ทำให้สั้นลงและกระชับขึ้น")}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                  >
                    ✂️ ทำให้สั้นลง
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend("ปรับให้เป็นทางการตามระเบียบงานสารบรรณ")}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                  >
                    🏛️ ปรับให้เป็นภาษาทางการ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend("ช่วยตรวจภาษาและคำซ้ำซ้อน")}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                  >
                    🔍 ตรวจสอบคำซ้ำซ้อน
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend("แปลเป็นภาษาอังกฤษและอธิบายบริบทวัฒนธรรม")}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
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
