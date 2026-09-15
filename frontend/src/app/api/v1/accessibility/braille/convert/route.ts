import { NextRequest, NextResponse } from "next/server";
import { encodeThaiToBraille } from "@/lib/braille-encoder";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json(
        { error: "Text is required for Braille conversion" },
        { status: 400 }
      );
    }

    const brailleResult = encodeThaiToBraille(text);

    return NextResponse.json({
      text,
      brailleUnicode: brailleResult.brailleUnicode,
      cellsCount: brailleResult.brailleCells.length,
      cells: brailleResult.brailleCells,
      readingGuide: brailleResult.readingGuide,
      sourceAttribution: brailleResult.sourceAttribution,
      verificationStatus: brailleResult.verificationStatus,
      export: {
        rawUnicode: brailleResult.brailleUnicode,
        textWithBraille: `${text}\n${brailleResult.brailleUnicode}`,
        accessibleFormat: `[ข้อความภาษาไทย]: ${text}\n[อักษรเบรลล์ไทย]: ${brailleResult.brailleUnicode}\n[คำอธิบายสะกด]: ${brailleResult.readingGuide}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to convert text to Braille" },
      { status: 500 }
    );
  }
}
