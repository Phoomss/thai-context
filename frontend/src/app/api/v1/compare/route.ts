import { normalizeCompareWords } from "@/lib/compare-types";
import { lookupOfficialDefinition } from "@/lib/dictionary-store";

function apiBaseUrl(): string {
  const configured =
    process.env.THAI_CONTEXT_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001/api/v1";
  const origin = configured
    .trim()
    .replace(/\/api\/.*$/, "")
    .replace(/\/+$/, "");
  return `${origin}/api/v1`;
}

const errorResponse = (message: string, status: number) =>
  Response.json(
    { success: false, error: { message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );

export async function POST(request: Request) {
  let words: unknown;
  try {
    const body: unknown = await request.json();
    words =
      typeof body === "object" && body !== null && "words" in body
        ? body.words
        : undefined;
  } catch {
    return errorResponse("รูปแบบข้อมูลเปรียบเทียบไม่ถูกต้อง", 400);
  }

  if (!Array.isArray(words) || !words.every((word) => typeof word === "string")) {
    return errorResponse("กรุณาระบุคำภาษาไทย 2–5 คำ", 400);
  }

  let normalized: string[];
  try {
    normalized = normalizeCompareWords(words);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "ข้อมูลเปรียบเทียบไม่ถูกต้อง",
      400,
    );
  }

  const timeout = AbortSignal.timeout(12000);
  try {
    const upstream = await fetch(`${apiBaseUrl()}/compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ words: normalized }),
      cache: "no-store",
      signal: AbortSignal.any([request.signal, timeout]),
    });
    const text = await upstream.text();
    const headers = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
    if (!text) return new Response(null, { status: upstream.status, headers });
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return errorResponse("บริการเปรียบเทียบส่งข้อมูลไม่ถูกต้อง", 502);
    }

    if (!upstream.ok) {
      return new Response(text, { status: upstream.status, headers });
    }

    // If upstream succeeded, enrich any sentinel/missing definitions with official dictionary
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.words)) {
      let enriched = false;
      for (const w of parsed.words) {
        if (
          !w.definition ||
          w.definition === "ไม่มีข้อมูลในพจนานุกรมทางการ" ||
          w.definition.includes("SAMPLE DEFINITION")
        ) {
          const official = lookupOfficialDefinition(w.headword);
          if (official) {
            w.definition = official.definition;
            if (official.partOfSpeech && (!w.partOfSpeech || w.partOfSpeech === "ไม่ระบุ")) {
              w.partOfSpeech = official.partOfSpeech;
            }
            if (official.edition && (!w.edition || w.edition === "2554")) {
              w.edition = official.edition;
            }
            enriched = true;

            if (Array.isArray(parsed.evidence)) {
              const existingEvIdx = parsed.evidence.findIndex((e: any) => e.word === w.headword);
              const evData = {
                word: w.headword,
                source: official.source || "สำนักงานราชบัณฑิตยสภา",
                edition: official.edition || "2554",
                definition: official.definition,
                relevance: 1,
              };
              if (existingEvIdx >= 0) {
                parsed.evidence[existingEvIdx] = evData;
              } else {
                parsed.evidence.push(evData);
              }
            }
          }
        }
      }

      // If enriched or if comparison text contains sentinel text, update difference summary
      if (parsed.comparison && typeof parsed.comparison === "object") {
        const hasSentinel =
          parsed.comparison.meaningDifference?.includes("ไม่มีข้อมูลในพจนานุกรมทางการ") ||
          parsed.comparison.usageGuidance?.includes("ไม่มีข้อมูลในพจนานุกรมทางการ") ||
          parsed.comparison.meaningDifference?.includes("SAMPLE DEFINITION");

        if (enriched || hasSentinel) {
          const validWords = parsed.words.filter(
            (w: any) => w.definition && w.definition !== "ไม่มีข้อมูลในพจนานุกรมทางการ"
          );
          if (validWords.length >= 2) {
            parsed.comparison.meaningDifference = `เปรียบเทียบตามนิยามมาตรฐาน: ${validWords
              .map((w: any) => `'${w.headword}' หมายถึง "${w.definition}"`)
              .join("; ")}`;
            parsed.comparison.contextDifference = `คำ ${validWords
              .map((w: any) => `'${w.headword}'`)
              .join(", ")} มีขอบเขตการใช้งานที่แตกต่างกันตามนิยามทางการ ควรเลือกใช้ตามสารที่ต้องการเน้นย้ำ`;
            parsed.comparison.usageGuidance = `เลือกคำที่ตรงกับวัตถุประสงค์: ${validWords
              .map((w: any) => `ใช้ '${w.headword}' เมื่อต้องการสื่อถึง ${w.definition}`)
              .join("; ")}`;
          }
        }
      }

      return Response.json(parsed, { headers });
    }

    return new Response(text, { status: upstream.status, headers });
  } catch {
    return errorResponse(
      timeout.aborted
        ? "บริการเปรียบเทียบใช้เวลานานเกินไป"
        : "ไม่สามารถเชื่อมต่อบริการเปรียบเทียบได้",
      timeout.aborted ? 504 : 502,
    );
  }
}
