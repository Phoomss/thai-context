'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, ToggleLeft, ToggleRight, Shield } from 'lucide-react';

export default function Header() {
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('thai_context_use_mock');
    setIsMock(stored === 'true');
  }, []);

  const toggleMock = () => {
    const next = !isMock;
    setIsMock(next);
    localStorage.setItem('thai_context_use_mock', String(next));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-3.5">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-indigo-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/10">
            ท
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-slate-100 tracking-tight">THAI CONTEXT</span>
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-semibold">
                Hackathon Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน</p>
          </div>
        </div>

        {/* Right Status & Fail-Safe Toggle */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleMock}
            title="Toggle between Live API and Offline Mock Data"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs transition"
          >
            <span className="text-slate-400">โหมดการทำงาน:</span>
            {isMock ? (
              <span className="text-amber-400 font-bold flex items-center space-x-1">
                <ToggleRight className="w-4 h-4" />
                <span>Mock Data</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <ToggleLeft className="w-4 h-4" />
                <span>Live Backend</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
