import { mockSearch } from "@/lib/mock-search";
import { parseResponse } from "@/lib/search-types";
export async function POST(request: Request) {
  let query: unknown;
  try {
    query = (await request.json()).query;
  } catch {
    return Response.json({ error: "รูปแบบคำค้นไม่ถูกต้อง" }, { status: 400 });
  }
  if (typeof query !== "string" || !query.trim() || query.length > 600)
    return Response.json(
      { error: "กรุณาระบุความหมาย 1–600 ตัวอักษร" },
      { status: 400 },
    );
  query = query.trim();
  const rawEndpoint =
    process.env.THAI_CONTEXT_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  const forceMock =
    process.env.THAI_CONTEXT_USE_MOCK === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCK === "true";
  if (!rawEndpoint || forceMock)
    return Response.json(mockSearch(query as string), {
      headers: { "Cache-Control": "no-store" },
    });

  // Automatically resolve base URL (e.g. http://localhost:3001/api/v1 or http://localhost:3001)
  // as well as explicit endpoint (http://localhost:3001/api/v1/search/meaning)
  let endpoint = rawEndpoint.trim().replace(/\/+$/, "");
  if (endpoint.endsWith("/search/meaning")) {
    // Already full path
  } else if (endpoint.endsWith("/api/v1")) {
    endpoint = `${endpoint}/search/meaning`;
  } else {
    endpoint = `${endpoint}/api/v1/search/meaning`;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      cache: "no-store",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(7000)]),
    });
    if (!response.ok) throw new Error("Upstream unavailable");
    const rawData = await response.json();
    let normalizedData = rawData;
    if (rawData && !rawData.query_understanding && Array.isArray(rawData.results)) {
      normalizedData = {
        query_understanding: {
          raw_query: query as string,
          detected_meaning: query as string,
          excluded_words: [],
        },
        recommendations: rawData.results.map((item: any) => {
          const edYear = item.source?.edition ? parseInt(item.source.edition, 10) : 2554;
          return {
            headword: item.word || item.headword,
            score: typeof item.score === "number" ? Number(Math.min(1, Math.max(0.1, item.score)).toFixed(2)) : 0.85,
            definition: item.definition || item.reason || "ความหมายตามพจนานุกรมทางการ",
            ai_explanation: item.reason || undefined,
            evidence: {
              source_book: item.source?.name || "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
              edition: item.source?.edition ? `พ.ศ. ${item.source.edition}` : "พ.ศ. ๒๕๕๔",
              edition_year: isNaN(edYear) ? 2554 : edYear,
              quote: item.definition || item.reason || "",
              is_official: true,
            },
            registers: ["ทางการ"],
            contexts: ["ทั่วไป"],
          };
        }),
      };
    }
    return Response.json(parseResponse(normalizedData, "live"), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(mockSearch(query as string, "fallback"), {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
