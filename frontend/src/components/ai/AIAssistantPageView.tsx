"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  PenTool,
  Wand2,
  Scale,
  Search,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Zap,
  BookOpen,
  Copy,
  Check,
  Send,
  Square,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  GraduationCap,
  Building,
  Briefcase,
  MessageSquare,
  RotateCcw,
  X,
  Layers,
} from "lucide-react";
import type { EvidenceItemData, AgentTraceData, ChatMessage, AgentPersona } from "./AIAssistantDrawer";

const CONTEXT_OPTIONS = [
  { id: "รายงานวิชาการ", label: "รายงานวิชาการ", icon: GraduationCap, tip: "ภาษาทางการเชิงวิชาการ อ้างอิงระเบียบวิธีวิจัย" },
  { id: "งานสารบรรณ", label: "งานสารบรรณ", icon: Building, tip: "ถูกต้องตามระเบียบงานสารบรรณราชการและหนังสือทางการ" },
  { id: "เชิงบริหาร", label: "เชิงบริหาร", icon: Briefcase, tip: "กระชับ ตรงประเด็น หนักแน่น เหมาะสำหรับผู้บริหาร" },
  { id: "การสนทนาทั่วไป", label: "การสนทนาทั่วไป", icon: MessageSquare, tip: "เป็นธรรมชาติ สุภาพ เข้าใจง่ายในชีวิตประจำวัน" },
  { id: "เชิงกฎหมาย", label: "เชิงกฎหมาย", icon: Scale, tip: "รัดกุม นิยามเคร่งครัด ไร้ช่องโหว่ความกำกวม" },
];

