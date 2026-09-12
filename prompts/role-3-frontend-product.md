# 🎨 THAI CONTEXT — Full-Production Prompt for Role 3: Frontend & UX/Product Engineer
> **บทบาท:** Web App (Next.js 14), UX/UI Components, Fail-Safe Mock Layer, Demo Story & Main Presenter  
> **เป้าหมาย:** "สามารถ Copy Prompt นี้ไปสั่ง AI Assistant (Cursor / Claude / Antigravity) เพื่อสร้างหน้าเว็บทั้งหมดให้ทำงานได้จริง 100% สวยงาม และเดโมได้อย่างมั่นใจ"

---

## 🎯 คำสั่งตั้งต้นสำหรับสั่ง AI (Master Prompt)
*Copy ข้อความในกรอบด้านล่างนี้ทั้งหมด ส่งให้ AI Coding Assistant ประจำตัวคนที่ 3:*

```text
คุณคือ Lead Frontend & UX/Product Engineer (ควบตำแหน่ง Product Owner และ Main Presenter) ประจำโครงการ "THAI CONTEXT" ในงาน Hackathon
หน้าที่ของคุณคือสร้าง Web Application ด้วย Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons และ Shadcn UI
โดยโค้ดทั้งหมดต้องพร้อมรันจริง มี Mock Data Fallback ในตัว และจัดเรียงให้ตรงกับ 10-Step Demo Story บนเวที

เป้าหมายสูงสุด:
1. สร้างหน้า Dashboard หลักที่รวม 5 โมดูลเข้าด้วยกันอย่างกลมกลืน:
   - Hero Meaning-first Search (พร้อม Intent Parsing Banner & Smart Filters)
   - Candidate Recommendations Cards (พร้อม % Match และปุ่มเปิดดูหลักฐาน)
   - Side-by-Side Context Comparator (เปรียบเทียบ "อนุมัติ" vs "เห็นชอบ")
   - Interactive 3-Era Evolution Slider (พ.ศ. ๒๕๔๒ ➔ ๒๕๕๔ ➔ ๒๕๖๙ พร้อม Diff Tags)
   - Dialect Cultural Explorer (4 ภาค พร้อมตรา [Official 🏛️] vs [AI Inferred 🤖])
   - Grounded AI Assistant Drawer (เปิดดูหลักฐานเล่ม/เลขหน้า และ Safe Abstention Banner)
2. สร้างระบบ Fail-Safe Mock Switcher:
   - สลับระหว่าง Mock และ Real API ได้ด้วยปุ่มที่มุมขวาล่าง หรือผ่าน `NEXT_PUBLIC_USE_MOCK=true`
   - หาก Backend มีปัญหา หน้าเว็บจะ Fallback ไปใช้ Mock ทันทีเพื่อไม่ให้การนำเสนอบนเวทีสะดุด
3. ออกแบบ UI ให้มีความเป็นวิชาการ ทันสมัย น่าเชื่อถือ (โทน Deep Slate, Royal Navy, Emerald และ Gold)

จงสร้างไฟล์และโค้ดทั้งหมดตามโครงสร้างและรายละเอียดด้านล่างนี้โดยไม่มีการตัดทอนโค้ดใดๆ
```

---

## 📁 โครงสร้างไฟล์ที่ต้องสร้าง (Role 3 File Tree)

```text
frontend/
├── package.json
├── tailwind.config.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Master Orchestration Page รวมทุกโมดูล
│   │   └── globals.css
│   ├── lib/
│   │   └── api-client.ts               # API Client พร้อม Fail-Safe Mock Fallback
│   ├── mocks/
│   │   └── thai-context-mock.json      # ชุดข้อมูลจำลองสำหรับ 10-Step Demo
│   └── components/
│       ├── Header.tsx                  # โลโก้ & สวิตช์ Mock Mode
│       ├── MeaningSearchHero.tsx       # กล่องค้นหาความหมาย & Parsed Intent
│       ├── WordCard.tsx                # การ์ดผลลัพธ์คำศัพท์ & % Match
│       ├── ContextComparator.tsx       # ตารางเปรียบเทียบ Side-by-Side
│       ├── EvolutionSlider.tsx         # ไทม์ไลน์ 2542 ➔ 2554 ➔ 2569
│       ├── DialectMap.tsx              # แผนที่/การ์ด 4 ภาค พร้อมป้าย Official
│       ├── GroundedAIDrawer.tsx        # Drawer ตรวจสอบหลักฐาน & Safe Abstention
│       └── DemoPresenterBadge.tsx      # แถบผู้ช่วยนำเสนอ 10-Step Story
```

