"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Icon from "../ui/Icon";

export interface EvidenceItemData {
  source: string;
  edition?: string;
  definition: string;
  word?: string;
  source_type?: string;
  relevance?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
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

const CONTEXT_OPTIONS = [
  "รายงานวิชาการ",
  "งานสารบรรณ",
  "เชิงบริหาร",
  "การสนทนาทั่วไป",
  "เชิงกฎหมาย",
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
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        text: "",
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

              if (eventType === "token") {
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
                      "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับบริการผู้ช่วย AI กรุณาลองใหม่อีกครั้ง",
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
    [inputMessage, isGenerating, word, context]
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

  // Quick suggestion prompts
  const quickPrompts = [
    word
      ? `คำว่า '${word}' ต่างกับ 'ประสิทธิผล' ในงานวิจัยอย่างไร`
      : "คำว่า 'ประสิทธิภาพ' ต่างกับ 'ประสิทธิผล' ในงานวิจัยอย่างไร",
    word
      ? `คำว่า '${word}' เหมาะสำหรับใช้ในบริบท${context}หรือไม่ อย่างไร`
      : `ช่วยยกตัวอย่างการใช้คำในบริบท${context}`,
    word
      ? `ช่วยยกตัวอย่างประโยคทางการที่ใช้คำว่า '${word}'`
      : "ช่วยยกตัวอย่างประโยคทางการในการเขียนรายงาน",
  ];

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialog}
      className="evidence-drawer ai-assistant-drawer"
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
              <span className="ai-rag-pill">
                🛡️ Grounded RAG (ไม่มโน)
              </span>
            </div>
            <h2 id="ai-assistant-title" className="ai-drawer-title font-thai-reading">
              ปรึกษาการใช้คำศัพท์และบริบท
            </h2>
          </div>
          <button
            autoFocus
            type="button"
            className="ai-close-btn"
            onClick={onClose}
            aria-label="ปิดหน้าต่างผู้ช่วย AI"
          >
            ×
          </button>
        </header>

        {/* Target Word & Context Selector Bar */}
        <div className="ai-context-bar">
          {word && (
            <div className="ai-target-word-pill font-thai-reading">
              <span className="ai-pill-label">คำที่ปรึกษา:</span>
              <strong>{word}</strong>
              <button
                type="button"
                className="ai-clear-word"
                onClick={() => setWord("")}
                title="เปลี่ยนเป็นถามคำถามทั่วไป"
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
            </div>
          </div>
        </div>

        {/* Message Transcript */}
        <div className="ai-chat-stream-viewport" aria-live="polite">
          {messages.length === 0 ? (
            <div className="ai-chat-empty-state font-thai-reading">
              <div className="ai-empty-icon">💡</div>
              <h3>ถามข้อสงสัยด้านภาษาหรือการเลือกใช้คำ</h3>
              <p>
                ผู้ช่วยจะตรวจสอบและอ้างอิงความหมายจาก **พจนานุกรมทางการ**
                (ฉบับราชบัณฑิตยสถาน ๒๕๔๒, ๒๕๕๔, ๒๕๖๙)
                พร้อมจำแนกข้อเท็จจริงทางการและข้อแนะนำของ AI อย่างชัดเจน
              </p>

              <div className="ai-quick-prompts-section">
                <span className="ai-quick-prompts-label">ตัวอย่างคำถามที่พบบ่อย:</span>
                <div className="ai-quick-prompts-grid">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="ai-quick-prompt-btn"
                      onClick={() => handleSend(prompt)}
                    >
                      <span className="ai-prompt-arrow">↳</span>
                      <span>{prompt}</span>
                    </button>
                  ))}
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
                      ✨
                    </div>
                  )}

                  <div
                    className={`ai-message-bubble ${
                      msg.role === "user" ? "user-bubble" : "assistant-bubble"
                    }`}
                  >
                    {/* Render message text with simple Markdown support */}
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
              placeholder="พิมพ์คำถาม หรือข้อสงสัยในการใช้คำ (กด Enter เพื่อส่ง)..."
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
                  className="ai-send-btn font-thai-reading"
                  onClick={() => handleSend()}
                >
                  <span>ส่งคำถาม</span>
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
                AI ให้คำแนะนำเชิงการเขียน · โปรดยึดนิยามพจนานุกรมเป็นข้อเท็จจริงทางการ
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

    if (trimmed.startsWith(">")) {
      const quote = trimmed.replace(/^>\s*/, "");
      return (
        <blockquote key={idx} className="ai-quote-line">
          {renderInlineFormatting(quote)}
        </blockquote>
      );
    }

    if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
      const bullet = trimmed.replace(/^[•\-]\s*/, "");
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
  // Parse **bold**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
