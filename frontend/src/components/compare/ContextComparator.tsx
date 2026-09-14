"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { compareWords } from "@/lib/api-client";
import {
  normalizeCompareWords,
  type CompareResponse,
  type ComparisonEvidence,
} from "@/lib/compare-types";
import type { Recommendation, SearchResponse } from "@/lib/search-types";

const EMPTY_INPUTS = ["", ""];
const MISSING_DICTIONARY_DEFINITION = "ไม่มีข้อมูลในพจนานุกรมทางการ";
const UNSPECIFIED_PART_OF_SPEECH = "ไม่ระบุ";

export default function ContextComparator({
  words,
  selected,
  sourceMode,
  onSelect,
  onEvidence,
  onAIChat,
}: {
  words: Recommendation[];
  selected: string[];
  sourceMode?: SearchResponse["mode"];
  onSelect: (words: string[]) => void;
  onEvidence: (word: Recommendation) => void;
  onAIChat?: (word: Recommendation, query?: string) => void;
}) {
  const options = useMemo(
    () => Array.from(new Set(words.map((word) => word.headword.trim()).filter(Boolean))),
    [words],
  );
  const externalInputs = useMemo(() => {
    const external = Array.from(
      new Set(selected.map((word) => word.trim()).filter(Boolean)),
    ).slice(0, 5);
    const next = external.length
      ? external
      : options.length >= 2
        ? options.slice(0, 2)
        : [...EMPTY_INPUTS];
    if (next.length === 1) {
      next.push(options.find((word) => word !== next[0]) ?? "");
    }
    return next;
  }, [options, selected]);
  const externalKey = JSON.stringify([options, selected]);
  const lastExternalKey = useRef(externalKey);
  const [inputs, setInputs] = useState<string[]>(externalInputs);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const request = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const activeWords = useRef("");

  useEffect(() => {
    if (externalKey === lastExternalKey.current) return;
    lastExternalKey.current = externalKey;
    const nextKey = externalInputs.map((word) => word.trim()).join("\u0000");
    if (request.current && activeWords.current && nextKey !== activeWords.current) {
      request.current.abort();
      request.current = null;
      sequence.current += 1;
      setLoading(false);
    }
    setInputs(externalInputs);
    setResult(null);
    setError("");
  }, [externalInputs, externalKey]);

  useEffect(() => () => request.current?.abort(), []);

  const invalidateRequest = () => {
    if (!request.current) return;
    request.current.abort();
    request.current = null;
    sequence.current += 1;
    setLoading(false);
  };

  const updateInput = (index: number, value: string) => {
    invalidateRequest();
    setInputs((current) => current.map((word, itemIndex) => itemIndex === index ? value : word));
    setResult(null);
    setError("");
  };

  const addWord = () => {
    if (inputs.length >= 5) return;
    invalidateRequest();
    setInputs((current) => [...current, ""]);
    setResult(null);
  };

  const removeWord = (index: number) => {
    if (inputs.length <= 2) return;
    invalidateRequest();
    setInputs((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setResult(null);
    setError("");
  };

  const submit = async () => {
    let normalized: string[];
    try {
      normalized = normalizeCompareWords(inputs);
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "ข้อมูลไม่ถูกต้อง");
      return;
    }

    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const id = ++sequence.current;
    activeWords.current = normalized.join("\u0000");
    setLoading(true);
    setError("");
    setResult(null);
    onSelect(normalized);
    try {
      const response = await compareWords(normalized, controller.signal);
      if (!controller.signal.aborted && id === sequence.current) setResult(response);
    } catch (requestError) {
      if (!controller.signal.aborted && id === sequence.current) {
        setError(
          requestError instanceof Error && requestError.message
            ? requestError.message
            : "ขณะนี้เปรียบเทียบคำไม่ได้ กรุณาลองอีกครั้ง",
        );
      }
    } finally {
      if (id === sequence.current) {
        request.current = null;
        setLoading(false);
      }
    }
  };

  const openEvidence = (headword: string, evidence: ComparisonEvidence) => {
    const editionYear = Number.parseInt(evidence.edition, 10);
    onEvidence({
      headword,
      definition: evidence.definition,
      evidence: {
        source_book: evidence.source,
        edition: `ฉบับ พ.ศ. ${evidence.edition}`,
        ...(Number.isFinite(editionYear) ? { edition_year: editionYear } : {}),
        quote: evidence.definition,
        is_official: evidence.sourceType !== "AI_GENERATED",
      },
    });
  };

  const leftWord = useMemo(() => {
    const head = (inputs[0] || selected[0] || options[0] || words[0]?.headword || "").trim();
    return words.find((w) => w.headword.trim() === head) ?? (head ? { headword: head, definition: "" } : undefined);
  }, [inputs, selected, options, words]);

  const rightWord = useMemo(() => {
    const head = (inputs[1] || selected[1] || options[1] || words[1]?.headword || "").trim();
    return words.find((w) => w.headword.trim() === head) ?? (head ? { headword: head, definition: "" } : undefined);
  }, [inputs, selected, options, words]);

  return (
    <section id="compare" className="feature-section comparator" aria-labelledby="compare-title">
      <header className="section-heading">
        <p>อ่านความต่างในไม่กี่วินาที</p>
        <h2 id="compare-title">เปรียบเทียบคำในบริบท</h2>
        <span>เลือกหรือกรอกคำภาษาไทย 2–5 คำ แล้วดูว่าน้ำหนักและจังหวะการใช้ต่างกันอย่างไร</span>
      </header>

      {/* Nuance Delta Summary Banner */}
      {leftWord && rightWord && leftWord.headword !== rightWord.headword && (leftWord.comparison || leftWord.definition) && (
        <aside
          className="nuance-delta-banner"
          aria-label="สรุปจุดต่างสำคัญ"
          style={{
            maxWidth: "960px",
            margin: "0 auto 24px",
            padding: "16px 20px",
            background: "#eff6ff",
            borderRadius: "14px",
            border: "1px solid #bfdbfe",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "20px", flexShrink: 0 }}>💡</span>
          <div>
            <strong
              style={{
                display: "block",
                color: "#1e40af",
                fontSize: "14px",
                marginBottom: "4px",
              }}
            >
              สรุปจุดต่างสำคัญ (Nuance Delta):
            </strong>
            <p
              className="font-thai-reading"
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#1e3a8a",
                lineHeight: 1.6,
              }}
            >
              คำว่า <strong>&ldquo;{leftWord.headword}&rdquo;</strong>{" "}
              {leftWord.comparison?.emphasis
                ? `เน้น${leftWord.comparison.emphasis}`
                : leftWord.definition ? `เน้น${leftWord.definition}` : ""}{" "}
              — ในขณะที่คำว่า <strong>&ldquo;{rightWord.headword}&rdquo;</strong>{" "}
              {rightWord.comparison?.emphasis
                ? `เน้น${rightWord.comparison.emphasis}`
                : rightWord.definition ? `เน้น${rightWord.definition}` : ""}
            </p>
          </div>
        </aside>
      )}

      <div className="comparison-inputs">
        <datalist id="comparison-word-options">
          {options.map((option) => <option value={option} key={option} />)}
        </datalist>
        {inputs.map((word, index) => (
          <label key={index}>
            <span>คำที่ {index + 1}</span>
            <span className="comparison-input-row">
              <input
                className="font-thai-reading"
                aria-label={`คำที่ ${index + 1}`}
                list="comparison-word-options"
                value={word}
                maxLength={100}
                onChange={(event) => updateInput(index, event.target.value)}
              />
              {inputs.length > 2 && (
                <button type="button" onClick={() => removeWord(index)} aria-label={`ลบคำที่ ${index + 1}`}>×</button>
              )}
            </span>
          </label>
        ))}
        <div className="comparison-actions">
          {inputs.length < 5 && <button type="button" onClick={addWord}>+ เพิ่มคำ</button>}
          <button type="button" className="comparison-submit" disabled={loading} onClick={submit}>
            {loading ? "กำลังเปรียบเทียบ…" : "เปรียบเทียบคำ"}
          </button>
        </div>
      </div>

      {error && <div className="comparison-error" role="alert"><p>{error}</p><button type="button" onClick={submit}>ลองอีกครั้ง</button></div>}
      {loading && <div className="comparison-loading" role="status">กำลังวิเคราะห์นิยามและบริบทจากข้อมูลพจนานุกรม…</div>}

      {result && (
        <div className="comparison-result">
          <div className="comparison-surface" data-word-count={result.words.length}>
            {result.words.map((word, index) => {
              const evidence = result.evidence.find((item) => item.word === word.headword);
              const liveRecommendation = sourceMode === "live"
                ? words.find((item) => item.headword.trim() === word.headword.trim())
                : undefined;
              const definition = word.definition === MISSING_DICTIONARY_DEFINITION
                ? liveRecommendation?.definition ?? word.definition
                : word.definition;
              const partOfSpeech = word.partOfSpeech === UNSPECIFIED_PART_OF_SPEECH
                ? liveRecommendation?.pos
                : word.partOfSpeech;
              return (
                <article className="comparison-card" key={`${word.headword}-${index}`}>
                  <p className="comparison-word-number">คำที่ {index + 1}</p>
                  <h3 className="font-thai-reading">{word.headword}</h3>
                  <dl>
                    <div><dt>ความหมาย</dt><dd className="font-thai-reading">{definition}</dd></div>
                    {partOfSpeech && <div><dt>ชนิดคำ</dt><dd className="font-thai-reading">{partOfSpeech}</dd></div>}
                    {(word.edition || evidence?.edition) && <div><dt>ฉบับ</dt><dd>พ.ศ. {word.edition ?? evidence?.edition}</dd></div>}
                  </dl>
                  {evidence && (
                    <button className="source-shortcut" type="button" onClick={() => openEvidence(word.headword, evidence)}>
                      ดูหลักฐานของคำนี้ ↗
                    </button>
                  )}
                </article>
              );
            })}
          </div>

          <div className="comparison-summary">
            <section className="difference-row"><h3>ความแตกต่างด้านความหมาย</h3><p className="font-thai-reading">{result.comparison.meaningDifference}</p></section>
            <section><h3>ความแตกต่างด้านบริบท</h3><p className="font-thai-reading">{result.comparison.contextDifference}</p></section>
            <section><h3>คำแนะนำการใช้</h3><p className="font-thai-reading">{result.comparison.usageGuidance}</p></section>
          </div>

          {result.evidence.length > 0 && (
            <section className="comparison-evidence" aria-labelledby="comparison-evidence-title">
              <h3 id="comparison-evidence-title">หลักฐานอ้างอิงจาก API</h3>
              <ul>
                {result.evidence.map((item, index) => (
                  <li key={`${item.word ?? "evidence"}-${index}`}>
                    <strong>{item.word ?? "คำอ้างอิง"}</strong>
                    <span>{item.source} · พ.ศ. {item.edition}</span>
                    <p className="font-thai-reading">{item.definition}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {onAIChat && result.words.length >= 2 && (
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                className="ai-consult-btn font-thai-reading"
                onClick={() => {
                  const firstHeadword = result.words[0].headword;
                  const secondHeadword = result.words[1].headword;
                  const matchedWord =
                    words.find((w) => w.headword.trim() === firstHeadword.trim()) ??
                    ({
                      headword: firstHeadword,
                      definition: result.words[0].definition,
                    } as Recommendation);
                  onAIChat(
                    matchedWord,
                    `คำว่า '${firstHeadword}' ต่างกับ '${secondHeadword}' ในงานวิจัยอย่างไร`,
                  );
                }}
              >
                <span aria-hidden="true">✨</span>
                <span>
                  ปรึกษาผู้ช่วย AI เพื่อวิเคราะห์ความต่างระหว่าง "{result.words[0].headword}" กับ "{result.words[1].headword}"
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {!result && onAIChat && leftWord && rightWord && leftWord.headword !== rightWord.headword && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            className="ai-consult-btn font-thai-reading"
            onClick={() =>
              onAIChat(
                leftWord,
                `คำว่า '${leftWord.headword}' ต่างกับ '${rightWord.headword}' ในงานวิจัยอย่างไร`
              )
            }
          >
            <span aria-hidden="true">✨</span>
            <span>
              ปรึกษาผู้ช่วย AI เพื่อวิเคราะห์ความต่างระหว่าง "{leftWord.headword}" กับ "{rightWord.headword}"
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