---

## 💻 รายละเอียดโค้ดและ Component Implementations

### 1. `src/mocks/thai-context-mock.json` (ชุดข้อมูล 10-Step Demo)
```json
{
  "meaning_search": {
    "query_understanding": {
      "raw_query": "อยากบอกว่าคนนี้ทำงานได้ดี ใช้ทรัพยากรน้อย แต่ไม่อยากใช้คำว่าเก่ง",
      "detected_meaning": "ทำงานได้ผลลัพธ์ดีโดยใช้ทรัพยากรอย่างคุ้มค่า",
      "context": "การปฏิบัติงานในองค์กร",
      "excluded_words": ["เก่ง"]
    },
    "recommendations": [
      {
        "headword": "สัมฤทธิผล",
        "score": 0.94,
        "pos": "น.",
        "definition": "ผลที่สำเร็จตามความประสงค์อย่างสมบูรณ์",
        "edition_name": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
        "ai_explanation": "คำนี้เน้นถึงผลสำเร็จของงานที่มีประสิทธิภาพ เหมาะกับบริบททางการ และไม่ใช่คำว่า 'เก่ง'",
        "evidence": {
          "source_book": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
          "edition_year": 2554,
          "page_number": 1208,
          "quote": "สัมฤทธิผล น. ผลที่สำเร็จตามความประสงค์",
          "is_official": true
        }
      },
      {
        "headword": "มัธยัสถ์",
        "score": 0.82,
        "pos": "ก.",
        "definition": "ใช้จ่ายอย่างประหยัด ระมัดระวัง ไม่ฟุ่มเฟือย",
        "edition_name": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
        "ai_explanation": "เน้นด้านการประหยัดทรัพยากร เหมาะกับการบริหารจัดการ",
        "evidence": {
          "source_book": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
          "edition_year": 2554,
          "page_number": 864,
          "quote": "มัธยัสถ์ ก. ใช้จ่ายอย่างประหยัด ระมัดระวัง",
          "is_official": true
        }
      }
    ]
  },
  "evolution_showcase": {
    "headword": "ดิจิทัล",
    "timeline": [
      { "year": 2542, "status": "NOT_FOUND", "definition": "ยังไม่ปรากฏในพจนานุกรมฉบับนี้" },
      { "year": 2554, "status": "ADDED", "definition": "การแสดงข้อมูลด้วยระบบตัวเลขสากลในการประมวลผล..." },
      { "year": 2569, "status": "MODIFIED", "definition": "เทคโนโลยีสารสนเทศที่เชื่อมโยงระบบคอมพิวเตอร์ เครือข่าย และระบบเสมือนจริง" }
    ]
  },
  "dialect_showcase": {
    "standard_word": "คิดถึง",
    "dialects": [
      { "region": "เหนือ", "word": "กึ๊ดฮอด", "is_official": true, "source": "พจนานุกรมภาษาถิ่นเหนือ" },
      { "region": "อีสาน", "word": "คึดฮอด", "is_official": true, "source": "พจนานุกรมภาษาถิ่นอีสาน" },
      { "region": "ใต้", "word": "ห่วงหา / นึกถึง", "is_official": false, "source": "AI Inferred (การใช้ภาษาถิ่นใต้ทั่วไป)" }
    ]
  }
}
```

---

