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
    const query = (body.query || "").trim();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required for explanation" },
        { status: 400 }
      );
    }

    const backendUrl = getDialectBackendUrl();
    const targetUrl = `${backendUrl}/dialect/explain`;

    try {
      const upstream = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      if (upstream.ok) {
        const data = await upstream.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback
    }

    // Fallback grounded explanation with strict hallucination guard
    const concept = body.concept || query;
    const group = getDialectGroup(concept);

    if (!group) {
      return NextResponse.json({
        answer: "ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลภาษาถิ่นที่ระบบรองรับ",
        grounded: false,
        abstained: true,
        confidence: 0.2,
        confidence_level: "LOW",
        evidence: [],
        isFallback: true,
      });
    }

    const evidenceList = group.dialects.map((d) => ({
      term: d.word,
      region: `ภาษาถิ่น${d.region}`,
      definition: d.meaning,
      context: d.culturalNotes || "สนทนาทั่วไป",
      source: d.source,
      source_type: "DIALECT_DICTIONARY",
    }));

    const explanationParts = evidenceList.map(
      (e) => `• คำว่า "${e.term}" ใน${e.region} หมายถึง "${e.definition}" ใช้ในบริบท${e.context} [อ้างอิง: ${e.source}]`
    );

    const answer = `จากการตรวจสอบหลักฐานในคลังข้อมูลภาษาถิ่น:\n${explanationParts.join("\n")}\n\nข้อแตกต่างหลักอยู่ที่การออกเสียงตามกลุ่มตระกูลภาษาและเฉดความรู้สึกของการใช้งานในแต่ละท้องถิ่น`;

    return NextResponse.json({
      answer,
      grounded: true,
      abstained: false,
      confidence: 0.92,
      confidence_level: "HIGH",
      evidence: evidenceList,
      isFallback: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
