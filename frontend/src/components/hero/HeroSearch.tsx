import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import PopularSuggestions from "./PopularSuggestions";
import { Search } from 'lucide-react';

const HERO_TEXTAREA_FALLBACK_MAX_HEIGHT = 160;
function resizeTextarea(element: HTMLTextAreaElement) {
  const styles = getComputedStyle(element);
  const cssMinHeight = Number.parseFloat(styles.minHeight);
  const minHeight = Number.isFinite(cssMinHeight) ? cssMinHeight : 48;

  if (!element.value) {
    element.style.height = `${minHeight}px`;
    element.style.overflowY = "hidden";
    return;
  }

  element.style.height = "0px";
  const cssMaxHeight = Number.parseFloat(styles.maxHeight);
  const maxHeight = Number.isFinite(cssMaxHeight)
    ? cssMaxHeight
    : HERO_TEXTAREA_FALLBACK_MAX_HEIGHT;
  const nextHeight = Math.max(minHeight, Math.min(element.scrollHeight, maxHeight));
  element.style.height = `${nextHeight}px`;
  element.style.overflowY = element.scrollHeight > maxHeight ? "auto" : "hidden";
}

export default function HeroSearch({
  busy,
  onSearch,
  modeSwitcher,
}: {
  busy: boolean;
  onSearch: (query: string) => void;
  modeSwitcher: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  useLayoutEffect(() => {
    if (input.current) resizeTextarea(input.current);
  }, [query]);
  function submit() {
    if (busy) return;
    if (!query.trim()) {
      setError("ลองเล่าความหมายที่คุณอยากสื่อก่อนนะ");
      input.current?.focus();
      return;
    }
    setError("");
    input.current?.blur();
    onSearch(query.trim());
  }
  return (
    <div className="search-area">
      <form
        className="hero-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        aria-busy={busy}
      >
        <label htmlFor="meaning" className="sr-only">
          ความหมายที่คุณอยากสื่อ
        </label>
        <svg
          className="search-icon"
          width="23"
          height="23"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <textarea
          ref={input}
          id="meaning"
          rows={1}
          maxLength={600}
          disabled={busy || !hydrated}
          value={query}
          aria-invalid={!!error}
          aria-describedby={error ? "search-error" : undefined}
          onChange={(e) => {
            setQuery(e.target.value);
            setError("");
            resizeTextarea(e.currentTarget);
          }}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={`เช่น อยากได้คำที่หมายถึง “ทำงานได้ผลดี โดยใช้ทรัพยากรน้อย” หรือ “ช่วยกันทำงานให้สำเร็จ”`}
        />
        {query.trim() && (
          <button
            type="button"
            className="search-clear-btn"
            disabled={busy || !hydrated}
            onClick={() => {
              setQuery("");
              setError("");
              input.current?.focus();
            }}
            aria-label="ล้างข้อความค้นหา"
            title="ล้างข้อความค้นหา"
          >
            <span aria-hidden="true">✕</span>
          </button>
        )}
        <button
          className="search-submit"
          disabled={busy || !hydrated}
          type="submit"
          aria-label={busy ? "กำลังเปิดโลกของคำ" : "ค้นหาคำที่ใช่"}
        >
          <span className="sr-only">{busy ? "กำลังเปิดโลกของคำ" : "ค้นหาคำที่ใช่"}</span>
          <span className="search-submit-inner" aria-hidden="true">
            <Search className="search-submit-icon" />
            <span className="search-submit-label">{busy ? "ค้นหา..." : "ค้นหา"}</span>
          </span>
        </button>
      </form>
      <div className="search-hints-row" aria-hidden="true">
        <span className="search-hint-badge">💡 เล่าความหมายหรือสถานการณ์ที่ต้องการสื่อ แล้วกดค้นหา</span>
        <span className="search-hint-kbd">Enter ↵ เพื่อค้นหา</span>
      </div>
      <p id="search-error" className="search-error" role="alert" hidden={!error}>
        {error ? `⚠️ ${error}` : ""}
      </p>
      <div className="hero-mode-switcher">{modeSwitcher}</div>
      <PopularSuggestions
        disabled={busy}
        onSelect={(q) => {
          setQuery(q);
          setError("");
          input.current?.focus();
        }}
      />
    </div>
  );
}
