import { NextRequest, NextResponse } from "next/server";
import { decodeBrailleToThai } from "@/lib/braille-encoder";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const braille = typeof body?.braille === "string" ? body.braille.trim() : "";

    if (!braille) {
      return NextResponse.json(
        { error: "กรุณาระบุอักษรเบรลล์ที่ต้องการถอดรหัส" },
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
          `${backendUrl.replace(/\/api\/.*$/, "")}/api/v1/dictionary/words/braille/decode`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ braille }),
            signal: AbortSignal.timeout(4000),
            cache: "no-store",
          }
        );
        if (upstream.ok) {
          const data = await upstream.json();
          return NextResponse.json(data);
        }
      } catch {
        // Fallback to local decoder
      }
    }

    const result = decodeBrailleToThai(braille);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "รูปแบบข้อมูลไม่ถูกต้อง" },
      { status: 400 }
    );
  }
}
