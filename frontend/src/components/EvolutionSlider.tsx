'use client';

import React, { useState } from 'react';
import { History, Calendar, PlusCircle, RefreshCw, MinusCircle } from 'lucide-react';

export default function EvolutionSlider() {
  const [selectedIdx, setSelectedIdx] = useState(2); // Start with 2569

  const timeline = [
    {
      year: 2542,
      edition: 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒',
      status: 'NOT_FOUND',
      badge: '⚪ ยังไม่ปรากฏในพจนานุกรม',
      definition: 'ในฉบับปี ๒๕๔๒ ยังไม่มีการบรรจุคำว่า "ดิจิทัล" เข้าสู่พจนานุกรมมาตรฐานของชาติ',
      badgeStyle: 'bg-slate-800 text-slate-400 border-slate-700',
    },
    {
      year: 2554,
      edition: 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔',
      status: 'ADDED',
      badge: '🟢 บรรจุเป็นคำใหม่ครั้งแรก',
      definition: 'น. การแสดงข้อมูลด้วยระบบตัวเลขสากลในการประมวลผลของเครื่องคอมพิวเตอร์',
      badgeStyle: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    },
    {
      year: 2569,
      edition: 'พจนานุกรม ฉบับราชบัณฑิตยสภา พ.ศ. ๒๕๖๙ (ฉบับดิจิทัล)',
      status: 'MODIFIED',
      badge: '🟡 ขยายนิยามตามยุคสมัย',
      definition: 'น. เทคโนโลยีสารสนเทศที่เชื่อมโยงระบบคอมพิวเตอร์ อินเทอร์เน็ต เครือข่าย และระบบเสมือนจริงในชีวิตประจำวัน',
      badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-800',
    },
  ];

  const current = timeline[selectedIdx];

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 bg-slate-900/70 rounded-2xl border border-slate-800 shadow-xl">
      <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-4 text-sm">
        <History className="w-5 h-5 text-indigo-400" />
        <span>วิวัฒนาการคำศัพท์ตามยุคสมัย (3-Era Evolution: คำว่า "ดิจิทัล")</span>
      </div>

      {/* Year Selection Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {timeline.map((item, idx) => (
          <button
            key={item.year}
            onClick={() => setSelectedIdx(idx)}
            className={`p-3 rounded-xl border text-center transition ${
              selectedIdx === idx
                ? 'bg-indigo-950/80 border-indigo-500 shadow-lg text-white font-extrabold scale-[1.02]'
                : 'bg-slate-850/50 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="text-lg">พ.ศ. {item.year}</div>
            <div className="text-[11px] opacity-75">{item.status}</div>
          </button>
        ))}
      </div>

      {/* Dynamic Detail Card */}
      <div className="p-5 bg-slate-950/60 rounded-xl border border-slate-800">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <span className="text-xs text-slate-400 font-medium">{current.edition}</span>
          <span className={`px-2.5 py-0.5 text-xs border rounded-full font-bold ${current.badgeStyle}`}>
            {current.badge}
          </span>
        </div>
        <p className="text-slate-200 text-base leading-relaxed">{current.definition}</p>
      </div>
    </div>
  );
}
