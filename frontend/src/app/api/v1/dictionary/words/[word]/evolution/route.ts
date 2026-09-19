import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import {
  CURATED_WORD_EVOLUTIONS,
  getFallbackWordEvolution,
  type WordEvolutionResponse,
  type EvolutionItem,
} from "@/lib/evolution-data";

let evolutionJsonCache: Record<string, any> | null = null;

function getComparisonJson(): Record<string, any> | null {
  if (evolutionJsonCache) return evolutionJsonCache;
  const candidatePaths = [
    path.resolve(process.cwd(), "../data/processed/dict/dict_evolution_comparison.json"),
    path.resolve(process.cwd(), "data/processed/dict/dict_evolution_comparison.json"),
    path.resolve(process.cwd(), "../../data/processed/dict/dict_evolution_comparison.json"),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, "utf-8");
        evolutionJsonCache = JSON.parse(raw);
        return evolutionJsonCache;
      } catch {
        // Continue checking candidate paths
      }
    }
  }
  return null;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ word: string }> }
) {
  const { word } = await context.params;
  const decodedWord = decodeURIComponent(word || "").trim();

  if (!decodedWord) {
    return NextResponse.json(
      { error: "กรุณาระบุคำศัพท์ (word parameter is required)" },
      { status: 400 }
    );
  }

  const backendUrl =
    process.env.THAI_CONTEXT_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001";
  const forceMock =
    process.env.THAI_CONTEXT_USE_MOCK === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCK === "true";

  if (backendUrl && !forceMock) {
    try {
      const baseUrl = backendUrl.replace(/\/api\/.*$/, "");
      const upstream = await fetch(
        `${baseUrl}/api/v1/dictionary/words/${encodeURIComponent(decodedWord)}/evolution`,
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
        }
      );
      if (upstream.ok) {
        const data: WordEvolutionResponse = await upstream.json();
        if (data && Array.isArray(data.timeline) && data.timeline.length > 0) {
          // Normalize: focus on 3 historical eras if present
          const royalYears = ["2542", "2554", "2569"];
          const filtered = data.timeline.filter((item) =>
            royalYears.includes(item.editionYear || item.edition || "")
          );
          const timelineToUse = filtered.length > 0 ? filtered : data.timeline;
          return NextResponse.json({
            ...data,
            timeline: timelineToUse.map((t) => ({
              ...t,
              editionYear: t.editionYear || t.edition || "2569",
              edition: t.edition || t.editionYear || "2569",
            })),
          });
        }
        return NextResponse.json(data);
      }
    } catch {
      // Backend unreachable or timed out, proceed to local fallback
    }
  }

  // 2. Check historical 3-edition comparison JSON dataset (8,331 words)
  const comparison = getComparisonJson();
  if (comparison && comparison[decodedWord]) {
    const item = comparison[decodedWord];
    const editions = item.editions || {};
    const eraYears = ["2542", "2554", "2569"];
    const eraTitles: Record<string, string> = {
      "2542": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
      "2554": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      "2569": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙",
    };

    let previousDef: string | null = null;
    const timeline: EvolutionItem[] = [];

    for (const year of eraYears) {
      const senses = editions[year];
      const defText = senses && senses.length > 0 ? senses[0].definition : null;
      const cleanDef = defText ? defText.trim() : null;

      if (!cleanDef) continue;

      let status: EvolutionItem["status"] = "UNCHANGED";
      if (!previousDef) {
        status = year === "2542" ? "ORIGINAL" : "ADDED";
        previousDef = cleanDef;
      } else if (cleanDef === previousDef) {
        status = "UNCHANGED";
      } else {
        const isExpanded =
          cleanDef.length > previousDef.length * 1.15 ||
          (previousDef.length > 10 && cleanDef.includes(previousDef.slice(0, 15)));
        status = isExpanded ? "EXPANDED" : "CHANGED";
        previousDef = cleanDef;
      }

      timeline.push({
        editionYear: year,
        edition: year,
        editionTitle: eraTitles[year] || `พจนานุกรม ฉบับ พ.ศ. ${year}`,
        definition: cleanDef,
        status,
        pageNumber: null,
      });
    }

    if (timeline.length > 0) {
      return NextResponse.json({
        word: decodedWord,
        summary: `วิวัฒนาการความหมายของ “${decodedWord}” ข้าม 3 ยุคสมัยพจนานุกรม`,
        timeline,
      });
    }
  }

  // 3. Fallback to adaptive default evolution
  return NextResponse.json(getFallbackWordEvolution(decodedWord));
}
