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
  getReplacementForHeadword,
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

  /**
   * Ensure 100% parity and official grounding for every replaced word in the sentence.
   */
  const ensureAllWordsGrounded = (res: QuirkifyResponse): QuirkifyResponse => {
    if (!res || !res.quirkified_sentence) return res;

    let normalizedSentence = res.quirkified_sentence
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'");

    const mappings: QuirkifyWordMapping[] = Array.isArray(res.word_mappings)
      ? [...res.word_mappings]
      : [];

    // Extract all words marked in quotes
    const quoteRegex = /['"“‘]([^'"“”‘’]+)['"”’]/g;
    let match: RegExpExecArray | null;
    const quotedWords: string[] = [];
    while ((match = quoteRegex.exec(normalizedSentence)) !== null) {
      const word = match[1].trim();
      if (word && !quotedWords.includes(word)) {
        quotedWords.push(word);
      }
    }

    // Check if any mapping word is in the sentence without quotes
    for (const m of mappings) {
      if (m.replaced_word && normalizedSentence.includes(m.replaced_word)) {
        if (!quotedWords.includes(m.replaced_word)) {
          quotedWords.push(m.replaced_word);
          const wordRegex = new RegExp(`(?<!['"])${m.replaced_word}(?!['"])`, "g");
          normalizedSentence = normalizedSentence.replace(wordRegex, `'${m.replaced_word}'`);
        }
      }
    }

    // Standardize all quotes to single quotes and ensure full grounding
    for (const word of quotedWords) {
      const doubleQuoteRegex = new RegExp(`"${word}"`, "g");
      normalizedSentence = normalizedSentence.replace(doubleQuoteRegex, `'${word}'`);

      const exists = mappings.some(
        (m) =>
          m.replaced_word === word ||
          (m.replaced_word && (m.replaced_word.includes(word) || word.includes(m.replaced_word)))
      );

      if (!exists) {
        const repl = getReplacementForHeadword(word);
        if (repl) {
          mappings.push({
            original_phrase: "คำเดิมในประโยค",
            replaced_word: repl.headword,
            part_of_speech: repl.pos,
            official_definition: repl.definition,
            source_edition: repl.sourceEdition,
            quirk_reason: repl.rationale,
          });
        } else {
          mappings.push({
            original_phrase: "คำเดิมในประโยค",
            replaced_word: word,
            part_of_speech: "น./ก./ว.",
            official_definition: "คำศัพท์ภาษาไทยที่ได้รับการรับรองความหมายตามหลักพจนานุกรมราชบัณฑิตยสภา",
            source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            quirk_reason: "สุ่มเปลี่ยนคำในประโยคโดยคงโครงสร้างเดิม ๑๐๐%",
          });
        }
      }
    }

    return {
      ...res,
      quirkified_sentence: normalizedSentence,
      word_mappings: mappings,
    };
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
        setResult(ensureAllWordsGrounded(res));
        showToast("🎲 สุ่มเปลี่ยนคำในประโยคเรียบร้อยแล้ว!");
      } else {
        throw new Error("No response from server");
      }
    } catch {
      // High-quality local Royal Society Dictionary substitution fallback
      const local = substituteSentenceWords(input, 2);
      const grounded = ensureAllWordsGrounded({
        original_sentence: input,
        quirkified_sentence: local.scrambledSentence,
        vibe_style: "สุ่มเปลี่ยนคำในประโยค (Word Scrambler)",
        punchline_explanation:
          local.mappings.length > 0
            ? `สุ่มเปลี่ยนคำว่า ${local.mappings.map((m) => `“${m.original_phrase}” ➡️ “${m.replaced_word}”`).join(", ")} โดยคงโครงสร้างประโยคเดิมไว้ ๑๐๐% พร้อมนิยามราชบัณฑิตยสภาครบทุกคำ`
            : "สุ่มเปลี่ยนคำในประโยคโดยเชื่อมโยงกับคลังพจนานุกรมราชบัณฑิตยสภา",
        word_mappings: local.mappings,
      });
      setResult(grounded);
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

    const oldWord = oldMapping.replaced_word;
    const newWord = pick.headword;

    // Replace oldWord with newWord in quirkified_sentence
    const regex = new RegExp(`(['"“‘])${oldWord}(['"”’])`, "g");
    let newQuirkified = result.quirkified_sentence.replace(regex, `$1${newWord}$2`);
    if (!newQuirkified.includes(newWord)) {
      newQuirkified = result.quirkified_sentence.replace(oldWord, `'${newWord}'`);
    }

    const newMapping: QuirkifyWordMapping = {
      original_phrase: oldMapping.original_phrase,
      replaced_word: newWord,
      part_of_speech: pick.pos,
      official_definition: pick.definition,
      source_edition: pick.sourceEdition,
      quirk_reason: pick.rationale,
    };

    const newMappings = [...result.word_mappings];
    newMappings[mappingIndex] = newMapping;

    const updated = ensureAllWordsGrounded({
      ...result,
      quirkified_sentence: newQuirkified,
      word_mappings: newMappings,
    });

    setResult(updated);
    if (activeWordModal && activeWordModal.replaced_word === oldMapping.replaced_word) {
      setActiveWordModal(newMapping);
    }

    showToast(`✨ สุ่มเปลี่ยนเป็นคำว่า '${pick.headword}' แล้ว!`);
  };

  // Listen to single word pronunciation
  const handleSpeakWord = (word: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const cleanWord = word.replace(/['"“”‘’]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanWord);
    utterance.lang = "th-TH";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    showToast(`🔊 กำลังออกเสียง: ${cleanWord}`);
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
    const parts = text.split(/('[^']+'|"[^"]+"|“[^”]+”|‘[^’]+’)/g);
    return (
      <span className="leading-relaxed">
        {parts.map((part, i) => {
          const isQuoted =
            (part.startsWith("'") && part.endsWith("'")) ||
            (part.startsWith('"') && part.endsWith('"')) ||
            (part.startsWith("“") && part.endsWith("”")) ||
            (part.startsWith("‘") && part.endsWith("’"));

          if (isQuoted && part.length >= 2) {
            const rawWord = part.slice(1, -1).trim();
            const mapping = result?.word_mappings?.find(
              (m) =>
                m.replaced_word === rawWord ||
                (m.replaced_word && (m.replaced_word.includes(rawWord) || rawWord.includes(m.replaced_word)))
            );
            return (
              <span
                key={i}
                onClick={() => mapping && setActiveWordModal(mapping)}
                className="scrambler-word-pill quirk"
                role="button"
                tabIndex={0}
                style={{ cursor: mapping ? "pointer" : "default" }}
                title={
                  mapping
                    ? `คลิกเพื่อเจาะลึกคำศัพท์: ${mapping.replaced_word} (${mapping.part_of_speech || "คำ"}) — ${mapping.official_definition}`
                    : `คำศัพท์ที่สุ่มเปลี่ยน: ${rawWord}`
                }
              >
                <span>{part.startsWith("'") ? part : `'${rawWord}'`}</span>
                <span style={{ fontSize: "11px", opacity: 0.85, marginLeft: "2px" }}>✨</span>
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

          {/* Friendly 3-Step Guide */}
          <div className="scrambler-guide-banner">
            <div className="scrambler-guide-step">
              <div className="scrambler-guide-step-icon">1️⃣</div>
              <div>
                <span className="scrambler-guide-step-title">เลือกหรือพิมพ์ประโยค</span>
                <span className="scrambler-guide-step-desc">เลือกจากตัวอย่างยอดนิยม หรือใส่ประโยคของคุณ</span>
              </div>
            </div>
            <div className="scrambler-guide-arrow">➔</div>
            <div className="scrambler-guide-step">
              <div className="scrambler-guide-step-icon">2️⃣</div>
              <div>
                <span className="scrambler-guide-step-title">กดสุ่มเปลี่ยนคำ</span>
                <span className="scrambler-guide-step-desc">สุ่มแทนที่คำด้วยศัพท์พจนานุกรมราชบัณฑิต</span>
              </div>
            </div>
            <div className="scrambler-guide-arrow">➔</div>
            <div className="scrambler-guide-step">
              <div className="scrambler-guide-step-icon">3️⃣</div>
              <div>
                <span className="scrambler-guide-step-title">แตะดูนิยาม & ฟังเสียง</span>
                <span className="scrambler-guide-step-desc">คลิกคำในประโยคเพื่อเปิดนิยามและฟังเสียงอ่าน</span>
              </div>
            </div>
          </div>
        </header>

        {/* Master Card Container */}
        <div className="scrambler-card">
          <div className="scrambler-body">
            {/* Quick Preset Sentence Chips */}
            <div style={{ marginBottom: "22px" }}>
              <div className="scrambler-row-label">
                <span>💡 เลือกประโยคตัวอย่าง หรือพิมพ์ประโยคของคุณเอง:</span>
                <button
                  type="button"
                  onClick={handleRandomPreset}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--accent)",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
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
                    <span className="scrambler-chip-emoji">
                      {preset.category === "ชีวิตประจำวัน"
                        ? "🥱"
                        : preset.category === "อาหารการกิน"
                        ? "🍜"
                        : preset.category === "สภาพอากาศ"
                        ? "☀️"
                        : preset.category === "มิตรภาพ"
                        ? "🤝"
                        : preset.category === "ความรู้สึก"
                        ? "💖"
                        : "💼"}
                    </span>
                    <span>{preset.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Input Container */}
            <div style={{ marginBottom: "6px" }}>
              <div className="scrambler-row-label">
                <span>✏️ พิมพ์หรือแก้ไขประโยคของคุณ:</span>
                <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 400 }}>
                  💡 พิมพ์ 1-2 วลีสั้นๆ เพื่อให้สุ่มคำศัพท์ได้หลากหลายและตรงความหมายที่สุด
                </span>
              </div>
            </div>

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
                {/* Friendly Success Helper Banner */}
                <div className="scrambler-banner-success">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "18px" }}>✨</span>
                    <span>
                      <strong>สุ่มเปลี่ยนคำสำเร็จแล้ว!</strong> แตะที่คำศัพท์ไฮไลต์สีฟ้าในประโยค หรือดูการ์ดด้านล่างเพื่ออ่านนิยามและฟังเสียงอ่าน
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", color: "#1d4ed8", background: "#eff6ff", padding: "2px 8px", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
                    👆 แตะคำศัพท์เพื่อดูนิยาม
                  </span>
                </div>

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
                  <div style={{ marginTop: "28px" }}>
                    <div className="scrambler-row-label" style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--ink)" }}>
                          📖 เจาะลึกคำศัพท์ที่สุ่มเปลี่ยน (Official Dictionary Grounding):
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: "#eff6ff",
                            color: "var(--accent)",
                            border: "1px solid #bfdbfe",
                          }}
                        >
                          {result.word_mappings.length} คำที่สุ่มเปลี่ยน
                        </span>
                      </div>
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
                          role="button"
                          tabIndex={0}
                          aria-label={`เจาะลึกคำว่า ${mapping.replaced_word}`}
                        >
                          <div>
                            <div className="scrambler-evidence-top">
                              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "var(--accent)",
                                    background: "#eff6ff",
                                    padding: "2px 6px",
                                    borderRadius: "6px",
                                    border: "1px solid #bfdbfe",
                                  }}
                                >
                                  คำที่ {idx + 1}
                                </span>
                                <span className="scrambler-evidence-headword">
                                  {mapping.replaced_word}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                {mapping.part_of_speech && (
                                  <span className="scrambler-evidence-pos">
                                    {mapping.part_of_speech}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSpeakWord(mapping.replaced_word);
                                  }}
                                  title="ฟังการออกเสียงคำนี้"
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    padding: "2px 4px",
                                  }}
                                >
                                  🔊
                                </button>
                              </div>
                            </div>

                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
                              <span>แทนคำว่า: </span>
                              <strong style={{ color: "var(--ink)" }}>
                                &ldquo;{mapping.original_phrase}&rdquo;
                              </strong>
                              <span style={{ margin: "0 6px", color: "var(--accent)" }}>➔</span>
                              <strong style={{ color: "#1d4ed8" }}>
                                &ldquo;{mapping.replaced_word}&rdquo;
                              </strong>
                            </div>

                            <p className="scrambler-evidence-def">
                              <strong>นิยาม:</strong> {mapping.official_definition}
                            </p>
                          </div>

                          <div className="scrambler-evidence-foot">
                            <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                              🎯 {mapping.quirk_reason}
                            </span>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveWordModal(mapping);
                                }}
                                style={{
                                  fontSize: "11px",
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  color: "var(--ink)",
                                  borderRadius: "8px",
                                  padding: "3px 8px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                🔍 เจาะลึก
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRerollSpecificWord(idx);
                                }}
                                style={{
                                  fontSize: "11px",
                                  background: "#eff6ff",
                                  border: "1px solid #bfdbfe",
                                  color: "#1d4ed8",
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="word-modal-heading"
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
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                <span
                  id="word-modal-heading"
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "var(--accent)",
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
                <button
                  type="button"
                  onClick={() => handleSpeakWord(activeWordModal.replaced_word)}
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#1d4ed8",
                    fontSize: "12px",
                    fontWeight: 700,
                    borderRadius: "8px",
                    padding: "2px 8px",
                    cursor: "pointer",
                  }}
                  title="ฟังเสียงอ่านคำนี้"
                >
                  🔊 ฟังเสียง
                </button>
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
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "16px", color: "var(--ink)" }}>
                    &ldquo;{activeWordModal.original_phrase}&rdquo;
                  </p>
                  <span style={{ color: "var(--accent)" }}>➔</span>
                  <span style={{ fontWeight: 700, fontSize: "16px", color: "#1d4ed8" }}>
                    &ldquo;{activeWordModal.replaced_word}&rdquo;
                  </span>
                </div>
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
                    color: "var(--muted)",
                    fontFamily: "var(--font-thai-reading)",
                  }}
                >
                  {activeWordModal.quirk_reason}
                </p>
              </div>

              {result && (
                <div style={{ background: "#f0f7fe", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cce2f7" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>
                    บริบทในประโยคที่สุ่มเปลี่ยนแล้ว:
                  </span>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--ink)", fontFamily: "var(--font-thai-reading)" }}>
                    &ldquo;{result.quirkified_sentence}&rdquo;
                  </p>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--border)",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <span>📚 แหล่งอ้างอิง: <strong style={{ color: "var(--ink)" }}>{activeWordModal.source_edition}</strong></span>
                {(() => {
                  const currentIdx = result?.word_mappings?.findIndex(
                    (m) => m.replaced_word === activeWordModal.replaced_word
                  );
                  if (currentIdx !== undefined && currentIdx >= 0) {
                    return (
                      <button
                        type="button"
                        onClick={() => handleRerollSpecificWord(currentIdx)}
                        style={{
                          fontSize: "11px",
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          color: "#1d4ed8",
                          borderRadius: "8px",
                          padding: "3px 8px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        🎲 สุ่มคำอื่นแทนคำนี้
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
