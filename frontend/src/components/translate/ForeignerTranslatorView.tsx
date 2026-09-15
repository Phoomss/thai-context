"use client";

import React, { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "../ui/Icon";
import { audioManager } from "@/lib/audio-manager";
import type {
  TranslateResult,
  SpeakerGender,
  TranslateDirection,
  PresetPhrase,
} from "@/lib/translate-types";

const PRESET_PHRASES: PresetPhrase[] = [
  // Greetings
  {
    id: "g1",
    en: "Hello / Goodbye",
    th: "สวัสดี",
    rtgs: "sa-wat-di",
    category: "greetings",
    tones: "Low - Low - Mid",
    tag: "Essential",
    culturalHint: "Always append ครับ (khrap) for men or ค่ะ (kha) for women.",
  },
  {
    id: "g2",
    en: "Thank you",
    th: "ขอบคุณ",
    rtgs: "khop-khun",
    category: "greetings",
    tones: "Low - Mid",
    tag: "Essential",
    culturalHint: "Combine with a courteous Wai when thanking elders or service staff.",
  },
  {
    id: "g3",
    en: "Sorry / Excuse me",
    th: "ขอโทษ",
    rtgs: "kho-thot",
    category: "greetings",
    tones: "Rising - Falling",
    tag: "Essential",
    culturalHint: "Use to apologize or politely catch a waiter's attention.",
  },
  {
    id: "g4",
    en: "No problem / It's alright",
    th: "ไม่เป็นไร",
    rtgs: "mai-pen-rai",
    category: "greetings",
    tones: "Falling - Mid - Mid",
    tag: "Culture",
    culturalHint: "The national phrase of Thai graciousness and easygoing forgiveness.",
  },
  {
    id: "g5",
    en: "Nice to meet you",
    th: "ยินดีที่ได้รู้จัก",
    rtgs: "yin-di-thi-dai-ru-jak",
    category: "greetings",
    tones: "Mid - Mid - Falling - Falling - High - Low",
    tag: "Social",
    culturalHint: "Respond with 'เช่นกันครับ/ค่ะ' (Likewise!).",
  },
  {
    id: "g6",
    en: "Considerate / Kreng Jai",
    th: "เกรงใจ",
    rtgs: "kreng-jai",
    category: "greetings",
    tones: "Mid - Mid",
    tag: "Deep Nuance",
    culturalHint: "The foundational Thai value of avoiding burdening or troubling others.",
  },

  // Food & Dining
  {
    id: "f1",
    en: "Not spicy please",
    th: "ไม่เผ็ด",
    rtgs: "mai-phet",
    category: "food",
    tones: "Falling - Low",
    tag: "Must-Know",
    culturalHint: "Crucial for ordering Thai food if you are sensitive to chili.",
  },
  {
    id: "f2",
    en: "A little spicy (Mild)",
    th: "เผ็ดน้อย",
    rtgs: "phet-noi",
    category: "food",
    tones: "Low - High",
    tag: "Dining",
    culturalHint: "Signals you want authentic Thai flavor with just 1 chili.",
  },
  {
    id: "f3",
    en: "Delicious!",
    th: "อร่อย",
    rtgs: "a-roi",
    category: "food",
    tones: "Low - Low",
    tag: "Compliment",
    culturalHint: "Say 'อร่อยมากครับ/ค่ะ' (Very delicious!) to make any chef beam with pride.",
  },
  {
    id: "f4",
    en: "Check please / Bill please",
    th: "เช็คบิล",
    rtgs: "chek-bin",
    category: "food",
    tones: "High - Mid",
    tag: "Dining",
    culturalHint: "Say 'เช็คบิลด้วยครับ/ค่ะ' when you are ready to pay.",
  },
  {
    id: "f5",
    en: "Vegetarian",
    th: "มังสวิรัติ",
    rtgs: "mang-sa-wi-rat",
    category: "food",
    tones: "Mid - Low - High - High",
    tag: "Dietary",
    culturalHint: "Meatless. For strict vegan with no fish sauce, ask for 'เจ' (je).",
  },
  {
    id: "f6",
    en: "Less sweet (Low sugar)",
    th: "หวานน้อย",
    rtgs: "wan-noi",
    category: "food",
    tones: "Rising - High",
    tag: "Drinks",
    culturalHint: "Say this when ordering Thai iced tea, milk tea, or coffee.",
  },

  // Transportation
  {
    id: "t1",
    en: "Where is the restroom?",
    th: "ห้องน้ำอยู่ที่ไหน",
    rtgs: "hong-nam-yu-thi-nai",
    category: "transport",
    tones: "Falling - High - Low - Falling - Rising",
    tag: "Essential",
    culturalHint: "Start with 'ขอโทษครับ/ค่ะ' (Excuse me) before asking.",
  },
  {
    id: "t2",
    en: "Go to the airport",
    th: "ไปสนามบิน",
    rtgs: "pai-sa-nam-bin",
    category: "transport",
    tones: "Mid - Low - Rising - Mid",
    tag: "Transit",
    culturalHint: "Specify: 'สุวรรณภูมิ' (Suvarnabhumi) or 'ดอนเมือง' (Don Mueang).",
  },
  {
    id: "t3",
    en: "Please turn on the meter",
    th: "เปิดมิเตอร์",
    rtgs: "poet-mi-toe",
    category: "transport",
    tones: "Low - High - Falling",
    tag: "Taxi",
    culturalHint: "By Thai law, Bangkok meter taxis must use the meter.",
  },
  {
    id: "t4",
    en: "Turn left",
    th: "เลี้ยวซ้าย",
    rtgs: "liao-sai",
    category: "transport",
    tones: "High - High",
    tag: "Direction",
    culturalHint: "Pair with 'เลี้ยวขวา' (turn right) and 'ตรงไป' (go straight).",
  },
  {
    id: "t5",
    en: "Stop right here",
    th: "จอดตรงนี้",
    rtgs: "jot-trong-ni",
    category: "transport",
    tones: "Low - Mid - High",
    tag: "Transit",
    culturalHint: "Say 20-30 meters ahead so the driver can pull over smoothly.",
  },

  // Shopping
  {
    id: "s1",
    en: "How much is this?",
    th: "เท่าไหร่",
    rtgs: "thao-rai",
    category: "shopping",
    tones: "Falling - Low",
    tag: "Market",
    culturalHint: "Point to the item and say: 'อันนี้เท่าไหร่ครับ/ค่ะ'.",
  },
  {
    id: "s2",
    en: "Can you give a discount?",
    th: "ลดหน่อยได้ไหม",
    rtgs: "lot-noi-dai-mai",
    category: "shopping",
    tones: "High - Low - Falling - Rising",
    tag: "Bargaining",
    culturalHint: "Bargain with a warm, friendly smile at night markets and bazaars.",
  },
  {
    id: "s3",
    en: "Scan to pay (PromptPay QR)",
    th: "สแกนจ่าย",
    rtgs: "sa-kaen-chai",
    category: "shopping",
    tones: "Mid - Mid - Low",
    tag: "Cashless",
    culturalHint: "Even small street food carts happily accept QR scan payments.",
  },

  // Emergency & Health
  {
    id: "e1",
    en: "Help me!",
    th: "ช่วยด้วย",
    rtgs: "chuai-duai",
    category: "emergency",
    tones: "Falling - Falling",
    tag: "Urgent",
    culturalHint: "Universal emergency cry. Tourist Police hotline is 1155.",
  },
  {
    id: "e2",
    en: "Hospital",
    th: "โรงพยาบาล",
    rtgs: "rong-pha-ya-ban",
    category: "emergency",
    tones: "Mid - High - Mid - Mid",
    tag: "Medical",
    culturalHint: "Tell the cab driver: 'ไปโรงพยาบาลครับ/ค่ะ'.",
  },
  {
    id: "e3",
    en: "Allergic to peanuts",
    th: "แพ้ถั่ว",
    rtgs: "phae-thua",
    category: "emergency",
    tones: "High - Low",
    tag: "Allergy",
    culturalHint: "Show this card before ordering Pad Thai or satay.",
  },

  // Business & Culture
  {
    id: "b1",
    en: "Efficiency",
    th: "ประสิทธิภาพ",
    rtgs: "pra-sit-thi-phap",
    category: "business",
    tones: "Low - Low - High - Falling",
    tag: "Official Coined",
    culturalHint: "Royal Society term: doing things right with minimal resource waste.",
  },
  {
    id: "b2",
    en: "Effectiveness",
    th: "ประสิทธิผล",
    rtgs: "pra-sit-thi-phon",
    category: "business",
    tones: "Low - Low - High - Rising",
    tag: "Official Coined",
    culturalHint: "Focus on goal achievement and ultimate impact.",
  },
  {
    id: "b3",
    en: "Cooperation / Collaboration",
    th: "ความร่วมมือ",
    rtgs: "khwam-ruam-mue",
    category: "business",
    tones: "Mid - Falling - Mid",
    tag: "Corporate",
    culturalHint: "The hallmark of long-term respectful Thai partnerships.",
  },
];

export default function ForeignerTranslatorView() {
  const [inputText, setInputText] = useState("Hello");
  const [speakerGender, setSpeakerGender] = useState<SpeakerGender>("male");
  const [direction, setDirection] = useState<TranslateDirection>("auto");
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const audioStatus = useSyncExternalStore(
    audioManager.subscribe,
    audioManager.snapshot,
    () => "idle"
  );

  const fetchTranslation = useCallback(
    async (textToTranslate: string, gender: SpeakerGender) => {
      const trimmed = textToTranslate.trim();
      if (!trimmed) {
        setResult(null);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const res = await fetch(
          `/api/v1/translate?q=${encodeURIComponent(trimmed)}&gender=${gender}`
        );
        if (!res.ok) {
          throw new Error("Unable to translate at this moment");
        }
        const data: TranslateResult = await res.json();
        setResult(data);
      } catch (err: any) {
        setErrorMessage(err?.message || "Failed to load translation");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial lookup on mount
  useEffect(() => {
    fetchTranslation(inputText, speakerGender);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTranslateSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    fetchTranslation(inputText, speakerGender);
  };

  const handleSelectPreset = (preset: PresetPhrase) => {
    setInputText(preset.en);
    fetchTranslation(preset.en, speakerGender);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGenderChange = (gender: SpeakerGender) => {
    setSpeakerGender(gender);
    if (inputText.trim()) {
      fetchTranslation(inputText, gender);
    }
  };

  const handleSpeak = (wordToSpeak: string) => {
    if (!wordToSpeak) return;
    void audioManager.toggle({ headword: wordToSpeak, definition: wordToSpeak });
  };

  const handleCopy = (text: string, type: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const isAudioActive = (word: string) => {
    return audioManager.active() === word.trim();
  };

  const filteredPresets =
    activeCategory === "all"
      ? PRESET_PHRASES
      : PRESET_PHRASES.filter((p) => p.category === activeCategory);

  return (
    <div className="translate-page-wrapper" style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: "80px" }}>
      {/* Top Navbar */}
      <header className="workspace-navbar" role="banner" style={{ background: "white", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 30 }}>
        <div className="workspace-navbar-inner" style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <Link href="/" className="workspace-navbar-brand" style={{ display: "flex", alignItems: "center", gap: "10px" }} aria-label="THAI CONTEXT หน้าแรก">
            <Image
              src="/assets/thai-context-logo.png"
              width={38}
              height={32}
              alt="THAI CONTEXT Logo"
              priority
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span className="brand" style={{ fontSize: "18px", fontWeight: 700, lineHeight: 1 }}>
                <span className="brand-thai" style={{ color: "#1683e8" }}>THAI</span>{" "}
                <span className="brand-context" style={{ color: "#082b5e" }}>CONTEXT</span>
              </span>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 500 }}>
                English ⇄ Thai Cultural Bridge
              </span>
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "999px",
                background: "#f0fdf4",
                color: "#15803d",
                border: "1px solid #bbf7d0",
                marginLeft: "6px",
              }}
            >
              🌐 Foreigner Translator
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <Link
              href="/"
              style={{
                fontSize: "13px",
                color: "var(--accent)",
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: "10px",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
              }}
            >
              ← สลับไปหน้าค้นหาหลัก (หน้าแรก)
            </Link>
            <Link
              href="/ai-assistant"
              style={{
                fontSize: "13px",
                color: "#1d4ed8",
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: "10px",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
              }}
            >
              ✨ ผู้ช่วย AI
            </Link>
            <Link
              href="/workspace"
              style={{
                fontSize: "13px",
                color: "#6d28d9",
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: "10px",
                background: "#f5f3ff",
                border: "1px solid #ddd6fe",
              }}
            >
              ⚡ AI Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main style={{ maxWidth: "1080px", margin: "32px auto 0", padding: "0 20px" }}>
        {/* Hero Banner with Welcoming Vibe */}
        <section
          style={{
            textAlign: "center",
            padding: "36px 24px",
            background: "linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)",
            borderRadius: "24px",
            border: "1px solid #d0e3f7",
            boxShadow: "0 12px 36px rgba(30, 67, 103, 0.05)",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#e0f2fe", color: "#0369a1", padding: "5px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, marginBottom: "14px" }}>
            <span>🇹🇭</span> Welcome to Thailand • ยินดีต้อนรับสู่ประเทศไทย
          </div>
          <h1 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, color: "var(--ink)", margin: "0 0 10px", letterSpacing: "-0.01em" }}>
            Thai Language & Cultural Bridge
          </h1>
          <p style={{ fontSize: "16px", color: "var(--muted)", maxWidth: "680px", margin: "0 auto 20px", lineHeight: 1.6 }}>
            Instant English ⇄ Thai translation crafted specifically for international visitors, digital nomads, and expats. Complete with <strong>phonetic Romanization (RTGS)</strong>, <strong>tone breakdown</strong>, <strong>native audio pronunciation</strong>, and vital <strong>cultural etiquette tips</strong>.
          </p>

          {/* Value Badges */}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ fontSize: "12px", padding: "5px 12px", borderRadius: "12px", background: "white", border: "1px solid var(--border)", color: "var(--ink)", fontWeight: 600 }}>
              🔊 Native Voice (TTS)
            </span>
            <span style={{ fontSize: "12px", padding: "5px 12px", borderRadius: "12px", background: "white", border: "1px solid var(--border)", color: "var(--ink)", fontWeight: 600 }}>
              🔤 RTGS Pronunciation
            </span>
            <span style={{ fontSize: "12px", padding: "5px 12px", borderRadius: "12px", background: "white", border: "1px solid var(--border)", color: "var(--ink)", fontWeight: 600 }}>
              🎵 5 Thai Tones Visualizer
            </span>
            <span style={{ fontSize: "12px", padding: "5px 12px", borderRadius: "12px", background: "white", border: "1px solid var(--border)", color: "var(--ink)", fontWeight: 600 }}>
              🙏 Wai & Politeness Guidance
            </span>
          </div>
        </section>

        {/* Translation Console Card */}
        <section
          style={{
            background: "white",
            borderRadius: "24px",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
            padding: "24px",
            marginBottom: "32px",
          }}
        >
          {/* Controls Bar: Speaker Gender and Quick Instructions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
              paddingBottom: "18px",
              borderBottom: "1px solid var(--border)",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
                👤 Your Speaker Gender:
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => handleGenderChange("male")}
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "6px 14px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: speakerGender === "male" ? "var(--accent)" : "var(--border)",
                    background: speakerGender === "male" ? "#eff6ff" : "white",
                    color: speakerGender === "male" ? "#1d4ed8" : "var(--muted)",
                  }}
                  title="Adds polite particle ครับ (khrap) for male speakers"
                >
                  👨 Male Speaker (ครับ - khrap)
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderChange("female")}
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "6px 14px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: speakerGender === "female" ? "#db2777" : "var(--border)",
                    background: speakerGender === "female" ? "#fdf2f8" : "white",
                    color: speakerGender === "female" ? "#be185d" : "var(--muted)",
                  }}
                  title="Adds polite particle ค่ะ (kha) for female speakers"
                >
                  👩 Female Speaker (ค่ะ - kha)
                </button>
              </div>
            </div>

            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Tip: Press <kbd style={{ padding: "2px 6px", borderRadius: "4px", background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>Enter</kbd> to translate
            </div>
          </div>

          {/* Translation Input Form */}
          <form onSubmit={handleTranslateSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type in English, Thai, or Romanized (e.g., 'not spicy', 'where is restroom', 'sawasdee', 'เกรงใจ')..."
                style={{
                  width: "100%",
                  fontSize: "17px",
                  padding: "16px 110px 16px 20px",
                  borderRadius: "16px",
                  border: "2px solid #d0e0f0",
                  background: "var(--bg-subtle)",
                  outline: "none",
                  color: "var(--ink)",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "6px" }}>
                {inputText && (
                  <button
                    type="button"
                    onClick={() => setInputText("")}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "16px",
                      padding: "6px",
                    }}
                    title="Clear input"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: "var(--accent)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "8px 16px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {isLoading ? "Translating..." : "Translate ➔"}
                </button>
              </div>
            </div>
          </form>

          {/* Error Message if Any */}
          {errorMessage && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: "13px",
              }}
            >
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Translation Result Card */}
          {result && (
            <div
              style={{
                marginTop: "24px",
                padding: "24px",
                borderRadius: "20px",
                background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Top Result Header: Script & Audio */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                  paddingBottom: "18px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: "6px", background: "var(--bg-subtle)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                      Thai Script
                    </span>
                    {result.genderVariants && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: speakerGender === "male" ? "#eff6ff" : "#fdf2f8",
                          color: speakerGender === "male" ? "#1d4ed8" : "#be185d",
                          border: `1px solid ${speakerGender === "male" ? "#bfdbfe" : "#fbcfe8"}`,
                        }}
                      >
                        Polite with: {speakerGender === "male" ? result.genderVariants.male.particle : result.genderVariants.female.particle}
                      </span>
                    )}
                  </div>

                  {/* Big Thai Display */}
                  <h2
                    className="font-thai-reading"
                    style={{
                      fontSize: "clamp(32px, 4.5vw, 48px)",
                      fontWeight: 700,
                      color: "var(--ink)",
                      margin: "0 0 6px",
                      lineHeight: 1.2,
                    }}
                  >
                    {result.genderVariants
                      ? speakerGender === "male"
                        ? result.genderVariants.male.text
                        : result.genderVariants.female.text
                      : result.thaiScript}
                  </h2>

                  {/* Romanization / RTGS guide */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "var(--accent)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      [ {result.genderVariants
                        ? speakerGender === "male"
                          ? result.genderVariants.male.rtgs
                          : result.genderVariants.female.rtgs
                        : result.phoneticRtgs} ]
                    </span>
                    {result.phoneticIpa && (
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                        IPA: {result.phoneticIpa}
                      </span>
                    )}
                  </div>
                </div>

                {/* Audio & Copy Action Buttons */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() =>
                      handleSpeak(
                        result.genderVariants
                          ? speakerGender === "male"
                            ? result.genderVariants.male.text
                            : result.genderVariants.female.text
                          : result.thaiScript
                      )
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 18px",
                      borderRadius: "14px",
                      background: isAudioActive(
                        result.genderVariants
                          ? speakerGender === "male"
                            ? result.genderVariants.male.text
                            : result.genderVariants.female.text
                          : result.thaiScript
                      )
                        ? "#15803d"
                        : "var(--accent)",
                      color: "white",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(47, 120, 207, 0.25)",
                    }}
                    title="Listen to authentic native Thai pronunciation"
                  >
                    <span>
                      {isAudioActive(
                        result.genderVariants
                          ? speakerGender === "male"
                            ? result.genderVariants.male.text
                            : result.genderVariants.female.text
                          : result.thaiScript
                      )
                        ? "⏸️"
                        : "🔊"}
                    </span>
                    <span>
                      {isAudioActive(
                        result.genderVariants
                          ? speakerGender === "male"
                            ? result.genderVariants.male.text
                            : result.genderVariants.female.text
                          : result.thaiScript
                      )
                        ? "Playing Audio..."
                        : "Listen Pronunciation"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        result.genderVariants
                          ? speakerGender === "male"
                            ? result.genderVariants.male.text
                            : result.genderVariants.female.text
                          : result.thaiScript,
                        "thai"
                      )
                    }
                    style={{
                      padding: "10px 14px",
                      borderRadius: "14px",
                      background: "white",
                      border: "1px solid var(--border)",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "var(--ink)",
                    }}
                    title="Copy Thai script to clipboard"
                  >
                    {copiedType === "thai" ? "✓ Copied!" : "📋 Copy Thai"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        result.genderVariants
                          ? speakerGender === "male"
                            ? result.genderVariants.male.rtgs
                            : result.genderVariants.female.rtgs
                          : result.phoneticRtgs,
                        "rtgs"
                      )
                    }
                    style={{
                      padding: "10px 14px",
                      borderRadius: "14px",
                      background: "white",
                      border: "1px solid var(--border)",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "var(--muted)",
                    }}
                    title="Copy phonetics to clipboard"
                  >
                    {copiedType === "rtgs" ? "✓ Copied!" : "📋 Copy RTGS"}
                  </button>
                </div>
              </div>

              {/* 5 Tones Visualizer Grid */}
              {result.tones && result.tones.length > 0 && (
                <div style={{ marginTop: "18px", padding: "16px", borderRadius: "14px", background: "white", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink)" }}>
                      🎵 Tone Breakdown & Pitch Guide ({result.tones.length} Syllables)
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Thai is a tonal language — pitch changes meaning!
                    </span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {result.tones.map((t, idx) => (
                      <div
                        key={idx}
                        style={{
                          flex: "1 1 calc(20% - 10px)",
                          minWidth: "130px",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          background:
                            t.tone === "high"
                              ? "#eff6ff"
                              : t.tone === "rising"
                              ? "#fdf4ff"
                              : t.tone === "falling"
                              ? "#fff7ed"
                              : t.tone === "low"
                              ? "#f0fdf4"
                              : "var(--bg-subtle)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                          <strong style={{ fontSize: "15px", fontFamily: "monospace", color: "var(--ink)" }}>
                            {t.syllable}
                          </strong>
                          <span style={{ fontSize: "14px", fontWeight: 800 }}>{t.symbol}</span>
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "capitalize", color: "var(--accent)" }}>
                          {t.tone} Tone ({t.labelThai})
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}>
                          {t.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* English Meaning & Synonyms */}
              <div style={{ marginTop: "18px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                <div style={{ padding: "16px", borderRadius: "14px", background: "white", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                    English Translation & Meaning
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--ink)", marginBottom: "6px" }}>
                    {result.englishGloss}
                  </div>
                  {result.secondaryMeanings && result.secondaryMeanings.length > 0 && (
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                      Also: {result.secondaryMeanings.join(" • ")}
                    </div>
                  )}
                </div>

                {/* Cultural Etiquette Alert Card */}
                {result.culturalEtiquette && (
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "14px",
                      background: "#fdf8ee",
                      border: "1px solid #fed7aa",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "16px" }}>🙏</span>
                      <strong style={{ fontSize: "13px", color: "#9a3412" }}>
                        Cultural Etiquette & Politeness Tips
                      </strong>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#7c2d12", lineHeight: 1.5 }}>
                      {result.culturalEtiquette.politenessNote}
                    </p>
                    {result.culturalEtiquette.waiGuidance && (
                      <div style={{ marginTop: "6px", fontSize: "12px", color: "#9a3412", fontStyle: "italic" }}>
                        <strong>Wai Etiquette:</strong> {result.culturalEtiquette.waiGuidance}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Situational Tips / Kreng Jai Notes if available */}
              {result.culturalEtiquette?.situationalTips && result.culturalEtiquette.situationalTips.length > 0 && (
                <div style={{ marginTop: "14px", padding: "14px 18px", borderRadius: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: "13px", color: "#166534" }}>
                  <strong>💡 Local Insider Tips:</strong>
                  <ul style={{ margin: "4px 0 0", paddingLeft: "20px" }}>
                    {result.culturalEtiquette.situationalTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Real-Life Examples Section */}
              {result.examples && result.examples.length > 0 && (
                <div style={{ marginTop: "18px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink)", marginBottom: "10px" }}>
                    💬 Real-Life Situational Usage ({result.examples.length} Examples)
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {result.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          borderRadius: "12px",
                          background: "white",
                          border: "1px solid var(--border)",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <div className="font-thai-reading" style={{ fontSize: "15px", fontWeight: 600, color: "var(--ink)" }}>
                            {ex.th}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--accent)", fontFamily: "monospace" }}>
                            {ex.rtgs}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                            &ldquo;{ex.en}&rdquo;
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSpeak(ex.th)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "10px",
                            background: "var(--bg-subtle)",
                            border: "1px solid var(--border)",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                          title="Listen to full sentence"
                        >
                          🔊 Listen
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Foreigner Quick Survival & Essential Categories */}
        <section style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                🎒 Foreigner Travel & Daily Life Survival Kits
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--muted)" }}>
                One-click popular phrases organized by category. Click any phrase to translate & hear native pronunciation!
              </p>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {[
                { id: "all", label: "All Kits" },
                { id: "greetings", label: "🤝 Greetings" },
                { id: "food", label: "🍜 Food & Dining" },
                { id: "transport", label: "🚕 Taxi & Directions" },
                { id: "shopping", label: "🛍️ Shopping" },
                { id: "emergency", label: "🏥 Emergency" },
                { id: "business", label: "💼 Business" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: "999px",
                    border: "1px solid",
                    borderColor: activeCategory === cat.id ? "var(--accent)" : "var(--border)",
                    background: activeCategory === cat.id ? "var(--accent)" : "white",
                    color: activeCategory === cat.id ? "white" : "var(--muted)",
                    cursor: "pointer",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Phrase Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
              gap: "14px",
            }}
          >
            {filteredPresets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  padding: "16px 18px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelectPreset(preset);
                  }
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", background: "var(--bg-subtle)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                      {preset.tag}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 600, fontFamily: "monospace" }}>
                      {preset.tones}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
                    <div className="font-thai-reading" style={{ fontSize: "20px", fontWeight: 700, color: "var(--ink)" }}>
                      {preset.th}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(preset.th);
                      }}
                      style={{
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                      title="Listen audio"
                    >
                      🔊
                    </button>
                  </div>

                  <div style={{ fontSize: "13px", color: "var(--accent)", fontWeight: 600, fontFamily: "monospace", margin: "2px 0 6px" }}>
                    [ {preset.rtgs} ]
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--ink)", marginBottom: "6px" }}>
                    {preset.en}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.4 }}>
                    {preset.culturalHint}
                  </div>
                </div>

                <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "var(--accent)", fontWeight: 600 }}>
                  <span>Click to view breakdown ➔</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Thai Language 101 Educational Accordion / Guide */}
        <section
          style={{
            background: "white",
            borderRadius: "20px",
            border: "1px solid var(--border)",
            padding: "24px 28px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <span style={{ fontSize: "24px" }}>🎓</span>
            <div>
              <h4 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "var(--ink)" }}>
                Thai Language & Etiquette 101: Three Golden Rules for Foreigners
              </h4>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Mastering these simple principles will make Thai people love conversing with you!
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "16px", borderRadius: "14px", background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
              <strong style={{ fontSize: "14px", color: "var(--ink)", display: "block", marginBottom: "6px" }}>
                1. The Magic Words: ครับ (khrap) & ค่ะ (kha)
              </strong>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)", lineHeight: 1.6 }}>
                Unlike English &ldquo;please&rdquo;, Thai politeness particles depend on <em>the speaker&apos;s gender</em>, not the listener&apos;s. If you identify as male, end sentences with <strong>ครับ (khrap)</strong>. If you identify as female, end sentences with <strong>ค่ะ (kha)</strong> or <strong>คะ (kha)</strong> for questions.
              </p>
            </div>

            <div style={{ padding: "16px", borderRadius: "14px", background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
              <strong style={{ fontSize: "14px", color: "var(--ink)", display: "block", marginBottom: "6px" }}>
                2. Why 5 Tones Matter
              </strong>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)", lineHeight: 1.6 }}>
                Thai has 5 tones: <strong>Mid (—)</strong>, <strong>Low (↘)</strong>, <strong>Falling (∧)</strong>, <strong>High (↗)</strong>, and <strong>Rising (∨)</strong>. For instance, &ldquo;mai&rdquo; can mean wood (ไม้), new (ใหม่), burn (ไหม้), or not (ไม่) depending on the pitch! Listen to our native TTS audio above to train your ear.
              </p>
            </div>

            <div style={{ padding: "16px", borderRadius: "14px", background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
              <strong style={{ fontSize: "14px", color: "var(--ink)", display: "block", marginBottom: "6px" }}>
                3. The Art of the Wai (ไหว้)
              </strong>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)", lineHeight: 1.6 }}>
                Pressing palms together at the chest with a gentle nod is called a Wai. It expresses gratitude, greeting, or apology. As a foreigner, returning a Wai to elders, hosts, or acquaintances shows tremendous cultural respect.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
