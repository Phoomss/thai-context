import { mockSearch } from "@/lib/mock-search";
import { parseResponse, type SearchResponse } from "@/lib/search-types";

function adaptSearchResponse(raw: any, query: string): unknown {
  const data =
    raw && typeof raw === "object" && raw.data && typeof raw.data === "object"
      ? raw.data
      : raw;

  // Pass through if already in the expected contract shape
  if (
    data &&
    typeof data === "object" &&
    data.query_understanding &&
    Array.isArray(data.recommendations)
  ) {
    return raw;
  }

  // NestJS meaning-search returns { recommendations, intent, context, ... }
  // without query_understanding — normalise it here so parseResponse works.
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as any).recommendations) &&
    (data as any).recommendations.length > 0
  ) {
    const d = data as any;
    return {
      query_understanding: {
        raw_query: rawQuery,
        detected_meaning: d.intent || rawQuery,
        context: d.query_understanding?.context || d.context || undefined,
        excluded_words: d.query_understanding?.excluded_words || [],
      },
      recommendations: d.recommendations,
      mode: "live",
    };
  }

  const rawQuery = (
    typeof raw?.query === "string" && raw.query.trim() ? raw.query : query
  ).trim();
  const detectedMeaning =
    typeof raw?.intent === "string" && raw.intent ? raw.intent : rawQuery;
  const rawResults = Array.isArray(raw?.results) ? raw.results : [];

  const recommendations = rawResults
    .map((item: any, idx: number) => {
      const headword = String(item.headword || item.word || "").trim();
      if (!headword) return null;

      const definition = String(
        item.definition || item.reason || `ความหมายของคำว่า ${headword}`
      ).trim();
      const score =
        typeof item.score === "number" && Number.isFinite(item.score)
          ? Math.min(1.0, Math.max(0.0, item.score))
          : 0.85;

      const sourceName =
        item.source?.name ||
        (typeof item.source === "string" ? item.source : null) ||
        "สำนักงานราชบัณฑิตยสภา";
      const editionStr = String(item.source?.edition || item.edition || "2554");
      const editionYear = parseInt(editionStr, 10) || 2554;

      const evidence = {
        source_book: sourceName,
        edition: `ฉบับ พ.ศ. ${editionStr}`,
        edition_year: editionYear,
        quote: definition,
        is_official: true,
      };

      const englishTerm =
        item.english ||
        (item.metadata?.english_term ? String(item.metadata.english_term) : undefined);

      return {
        id: item.id || `rec-${idx}-${headword}`,
        headword,
        pos: item.partOfSpeech || item.pos || "น.",
        definition,
        score,
        english: englishTerm,
        translations: Array.isArray(item.translations) ? item.translations : undefined,
        ai_explanation: item.reason || item.ai_explanation || undefined,
        contextual_explanation: item.contextual_explanation || item.reason || undefined,
        registers: ["ทางการ"],
        contexts: ["การทำงาน"],
        evidence,
        sources: [evidence],
      };
    })
    .filter(Boolean);

  return {
    query_understanding: {
      raw_query: rawQuery,
      detected_meaning: detectedMeaning,
      excluded_words: [],
    },
    recommendations,
    mode: "live",
  };
}

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
  const cleanQuery = query.trim();
  const endpoint =
    process.env.THAI_CONTEXT_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  const forceMock =
    process.env.THAI_CONTEXT_USE_MOCK === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCK === "true";

  if (!endpoint || forceMock)
    return Response.json(mockSearch(cleanQuery), {
      headers: { "Cache-Control": "no-store" },
    });

  try {
    let rawData: any = null;
    const meaningResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: cleanQuery }),
      cache: "no-store",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(7000)]),
    });
    if (meaningResponse.ok) {
      rawData = await meaningResponse.json();
    }

    // If meaning search yielded no results, fallback to keyword search on official database
    const effectiveData =
      rawData?.data && typeof rawData.data === "object"
        ? rawData.data
        : rawData;
    const resultsCount =
      Array.isArray(effectiveData?.recommendations)
        ? effectiveData.recommendations.length
        : Array.isArray(effectiveData?.results)
        ? effectiveData.results.length
        : 0;

    if (resultsCount === 0) {
      const baseUrl = endpoint.replace(/\/api\/v1\/search.*$/, "");
      const keywordUrl = `${baseUrl}/api/v1/search?q=${encodeURIComponent(cleanQuery)}`;
      const kwResponse = await fetch(keywordUrl, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(4000)]),
      });
      if (kwResponse.ok) {
        const kwData = await kwResponse.json();
        if (Array.isArray(kwData?.results) && kwData.results.length > 0) {
          rawData = kwData;
        }
      }
    }

    if (!rawData) {
      throw new Error("No data returned from upstream");
    }

    const adapted = adaptSearchResponse(rawData, cleanQuery);
    const parsed = parseResponse(adapted);

    // If still 0 recommendations, try mock search for smooth UX
    if (parsed.recommendations.length === 0) {
      const fallback = mockSearch(cleanQuery, "fallback");
      // mockSearch may also return 0 results for unknown words;
      // return it regardless so the client can show the notice.
      return Response.json(fallback, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    return Response.json(parsed, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(mockSearch(cleanQuery, "fallback"), {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
