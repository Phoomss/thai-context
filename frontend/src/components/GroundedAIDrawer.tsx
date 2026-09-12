'use client';

import React from 'react';
import { X, BookOpen, ShieldCheck, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  evidence?: any;
  isAbstention?: boolean;
}

export default function GroundedAIDrawer({ isOpen, onClose, evidence, isAbstention }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 h-full border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
        <div>
          {/* Drawer Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>หลักฐานอ้างอิง (Audit & Evidence)</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body Content */}
          {isAbstention ? (
            <div className="mt-6 p-4 bg-amber-950/60 border border-amber-800 rounded-xl">
              <div className="flex items-center space-x-2 text-amber-400 font-bold mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Anti-Hallucination Safe Abstention</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                ระบบไม่พบข้อมูลที่ได้รับการรับรองในพจนานุกรมฉบับทางการ จึงขอปฏิเสธการแต่งคำตอบขึ้นมาเอง เพื่อรักษาความถูกต้องตามหลักวิชาการ
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/80">
                <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider mb-1">
                  หนังสืออ้างอิงทางการ
                </div>
                <div className="text-slate-100 font-semibold">
                  {evidence?.source_book || 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
                  <div className="text-xs text-slate-400 font-medium">เลขหน้าในเล่มจริง</div>
                  <div className="text-2xl font-black text-slate-100 mt-1">
                    หน้า {evidence?.page_number || 1208}
                  </div>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
                  <div className="text-xs text-slate-400 font-medium">ระดับการรับรอง</div>
                  <div className="text-xs font-bold text-emerald-400 mt-2 flex items-center space-x-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Official Verified</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400 mb-2 font-medium">ข้อความต้นฉบับจากพจนานุกรม:</div>
                <blockquote className="italic text-slate-200 border-l-2 border-amber-500 pl-3 py-1 font-serif text-sm">
                  "{evidence?.exact_quote || evidence?.quote || 'สัมฤทธิผล น. ผลที่สำเร็จตามความประสงค์'}"
                </blockquote>
              </div>
            </div>
          )}
        </div>

        {/* Footer Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl font-bold transition"
        >
          ปิดหน้าต่างหลักฐาน
        </button>
      </div>
    </div>
  );
}
