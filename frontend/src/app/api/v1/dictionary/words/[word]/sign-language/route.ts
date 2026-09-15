import { NextRequest, NextResponse } from "next/server";
import { MOCK_SIGN_LANGUAGE } from "@/lib/api-client";
import { getSignResource, SIGN_CATALOG } from "@/lib/sign-motion-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ word: string }> }
) {
  const { word } = await params;
  const decodedWord = decodeURIComponent(word || "").trim();

  if (!decodedWord) {
    return NextResponse.json(
      { error: "กรุณาระบุคำศัพท์" },
      { status: 400 }
    );
  }

  const url = new URL(request.url, "http://localhost:3000");
  const format = url.searchParams.get("format");
  const acceptHeader = request.headers.get("accept") || "";
  const tslFormatHeader = request.headers.get("x-tsl-format") || "";

  // Check if caller requests legacy array format (such as legacy tests without format param or explicit legacy)
  const isLegacy =
    format === "legacy" ||
    (format !== "structured" &&
      tslFormatHeader !== "structured" &&
      acceptHeader !== "application/json");

  if (isLegacy) {
    const legacyResult = MOCK_SIGN_LANGUAGE[decodedWord] ?? [];
    return NextResponse.json(legacyResult);
  }

  // Upstream backend check if live backend is configured
  const backendUrl =
    process.env.THAI_CONTEXT_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  const forceMock =
    process.env.THAI_CONTEXT_USE_MOCK === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCK === "true";

  if (backendUrl && !forceMock) {
    try {
      const upstream = await fetch(
        `${backendUrl.replace(/\/api\/.*$/, "")}/api/v1/dictionary/words/${encodeURIComponent(
          decodedWord
        )}/sign-language`,
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
        }
      );
      if (upstream.ok) {
        const data = await upstream.json();
        if (format === "structured" || tslFormatHeader === "structured") {
          if (data && typeof data === "object" && !Array.isArray(data) && data.status) {
            return NextResponse.json(data);
          }
        } else {
          return NextResponse.json(data);
        }
      }
    } catch {
      // Fallback to structured catalog below
    }
  }

  // Return Section 20 structured representation response
  const structuredItem = getSignResource(decodedWord);
  return NextResponse.json(structuredItem);
}
