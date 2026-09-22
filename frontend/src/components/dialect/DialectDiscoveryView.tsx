"use client";

import { useState, useEffect, useId, useCallback } from "react";
import { Compass, BarChart2, Sparkles, Bot } from "lucide-react";
import Icon from "../ui/Icon";
import { audioManager } from "@/lib/audio-manager";
import { encodeThaiToBraille } from "@/lib/braille-encoder";

interface DialectItem {
  id: string;
  dialectWord: string;
  dialectWordClean?: string;
  localMeaning: string;
  regionCode: string;
  regionName: string;
  province?: string | null;
  ipaPhonetic?: string | null;
  status: string;
  context?: string | null;
  sourceName?: string;
  sourceType?: string;
  semanticSimilarity?: number;
  finalScore?: number;
  standardWord?: string | null;
}

interface RegionalComparisonItem {
  region: string;
  region_name: string;
  term: string;
  definition: string;
  usage_context: string;
  source: string;
  evidence_status: string;
  found: boolean;
}

interface AIExplanationResult {
  answer: string;
  grounded: boolean;
  abstained: boolean;
  confidence: number;
  confidence_level: string;
  evidence: Array<{
    term: string;
    region: string;
    province?: string;
    definition: string;
    context?: string;
    source: string;
  }>;
}

const DEFAULT_INITIAL_RESULTS: DialectItem[] = [
  {
    id: "kin-north",
    dialectWord: "กิ๋น",
    localMeaning: "รับประทานอาหาร เคี้ยวกลืนอาหาร",
    regionCode: "NORTH",
    regionName: "ภาคเหนือ (คำเมือง)",
    province: "เชียงใหม่",
    ipaPhonetic: "kin˥˩",
    status: "OFFICIAL_SOURCE",
    context: "ใช้ในชีวิตประจำวัน สุภาพ สนทนาทั่วไป",
    sourceName: "พจนานุกรมคำเมือง-ไทย ฉบับราชบัณฑิตยสภา",
    sourceType: "OFFICIAL_DICTIONARY",
    standardWord: "กิน",
  },
  {
    id: "kin-isan",
    dialectWord: "แซ่บ / โสภ",
    localMeaning: "รับประทานอาหาร",
    regionCode: "NORTHEAST",
    regionName: "ภาคอีสาน (ลาว-อีสาน)",
    province: "ขอนแก่น",
    ipaPhonetic: "soːp˥˩",
    status: "OFFICIAL_SOURCE",
    context: "ใช้ในชีวิตประจำวัน สนทนาทั่วไป",
    sourceName: "พจนานุกรมภาษาถิ่นอีสาน สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย",
    sourceType: "ACADEMIC",
    standardWord: "กิน",
  },
  {
    id: "kin-south",
    dialectWord: "กิน",
    localMeaning: "รับประทานอาหาร",
    regionCode: "SOUTH",
    regionName: "ภาคใต้ (ปักษ์ใต้)",
    province: "สงขลา",
    ipaPhonetic: "kin˧˧",
    status: "VERIFIED",
    context: "ใช้ในชีวิตประจำวัน สนทนาทั่วไป",
    sourceName: "พจนานุกรมภาษาถิ่นใต้",
    sourceType: "DIALECT_DICTIONARY",
    standardWord: "กิน",
  },
  {
    id: "kin-central",
    dialectWord: "กิน",
    localMeaning: "รับประทานอาหาร เคี้ยวกลืน",
    regionCode: "CENTRAL",
    regionName: "ภาคกลาง (มาตรฐาน)",
    province: "กรุงเทพมหานคร",
    ipaPhonetic: "kin˧˧",
    status: "OFFICIAL_SOURCE",
    context: "ภาษาทางการและสนทนาทั่วไป",
    sourceName: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    sourceType: "OFFICIAL_DICTIONARY",
    standardWord: "กิน",
  },
];

