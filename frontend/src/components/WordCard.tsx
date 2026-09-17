'use client';

import React from 'react';
import { BookOpen, CheckCircle, Shield, Sparkles } from 'lucide-react';

interface Props {
  word: {
    headword: string;
    pos: string;
    score: number;
    definition: string;
    official_definition?: string;
    edition_name: string;
    ai_explanation: string;
    evidence: any;
  };
  onOpenEvidence: (evidence: any) => void;
}

export default function WordCard({ word, onOpenEvidence }: Props) {
  const matchPercent = Math.round((word.score || 0.9) * 100);
  const englishTerm =
    word.evidence?.english_term ||
    (word as any).english_term ||
    (word as any).metadata?.english_term;

  return (
    <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition shadow-lg flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-black text-amber-400 tracking-tight">{word.headword}</h3>
              <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-semibold border border-slate-700">
                {word.pos || 'น.'}
              </span>
            </div>
            {englishTerm && (
              <div className="mt-1.5 flex items-center space-x-1 text-xs text-cyan-300 font-medium">
                <span className="px-2 py-0.5 bg-cyan-950/80 border border-cyan-800/70 rounded-md">
                  🏷️ ศัพท์บัญญัติ: {englishTerm}
                </span>
              </div>
            )}
          </div>
          <span className="text-xs px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 rounded-full font-bold">
            {matchPercent}% Match
          </span>
        </div>

        {/* Official Definition */}
        <p className="text-sm text-slate-300 mb-3 leading-relaxed">
          {word.official_definition || word.definition}
        </p>

        {/* AI Grounded Reasoning */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 mb-4">
          <div className="flex items-center space-x-1 text-amber-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>เหตุผลที่ระบบแนะนำ:</span>
          </div>
          <p className="text-slate-300 leading-normal">{word.ai_explanation}</p>
        </div>
      </div>

      {/* Button to Open Evidence Drawer */}
      <button
        onClick={() => onOpenEvidence(word.evidence)}
        className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center space-x-2 transition active:scale-98"
      >
        <BookOpen className="w-4 h-4 text-amber-400" />
        <span>ตรวจสอบหลักฐานในพจนานุกรม</span>
      </button>
    </div>
  );
}
