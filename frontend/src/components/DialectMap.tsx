'use client';

import React, { useState } from 'react';
import { MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import mockData from '../mocks/thai-context-mock.json';

export default function DialectMap() {
  const [selectedRegion, setSelectedRegion] = useState('เหนือ');
  const dialectData = mockData.dialect_showcase;

  const current = dialectData.dialects.find((d) => d.region === selectedRegion) || dialectData.dialects[0];

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 bg-slate-900/70 rounded-2xl border border-slate-800 shadow-xl">
      <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-4 text-sm">
        <MapPin className="w-5 h-5 text-emerald-400" />
        <span>สำรวจคลังคำภาษาถิ่น 4 ภาค (Dialect Cultural Explorer: คำว่า "{dialectData.standard_word}")</span>
      </div>

      {/* Region Selector Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {dialectData.dialects.map((d) => (
          <button
            key={d.region}
            onClick={() => setSelectedRegion(d.region)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${
              selectedRegion === d.region
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-md'
                : 'bg-slate-800/40 border-slate-700/80 text-slate-400 hover:bg-slate-800'
            }`}
          >
            ภาค{d.region}
          </button>
        ))}
      </div>

      {/* Dialect Card */}
      <div className="p-5 bg-slate-950/60 rounded-xl border border-slate-800">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-xs text-slate-400">คำเทียบเท่าในภาษาถิ่น:</span>
            <div className="text-3xl font-black text-amber-400 mt-0.5">{current.dialect_word}</div>
            <div className="text-xs text-slate-400 font-mono mt-1">สำเนียง IPA: {current.ipa}</div>
          </div>
          {current.is_official ? (
            <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded-full text-xs font-bold flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>🏛️ Official Verified</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-indigo-950/80 text-indigo-300 border border-indigo-800 rounded-full text-xs font-bold flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>🤖 AI Inferred</span>
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
          แหล่งข้อมูลอ้างอิง: {current.source}
        </p>
      </div>
    </div>
  );
}
