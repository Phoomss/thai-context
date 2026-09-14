"use client";

import React, { useState } from "react";
import type {
  WorkspaceResponsePayload,
  WordRecommendation,
  GeneratedContentItem,
} from "@/lib/workspace-types";

interface WorkspaceResultCardProps {
  result: WorkspaceResponsePayload;
  onSelectAction?: (prompt: string) => void;
}

export default function WorkspaceResultCard({
  result,
  onSelectAction,
}: WorkspaceResultCardProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

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

  return (
    <div className="space-y-6">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          {/* Context Tag */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/80 text-sky-300 border border-sky-600/50">
            🎯 บริบท: {context.type} ({context.tone})
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            กลุ่มเป้าหมาย: {context.audience}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold ${
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
          <span className="text-xs text-slate-400">ความน่าเชื่อถือ:</span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              confidence_level === "HIGH"
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50"
                : confidence_level === "MEDIUM"
                ? "bg-amber-950/80 text-amber-300 border border-amber-500/50"
                : "bg-rose-950/80 text-rose-300 border border-rose-500/50"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
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
          className="p-4 rounded-xl bg-rose-950/50 border border-rose-600/60 text-rose-200 text-sm"
        >
          <div className="flex items-center gap-2 font-bold text-rose-300 mb-1">
            <span>🛡️</span> ระงับการสรุปผลเนื่องจากหลักฐานไม่เพียงพอ
          </div>
          <p>{abstention_reason}</p>
        </div>
      )}

      {/* Word Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <section aria-labelledby="recommendations-heading">
          <div className="flex items-center justify-between mb-3">
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
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex flex-col justify-between p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-sky-600/50 transition-all shadow-sm group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-xl font-extrabold text-sky-300 group-hover:text-cyan-300 transition-colors">
                        {rec.word}
                      </h4>
                      {rec.pos && (
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                          {rec.pos}
                        </span>
                      )}
                    </div>
                    {rec.edition && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        ฉบับ พ.ศ. {rec.edition}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed mb-3">
                    {rec.definition}
                  </p>

                  <div className="text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                    <strong className="text-slate-300">เหตุผลที่แนะนำ:</strong>{" "}
                    {rec.reason}
                  </div>
                </div>

                {/* Word Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() =>
                      onSelectAction?.(`แต่งประโยคคำว่า ${rec.word} สำหรับรายงานวิชาการ`)
                    }
                    className="px-2.5 py-1 text-xs rounded-md bg-sky-900/40 hover:bg-sky-800/60 text-sky-200 border border-sky-700/50 transition-colors"
                  >
                    ✍️ แต่งประโยคด้วยคำนี้
                  </button>
                  {recommendations.length >= 2 && i === 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        onSelectAction?.(
                          `${rec.word} หรือ ${recommendations[1].word} ต่างกันอย่างไร`
                        )
                      }
                      className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      ⚖️ เปรียบเทียบกับคำถัดไป
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Comparison Matrix Card */}
      {comparison && (
        <section
          aria-labelledby="comparison-heading"
          className="p-5 rounded-xl bg-slate-900/90 border border-indigo-700/50 shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              id="comparison-heading"
              className="text-base font-bold text-indigo-300 flex items-center gap-2"
            >
              <span>⚖️</span> เปรียบเทียบความหมาย: {comparison.wordA} vs{" "}
              {comparison.wordB}
            </h3>
            <span className="text-xs px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50 font-medium">
              Word Comparison
            </span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed mb-4 p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40">
            {comparison.difference_summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[comparison.wordA, comparison.wordB].map((wordKey) => {
              const detail = comparison.details?.[wordKey];
              if (!detail) return null;
              return (
                <div
                  key={wordKey}
                  className="p-4 rounded-lg bg-slate-950/60 border border-slate-800"
                >
                  <h4 className="text-lg font-bold text-sky-400 mb-2">
                    {wordKey}
                  </h4>
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
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-700/50 text-emerald-200 text-xs flex items-start gap-2">
              <span className="text-base">💡</span>
              <div>
                <strong className="font-semibold text-emerald-300">
                  คำแนะนำในการเลือกใช้:
                </strong>{" "}
                {comparison.guidance}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Generated Content Box */}
      {generated_content && generated_content.length > 0 && (
        <section aria-labelledby="generated-heading">
          <div className="flex items-center justify-between mb-3">
            <h3
              id="generated-heading"
              className="text-base font-bold text-slate-100 flex items-center gap-2"
            >
              <span>✍️</span> ข้อความที่สร้างและปรับแต่งตามบริบท
            </h3>
            <span className="text-xs text-slate-400">
              {generated_content.length} ตัวเลือก
            </span>
          </div>

          <div className="space-y-3">
            {generated_content.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/70 hover:border-cyan-500/50 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wide bg-sky-950 text-cyan-300 border border-sky-800">
                    {item.register} ({item.type})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.content, idx)}
                    className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors flex items-center gap-1"
                  >
                    {copiedIdx === idx ? "✓ คัดลอกแล้ว" : "📋 คัดลอก"}
                  </button>
                </div>

                <p className="text-sm md:text-base text-slate-100 font-medium leading-relaxed mb-2 select-all">
                  &ldquo;{item.content}&rdquo;
                </p>

                {item.notes && (
                  <p className="text-xs text-slate-400 italic">
                    ℹ️ {item.notes}
                  </p>
                )}

                {/* Quick actions for this content */}
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => onSelectAction?.("ทำให้สั้นลง")}
                    className="px-2 py-0.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    ⚡ ทำให้สั้นลง
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectAction?.("ปรับให้เป็นทางการยิ่งขึ้น")}
                    className="px-2 py-0.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    🎩 ทำให้เป็นทางการ
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectAction?.("ช่วยตรวจภาษาข้อความนี้")}
                    className="px-2 py-0.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
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
      {language_check && (
        <section
          aria-labelledby="check-heading"
          className="p-5 rounded-xl bg-slate-900/90 border border-amber-800/40 shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              id="check-heading"
              className="text-base font-bold text-amber-300 flex items-center gap-2"
            >
              <span>🔍</span> ผลการตรวจทานภาษาและความสละสลวย
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                คะแนน: {language_check.score}/100
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  language_check.status === "OPTIMAL"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-700"
                    : "bg-amber-950 text-amber-400 border border-amber-700"
                }`}
              >
                {language_check.status}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-3">{language_check.summary}</p>

          {language_check.issues && language_check.issues.length > 0 ? (
            <div className="space-y-2">
              {language_check.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-rose-400 line-through">
                        {issue.text}
                      </span>
                      <span className="text-slate-500">➔</span>
                      <span className="font-bold text-emerald-400">
                        {issue.suggestion}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {issue.rule_type}
                      </span>
                    </div>
                    <p className="text-slate-400">{issue.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs">
              ✓ ไม่พบคำซ้ำซ้อนหรือข้อผิดพลาดทางไวยากรณ์ ข้อความมีความกระชับและถูกต้อง
            </div>
          )}
        </section>
      )}

      {/* Thai-English Cultural Bridge (Secondary Scenario) */}
      {language_bridge && (
        <section
          aria-labelledby="bridge-heading"
          className="p-5 rounded-xl bg-slate-900/90 border border-teal-800/50 shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              id="bridge-heading"
              className="text-base font-bold text-teal-300 flex items-center gap-2"
            >
              <span>🌐</span> Thai-English Cultural & Language Bridge
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700/50">
              Cross-Cultural Context
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-baseline gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800">
              <span className="text-2xl font-bold text-teal-300">
                {language_bridge.word}
              </span>
              <span className="text-sm font-mono text-slate-400">
                [{language_bridge.pronunciation}]
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                RTGS: {language_bridge.transliteration}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-200">
              <div>
                <strong className="text-teal-400">English Translation:</strong>{" "}
                {language_bridge.english_translation}
              </div>
              <div>
                <strong className="text-teal-400">Nuance & Definition:</strong>{" "}
                {language_bridge.english_explanation}
              </div>
              <div>
                <strong className="text-teal-400">Cultural Etiquette Context:</strong>{" "}
                {language_bridge.cultural_context}
              </div>
              <div className="pt-2 border-t border-slate-800/80 italic text-slate-300">
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
          className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs"
        >
          <h4
            id="evidence-heading"
            className="font-bold text-slate-300 mb-2 flex items-center gap-1.5"
          >
            <span>📜</span> หลักฐานอ้างอิงพจนานุกรมทางการ ({evidence.length} แหล่ง)
          </h4>
          <div className="space-y-2">
            {evidence.map((ev, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-slate-900/60 border border-slate-800/70"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="font-semibold text-slate-200">
                    {ev.source_book} {ev.edition && `(${ev.edition})`}
                  </span>
                  {ev.page_number && <span>หน้า {ev.page_number}</span>}
                </div>
                <p className="text-slate-300 italic">&ldquo;{ev.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
