import { NextRequest, NextResponse } from "next/server";
import { MOCK_TRANSLATIONS } from "@/lib/api-client";
import { sortTranslations } from "@/lib/accessibility-types";

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
        )}/translations`,
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
        }
      );
      if (upstream.ok) {
        const data = await upstream.json();
        return NextResponse.json(
          Array.isArray(data) ? sortTranslations(data) : data
        );
      }
    } catch {
      // Fallback to mock data below
    }
  }

  const result = MOCK_TRANSLATIONS[decodedWord];
  return NextResponse.json(result ? sortTranslations(result) : []);
}
