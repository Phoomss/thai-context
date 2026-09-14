"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import gsap from "gsap";
import type { Experience } from "@/lib/experience-state";
import type { Recommendation } from "@/lib/search-types";
import { audioManager } from "@/lib/audio-manager";
import ParsedIntent from "./ParsedIntent";
import SmartFilters, { type SmartFilterValue } from "./SmartFilters";
import PronunciationButton from "../pronunciation/PronunciationButton";
import ShareResultButton from "../share/ShareResultButton";
import Icon from "../ui/Icon";

type SearchResultsProps = {
  experience: Experience;
  reduced: boolean;
  sectionRef: RefObject<HTMLElement | null>;
  onEvidence: (word: Recommendation) => void;
  compareSelected: string[];
  onCompare: (word: Recommendation) => void;
  onRetry: () => void;
  sharedWord?: string;
};

export default function SearchResults({
  experience,
  reduced,
  sectionRef,
  onEvidence,
  compareSelected,
  onCompare,
  onRetry,
  sharedWord = "",
}: SearchResultsProps) {
  const { result, loading, error, revealed, revision, query } = experience;
  const [selection, setSelection] = useState("");
  const [filters, setFilters] = useState<SmartFilterValue>({
    register: "",
    context: "",
    excluded: "",
  });
  const workspace = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setFilters({ register: "", context: "", excluded: "" });
    setSelection(sharedWord);
    audioManager.stop();
  }, [revision, sharedWord]);

  const allWords = result?.recommendations ?? [];
  const excluded = filters.excluded.split(/[,，\s]+/).filter(Boolean);
  const words = allWords.filter(
    (candidate) =>
      (!filters.register || candidate.registers?.includes(filters.register)) &&
      (!filters.context || candidate.contexts?.includes(filters.context)) &&
      !excluded.some((word) => candidate.headword.includes(word)),
  );
  const word = words.find((candidate) => candidate.headword === selection) ?? words[0];

  useEffect(() => {
    audioManager.stop();
  }, [word?.headword]);

  const demo = result?.mode !== "live";

  useLayoutEffect(() => {
    if (!revealed || !workspace.current?.querySelector("[data-reveal]")) return;

    const context = gsap.context(
      () =>
        gsap.fromTo(
          "[data-reveal]",
          { opacity: 0, y: reduced ? 0 : 24 },
          {
            opacity: 1,
            y: 0,
            duration: reduced ? 0.12 : 0.6,
            stagger: reduced ? 0 : 0.055,
            ease: "power2.out",
            clearProps: "opacity,transform",
          },
        ),
      workspace,
    );

    return () => context.revert();
  }, [revealed, revision, reduced]);

  const select = (next: Recommendation) => {
    audioManager.stop();
    setSelection(next.headword);
  };

  const examples = word?.examples ?? (word?.comparison ? [word.comparison.example] : []);

  return (
    <section
      ref={sectionRef}
      id="search-results"
      className="search-results"
      aria-labelledby="results-title"
      aria-busy={loading}
    >
      <div
        className="results-inner"
        style={{ visibility: revealed ? "visible" : "hidden" }}
      >
        <div className="results-heading">
          <div>
            <p className="eyebrow">จากความหมาย สู่คำที่ใช่</p>
            <h2 id="results-title" tabIndex={-1}>
              คำที่ใกล้กับสิ่งที่คุณกำลังคิด
            </h2>
          </div>
          <span className="result-count" role="status">
            {loading ? "กำลังค้นหา…" : `${words.length} คำแนะนำ`}
          </span>
        </div>

        <ParsedIntent result={result} query={query} loading={loading} />
        {demo && result?.notice && <p className="demo-notice">{result.notice}</p>}
        <SmartFilters
          registers={[...new Set(allWords.flatMap((candidate) => candidate.registers ?? []))]}
          contexts={[...new Set(allWords.flatMap((candidate) => candidate.contexts ?? []))]}
          value={filters}
          disabled={loading}
          onChange={setFilters}
        />
        {error && (
          <div role="alert" className="result-error">
            <p>{error}</p>
            <button onClick={onRetry}>ลองค้นหาอีกครั้ง</button>
          </div>
        )}

        <div
          ref={workspace}
          className={`knowledge-workspace count-${words.length}`}
          style={{ opacity: loading && result ? 0.55 : 1 }}
        >
          {!result &&
            loading &&
            Array.from({ length: 3 }, (_, index) => (
              <div className="result-skeleton" key={index} aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </div>
            ))}

          {word && (
            <>
              <aside data-reveal className="candidate-panel" aria-label="คำแนะนำ">
                <h3>
                  คำที่ค้นพบ <span>{words.length}</span>
                </h3>
                <div className="candidate-list">
                  {words.map((candidate, index) => (
                    <button
                      key={candidate.id ?? candidate.headword}
                      className="candidate-row"
                      aria-pressed={candidate.headword === word.headword}
                      disabled={loading}
                      onClick={() => select(candidate)}
                    >
                      <span className="candidate-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <strong>{candidate.headword}</strong>
                        <small>{candidate.registers?.join(" · ") || "คำใกล้เคียง"}</small>
                        {candidate.score !== undefined && (
                          <small>
                            ความใกล้เคียง {Math.round(candidate.score * 100)}%
                          </small>
                        )}
                      </span>
                      <span aria-hidden="true">›</span>
                    </button>
                  ))}
                </div>
              </aside>

              <article data-reveal className="word-detail" aria-labelledby="word-title">
                <div key={word.headword} className="detail-content">
                  <p className="detail-kicker">ความหมายของคำ</p>
                  <h3 id="word-title" tabIndex={-1}>
                    {word.headword}
                  </h3>
                  <p className="word-phonetic">
                    {word.pronunciation?.phonetic} {word.pos && <span>{word.pos}</span>}
                  </p>
                  <div className="word-utilities">
                    <PronunciationButton word={word} />
                    <ShareResultButton
                      word={word}
                      query={result?.query_understanding.raw_query ?? query}
                      demo={demo}
                    />
                  </div>

                  <section>
                    <h4>ความหมาย</h4>
                    <p className="definition">{word.definition}</p>
                  </section>
                  {!!examples.length && (
                    <section>
                      <h4>ตัวอย่างการใช้</h4>
                      {examples.map((example) => (
                        <blockquote key={example}>{example}</blockquote>
                      ))}
                    </section>
                  )}
                  <section>
                    <h4>เหมาะกับบริบท</h4>
                    <div className="word-tags">
                      {[...(word.registers ?? []), ...(word.contexts ?? [])].map(
                        (tag, index) => <span key={tag + index}>{tag}</span>,
                      )}
                    </div>
                  </section>
                  {(word.related_words?.length || words.length > 1) && (
                    <section>
                      <h4>คำใกล้เคียง</h4>
                      <div className="related-words">
                        {(word.related_words ??
                          words
                            .filter((candidate) => candidate !== word)
                            .map((candidate) => ({ headword: candidate.headword })))
                          .map((related, index) => {
                            const candidate = words.find(
                              (item) => item.headword === related.headword,
                            );
                            return candidate ? (
                              <button
                                key={related.headword + index}
                                onClick={() => select(candidate)}
                              >
                                {related.headword}
                                <span>↗</span>
                              </button>
                            ) : (
                              <span key={related.headword + index}>
                                {related.headword}
                              </span>
                            );
                          })}
                      </div>
                    </section>
                  )}
                  <button
                    className="compare-button"
                    disabled={loading}
                    aria-pressed={compareSelected.includes(word.headword)}
                    onClick={() => onCompare(word)}
                  >
                    <Icon name="compare" />
                    {compareSelected.includes(word.headword)
                      ? "เลือกเทียบแล้ว"
                      : "เลือกเปรียบเทียบ"}
                  </button>
                  {!!compareSelected.length && (
                    <a className="source-shortcut" href="#compare">
                      ไปยังตารางเปรียบเทียบ →
                    </a>
                  )}
                </div>
              </article>

              <aside data-reveal className="guidance-panel">
                <section className="context-guidance">
                  <Icon name="book" />
                  <h3>บริบทการใช้</h3>
                  <p>
                    {word.contextual_explanation ??
                      word.ai_explanation ??
                      "พิจารณาความหมายและระดับภาษาให้ตรงกับสถานการณ์ที่ต้องการสื่อ"}
                  </p>
                  {(word.contextual_explanation || word.ai_explanation) && (
                    <small>
                      {demo
                        ? "คำอธิบายตัวอย่างประกอบการใช้งาน"
                        : "ระบบช่วยสรุปจากบริบทและแหล่งข้อมูลที่มี"}
                    </small>
                  )}
                </section>
                <section className="sources-panel">
                  <Icon name="source" />
                  <h3>แหล่งข้อมูล</h3>
                  {word.evidence ? (
                    <>
                      <p>{word.evidence.source_book}</p>
                      <small>
                        {word.evidence.edition}{" "}
                        {word.evidence.edition_year &&
                          `พ.ศ. ${word.evidence.edition_year}`}
                      </small>
                      <p className="evidence-status">
                        {!demo && word.evidence.is_official
                          ? "✓ ตรวจสอบแหล่งข้อมูลแล้ว"
                          : "ข้อมูลตัวอย่าง / ยังไม่รับรอง"}
                      </p>
                    </>
                  ) : (
                    <p>ยังไม่มีหลักฐานเพียงพอสำหรับยืนยันข้อมูลนี้</p>
                  )}
                  <button
                    className="evidence-button"
                    disabled={loading}
                    onClick={() => onEvidence(word)}
                  >
                    {word.evidence ? "ตรวจสอบหลักฐาน" : "สถานะหลักฐานอ้างอิง"}
                    <Icon name="arrow" />
                  </button>
                </section>
              </aside>
            </>
          )}

          {!loading && !error && !words.length && (
            <div data-reveal className="empty-results">
              <Icon name="search" />
              <h3>
                {filters.register || filters.context || filters.excluded
                  ? "ยังไม่มีคำที่ตรงกับตัวกรองนี้"
                  : "ยังไม่พบคำที่ตรงพอ"}
              </h3>
              <p>
                ลองเล่าบริบทเพิ่มอีกนิด เช่น ใช้ในงานเขียน การพูด หรือสถานการณ์แบบใด
              </p>
              <button
                onClick={() => {
                  setFilters({ register: "", context: "", excluded: "" });
                  document
                    .getElementById("persistent-meaning")
                    ?.focus({ preventScroll: true });
                }}
              >
                เพิ่มบริบทในการค้นหา
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
