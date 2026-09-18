"use client";

import { useState, useMemo, useId, useEffect } from "react";
import {
  DIALECT_CATEGORIES,
  DIALECT_WORD_GROUPS,
  DEFAULT_DIALECT_GROUP,
  type DialectCategoryKey,
  type DialectWordGroup,
  type DialectEntry,
} from "@/lib/dialect-data";
import { dialectEntries as fallbackDialectEntries } from "@/lib/explorer-data";
import { audioManager } from "@/lib/audio-manager";
import Icon from "../ui/Icon";

interface DialectExplorerProps {
  currentWord?: string;
}

export default function DialectExplorer({ currentWord }: DialectExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<DialectCategoryKey>("conversation");
  const [selectedWordId, setSelectedWordId] = useState<string>("miss-you");
  const [selectedRegion, setSelectedRegion] = useState<string>("กลาง");
  const [searchQuery, setSearchQuery] = useState("");
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [wordGroups, setWordGroups] = useState<DialectWordGroup[]>(DIALECT_WORD_GROUPS);
  const searchInputId = useId();

  // Load dialect word groups from primary Next.js backend proxy route
  useEffect(() => {
    if (typeof window === "undefined" || process.env.VITEST) return;
    let isMounted = true;
    async function loadDialects() {
      try {
        const res = await fetch("/api/v1/dialect");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.results) && data.results.length > 0) {
            setWordGroups((prev) => {
              const customGroups = prev.filter((g) => g.id.startsWith("custom-"));
              return [...customGroups, ...data.results];
            });
          }
        }
      } catch {
        // Local cached fallback already loaded in state
      }
    }
    loadDialects();
    return () => {
      isMounted = false;
    };
  }, []);

  // When currentWord is provided, sync selection or fetch dynamic mapping from backend
  useEffect(() => {
    if (!currentWord || !currentWord.trim()) return;
    const trimmed = currentWord.trim();
    let isMounted = true;

    const existing = wordGroups.find((g) => g.standardWord === trimmed);
    if (existing) {
      setSelectedCategory(existing.category);
      setSelectedWordId(existing.id);
      return;
    }

    if (typeof window === "undefined" || process.env.VITEST) return;

    async function fetchMapping() {
      try {
        const res = await fetch(
          `/api/v1/dialect/mapping/${encodeURIComponent(trimmed)}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (
            isMounted &&
            Array.isArray(data.mappings) &&
            data.mappings.length > 0
          ) {
            const newGroup: DialectWordGroup = {
              id: `custom-${trimmed}`,
              standardWord: data.standardWord || trimmed,
              category: data.category || "conversation",
              categoryLabel: data.categoryLabel || "สนทนายอดนิยม",
              dialects: data.mappings.map((m: any) => ({
                region: m.region,
                word: m.word,
                phonetic: m.phonetic || "",
                meaning: m.meaning,
                culturalNotes: m.culturalNotes || "",
                provenance:
                  m.type === "OFFICIAL" || m.confidence === 1
                    ? "official"
                    : "inferred",
                source:
                  m.source ||
                  "คลังข้อมูลภาษาถิ่น ๔ ภาค สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย ม.มหิดล",
              })),
            };

            setWordGroups((prev) => {
              if (prev.some((g) => g.standardWord === trimmed)) return prev;
              return [newGroup, ...prev];
            });
            setSelectedCategory(newGroup.category);
            setSelectedWordId(newGroup.id);
          }
        }
      } catch {
        // Fallback or ignore
      }
    }

    fetchMapping();
    return () => {
      isMounted = false;
    };
  }, [currentWord, wordGroups]);

  // If currentWord is provided and matches a known group, select it
  const initialGroup = useMemo(() => {
    if (!currentWord) return null;
    const trimmed = currentWord.trim();
    return wordGroups.find((g) => g.standardWord === trimmed) ?? null;
  }, [currentWord, wordGroups]);

  // Words available in selected category
  const wordsInCategory = useMemo(() => {
    return wordGroups.filter((g) => g.category === selectedCategory);
  }, [wordGroups, selectedCategory]);

  // Filtered words by search query
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return wordsInCategory;
    const q = searchQuery.trim().toLowerCase();
    return wordGroups.filter(
      (g) =>
        g.category === selectedCategory &&
        (g.standardWord.toLowerCase().includes(q) ||
          g.dialects.some(
            (d) =>
              d.word.toLowerCase().includes(q) ||
              d.meaning.toLowerCase().includes(q),
          )),
    );
  }, [wordGroups, wordsInCategory, searchQuery, selectedCategory]);

  // Currently active word group
  const activeGroup: DialectWordGroup = useMemo(() => {
    if (searchQuery.trim() && filteredWords.length > 0) {
      const match = filteredWords.find((g) => g.id === selectedWordId);
      return match || filteredWords[0];
    }
    const found = wordGroups.find((g) => g.id === selectedWordId);
    if (found) return found;
    if (initialGroup) return initialGroup;
    if (wordsInCategory.length > 0) return wordsInCategory[0];
    return DEFAULT_DIALECT_GROUP;
  }, [selectedWordId, initialGroup, searchQuery, filteredWords, wordGroups, wordsInCategory]);

  const displayedEntries: DialectEntry[] =
    activeGroup?.dialects || (fallbackDialectEntries as DialectEntry[]);

  const activeEntry = useMemo(() => {
    return (
      displayedEntries.find((d) => d.region === selectedRegion) ||
      displayedEntries[0]
    );
  }, [displayedEntries, selectedRegion]);

  const handlePlayAudio = (wordToPlay: string) => {
    try {
      setPlayingWord(wordToPlay);
      audioManager.toggle({ headword: wordToPlay } as any);
      setTimeout(() => setPlayingWord(null), 1500);
    } catch {
      setPlayingWord(null);
    }
  };

  return (
    <section
      id="dialects"
      className="feature-section dialect"
      aria-labelledby="dialect-title"
    >
      <header className="section-heading">
        <p>หนึ่งความหมาย หลายเสียงของภาษา</p>
        <h2 id="dialect-title">สำรวจคลังคำภาษาถิ่น 4 ภาค</h2>
        <span>
          คำมาตรฐาน: {activeGroup.standardWord} — แตะการ์ดเพื่อดูที่มาของข้อมูล
        </span>
        <div style={{ marginTop: "10px" }}>
          <a
            href="/dialect"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "#059669",
              backgroundColor: "#ecfdf5",
              padding: "6px 14px",
              borderRadius: "9999px",
              textDecoration: "none",
              border: "1px solid #a7f3d0",
            }}
          >
            🧭 เปิดระบบค้นพบภาษาถิ่นจากความหมาย (Dialect Intelligence) →
          </a>
        </div>
      </header>

      {/* Category Selection Tabs & Search Controls */}
      <div className="dialect-controls">
        <div
          className="dialect-category-tabs"
          role="tablist"
          aria-label="เลือกหมวดหมู่คำภาษาถิ่น"
        >
          {DIALECT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key && !searchQuery;
            return (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`dialect-category-tab ${isSelected ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setSearchQuery("");
                  const firstInCat = wordGroups.find(
                    (g) => g.category === cat.key,
                  );
                  if (firstInCat) setSelectedWordId(firstInCat.id);
                }}
              >
                <span className="cat-label">{cat.label}</span>
                <span className="cat-badge">{cat.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Search & Word Selector Chips */}
        <div className="dialect-selector-row">
          <div className="dialect-search-wrapper">
            <label htmlFor={searchInputId} className="sr-only">
              ค้นหาคำในภาษาถิ่น
            </label>
            <input
              id={searchInputId}
              type="search"
              placeholder="🔍 ค้นหาคำ เช่น แซ่บ, ลำ, อู้, ตา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dialect-search-input"
            />
          </div>

          <div
            className="dialect-word-chips"
            role="group"
            aria-label="เลือกคำศัพท์มาตรฐาน"
          >
            {filteredWords.map((group) => {
              const isCurrent = group.id === activeGroup.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  aria-pressed={isCurrent}
                  className={`dialect-chip ${isCurrent ? "active" : ""}`}
                  onClick={() => setSelectedWordId(group.id)}
                >
                  {group.standardWord}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Dialect Audio Bar */}
        {activeEntry && (
          <div className="dialect-audio-bar">
            <div className="dialect-audio-info">
              <span className="dialect-audio-region">
                สำเนียง{activeEntry.region}:
              </span>
              <strong className="dialect-audio-word font-thai-reading">
                {activeEntry.word}
              </strong>
              {activeEntry.phonetic && (
                <span className="dialect-audio-phonetic">
                  {activeEntry.phonetic}
                </span>
              )}
            </div>
            <button
              type="button"
              className="dialect-audio-play-btn"
              aria-label={`ฟังเสียงคำว่า ${activeEntry.word}`}
              onClick={() => handlePlayAudio(activeEntry.word)}
            >
              <Icon name={playingWord === activeEntry.word ? "pause" : "volume"} />
              <span>
                {playingWord === activeEntry.word
                  ? "กำลังเล่น..."
                  : "ฟังเสียงอ่าน"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 4 Regions Dialect Grid */}
      <div className="dialect-grid">
        {displayedEntries.map((entry) => {
          const active = selectedRegion === entry.region;
          return (
            <button
              type="button"
              key={entry.region}
              className="dialect-card"
              aria-pressed={active}
              onClick={() => setSelectedRegion(entry.region)}
            >
              <span className="region">{entry.region}</span>
              <strong className="font-thai-reading">{entry.word}</strong>

              {entry.phonetic && (
                <span className="dialect-phonetic">{entry.phonetic}</span>
              )}

              <span className="dialect-meaning font-thai-reading">
                {entry.meaning}
              </span>

              {entry.culturalNotes && (
                <small className="dialect-cultural font-thai-reading">
                  {entry.culturalNotes}
                </small>
              )}

              <span className={`provenance ${entry.provenance}`}>
                {entry.provenance === "official"
                  ? "✓ คลังข้อมูลภาษาถิ่นทางการ"
                  : "◌ อยู่ระหว่างการตรวจสอบ"}
              </span>

              <span className="dialect-source font-thai-reading">
                {entry.source}
              </span>
            </button>
          );
        })}
      </div>

      <p className="data-caveat font-thai-reading">
        ข้อมูลภาษาถิ่นอ้างอิงจากคลังข้อมูลภาษาถิ่น ๔ ภาค สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล และพจนานุกรม ฉบับราชบัณฑิตยสถาน
      </p>
    </section>
  );
}
