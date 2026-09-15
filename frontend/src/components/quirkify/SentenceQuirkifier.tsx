"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  quirkifySentence,
  type QuirkifyResponse,
  type QuirkifyWordMapping,
} from "@/lib/api-client";
import {
  CHALLENGE_CATEGORIES,
  CHALLENGE_WORDS,
  type ChallengeWord,
  segmentThaiClusters,
  scrambleClusters,
  formatChallengeShare,
} from "@/lib/word-scrambler-data";

type MasterTab = "word" | "quirkify" | "beautify";
type ScrambleAlgorithm = "anagram" | "spoonerism" | "syllable";

interface PresetCategory {
  id: string;
  label: string;
  icon: string;
  items: string[];
}

const QUIRKIFY_CATEGORIZED_PRESETS: PresetCategory[] = [
  {
    id: "office",
    label: "💼 ชีวิตออฟฟิศ",
    icon: "💼",
    items: [
      "วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว",
      "ขอโทษที่ตอบช้า พอดีงานยุ่งมาก",
      "เบื่องานประจำ อยากลาออกไปเปิดร้านกาแฟ",
      "ประชุมทั้งวัน งานตัวเองยังไม่ได้เริ่มทำเลย",
    ],
  },
  {
    id: "lifestyle",
    label: "☕ ไลฟ์สไตล์",
    icon: "☕",
    items: [
      "หิวข้าวมาก เที่ยงนี้ไปกินอะไรกันดี",
      "อากาศร้อนขนาดนี้ ไม่อยากก้าวเท้าออกจากห้องเลย",
      "ชานมไข่มุกหวานร้อย คือพลังชีวิตของวันนี้",
      "วันหยุดผ่านไปไวเหมือนโกหก พรุ่งนี้วันจันทร์อีกแล้ว",
    ],
  },
  {
    id: "meme",
    label: "🎭 มีม & กวน",
    icon: "🎭",
    items: [
      "อย่ามาโม้หน่อยเลย ฉันรู้ทันหมดแล้ว",
      "เพื่อนชอบแย่งกินขนมตลอดเลย",
      "นอนดึกตื่นสาย เป็นสูตรลับความสำเร็จ",
      "เห็นเงียบๆ ฟาดเรียบทุกจานนะบอกเลย",
    ],
  },
  {
    id: "romance",
    label: "🌸 ความรู้สึก",
    icon: "🌸",
    items: [
      "คิดถึงเธอจัง เมื่อไหร่จะได้เจอกัน",
      "ขอบใจมากนะแก ช่วยชีวิตไว้แท้ๆ",
      "อย่าคิดมากเลย เดี๋ยวทุกอย่างก็ดีขึ้นเอง",
      "เหงาจัง อยากมีคนพาไปกินบุฟเฟต์",
    ],
  },
];

const BEAUTIFY_CATEGORIZED_PRESETS: PresetCategory[] = [
  {
    id: "courtesy",
    label: "🕊️ สุภาพชน",
    icon: "🕊️",
    items: [
      "กินข้าวกันเหอะ หิวจะตายอยู่แล้ว",
      "แกพูดอะไรวะ ไม่เห็นเข้าใจเลย",
      "ช่วยงานหน่อยดิ ด่วนมากๆ เลย",
      "ขอบใจมากนะแก ช่วยชีวิตไว้แท้ๆ",
    ],
  },
  {
    id: "poetic",
    label: "🌸 ร้อยแก้ว",
    icon: "🌸",
    items: [
      "ไปเที่ยวกันไหม อากาศดีมากเลยวันนี้",
      "อย่าคิดมากเลย เดี๋ยวทุกอย่างก็ดีขึ้นเอง",
      "ฝนตกทั้งวัน เหงาและคิดถึงวันเก่าๆ",
      "ดอกไม้ในสวนกำลังบาน สวยงามมากจริงๆ",
    ],
  },
  {
    id: "speech",
    label: "👑 สุนทรพจน์",
    icon: "👑",
    items: [
      "งานเยอะชิบเป๋ง เหนื่อยมากไม่อยากทำไรเลย",
      "พวกเราต้องร่วมมือกันทำให้โปรเจกต์นี้สำเร็จ",
      "อย่าเพิ่งยอมแพ้ หนทางยังอีกยาวไกล",
      "ความพยายามของทุกคนจะนำพาความสำเร็จมาให้",
    ],
  },
];

const QUIRKIFY_STYLES = [
  {
    id: "ancient",
    label: "โบราณพงศาวดาร",
    subtitle: "ราชสำนัก กรุงเก่า วรรณคดีศักดิ์สิทธิ์",
    icon: "📜",
  },
  {
    id: "formal",
    label: "วิชาการราชการขั้นสุด",
    subtitle: "ศัพท์กฎหมาย มติ ครม. ระเบียบปฏิบัติ",
    icon: "🏛️",
  },
  {
    id: "meme",
    label: "สำนวนกวีปั่นประสาท",
    subtitle: "เปรียบเปรยเว่อร์วัง ตลกหน้าตาย โศกนาฏกรรม",
    icon: "🎭",
  },
  {
    id: "dialect",
    label: "ภาษาถิ่นสำนวนท้าทาย",
    subtitle: "รสชาติพื้นบ้าน เหนือ อีสาน ใต้ ปนทางการ",
    icon: "🪕",
  },
];

