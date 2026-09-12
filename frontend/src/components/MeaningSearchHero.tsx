'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Filter, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  onSearch: (query: string) => void;
  isLoading: boolean;
  parsedIntent?: any;
}

export default function MeaningSearchHero({ onSearch, isLoading, parsedIntent }: Props) {
  const [query, setQuery] = useState('อยากบอกว่าคนนี้ทำงานได้ดี ใช้ทรัพยากรน้อย แต่ไม่อยากใช้คำว่าเก่ง');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  const setSampleQuery = (sample: string) => {
    setQuery(sample);
    onSearch(sample);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-6 bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl shadow-black/40">
      {/* Title */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Meaning-first Search (ค้นหาจากแก่นความหมาย)</span>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">กด Enter หรือคลิกเพื่อค้นหา</span>
      </div>

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          placeholder="บอกสิ่งที่คุณอยากสื่อ เช่น บริบท ความรู้สึก หรือคำที่ไม่อยากให้มี..."
          className="w-full p-4 pr-32 text-base text-slate-100 bg-slate-850/90 rounded-xl border border-slate-700/80 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none transition placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-3 bottom-4 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-lg flex items-center space-x-2 shadow-lg transition active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>ค้นหา...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>ค้นหาคำ</span>
            </>
          )}
        </button>
      </form>

      {/* Preset Demo Prompts */}
      <div className="mt-3 flex flex-wrap gap-2 items-center text-xs">
        <span className="text-slate-400">ตัวอย่างสำหรับการทดสอบ:</span>
        <button
          onClick={() => setSampleQuery('อยากบอกว่าคนนี้ทำงานได้ดี ใช้ทรัพยากรน้อย แต่ไม่อยากใช้คำว่าเก่ง')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition"
        >
          ✨ ทำงานดีไม่เอาคำว่าเก่ง
        </button>
        <button
          onClick={() => setSampleQuery('เครื่องวาร์ปมิติข้ามกาลเวลาด้วยอนุภาคทาคิออน')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400/90 rounded-md border border-slate-700 transition"
        >
          🛡️ ทดสอบ Anti-Hallucination
        </button>
      </div>

      {/* Parsed Intent Visual Indicator */}
      {parsedIntent && (
        <div className="mt-4 p-3.5 bg-indigo-950/40 border border-indigo-800/60 rounded-xl flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <span className="text-indigo-300 font-semibold">ระบบเข้าใจเจตนาของคุณ: </span>
            <span className="text-slate-200">"{parsedIntent.detected_meaning}"</span>
            {parsedIntent.excluded_words?.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-rose-950/70 text-rose-300 border border-rose-800/80 rounded text-xs font-semibold">
                ตัดคำว่า: {parsedIntent.excluded_words.join(', ')} ออกแล้ว
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
