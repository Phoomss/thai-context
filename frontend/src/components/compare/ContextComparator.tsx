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

  return (
    <section id="compare" className="feature-section comparator" aria-labelledby="compare-title">
      <header className="section-heading">
        <p>อ่านความต่างในไม่กี่วินาที</p>
        <h2 id="compare-title">เปรียบเทียบคำในบริบท</h2>
        <span>เลือกหรือกรอกคำภาษาไทย 2–5 คำ แล้วดูว่าน้ำหนักและจังหวะการใช้ต่างกันอย่างไร</span>
      </header>

      {/* Nuance Delta Summary Banner */}
      {leftWord && rightWord && leftWord.headword !== rightWord.headword && (
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
                : `เน้น${leftWord.definition}`}{" "}
              — ในขณะที่คำว่า <strong>&ldquo;{rightWord.headword}&rdquo;</strong>{" "}
              {rightWord.comparison?.emphasis
                ? `เน้น${rightWord.comparison.emphasis}`
                : `เน้น${rightWord.definition}`}
            </p>
          </div>
        </aside>
      )}

      <div className="comparison-surface">
        {[leftWord, rightWord].map((word, index) => {
          const data = detail(word);
          return (
            <article className="comparison-card" key={`${word.headword}-${index}`}>
              <label>
                <span>คำที่ {index ? "๒" : "๑"}</span>
                <select
                  className="font-thai-reading"
                  aria-label={`เลือกคำที่ ${index ? "สอง" : "หนึ่ง"}`}
                  value={word.headword}
                  onChange={(event) => change(index ? "right" : "left", event.target.value)}
                >
                  {options.map((option, optIdx) => (
                    <option key={`${option.headword}-${optIdx}`}>{option.headword}</option>
                  ))}
                </select>
              </label>
              <h3 className="font-thai-reading">{word.headword}</h3>
              <dl>
                <div><dt>ความหมาย</dt><dd className="font-thai-reading">{data.meaning}</dd></div>
                <div className="difference-row"><dt>เน้นอะไร</dt><dd className="font-thai-reading">{data.emphasis}</dd></div>
                <div><dt>บริบท</dt><dd className="font-thai-reading">{data.context}</dd></div>
                <div><dt>ระดับภาษา</dt><dd className="font-thai-reading">{data.register}</dd></div>
                <div><dt>ใช้เมื่อไร</dt><dd className="font-thai-reading">{data.useWhen}</dd></div>
                <div><dt>ตัวอย่าง</dt><dd className="font-thai-reading">{data.example}</dd></div>
                <div><dt>จุดที่มักสับสน</dt><dd className="font-thai-reading">{data.confusion}</dd></div>
              </dl>
              <button className="source-shortcut" type="button" onClick={() => onEvidence(word)}>
                {word.evidence ? "ดูหลักฐานของคำนี้ ↗" : "ตรวจสถานะหลักฐาน ↗"}
              </button>
            </article>
          );
        })}
      </div>
      {onAIChat && leftWord && rightWord && (
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
