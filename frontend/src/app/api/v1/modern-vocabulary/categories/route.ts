import { NextRequest, NextResponse } from "next/server";
import { filterModernTerms } from "@/lib/modern-vocabulary-store";

export async function GET(request: NextRequest) {
  const backendUrl =
    process.env.THAI_CONTEXT_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001";
  const forceMock =
    process.env.THAI_CONTEXT_USE_MOCK === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
    process.env.NODE_ENV === "test";

  if (backendUrl && !forceMock) {
    try {
      const baseUrl = backendUrl.replace(/\/api\/.*$/, "").replace(/\/+$/, "");
      const upstream = await fetch(`${baseUrl}/api/v1/modern-vocabulary/categories`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      });

      if (upstream.ok) {
        const data = await upstream.json();
        const cats = Array.isArray(data)
          ? data
          : Array.isArray(data?.categories)
          ? data.categories
          : [];
        if (cats.length > 0) {
          return NextResponse.json(Array.isArray(data) ? { categories: cats } : data);
        }
      }
    } catch {
      // Backend unreachable or timed out, fall through to local fallback
    }
  }

  // Local fallback
  const result = filterModernTerms({});
  return NextResponse.json({ categories: result.categories });
}
