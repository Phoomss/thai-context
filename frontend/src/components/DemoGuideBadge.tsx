'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronRight, X } from 'lucide-react';

export default function DemoGuideBadge() {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    '1. ค้นหาความหมาย: "ทำงานได้ดี ใช้ทรัพยากรน้อย แต่ไม่อยากใช้คำว่าเก่ง"',
    '2. ชี้กล่องสีน้ำเงิน: AI เข้าใจเจตนาและตัดคำว่า "เก่ง" ออกอัตโนมัติ',
    '3. ชี้การ์ดคำศัพท์: แนะนำ "สัมฤทธิผล" 96% Match และ "มัธยัสถ์"',
    '4. คลิก "ตรวจสอบหลักฐาน": เปิด Drawer โชว์เลขหน้า 1208 ในเล่มจริงปี 2554',
    '5. ทดสอบคำว่า "เครื่องวาร์ปมิติ": โชว์ระบบ Safe Abstention ไม่มโน',
    '6. เลื่อนดู Slider "ดิจิทัล": โชว์วิวัฒนาการ 2542 (ยังไม่มี) ➔ 2554 ➔ 2569',
    '7. สำรวจ Dialect: โชว์คำว่า "คิดถึง" ใน 3 ภาคพร้อมป้าย Official vs AI',
  ];

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {isOpen ? (
        <div className="bg-slate-900/95 border border-indigo-500/60 p-4 rounded-2xl shadow-2xl max-w-sm text-xs backdrop-blur-md">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
            <span className="font-extrabold text-amber-400">📋 10-Step Continuous Demo Cheatsheet</span>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <ol className="space-y-1.5 text-slate-300">
            {steps.map((s, idx) => (
              <li key={idx} className="leading-tight">
                {s}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-2 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg backdrop-blur-sm transition active:scale-95"
        >
          <HelpCircle className="w-4 h-4" />
          <span>บทนำเสนอ Demo บนเวที</span>
        </button>
      )}
    </div>
  );
}
