import { NextRequest, NextResponse } from "next/server";
import { getSignResource } from "@/lib/sign-motion-data";
import { encodeThaiToBraille } from "@/lib/braille-encoder";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ word: string }> | { word: string } }
) {
  try {
    const resolvedParams = await params;
    const rawWord = resolvedParams?.word;
    if (!rawWord) {
      return NextResponse.json({ error: "Word parameter is required" }, { status: 400 });
    }

    const word = decodeURIComponent(rawWord).trim();
    if (!word) {
      return NextResponse.json({ error: "Valid word is required" }, { status: 400 });
    }

    // 1. Sign Language Availability
    const signResource = getSignResource(word);

    // 2. Braille Encoding (Deterministic)
    const brailleData = encodeThaiToBraille(word);

    // 3. Audio & Phonetics
    const audioAvailable = true; // Web Speech API / TTS fallback always supported

    return NextResponse.json({
      word,
      audio: {
        available: audioAvailable,
        phonetic: word,
        locale: "th-TH",
      },
      signLanguage: {
        available: signResource.status === "VERIFIED" || signResource.status === "EXTERNAL_RESOURCE",
        status: signResource.status,
        resource: signResource,
      },
      braille: {
        available: brailleData.brailleUnicode.length > 0,
        unicode: brailleData.brailleUnicode,
        cellsCount: brailleData.brailleCells.length,
        readingGuide: brailleData.readingGuide,
        sourceAttribution: brailleData.sourceAttribution,
      },
      governance: {
        isDeterministic: true,
        aiGeneratedSign: false,
        aiGeneratedBraille: false,
        standard: "สมาคมคนตาบอดแห่งประเทศไทย & มคอ. ภาษามือไทย",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve accessibility representation" },
      { status: 500 }
    );
  }
}