const DEFAULT_INITIAL_COMPARISONS: RegionalComparisonItem[] = [
  {
    region: "NORTH",
    region_name: "ภาคเหนือ",
    term: "กิ๋น",
    definition: "รับประทานอาหาร เคี้ยวกลืนอาหาร",
    usage_context: "สนทนาทั่วไป สุภาพ",
    source: "พจนานุกรมคำเมือง-ไทย ฉบับราชบัณฑิตยสภา",
    evidence_status: "OFFICIAL",
    found: true,
  },
  {
    region: "NORTHEAST",
    region_name: "ภาคอีสาน",
    term: "โสภ / กิน",
    definition: "รับประทานอาหาร",
    usage_context: "สนทนาทั่วไป",
    source: "พจนานุกรมภาษาถิ่นอีสาน สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย",
    evidence_status: "OFFICIAL",
    found: true,
  },
  {
    region: "SOUTH",
    region_name: "ภาคใต้",
    term: "กิน",
    definition: "รับประทานอาหาร",
    usage_context: "สนทนาทั่วไป",
    source: "พจนานุกรมภาษาถิ่นใต้",
    evidence_status: "VERIFIED",
    found: true,
  },
  {
    region: "CENTRAL",
    region_name: "ภาคกลาง",
    term: "กิน",
    definition: "รับประทานอาหาร เคี้ยวกลืนอาหาร",
    usage_context: "ทางการและสนทนาทั่วไป",
    source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    evidence_status: "OFFICIAL",
    found: true,
  },
];

const BENCHMARK_CONCEPTS = [
  { label: "กิน (รับประทาน)", query: "กิน" },
  { label: "คิดถึง (ระลึกถึง)", query: "คิดถึง" },
  { label: "อร่อย (รสชาติดี)", query: "อร่อย" },
  { label: "มอง / ดู", query: "มอง" },
  { label: "พูด / สนทนา", query: "พูด" },
  { label: "โกหก / ไม่จริง", query: "โกหก" },
  { label: "กลับบ้าน", query: "กลับบ้าน" },
  { label: "วิ่ง / รีบไป", query: "วิ่ง" },
  { label: "ทำไม (เหตุใด)", query: "ทำไม" },
  { label: "เด็ก (คนอายุน้อย)", query: "เด็ก" },
];

