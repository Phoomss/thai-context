import { NextRequest, NextResponse } from "next/server";
import { filterModernTerms } from "@/lib/modern-vocabulary-store";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = (searchParams.get("q") || "").trim();
  const category = (searchParams.get("category") || "").trim() || undefined;
  const status = (searchParams.get("status") || "").trim() || undefined;
  const register = (searchParams.get("register") || "").trim() || undefined;
  const origin = (searchParams.get("origin") || "").trim() || undefined;
  const sort = (searchParams.get("sort") || "confidence").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));

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
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category) params.set("category", category);
      if (status) params.set("status", status);
      if (register) params.set("register", register);
      if (origin) params.set("origin", origin);
      if (sort) params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", String(limit));

      const upstream = await fetch(`${baseUrl}/api/v1/modern-vocabulary?${params.toString()}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      });

      if (upstream.ok) {
        const data = await upstream.json();
        const list = Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.items)
          ? data.items
          : [];

        if (list.length > 0) {
          return NextResponse.json({
            ...data,
            items: list,
            results: list,
          });
        }
        // Backend returned empty results (e.g. unseeded database), fall through to local fallback
      }
    } catch {
      // Backend unreachable or timed out, fall through to local fallback
    }
  }

  // Local fallback
  const data = filterModernTerms({
    q,
    category,
    status,
    register,
    origin,
    sort,
    page,
    limit,
  });

  return NextResponse.json({
    ...data,
    results: data.items,
  });
}
