import { NextResponse } from "next/server";
import { getDialectGroup } from "@/lib/dialect-data";

function getDialectBackendUrl(): string {
  const envUrl =
    process.env.THAI_CONTEXT_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001/api/v1";
  const trimmed = envUrl.replace(/\/+$/, "");
  if (trimmed.endsWith("/api/v1")) return trimmed;
  if (trimmed.endsWith("/api")) return `${trimmed}/v1`;
  return `${trimmed}/api/v1`;
}

const REGION_CODES: Record<string, string> = {
  กลาง: "CENTRAL",
  เหนือ: "NORTH",
  อีสาน: "NORTHEAST",
  ใต้: "SOUTH",
};

function normalizeRegionName(region: string): "กลาง" | "เหนือ" | "อีสาน" | "ใต้" {
  if (region.includes("เหนือ") || region === "NORTH") return "เหนือ";
  if (region.includes("อีสาน") || region === "NORTHEAST") return "อีสาน";
  if (region.includes("ใต้") || region === "SOUTH") return "ใต้";
  return "กลาง";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ word: string }> },
) {
  try {
    const { word } = await context.params;
    const decodedWord = decodeURIComponent(word || "").trim();

    if (!decodedWord) {
      return NextResponse.json(
        { error: "Word parameter is required" },
        { status: 400 },
      );
    }

    const backendUrl = getDialectBackendUrl();
    const targetUrl = `${backendUrl}/dialect/mapping/${encodeURIComponent(decodedWord)}`;

    try {
      const upstream = await fetch(targetUrl, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });

      if (upstream.ok) {
        const backendData = await upstream.json();

        if (backendData && Array.isArray(backendData.mappings) && backendData.mappings.length > 0) {
          const fallbackGroup = getDialectGroup(decodedWord);

          const normalizedMappings = backendData.mappings.map((m: any) => {
            const normRegion = normalizeRegionName(m.region || m.regionCode || "");
            const fallbackDialect = fallbackGroup?.dialects.find((d) => d.region === normRegion);

            return {
              word: m.word,
              region: normRegion,
              regionCode: m.regionCode || REGION_CODES[normRegion] || "OTHER",
              phonetic: m.phonetic || fallbackDialect?.phonetic || "",
              meaning: m.meaning || fallbackDialect?.meaning || "",
              confidence: typeof m.confidence === "number" ? m.confidence : 1.0,
              type: m.type || (m.confidence === 1.0 ? "OFFICIAL" : "AI_INFERRED"),
              culturalNotes: m.culturalNotes || fallbackDialect?.culturalNotes || null,
              source: m.source || "คลังข้อมูลภาษาถิ่น ๔ ภาค สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย ม.มหิดล",
            };
          });

          // Ensure Central ("กลาง") is present if standard word is known
          const hasCentral = normalizedMappings.some((m: any) => m.region === "กลาง");
          if (!hasCentral) {
            const centralFallback = fallbackGroup?.dialects.find((d) => d.region === "กลาง");
            normalizedMappings.unshift({
              word: centralFallback?.word || backendData.standardWord || decodedWord,
              region: "กลาง",
              regionCode: "CENTRAL",
              phonetic: centralFallback?.phonetic || `[${backendData.standardWord || decodedWord}]`,
              meaning: centralFallback?.meaning || "ภาษาไทยมาตรฐาน",
              confidence: 1.0,
              type: "OFFICIAL",
              culturalNotes: centralFallback?.culturalNotes || null,
              source: centralFallback?.source || "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            });
          }

          return NextResponse.json({
            standardWord: backendData.standardWord || decodedWord,
            category: fallbackGroup?.category || "conversation",
            categoryLabel: fallbackGroup?.categoryLabel || "สนทนายอดนิยม",
            mappings: normalizedMappings,
            source: "database",
          });
        }
      }
    } catch {
      // Upstream failed or unavailable -> proceed to fallback
    }

    // Fallback to local cached dialect data
    const group = getDialectGroup(decodedWord);

    if (!group) {
      return NextResponse.json(
        {
          standardWord: decodedWord,
          mappings: [],
          message: `ไม่พบข้อมูลภาษาถิ่นสำหรับคำว่า '${decodedWord}'`,
        },
        { status: 404 },
      );
    }

    const mappings = group.dialects.map((d) => ({
      word: d.word,
      region: d.region,
      regionCode: REGION_CODES[d.region] ?? "OTHER",
      phonetic: d.phonetic ?? "",
      meaning: d.meaning,
      confidence: d.provenance === "official" ? 1.0 : 0.75,
      type: d.provenance === "official" ? "OFFICIAL" : "AI_INFERRED",
      culturalNotes: d.culturalNotes ?? null,
      source: d.source,
    }));

    return NextResponse.json({
      standardWord: group.standardWord,
      category: group.category,
      categoryLabel: group.categoryLabel,
      mappings,
      isFallback: true,
      source: "fallback",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to map dialect terms" },
      { status: 500 },
    );
  }
}
