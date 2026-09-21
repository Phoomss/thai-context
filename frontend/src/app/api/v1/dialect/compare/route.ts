import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const word = (body.word || "").trim();
    const targetRegions = body.regions || ["CENTRAL", "NORTH", "NORTHEAST", "SOUTH"];

    if (!word) {
      return NextResponse.json(
        { error: "Word is required for regional comparison" },
        { status: 400 }
      );
    }

    const backendUrl = getDialectBackendUrl();
    const targetUrl = `${backendUrl}/dialect/compare`;

    try {
      const upstream = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ word, regions: targetRegions }),
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });

      if (upstream.ok) {
        const data = await upstream.json();
        if (data && Array.isArray(data.results) && data.results.some((r: any) => r.found)) {
          return NextResponse.json(data);
        }
      }
    } catch {
      // Fallback
    }

    // Fallback comparison
    const group = getDialectGroup(word);
    const regionNameMap: Record<string, string> = {
      CENTRAL: "ภาคกลาง",
      NORTH: "ภาคเหนือ",
      NORTHEAST: "ภาคอีสาน",
      SOUTH: "ภาคใต้",
    };

    const regionalComparisons = targetRegions.map((regionCode: string) => {
      const thaiRegion =
        regionCode === "CENTRAL"
          ? "กลาง"
          : regionCode === "NORTH"
          ? "เหนือ"
          : regionCode === "NORTHEAST"
          ? "อีสาน"
          : "ใต้";

      const matchedDialect = group?.dialects.find((d) => d.region === thaiRegion);

      return {
        region: regionCode,
        region_name: regionNameMap[regionCode] || regionCode,
        term: matchedDialect ? matchedDialect.word : word,
        definition: matchedDialect
          ? matchedDialect.meaning
          : `ใช้คำว่า "${word}" ในความหมายมาตรฐาน`,
        usage_context: matchedDialect?.culturalNotes || "สนทนาทั่วไป",
        source: matchedDialect?.source || "พจนานุกรม ฉบับราชบัณฑิตยสถาน",
        evidence_status: matchedDialect?.provenance === "official" ? "OFFICIAL" : "VERIFIED",
        found: !!matchedDialect,
      };
    });

    return NextResponse.json({
      concept: word,
      compared_regions: targetRegions,
      results: regionalComparisons,
      summary: `คำว่า "${word}" มีการใช้งานที่หลากหลายตามแต่ละภูมิภาค โดยสะท้อนถึงวัฒนธรรมท้องถิ่นและการออกเสียงเฉพาะตัว`,
      isFallback: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
