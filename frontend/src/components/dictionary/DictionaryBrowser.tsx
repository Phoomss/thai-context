"use client";

import { useState, useEffect, useId, useTransition } from "react";
import {
  searchDictionaryByKeyword,
  type KeywordSearchResultItem,
  type KeywordSearchResponse,
} from "@/lib/api-client";
import { toThaiNumerals } from "@/lib/evolution-data";
import { audioManager } from "@/lib/audio-manager";
import Icon from "../ui/Icon";
import SignLanguageModal from "../tsl/SignLanguageModal";

interface DictionaryBrowserProps {
  initialWord?: string;
}

const QUICK_SEARCH_WORDS = [
  "ประสิทธิภาพ",
  "สมานฉันท์",
  "ประสิทธิผล",
  "วิจัย",
  "ร่วมมือ",
  "นวัตกรรม",
];

const EDITIONS = [
  { value: "", label: "ทุกฉบับ (All Editions)" },
  { value: "2569", label: "พ.ศ. ๒๕๖๙ (ร่างปรับปรุงล่าสุด)" },
  { value: "2554", label: "พ.ศ. ๒๕๕๔ (พิมพ์ครั้งที่ ๔)" },
  { value: "2542", label: "พ.ศ. ๒๕๔๒ (พิมพ์ครั้งที่ ๓)" },
  { value: "2567", label: "พ.ศ. ๒๕๖๗ (ฉบับดิจิทัล)" },
];

const SOURCES = [
  { value: "", label: "ทุกแหล่งข้อมูล (All Sources)" },
  { value: "ROYAL_SOCIETY", label: "สำนักงานราชบัณฑิตยสภา" },
  { value: "DIALECT_INSTITUTE", label: "สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย" },
  { value: "WIKTIONARY", label: "วิกิพจนานุกรมภาษาไทย" },
];

export const BENCHMARK_DICTIONARY_ENTRIES: Record<string, KeywordSearchResultItem[]> = {
  ประสิทธิภาพ: [
    {
      word: "ประสิทธิภาพ",
      headwordClean: "ประสิทธิภาพ",
      definition: "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด",
      partOfSpeech: "น.",
      source: "สำนักงานราชบัณฑิตยสภา",
      sourceCode: "ROYAL_SOCIETY",
      edition: "2554",
      editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      editionCode: "ROYAL_2554",
      subjectDomain: "การบริหาร",
      pageNumber: 734,
      metadata: null,
    },
    {
      word: "ประสิทธิภาพ",
      headwordClean: "ประสิทธิภาพ",
      definition: "ความสามารถที่ทำให้เกิดผลในการทำงาน",
      partOfSpeech: "น.",
      source: "สำนักงานราชบัณฑิตยสภา",
      sourceCode: "ROYAL_SOCIETY",
      edition: "2542",
      editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
      editionCode: "ROYAL_2542",
      subjectDomain: null,
      pageNumber: null,
      metadata: null,
    },
    {
      word: "ประสิทธิภาพ",
      headwordClean: "ประสิทธิภาพ",
      definition: "ความสามารถในการดำเนินการให้บรรลุผลลัพธ์สูงสุดโดยใช้ทรัพยากรอย่างคุ้มค่าและเกิดประโยชน์สูงสุด",
      partOfSpeech: "น.",
      source: "สำนักงานราชบัณฑิตยสภา",
      sourceCode: "ROYAL_SOCIETY",
      edition: "2569",
      editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙",
      editionCode: "ROYAL_2569",
      subjectDomain: null,
      pageNumber: null,
      metadata: null,
    },
  ],
  สมานฉันท์: [
    {
      word: "สมานฉันท์",
      headwordClean: "สมานฉันท์",
      definition: "[สะมานะ-, สะหฺมานนะ-] น. ความพอใจร่วมกัน, ความเห็นพ้องกัน, เช่น มีความเห็นเป็นสมานฉันท์.",
      partOfSpeech: "น.",
      source: "สำนักงานราชบัณฑิตยสภา",
      sourceCode: "ROYAL_SOCIETY",
      edition: "2542",
      editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
      editionCode: "ROYAL_2542",
      subjectDomain: null,
      pageNumber: null,
      metadata: null,
    },
  ],
};

