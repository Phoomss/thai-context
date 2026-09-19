import { NextRequest, NextResponse } from "next/server";
import { findModernTerm } from "@/lib/modern-vocabulary-store";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ term: string }> }
) {
  const { term } = await context.params;
  const decodedTerm = decodeURIComponent(term);

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
      const upstream = await fetch(
        `${baseUrl}/api/v1/modern-vocabulary/${encodeURIComponent(decodedTerm)}`,
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
        }
      );

      if (upstream.ok) {
        const data = await upstream.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend unreachable or timed out, fall through to local fallback
    }
  }

  // Local fallback
  const found = findModernTerm(decodedTerm);
  if (!found) {
    return NextResponse.json(
      { error: `ไม่พบคำศัพท์สมัยใหม่: ${decodedTerm}` },
      { status: 404 }
    );
  }

  return NextResponse.json(found);
}
