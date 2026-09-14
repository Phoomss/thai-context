import type { Recommendation, SearchResponse } from "@/lib/search-types";

export default function WordResultCard({
  word,
  index,
  revision,
  mode,
  loading,
  selected,
  onEvidence,
  onCompare,
}: {
  word: Recommendation;
  index: number;
  revision: number;
  mode?: SearchResponse["mode"];
  loading: boolean;
  selected: boolean;
  onEvidence: (word: Recommendation) => void;
  onCompare: (word: Recommendation) => void;
}) {
  return (
    <article
      data-reveal
      className={`result-card ${selected ? "is-comparing" : ""}`}
      key={`${revision}-${word.id ?? word.headword}-${index}`}
    >
      <div className="card-meta">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>{word.score === undefined ? "คำใกล้เคียง" : `${Math.round(word.score * 100)}% ตรงกับความหมาย`}</span>
      </div>
      <h3>
        {word.headword} {word.pos && <small>[{word.pos}]</small>}
      </h3>
      <p className="definition">{word.definition}</p>
      {word.ai_explanation && (
        <div className="explanation">
          <span>{mode === "live" ? "คำอธิบายประกอบ" : "เหตุผลตัวอย่าง"}</span>
          <p>{word.ai_explanation}</p>
        </div>
      )}
      <div className="word-tags">
        {[...(word.registers ?? []), ...(word.contexts ?? [])].map((tag, i) => (
          <span key={`${tag}-${i}`}>{tag}</span>
        ))}
      </div>
      <div className="result-actions">
        <button
          disabled={loading}
          className="compare-button"
          aria-pressed={selected}
          onClick={() => onCompare(word)}
        >
          {selected ? "เลือกเทียบแล้ว" : "เลือกเปรียบเทียบ"}
        </button>
        <button
          disabled={loading}
          className="evidence-button"
          onClick={() => onEvidence(word)}
        >
          {word.evidence ? "ตรวจสอบหลักฐาน" : "สถานะหลักฐานอ้างอิง"}{" "}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>
  );
}
