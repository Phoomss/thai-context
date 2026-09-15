"use client";

import React, { useState, useEffect, useRef } from "react";
import AgentPipelineStatus from "./AgentPipelineStatus";
import WorkspaceResultCard, { type WorkspaceResultTab } from "./WorkspaceResultCard";
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
  {
    label: "♿ ตรวจสอบการเข้าถึง & ภาษามือ",
    desc: "ตรวจทานความพร้อมด้านการเข้าถึง แปลงเบรลล์ และค้นหาท่าภาษามือไทย",
    query: "ช่วยตรวจสอบข้อความประกาศต้อนรับนักศึกษาสำหรับผู้พิการและแปลงเป็นอักษรเบรลล์",
    context: { type: "academic", tone: "formal", audience: "นักศึกษาและผู้พิการ" },
  },
  {
    label: "⠠ แปลงเป็นอักษรเบรลล์ไทย",
    desc: "แปลงคำศัพท์ภาษาไทยเป็น Unicode Braille และคู่มือการสะกดจุดมาตรฐาน",
    query: "แสดงคำว่า สวัสดี และ ต้อนรับ ในรูปแบบอักษรเบรลล์ไทย",
    context: { type: "academic", tone: "formal", audience: "ผู้บกพร่องทางการมองเห็น" },
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
  {
    icon: "♿",
    title: "การเข้าถึงและการสื่อสารเพื่อคนพิการ",
    sample: "ช่วยตรวจสอบข้อความประกาศต้อนรับนักศึกษาสำหรับผู้พิการและแปลงเป็นอักษรเบรลล์",
    tag: "Accessibility Layer",
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

  // Interactive 5-Step Workflow & Filter Tab state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<WorkspaceResultTab>("all");

  const resultsRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  useEffect(() => {
    setSessionId(`session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
  }, []);

  useEffect(() => {
    if (currentResult?.generated_content && currentResult.generated_content.length > 0) {
      setActiveDraft(currentResult.generated_content[0].content);
    } else if (currentResult?.answer && !currentResult.abstained) {
      setActiveDraft(currentResult.answer);
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
        setQuery(messageToSend);
      }

      const isAccessQuery = /เบรลล์|ภาษามือ|คนพิการ|ผู้พิการ|การเข้าถึง|accessibility|braille|sign/i.test(text);
      if (response.accessibility_layer && isAccessQuery) {
        setCurrentStep(6);
        setActiveTab("access");
        showToast("เปิดแท็บ ♿ การเข้าถึง: ตรวจสอบภาษามือและแปลงเบรลล์เรียบร้อย");
      } else if (response.language_check) {
        setCurrentStep(5);
        setActiveTab("all");
      } else if (response.generated_content && response.generated_content.length > 0) {
        setCurrentStep(4);
        setActiveTab("all");
      } else if (response.comparison) {
        setCurrentStep(3);
        setActiveTab("all");
      } else if (response.recommendations && response.recommendations.length > 0) {
        setCurrentStep(2);
        setActiveTab("all");
      } else if (response.accessibility_layer) {
        setCurrentStep(6);
        setActiveTab("access");
        showToast("เปิดแท็บ ♿ การเข้าถึง: ตรวจสอบภาษามือและแปลงเบรลล์เรียบร้อย");
      } else {
        setCurrentStep(1);
        setActiveTab("all");
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

  const handleStepClick = (step: number) => {
    setCurrentStep(step);

    if (step === 1) {
      setActiveTab("all");
      textareaRef.current?.focus();
      textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      showToast("สเต็ป 1: ระบุเจตนาหรือความหมายที่ต้องการค้นหา");
    } else if (step === 2) {
      setActiveTab("words");
      if (currentResult && currentResult.recommendations && currentResult.recommendations.length > 0) {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("สเต็ป 2: แสดงคลังคำศัพท์ที่ค้นพบจากพจนานุกรมทางการ");
      } else {
        const sample = "หาคำที่หมายถึงทำงานได้ดีและใช้ทรัพยากรน้อย";
        setQuery(sample);
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        showToast("สเต็ป 2: ค้นพบคำศัพท์ — กรอกตัวอย่างคำค้นแล้ว กดประมวลผลได้ทันที");
      }
    } else if (step === 3) {
      setActiveTab("compare");
      if (currentResult && currentResult.comparison) {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("สเต็ป 3: แสดงตารางเปรียบเทียบเฉดคำและจุดเน้น (Nuance Delta)");
      } else {
        const sample = "ประสิทธิภาพ หรือ ประสิทธิผล ต่างกันอย่างไร";
        setQuery(sample);
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        showToast("สเต็ป 3: เปรียบเทียบเฉดคำ — กรอกตัวอย่างคำถามเปรียบเทียบแล้ว");
      }
    } else if (step === 4) {
      setActiveTab("writing");
      if (currentResult && currentResult.generated_content && currentResult.generated_content.length > 0) {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("สเต็ป 4: แสดงข้อความที่แต่งและปรับแต่งตามบริบท");
      } else {
        const sample = "แต่งประโยคคำว่า ประสิทธิภาพ สำหรับรายงานวิชาการ";
        setQuery(sample);
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        showToast("สเต็ป 4: แต่งและเรียบเรียง — กรอกตัวอย่างการสั่งแต่งประโยคแล้ว");
      }
    } else if (step === 5) {
      setActiveTab("check");
      if (currentResult && currentResult.language_check) {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("สเต็ป 5: แสดงผลตรวจทานความสละสลวยและคำซ้ำซ้อน");
      } else {
        const sample = activeDraft.trim()
          ? `ช่วยตรวจภาษาข้อความนี้: ${activeDraft}`
          : "ช่วยตรวจภาษาประโยคนี้ให้หน่อย: ระบบนี้สามารถที่จะทำการประมวลผลได้อย่างรวดเร็ว";
        setQuery(sample);
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        showToast("สเต็ป 5: ตรวจทานภาษา — พร้อมส่งให้ AI ตรวจสอบไวยากรณ์และความเยิ่นเย้อ");
      }
    } else if (step === 6) {
      setActiveTab("access");
      if (currentResult && currentResult.accessibility_layer) {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("สเต็ป 6: แสดงความพร้อมด้านการเข้าถึง ภาษามือไทย และอักษรเบรลล์");
      } else {
        const sample = "ช่วยตรวจสอบข้อความประกาศต้อนรับนักศึกษาสำหรับผู้พิการและแปลงเป็นอักษรเบรลล์";
        setQuery(sample);
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        showToast("สเต็ป 6: การเข้าถึง — กรอกตัวอย่างตรวจสอบภาษามือและแปลงเบรลล์แล้ว");
      }
    }
  };

  const handleResetSession = () => {
    setSessionId(`session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
    setCurrentResult(null);
    setQuery("");
    setActiveDraft("");
    setCurrentStep(1);
    setActiveTab("all");
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
    showToast("คัดลอกข้อความตอบกลับจาก AI ลงคลิปบอร์ดแล้ว");
  };

  return (
    <div className="workspace-hero-wrap">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="workspace-toast" role="status">
          <span style={{ color: "#4ade80", fontWeight: "bold" }}>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Workspace Banner & Header */}
      <div className="workspace-card" style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <div className="workspace-eyebrow">
              <span>✦</span> UNIFIED AI LANGUAGE WORKSPACE
            </div>
            <h1 className="workspace-title" style={{ margin: "6px 0 8px" }}>
              THAI CONTEXT Workspace
            </h1>
            <p className="workspace-desc">
              &ldquo;ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน&rdquo; — ค้นพบ เปรียบเทียบ แต่งประโยค เรียบเรียง และตรวจทานภาษาไทยในพื้นที่เดียว
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={handleResetSession}
              className="workspace-nav-btn"
              title="เริ่มเซสชันใหม่ เคลียร์บริบทที่จำไว้"
            >
              <span>🔄</span>
              <span>เริ่มเซสชันใหม่</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Guided Workflow Stepper */}
      <div className="workspace-stepper" role="navigation" aria-label="ขั้นตอนการทำงาน">
        <button
          type="button"
          onClick={() => handleStepClick(1)}
          className={`workspace-step-item ${currentStep === 1 ? "active" : ""}`}
          title="คลิกเพื่อไประบุเจตนาการใช้งาน"
        >
          <span className="workspace-step-num">1</span>
          <span>ระบุเจตนา</span>
        </button>
        <button
          type="button"
          onClick={() => handleStepClick(2)}
          className={`workspace-step-item ${currentStep === 2 ? "active" : ""}`}
          title="คลิกเพื่อดูคลังคำศัพท์ที่ค้นพบ"
        >
          <span className="workspace-step-num">2</span>
          <span>ค้นพบคำศัพท์</span>
        </button>
        <button
          type="button"
          onClick={() => handleStepClick(3)}
          className={`workspace-step-item ${currentStep === 3 ? "active" : ""}`}
          title="คลิกเพื่อดูการเปรียบเทียบเฉดคำ"
        >
          <span className="workspace-step-num">3</span>
          <span>เปรียบเทียบเฉด</span>
        </button>
        <button
          type="button"
          onClick={() => handleStepClick(4)}
          className={`workspace-step-item ${currentStep === 4 ? "active" : ""}`}
          title="คลิกเพื่อดูข้อความที่แต่งและเรียบเรียง"
        >
          <span className="workspace-step-num">4</span>
          <span>แต่งและเรียบเรียง</span>
        </button>
        <button
          type="button"
          onClick={() => handleStepClick(5)}
          className={`workspace-step-item ${currentStep === 5 ? "active" : ""}`}
          title="คลิกเพื่อดูการตรวจทานภาษาและความสละสลวย"
        >
          <span className="workspace-step-num">5</span>
          <span>ตรวจทานภาษา</span>
        </button>
        <button
          type="button"
          onClick={() => handleStepClick(6)}
          className={`workspace-step-item ${currentStep === 6 ? "active" : ""}`}
          title="คลิกเพื่อดูความพร้อมด้านการเข้าถึง ภาษามือไทย และอักษรเบรลล์"
        >
          <span className="workspace-step-num">6</span>
          <span>♿ การเข้าถึง</span>
        </button>
      </div>

      {/* Main 2-Column Grid Layout */}
      <div className="workspace-grid-layout">
        {/* Left Column: Input Form & Results */}
        <div>
          {/* Query Input Section */}
          <div className="workspace-card">
            {/* Context Selector Bar */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>ระดับบริบท:</span>
                {(["academic", "business", "government", "casual"] as const).map((ctx) => (
                  <button
                    key={ctx}
                    type="button"
                    onClick={() => setSelectedContext(ctx)}
                    className={`workspace-context-pill ${selectedContext === ctx ? "active" : ""}`}
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
                <span style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--text-muted)" }}>
                  ID: {sessionId.substring(0, 14)}...
                </span>
              )}
            </div>

            {/* Textarea Composer */}
            <div className="workspace-textarea-wrap">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="พิมพ์เจตนาที่ต้องการ เช่น 'หาคำที่หมายถึงทำงานได้ดีและใช้ทรัพยากรน้อย' หรือ 'แต่งประโยคคำว่า ประสิทธิภาพ สำหรับรายงานวิชาการ'..."
                className="workspace-textarea"
                rows={3}
              />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  กด <kbd style={{ padding: "2px 6px", borderRadius: "6px", background: "#edf2f7", border: "1px solid #cbd5e1", fontSize: "11px", fontFamily: "monospace" }}>Ctrl + Enter</kbd> เพื่อประมวลผลทันที
                </span>

                <button
                  type="button"
                  disabled={isLoading || !query.trim()}
                  onClick={() => handleSend()}
                  className="workspace-submit-btn"
                  style={{ width: "auto", minWidth: "200px" }}
                >
                  {isLoading ? (
                    <>
                      <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
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
            <div style={{ marginTop: "20px", paddingTop: "18px", borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "10px" }}>
                💡 ตัวอย่างสถานการณ์จำลอง (One-Click Demo):
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
                {DEMO_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(preset.query);
                      if (preset.context?.type) {
                        setSelectedContext(preset.context.type);
                      }
                      handleSend(preset.query, preset.context);
                    }}
                    className="workspace-draft-btn"
                    style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px", padding: "10px 14px", height: "auto", textAlign: "left" }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent)" }}>
                      {preset.label}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                      {preset.query}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error Notification */}
          {errorMessage && (
            <div
              role="alert"
              className="workspace-card"
              style={{ background: "#fff5f5", borderColor: "#feb2b2", color: "#c53030" }}
            >
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>เกิดข้อผิดพลาด</div>
              <div style={{ fontSize: "14px" }}>{errorMessage}</div>
            </div>
          )}

          {/* Active Loading State Banner */}
          {isLoading && (
            <div
              className="workspace-card"
              style={{
                marginTop: "16px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)",
                border: "1px solid #bfdbfe",
                padding: "20px 24px",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  border: "3px solid #3b82f6",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: "14px" }}>
                  กำลังประมวลผลคำสั่งด้วย AI Multi-Agent Pipeline...
                </div>
                <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "3px" }}>
                  วิเคราะห์เฉดคำ ค้นหาท่าภาษามือไทย และแปลงเป็นอักษรเบรลล์มาตรฐาน
                </div>
              </div>
            </div>
          )}

          {/* Empty State / Inspiration Showcase when no results yet */}
          {!currentResult && !isLoading && (
            <div className="workspace-card" style={{ background: "#fbfdff" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--ink)", margin: "0 0 6px" }}>
                ✨ คลังแรงบันดาลใจและรูปแบบการใช้งาน (Use-Case Inspiration)
              </h3>
              <p style={{ fontSize: "14px", color: "var(--muted)", margin: "0 0 18px" }}>
                เลือกสถานการณ์ที่ตรงกับความต้องการของคุณเพื่อเริ่มต้นทันที:
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                {USE_CASES.map((uc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setQuery(uc.sample);
                      handleSend(uc.sample);
                    }}
                    className="workspace-word-card"
                    style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--border)" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "24px" }}>{uc.icon}</span>
                      <span className="workspace-badge-tag" style={{ fontSize: "10px", padding: "2px 8px" }}>
                        {uc.tag}
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "var(--ink)", marginBottom: "4px" }}>
                      {uc.title}
                    </strong>
                    <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                      &ldquo;{uc.sample}&rdquo;
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results View Container */}
          <div ref={resultsRef} style={{ marginTop: "24px" }}>
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
                  activeTab={activeTab}
                  onTabChange={(tab) => {
                    setActiveTab(tab);
                    if (tab === "words") setCurrentStep(2);
                    else if (tab === "compare") setCurrentStep(3);
                    else if (tab === "writing") setCurrentStep(4);
                    else if (tab === "check") setCurrentStep(5);
                    else if (tab === "access") setCurrentStep(6);
                    else setCurrentStep(1);
                  }}
                />

                {/* Continuation Action Bar */}
                <div className="workspace-card" style={{ marginTop: "24px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "12px" }}>
                    ⚡ ขั้นตอนถัดไปที่คุณสามารถทำต่อได้ทันที (Next Actions):
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {currentResult?.accessibility_layer && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("access");
                          setCurrentStep(6);
                          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="workspace-draft-btn"
                        style={{ color: "var(--accent)", fontWeight: 700, borderColor: "#bfdbfe", background: "#f0fdf4" }}
                      >
                        ♿ ดูผลความพร้อมการเข้าถึงและเบรลล์
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSend("ทำให้สั้นลงและกระชับขึ้น")}
                      className="workspace-draft-btn"
                    >
                      ✂️ ทำให้สั้นลง
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSend("ปรับให้เป็นทางการตามระเบียบงานสารบรรณ")}
                      className="workspace-draft-btn"
                    >
                      🏛️ ปรับให้เป็นภาษาทางการ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSend("ช่วยตรวจภาษาและคำซ้ำซ้อน")}
                      className="workspace-draft-btn"
                    >
                      🔍 ตรวจสอบคำซ้ำซ้อน
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSend("แปลเป็นภาษาอังกฤษและอธิบายบริบทวัฒนธรรม")}
                      className="workspace-draft-btn"
                    >
                      🌐 อธิบายเป็นภาษาอังกฤษ (Cross-Cultural)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: AI Response Studio */}
        <div>
          <div className="workspace-draft-studio">
            <div className="workspace-draft-header">
              <h3 className="workspace-draft-title">
                <span>🤖</span> หน้าต่างตอบกลับจาก AI (AI Response)
              </h3>
              {isLoading ? (
                <span className="workspace-ai-status-badge is-loading">
                  กำลังประมวลผล...
                </span>
              ) : currentResult ? (
                <span className="workspace-ai-status-badge is-ready">
                  ✓ AI ตอบกลับแล้ว ({activeDraft.length} ตัวอักษร)
                </span>
              ) : (
                <span className="workspace-ai-status-badge is-idle">
                  พร้อมรับคำสั่ง
                </span>
              )}
            </div>

            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.5 }}>
              แสดงข้อความตอบกลับ ผลการเรียบเรียงประโยค และคำแนะนำเชิงลึกจาก AI อิงข้อมูลพจนานุกรมทางการ
            </p>

            {isLoading && (
              <div style={{ padding: "18px 14px", textAlign: "center", background: "#f8fafd", border: "1px dashed #bfdbfe", borderRadius: "14px", marginBottom: "12px" }}>
                <div style={{ margin: "0 auto 8px", width: "22px", height: "22px", border: "2.5px solid #dbeafe", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent)" }}>
                  AI กำลังวิเคราะห์และเรียบเรียงข้อความตอบกลับ...
                </div>
              </div>
            )}

            {currentResult?.answer && (
              <div style={{ padding: "10px 14px", background: "#f0f7ff", border: "1px solid #c7ddf5", borderRadius: "12px", marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent)", marginBottom: "4px" }}>
                  💬 สรุปคำตอบจาก AI:
                </div>
                <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: "var(--ink)" }}>
                  {currentResult.answer}
                </p>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <label htmlFor="workspace-ai-response-text" style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink)" }}>
                📝 ข้อความตอบกลับจาก AI:
              </label>
              {activeDraft && (
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>🔒</span> อ่านอย่างเดียว (คัดลอกได้)
                </span>
              )}
            </div>

            <textarea
              id="workspace-ai-response-text"
              value={activeDraft}
              readOnly
              placeholder="ข้อความตอบกลับจาก AI หรือประโยคที่เรียบเรียงจะปรากฏที่นี่ คุณสามารถอ่าน ตรวจทาน และคัดลอกข้อความได้..."
              className="workspace-draft-textarea"
              rows={8}
              style={{
                backgroundColor: "#f8fafd",
                cursor: "default",
                userSelect: "text",
              }}
            />

            <div className="workspace-draft-actions">
              <button
                type="button"
                onClick={handleDraftSpeak}
                disabled={!activeDraft.trim()}
                className="workspace-draft-btn"
                title="ฟังเสียงอ่านคำตอบจาก AI"
              >
                🔊 ฟังเสียง
              </button>
              <button
                type="button"
                onClick={handleDraftCopy}
                disabled={!activeDraft.trim()}
                className="workspace-draft-btn"
                title="คัดลอกคำตอบลงคลิปบอร์ด"
                style={{ fontWeight: 600, color: "var(--accent)" }}
              >
                📋 คัดลอก
              </button>
              <button
                type="button"
                onClick={() => setActiveDraft("")}
                disabled={!activeDraft}
                className="workspace-draft-btn"
                title="ล้างข้อความตอบกลับ"
              >
                🗑️ ล้าง
              </button>
            </div>

            {/* Quick Actions for AI Response Text */}
            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px" }}>
                ⚡ สั่ง AI ปรับปรุงข้อความตอบกลับนี้ต่อ:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <button
                  type="button"
                  disabled={!activeDraft.trim() || isLoading}
                  onClick={() => handleSend("ทำให้สั้นลงและกระชับขึ้น")}
                  className="workspace-draft-btn"
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                >
                  ✂️ ทำให้สั้นลง
                </button>
                <button
                  type="button"
                  disabled={!activeDraft.trim() || isLoading}
                  onClick={() => handleSend("ปรับให้เป็นทางการตามระเบียบงานสารบรรณ")}
                  className="workspace-draft-btn"
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                >
                  🏛️ ภาษาทางการ
                </button>
                <button
                  type="button"
                  disabled={!activeDraft.trim() || isLoading}
                  onClick={() => handleSend("ปรับให้เป็นภาษาเขียนเชิงวิชาการ")}
                  className="workspace-draft-btn"
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                >
                  🎓 เชิงวิชาการ
                </button>
                <button
                  type="button"
                  disabled={!activeDraft.trim() || isLoading}
                  onClick={() => handleSend("ช่วยตรวจภาษาและคำซ้ำซ้อน")}
                  className="workspace-draft-btn"
                  style={{ fontSize: "11px", padding: "4px 8px", color: "var(--green)" }}
                >
                  🔍 ตรวจสอบคำซ้ำซ้อน
                </button>
                <button
                  type="button"
                  disabled={!activeDraft.trim()}
                  onClick={() => handleSend(`ช่วยตรวจสอบการเข้าถึงและแปลงเป็นเบรลล์: ${activeDraft}`)}
                  className="workspace-draft-btn"
                  style={{ fontSize: "11px", padding: "4px 8px", color: "var(--accent)" }}
                >
                  ♿ ตรวจการเข้าถึง & เบรลล์
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
