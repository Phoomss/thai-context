import { NextResponse } from "next/server";
import {
  DIALECT_CATEGORIES,
  DIALECT_WORD_GROUPS,
  getDialectsByCategory,
  searchDialectGroups,
  type DialectCategoryKey,
  type DialectWordGroup,
} from "@/lib/dialect-data";

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

function normalizeRegionName(region: string): "กลาง" | "เหนือ" | "อีสาน" | "ใต้" {
  if (region.includes("เหนือ") || region === "NORTH") return "เหนือ";
  if (region.includes("อีสาน") || region === "NORTHEAST") return "อีสาน";
  if (region.includes("ใต้") || region === "SOUTH") return "ใต้";
  return "กลาง";
}

function enrichGroupsWithDatabase(
  baseGroups: DialectWordGroup[],
  dbEntries: any[],
): DialectWordGroup[] {
  if (!Array.isArray(dbEntries) || dbEntries.length === 0) return baseGroups;

  // Build lookup index for database entries
  const entryByWord = new Map<string, any>();
  const entryByStdWordAndRegion = new Map<string, any>();

  for (const entry of dbEntries) {
    if (entry.dialectWord) {
      entryByWord.set(entry.dialectWord, entry);
    }
    if (Array.isArray(entry.standardEquivalents)) {
      for (const se of entry.standardEquivalents) {
        if (se.standardWord) {
          const region = normalizeRegionName(entry.region || entry.regionCode || "");
          entryByStdWordAndRegion.set(`${se.standardWord}:${region}`, entry);
        }
      }
    }
  }

  return baseGroups.map((group) => {
    const updatedDialects = group.dialects.map((dialect) => {
      const match =
        entryByStdWordAndRegion.get(`${group.standardWord}:${dialect.region}`) ||
        entryByWord.get(dialect.word);

      if (!match) return dialect;

      return {
        ...dialect,
        meaning: match.meaning || dialect.meaning,
        culturalNotes: match.culturalNotes || dialect.culturalNotes,
        provenance: "official" as const,
        source: match.source
          ? `${match.source} (${match.edition || "2565"})`
          : dialect.source,
      };
    });

    return {
      ...group,
      dialects: updatedDialects,
    };
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as DialectCategoryKey | null;
  const query = searchParams.get("query") || searchParams.get("word");
  const format = searchParams.get("format");

  const backendUrl = getDialectBackendUrl();
  const forwardQuery = searchParams.toString();
  const targetUrl = forwardQuery
    ? `${backendUrl}/dialect?${forwardQuery}`
    : `${backendUrl}/dialect`;

  try {
    const upstream = await fetch(targetUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    if (upstream.ok) {
      const backendData = await upstream.json();

      if (format === "raw") {
        return NextResponse.json(backendData);
      }

      let groups = enrichGroupsWithDatabase(
        DIALECT_WORD_GROUPS,
        backendData.results || [],
      );

      if (category) {
        groups = groups.filter((g) => g.category === category);
      }

      if (query) {
        const trimmed = query.trim().toLowerCase();
        groups = groups.filter(
          (g) =>
            g.standardWord.toLowerCase().includes(trimmed) ||
            g.categoryLabel.toLowerCase().includes(trimmed) ||
            g.dialects.some(
              (d) =>
                d.word.toLowerCase().includes(trimmed) ||
                d.meaning.toLowerCase().includes(trimmed),
            ),
        );
      }

      return NextResponse.json({
        categories: DIALECT_CATEGORIES,
        count: (backendData.count && backendData.count > 0) ? backendData.count : groups.length,
        results: groups,
        totalDatabaseEntries: backendData.count,
        source: "database",
      });
    }
  } catch {
    // Fallback to local cached data on backend unavailability or fetch failure
  }

  // Graceful fallback
  let fallbackResults = DIALECT_WORD_GROUPS;

  if (category) {
    fallbackResults = getDialectsByCategory(category);
  }

  if (query) {
    fallbackResults = searchDialectGroups(query);
    if (category) {
      fallbackResults = fallbackResults.filter((g) => g.category === category);
    }
  }

  return NextResponse.json({
    categories: DIALECT_CATEGORIES,
    count: fallbackResults.length,
    results: fallbackResults,
    isFallback: true,
    source: "fallback",
  });
}
