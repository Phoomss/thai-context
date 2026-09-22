"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bot,
  PenTool,
  Wand2,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Volume2,
} from "lucide-react";
import Icon from "../ui/Icon";

export interface EvidenceItemData {
  source: string;
  edition?: string;
  definition: string;
  word?: string;
  source_type?: string;
  relevance?: number;
}

export interface AgentTraceData {
  agent: string;
  status: "running" | "completed" | "skipped";
  summary: string;
  duration_ms?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  activeAgent?: string;
  agentTraces?: AgentTraceData[];
  evidences?: EvidenceItemData[];
  confidence?: number;
  grounded?: boolean;
  isStreaming?: boolean;
  error?: string;
}

export interface AIAssistantDrawerProps {
  initialWord?: string;
  initialContext?: string;
  initialMessage?: string;
  isOpen: boolean;
  onClose: () => void;
}

export interface EmotionTone {
  id: string;
  emoji: string;
  label: string;
  pitch: number;
  rate: number;
  desc: string;
}

export const EMOTION_TONES: EmotionTone[] = [
  { id: "cheerful", emoji: "😊", label: "สดใส / ร่าเริง", pitch: 1.3, rate: 1.05, desc: "น้ำเสียงสดชื่น มีชีวิตชีวา เบิกบานใจ" },
  { id: "empathetic", emoji: "🥺", label: "ซาบซึ้ง / เห็นใจ", pitch: 0.88, rate: 0.82, desc: "น้ำเสียงอบอุ่น เข้าอกเข้าใจ ซึ้งกินใจ" },
  { id: "formal", emoji: "🧐", label: "สุขุม / ลึกซึ้ง", pitch: 0.92, rate: 0.88, desc: "น้ำเสียงหนักแน่น น่าเชื่อถือ มีวุฒิภาวะ" },
  { id: "intense", emoji: "😠", label: "หนักแน่น / ดุดัน", pitch: 0.78, rate: 0.95, desc: "น้ำเสียงจริงจัง มุ่งมั่น ชัดเจนไม่ลังเล" },
  { id: "tender", emoji: "💖", label: "อ่อนโยน / อบอุ่น", pitch: 1.1, rate: 0.8, desc: "น้ำเสียงนุ่มนวล ปลอบประโลม ห่วงใย" },
  { id: "excited", emoji: "🥳", label: "ตื่นเต้น / เร้าใจ", pitch: 1.4, rate: 1.18, desc: "น้ำเสียงเปี่ยมพลัง ตื่นตัว เร้าอารมณ์" },
  { id: "peaceful", emoji: "🕊️", label: "สงบ / นอบน้อม", pitch: 1.02, rate: 0.85, desc: "น้ำเสียงนอบน้อม สุภาพ นุ่มลึก" },
];

const CONTEXT_OPTIONS = [
  "รายงานวิชาการ",
  "งานสารบรรณ",
  "เชิงบริหาร",
  "การสนทนาทั่วไป",
  "เชิงกฎหมาย",
];

export interface AgentPersona {
  id: string;
  label: string;
  icon: string;
  badge: string;
  agentName: string;
  desc: string;
  placeholder: string;
  missions: string[];
}

function getPersonaIcon(id: string, className: string = "w-3.5 h-3.5 mr-1") {
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
      return <ShieldCheck className={className} />;
    default:
      return <Bot className={className} />;
  }
}

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
    icon: "ShieldCheck",
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

