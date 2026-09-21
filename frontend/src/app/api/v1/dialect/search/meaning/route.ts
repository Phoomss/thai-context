import { NextRequest, NextResponse } from "next/server";
import { DIALECT_WORD_GROUPS } from "@/lib/dialect-data";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = (body.query || "").trim();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required for meaning search" },
        { status: 400 }
      );
    }

    const backendUrl = getDialectBackendUrl();
    const targetUrl = `${backendUrl}/dialect/search/meaning`;

    try {
      const upstream = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });

      if (upstream.ok) {
        const data = await upstream.json();
        if (data && Array.isArray(data.results) && data.results.length > 0) {
          return NextResponse.json(data);
        }
      }
    } catch {
      // Fallback
    }

    // Meaning-first fallback search
    const cleanQ = query.toLowerCase();
    const matchedGroups = DIALECT_WORD_GROUPS.filter(
      (g) =>
        g.standardWord.toLowerCase().includes(cleanQ) ||
        cleanQ.includes(g.standardWord.toLowerCase()) ||
        g.dialects.some(
          (d) =>
            d.word.toLowerCase().includes(cleanQ) ||
            d.meaning.toLowerCase().includes(cleanQ)
        )
    );

    const regionalGrouped: Record<string, any[]> = {
      NORTH: [],
      NORTHEAST: [],
      SOUTH: [],
      CENTRAL: [],
    };

    const results: any[] = [];

    const regionMap: Record<string, string> = {
      เหนือ: "NORTH",
      อีสาน: "NORTHEAST",
      ใต้: "SOUTH",
      กลาง: "CENTRAL",
    };

    for (const group of matchedGroups) {
      for (const d of group.dialects) {
        const code = regionMap[d.region] || "CENTRAL";
        const candidate = {
          id: `${group.id}-${code}`,
          dialectWord: d.word,
          dialectWordClean: d.word,
          localMeaning: d.meaning,
          regionCode: code,
          regionName: `ภาษาถิ่น${d.region}`,
          status: "OFFICIAL_SOURCE",
          context: d.culturalNotes || "สนทนาทั่วไป",
          sourceName: d.source,
          sourceType: "DIALECT_DICTIONARY",
          standardWord: group.standardWord,
          finalScore: 0.9,
        };

        results.push(candidate);
        if (!regionalGrouped[code]) regionalGrouped[code] = [];
        regionalGrouped[code].push(candidate);
      }
    }

    return NextResponse.json({
      query_understanding: {
        raw_query: query,
        detected_meaning: query,
        target_region: body.region || null,
        region_code: body.region || null,
      },
      total: results.length,
      results,
      regional_grouped: regionalGrouped,
      isFallback: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