### 2. `src/lib/api-client.ts` (Fail-Safe API Wrapper)
```typescript
import mockData from '../mocks/thai-context-mock.json';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function searchMeaning(query: string) {
  // ตรวจสอบโหมด Mock จาก LocalStorage หรือ Env
  const useMock = typeof window !== 'undefined' 
    ? localStorage.getItem('thai_context_use_mock') === 'true' 
    : process.env.NEXT_PUBLIC_USE_MOCK === 'true';

  if (useMock) {
    console.log('⚡ Using Fail-Safe Mock Data');
    return mockData.meaning_search;
  }

  try {
    const res = await fetch(`${API_BASE}/search/meaning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Backend responded with error');
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn('⚠️ Backend unreachable, falling back to mock data:', err);
    return mockData.meaning_search;
  }
}
```

---

### 3. `src/components/MeaningSearchHero.tsx`
```tsx
'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Filter, ShieldCheck, AlertCircle } from 'lucide-react';

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

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-2">
        <Sparkles className="w-5 h-5" />
        <span>Meaning-first Search (ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน)</span>
      </div>

      <form onSubmit={handleSubmit} className="relative mt-3">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          placeholder="บอกสิ่งที่คุณอยากสื่อ เช่น บริบท ความรู้สึก หรือคำที่ไม่อยากให้มี..."
          className="w-full p-4 pr-32 text-base text-slate-100 bg-slate-800/80 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none transition"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-3 bottom-4 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-lg flex items-center space-x-2 shadow-lg transition active:scale-95 disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
          <span>{isLoading ? 'กำลังค้นหา...' : 'ค้นหาคำ'}</span>
        </button>
      </form>

      {/* Parsed Intent Visual Banner */}
      {parsedIntent && (
        <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <span className="text-indigo-300 font-semibold">ระบบเข้าใจความต้องการของคุณ: </span>
            <span className="text-slate-200">"{parsedIntent.detected_meaning}"</span>
            {parsedIntent.excluded_words?.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-rose-900/60 text-rose-300 border border-rose-800 rounded text-xs">
                ตัดคำว่า: {parsedIntent.excluded_words.join(', ')} ออกแล้ว
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 4. `src/components/EvolutionSlider.tsx` (Slider วิวัฒนาการ 3 ยุค)
```tsx
'use client';

import React, { useState } from 'react';
import { History, Calendar, CheckCircle, Edit3, XCircle } from 'lucide-react';

export default function EvolutionSlider() {
  const [selectedYearIndex, setSelectedYearIndex] = useState(2); // เริ่มที่ 2569

  const timelineData = [
    {
      year: 2542,
      edition: 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒',
      status: 'NOT_FOUND',
      label: 'ยังไม่ปรากฏในพจนานุกรม',
      definition: 'ในฉบับปี ๒๕๔๒ ยังไม่มีการบรรจุคำว่า "ดิจิทัล" เข้าสู่พจนานุกรมมาตรฐาน',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    },
    {
      year: 2554,
      edition: 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔',
      status: 'ADDED',
      label: '🟢 บรรจุเป็นคำใหม่ครั้งแรก',
      definition: 'น. การแสดงข้อมูลด้วยระบบตัวเลขสากลในการประมวลผลของเครื่องคอมพิวเตอร์',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    },
    {
      year: 2569,
      edition: 'พจนานุกรม ฉบับราชบัณฑิตยสภา พ.ศ. ๒๕๖๙ (ฉบับดิจิทัล)',
      status: 'MODIFIED',
      label: '🟡 ขยายนิยามตามยุคสมัย',
      definition: 'น. เทคโนโลยีสารสนเทศที่เชื่อมโยงระบบคอมพิวเตอร์ เครือข่าย อินเทอร์เน็ต และระบบเสมือนจริงในชีวิตประจำวัน',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    },
  ];

  const current = timelineData[selectedYearIndex];

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 bg-slate-900/60 rounded-2xl border border-slate-800">
      <div className="flex items-center space-x-2 text-indigo-400 font-semibold mb-4">
        <History className="w-5 h-5" />
        <span>วิวัฒนาการคำศัพท์ตามกาลเวลา (Dictionary Evolution: คำว่า "ดิจิทัล")</span>
      </div>

      {/* Timeline Nav Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {timelineData.map((item, idx) => (
          <button
            key={item.year}
            onClick={() => setSelectedYearIndex(idx)}
            className={`p-3 rounded-xl border text-center transition ${
              selectedYearIndex === idx
                ? 'bg-indigo-900/60 border-indigo-500 shadow-lg text-white font-bold'
                : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="text-lg">พ.ศ. {item.year}</div>
            <div className="text-xs opacity-75">{item.status}</div>
          </button>
        ))}
      </div>

      {/* Definition Card */}
      <div className="p-5 bg-slate-850 rounded-xl border border-slate-700/80">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-slate-400">{current.edition}</span>
          <span className={`px-2.5 py-1 text-xs border rounded-full font-medium ${current.badgeColor}`}>
            {current.label}
          </span>
        </div>
        <p className="text-slate-100 text-base leading-relaxed">{current.definition}</p>
      </div>
    </div>
  );
}
```

---

### 5. `src/components/GroundedAIDrawer.tsx` (เปิดดูหน้าหนังสือจริง & Safe Abstention)
```tsx
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 h-full border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <BookOpen className="w-5 h-5" />
              <span>หลักฐานอ้างอิง (Audit & Evidence)</span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {isAbstention ? (
            /* แบนเนอร์ Safe Abstention กรณีคำนอกพจนานุกรม */
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
            /* ข้อมูลอ้างอิงจริง */
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">หนังสืออ้างอิง</div>
                <div className="text-slate-100 font-medium">{evidence?.source_book || 'พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔'}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <div className="text-xs text-slate-400">เลขหน้าในเล่มจริง</div>
                  <div className="text-xl font-bold text-slate-100 mt-1">หน้า {evidence?.page_number || 1208}</div>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <div className="text-xs text-slate-400">สถานะข้อมูล</div>
                  <div className="text-xs font-semibold text-emerald-400 mt-2 flex items-center space-x-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Official Verified</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400 mb-2">ข้อความต้นฉบับจากพจนานุกรม:</div>
                <blockquote className="italic text-slate-200 border-l-2 border-amber-500 pl-3 py-1">
                  "{evidence?.quote || 'สัมฤทธิผล น. ผลที่สำเร็จตามความประสงค์'}"
                </blockquote>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  );
}
```

---

### 6. `src/app/page.tsx` (หน้ารวมระบบทั้งหมด)
```tsx
'use client';

