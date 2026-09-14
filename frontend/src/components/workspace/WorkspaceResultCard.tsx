"use client";

import React, { useState } from "react";
import type {
  WorkspaceResponsePayload,
  WordRecommendation,
  GeneratedContentItem,
} from "@/lib/workspace-types";
import { audioManager } from "@/lib/audio-manager";
import type { Recommendation } from "@/lib/search-types";

interface WorkspaceResultCardProps {
  result: WorkspaceResponsePayload;
  onSelectAction?: (prompt: string) => void;
  activeDraftText?: string;
  onUpdateDraft?: (text: string) => void;
}

export default function WorkspaceResultCard({
  result,
  onSelectAction,
  activeDraftText,
  onUpdateDraft,
}: WorkspaceResultCardProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedGeneral, setCopiedGeneral] = useState(false);
  const [selectedWordSet, setSelectedWordSet] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"all" | "words" | "compare" | "writing" | "check" | "bridge">("all");

  const {
    context,
    recommendations,
    comparison,
    generated_content,
    language_check,
    language_bridge,
    evidence,
    confidence_level,
    confidence,
    abstained,
    abstention_reason,
  } = result;

  const handleCopy = (text: string, idx?: number) => {
    navigator.clipboard?.writeText(text);
    if (idx !== undefined) {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } else {
      setCopiedGeneral(true);
      setTimeout(() => setCopiedGeneral(false), 2000);
    }
  };

  const handleSpeak = (word: string) => {
    audioManager.toggle({
      headword: word,
      pronunciation: { phonetic: word, locale: "th-TH" },
      pos: "น.",
      definition: "",
    } as unknown as Recommendation);
  };

  const toggleWordSelection = (word: string) => {
    const next = new Set(selectedWordSet);
    if (next.has(word)) next.delete(word);
    else next.add(word);
    setSelectedWordSet(next);
  };

  const selectedArray = Array.from(selectedWordSet);

  return (
    <div className="space-y-6">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          {/* Context Tag */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/90 text-sky-300 border border-sky-600/50 shadow-sm">
            🎯 บริบท: {context.type} ({context.tone})
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700">
            กลุ่มเป้าหมาย: {context.audience}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-wider font-bold ${
              context.source === "USER_PROVIDED"
                ? "bg-purple-950/80 text-purple-300 border border-purple-600/50"
                : "bg-indigo-950/80 text-indigo-300 border border-indigo-600/50"
            }`}
          >
            {context.source}
          </span>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">ระดับความถูกต้อง:</span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              confidence_level === "HIGH"
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50"
                : confidence_level === "MEDIUM"
                ? "bg-amber-950/80 text-amber-300 border border-amber-500/50"
                : "bg-rose-950/80 text-rose-300 border border-rose-500/50"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                confidence_level === "HIGH"
                  ? "bg-emerald-400"
                  : confidence_level === "MEDIUM"
                  ? "bg-amber-400"
                  : "bg-rose-400"
              }`}
            />
            {confidence_level} ({Math.round(confidence * 100)}%)
          </span>
        </div>
      </div>

      {/* Abstention Warning if Hallucination Guard Triggered */}
      {abstained && (
        <div
          role="alert"
          className="p-5 rounded-2xl bg-rose-950/60 border border-rose-600 text-rose-200 text-sm shadow-xl"
        >
          <div className="flex items-center gap-2 font-bold text-rose-300 text-base mb-2">
            <span>🛡️</span> ระงับการสรุปผลเนื่องจากหลักฐานไม่เพียงพอ
          </div>
          <p className="leading-relaxed">{abstention_reason}</p>
        </div>
      )}

      {/* Section Filter Pills for Fast Navigation */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-800">
        <span className="text-xs font-semibold text-slate-400 mr-1">มุมมอง:</span>
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "all"
              ? "bg-sky-500 text-white shadow"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          🌟 แสดงทั้งหมด
        </button>
        {recommendations && recommendations.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("words")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "words"
                ? "bg-sky-500 text-white shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            📖 คำศัพท์ ({recommendations.length})
          </button>
        )}
        {comparison && (
          <button
            type="button"
            onClick={() => setActiveTab("compare")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "compare"
                ? "bg-sky-500 text-white shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            ⚖️ เปรียบเทียบคำ
          </button>
        )}
        {generated_content && generated_content.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("writing")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "writing"
                ? "bg-sky-500 text-white shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            ✍️ ข้อความที่สร้าง ({generated_content.length})
          </button>
        )}
        {language_check && (
          <button
            type="button"
            onClick={() => setActiveTab("check")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "check"
                ? "bg-sky-500 text-white shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            🔍 ตรวจภาษา ({language_check.score}/100)
          </button>
        )}
        {language_bridge && (
          <button
            type="button"
            onClick={() => setActiveTab("bridge")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "bridge"
                ? "bg-sky-500 text-white shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            🌐 Bridge (EN)
          </button>
        )}
      </div>

      {/* Word Recommendations Section */}
      {(activeTab === "all" || activeTab === "words") && recommendations && recommendations.length > 0 && (
        <section aria-labelledby="recommendations-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3
              id="recommendations-heading"
              className="text-base font-bold text-slate-100 flex items-center gap-2"
            >
              <span>📖</span> คำศัพท์ที่คัดสรรจากพจนานุกรมทางการ
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              พบ {recommendations.length} คำ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, i) => {
              const isSelected = selectedWordSet.has(rec.word);
              return (
                <div
                  key={i}
                  className={`flex flex-col justify-between p-5 rounded-2xl bg-slate-900/80 border transition-all shadow-md group ${
                    isSelected
                      ? "border-cyan-400 ring-2 ring-cyan-500/20 bg-slate-900"
                      : "border-slate-800 hover:border-sky-500/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-baseline gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleWordSelection(rec.word)}
                          className="text-xl font-extrabold text-sky-300 group-hover:text-cyan-300 transition-colors text-left flex items-center gap-2"
                          title="คลิกเพื่อเลือกคำนี้"
                        >
                          <span className={`text-sm ${isSelected ? "text-cyan-400" : "text-slate-600"}`}>
                            {isSelected ? "☑" : "☐"}
                          </span>
                          <span>{rec.word}</span>
                        </button>
                        {rec.pos && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
                            {rec.pos}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSpeak(rec.word)}
                          className="text-xs p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                          title="ฟังเสียงอ่าน"
                          aria-label={`ฟังเสียงอ่านคำว่า ${rec.word}`}
                        >
                          🔊
                        </button>
                      </div>
                      {rec.edition && (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/50 font-medium">
                          พ.ศ. {rec.edition}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-200 leading-relaxed mb-3">
                      {rec.definition}
                    </p>

                    <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-3">
                      <strong className="text-cyan-400">เหตุผลที่แนะนำ:</strong>{" "}
                      {rec.reason}
                    </div>
                  </div>

                  {/* Word Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectAction?.(`แต่งประโยคคำว่า ${rec.word} สำหรับรายงานวิชาการ`)
                      }
                      className="px-3 py-1 text-xs rounded-lg bg-sky-900/50 hover:bg-sky-800/70 text-sky-200 border border-sky-700/50 transition-colors flex items-center gap-1.5"
                    >
                      ✍️ แต่งประโยค
                    </button>
                    {recommendations.length >= 2 && i === 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          onSelectAction?.(
                            `${rec.word} หรือ ${recommendations[1].word} ต่างกันอย่างไร`
                          )
                        }
                        className="px-3 py-1 text-xs rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 transition-colors flex items-center gap-1.5"
                      >
                        ⚖️ เปรียบเทียบกับ {recommendations[1].word}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Comparison Bar for Multi-selection */}
          {selectedArray.length >= 2 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/50 border border-indigo-700/60 text-xs">
              <span className="text-indigo-200 font-medium">
                เลือกไว้ {selectedArray.length} คำ: <strong>{selectedArray.join(", ")}</strong>
              </span>
              <button
                type="button"
                onClick={() =>
                  onSelectAction?.(
                    `${selectedArray[0]} หรือ ${selectedArray[1]} ต่างกันอย่างไร`
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow"
              >
                ⚖️ เปรียบเทียบ 2 คำนี้ทันที
              </button>
            </div>
          )}
        </section>
      )}

      {/* Comparison Matrix Card */}
      {(activeTab === "all" || activeTab === "compare") && comparison && (
        <section
          aria-labelledby="comparison-heading"
          className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-indigo-700/50 shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              id="comparison-heading"
              className="text-base font-bold text-indigo-300 flex items-center gap-2"
            >
              <span>⚖️</span> เปรียบเทียบความหมาย: {comparison.wordA} vs{" "}
              {comparison.wordB}
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50 font-bold">
              Nuance Delta
            </span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed mb-4 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40">
            {comparison.difference_summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[comparison.wordA, comparison.wordB].map((wordKey) => {
              const detail = comparison.details?.[wordKey];
              if (!detail) return null;
              return (
                <div
                  key={wordKey}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-sky-400">
                      {wordKey}
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        onSelectAction?.(`แต่งประโยคคำว่า ${wordKey} สำหรับรายงานวิชาการ`)
                      }
                      className="text-[11px] px-2 py-0.5 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800"
                    >
                      ✍️ แต่งประโยค
                    </button>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li>
                      <strong className="text-slate-400">จุดเน้น:</strong>{" "}
                      {detail.emphasis}
                    </li>
                    <li>
                      <strong className="text-slate-400">ใช้เมื่อ:</strong>{" "}
                      {detail.use_when}
                    </li>
                    <li className="italic text-slate-400">
                      <strong className="not-italic text-slate-300">
                        ตัวอย่าง:
                      </strong>{" "}
                      &ldquo;{detail.example}&rdquo;
                    </li>
                    {detail.common_confusion && (
                      <li className="text-amber-300/90">
                        <strong>ข้อควรระวัง:</strong> {detail.common_confusion}
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>

          {comparison.guidance && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-700/50 text-emerald-200 text-xs flex items-start gap-2.5">
              <span className="text-lg select-none">💡</span>
              <div className="leading-relaxed">
                <strong className="font-semibold text-emerald-300">
                  คำแนะนำในการเลือกใช้:
                </strong>{" "}
                {comparison.guidance}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Generated Content Box & Interactive Workbench */}
      {(activeTab === "all" || activeTab === "writing") && generated_content && generated_content.length > 0 && (
        <section aria-labelledby="generated-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3
              id="generated-heading"
              className="text-base font-bold text-slate-100 flex items-center gap-2"
            >
              <span>✍️</span> ข้อความที่สร้างและปรับแต่งตามบริบท
            </h3>
            <span className="text-xs text-slate-400">
              {generated_content.length} รูปแบบ
            </span>
          </div>

          <div className="space-y-3">
            {generated_content.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/70 hover:border-cyan-500/50 transition-all shadow-md"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs px-2.5 py-1 rounded-full uppercase font-bold tracking-wide bg-sky-950 text-cyan-300 border border-sky-800">
                    {item.register} ({item.type})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.content, idx)}
                    className="text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors flex items-center gap-1.5"
                  >
                    {copiedIdx === idx ? "✓ คัดลอกแล้ว" : "📋 คัดลอกข้อความ"}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm md:text-base text-slate-100 font-medium leading-relaxed mb-2 select-all">
                  &ldquo;{item.content}&rdquo;
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-400 italic mt-2">
                    ℹ️ {item.notes}
                  </p>
                )}

                {/* Instant Transformation Action Bar */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400 mr-1">ปรับแต่งต่อ:</span>
                  <button
                    type="button"
                    onClick={() => onSelectAction?.("ทำให้สั้นลง")}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    ✂️ ทำให้สั้นลง
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectAction?.("ปรับให้เป็นทางการยิ่งขึ้น")}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    🎩 ทำให้เป็นทางการ
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectAction?.("ปรับให้เข้าใจง่ายสำหรับคนทั่วไป")}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    💡 สรุปเข้าใจง่าย
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectAction?.("ช่วยตรวจภาษาข้อความนี้")}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    🔍 ตรวจสอบไวยากรณ์
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Language Check Results */}
      {(activeTab === "all" || activeTab === "check") && language_check && (
        <section
          aria-labelledby="check-heading"
          className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-amber-800/40 shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              id="check-heading"
              className="text-base font-bold text-amber-300 flex items-center gap-2"
            >
              <span>🔍</span> ผลการตรวจทานภาษาและความสละสลวย
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 font-bold">
                คะแนน: {language_check.score}/100
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  language_check.status === "OPTIMAL"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-700"
                    : "bg-amber-950 text-amber-400 border border-amber-700"
                }`}
              >
                {language_check.status}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-200 mb-4 leading-relaxed">
            {language_check.summary}
          </p>

          {language_check.issues && language_check.issues.length > 0 ? (
            <div className="space-y-2.5">
              {language_check.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-bold text-rose-400 line-through">
                        {issue.text}
                      </span>
                      <span className="text-slate-500">➔</span>
                      <span className="font-bold text-emerald-400">
                        {issue.suggestion}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                        {issue.rule_type}
                      </span>
                    </div>
                    <p className="text-slate-300">{issue.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs">
              ✓ ไม่พบคำซ้ำซ้อนหรือข้อผิดพลาดทางไวยากรณ์ ข้อความมีความกระชับและถูกต้องตามแบบแผนทางการ
            </div>
          )}
        </section>
      )}

      {/* Thai-English Cultural Bridge (Secondary Scenario) */}
      {(activeTab === "all" || activeTab === "bridge") && language_bridge && (
        <section
          aria-labelledby="bridge-heading"
          className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-teal-800/50 shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              id="bridge-heading"
              className="text-base font-bold text-teal-300 flex items-center gap-2"
            >
              <span>🌐</span> Thai-English Cultural & Language Bridge
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-teal-950 text-teal-300 border border-teal-700/50 font-semibold">
              Cross-Cultural Context
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-baseline gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-2xl font-black text-teal-300">
                {language_bridge.word}
              </span>
              <span className="text-sm font-mono text-slate-400">
                [{language_bridge.pronunciation}]
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono">
                RTGS: {language_bridge.transliteration}
              </span>
              <button
                type="button"
                onClick={() => handleSpeak(language_bridge.word)}
                className="text-xs px-2.5 py-1 rounded-md bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-800 transition-colors flex items-center gap-1"
              >
                🔊 ฟังเสียง
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs text-slate-200">
              <div>
                <strong className="text-teal-400">English Translation:</strong>{" "}
                {language_bridge.english_translation}
              </div>
              <div>
                <strong className="text-teal-400">Nuance & Concept:</strong>{" "}
                {language_bridge.english_explanation}
              </div>
              <div>
                <strong className="text-teal-400">Cultural Etiquette Context:</strong>{" "}
                {language_bridge.cultural_context}
              </div>
              <div className="pt-2.5 border-t border-slate-800/80 italic text-slate-300">
                <strong className="not-italic text-teal-400">Example:</strong>{" "}
                {language_bridge.example}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Official Evidence Citations */}
      {evidence && evidence.length > 0 && (
        <section
          aria-labelledby="evidence-heading"
          className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <h4
              id="evidence-heading"
              className="font-bold text-slate-200 flex items-center gap-2 text-xs sm:text-sm"
            >
              <span>📜</span> หลักฐานอ้างอิงพจนานุกรมทางการ ({evidence.length} แหล่งข้อมูล)
            </h4>
            <span className="text-[11px] text-emerald-400 font-medium">
              ✓ ตรวจสอบความถูกต้องแล้ว
            </span>
          </div>

          <div className="space-y-2.5">
            {evidence.map((ev, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="font-semibold text-slate-200">
                    {ev.source_book} {ev.edition && `(${ev.edition})`}
                  </span>
                  {ev.page_number && <span className="font-mono text-slate-400">หน้า {ev.page_number}</span>}
                </div>
                <p className="text-slate-300 italic leading-relaxed">&ldquo;{ev.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
