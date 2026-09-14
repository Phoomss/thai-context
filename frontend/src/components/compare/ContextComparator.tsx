"use client";
import { useEffect, useMemo, useState } from "react";
import type { Recommendation } from "@/lib/search-types";

const detail = (word: Recommendation) => ({
  meaning: word.definition,
  emphasis: word.comparison?.emphasis ?? word.ai_explanation ?? "เน้นความหมายตามบริบทที่ค้นหา",
  context: word.contexts?.join(" · ") || "บริบททั่วไป",
  register: word.registers?.join(" · ") || "ไม่ระบุระดับภาษา",
  useWhen: word.comparison?.use_when ?? "ใช้เมื่อความหมายตรงกับสถานการณ์ที่ต้องการสื่อ",
  example: word.comparison?.example ?? `ตัวอย่างการใช้คำว่า “${word.headword}” ควรตรวจสอบร่วมกับบริบทของประโยค`,
  confusion: word.comparison?.common_confusion ?? "ความหมายอาจใกล้กับคำอื่น ควรพิจารณาน้ำหนักของคำก่อนใช้",
});

export default function ContextComparator({
  words,
  selected,
  onSelect,
  onEvidence,
}: {
  words: Recommendation[];
  selected: string[];
  onSelect: (words: string[]) => void;
  onEvidence: (word: Recommendation) => void;
}) {
  const options = useMemo(
    () => Array.from(new Map(words.map((word) => [word.headword, word])).values()),
    [words],
  );
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  useEffect(() => {
    const nextLeft = selected[0] && options.some((w) => w.headword === selected[0])
      ? selected[0]
      : options[0]?.headword ?? "";
    const nextRight = selected[1] && options.some((w) => w.headword === selected[1])
      ? selected[1]
      : options.find((word) => word.headword !== nextLeft)?.headword ?? "";
    setLeft(nextLeft);
    setRight(nextRight);
  }, [options, selected]);

  if (options.length < 2) return null;
  const leftWord = options.find((word) => word.headword === left) ?? options[0];
  const rightWord = options.find((word) => word.headword === right) ?? options[1];

  const change = (side: "left" | "right", value: string) => {
    const next = side === "left" ? [value, rightWord.headword] : [leftWord.headword, value];
    if (next[0] === next[1]) {
      const replacement = options.find((word) => word.headword !== value)?.headword ?? "";
      if (side === "left") next[1] = replacement;
      else next[0] = replacement;
    }
    setLeft(next[0]);
    setRight(next[1]);
    onSelect(next);
  };

  return (
    <section id="compare" className="feature-section comparator" aria-labelledby="compare-title">
      <header className="section-heading">
        <p>อ่านความต่างในไม่กี่วินาที</p>
        <h2 id="compare-title">เปรียบเทียบคำในบริบท</h2>
        <span>เลือกคำสองคำ แล้วดูว่าน้ำหนักและจังหวะการใช้ต่างกันอย่างไร</span>
      </header>
      <div className="comparison-surface">
        {[leftWord, rightWord].map((word, index) => {
          const data = detail(word);
          return (
            <article className="comparison-card" key={word.headword}>
              <label>
                <span>คำที่ {index ? "๒" : "๑"}</span>
                <select
                  aria-label={`เลือกคำที่ ${index ? "สอง" : "หนึ่ง"}`}
                  value={word.headword}
                  onChange={(event) => change(index ? "right" : "left", event.target.value)}
                >
                  {options.map((option) => (
                    <option key={option.headword}>{option.headword}</option>
                  ))}
                </select>
              </label>
              <h3>{word.headword}</h3>
              <dl>
                <div><dt>ความหมาย</dt><dd>{data.meaning}</dd></div>
                <div className="difference-row"><dt>เน้นอะไร</dt><dd>{data.emphasis}</dd></div>
                <div><dt>บริบท</dt><dd>{data.context}</dd></div>
                <div><dt>ระดับภาษา</dt><dd>{data.register}</dd></div>
                <div><dt>ใช้เมื่อไร</dt><dd>{data.useWhen}</dd></div>
                <div><dt>ตัวอย่าง</dt><dd>{data.example}</dd></div>
                <div><dt>จุดที่มักสับสน</dt><dd>{data.confusion}</dd></div>
              </dl>
              <button className="source-shortcut" type="button" onClick={() => onEvidence(word)}>
                {word.evidence ? "ดูหลักฐานของคำนี้ ↗" : "ตรวจสถานะหลักฐาน ↗"}
              </button>
            </article>
          );
        })}
        <span className="versus" aria-hidden="true">เทียบ</span>
      </div>
    </section>
  );
}