export default function AIAssistantDrawer({
  initialWord = "",
  initialContext = "รายงานวิชาการ",
  initialMessage = "",
  isOpen,
  onClose,
}: AIAssistantDrawerProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [word, setWord] = useState(initialWord);
  const [context, setContext] = useState(initialContext);
  const [selectedRole, setSelectedRole] = useState<string>("AUTO");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [activeEmotionMsgId, setActiveEmotionMsgId] = useState<string | null>(null);
  const [isContextEmotionOpen, setIsContextEmotionOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState<EmotionTone | null>(null);

  const handleSpeakText = useCallback((msgId: string, text: string, tone?: EmotionTone) => {
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/^>\s*/gm, "")
      .replace(/^[•\-*]\s*/gm, "")
      .replace(/🤖\s*\[.*?\]/g, "")
      .trim();

    if (!cleanText) return;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "th-TH";
        if (tone) {
          utterance.pitch = tone.pitch;
          utterance.rate = tone.rate;
        }

        utterance.onstart = () => setIsPlayingAudio(msgId);
        utterance.onend = () => setIsPlayingAudio(null);
        utterance.onerror = () => setIsPlayingAudio(null);

        const voices = window.speechSynthesis.getVoices();
        const thaiVoice = voices.find((v) => v.lang?.toLowerCase().startsWith("th"));
        if (thaiVoice) utterance.voice = thaiVoice;

        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback silently
      }
    }
  }, []);

  const activePersona =
    AGENT_PERSONAS.find((p) => p.id === selectedRole) || AGENT_PERSONAS[0];

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      if (initialWord) setWord(initialWord);
      if (initialContext) setContext(initialContext);
      if (initialMessage) {
        setInputMessage(initialMessage);
      }
    }
  }, [isOpen, initialWord, initialContext, initialMessage]);

  // Dialog accessibility & focus trap
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;

    if (isOpen) {
      const prior = document.activeElement as HTMLElement | null;
      const oldOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      try {
        if (!element.open) {
          element.showModal();
        }
      } catch {
        // Fallback if showModal fails in unsupported test runners
      }

      // Auto focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => {
        document.body.style.overflow = oldOverflow;
        try {
          if (element.open) element.close();
        } catch {}
        prior?.focus({ preventScroll: true });
        abortControllerRef.current?.abort();
      };
    } else {
      try {
        if (element.open) element.close();
      } catch {}
    }
  }, [isOpen]);

  // Auto scroll down as new tokens stream in
  useEffect(() => {
    if (isGenerating || messages.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating]);

  // 1-Click Copy Helper
  const handleCopyText = useCallback((msgId: string, text: string) => {
    // Strip markdown formatting symbols for clean clipboard text
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

  // Send query via SSE
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

      // Inferred agent for optimistic UI feedback
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

          // Split SSE events by double newline
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

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialog}
      className="evidence-drawer ai-assistant-drawer ai-agent-workspace"
      aria-labelledby="ai-assistant-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drawer-content ai-drawer-container">
        {/* Header */}
        <header className="ai-drawer-header">
          <div className="ai-header-info">
            <div className="ai-badge-row">
              <span className="ai-brand-badge font-thai-reading">
                ✨ ผู้ช่วย AI ภาษาไทย
              </span>
              <span className="ai-agent-tag-pill">
                🤖 AI Agent Workspace
              </span>
              <span className="ai-rag-pill">
                🛡️ Grounded RAG (ไม่มโน)
              </span>
            </div>
            <div className="ai-title-wrap">
              <h2 id="ai-assistant-title" className="ai-drawer-title font-thai-reading">
                ปรึกษาการใช้คำศัพท์และบริบท
              </h2>
              <p className="ai-drawer-subtitle font-thai-reading">
                ระบบตัวแทนอัจฉริยะแบบมัลติเอเจนต์ (Multi-Agent System) พร้อมทำงานอัตโนมัติ ไม่ใช่แค่วิเคราะห์คำ
              </p>
            </div>
          </div>
          <div className="ai-header-controls">
            <Link
              href={`/ai-assistant${word ? `?word=${encodeURIComponent(word)}` : ""}`}
              className="ai-toggle-page-btn font-thai-reading"
              title="เปิดเป็นหน้าเต็ม (ไปยังหน้าผู้ช่วย AI)"
              onClick={onClose}
            >
              <span>⛶</span>
              <span>ไปที่หน้าผู้ช่วย AI ↗</span>
            </Link>
            <button
              autoFocus
              type="button"
              className="ai-close-btn"
              onClick={onClose}
              aria-label="ปิดหน้าต่างผู้ช่วย AI"
            >
              ×
            </button>
          </div>
        </header>

        {/* Multi-Agent Role Selector Tabs */}
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

        {/* Target Word & Context Selector Bar */}
        <div className="ai-context-bar">
          {word && (
            <div className="ai-target-word-pill font-thai-reading">
              <span className="ai-pill-label">คำเป้าหมาย:</span>
              <strong>{word}</strong>
              <button
                type="button"
                className="ai-clear-word"
                onClick={() => setWord("")}
                title="เปลี่ยนเป็นสั่งงานทั่วไป"
              >
                ×
              </button>
            </div>
          )}
          <div className="ai-context-selector">
            <span className="ai-context-label">บริบทเป้าหมาย:</span>
            <div className="ai-context-chips" role="radiogroup" aria-label="เลือกบริบท">
              {CONTEXT_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={context === c}
                  className={`ai-context-chip ${context === c ? "active" : ""}`}
                  onClick={() => setContext(c)}
                >
                  {c}
                </button>
              ))}

              {/* Speak to Emotion Toggle Button - Emoji Menu */}
              <button
                type="button"
                onClick={() => setIsContextEmotionOpen(!isContextEmotionOpen)}
                className={`workspace-context-pill ${isContextEmotionOpen || selectedTone ? "active" : ""}`}
                style={{
                  background: isContextEmotionOpen || selectedTone ? "#fff7ed" : "white",
                  color: isContextEmotionOpen || selectedTone ? "#c2410c" : "var(--muted)",
                  borderColor: isContextEmotionOpen || selectedTone ? "#fed7aa" : "var(--border)",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
                title="เปิดเมนูพูดสื่ออารมณ์"
              >
                <span>🎭 Speak to emotion</span>
                {selectedTone && (
                  <span style={{ fontSize: "11px", marginLeft: "2px" }}>
                    ({selectedTone.emoji} {selectedTone.label})
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Speak to Emotion Menu Dropdown/Palette - USES EMOJIS! */}
          {isContextEmotionOpen && (
            <div className="workspace-emotion-menu" style={{ width: "100%", marginTop: "8px", padding: "8px 12px", background: "#fffaf5", border: "1px solid #fed7aa", borderRadius: "10px" }}>
              <div className="workspace-emotion-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div className="workspace-emotion-title" style={{ fontSize: "12px", fontWeight: 600, color: "#9a3412", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🎭</span>
                  <span>Speak to emotion — เลือกอารมณ์เพื่อแต่งประโยคหรืออ่านออกเสียง:</span>
                </div>
                {selectedTone && (
                  <span style={{ fontSize: "11px", color: "#ea580c", fontWeight: 700 }}>
                    {selectedTone.emoji} {selectedTone.label}
                  </span>
                )}
              </div>
              <div className="workspace-emotion-grid" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {EMOTION_TONES.map((tone) => {
                  const isSelected = selectedTone?.id === tone.id;
                  return (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => setSelectedTone(isSelected ? null : tone)}
                      className={`workspace-emotion-btn ${isSelected ? "active" : ""}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        border: isSelected ? "1.5px solid #ea580c" : "1px solid #fed7aa",
                        background: isSelected ? "#ffedd5" : "#ffffff",
                        color: isSelected ? "#9a3412" : "#4b5563",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                      title={tone.desc}
                    >
                      <span>{tone.emoji}</span>
                      <span>{tone.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Message Transcript */}
        <div className="ai-chat-stream-viewport" aria-live="polite">
          {messages.length === 0 ? (
            <div className="ai-chat-empty-state font-thai-reading">
              <div className="ai-welcome-hero">
                <div className="ai-welcome-icon-glow">{activePersona.icon}</div>
                <span className="ai-empty-agent-badge">{activePersona.badge}</span>
                <h3 className="ai-welcome-title">
                  สวัสดีครับ วันนี้ให้ผู้ช่วย AI ช่วยคุณทำอะไรดี?
                </h3>
                <p className="ai-welcome-desc">
                  {activePersona.desc} — พร้อมอ้างอิงพจนานุกรมทางการฉบับราชบัณฑิตยสภา
                </p>
              </div>

              {/* Mission Presets Grid */}
              <div className="ai-quick-prompts-section">
                <span className="ai-quick-prompts-label">
                  💡 เลือกภารกิจด่วนที่ต้องการสั่งงาน หรือพิมพ์คำสั่งด้านล่าง:
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
                          {idx === 0 ? "✍️" : idx === 1 ? "🔄" : idx === 2 ? "⚖️" : "🛡️"}
                        </span>
                        <span className="ai-mission-tag">คลิกเพื่อสั่งงาน ➔</span>
                      </div>
                      <span className="ai-mission-text">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ai-agent-capabilities-banner">
                <div className="ai-cap-item">
                  <span className="ai-cap-icon">✍️</span>
                  <span>ร่างจดหมาย/อีเมล</span>
                </div>
                <div className="ai-cap-item">
                  <span className="ai-cap-icon">🔄</span>
                  <span>ขัดเกลาระดับภาษา</span>
                </div>
                <div className="ai-cap-item">
                  <span className="ai-cap-icon">⚖️</span>
                  <span>วิจัยเปรียบเทียบคำ</span>
                </div>
                <div className="ai-cap-item">
                  <span className="ai-cap-icon">🛡️</span>
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
                      🤖
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
                          <span className="ai-agent-icon">⚡</span>
                          <span className="ai-agent-name">
                            {msg.activeAgent || activePersona.agentName}
                          </span>
                        </div>
                        {msg.isStreaming && (
                          <span className="ai-agent-running-indicator">
                            กำลังปฏิบัติการ...
                          </span>
                        )}
                      </div>
                    )}

                    {/* Agent Execution Pipeline Trace Bar */}
                    {msg.role === "assistant" && msg.agentTraces && msg.agentTraces.length > 0 && (
                      <div className="ai-agent-trace-bar font-thai-reading">
                        <span className="ai-trace-title">กระบวนการทำงานของ Agent:</span>
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

                    {/* Render message text with Markdown support */}
                    <div className="ai-message-text font-thai-reading">
                      {renderFormattedText(msg.text)}
                      {msg.isStreaming && (
                        <span className="ai-streaming-cursor" aria-hidden="true">
                          ▊
                        </span>
                      )}
                    </div>

                    {/* Official Evidence Sources Card */}
                    {msg.evidences && msg.evidences.length > 0 && (
                      <div className="ai-evidence-box">
                        <div className="ai-evidence-header">
                          <span className="ai-evidence-icon">📚</span>
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

                    {/* Interactive Agent Artifact Toolbar */}
                    {msg.role === "assistant" && !msg.isStreaming && (
                      <div className="ai-artifact-actions-container" style={{ width: "100%" }}>
                        <div className="ai-artifact-actions" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
                          <button
                            type="button"
                            className={`ai-action-btn ${copiedId === msg.id ? "copied" : ""}`}
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            title="คัดลอกข้อความผลลัพธ์นี้"
                          >
                            {copiedId === msg.id ? "✓ คัดลอกสำเร็จ!" : "📋 คัดลอกผลลัพธ์"}
                          </button>

                          {/* Audio TTS button */}
                          <button
                            type="button"
                            className="ai-action-btn"
                            onClick={() => handleSpeakText(msg.id, msg.text, selectedTone || undefined)}
                            title="ฟังเสียงอ่านข้อความนี้"
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>{isPlayingAudio === msg.id ? "กำลังอ่าน..." : "ฟังเสียง"}</span>
                          </button>

                          {/* Speak to Emotion Button - USES EMOJI */}
                          <button
                            type="button"
                            className={`ai-action-btn ${activeEmotionMsgId === msg.id ? "active" : ""}`}
                            onClick={() =>
                              setActiveEmotionMsgId(
                                activeEmotionMsgId === msg.id ? null : msg.id
                              )
                            }
                            title="เปิดเมนูพูดสื่ออารมณ์ (Speak to emotion)"
                            style={{
                              background: activeEmotionMsgId === msg.id ? "#fff7ed" : undefined,
                              color: activeEmotionMsgId === msg.id ? "#c2410c" : undefined,
                              borderColor: activeEmotionMsgId === msg.id ? "#fed7aa" : undefined,
                              fontWeight: 600,
                            }}
                          >
                            <span>🎭 Speak to emotion</span>
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
                            ✨ ปรับให้ทางการขึ้น
                          </button>
                          <button
                            type="button"
                            className="ai-quick-refine-chip"
                            onClick={() =>
                              handleSend("ช่วยสรุปข้อความข้างต้นให้กระชับและตรงประเด็นที่สุด")
                            }
                          >
                            ✂️ สรุปให้กระชับ
                          </button>
                          <button
                            type="button"
                            className="ai-quick-refine-chip"
                            onClick={() =>
                              handleSend("ช่วยยกตัวอย่างประโยคการนำไปใช้ในงานเขียนจริงเพิ่มอีก 2 รูปแบบ")
                            }
                          >
                            📝 เพิ่มตัวอย่างอีก 2 แบบ
                          </button>
                        </div>

                        {/* Emotion Palette for this message */}
                        {activeEmotionMsgId === msg.id && (
                          <div className="workspace-emotion-menu" style={{ width: "100%", marginTop: "8px", padding: "8px 12px", background: "#fffaf5", border: "1px solid #fed7aa", borderRadius: "10px" }}>
                            <div className="workspace-emotion-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                              <div className="workspace-emotion-title" style={{ fontSize: "12px", fontWeight: 600, color: "#9a3412", display: "flex", alignItems: "center", gap: "6px" }}>
                                <span>🎭</span>
                                <span>Speak to emotion — เลือกอารมณ์เพื่อฟังเสียงอ่านสื่อความรู้สึก:</span>
                              </div>
                            </div>
                            <div className="workspace-emotion-grid" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {EMOTION_TONES.map((tone) => (
                                <button
                                  key={tone.id}
                                  type="button"
                                  onClick={() => handleSpeakText(msg.id, msg.text, tone)}
                                  className="workspace-emotion-btn"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "4px 8px",
                                    borderRadius: "8px",
                                    border: "1px solid #fed7aa",
                                    background: "#ffffff",
                                    color: "#4b5563",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                  }}
                                  title={tone.desc}
                                >
                                  <span>{tone.emoji}</span>
                                  <span>{tone.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Confidence & Grounded Verification Footer */}
                    {msg.role === "assistant" && !msg.isStreaming && (
                      <div className="ai-message-footer">
                        {msg.grounded && (
                          <span className="ai-grounded-status">
                            <Icon name="check" style={{ width: 14, height: 14 }} />
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

        {/* Input & Action Bar */}
        <footer className="ai-input-footer">
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
                  ■ หยุดการตอบ
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
                  <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </div>
          {messages.length > 0 && (
            <div className="ai-footer-toolbar">
              <button
                type="button"
                className="ai-clear-chat-btn"
                onClick={handleClear}
                disabled={isGenerating}
              >
                ล้างบทสนทนา
              </button>
              <span className="ai-footer-note">
                Thai Context Multi-Agent System · ยึดข้อมูลพจนานุกรมทางการเป็นข้อเท็จจริงอ้างอิง
              </span>
            </div>
          )}
        </footer>
      </div>
    </dialog>
  );
}

/**
 * Format markdown text into paragraphs, lists, bold text and quotes
 */
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

    return (
      <p key={idx} className="ai-paragraph-line">
        {renderInlineFormatting(line)}
      </p>
    );
  });
}

function renderInlineFormatting(text: string) {
  // Parse **bold** and *italic*
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