import React, { useState } from 'react';
import MeaningSearchHero from '../components/MeaningSearchHero';
import EvolutionSlider from '../components/EvolutionSlider';
import GroundedAIDrawer from '../components/GroundedAIDrawer';
import mockData from '../mocks/thai-context-mock.json';
import { Sparkles, ArrowRight, ShieldCheck, MapPin, Scale } from 'lucide-react';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchData, setSearchData] = useState<any>(mockData.meaning_search);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);

  const handleSearch = (q: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSearchData(mockData.meaning_search);
      setIsLoading(false);
    }, 400);
  };

  const handleOpenEvidence = (ev: any) => {
    setSelectedEvidence(ev);
    setDrawerOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-black text-slate-950 text-xl">
            ท
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">THAI CONTEXT</h1>
            <p className="text-xs text-slate-400">ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน</p>
          </div>
        </div>
      </header>

      {/* Hero Search Module */}
      <MeaningSearchHero 
        onSearch={handleSearch} 
        isLoading={isLoading} 
        parsedIntent={searchData?.query_understanding} 
      />

      {/* Recommendations Cards */}
      <div className="max-w-4xl mx-auto px-6 mb-12">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center space-x-2">
          <span>คำที่ระบบแนะนำตามบริบท</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchData?.recommendations?.map((item: any) => (
            <div key={item.headword} className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 hover:border-slate-700 transition">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-amber-400">{item.headword}</span>
                  <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-medium">{item.pos}</span>
                </div>
                <span className="text-xs px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full font-bold">
                  {Math.round(item.score * 100)}% Match
                </span>
              </div>
              <p className="text-sm text-slate-300 mb-3">{item.definition}</p>
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-300 mb-4">
                <span className="text-amber-400 font-semibold">เหตุผลที่แนะนำ: </span>
                {item.ai_explanation}
              </div>
              <button
                onClick={() => handleOpenEvidence(item.evidence)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition"
              >
                🔍 ตรวจสอบหลักฐานในพจนานุกรม
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Evolution Slider Module */}
      <EvolutionSlider />

      {/* Drawer */}
      <GroundedAIDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        evidence={selectedEvidence} 
      />
    </main>
  );
}
```