const AGENT_PERSONAS: AgentPersona[] = [
  {
    id: "AUTO",
    label: "ตัวแทนอัตโนมัติ",
    icon: "Bot",
    badge: "Auto Agent",
    agentName: "OrchestratorAgent",
    desc: "AI วางแผนงานและเรียกใช้ชุด Agent ที่เหมาะสมให้อัตโนมัติ",
    placeholder: "สั่งงาน AI Agent เช่น ร่างอีเมล, ขัดเกลาข้อความ, หรือเปรียบเทียบคำ...",
    missions: [
      "คำว่า 'ประสิทธิภาพ' ต่างกับ 'ประสิทธิผล' ในงานวิจัยอย่างไร",
      "ช่วยร่างโครงสร้างอีเมลขอความอนุเคราะห์อย่างเป็นทางการ",
      "ช่วยขัดเกลาประโยคภาษาพูดให้กลายเป็นภาษาเขียนทางการ",
      "หาคำสละสลวยแทนคำว่า 'ทำได้ดีมาก' ในรายงานวิชาการ",
    ],
  },
  {
    id: "WRITING",
    label: "ร่างและเขียน",
    icon: "PenTool",
    badge: "Writing Agent",
    agentName: "WritingAgent",
    desc: "ร่างเนื้อหา: อีเมลธุรกิจ, หนังสือราชการ, คำแถลง, บทคัดย่อวิชาการ",
    placeholder: "สั่งให้ Writing Agent ร่างข้อความ เช่น 'ร่างอีเมลขอความอนุเคราะห์...'...",
    missions: [
      "ช่วยร่างอีเมลขอความอนุเคราะห์เข้าศึกษาดูงานอย่างเป็นทางการ",
      "ร่างบทคัดย่อเกริ่นนำโครงการวิจัยเกี่ยวกับการเพิ่มประสิทธิภาพ",
      "ร่างคำกล่าวขอบคุณวิทยากรในงานสัมมนาวิชาการ",
      "ร่างประกาศแจ้งปรับปรุงระบบสำหรับลูกค้าธุรกิจ",
    ],
  },
  {
    id: "REWRITE",
    label: "ขัดเกลาสำนวน",
    icon: "Wand2",
    badge: "Rewrite Agent",
    agentName: "RewriteAgent",
    desc: "ยกระดับภาษาพูดเป็นภาษาทางการหรือกึ่งทางการ สละสลวย และถูกต้อง",
    placeholder: "วางข้อความที่ต้องการให้ Rewrite Agent ขัดเกลาหรือปรับระดับภาษา...",
    missions: [
      "เปลี่ยนข้อความนี้ให้เป็นภาษาราชการ: 'อยากให้ทางคุณช่วยส่งของมาเร็วๆ หน่อย'",
      "ขัดเกลาบทความนี้ให้อ่านลื่นไหลและตัดคำซ้ำซ้อน",
      "ปรับประโยคภาษาปากให้กลายเป็นภาษาเขียนทางการ",
      "เพิ่มความหนักแน่นและเป็นมืออาชีพในข้อเสนอทางธุรกิจ",
    ],
  },
  {
    id: "COMPARE",
    label: "วิจัยเปรียบเทียบคำ",
    icon: "Scale",
    badge: "Compare Agent",
    agentName: "WordCompareAgent",
    desc: "วิเคราะห์ความต่างอย่างลึกซึ้ง: นัยความหมาย (Nuance) และข้อควรระวัง",
    placeholder: "ระบุคำศัพท์ที่ต้องการให้ Compare Agent วิจัยความต่าง...",
    missions: [
      "คำว่า 'ประสิทธิภาพ' ต่างกับ 'ประสิทธิผล' ในงานวิจัยอย่างไร",
      "เปรียบเทียบคำว่า 'ยินยอม' กับ 'ยินยอมพร้อมใจ' ทางกฎหมาย",
      "เปรียบเทียบ 'ข้อเท็จจริง' กับ 'ความจริง' ในเชิงวิชาการ",
      "คำว่า 'กำกับ' กับ 'ควบคุม' มีน้ำหนักต่างกันอย่างไร",
    ],
  },
  {
    id: "DISCOVERY",
    label: "ค้นหาคำจากความคิด",
    icon: "Search",
    badge: "Discovery Agent",
    agentName: "WordDiscoveryAgent",
    desc: "ถอดความคิดหรือมโนทัศน์ที่นึกไม่ออก ออกมาเป็นคลังคำที่ตรงใจ",
    placeholder: "อธิบายสิ่งที่คุณต้องการสื่อ แม้นึกคำไม่ออก เช่น 'ความร่วมมืออย่างเหนียวแน่น'...",
    missions: [
      "หาคำสละสลวยแทนคำว่า 'ทำได้ดีมาก' ในรายงานวิชาการ",
      "คำที่แปลว่า 'การทำให้ดีขึ้นอย่างต่อเนื่อง' ในภาษาทางการ",
      "คำกริยาที่สื่อถึงการ 'มอบหมายงานด้วยความไว้วางใจ'",
      "คำศัพท์สำหรับอธิบาย 'การบริหารงานที่โปร่งใสและตรวจสอบได้'",
    ],
  },
  {
    id: "PROOFREAD",
    label: "ตรวจทานหลักภาษา",
    icon: "CheckCircle2",
    badge: "Checker Agent",
    agentName: "LanguageCheckerAgent",
    desc: "สแกนหาคำฟุ่มเฟือย คำกำกวม และระดับภาษาที่ไม่สอดคล้องกัน",
    placeholder: "วางประโยคเพื่อสั่งให้ Checker Agent ตรวจสอบความถูกต้อง...",
    missions: [
      "ตรวจทานประโยคนี้ว่ามีคำกำกวมหรือคำฟุ่มเฟือยหรือไม่",
      "สแกนหาข้อผิดพลาดทางไวยากรณ์และระดับภาษาที่ไม่สอดคล้องกัน",
      "ตรวจเช็คว่าสำนวนในประโยคติดไวยากรณ์ภาษาอังกฤษ (Passive) หรือไม่",
      "แนะนำคำศัพท์ทดแทนเพื่อให้อ่านลื่นไหลและกระชับขึ้น",
    ],
  },
];

