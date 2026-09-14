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
}: {
  words: Recommendation[];
  selected: string[];
  sourceMode?: SearchResponse["mode"];
  onSelect: (words: string[]) => void;
  onEvidence: (word: Recommendation) => void;
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

  return (
    <section id="compare" className="feature-section comparator" aria-labelledby="compare-title">
      <header className="section-heading">
        <p>อ่านความต่างในไม่กี่วินาที</p>
        <h2 id="compare-title">เปรียบเทียบคำในบริบท</h2>
        <span>เลือกหรือกรอกคำภาษาไทย 2–5 คำ แล้วดูว่าน้ำหนักและจังหวะการใช้ต่างกันอย่างไร</span>
      </header>

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
        </div>
      )}
    </section>
  );
}
