import { useEffect, useRef, useState } from "react";
import PopularSuggestions from "./PopularSuggestions";
import { Search } from 'lucide-react';
export default function HeroSearch({
  busy,
  onSearch,
}: {
  busy: boolean;
  onSearch: (query: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
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
          rows={2}
          maxLength={600}
          disabled={busy || !hydrated}
          value={query}
          aria-invalid={!!error}
          aria-describedby={error ? "search-error" : undefined}
          onChange={(e) => {
            setQuery(e.target.value);
            setError("");
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
          placeholder={`เช่น อยากได้คำที่หมายถึง “ทำงานได้ผลดี
โดยใช้ทรัพยากรน้อย”`}
        />
        <button className="search-submit" disabled={busy || !hydrated} type="submit" aria-label={busy ? "กำลังเปิดโลกของคำ" : "ค้นหาคำที่ใช่"}>
          <span className="sr-only">{busy ? "กำลังเปิดโลกของคำ" : "ค้นหาคำที่ใช่"}</span>
          <span aria-hidden="true"> <Search /> </span>
        </button>
      </form>
      <p id="search-error" className="search-error" role="alert">
        {error}
      </p>
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