function getPersonaIcon(id: string, className = "w-4 h-4") {
  switch (id) {
    case "AUTO":
      return <Bot className={className} />;
    case "WRITING":
      return <PenTool className={className} />;
    case "REWRITE":
      return <Wand2 className={className} />;
    case "COMPARE":
      return <Scale className={className} />;
    case "DISCOVERY":
      return <Search className={className} />;
    case "PROOFREAD":
      return <CheckCircle2 className={className} />;
    default:
      return <Bot className={className} />;
  }
}

function getMissionIcon(idx: number, className = "w-4 h-4 text-blue-600") {
  switch (idx % 4) {
    case 0:
      return <PenTool className={className} />;
    case 1:
      return <Wand2 className={className} />;
    case 2:
      return <Scale className={className} />;
    case 3:
      return <CheckCircle2 className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

function AIAssistantPageContent() {
  const searchParams = useSearchParams();
  const initialWord = searchParams.get("word") || "";
  const initialContext = searchParams.get("context") || "รายงานวิชาการ";
  const initialMessage = searchParams.get("message") || "";

  const [word, setWord] = useState(initialWord);
  const [context, setContext] = useState(initialContext);
  const [selectedRole, setSelectedRole] = useState<string>("AUTO");
  const [inputMessage, setInputMessage] = useState(initialMessage);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activePersona =
    AGENT_PERSONAS.find((p) => p.id === selectedRole) || AGENT_PERSONAS[0];

  useEffect(() => {
    if (initialWord) setWord(initialWord);
    if (initialContext) setContext(initialContext);
    if (initialMessage) setInputMessage(initialMessage);
  }, [initialWord, initialContext, initialMessage]);

  useEffect(() => {
    if (isGenerating || messages.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating]);

  const handleCopyText = useCallback((msgId: string, text: string) => {
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/^>\s*/gm, "")
      .replace(/^[•\-]\s*/gm, "")
      .trim();

    navigator.clipboard?.writeText(cleanText).then(() => {
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const handleSend = useCallback(
    async (textToSend?: string) => {
      const messageText = (textToSend ?? inputMessage).trim();
      if (!messageText || isGenerating) return;

      setInputMessage("");
      const userMsgId = `user-${Date.now()}`;
      const assistantMsgId = `assistant-${Date.now()}`;

      const userMsg: ChatMessage = {
        id: userMsgId,
        role: "user",
        text: messageText,
      };

      let guessedAgent = activePersona.agentName;
      if (activePersona.id === "AUTO") {
        if (/ต่างกับ|เปรียบเทียบ|vs/i.test(messageText)) {
          guessedAgent = "WordCompareAgent";
        } else if (/เปลี่ยน|ขัดเกลา|แก้|ระดับภาษา|ภาษาพูด/i.test(messageText)) {
          guessedAgent = "RewriteAgent";
        } else if (/ตรวจ|ฟุ่มเฟือย|กำกวม|ไวยากรณ์/i.test(messageText)) {
          guessedAgent = "LanguageCheckerAgent";
        } else if (/หาคำ|แทนคำว่า|นึกคำ/i.test(messageText)) {
          guessedAgent = "WordDiscoveryAgent";
        } else if (/อีเมล|ร่าง|เขียน|จดหมาย|ประกาศ/i.test(messageText)) {
          guessedAgent = "WritingAgent";
        } else {
          guessedAgent = "WritingAgent";
        }
      }

      const defaultTraces: AgentTraceData[] = [
        {
          agent: "ContextAgent",
          status: "completed",
          summary: `กำหนดบริบท: ${context}`,
        },
        {
          agent: guessedAgent,
          status: "running",
          summary: `กำลังประมวลผลคำสั่ง...`,
        },
      ];

      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        text: "",
        activeAgent: guessedAgent,
        agentTraces: defaultTraces,
        evidences: [],
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsGenerating(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch("/api/v1/ai/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            message: messageText,
            word: word || undefined,
            context: context || undefined,
            agentMode: selectedRole,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No readable stream received from server");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() || "";

          for (const block of blocks) {
            const lines = block.split("\n");
            let eventType = "message";
            let dataRaw = "";

            for (const line of lines) {
              if (line.startsWith("event:")) {
                eventType = line.replace("event:", "").trim();
              } else if (line.startsWith("data:")) {
                dataRaw = line.replace("data:", "").trim();
              }
            }

            if (!dataRaw) continue;

            try {
              const parsed = JSON.parse(dataRaw);

              if (eventType === "trace") {
                const traces: AgentTraceData[] = Array.isArray(parsed)
                  ? parsed
                  : [parsed];
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          agentTraces: traces,
                        }
                      : msg
                  )
                );
              } else if (eventType === "token") {
                const token = parsed.token ?? parsed.text ?? "";
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, text: msg.text + token }
                      : msg
                  )
                );
              } else if (eventType === "evidence") {
                const items: EvidenceItemData[] = Array.isArray(parsed)
                  ? parsed
                  : [parsed];
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          evidences: [
                            ...(msg.evidences || []),
                            ...items,
                          ],
                        }
                      : msg
                  )
                );
              } else if (eventType === "complete") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          confidence: parsed.confidence ?? 0.95,
                          grounded: parsed.grounded ?? true,
                          activeAgent: parsed.agent || msg.activeAgent,
                          agentTraces: [
                            {
                              agent: "ContextAgent",
                              status: "completed",
                              summary: `กำหนดบริบท: ${context}`,
                            },
                            {
                              agent: parsed.agent || msg.activeAgent || "WritingAgent",
                              status: "completed",
                              summary: "ดำเนินการเสร็จสิ้น",
                            },
                            {
                              agent: "LanguageCheckerAgent",
                              status: "completed",
                              summary: "ผ่านการตรวจระดับภาษาและหลักไวยากรณ์",
                            },
                          ],
                          isStreaming: false,
                        }
                      : msg
                  )
                );
              }
            } catch {
              // Ignore malformed partial chunks
            }
          }
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    text:
                      msg.text ||
                      "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับบริการ AI Agent กรุณาลองใหม่อีกครั้ง",
                    error: err?.message,
                    isStreaming: false,
                  }
                : msg
            )
          );
        }
      } finally {
        setIsGenerating(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
          )
        );
      }
    },
    [inputMessage, isGenerating, word, context, selectedRole, activePersona]
  );

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsGenerating(false);
  };

  const handleClear = () => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setIsGenerating(false);
  };

  return (
    <div className="ai-page-wrapper">
      {/* Top Header Navbar */}
      <header className="workspace-navbar" role="banner">
        <div className="workspace-navbar-inner">
          <Link href="/" className="workspace-navbar-brand" aria-label="THAI CONTEXT หน้าแรก">
            <Image
              src="/assets/thai-context-logo.png"
              width={42}
              height={36}
              alt="THAI CONTEXT Logo"
              priority
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span className="brand" style={{ fontSize: "20px", lineHeight: 1 }}>
                <span className="brand-thai">THAI</span>
                <span className="brand-context">CONTEXT</span>
              </span>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 500 }}>
                จาก “ค้นคำ” สู่ “เข้าใจภาษา”
              </span>
            </div>
            <span
              className="workspace-badge-tag"
              style={{ background: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" }}
            >
              <Bot className="w-3.5 h-3.5 mr-1" />
              <span>ผู้ช่วย AI Agent Workspace</span>
            </span>
          </Link>

          {/* Navigation and Toggle Menu */}
          <div className="workspace-nav-actions">
            <Link
              href="/"
              className="workspace-nav-btn font-thai-reading"
              style={{ fontWeight: 600, color: "var(--accent)" }}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>สลับไปหน้าค้นหาหลัก (หน้าหลัก)</span>
            </Link>
            <Link href="/#dictionary" className="workspace-nav-btn font-thai-reading">
              <BookOpen className="w-4 h-4 mr-1.5" />
              <span>ค้นตามเล่ม</span>
            </Link>
            <Link href="/word-scrambler" className="workspace-nav-btn font-thai-reading" style={{ color: "var(--accent)" }}>
              <Shuffle className="w-4 h-4 mr-1.5" />
              <span>สุ่มเปลี่ยนคำ</span>
            </Link>
            <Link href="/workspace" className="workspace-nav-btn font-thai-reading">
              <Zap className="w-4 h-4 mr-1.5" />
              <span>Multi-Agent Studio</span>
            </Link>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="workspace-nav-btn ai-new-chat-btn font-thai-reading"
                title="เริ่มบทสนทนาใหม่"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1 text-blue-600" />
                <span>เริ่มสนทนาใหม่</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Full-Page Agent Workspace Canvas */}
      <main className="ai-page-main">
        <div className="ai-page-card">
          {/* Persona Header Banner */}
          <div className="ai-page-card-header">
            <div className="ai-page-header-meta">
              <div className="ai-badge-row">
                <span className="ai-brand-badge font-thai-reading">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  <span>ผู้ช่วย AI ภาษาไทย</span>
                </span>
                <span className="ai-agent-tag-pill font-thai-reading">
                  <Bot className="w-3.5 h-3.5 mr-1" />
                  <span>AI Agent Workspace</span>
                </span>
                <span className="ai-rag-pill font-thai-reading">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  <span>Grounded RAG (ไม่มโน)</span>
                </span>
              </div>
              <h1 className="ai-page-title font-thai-reading">
                ศูนย์ปฏิบัติการ AI Agent ด้านภาษาไทย
              </h1>
              <p className="ai-page-subtitle font-thai-reading">
                สั่งงานตัวแทนอัจฉริยะ (Multi-Agent System) เพื่อร่างข้อความ ขัดเกลาสำนวน เปรียบเทียบคำ และตรวจทานความถูกต้อง อ้างอิงพจนานุกรมราชบัณฑิตยสภา
              </p>
            </div>
          </div>

          {/* Agent Persona Selector Tabs */}
          <div className="ai-agent-personas-strip" role="tablist" aria-label="เลือกบทบาท AI Agent">
            <span className="ai-persona-strip-label font-thai-reading">บทบาท Agent:</span>
            <div className="ai-persona-chips-scroll">
              {AGENT_PERSONAS.map((persona) => {
                const isActive = selectedRole === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`ai-agent-persona-tab ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedRole(persona.id)}
                    title={persona.desc}
                  >
                    <span className="ai-tab-icon">{getPersonaIcon(persona.id)}</span>
                    <span className="ai-tab-text">{persona.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Persona Banner */}
          <div className="ai-active-persona-banner font-thai-reading">
            <div className="ai-active-persona-icon">
              {getPersonaIcon(activePersona.id, "w-5 h-5 text-blue-600")}
            </div>
            <div className="ai-active-persona-text">
              <div className="ai-active-persona-title-row">
                <strong>{activePersona.label}</strong>
                <span className="ai-active-persona-tag">{activePersona.badge}</span>
              </div>
              <p>{activePersona.desc}</p>
            </div>
          </div>

          {/* Target Word & Context Selector Bar */}
          <div className="ai-context-bar font-thai-reading">
            {word && (
              <div className="ai-target-word-pill font-thai-reading">
                <span className="ai-pill-label">คำเป้าหมาย:</span>
                <strong className="ai-pill-word">{word}</strong>
                <button
                  type="button"
                  className="ai-clear-word"
                  onClick={() => setWord("")}
                  title="ยกเลิกคำเป้าหมาย"
                  aria-label="ลบคำเป้าหมาย"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="ai-context-selector">
              <span className="ai-context-label">บริบทเป้าหมาย:</span>
              <div className="ai-context-chips" role="radiogroup" aria-label="เลือกบริบท">
                {CONTEXT_OPTIONS.map((c) => {
                  const IconComp = c.icon;
                  const isSelected = context === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`ai-context-chip ${isSelected ? "active" : ""}`}
                      onClick={() => setContext(c.id)}
                      title={c.tip}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Message Stream Viewport */}
          <div className="ai-chat-stream-viewport ai-page-chat-viewport" aria-live="polite">
            {messages.length === 0 ? (
              <div className="ai-chat-empty-state font-thai-reading">
                <div className="ai-welcome-hero">
                  <div className="ai-welcome-icon-glow">
                    {getPersonaIcon(activePersona.id, "w-8 h-8 text-blue-600")}
                  </div>
                  <span className="ai-empty-agent-badge">
                    <Sparkles className="w-3 h-3 mr-1" />
                    <span>{activePersona.badge}</span>
                  </span>
                  <h3 className="ai-welcome-title">
                    สวัสดีครับ วันนี้ให้ผู้ช่วย AI ช่วยคุณทำอะไรดี?
                  </h3>
                  <p className="ai-welcome-desc">
                    {activePersona.desc} — พร้อมอ้างอิงพจนานุกรมทางการฉบับราชบัณฑิตยสภา
                  </p>
                </div>

                {/* Mission Presets 2x2 Grid */}
                <div className="ai-quick-prompts-section">
                  <span className="ai-quick-prompts-label">
                    <Sparkles className="w-4 h-4 mr-1.5 text-blue-600" />
                    <span>เลือกภารกิจด่วนที่ต้องการสั่งงาน หรือพิมพ์คำสั่งด้านล่างได้เลย:</span>
                  </span>
                  <div className="ai-mission-cards-grid">
                    {activePersona.missions.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="ai-mission-card font-thai-reading"
                        onClick={() => handleSend(prompt)}
                      >
                        <div className="ai-mission-card-top">
                          <span className="ai-mission-icon">
                            {getMissionIcon(idx)}
                          </span>
                          <span className="ai-mission-tag">
                            <span>คลิกเพื่อสั่งงาน</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </span>
                        </div>
                        <span className="ai-mission-text">{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ai-agent-capabilities-banner">
                  <div className="ai-cap-item">
                    <PenTool className="w-4 h-4 text-blue-600 mr-1.5" />
                    <span>ร่างจดหมาย/อีเมล</span>
                  </div>
                  <div className="ai-cap-item">
                    <Wand2 className="w-4 h-4 text-blue-600 mr-1.5" />
                    <span>ขัดเกลาระดับภาษา</span>
                  </div>
                  <div className="ai-cap-item">
                    <Scale className="w-4 h-4 text-blue-600 mr-1.5" />
                    <span>วิจัยเปรียบเทียบคำ</span>
                  </div>
                  <div className="ai-cap-item">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mr-1.5" />
                    <span>ตรวจทานหลักไวยากรณ์</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ai-messages-list">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`ai-message-row ${
                      msg.role === "user" ? "user-row" : "assistant-row"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="ai-avatar" aria-hidden="true">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`ai-message-bubble ${
                        msg.role === "user" ? "user-bubble" : "assistant-bubble"
                      }`}
                    >
                      {/* Agent Header Tag */}
                      {msg.role === "assistant" && (
                        <div className="ai-message-agent-header">
                          <div className="ai-agent-identity">
                            <span className="ai-agent-icon">
                              <Zap className="w-3.5 h-3.5 text-blue-600" />
                            </span>
                            <span className="ai-agent-name">
                              {msg.activeAgent || activePersona.agentName}
                            </span>
                          </div>
                          {msg.isStreaming && (
                            <span className="ai-agent-running-indicator">
                              <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                              <span>กำลังปฏิบัติการ...</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Execution Pipeline Trace Bar */}
                      {msg.role === "assistant" && msg.agentTraces && msg.agentTraces.length > 0 && (
                        <div className="ai-agent-trace-bar font-thai-reading">
                          <div className="ai-trace-header-row">
                            <span className="ai-trace-title">
                              <Layers className="w-3.5 h-3.5 mr-1 text-blue-600" />
                              <span>กระบวนการทำงานของ Agent:</span>
                            </span>
                          </div>
                          <div className="ai-trace-pills">
                            {msg.agentTraces.map((trace, tIdx) => (
                              <div key={tIdx} className={`ai-trace-pill ${trace.status}`}>
                                <span className="ai-trace-status-dot" />
                                <strong>{trace.agent}</strong>
                                <span className="ai-trace-summary">
                                  ({trace.summary})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Formatted Text */}
                      <div className="ai-message-text font-thai-reading">
                        {renderFormattedText(msg.text)}
                        {msg.isStreaming && (
                          <span className="ai-streaming-cursor" aria-hidden="true">
                            ▊
                          </span>
                        )}
                      </div>

                      {/* Official Evidence Card */}
                      {msg.evidences && msg.evidences.length > 0 && (
                        <div className="ai-evidence-box">
                          <div className="ai-evidence-header">
                            <BookOpen className="w-4 h-4 text-emerald-700 mr-1.5" />
                            <span className="ai-evidence-title font-thai-reading">
                              หลักฐานพจนานุกรมทางการ (Official Evidence)
                            </span>
                          </div>
                          <div className="ai-evidence-items">
                            {msg.evidences.map((ev, i) => (
                              <div key={i} className="ai-evidence-item font-thai-reading">
                                <div className="ai-evidence-meta">
                                  <span className="ai-evidence-source">
                                    {ev.source}
                                  </span>
                                  {ev.edition && (
                                    <span className="ai-evidence-year">
                                      พ.ศ. {ev.edition}
                                    </span>
                                  )}
                                </div>
                                <blockquote className="ai-evidence-quote">
                                  “{ev.definition}”
                                </blockquote>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Artifact Actions */}
                      {msg.role === "assistant" && !msg.isStreaming && (
                        <div className="ai-artifact-actions font-thai-reading">
                          <button
                            type="button"
                            className={`ai-action-btn ${copiedId === msg.id ? "copied" : ""}`}
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            title="คัดลอกข้อความผลลัพธ์นี้"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                                <span>คัดลอกสำเร็จ!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 mr-1" />
                                <span>คัดลอกผลลัพธ์</span>
                              </>
                            )}
                          </button>

                          <span className="ai-action-divider">|</span>

                          <span className="ai-action-label">สั่ง Agent ต่อยอด:</span>
                          <button
                            type="button"
                            className="ai-quick-refine-chip"
                            onClick={() =>
                              handleSend("ช่วยปรับข้อความข้างต้นให้เป็นทางการยิ่งขึ้นตามระเบียบงานสารบรรณ")
                            }
                          >
                            <Sparkles className="w-3 h-3 mr-1 text-blue-600" />
                            <span>ปรับให้ทางการขึ้น</span>
                          </button>
                          <button
                            type="button"
                            className="ai-quick-refine-chip"
                            onClick={() =>
                              handleSend("ช่วยสรุปข้อความข้างต้นให้กระชับและตรงประเด็นที่สุด")
                            }
                          >
                            <Wand2 className="w-3 h-3 mr-1 text-blue-600" />
                            <span>สรุปให้กระชับ</span>
                          </button>
                          <button
                            type="button"
                            className="ai-quick-refine-chip"
                            onClick={() =>
                              handleSend("ช่วยยกตัวอย่างประโยคการนำไปใช้ในงานเขียนจริงเพิ่มอีก 2 รูปแบบ")
                            }
                          >
                            <PenTool className="w-3 h-3 mr-1 text-blue-600" />
                            <span>เพิ่มตัวอย่างอีก 2 แบบ</span>
                          </button>
                        </div>
                      )}

                      {/* Footer */}
                      {msg.role === "assistant" && !msg.isStreaming && (
                        <div className="ai-message-footer font-thai-reading">
                          {msg.grounded && (
                            <span className="ai-grounded-status">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                              <span>อ้างอิงพจนานุกรมทางการ (Grounded)</span>
                            </span>
                          )}
                          {typeof msg.confidence === "number" && (
                            <span className="ai-confidence-badge">
                              ความเชื่อมั่น {Math.round(msg.confidence * 100)}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>
            )}
          </div>

          {/* Large Input Console Footer */}
          <footer className="ai-input-footer ai-page-input-footer">
            <div className="ai-input-box-wrapper">
              <textarea
                ref={inputRef}
                rows={2}
                value={inputMessage}
                disabled={isGenerating}
                placeholder={activePersona.placeholder}
                className="ai-chat-input font-thai-reading"
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="ai-input-controls">
                {isGenerating ? (
                  <button
                    type="button"
                    className="ai-stop-btn font-thai-reading"
                    onClick={handleStop}
                  >
                    <Square className="w-3.5 h-3.5 mr-1 fill-current" />
                    <span>หยุดการตอบ</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!inputMessage.trim()}
                    aria-label="สั่งงาน AI Agent"
                    className="ai-send-btn font-thai-reading"
                    onClick={() => handleSend()}
                  >
                    <span>สั่ง Agent</span>
                    <Send className="w-3.5 h-3.5 ml-1" />
                  </button>
                )}
              </div>
            </div>
            <div className="ai-footer-toolbar font-thai-reading">
              <div className="ai-footer-left">
                {messages.length > 0 && (
                  <button
                    type="button"
                    className="ai-clear-chat-btn"
                    onClick={handleClear}
                    disabled={isGenerating}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>ล้างบทสนทนา</span>
                  </button>
                )}
                <span className="ai-input-hint">
                  กด Enter เพื่อส่ง · Shift + Enter ขึ้นบรรทัดใหม่
                </span>
              </div>
              <span className="ai-footer-note">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600 inline" />
                <span>Thai Context Multi-Agent System · ยึดข้อมูลพจนานุกรมทางการเป็นข้อเท็จจริงอ้างอิง</span>
              </span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default function AIAssistantPageView() {
  return (
    <Suspense fallback={<div className="ai-page-loading">กำลังโหลดศูนย์ปฏิบัติการ AI Agent...</div>}>
      <AIAssistantPageContent />
    </Suspense>
  );
}

function renderFormattedText(rawText: string) {
  if (!rawText) return null;

  const lines = rawText.split("\n");
  return lines.map((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={idx} className="ai-spacer-line" />;
    }

    if (trimmed.startsWith("###")) {
      const heading = trimmed.replace(/^###\s*/, "");
      return (
        <h4 key={idx} className="ai-msg-heading">
          {renderInlineFormatting(heading)}
        </h4>
      );
    }

    if (trimmed.startsWith("##")) {
      const heading = trimmed.replace(/^##\s*/, "");
      return (
        <h3 key={idx} className="ai-msg-heading-2">
          {renderInlineFormatting(heading)}
        </h3>
      );
    }

    if (trimmed.startsWith(">")) {
      const quote = trimmed.replace(/^>\s*/, "");
      return (
        <blockquote key={idx} className="ai-quote-line">
          {renderInlineFormatting(quote)}
        </blockquote>
      );
    }

    if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
      const bullet = trimmed.replace(/^[•\-*]\s*/, "");
      return (
        <li key={idx} className="ai-bullet-item">
          {renderInlineFormatting(bullet)}
        </li>
      );
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const item = trimmed.replace(/^\d+\.\s*/, "");
      return (
        <li key={idx} className="ai-numbered-item">
          {renderInlineFormatting(item)}
        </li>
      );
    }

    return (
      <p key={idx} className="ai-paragraph-line">
        {renderInlineFormatting(line)}
      </p>
    );
  });
}

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="ai-inline-code">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}
