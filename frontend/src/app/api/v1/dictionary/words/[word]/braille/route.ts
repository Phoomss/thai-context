import { NextRequest, NextResponse } from "next/server";
import { encodeThaiToBraille } from "@/lib/braille-encoder";

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
        )}/braille`,
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
      // Fallback to local encoder below
    }
  }

  const result = encodeThaiToBraille(decodedWord);
  return NextResponse.json(result);
}