const BEAUTIFY_STYLES = [
  {
    id: "poetic",
    label: "วรรณศิลป์ร้อยแก้ว",
    subtitle: "ภาษาวรรณกรรม คล้องจอง นุ่มนวลละมุนใจ",
    icon: "🌸",
  },
  {
    id: "gentle",
    label: "สุภาพชนชั้นสูง",
    subtitle: "ทางการ ละมุนละไม นุ่มนวลให้เกียรติ",
    icon: "🕊️",
  },
  {
    id: "grand",
    label: "สุนทรพจน์เฉลิมฉลอง",
    subtitle: "ถ้อยคำทรงคุณค่า สง่างาม สร้างพลังใจ",
    icon: "👑",
  },
  {
    id: "minimal",
    label: "คมคายลึกซึ้งสงบงาม",
    subtitle: "ปรัชญา เรียบง่าย ชวนหยุดครุ่นคิด",
    icon: "🍃",
  },
];

export default function SentenceQuirkifier({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  // Master Tab
  const [masterTab, setMasterTab] = useState<MasterTab>("word");

  // --- Tab 1: Word Scrambler States ---
  const [selectedCategory, setSelectedCategory] = useState<string>("general");
  const [activeAlgorithm, setActiveAlgorithm] = useState<ScrambleAlgorithm>("anagram");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [customWordInput, setCustomWordInput] = useState("");
  const [activeWordObj, setActiveWordObj] = useState<ChallengeWord>(CHALLENGE_WORDS[0]);

  // Letters & Tray
  const [originalClusters, setOriginalClusters] = useState<string[]>([]);
  const [scrambledTiles, setScrambledTiles] = useState<
    Array<{ id: string; char: string; isUsed: boolean }>
  >([]);
  const [trayTiles, setTrayTiles] = useState<
    Array<{ rackId: string; char: string }>
  >([]);
  const [textGuess, setTextGuess] = useState("");
  const [isSolved, setIsSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [wordToast, setWordToast] = useState<string | null>(null);

  // --- Tab 2 & 3: Sentence Quirkifier / Beautifier States ---
  const [sentence, setSentence] = useState(QUIRKIFY_CATEGORIZED_PRESETS[0].items[0]);
  const [selectedStyle, setSelectedStyle] = useState("ancient");
  const [activePresetCategory, setActivePresetCategory] = useState("office");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuirkifyResponse | null>(null);
  const [copiedSentence, setCopiedSentence] = useState(false);
  const [copiedWithDef, setCopiedWithDef] = useState(false);
  const [activeWordModal, setActiveWordModal] = useState<QuirkifyWordMapping | null>(null);

  // Audio Player
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);

  // Quote Card Modal
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteTheme, setQuoteTheme] = useState<"gold" | "rose" | "dark" | "ocean">("gold");

  // Recent History
  const [history, setHistory] = useState<Array<{ text: string; transformed: string; mode: string }>>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Word Scrambler tiles when activeWordObj changes
  useEffect(() => {
    initWordScramble(activeWordObj.headword);
  }, [activeWordObj]);

  const initWordScramble = (word: string) => {
    const clusters = segmentThaiClusters(word);
    setOriginalClusters(clusters);

    const shuffled = scrambleClusters(clusters);
    const tiles = shuffled.map((char, index) => ({
      id: `tile-${index}`,
      char,
      isUsed: false,
    }));

    setScrambledTiles(tiles);
    setTrayTiles([]);
    setTextGuess("");
    setIsSolved(false);
    setShowHint(false);
    setShowReveal(false);
  };

  // Move tile from Rack to Tray
  const handleTileClick = (tileId: string) => {
    const tile = scrambledTiles.find((t) => t.id === tileId);
    if (!tile || tile.isUsed) return;

    setScrambledTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, isUsed: true } : t))
    );

    const newTray = [...trayTiles, { rackId: tile.id, char: tile.char }];
    setTrayTiles(newTray);
    const currentWord = newTray.map((t) => t.char).join("");
    setTextGuess(currentWord);
    if (currentWord === activeWordObj.headword) {
      triggerSuccess();
    }
  };

  // Remove tile from Tray and return to Rack
  const handleTrayTileClick = (trayIndex: number) => {
    const item = trayTiles[trayIndex];
    if (!item) return;

    const newTray = trayTiles.filter((_, idx) => idx !== trayIndex);
    setTrayTiles(newTray);
    setScrambledTiles((prev) =>
      prev.map((t) => (t.id === item.rackId ? { ...t, isUsed: false } : t))
    );

    const currentWord = newTray.map((t) => t.char).join("");
    setTextGuess(currentWord);
  };

  // Handle direct text typing in input
  const handleTextGuessChange = (val: string) => {
    setTextGuess(val);
    if (val.trim() === activeWordObj.headword) {
      triggerSuccess();
    }
  };

  const triggerSuccess = () => {
    setIsSolved(true);
    showToastMessage("🎉 ยอดเยี่ยมมาก! คุณแก้ปริศนาสำเร็จแล้ว");
    speakWord(activeWordObj.headword);
  };

  const handleReshuffle = () => {
    initWordScramble(activeWordObj.headword);
    showToastMessage("🔀 สลับตัวอักษรใหม่แล้ว!");
  };

  const handleReveal = () => {
    setShowReveal(true);
    setIsSolved(true);
    speakWord(activeWordObj.headword);
  };

  const handleNextWord = () => {
    const filtered = CHALLENGE_WORDS.filter((w) =>
      selectedCategory === "all" ? true : w.category === selectedCategory
    );
    if (filtered.length === 0) return;

    const nextIdx = (currentWordIndex + 1) % filtered.length;
    setCurrentWordIndex(nextIdx);
    setActiveWordObj(filtered[nextIdx]);
  };

  const handleSelectChallengeWord = (word: ChallengeWord) => {
    setActiveWordObj(word);
    if (word.category === "spoonerism") {
      setActiveAlgorithm("spoonerism");
    } else if (activeAlgorithm === "spoonerism") {
      setActiveAlgorithm("anagram");
    }
  };

  const handleCustomWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = customWordInput.trim();
    if (!w) return;
    const customObj: ChallengeWord = {
      id: `custom-${Date.now()}`,
      headword: w,
      pos: "น./ก./ว.",
      definition: "คำที่ผู้ใช้กำหนดเองเพื่อท้าทายตนเองและเพื่อน",
      category: "general",
      hint: `คำภาษาไทย ความยาว ${w.length} ตัวอักษร`,
    };
    setActiveWordObj(customObj);
    setCustomWordInput("");
    showToastMessage(`✨ เริ่มปั่นคำ '${w}' เรียบร้อยแล้ว!`);
  };

  const handleCopyChallenge = () => {
    const text = formatChallengeShare(
      activeWordObj.headword,
      activeWordObj.hint || activeWordObj.definition,
      scrambledTiles.map((t) => t.char)
    );
    navigator.clipboard.writeText(text);
    showToastMessage("📋 คัดลอกโจทย์ทายเพื่อนเรียบร้อย! นำไปแชร์ใน LINE / Social ได้เลย");
  };

  const showToastMessage = (msg: string) => {
    setWordToast(msg);
    setTimeout(() => setWordToast(null), 3500);
  };

  // Text-to-speech for words and sentences
  const speakWord = (textToSpeak: string, rate: number = 0.95) => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      typeof SpeechSynthesisUtterance === "undefined"
    )
      return;
    window.speechSynthesis.cancel();
    const clean = textToSpeak.replace(/['"“”]/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "th-TH";
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

  // Handle master tab switch
  const handleSwitchMasterTab = (tab: MasterTab) => {
    setMasterTab(tab);
    setError(null);
    if (tab === "beautify") {
      setSelectedStyle("poetic");
      setActivePresetCategory("courtesy");
      setSentence(BEAUTIFY_CATEGORIZED_PRESETS[0].items[0]);
    } else if (tab === "quirkify") {
      setSelectedStyle("ancient");
      setActivePresetCategory("office");
      setSentence(QUIRKIFY_CATEGORIZED_PRESETS[0].items[0]);
    }
  };

  // Transform Sentence Action (Quirkify / Beautify)
  const handleTransform = async () => {
    if (!sentence.trim()) return;
    setLoading(true);
    setError(null);
    const mode = masterTab === "beautify" ? "beautify" : "quirkify";
    try {
      const res = await quirkifySentence(sentence, selectedStyle, mode);
      setResult(res);

      // Save to recent history
      setHistory((prev) => [
        {
          text: sentence,
          transformed: res.quirkified_sentence,
          mode,
        },
        ...prev.slice(0, 4),
      ]);
    } catch (err: any) {
      setError(err?.message || "ไม่สามารถประมวลผลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleCopySentenceOnly = () => {
    if (!result?.quirkified_sentence) return;
    navigator.clipboard.writeText(result.quirkified_sentence);
    setCopiedSentence(true);
    setTimeout(() => setCopiedSentence(false), 2000);
  };

  const handleCopyWithCitation = () => {
    if (!result) return;
    const mappingsText = result.word_mappings
      ?.map(
        (m) =>
          `• ${m.replaced_word} (${m.part_of_speech || "น."}): ${m.official_definition} [${m.source_edition}]`
      )
      .join("\n");

    const fullCopy = [
      `“${result.quirkified_sentence}”`,
      ``,
      `สไตล์: ${result.vibe_style}`,
      `คำอธิบาย: ${result.punchline_explanation}`,
      mappingsText ? `\nอ้างอิงพจนานุกรมราชบัณฑิตยสภา:\n${mappingsText}` : "",
      `\nสำรวจคำศัพท์และความหมายบริบทได้ที่ THAI CONTEXT`,
    ].join("\n");

    navigator.clipboard.writeText(fullCopy);
    setCopiedWithDef(true);
    setTimeout(() => setCopiedWithDef(false), 2000);
  };

  const handleToggleAudio = () => {
    if (!result?.quirkified_sentence || typeof window === "undefined") return;
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      alert("เบราว์เซอร์ของคุณยังไม่รองรับ Web Speech API");
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
    utterance.rate = audioSpeed;
    utterance.pitch = masterTab === "beautify" ? 1.02 : 1.0;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSentence(text.slice(0, 300));
        textareaRef.current?.focus();
      }
    } catch {
      // Fallback
    }
  };

  const handleRandomPreset = () => {
    const presetsGroup =
      masterTab === "beautify"
        ? BEAUTIFY_CATEGORIZED_PRESETS
        : QUIRKIFY_CATEGORIZED_PRESETS;

    const allPresets = presetsGroup.flatMap((g) => g.items);
    const others = allPresets.filter((p) => p !== sentence);
    const pick = others[Math.floor(Math.random() * others.length)];
    setSentence(pick);
  };

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to run
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleTransform();
    }
  };

  // Render interactive sentence with word pills
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
                className={`scrambler-word-pill ${
                  masterTab === "beautify" ? "beauty" : "quirk"
                }`}
                title={
                  mapping
                    ? `คลิกดูนิยามราชบัณฑิตยสภา: ${mapping.official_definition}`
                    : undefined
                }
              >
                <span>{part}</span>
                <span style={{ fontSize: "11px", opacity: 0.8 }}>
                  {masterTab === "beautify" ? "🌸" : "✨"}
                </span>
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  const currentStyles =
    masterTab === "beautify" ? BEAUTIFY_STYLES : QUIRKIFY_STYLES;
  const currentCategories =
    masterTab === "beautify"
      ? BEAUTIFY_CATEGORIZED_PRESETS
      : QUIRKIFY_CATEGORIZED_PRESETS;
  const activePresetList =
    currentCategories.find((c) => c.id === activePresetCategory)?.items ||
    currentCategories[0].items;

  return (
    <section
      id="word-scrambler"
      data-section="quirkify"
      className={`scrambler-section ${embedded ? "embedded" : ""}`}
      aria-labelledby="scrambler-main-heading"
    >
      {/* Invisible anchor for backward compatibility with #quirkify */}
      <span id="quirkify" style={{ position: "absolute", top: -80, visibility: "hidden" }} />

      {/* Ambient Lighting Gradients */}
      <div className="scrambler-ambient-1" />
      <div className="scrambler-ambient-2" />

      {/* Floating Toast Notification */}
      {wordToast && (
        <div className="workspace-toast" role="status">
          <span>{wordToast}</span>
        </div>
      )}

      <div className="scrambler-inner">
        {/* Section Header */}
        <header className="scrambler-header">
          <div className="scrambler-badge">
            <span style={{ fontSize: "15px" }}>
              {masterTab === "word"
                ? "🔤"
                : masterTab === "beautify"
                ? "🌸"
                : "🎭"}
            </span>
            <span>
              {masterTab === "word"
                ? "THAI CONTEXT Word Scrambler"
                : masterTab === "beautify"
                ? "เครื่องมือขัดเกลาสำนวนอันวิจิตร (Reverse Beautifier)"
                : "คลังคำแปลงประโยคปั่น (Sentence Quirkifier)"}
            </span>
            <span className="scrambler-badge-tag">RAG Grounded</span>
          </div>

          <h2 id="scrambler-main-heading" className="scrambler-title">
            {masterTab === "word"
              ? "ปั่นคำปริศนา ทายอักษร & คำผวนชวนคิด"
              : masterTab === "beautify"
              ? "เกลาภาษาธรรมดา ให้ไพเราะสละสลวยงดงาม"
              : "แปลงประโยคธรรมดา เป็นสำนวนปั่นพิลึกพิลั่น"}
          </h2>

          <p className="scrambler-desc">
            {masterTab === "word"
              ? "สนุกกับการสลับตัวอักษร (Anagram), คำผวนคลาสสิก, และสลับพยางค์ พร้อมเฉลยและนิยามทางการจากคลังพจนานุกรมราชบัณฑิตยสภา"
              : masterTab === "beautify"
              ? "เปลี่ยนภาษาพูด สแลง หรือถ้อยคำห้วนๆ ให้เป็นภาษาไทยที่วิจิตร นุ่มนวล ทรงคุณค่าทางวรรณศิลป์ พร้อมคำอธิบายคลังศัพท์ทางการ"
              : "เปลี่ยนภาษาชีวิตประจำวันให้เป็นสำนวนแปลกตา อลังการ หรือปั่นประสาทอย่างมีชั้นเชิง เชื่อมโยงคำศัพท์ราชบัณฑิตยสภา ๗๗,๐๐๐+ นิยาม"}
          </p>
        </header>

        {/* Master Card Container */}
        <div className="scrambler-card">
          {/* Master 3-Way Tab Switcher */}
          <nav className="scrambler-master-tabs" aria-label="โหมดการทำงาน">
            <button
              type="button"
              onClick={() => handleSwitchMasterTab("word")}
              className={`scrambler-tab-btn ${
                masterTab === "word" ? "active-scramble" : ""
              }`}
            >
              <span>🔤</span>
              <span>ปั่นคำปริศนา (Word Scrambler & Anagram)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMasterTab("quirkify")}
              className={`scrambler-tab-btn ${
                masterTab === "quirkify" ? "active-quirkify" : ""
              }`}
            >
              <span>🎭</span>
              <span>แปลงให้ปั่น (Sentence Quirkifier)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchMasterTab("beautify")}
              className={`scrambler-tab-btn ${
                masterTab === "beautify" ? "active-beautify" : ""
              }`}
            >
              <span>✨</span>
              <span>เกลาให้สละสลวย (Make Beautiful)</span>
            </button>
          </nav>

          {/* =========================================================================
              TAB 1: WORD SCRAMBLER & ANAGRAM & KHAM PUAN
              ========================================================================= */}
          {masterTab === "word" && (
            <div className="scrambler-body">
              {/* Algorithm & Mode Selection Bar */}
              <div className="scrambler-algo-bar">
                <div className="scrambler-algo-options">
                  <button
                    type="button"
                    onClick={() => setActiveAlgorithm("anagram")}
                    className={`scrambler-algo-pill ${
                      activeAlgorithm === "anagram" ? "active" : ""
                    }`}
                  >
                    <span>🔀</span>
                    <span>สลับตัวอักษร (Anagram Puzzle)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveAlgorithm("spoonerism");
                      setSelectedCategory("spoonerism");
                      const spoonerismWord = CHALLENGE_WORDS.find(
                        (w) => w.category === "spoonerism"
                      );
                      if (spoonerismWord) setActiveWordObj(spoonerismWord);
                    }}
                    className={`scrambler-algo-pill ${
                      activeAlgorithm === "spoonerism" ? "active" : ""
                    }`}
                  >
                    <span>🔄</span>
                    <span>คำผวนสุดฮา (Thai Spoonerisms)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveAlgorithm("syllable");
                      handleReshuffle();
                    }}
                    className={`scrambler-algo-pill ${
                      activeAlgorithm === "syllable" ? "active" : ""
                    }`}
                  >
                    <span>🎲</span>
                    <span>สลับพยางค์ (Syllable Shuffle)</span>
                  </button>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={handleNextWord}
                    className="scrambler-action-btn-secondary"
                  >
                    <span>🎲 สุ่มคำใหม่</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyChallenge}
                    className="scrambler-action-btn-secondary"
                    title="คัดลอกโจทย์ส่งให้เพื่อนทายใน LINE หรือ Social"
                  >
                    <span>📋 แชร์โจทย์ทายเพื่อน</span>
                  </button>
                </div>
              </div>

              {/* Curated Category Chips */}
              <div className="scrambler-category-row">
                <div className="scrambler-row-label">
                  <span>หมวดหมู่คำท้าทาย</span>
                  <span style={{ fontSize: "11px", fontWeight: 400 }}>
                    คลิกเลือกคำเพื่อเริ่มเล่นทันที
                  </span>
                </div>
                <div className="scrambler-chips-wrap">
                  {CHALLENGE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        if (cat.id === "spoonerism") {
                          setActiveAlgorithm("spoonerism");
                        }
                        const firstInCat = CHALLENGE_WORDS.find(
                          (w) => w.category === cat.id
                        );
                        if (firstInCat) setActiveWordObj(firstInCat);
                      }}
                      className={`scrambler-chip ${
                        selectedCategory === cat.id ? "selected" : ""
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Word Challenge Quick Pickers */}
              <div style={{ marginBottom: "20px" }}>
                <div className="scrambler-chips-wrap">
                  {CHALLENGE_WORDS.filter((w) =>
                    selectedCategory === "all"
                      ? true
                      : w.category === selectedCategory
                  ).map((word) => (
                    <button
                      key={word.id}
                      type="button"
                      onClick={() => handleSelectChallengeWord(word)}
                      className={`scrambler-chip ${
                        activeWordObj.id === word.id ? "selected" : ""
                      }`}
                    >
                      <span>{word.headword}</span>
                      {word.spoonerism && (
                        <span style={{ opacity: 0.6, fontSize: "11px", marginLeft: "4px" }}>
                          (ผวน)
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Word Input */}
              <form onSubmit={handleCustomWordSubmit} className="scrambler-custom-input-wrap">
                <input
                  type="text"
                  value={customWordInput}
                  onChange={(e) => setCustomWordInput(e.target.value)}
                  placeholder="หรือพิมพ์คำภาษาไทยที่อยากนำมาปั่น เช่น กุหลาบ, ดวงอาทิตย์, วันหยุด..."
                  className="scrambler-input-field"
                  maxLength={30}
                />
                <button type="submit" className="scrambler-action-btn-secondary">
                  <span>✨ ปั่นคำนี้!</span>
                </button>
              </form>

              {/* IF SPOONERISM MODE: Show Side-by-Side Spoonerism Card */}
              {activeAlgorithm === "spoonerism" && activeWordObj.spoonerism && (
                <div className="scrambler-puan-card">
                  <div className="scrambler-puan-grid">
                    <div className="scrambler-puan-box">
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>
                        คำตั้งต้น
                      </span>
                      <strong className="scrambler-puan-word">
                        {activeWordObj.headword}
                      </strong>
                    </div>

                    <div className="scrambler-puan-arrow">➡️ ผวนได้ ➡️</div>

                    <div className="scrambler-puan-box" style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
                      <span style={{ fontSize: "11px", color: "#991b1b", display: "block" }}>
                        คำผวนสุดปั่น
                      </span>
                      <strong className="scrambler-puan-word" style={{ color: "#b91c1c" }}>
                        {activeWordObj.spoonerism.puanResult}
                      </strong>
                    </div>
                  </div>

                  <div className="scrambler-puan-meta">
                    <p style={{ margin: "0 0 6px" }}>
                      <strong>📖 กลไกทางสัทศาสตร์:</strong> {activeWordObj.spoonerism.explanation}
                    </p>
                    <p style={{ margin: 0, color: "#c2410c" }}>
                      <strong>😂 ความหมายชวนหัวเราะ:</strong> {activeWordObj.spoonerism.funMeaning}
                    </p>
                  </div>
                </div>
              )}

              {/* Scrambled Letter Tiles Rack */}
              <div className="scrambler-rack-container">
                <div className="scrambler-rack-label">
                  <span>🔤 แป้นตัวอักษรสลับ (คลิกเพื่อนำขึ้นไปเรียงคำตอบ)</span>
                </div>

                <div className="scrambler-rack-tiles">
                  {scrambledTiles.map((tile) => (
                    <button
                      key={tile.id}
                      type="button"
                      disabled={tile.isUsed}
                      onClick={() => handleTileClick(tile.id)}
                      className={`scrambler-tile ${tile.isUsed ? "used" : ""}`}
                      aria-label={`ตัวอักษร ${tile.char}`}
                    >
                      {tile.char}
                    </button>
                  ))}
                </div>
              </div>

              {/* Answer / Guess Tray */}
              <div className="scrambler-tray-container">
                <div className="scrambler-tray-header">
                  <span className="scrambler-tray-title">
                    <span>🎯 ถาดเรียงคำตอบของคุณ:</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 400 }}>
                      (คลิกตัวอักษรในถาดเพื่อส่งกลับคืนแป้น หรือพิมพ์ในช่องด้านล่าง)
                    </span>
                  </span>

                  {trayTiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => initWordScramble(activeWordObj.headword)}
                      style={{
                        fontSize: "12px",
                        color: "var(--muted)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      ล้างทั้งหมด
                    </button>
                  )}
                </div>

                <div className="scrambler-tray-slots">
                  {trayTiles.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTrayTileClick(idx)}
                      className="scrambler-tray-tile"
                      title="คลิกเพื่อนำออกจากถาด"
                    >
                      {item.char}
                    </button>
                  ))}

                  {/* Empty slots placeholders */}
                  {Array.from({
                    length: Math.max(0, originalClusters.length - trayTiles.length),
                  }).map((_, i) => (
                    <div key={`empty-${i}`} className="scrambler-empty-slot" />
                  ))}
                </div>

                {/* Direct Typing Input Box */}
                <div style={{ marginTop: "18px", maxWidth: "420px", marginInline: "auto" }}>
                  <input
                    type="text"
                    value={textGuess}
                    onChange={(e) => handleTextGuessChange(e.target.value)}
                    placeholder="หรือพิมพ์คำตอบของคุณที่นี่..."
                    className="scrambler-input-field"
                    style={{ textAlign: "center", fontSize: "18px", fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="scrambler-controls-bar">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="scrambler-ctrl-btn"
                >
                  <span>💡</span>
                  <span>{showHint ? "ซ่อนคำใบ้" : "ดูคำใบ้"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReshuffle}
                  className="scrambler-ctrl-btn"
                >
                  <span>🔀</span>
                  <span>สลับตัวอักษรใหม่</span>
                </button>

                <button
                  type="button"
                  onClick={handleReveal}
                  className="scrambler-ctrl-btn"
                >
                  <span>🎯</span>
                  <span>เฉลยคำตอบ</span>
                </button>

                <button
                  type="button"
                  onClick={() => speakWord(activeWordObj.headword)}
                  className="scrambler-ctrl-btn"
                >
                  <span>🔊</span>
                  <span>ฟังการออกเสียง</span>
                </button>
              </div>

              {/* Hint Callout Box */}
              {showHint && (
                <div className="scrambler-hint-callout">
                  <span className="scrambler-hint-title">
                    <span>💡 คำใบ้จากพจนานุกรมราชบัณฑิตยสภา:</span>
                  </span>
                  <p className="scrambler-hint-text">
                    • <strong>ประเภทคำ:</strong> {activeWordObj.pos}
                    <br />
                    • <strong>คำใบ้บริบท:</strong> {activeWordObj.hint || activeWordObj.definition}
                    <br />
                    • <strong>ความยาว:</strong> {activeWordObj.headword.length} ตัวอักษร (ขึ้นต้นด้วย &ldquo;{originalClusters[0]}&rdquo;)
                  </p>
                </div>
              )}

              {/* Success / Reveal Card */}
              {(isSolved || showReveal) && (
                <div className="scrambler-success-card">
                  <div className="scrambler-success-header">
                    <span className="scrambler-success-title">
                      <span>{showReveal ? "🎯 เฉลยคำตอบ:" : "🎉 ยอดเยี่ยมมาก! คำตอบถูกต้อง:"}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => speakWord(activeWordObj.headword)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "12px",
                        background: "#fff",
                        border: "1px solid #a7f3d0",
                        color: "#065f46",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      🔊 ฟังเสียงอ่าน
                    </button>
                  </div>

                  <div className="scrambler-success-headword">
                    {activeWordObj.headword}{" "}
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#059669" }}>
                      ({activeWordObj.pos})
                    </span>
                  </div>

                  <p className="scrambler-success-def">
                    <strong>นิยามทางการ:</strong> {activeWordObj.definition}
                  </p>
                  <span style={{ fontSize: "11px", color: "#059669", opacity: 0.8 }}>
                    📚 แหล่งข้อมูล: พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔
                  </span>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 2 & 3: SENTENCE QUIRKIFIER & REVERSE BEAUTIFIER
              ========================================================================= */}
          {(masterTab === "quirkify" || masterTab === "beautify") && (
            <div className="scrambler-body">
              {/* Style Selector Grid */}
              <div style={{ marginBottom: "20px" }}>
                <span className="scrambler-row-label">
                  <span>🎨 1. เลือกสไตล์และระดับภาษา ({masterTab === "beautify" ? "Elegance Level" : "Quirk Vibe"})</span>
                </span>

                <div className="scrambler-styles-grid">
                  {currentStyles.map((st) => {
                    const active = selectedStyle === st.id;
                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStyle(st.id)}
                        className={`scrambler-style-card ${
                          active
                            ? masterTab === "beautify"
                              ? "active-beauty"
                              : "active-quirk"
                            : ""
                        }`}
                      >
                        <div className="scrambler-style-top">
                          <span className="scrambler-style-icon">{st.icon}</span>
                          <span className="scrambler-style-name">{st.label}</span>
                        </div>
                        <span className="scrambler-style-sub">{st.subtitle}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Categorized Presets */}
              <div style={{ marginBottom: "20px" }}>
                <div className="scrambler-row-label">
                  <span>
                    💡 2. {masterTab === "beautify" ? "เลือกตัวอย่างประโยคพูดที่ต้องการเกลา" : "เลือกตัวอย่างประโยคธรรมดา หรือจิ้มเพื่อลองทันที"}
                  </span>
                  <button
                    type="button"
                    onClick={handleRandomPreset}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: masterTab === "beautify" ? "#e11d48" : "#d97706",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    🎲 สุ่มประโยคตัวอย่าง
                  </button>
                </div>

                {/* Preset Category Chips */}
                <div className="scrambler-preset-tabs">
                  {currentCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActivePresetCategory(cat.id)}
                      className={`scrambler-preset-category ${
                        activePresetCategory === cat.id ? "active" : ""
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Preset Sentences Pills */}
                <div className="scrambler-chips-wrap">
                  {activePresetList.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSentence(preset)}
                      className={`scrambler-chip ${
                        sentence === preset ? "selected" : ""
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea Input */}
              <div className="scrambler-textarea-container">
                <textarea
                  ref={textareaRef}
                  rows={3}
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value.slice(0, 300))}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder={
                    masterTab === "beautify"
                      ? "พิมพ์ประโยคพูด สแลง หรือภาษาห้วนๆ เช่น กินข้าวกันเหอะ หิวจะตายอยู่แล้ว..."
                      : "พิมพ์ประโยคธรรมดาที่ต้องการแปลง เช่น วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว..."
                  }
                  className="scrambler-textarea"
                />

                <div className="scrambler-textarea-footer">
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
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
                      onClick={() => setSentence("")}
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

              {/* Submit & Meta Row */}
              <div className="scrambler-submit-row">
                <div className="scrambler-badge-grounded">
                  <span>🏛️</span>
                  <span>
                    เชื่อมโยงคลังพจนานุกรมราชบัณฑิตยสภา <strong>๗๗,๐๐๐+ นิยาม</strong>
                  </span>
                  <span style={{ color: "var(--text-muted)", marginLeft: "8px", fontSize: "11px" }}>
                    (ลัด: กด Ctrl+Enter เพื่อแปลงทันที)
                  </span>
                </div>

                <button
                  type="button"
                  disabled={loading || !sentence.trim()}
                  onClick={handleTransform}
                  className={`scrambler-btn-primary ${
                    masterTab === "beautify" ? "beauty" : "quirk"
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>
                        {masterTab === "beautify"
                          ? "กำลังขัดเกลาสำนวนอันวิจิตร..."
                          : "กำลังปรุงแต่งสำนวนปั่น..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>{masterTab === "beautify" ? "🌸" : "🎭"}</span>
                      <span>
                        {masterTab === "beautify"
                          ? "ขัดเกลาให้สละสลวย (Make Beautiful) ✦"
                          : "แปลงให้ปั่น (Quirkify) ✦"}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Error Callout */}
              {error && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fca5a5",
                    color: "#991b1b",
                    padding: "12px 18px",
                    borderRadius: "14px",
                    fontSize: "13px",
                    marginBottom: "20px",
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              {/* Recent History Strip */}
              {history.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    ประวัติการแปลงล่าสุด (คลิกเพื่อดูอีกครั้ง)
                  </span>
                  <div className="scrambler-history-strip">
                    {history.map((h, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSentence(h.text);
                          setResult({
                            original_sentence: h.text,
                            quirkified_sentence: h.transformed,
                            vibe_style:
                              h.mode === "beautify"
                                ? "วรรณศิลป์สละสลวย"
                                : "โบราณพงศาวดาร",
                            punchline_explanation: "ประวัติการแปลงที่บันทึกไว้ในเซสชัน",
                            word_mappings: [],
                          });
                        }}
                        className="scrambler-history-pill"
                      >
                        {h.mode === "beautify" ? "🌸" : "🎭"} &ldquo;{h.text.slice(0, 22)}...&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* =====================================================================
                  TRANSFORM RESULTS DISPLAY AREA
                  ===================================================================== */}
              {result && (
                <div className="scrambler-result-wrap">
                  <div className="scrambler-result-grid">
                    {/* Left: Original Sentence Box */}
                    <div className="scrambler-orig-box">
                      <div>
                        <div className="scrambler-orig-label">
                          <span>📝 ประโยคตั้งต้น:</span>
                        </div>
                        <p className="scrambler-orig-text">
                          &ldquo;{result.original_sentence}&rdquo;
                        </p>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {masterTab === "beautify" ? "ภาษาพูด / ห้วนๆ" : "ภาษาพูดทั่วไป"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(result.original_sentence);
                            showToastMessage("คัดลอกประโยคตั้งต้นแล้ว");
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

                    {/* Right: Transformed Box */}
                    <div
                      className={`scrambler-transformed-box ${
                        masterTab === "beautify" ? "beauty" : "quirk"
                      }`}
                    >
                      <div>
                        <div className="scrambler-transformed-top">
                          <span className="scrambler-vibe-pill">
                            <span>{masterTab === "beautify" ? "🌸 สุนทรียภาพ:" : "🎭 สไตล์:"}</span>
                            <span>{result.vibe_style}</span>
                          </span>

                          {/* Actions: Audio Player, Copy, Export Quote Card */}
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                            {/* Audio Player Bar */}
                            <div className="scrambler-audio-bar">
                              <button
                                type="button"
                                onClick={handleToggleAudio}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: isPlayingAudio ? "#d97706" : "var(--ink)",
                                  fontWeight: 700,
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                <span>{isPlayingAudio ? "⏹️ หยุด" : "🔊 ฟังเสียง"}</span>
                              </button>

                              {isPlayingAudio && (
                                <div className="scrambler-equalizer">
                                  <div className="scrambler-eq-bar" />
                                  <div className="scrambler-eq-bar" />
                                  <div className="scrambler-eq-bar" />
                                  <div className="scrambler-eq-bar" />
                                </div>
                              )}

                              {/* Speed Selector */}
                              <select
                                value={audioSpeed}
                                onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                                style={{
                                  fontSize: "11px",
                                  border: "none",
                                  background: "transparent",
                                  color: "var(--muted)",
                                  cursor: "pointer",
                                }}
                                title="ความเร็วเสียงอ่าน"
                              >
                                <option value={0.8}>0.8x</option>
                                <option value={1.0}>1.0x</option>
                                <option value={1.25}>1.25x</option>
                              </select>
                            </div>

                            {/* Copy Buttons */}
                            <button
                              type="button"
                              onClick={handleCopySentenceOnly}
                              className="scrambler-action-btn-secondary"
                              style={{ padding: "8px 14px", fontSize: "12px" }}
                            >
                              <span>{copiedSentence ? "✓ คัดลอกแล้ว" : "📋 คัดลอกข้อความ"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleCopyWithCitation}
                              className="scrambler-action-btn-secondary"
                              style={{ padding: "8px 14px", fontSize: "12px" }}
                              title="คัดลอกพร้อมแหล่งอ้างอิงพจนานุกรมราชบัณฑิตยสภา"
                            >
                              <span>{copiedWithDef ? "✓ คัดลอกพร้อมอ้างอิงแล้ว" : "📚 คัดลอกพร้อมนิยาม"}</span>
                            </button>

                            {/* Export Quote Card */}
                            <button
                              type="button"
                              onClick={() => setShowQuoteModal(true)}
                              className="scrambler-action-btn-secondary"
                              style={{
                                padding: "8px 14px",
                                fontSize: "12px",
                                background: masterTab === "beautify" ? "#fff1f2" : "#fffbeb",
                                borderColor: masterTab === "beautify" ? "#fecdd3" : "#fde68a",
                                color: masterTab === "beautify" ? "#9f1239" : "#b45309",
                              }}
                            >
                              <span>🖼️ การ์ดคำคม</span>
                            </button>
                          </div>
                        </div>

                        {/* Main Transformed Text Display with interactive pills */}
                        <div className="scrambler-transformed-sentence">
                          {renderInteractiveSentence(result.quirkified_sentence)}
                        </div>
                      </div>

                      {/* Punchline Explanation Callout */}
                      {result.punchline_explanation && (
                        <div className="scrambler-punchline">
                          <strong>{masterTab === "beautify" ? "🌸 สุนทรียภาพทางภาษา:" : "💡 นัยยะความปั่น:"}</strong>{" "}
                          {result.punchline_explanation}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Word Mappings Breakdown */}
                  {result.word_mappings && result.word_mappings.length > 0 && (
                    <div style={{ marginTop: "24px" }}>
                      <div className="scrambler-row-label">
                        <span>
                          {masterTab === "beautify"
                            ? "📖 เจาะลึกคำสละสลวยที่นำมาขัดเกลา (Official Dictionary Evidence):"
                            : "📖 เจาะลึกคำศัพท์ที่เปลี่ยนไป (Official Dictionary Grounding):"}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: 400 }}>
                          คลิกการ์ดเพื่อดูรายละเอียดเพิ่มเติม
                        </span>
                      </div>

                      <div className="scrambler-evidence-grid">
                        {result.word_mappings.map((mapping, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActiveWordModal(mapping)}
                            className={`scrambler-evidence-card ${
                              masterTab === "beautify" ? "beauty" : ""
                            }`}
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
                                <span>{masterTab === "beautify" ? "เกลาจากคำว่า: " : "แทนคำว่า: "}</span>
                                <strong style={{ color: "var(--ink)" }}>&ldquo;{mapping.original_phrase}&rdquo;</strong>
                              </div>

                              <p className="scrambler-evidence-def">
                                <strong>นิยาม:</strong> {mapping.official_definition}
                              </p>
                            </div>

                            <div className="scrambler-evidence-foot">
                              <span style={{ color: masterTab === "beautify" ? "#9f1239" : "#b45309", fontWeight: 600 }}>
                                {masterTab === "beautify" ? "🌸 " : "🎯 "}
                                {mapping.quirk_reason}
                              </span>
                              <span>{mapping.source_edition}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          DICTIONARY EVIDENCE DETAIL MODAL
          ========================================================================= */}
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
                    color: masterTab === "beautify" ? "#be123c" : "#b45309",
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
                  {masterTab === "beautify" ? "คำเดิมก่อนขัดเกลา:" : "คำเดิมที่ถูกแทนที่:"}
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
                  {masterTab === "beautify" ? "เหตุผลความสละสลวย:" : "เหตุผลความปั่น / นัยทางภาษา:"}
                </span>
                <p
                  style={{
                    margin: "4px 0 0",
                    lineHeight: 1.6,
                    color: masterTab === "beautify" ? "#9f1239" : "#92400e",
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

      {/* =========================================================================
          QUOTE CARD MODAL SHOWCASE (Export as Visual Card)
          ========================================================================= */}
      {showQuoteModal && result && (
        <div
          className="scrambler-modal-overlay"
          onClick={() => setShowQuoteModal(false)}
        >
          <div
            className="scrambler-modal-dialog"
            style={{ maxWidth: "580px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--ink)" }}>
                🖼️ การ์ดสำนวนภาษา (Shareable Quote Card)
              </span>
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Theme Selector */}
            <div style={{ display: "flex", gap: "8px", margin: "16px 0 12px", justifyContent: "center" }}>
              {(["gold", "rose", "dark", "ocean"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setQuoteTheme(t)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: quoteTheme === t ? "2px solid #000" : "1px solid #e2e8f0",
                    background:
                      t === "gold"
                        ? "#fef3c7"
                        : t === "rose"
                        ? "#ffe4e6"
                        : t === "dark"
                        ? "#1e293b"
                        : "#e0f2fe",
                    color: t === "dark" ? "#fff" : "#000",
                    cursor: "pointer",
                  }}
                >
                  {t === "gold"
                    ? "🌟 ทองโบราณ"
                    : t === "rose"
                    ? "🌸 ราชสำนัก"
                    : t === "dark"
                    ? "🌑 ออบซิเดียน"
                    : "🌊 มหาสมุทร"}
                </button>
              ))}
            </div>

            {/* Visual Card */}
            <div className={`scrambler-quote-card-wrap ${quoteTheme}`}>
              <div style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.8, marginBottom: "12px" }}>
                THAI CONTEXT • {result.vibe_style}
              </div>

              <div className="scrambler-quote-text">
                &ldquo;{result.quirkified_sentence}&rdquo;
              </div>

              <div style={{ fontSize: "12px", opacity: 0.85, borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "12px" }}>
                {result.punchline_explanation}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `“${result.quirkified_sentence}”\n— สไตล์: ${result.vibe_style}\nสำรวจได้ที่ THAI CONTEXT Word Scrambler`
                  );
                  showToastMessage("📋 คัดลอกข้อความการ์ดคำคมแล้ว!");
                }}
                className="scrambler-action-btn-secondary"
              >
                <span>📋 คัดลอกข้อความการ์ด</span>
              </button>
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="scrambler-ctrl-btn primary"
              >
                <span>ปิดหน้าต่าง</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