export default function DictionaryBrowser({ initialWord = "ประสิทธิภาพ" }: DictionaryBrowserProps) {
  const [searchTerm, setSearchTerm] = useState<string>(initialWord);
  const [activeQuery, setActiveQuery] = useState<string>(initialWord);
  const [edition, setEdition] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [exact, setExact] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<KeywordSearchResultItem[]>(() => {
    return BENCHMARK_DICTIONARY_ENTRIES[initialWord] || [];
  });
  const [totalCount, setTotalCount] = useState<number>(() => {
    return (BENCHMARK_DICTIONARY_ENTRIES[initialWord] || []).length;
  });
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [signModalWord, setSignModalWord] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(true);
  const [, startTransition] = useTransition();

  const searchInputId = useId();
  const editionSelectId = useId();
  const sourceSelectId = useId();
  const exactCheckboxId = useId();

  // Audio manager playback state listener
  useEffect(() => {
    return audioManager.subscribe(() => {
      const currentStatus = audioManager.snapshot();
      if (currentStatus === "idle" || currentStatus === "error") {
        setPlayingWord(null);
      }
    });
  }, []);

  // Sync when initialWord changes
  useEffect(() => {
    if (initialWord && initialWord.trim() !== activeQuery) {
      const clean = initialWord.trim();
      setSearchTerm(clean);
      setActiveQuery(clean);
      if (BENCHMARK_DICTIONARY_ENTRIES[clean]) {
        setResults(BENCHMARK_DICTIONARY_ENTRIES[clean]);
        setTotalCount(BENCHMARK_DICTIONARY_ENTRIES[clean].length);
      } else {
        performSearch(clean);
      }
    }
  }, [initialWord]);

  // Load search results
  const performSearch = async (
    queryWord: string,
    editionFilter = edition,
    sourceFilter = source,
    exactFilter = exact
  ) => {
    const clean = queryWord.trim();
    if (!clean) return;

    setIsLoading(true);
    setActiveQuery(clean);
    setHasSearched(true);

    try {
      const response: KeywordSearchResponse = await searchDictionaryByKeyword(clean, {
        edition: editionFilter || undefined,
        source: sourceFilter || undefined,
        exact: exactFilter,
      });

      startTransition(() => {
        setResults(response.results || []);
        setTotalCount(response.total || 0);
      });
    } catch {
      startTransition(() => {
        setResults([]);
        setTotalCount(0);
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Pronounce word
  const handlePlayAudio = (wordToPlay: string) => {
    try {
      if (playingWord === wordToPlay) {
        audioManager.stop();
        setPlayingWord(null);
      } else {
        setPlayingWord(wordToPlay);
        audioManager.toggle({ headword: wordToPlay } as any);
        setTimeout(() => setPlayingWord(null), 1500);
      }
    } catch {
      setPlayingWord(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm, edition, source, exact);
  };

  const handleQuickWordClick = (word: string) => {
    setSearchTerm(word);
    performSearch(word, edition, source, exact);
  };

  return (
    <section
      id="dictionary"
      className="dictionary-browser-section"
      aria-labelledby="dictionary-browser-heading"
      style={{
        maxWidth: "1440px",
        margin: "0 auto",
        padding: "var(--section-space) var(--page-gutter)",
        scrollMarginTop: "90px",
      }}
    >
      <div className="discovery-header" style={{ marginBottom: "32px" }}>
        <p className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span></span> เปิดคลังพจนานุกรมฉบับพิมพ์
        </p>
        <h2 id="dictionary-browser-heading" style={{ margin: "8px 0 12px", fontWeight: 600 }}>
          ค้นหาคำตรงตัวตามเล่มพจนานุกรม
        </h2>
        <p style={{ color: "var(--muted)", maxWidth: "720px", fontSize: "15px" }}>
          สำหรับผู้ใช้ที่ต้องการเปิดพจนานุกรมแบบเดิม โดยค้นหาจากแม่คำตรง ๆ
          พร้อมฟิลเตอร์เลือกปีฉบับพิมพ์ พ.ศ. และแหล่งข้อมูลอ้างอิงตามหลักวิชาการ
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div
        className="dictionary-controls-card"
        style={{
          background: "white",
          borderRadius: "20px",
          border: "1px solid var(--border)",
          padding: "24px",
          boxShadow: "var(--shadow-soft)",
          marginBottom: "32px",
        }}
      >
        <form onSubmit={handleFormSubmit} role="search" aria-label="ค้นหาคำศัพท์ตามเล่ม">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              alignItems: "end",
            }}
          >
            {/* Keyword Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                htmlFor={searchInputId}
                style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)" }}
              >
                แม่คำ / คำศัพท์ที่ต้องการค้น
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id={searchInputId}
                  type="search"
                  className="font-thai-reading"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="พิมพ์คำ เช่น ประสิทธิภาพ, สมานฉันท์..."
                  aria-label="ค้นหาคำศัพท์ตามแม่คำ"
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "8px 36px 8px 14px",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    fontSize: "14px",
                    background: "#f8fafc",
                  }}
                />
                <button
                  type="submit"
                  aria-label="ค้นหาคำศัพท์"
                  style={{
                    position: "absolute",
                    right: "4px",
                    width: "36px",
                    height: "36px",
                    minHeight: "36px",
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Icon name="search" />
                </button>
              </div>
            </div>

            {/* Edition Filter Dropdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                htmlFor={editionSelectId}
                style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)" }}
              >
                ฉบับพิมพ์ (พ.ศ.)
              </label>
              <select
                id={editionSelectId}
                value={edition}
                onChange={(e) => {
                  setEdition(e.target.value);
                  performSearch(searchTerm, e.target.value, source, exact);
                }}
                aria-label="เลือกฉบับพจนานุกรม"
                style={{
                  height: "44px",
                  padding: "8px 14px",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  fontSize: "13px",
                  background: "#f8fafc",
                  color: "var(--ink)",
                }}
              >
                {EDITIONS.map((ed) => (
                  <option key={ed.value} value={ed.value}>
                    {ed.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Filter Dropdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                htmlFor={sourceSelectId}
                style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)" }}
              >
                แหล่งข้อมูล / หน่วยงาน
              </label>
              <select
                id={sourceSelectId}
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  performSearch(searchTerm, edition, e.target.value, exact);
                }}
                aria-label="เลือกแหล่งข้อมูล"
                style={{
                  height: "44px",
                  padding: "8px 14px",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  fontSize: "13px",
                  background: "#f8fafc",
                  color: "var(--ink)",
                }}
              >
                {SOURCES.map((src) => (
                  <option key={src.value} value={src.value}>
                    {src.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Submit Button */}
            <div>
              <button
                type="submit"
                className="dict-search-btn"
                aria-label="ค้นหาตามเล่ม"
                disabled={isLoading}
                style={{
                  width: "100%",
                  height: "44px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "var(--accent)",
                  color: "white",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  borderRadius: "12px",
                }}
              >
                <Icon name="search" />
                <span>{isLoading ? "กำลังค้นหา..." : "ค้นหาตามเล่ม"}</span>
              </button>
            </div>
          </div>

          {/* Exact Match Checkbox & Suggestions */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <label
              htmlFor={exactCheckboxId}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                cursor: "pointer",
                color: "var(--muted)",
                userSelect: "none",
              }}
            >
              <input
                id={exactCheckboxId}
                type="checkbox"
                checked={exact}
                onChange={(e) => {
                  setExact(e.target.checked);
                  performSearch(searchTerm, edition, source, e.target.checked);
                }}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <span>ค้นหาเฉพาะแม่คำที่ตรงกันเป๊ะ (Exact Match)</span>
            </label>

            {/* Quick Word Chips */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>คำค้นแนะนำ:</span>
              {QUICK_SEARCH_WORDS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => handleQuickWordClick(w)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    minHeight: "28px",
                    background: activeQuery === w ? "#eff6ff" : "#f8fafc",
                    borderColor: activeQuery === w ? "var(--accent)" : "var(--border)",
                    color: activeQuery === w ? "var(--accent)" : "var(--ink)",
                    fontWeight: activeQuery === w ? 600 : 400,
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
            ผลการค้นหา {activeQuery ? `"${activeQuery}"` : ""}
          </h3>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "12px",
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            พบ {totalCount} รายการ
          </span>
        </div>

        {/* Filter Badges Summary */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", fontSize: "12px" }}>
          {edition && (
            <span
              style={{
                background: "#f1f5f9",
                border: "1px solid var(--border)",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              ฉบับ พ.ศ. {toThaiNumerals(edition)}
            </span>
          )}
          {source && (
            <span
              style={{
                background: "#f1f5f9",
                border: "1px solid var(--border)",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              {source === "ROYAL_SOCIETY" ? "ราชบัณฑิตยสภา" : source}
            </span>
          )}
          {exact && (
            <span
              style={{
                background: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fde68a",
                padding: "2px 8px",
                borderRadius: "6px",
                fontWeight: 600,
              }}
            >
              ตรงตัวเป๊ะ
            </span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: "48px 24px",
            textAlign: "center",
            background: "white",
            borderRadius: "16px",
            border: "1px solid var(--border)",
          }}
        >
          <p style={{ color: "var(--muted)", margin: 0 }}>กำลังค้นหาข้อมูลจากเล่มพจนานุกรม...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && hasSearched && results.length === 0 && (
        <div
          role="alert"
          style={{
            padding: "48px 24px",
            textAlign: "center",
            background: "white",
            borderRadius: "16px",
            border: "1px dashed var(--border)",
          }}
        >
          <h4 style={{ margin: "0 0 8px", fontSize: "16px", color: "var(--ink)" }}>
            ไม่พบนิยามคำศัพท์ที่ตรงกับเงื่อนไข
          </h4>
          <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0 }}>
            ลองเปลี่ยนคำค้นหา หรือปิดฟิลเตอร์ &ldquo;Exact Match&rdquo; เพื่อค้นหาคำที่มีคำนี้เป็นส่วนประกอบ
          </p>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && results.length > 0 && (
        <div
          className="dictionary-results-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(360px, 100%), 1fr))",
            gap: "16px",
          }}
        >
          {results.map((item, index) => {
            const isPlaying = playingWord === item.word;
            return (
              <article
                key={`${item.word}-${item.edition}-${item.pageNumber ?? index}`}
                className="dictionary-item-card"
                style={{
                  background: "white",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                {/* Card Header */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h4
                        className="font-thai-reading"
                        style={{
                          margin: 0,
                          fontSize: "20px",
                          fontWeight: 700,
                          color: "var(--ink)",
                        }}
                      >
                        {item.word}
                      </h4>
                      {item.partOfSpeech && (
                        <span
                          style={{
                            fontSize: "12px",
                            padding: "2px 6px",
                            borderRadius: "6px",
                            background: "#f1f5f9",
                            color: "#475569",
                            fontWeight: 600,
                          }}
                        >
                          [{item.partOfSpeech}]
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        aria-label={`ดูภาษามือไทยสำหรับคำว่า ${item.word}`}
                        title="ดูภาษามือไทย (Thai Sign Language)"
                        onClick={() => setSignModalWord(item.word)}
                        style={{
                          width: "32px",
                          height: "32px",
                          minHeight: "32px",
                          padding: 0,
                          borderRadius: "50%",
                          border: "1px solid var(--border)",
                          background: "#f8fafc",
                          color: "#0284c7",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        🤟
                      </button>
                      <button
                        type="button"
                        aria-label={`ฟังเสียงคำว่า ${item.word}`}
                        onClick={() => handlePlayAudio(item.word)}
                        style={{
                          width: "32px",
                          height: "32px",
                          minHeight: "32px",
                          padding: 0,
                          borderRadius: "50%",
                          border: "1px solid var(--border)",
                          background: isPlaying ? "var(--accent)" : "#f0f9ff",
                          color: isPlaying ? "white" : "#0284c7",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Icon name={isPlaying ? "pause" : "volume"} />
                      </button>
                    </div>
                  </div>

                  {/* Definition Body */}
                  <p
                    className="font-thai-reading"
                    style={{
                      margin: "0 0 12px",
                      fontSize: "14px",
                      lineHeight: 1.7,
                      color: "#334155",
                    }}
                  >
                    {item.definition}
                  </p>
                </div>

                {/* Card Metadata Footer */}
                <div
                  style={{
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    fontSize: "11px",
                    color: "var(--text-muted)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        background: "#eff6ff",
                        color: "#1e40af",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      พ.ศ. {toThaiNumerals(item.edition)}
                    </span>
                    <span>{item.source}</span>
                  </div>

                  {item.pageNumber && (
                    <span>หน้า {toThaiNumerals(item.pageNumber)}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {signModalWord && (
        <SignLanguageModal
          word={signModalWord}
          isOpen={Boolean(signModalWord)}
          onClose={() => setSignModalWord(null)}
        />
      )}
    </section>
  );
}
