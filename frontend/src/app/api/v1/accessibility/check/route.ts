import { NextRequest, NextResponse } from "next/server";
import { encodeThaiToBraille } from "@/lib/braille-encoder";
import { SIGN_CATALOG, getSignResource } from "@/lib/sign-motion-data";

export interface AccessibilityCheckItem {
  id: string;
  category: "SIGN_LANGUAGE" | "BRAILLE" | "SCREEN_READER" | "READABILITY";
  title: string;
  status: "PASS" | "WARN" | "INFO";
  detail: string;
  recommendation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json(
        { error: "Text is required for accessibility check" },
        { status: 400 }
      );
    }

    // 1. Detect sign language keywords from SIGN_CATALOG
    const detectedSignTerms: Array<{
      word: string;
      status: string;
      hasMotion: boolean;
      signName?: string;
    }> = [];

    for (const word of Object.keys(SIGN_CATALOG)) {
      if (text.includes(word)) {
        const item = SIGN_CATALOG[word];
        detectedSignTerms.push({
          word,
          status: item.status,
          hasMotion: item.representation?.type === "MOTION",
          signName: item.metadata?.sign_name,
        });
      }
    }

    // 2. Deterministic Braille encoding
    const brailleData = encodeThaiToBraille(text);

    // 3. Screen reader & structure evaluation
    const checkItems: AccessibilityCheckItem[] = [];

    // Check A: Sign language terms detection
    if (detectedSignTerms.length > 0) {
      checkItems.push({
        id: "tsl-terms-found",
        category: "SIGN_LANGUAGE",
        title: "พบคำศัพท์ที่มีข้อมูลภาษามือไทยที่ผ่านการรับรอง",
        status: "PASS",
        detail: `ตรวจพบ ${detectedSignTerms.length} คำศัพท์สำคัญที่มีท่าภาษามือไทยรองรับ: ${detectedSignTerms.map(t => t.word).join(", ")}`,
      });
    } else {
      checkItems.push({
        id: "tsl-terms-none",
        category: "SIGN_LANGUAGE",
        title: "ไม่พบคำศัพท์หลักในคลังภาษามือไทยปัจจุบัน",
        status: "INFO",
        detail: "ข้อความนี้ใช้คำศัพท์ที่ยังไม่มีในสารบบท่าทาง 3 มิติ แต่สามารถสะกดนิ้วมือ (Fingerspelling) หรืออ้างอิงผ่านล่ามได้",
      });
    }

    // Check B: Braille readiness
    if (brailleData.brailleUnicode && brailleData.brailleUnicode.length > 0) {
      checkItems.push({
        id: "braille-encoded",
        category: "BRAILLE",
        title: "รองรับการแปลงเป็นอักษรเบรลล์ไทย (Unicode Braille)",
        status: "PASS",
        detail: `แปลงข้อความเป็นรหัสอักษรเบรลล์มาตรฐานสำเร็จ (${brailleData.brailleCells.length} เซลล์)`,
      });
    }

    // Check C: Screen Reader Spacing & Pauses
    const spaceCount = (text.match(/\s+/g) || []).length;
    const charCount = text.length;
    const hasPunctuationOrSpace = spaceCount > 0 || /[,.!?\n]/.test(text);

    if (charCount > 80 && !hasPunctuationOrSpace) {
      checkItems.push({
        id: "screen-reader-spacing",
        category: "SCREEN_READER",
        title: "ข้อความยาวต่อเนื่องโดยไม่มีการเว้นวรรคเพื่อหยุดหายใจของ Screen Reader",
        status: "WARN",
        detail: "โปรแกรมอ่านจอภาพ (TTS / Screen Reader) จะอ่านข้อความต่อเนื่องโดยไม่หยุดพัก ซึ่งอาจทำให้ผู้พิการทางการมองเห็นจับใจความได้ยาก",
        recommendation: "เพิ่มการเว้นวรรคระหว่างวรรคตอนหรือประโยคย่อย เพื่อให้โปรแกรมอ่านจอภาพหยุดพักอย่างเป็นธรรมชาติ",
      });
    } else {
      checkItems.push({
        id: "screen-reader-flow",
        category: "SCREEN_READER",
        title: "จังหวะวรรคตอนเหมาะสมกับการอ่านด้วย Screen Reader",
        status: "PASS",
        detail: "มีการจัดวรรคตอนหรือความยาวเหมาะสม ช่วยให้สังเคราะห์เสียงได้ชัดเจน",
      });
    }

    // Check D: Readability & Jargon Check
    const complexIndicators = ["ทั้งนี้", "อนึ่ง", "ดังกล่าวข้างต้น", "เป็นที่ประจักษ์"];
    const foundComplex = complexIndicators.filter(w => text.includes(w));
    if (foundComplex.length > 0) {
      checkItems.push({
        id: "readability-bureaucratic",
        category: "READABILITY",
        title: "มีคำเชื่อมแบบทางการ/สำนวนราชการ",
        status: "INFO",
        detail: `ตรวจพบคำเชื่อมแบบทางการ (${foundComplex.join(", ")}) อาจพิจารณาปรับให้กระชับหากต้องการให้เข้าถึงง่ายขึ้น (Plain Language)`,
        recommendation: "หากเป็นเอกสารเพื่อประชาชนทั่วไป ให้ใช้ภาษาที่เรียบง่าย เข้าใจง่าย",
      });
    }

    // 4. Calculate Accessibility Readiness Score (0-100)
    let score = 70; // baseline
    if (detectedSignTerms.length > 0) score += 15;
    if (brailleData.brailleUnicode) score += 10;
    if (checkItems.some(item => item.status === "WARN")) score -= 15;
    score = Math.min(100, Math.max(10, score));

    return NextResponse.json({
      text,
      readinessScore: score,
      readinessRating: score >= 85 ? "HIGH" : score >= 60 ? "MODERATE" : "NEEDS_IMPROVEMENT",
      disclaimer: "การประเมินความพร้อมในการเข้าถึง (Accessibility Readiness) เป็นเครื่องมือช่วยตรวจทานเบื้องต้นตามแนวทาง WCAG & มคอ. ไม่ใช่การรับรองทางกฎหมายอย่างเป็นทางการ",
      detectedSignTerms,
      braille: {
        unicode: brailleData.brailleUnicode,
        cellsCount: brailleData.brailleCells.length,
        readingGuide: brailleData.readingGuide,
      },
      checklist: checkItems,
      suggestedImprovements: checkItems
        .filter(item => item.recommendation)
        .map(item => item.recommendation as string),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to analyze accessibility" },
      { status: 500 }
    );
  }
}