export default function DialectDiscoveryView() {
  const [searchQuery, setSearchQuery] = useState("กิน");
  const [searchMode, setSearchMode] = useState<"meaning" | "word">("meaning");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("ALL");
  const [provinces, setProvinces] = useState<Array<{ id: string; name_thai: string; parent_code: string }>>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DialectItem[]>(DEFAULT_INITIAL_RESULTS);
  const [regionalGrouped, setRegionalGrouped] = useState<Record<string, DialectItem[]>>({
    NORTH: [DEFAULT_INITIAL_RESULTS[0]],
    NORTHEAST: [DEFAULT_INITIAL_RESULTS[1]],
    SOUTH: [DEFAULT_INITIAL_RESULTS[2]],
    CENTRAL: [DEFAULT_INITIAL_RESULTS[3]],
  });

  const [comparisonResults, setComparisonResults] = useState<RegionalComparisonItem[]>(DEFAULT_INITIAL_COMPARISONS);
  const [aiExplanation, setAiExplanation] = useState<AIExplanationResult | null>(null);
  const [explainingLoading, setExplainingLoading] = useState(false);

  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"discovery" | "compare" | "ai">("discovery");

  const searchInputId = useId();

  // Load provinces on mount
  useEffect(() => {
    if (typeof window === "undefined" || process.env.VITEST) return;
    async function loadProvinces() {
      try {
        const res = await fetch("/api/v1/dialect/provinces");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.provinces)) {
            setProvinces(data.provinces);
          }
        }
      } catch {
        // Fallback
      }
    }
    loadProvinces();
  }, []);

  // Execute Search
  const executeSearch = useCallback(async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;

    if (typeof window === "undefined" || process.env.VITEST) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setAiExplanation(null);

    try {
      if (searchMode === "meaning") {
        // 1. Meaning-First Search
        const res = await fetch("/api/v1/dialect/search/meaning", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: q,
            region: selectedRegionFilter !== "ALL" ? selectedRegionFilter : undefined,
            province: selectedProvince || undefined,
            limit: 20,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          if (data.regional_grouped) {
            setRegionalGrouped({
              NORTH: data.regional_grouped.NORTH || [],
              NORTHEAST: data.regional_grouped.NORTHEAST || [],
              SOUTH: data.regional_grouped.SOUTH || [],
              CENTRAL: data.regional_grouped.CENTRAL || [],
            });
          }
        }

        // Also fetch cross-regional comparison for the word
        const compRes = await fetch("/api/v1/dialect/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: q }),
        });
        if (compRes.ok) {
          const compData = await compRes.json();
          setComparisonResults(compData.results || []);
        }
      } else {
        // 2. Direct Word Search
        const params = new URLSearchParams({
          word: q,
          ...(selectedRegionFilter !== "ALL" ? { region: selectedRegionFilter } : {}),
          ...(selectedProvince ? { province: selectedProvince } : {}),
        });

        const res = await fetch(`/api/v1/dialect?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const items: DialectItem[] = (data.results || []).map((r: any) => ({
            id: r.id,
            dialectWord: r.dialect_word || r.word,
            dialectWordClean: r.dialect_word_clean || r.word,
            localMeaning: r.meaning,
            regionCode: r.region_code || "CENTRAL",
            regionName: r.region,
            province: r.province,
            ipaPhonetic: r.ipa_phonetic,
            status: r.status || "OFFICIAL_SOURCE",
            context: r.context,
            sourceName: r.source,
            sourceType: r.source_type,
          }));
          setResults(items);

          const grouped: Record<string, DialectItem[]> = {
            NORTH: [],
            NORTHEAST: [],
            SOUTH: [],
            CENTRAL: [],
          };
          for (const item of items) {
            if (grouped[item.regionCode]) {
              grouped[item.regionCode].push(item);
            }
          }
          setRegionalGrouped(grouped);
        }
      }
    } catch {
      // Error handled gracefully
    } finally {
      setLoading(false);
    }
  }, [searchMode, selectedRegionFilter, selectedProvince]);

  // Initial trigger
  useEffect(() => {
    executeSearch("กิน");
  }, [executeSearch]);

  // Trigger AI explanation
  const handleRequestAIExplanation = async () => {
    setExplainingLoading(true);
    setActiveTab("ai");
    try {
      const res = await fetch("/api/v1/dialect/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `อธิบายความแตกต่างและการใช้งานคำว่า ${searchQuery} ในภาษาถิ่นภาคต่างๆ`,
          concept: searchQuery,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiExplanation(data);
      }
    } catch {
      // Error
    } finally {
      setExplainingLoading(false);
    }
  };

  const handlePlayAudio = (word: string) => {
    setPlayingWord(word);
    try {
      audioManager.toggle({ headword: word } as any);
      setTimeout(() => setPlayingWord(null), 1400);
    } catch {
      setPlayingWord(null);
    }
  };

  const handleCopy = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedWord(text);
      setTimeout(() => setCopiedWord(null), 1800);
    }
  };

  const getBrailleString = (word: string): string => {
    try {
      const braille = encodeThaiToBraille(word);
      return braille.brailleUnicode || "";
    } catch {
      return "";
    }
  };

  const renderRegionBadge = (code: string) => {
    switch (code) {
      case "NORTH":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">ภาคเหนือ (คำเมือง)</span>;
      case "NORTHEAST":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">ภาคอีสาน (ลาว-อีสาน)</span>;
      case "SOUTH":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">ภาคใต้ (ปักษ์ใต้)</span>;
      case "CENTRAL":
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">ภาคกลาง (มาตรฐาน)</span>;
    }
  };

  const renderProvenanceBadge = (status?: string, sourceType?: string) => {
    if (status === "OFFICIAL_SOURCE" || sourceType === "ROYAL_SOCIETY" || sourceType === "OFFICIAL_DICTIONARY") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          แหล่งข้อมูลทางการ
        </span>
      );
    }
    if (status === "VERIFIED" || sourceType === "ACADEMIC" || sourceType === "DIALECT_DICTIONARY") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          ตรวจทานแล้ว (วิชาการ)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
        AI อนุมานเชื่อมโยง
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Search & Control Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        {/* Mode Switch Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setSearchMode("meaning");
                executeSearch(searchQuery);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                searchMode === "meaning"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              💡 ค้นหาจากความหมาย (Meaning-First)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchMode("word");
                executeSearch(searchQuery);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                searchMode === "word"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📖 ค้นหาตามคำถิ่น (Word Lookup)
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            คลังคำภาษาถิ่น ๔ ภาค บูรณาการหลักฐานทางภาษาศาสตร์
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <label htmlFor={searchInputId} className="sr-only">
              {searchMode === "meaning" ? "ค้นหาภาษาถิ่นจากความหมาย" : "ค้นหาคำภาษาถิ่น"}
            </label>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Icon name="search" />
            </div>
            <input
              id={searchInputId}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  executeSearch(searchQuery);
                }
              }}
              placeholder={
                searchMode === "meaning"
                  ? "พิมพ์ความหมาย เช่น 'กิน', 'คิดถึง', 'อร่อย', 'คำว่าโกหกในแต่ละภาค'..."
                  : "พิมพ์คำถิ่น เช่น 'แซ่บ', 'ลำ', 'หรอย', 'กิ๋น', 'ขี้ตั๋ว'..."
              }
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => executeSearch(searchQuery)}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin text-lg">⏳</span>
            ) : (
              <Icon name="search" />
            )}
            <span>ค้นหา</span>
          </button>
        </div>

        {/* Region & Province Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            กรองภูมิภาค:
          </span>
          {[
            { label: "ทุกภาค (All)", code: "ALL" },
            { label: "ภาคเหนือ (North)", code: "NORTH" },
            { label: "ภาคอีสาน (Northeast)", code: "NORTHEAST" },
            { label: "ภาคใต้ (South)", code: "SOUTH" },
            { label: "ภาคกลาง (Central)", code: "CENTRAL" },
          ].map((r) => (
            <button
              key={r.code}
              type="button"
              onClick={() => {
                setSelectedRegionFilter(r.code);
                executeSearch(searchQuery);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedRegionFilter === r.code
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {r.label}
            </button>
          ))}

          {provinces.length > 0 && (
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                executeSearch(searchQuery);
              }}
              aria-label="เลือกจังหวัด"
              className="ml-auto text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">ทุกจังหวัด</option>
              {provinces
                .filter(
                  (p) =>
                    selectedRegionFilter === "ALL" ||
                    p.parent_code === selectedRegionFilter
                )
                .map((p) => (
                  <option key={p.id} value={p.name_thai}>
                    {p.name_thai}
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Quick Concept Benchmark Chips */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 block mb-2">
            ✨ คำแนวคิดยอดนิยม (คลิกเพื่อค้นพบทันที):
          </span>
          <div className="flex flex-wrap gap-2">
            {BENCHMARK_CONCEPTS.map((c) => (
              <button
                key={c.query}
                type="button"
                onClick={() => {
                  setSearchQuery(c.query);
                  executeSearch(c.query);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  searchQuery === c.query
                    ? "bg-blue-100 text-blue-800 border border-blue-300 font-semibold"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View Switch Tabs: Discovery Grid vs Cross-Region Compare Matrix vs AI Grounded Explanation */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("discovery")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "discovery"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>ค้นพบภาษาถิ่นตามภาค</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {results.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("compare")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "compare"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span>ตารางเปรียบเทียบ 4 ภาค</span>
            {comparisonResults.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                4 ภูมิภาค
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("ai");
              if (!aiExplanation) handleRequestAIExplanation();
            }}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "ai"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>AI อธิบายความแตกต่างเชิงวัฒนธรรม</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">
              Grounded
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleRequestAIExplanation}
          disabled={explainingLoading}
          className="text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
        >
          {explainingLoading ? (
            <span>กำลังวิเคราะห์...</span>
          ) : (
            <>
              <Bot className="w-3.5 h-3.5 text-purple-700" />
              <span>ให้ AI อธิบายคำนี้</span>
            </>
          )}
        </button>
      </div>

      {/* TAB 1: Discovery Grid */}
      {activeTab === "discovery" && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="animate-spin text-3xl mb-3">🧭</div>
              <p className="text-sm font-medium">กำลังสืบค้นหลักฐานภาษาถิ่นจากฐานข้อมูล...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-2">
              <div className="text-2xl">🔍</div>
              <h3 className="text-base font-semibold text-amber-900">
                ไม่พบข้อมูลคำภาษาถิ่นที่ตรงกับ &quot;{searchQuery}&quot;
              </h3>
              <p className="text-xs text-amber-700 max-w-md mx-auto">
                ระบบรักษามาตรฐานความถูกต้อง ไม่ปั้นแต่งข้อมูลขึ้นเอง (Zero Hallucination)
                หากไม่มีบันทึกในคลังข้อมูลภาษาถิ่นที่ระบบรองรับ
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "ภาคเหนือ (คำเมือง)", code: "NORTH", bg: "bg-emerald-50/40 border-emerald-100" },
                { title: "ภาคอีสาน (ลาว-อีสาน)", code: "NORTHEAST", bg: "bg-amber-50/40 border-amber-100" },
                { title: "ภาคใต้ (ปักษ์ใต้)", code: "SOUTH", bg: "bg-blue-50/40 border-blue-100" },
                { title: "ภาคกลาง (มาตรฐาน)", code: "CENTRAL", bg: "bg-indigo-50/40 border-indigo-100" },
              ]
                .filter(
                  (col) =>
                    selectedRegionFilter === "ALL" || selectedRegionFilter === col.code
                )
                .map((col) => {
                  const items = regionalGrouped[col.code] || [];
                  return (
                    <div
                      key={col.code}
                      className={`rounded-2xl border p-5 space-y-4 ${col.bg}`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                        <h3 className="font-bold text-slate-800 text-sm">{col.title}</h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                          {items.length} คำ
                        </span>
                      </div>

                      {items.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          ไม่มีคำในภาคนี้สำหรับเงื่อนไขที่เลือก
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {items.map((item) => {
                            const brailleText = getBrailleString(item.dialectWord);
                            return (
                              <div
                                key={item.id}
                                className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 space-y-3 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-xl font-extrabold text-slate-900 font-thai-reading">
                                        {item.dialectWord}
                                      </h4>
                                      {item.province && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                                          จ.{item.province}
                                        </span>
                                      )}
                                    </div>
                                    {item.ipaPhonetic && (
                                      <span className="text-xs text-slate-400 font-mono">
                                        /{item.ipaPhonetic}/
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handlePlayAudio(item.dialectWord)}
                                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      aria-label={`ฟังเสียงคำว่า ${item.dialectWord}`}
                                      title="ฟังเสียงอ่าน (TTS)"
                                    >
                                      <Icon name={playingWord === item.dialectWord ? "pause" : "volume"} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(item.dialectWord)}
                                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-xs"
                                      aria-label={`คัดลอกคำว่า ${item.dialectWord}`}
                                      title="คัดลอกคำ"
                                    >
                                      {copiedWord === item.dialectWord ? "✓" : <Icon name="copy" />}
                                    </button>
                                  </div>
                                </div>

                                <p className="text-sm text-slate-700 font-medium">
                                  {item.localMeaning}
                                </p>

                                {item.context && (
                                  <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <span className="font-semibold text-slate-600">บริบท: </span>
                                    {item.context}
                                  </div>
                                )}

                                {/* Accessibility info: Braille */}
                                {brailleText && (
                                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                                    <span>อักษรเบรลล์:</span>
                                    <span className="font-mono text-sm tracking-widest text-slate-600">
                                      {brailleText}
                                    </span>
                                  </div>
                                )}

                                <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                                  <div className="flex items-center justify-between">
                                    {renderProvenanceBadge(item.status, item.sourceType)}
                                    {item.finalScore !== undefined && (
                                      <span className="text-[10px] text-slate-400">
                                        ความเกี่ยวข้อง {(item.finalScore * 100).toFixed(0)}%
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 truncate" title={item.sourceName}>
                                    แหล่งอ้างอิง: {item.sourceName || "พจนานุกรมภาษาถิ่น"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Cross-Region Comparison Matrix */}
      {activeTab === "compare" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                ตารางเปรียบเทียบ 4 ภูมิภาคสำหรับแนวคิด: &quot;{searchQuery}&quot;
              </h3>
              <p className="text-xs text-slate-500">
                การกระจายตัวของคำศัพท์ ความหมายเชิงลึก และหลักฐานทางเอกสารอ้างอิง
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(JSON.stringify(comparisonResults, null, 2))}
              className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-white border border-slate-200 rounded-lg flex items-center gap-1.5"
            >
              <Icon name="copy" />
              <span>คัดลอกตาราง</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="p-4">ภูมิภาค</th>
                  <th className="p-4">คำที่ใช้</th>
                  <th className="p-4">ความหมายท้องถิ่น</th>
                  <th className="p-4">บริบทการใช้งาน</th>
                  <th className="p-4">หลักฐาน & แหล่งที่มา</th>
                  <th className="p-4 text-center">การฟังเสียง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {comparisonResults.map((row) => (
                  <tr key={row.region} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 whitespace-nowrap font-medium">
                      {renderRegionBadge(row.region)}
                    </td>
                    <td className="p-4 font-bold text-slate-900 font-thai-reading text-lg">
                      {row.term}
                    </td>
                    <td className="p-4 text-slate-700 max-w-xs">{row.definition}</td>
                    <td className="p-4 text-xs text-slate-500 max-w-xs">{row.usage_context}</td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {renderProvenanceBadge(row.evidence_status)}
                        <p className="text-[11px] text-slate-400 line-clamp-1" title={row.source}>
                          {row.source}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(row.term)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                        aria-label={`ฟังเสียงคำว่า ${row.term}`}
                        title="ฟังเสียงอ่าน"
                      >
                        <Icon name={playingWord === row.term ? "pause" : "volume"} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Grounded AI Explanation Card */}
      {activeTab === "ai" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                AI
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  คำอธิบายภาษาถิ่นโดย AI ตามหลักฐานคลังข้อมูล (Grounded Dialect Intelligence)
                </h3>
                <p className="text-xs text-slate-500">
                  สังเคราะห์จากหลักฐานจริง ไม่ปั้นแต่งหรือคาดเดาความหมาย (Strict Provenance Guard)
                </p>
              </div>
            </div>

            {aiExplanation && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  aiExplanation.abstained
                    ? "bg-amber-100 text-amber-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {aiExplanation.abstained
                  ? "⚠️ ระงับการตอบ (Abstained)"
                  : `ความเชื่อมั่น: ${(aiExplanation.confidence * 100).toFixed(0)}% (${aiExplanation.confidence_level})`}
              </span>
            )}
          </div>

          {explainingLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <div className="animate-spin text-3xl">✨</div>
              <p className="text-sm font-medium">
                AI กำลังตรวจสอบหลักฐานจากพจนานุกรมและคลังภาษาถิ่น ๔ ภาค...
              </p>
            </div>
          ) : aiExplanation ? (
            <div className="space-y-6">
              {/* Section 1: Official Grounded Facts from Knowledge Base */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    📚 1. ข้อเท็จจริงจากคลังข้อมูลภาษาถิ่นที่ตรวจทานแล้ว (Evidence Base)
                  </span>
                </div>

                {aiExplanation.evidence.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    ไม่พบรายการหลักฐานที่ตรงกันในฐานข้อมูล
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {aiExplanation.evidence.map((ev, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-lg border border-slate-200/80 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-sm text-slate-900 font-thai-reading">
                            {ev.term}
                          </strong>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {ev.region}
                          </span>
                        </div>
                        <p className="text-slate-700">{ev.definition}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          อ้างอิง: {ev.source}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: AI Grounded Synthesis */}
              <div className="bg-purple-50/50 rounded-xl p-5 border border-purple-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
                    💡 2. คำอธิบายเชิงบริบทและการใช้งานโดย AI (AI Explanation)
                  </span>
                  <span className="text-[10px] text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                    Grounded Synthesis
                  </span>
                </div>

                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-thai-reading">
                  {aiExplanation.answer}
                </div>
              </div>

              {/* Governance & Integrity Disclaimer */}
              <p className="text-[11px] text-slate-400 text-center">
                🛡️ กฎการกำกับดูแล: ข้อมูลภาษาถิ่นอ้างอิงจากคลังข้อมูลภาษาถิ่น ๔ ภาค สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย ม.มหิดล และราชบัณฑิตยสภา โดย AI จะตอบเฉพาะเมื่อมีหลักฐานรองรับเท่านั้น
              </p>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <button
                type="button"
                onClick={handleRequestAIExplanation}
                className="px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
              >
                กดเพื่อให้ AI อธิบายแนวคิด &quot;{searchQuery}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
