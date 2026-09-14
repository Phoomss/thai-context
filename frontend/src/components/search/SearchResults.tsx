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
import SignLanguageModal from "../tsl/SignLanguageModal";
import SignLanguageSection from "../tsl/SignLanguageSection";
import BrailleModal from "../braille/BrailleModal";
import WordTranslations from "../translations/WordTranslations";
import SearchResultFeedback from "../feedback/SearchResultFeedback";
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
  onAIChat?: (word: Recommendation) => void;
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
  onAIChat,
}: SearchResultsProps) {
  const { result, loading, error, revealed, revision, query } = experience;
  const [selection, setSelection] = useState("");
  const [signLanguageOpen, setSignLanguageOpen] = useState(false);
  const [brailleOpen, setBrailleOpen] = useState(false);
  const [filters, setFilters] = useState<SmartFilterValue>({
    register: "",
    context: "",
    excluded: "",
  });
  const [copiedWord, setCopiedWord] = useState(false);
  const [copiedSentenceIdx, setCopiedSentenceIdx] = useState<number | null>(null);
  const workspace = useRef<HTMLDivElement>(null);

  const handleCopyWord = (headword: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(headword);
      }
      setCopiedWord(true);
      setTimeout(() => setCopiedWord(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopySentence = (sentence: string, index: number) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(sentence);
      }
      setCopiedSentenceIdx(index);
      setTimeout(() => setCopiedSentenceIdx(null), 2000);
    } catch {
      // Fallback
    }
  };

  useLayoutEffect(() => {
    setFilters({ register: "", context: "", excluded: "" });
    setSelection(sharedWord);
    setSignLanguageOpen(false);
    setBrailleOpen(false);
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
    setSignLanguageOpen(false);
    setBrailleOpen(false);
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
                      key={candidate.id ? `${candidate.id}-${index}` : `${candidate.headword}-${index}`}
                      className="candidate-row font-thai-reading"
                      aria-pressed={candidate.headword === word.headword}
                      disabled={loading}
                      onClick={() => select(candidate)}
                    >
                      <span className="candidate-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <strong>
                          {candidate.headword}
                          {(candidate.english || candidate.translations?.[0]?.translatedWord) && (
                            <span className="candidate-english font-ui">
                              {" "}· {candidate.english || candidate.translations?.[0]?.translatedWord}
                            </span>
                          )}
                        </strong>
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
                  {/* Header Title & Phonetics */}
                  <div className="detail-header-zone">
                    <p className="detail-kicker">ความหมายของคำ</p>
                    <div className="word-title-row">
                      <h3 id="word-title" className="font-thai-reading thai-headword" tabIndex={-1}>
                        {word.headword}
                        {(word.english || word.translations?.[0]?.translatedWord) && (
                          <span className="detail-english-inline font-ui">
                            {" "}({word.english || word.translations?.[0]?.translatedWord})
                          </span>
                        )}
                      </h3>
                      <button
                        type="button"
                        className="quick-copy-word-btn"
                        aria-label={`คัดลอกคำว่า ${word.headword}`}
                        onClick={() => handleCopyWord(word.headword)}
                        title={`คัดลอกคำว่า ${word.headword}`}
                      >
                        <span aria-hidden="true">{copiedWord ? "✓" : "📋"}</span>
                        <span>{copiedWord ? "คัดลอกแล้ว ✓" : "คัดลอกคำ"}</span>
                      </button>
                    </div>
                    <p className="word-phonetic font-thai-reading">
                      {word.pronunciation?.phonetic} {word.pos && <span className="word-pos-badge font-ui">{word.pos}</span>}
                    </p>
                  </div>

                  {/* Multimodal Utilities Toolbar */}
                  <div className="word-utilities" aria-label="เครื่องมือเสริมการใช้งานคำ">
                    <PronunciationButton word={word} />
                    <button
                      type="button"
                      className="icon-button tsl-trigger-btn font-thai-reading"
                      onClick={() => setSignLanguageOpen(true)}
                      aria-haspopup="dialog"
                      aria-expanded={signLanguageOpen}
                      aria-label={`ดูภาษามือไทยสำหรับคำว่า ${word.headword}`}
                    >
                      <span className="tsl-btn-text">[ภาษามือไทย 🤟]</span>
                    </button>
                    <button
                      type="button"
                      className="icon-button braille-trigger-btn font-thai-reading"
                      onClick={() => setBrailleOpen(true)}
                      aria-haspopup="dialog"
                      aria-expanded={brailleOpen}
                      aria-label={`ดูอักษรเบรลล์สำหรับคำว่า ${word.headword}`}
                    >
                      <span className="braille-btn-text">[Braille ⠃]</span>
                    </button>
                    <ShareResultButton
                      word={word}
                      query={result?.query_understanding.raw_query ?? query}
                      demo={demo}
                    />
                  </div>

                  {/* 1. Core Meaning */}
                  <section className="detail-section definition-section">
                    <h4>ความหมาย</h4>
                    <p className="definition font-thai-reading">{word.definition}</p>
                  </section>

                  {/* 2. Real-World Examples */}
                  {!!examples.length && (
                    <section className="detail-section examples-section">
                      <h4>ตัวอย่างการใช้</h4>
                      <div className="examples-list">
                        {examples.map((example, idx) => (
                          <div className="example-item-wrap" key={example + idx}>
                            <blockquote className="font-thai-reading">{example}</blockquote>
                            <button
                              type="button"
                              className="copy-sentence-btn"
                              aria-label={`คัดลอกประโยคตัวอย่าง: ${example}`}
                              onClick={() => handleCopySentence(example, idx)}
                              title="คัดลอกประโยคตัวอย่างนี้"
                            >
                              <span aria-hidden="true">{copiedSentenceIdx === idx ? "✓" : "📋"}</span>
                              <span>{copiedSentenceIdx === idx ? "คัดลอกแล้ว ✓" : "คัดลอกประโยค"}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 3. Suitable Tone & Contexts */}
                  <section className="detail-section context-tags-section">
                    <h4>เหมาะกับบริบท</h4>
                    <div className="word-tags font-thai-reading">
                      {[...(word.registers ?? []), ...(word.contexts ?? [])].map(
                        (tag, index) => <span key={tag + index}>{tag}</span>,
                      )}
                    </div>
                  </section>

                  {/* 4. International Translations & Coined Terms */}
                  <WordTranslations
                    headword={word.headword}
                    initialTranslations={word.translations}
                  />

                  {/* 5. Accessibility: Thai Sign Language Player */}
                  <SignLanguageSection
                    word={word.headword}
                    onOpenFullModal={() => setSignLanguageOpen(true)}
                  />

                  {/* 6. Related Words & Synonyms */}
                  {(word.related_words?.length || words.length > 1) && (
                    <section className="detail-section related-words-section">
                      <h4>คำใกล้เคียง</h4>
                      <div className="related-words font-thai-reading">
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

                  {/* 7. Action Toolbar */}
                  <div className="detail-action-bar">
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
                    {onAIChat && (
                      <button
                        type="button"
                        className="ai-consult-btn font-thai-reading"
                        disabled={loading}
                        onClick={() => onAIChat(word)}
                        title={`ปรึกษาผู้ช่วย AI เกี่ยวกับคำว่า "${word.headword}"`}
                      >
                        <span aria-hidden="true">✨</span>
                        <span>ปรึกษาผู้ช่วย AI เกี่ยวกับคำนี้</span>
                      </button>
                    )}
                    {!!compareSelected.length && (
                      <a className="source-shortcut" href="#compare">
                        ไปยังตารางเปรียบเทียบ →
                      </a>
                    )}
                  </div>

                  <SearchResultFeedback
                    query={result?.query_understanding.raw_query ?? query}
                    word={word.headword}
                  />
                </div>
              </article>

              <aside data-reveal className="guidance-panel">
                <section className="context-guidance">
                  <Icon name="book" />
                  <h3>บริบทการใช้</h3>
                  <p className="font-thai-reading">
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
                      <p className="font-thai-reading">{word.evidence.source_book}</p>
                      <small className="font-thai-reading">
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
                    <p className="font-thai-reading">ยังไม่มีหลักฐานเพียงพอสำหรับยืนยันข้อมูลนี้</p>
                  )}
                  <button
                    className="evidence-button"
                    disabled={loading}
                    onClick={() => onEvidence(word)}
                  >
                    {word.evidence ? "ตรวจสอบหลักฐาน" : "สถานะหลักฐานอ้างอิง"}
                    <Icon name="arrow" />
                  </button>
                  {onAIChat && (
                    <button
                      type="button"
                      className="ai-consult-btn font-thai-reading"
                      style={{ marginTop: "10px", width: "100%", justifyContent: "center" }}
                      disabled={loading}
                      onClick={() => onAIChat(word)}
                    >
                      <span aria-hidden="true">✨</span>
                      <span>ปรึกษาผู้ช่วย AI</span>
                    </button>
                  )}
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
      {word && (
        <SignLanguageModal
          word={word.headword}
          isOpen={signLanguageOpen}
          onClose={() => setSignLanguageOpen(false)}
        />
      )}
      {word && (
        <BrailleModal
          word={word.headword}
          isOpen={brailleOpen}
          onClose={() => setBrailleOpen(false)}
        />
      )}
    </section>
  );
}
