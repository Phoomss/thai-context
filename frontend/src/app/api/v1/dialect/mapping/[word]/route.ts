import { NextResponse } from "next/server";
import { getDialectGroup } from "@/lib/dialect-data";

const REGION_CODES: Record<string, string> = {
  กลาง: "CENTRAL",
  เหนือ: "NORTH",
  อีสาน: "NORTHEAST",
  ใต้: "SOUTH",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ word: string }> },
) {
  try {
    const { word } = await context.params;
    const decodedWord = decodeURIComponent(word || "").trim();

    if (!decodedWord) {
      return NextResponse.json(
        { error: "Word parameter is required" },
        { status: 400 },
      );
    }

    const group = getDialectGroup(decodedWord);

    if (!group) {
      return NextResponse.json(
        {
          standardWord: decodedWord,
          mappings: [],
          message: `ไม่พบข้อมูลภาษาถิ่นสำหรับคำว่า '${decodedWord}'`,
        },
        { status: 404 },
      );
    }

    const mappings = group.dialects.map((d) => ({
      word: d.word,
      region: d.region,
      regionCode: REGION_CODES[d.region] ?? "OTHER",
      phonetic: d.phonetic ?? "",
      meaning: d.meaning,
      confidence: d.provenance === "official" ? 1.0 : 0.75,
      type: d.provenance === "official" ? "OFFICIAL" : "AI_INFERRED",
      culturalNotes: d.culturalNotes ?? null,
      source: d.source,
    }));

    return NextResponse.json({
      standardWord: group.standardWord,
      category: group.category,
      categoryLabel: group.categoryLabel,
      mappings,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to map dialect terms" },
      { status: 500 },
    );
  }
}
