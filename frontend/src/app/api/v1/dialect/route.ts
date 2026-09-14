import { NextResponse } from "next/server";
import {
  DIALECT_CATEGORIES,
  DIALECT_WORD_GROUPS,
  getDialectsByCategory,
  searchDialectGroups,
  type DialectCategoryKey,
} from "@/lib/dialect-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as DialectCategoryKey | null;
    const query = searchParams.get("query") || searchParams.get("word");

    let results = DIALECT_WORD_GROUPS;

    if (category) {
      results = getDialectsByCategory(category);
    }

    if (query) {
      results = searchDialectGroups(query);
      if (category) {
        results = results.filter((g) => g.category === category);
      }
    }

    return NextResponse.json({
      categories: DIALECT_CATEGORIES,
      count: results.length,
      results,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch dialect entries" },
      { status: 500 },
    );
  }
}
