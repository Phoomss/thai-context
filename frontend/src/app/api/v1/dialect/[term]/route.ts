import { NextResponse } from "next/server";
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ term: string }> }
) {
  try {
    const { term } = await context.params;
    const decodedTerm = decodeURIComponent(term || "").trim();

    if (!decodedTerm) {
      return NextResponse.json(
        { error: "Term parameter is required" },
        { status: 400 }
      );
    }

    const backendUrl = getDialectBackendUrl();
    const targetUrl = `${backendUrl}/dialect/${encodeURIComponent(decodedTerm)}`;

    try {
      const upstream = await fetch(targetUrl, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });

      if (upstream.ok) {
        const data = await upstream.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback
    }

    // Search in fallback data
    for (const group of DIALECT_WORD_GROUPS) {
      const match = group.dialects.find((d) => d.word === decodedTerm);
      if (match) {
        return NextResponse.json({
          dialect_word: match.word,
          dialect_word_clean: match.word,
          region: `ภาค${match.region}`,
          region_code:
            match.region === "เหนือ"
              ? "NORTH"
              : match.region === "อีสาน"
              ? "NORTHEAST"
              : match.region === "ใต้"
              ? "SOUTH"
              : "CENTRAL",
          meaning: match.meaning,
          context: match.culturalNotes || "สนทนาทั่วไป",
          status: match.provenance === "official" ? "OFFICIAL_SOURCE" : "VERIFIED",
          source: match.source,
          source_type: "DIALECT_DICTIONARY",
          definitions: [{ definition: match.meaning, type: "OFFICIAL", verified: true }],
          sources: [
            {
              source_name: match.source,
              source_type: "DIALECT_DICTIONARY",
              verification_status: "VERIFIED",
            },
          ],
          standard_equivalents: [
            {
              standard_word: group.standardWord,
              type: "EXACT_EQUIVALENT",
              confidence: 0.95,
            },
          ],
          isFallback: true,
        });
      }
    }

    return NextResponse.json(
      { error: `ไม่พบข้อมูลคำภาษาถิ่น '${decodedTerm}'` },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
