"use client";

import React, { useState, useRef } from "react";
import {
  quirkifySentence,
  type QuirkifyResponse,
  type QuirkifyWordMapping,
} from "@/lib/api-client";
import {
  SENTENCE_PRESETS,
  substituteSentenceWords,
  DICTIONARY_REPLACEMENTS,
} from "@/lib/word-scrambler-data";

export default function SentenceQuirkifier({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  // Input Sentence & Current Result
  const [sentence, setSentence] = useState(SENTENCE_PRESETS[0].text);
  const [originalSentence, setOriginalSentence] = useState(SENTENCE_PRESETS[0].text);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuirkifyResponse | null>(null);

  // Interaction feedback states
  const [copiedSentence, setCopiedSentence] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeWordModal, setActiveWordModal] = useState<QuirkifyWordMapping | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --------------------------------------------------------------------------
  // Action 1: สุ่มเปลี่ยนคำในประโยค (Randomly replace words in sentence)
  // --------------------------------------------------------------------------
  const handleRandomWordSubstitute = async () => {
    const input = sentence.trim();
    if (!input) return;

    setLoading(true);
    setError(null);
    setOriginalSentence(input);

    try {
      // Attempt API call to backend service
      const res = await quirkifySentence(input, "ancient", "quirkify");
      if (res && res.quirkified_sentence) {
        setResult(res);
        showToast("🎲 สุ่มเปลี่ยนคำในประโยคเรียบร้อยแล้ว!");
      } else {
        throw new Error("No response from server");
      }
    } catch {
      // High-quality local Royal Society Dictionary substitution fallback
      const local = substituteSentenceWords(input, 2);
      setResult({
        original_sentence: input,
        quirkified_sentence: local.scrambledSentence,
        vibe_style: "สุ่มเปลี่ยนคำในประโยค (Word Scrambler)",
        punchline_explanation:
          local.mappings.length > 0
            ? `สุ่มเปลี่ยนคำว่า ${local.mappings.map((m) => `“${m.original_phrase}” ➡️ “${m.replaced_word}”`).join(", ")} โดยคงโครงสร้างประโยคเดิมไว้ ๑๐๐%`
            : "สุ่มเปลี่ยนคำในประโยคโดยเชื่อมโยงกับคลังพจนานุกรมราชบัณฑิตยสภา",
        word_mappings: local.mappings,
      });
      showToast("🎲 สุ่มเปลี่ยนคำในประโยคเรียบร้อยแล้ว!");
    } finally {
      setLoading(false);
    }
  };



  // Re-roll a specific substituted word
  const handleRerollSpecificWord = (mappingIndex: number) => {
    if (!result || !result.word_mappings[mappingIndex]) return;

    const oldMapping = result.word_mappings[mappingIndex];
    const available = DICTIONARY_REPLACEMENTS.filter(
      (d) => d.headword !== oldMapping.replaced_word
    );
    const pick = available[Math.floor(Math.random() * available.length)];

    const newQuirkified = result.quirkified_sentence.replace(
      `'${oldMapping.replaced_word}'`,
      `'${pick.headword}'`
    );

    const newMappings = [...result.word_mappings];
    newMappings[mappingIndex] = {
      original_phrase: oldMapping.original_phrase,
      replaced_word: pick.headword,
      part_of_speech: pick.pos,
      official_definition: pick.definition,
      source_edition: pick.sourceEdition,
      quirk_reason: pick.rationale,
    };

    setResult({
      ...result,
      quirkified_sentence: newQuirkified,
      word_mappings: newMappings,
    });

    showToast(`✨ เปลี่ยนเป็นคำว่า '${pick.headword}' แล้ว!`);
  };

  // Copy result sentence
  const handleCopySentence = () => {
    if (!result?.quirkified_sentence) return;
    navigator.clipboard.writeText(result.quirkified_sentence);
    setCopiedSentence(true);
    showToast("📋 คัดลอกประโยคแล้ว!");
    setTimeout(() => setCopiedSentence(false), 2000);
  };

  // Listen to pronunciation via Speech Synthesis
  const handleSpeak = () => {
    if (!result?.quirkified_sentence || typeof window === "undefined") return;
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      alert("เบราว์เซอร์ของคุณยังไม่รองรับการออกเสียงข้อความ");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanSpeech = result.quirkified_sentence.replace(/['"“”]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = "th-TH";
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSentence(text.slice(0, 300));
        textareaRef.current?.focus();
      }
    } catch {
      // Ignore
    }
  };

  // Pick random preset
  const handleRandomPreset = () => {
    const others = SENTENCE_PRESETS.filter((p) => p.text !== sentence);
    const pick = others[Math.floor(Math.random() * others.length)];
    setSentence(pick.text);
    setResult(null);
  };

  // Render sentence with clickable word pills for replaced words
  const renderInteractiveSentence = (text: string) => {
    const parts = text.split(/('[^']+'|"[^"]+")/g);
    return (
      <span className="leading-relaxed">
        {parts.map((part, i) => {
          if (part.startsWith("'") && part.endsWith("'")) {
            const rawWord = part.slice(1, -1);
            const mapping = result?.word_mappings?.find(
              (m) => m.replaced_word === rawWord
            );
            return (
              <span
                key={i}
                onClick={() => mapping && setActiveWordModal(mapping)}
                className="scrambler-word-pill quirk"
                title={
                  mapping
                    ? `คลิกดูนิยามราชบัณฑิตยสภา: ${mapping.official_definition}`
                    : undefined
                }
              >
                <span>{part}</span>
                <span style={{ fontSize: "11px", opacity: 0.8 }}>✨</span>
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <section
      id="word-scrambler"
      data-section="quirkify"
      className={`scrambler-section ${embedded ? "embedded" : ""}`}
      aria-labelledby="scrambler-main-heading"
    >
      {/* Anchor for backward compatibility with #quirkify */}
      <span id="quirkify" style={{ position: "absolute", top: -80, visibility: "hidden" }} />

      {/* Ambient Lighting Gradients */}
      <div className="scrambler-ambient-1" />
      <div className="scrambler-ambient-2" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="workspace-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="scrambler-inner">
        {/* Section Header */}
        <header className="scrambler-header">
          <div className="scrambler-badge">
            <span style={{ fontSize: "15px" }}>🔀</span>
            <span>THAI CONTEXT Word Scrambler</span>
            <span className="scrambler-badge-tag">พจนานุกรมราชบัณฑิตยสภา</span>
          </div>

          <h2 id="scrambler-main-heading" className="scrambler-title">
            สุ่มเปลี่ยนคำในประโยค (Word Scrambler)
          </h2>

          <p className="scrambler-desc">
            สุ่มเปลี่ยนเฉพาะคำในประโยคภาษาไทย โดยคงโครงสร้างประโยคเดิมไว้ พร้อมเชื่อมโยงนิยามทางการจากพจนานุกรมราชบัณฑิตยสภา ๗๗,๐๐๐+ รายการ
          </p>
        </header>

        {/* Master Card Container */}
        <div className="scrambler-card">
          <div className="scrambler-body">
            {/* Quick Preset Sentence Chips */}
            <div style={{ marginBottom: "20px" }}>
              <div className="scrambler-row-label">
                <span>💡 เลือกประโยคตัวอย่าง หรือพิมพ์ประโยคของคุณเอง:</span>
                <button
                  type="button"
                  onClick={handleRandomPreset}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#d97706",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  🎲 สุ่มประโยคตัวอย่าง
                </button>
              </div>

              <div className="scrambler-chips-wrap">
                {SENTENCE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSentence(preset.text);
                      setResult(null);
                    }}
                    className={`scrambler-chip ${sentence === preset.text ? "selected" : ""}`}
                  >
                    <span>{preset.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Input Container */}
            <div className="scrambler-textarea-container">
              <textarea
                ref={textareaRef}
                rows={3}
                value={sentence}
                onChange={(e) => setSentence(e.target.value.slice(0, 300))}
                placeholder="พิมพ์ประโยคภาษาไทยที่ต้องการสุ่มเปลี่ยนคำ เช่น วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว..."
                className="scrambler-textarea"
                aria-label="ประโยคภาษาไทยที่ต้องการสุ่มเปลี่ยนคำ"
              />

              <div className="scrambler-textarea-footer">
                <button
                  type="button"
                  onClick={handlePaste}
                  style={{
                    fontSize: "11px",
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid #dce8f4",
                    borderRadius: "6px",
                    padding: "2px 8px",
                    cursor: "pointer",
                    color: "var(--muted)",
                  }}
                  title="วางข้อความจากคลิปบอร์ด"
                >
                  📋 วาง
                </button>
                {sentence && (
                  <button
                    type="button"
                    onClick={() => {
                      setSentence("");
                      setResult(null);
                    }}
                    style={{
                      fontSize: "11px",
                      background: "rgba(255,255,255,0.9)",
                      border: "1px solid #dce8f4",
                      borderRadius: "6px",
                      padding: "2px 8px",
                      cursor: "pointer",
                      color: "var(--muted)",
                    }}
                    title="ล้างข้อความ"
                  >
                    ✕ ล้าง
                  </button>
                )}
                <span className="scrambler-char-count">{sentence.length}/300</span>
              </div>
            </div>

            {/* Primary Action Controls Row */}
            <div className="scrambler-submit-row" style={{ flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                {/* 1. Primary: Randomly substitute words in sentence */}
                <button
                  type="button"
                  disabled={loading || !sentence.trim()}
                  onClick={handleRandomWordSubstitute}
                  className="scrambler-btn-primary quirk"
                  title="สุ่มเปลี่ยนเฉพาะคำในประโยคด้วยคำศัพท์จากพจนานุกรม"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>กำลังสุ่มเปลี่ยนคำ...</span>
                    </>
                  ) : (
                    <>
                      <span>🎲</span>
                      <span>สุ่มเปลี่ยนคำในประโยค ✦</span>
                    </>
                  )}
                </button>



                {/* Reset button if modified */}
                {result && (
                  <button
                    type="button"
                    onClick={() => {
                      setSentence(originalSentence);
                      setResult(null);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--muted)",
                      fontSize: "13px",
                      cursor: "pointer",
                      textDecoration: "underline",
                      marginLeft: "4px",
                    }}
                  >
                    ↺ คืนค่าเดิม
                  </button>
                )}
              </div>

              <div className="scrambler-badge-grounded">
                <span>🏛️</span>
                <span>
                  เชื่อมโยงพจนานุกรมราชบัณฑิตยสภา <strong>๗๗,๐๐๐+ นิยาม</strong>
                </span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  color: "#991b1b",
                  padding: "12px 18px",
                  borderRadius: "14px",
                  fontSize: "13px",
                  marginTop: "16px",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* ===============================================================
                RESULTS DISPLAY AREA
                =============================================================== */}
            {result && (
              <div className="scrambler-result-wrap" style={{ marginTop: "24px" }}>
                <div className="scrambler-result-grid">
                  {/* Left: Original Sentence */}
                  <div className="scrambler-orig-box">
                    <div>
                      <div className="scrambler-orig-label">
                        <span>📝 ประโยคเดิม:</span>
                      </div>
                      <p className="scrambler-orig-text">
                        &ldquo;{result.original_sentence}&rdquo;
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        โครงสร้างประโยคตั้งต้น
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(result.original_sentence);
                          showToast("คัดลอกประโยคเดิมแล้ว");
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          fontSize: "11px",
                          color: "var(--accent)",
                          cursor: "pointer",
                        }}
                      >
                        📋 คัดลอก
                      </button>
                    </div>
                  </div>

                  {/* Right: Transformed Scrambled Sentence */}
                  <div className="scrambler-transformed-box quirk">
                    <div>
                      <div className="scrambler-transformed-top">
                        <span className="scrambler-vibe-pill">
                          <span>🔀</span>
                          <span>{result.vibe_style}</span>
                        </span>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                          {/* Audio TTS */}
                          <button
                            type="button"
                            onClick={handleSpeak}
                            className="scrambler-action-btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                          >
                            <span>{isPlayingAudio ? "⏹️ หยุดเสียง" : "🔊 ฟังเสียง"}</span>
                          </button>

                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={handleCopySentence}
                            className="scrambler-action-btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                          >
                            <span>{copiedSentence ? "✓ คัดลอกแล้ว" : "📋 คัดลอกประโยค"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Main Transformed Text with interactive pills */}
                      <div className="scrambler-transformed-sentence">
                        {renderInteractiveSentence(result.quirkified_sentence)}
                      </div>
                    </div>

                    {/* Explanation */}
                    {result.punchline_explanation && (
                      <div className="scrambler-punchline">
                        <strong>💡 การสุ่มเปลี่ยน:</strong> {result.punchline_explanation}
                      </div>
                    )}
                  </div>
                </div>

                {/* Grounded Dictionary Evidence Cards */}
                {result.word_mappings && result.word_mappings.length > 0 && (
                  <div style={{ marginTop: "24px" }}>
                    <div className="scrambler-row-label">
                      <span>
                        📖 เจาะลึกคำศัพท์ที่สุ่มเปลี่ยน (Official Dictionary Grounding):
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 400 }}>
                        คลิกที่การ์ดเพื่อดูรายละเอียดเพิ่มเติม หรือคลิก &apos;สุ่มคำอื่นแทน&apos;
                      </span>
                    </div>

                    <div className="scrambler-evidence-grid">
                      {result.word_mappings.map((mapping, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActiveWordModal(mapping)}
                          className="scrambler-evidence-card"
                        >
                          <div>
                            <div className="scrambler-evidence-top">
                              <span className="scrambler-evidence-headword">
                                {mapping.replaced_word}
                              </span>
                              {mapping.part_of_speech && (
                                <span className="scrambler-evidence-pos">
                                  {mapping.part_of_speech}
                                </span>
                              )}
                            </div>

                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
                              <span>แทนคำว่า: </span>
                              <strong style={{ color: "var(--ink)" }}>
                                &ldquo;{mapping.original_phrase}&rdquo;
                              </strong>
                            </div>

                            <p className="scrambler-evidence-def">
                              <strong>นิยาม:</strong> {mapping.official_definition}
                            </p>
                          </div>

                          <div className="scrambler-evidence-foot">
                            <span style={{ color: "#b45309", fontWeight: 600 }}>
                              🎯 {mapping.quirk_reason}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRerollSpecificWord(idx);
                              }}
                              style={{
                                fontSize: "11px",
                                background: "#fffbeb",
                                border: "1px solid #fde68a",
                                color: "#b45309",
                                borderRadius: "8px",
                                padding: "3px 8px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              🎲 สุ่มคำอื่นแทน
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dictionary Detail Modal */}
      {activeWordModal && (
        <div
          className="scrambler-modal-overlay"
          onClick={() => setActiveWordModal(null)}
        >
          <div
            className="scrambler-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "14px",
                borderBottom: "1px solid var(--border)",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#b45309",
                    fontFamily: "var(--font-thai-reading)",
                  }}
                >
                  {activeWordModal.replaced_word}
                </span>
                {activeWordModal.part_of_speech && (
                  <span className="scrambler-evidence-pos">
                    {activeWordModal.part_of_speech}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveWordModal(null)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "var(--muted)",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gap: "14px", fontSize: "14px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  คำเดิมที่ถูกแทนที่:
                </span>
                <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: "16px", color: "var(--ink)" }}>
                  &ldquo;{activeWordModal.original_phrase}&rdquo;
                </p>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  นิยามทางการจากพจนานุกรมราชบัณฑิตยสภา:
                </span>
                <blockquote
                  style={{
                    margin: "6px 0 0",
                    padding: "12px 16px",
                    background: "#f8fafc",
                    borderLeft: "3px solid var(--accent)",
                    borderRadius: "0 12px 12px 0",
                    fontFamily: "var(--font-thai-reading)",
                    lineHeight: 1.7,
                    color: "var(--ink)",
                  }}
                >
                  {activeWordModal.official_definition}
                </blockquote>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  เหตุผลการสุ่มเปลี่ยนคำ:
                </span>
                <p
                  style={{
                    margin: "4px 0 0",
                    lineHeight: 1.6,
                    color: "#92400e",
                    fontFamily: "var(--font-thai-reading)",
                  }}
                >
                  {activeWordModal.quirk_reason}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--border)",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                <span>📚 แหล่งอ้างอิง:</span>
                <strong style={{ color: "var(--ink)" }}>{activeWordModal.source_edition}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
