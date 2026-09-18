import { NextRequest, NextResponse } from "next/server";
import { findModernTerm } from "@/lib/modern-vocabulary-store";
import { lookupOfficialDefinition } from "@/lib/dictionary-store";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const modernTerm = (searchParams.get("modern_term") || searchParams.get("termA") || "").trim();
  const formalTerm = (searchParams.get("formal_term") || searchParams.get("termB") || "").trim();

  if (!modernTerm || !formalTerm) {
    return NextResponse.json(
      { error: "กรุณาระบุ modern_term และ formal_term สำหรับการเปรียบเทียบ" },
      { status: 400 }
    );
  }

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
        `${baseUrl}/api/v1/modern-vocabulary/compare?modern_term=${encodeURIComponent(modernTerm)}&formal_term=${encodeURIComponent(formalTerm)}`,
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

  // Fallback compare resolution
  const mTerm = findModernTerm(modernTerm);
  const oDef = lookupOfficialDefinition(formalTerm);

  return NextResponse.json({
    modern_term: {
      term: modernTerm,
      status: mTerm?.status || "COMMON",
      register: mTerm?.register || "INFORMAL",
      categories: mTerm?.categories || ["ภาษาร่วมสมัย"],
      origin: mTerm?.origin || "INTERNET_SLANG",
      primary_definition:
        mTerm?.definitions?.[0]?.definition ||
        mTerm?.description ||
        `คำภาษาร่วมสมัยที่มีความหมายใกล้เคียงกับ "${formalTerm}"`,
      sources: mTerm?.sources || [],
      warning: mTerm?.usage_warning || "คำนี้เป็นภาษาร่วมสมัย ควรพิจารณาบริบทความเหมาะสมก่อนใช้ในงานวิชาการ",
    },
    formal_term: {
      headword: formalTerm,
      is_official: !!oDef,
      editions: oDef
        ? [
            {
              edition_year: oDef.edition || "2554",
              title: `พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ${oDef.edition || "2554"}`,
              source: oDef.source || "สำนักงานราชบัณฑิตยสภา",
              definitions: [oDef.definition],
            },
          ]
        : [],
    },
    comparison: {
      relationship: "FORMAL_EQUIVALENT",
      usage_recommendation: `คำว่า "${modernTerm}" นิยมใช้ในภาษาพูดและสื่อสังคมออนไลน์ สำหรับบริบททางการ เอกสารราชการ หรือบทความวิชาการ แนะนำให้ใช้คำว่า "${formalTerm}"`,
      formality_comparison: `"${formalTerm}" มีระดับความเป็นทางการสูงกว่า เหมาะกับงานเขียนที่เป็นทางการ ส่วน "${modernTerm}" เหมาะกับการสื่อสารทั่วไปที่เป็นกันเอง`,
      when_to_use_modern: `ใช้ "${modernTerm}" เมื่อต้องการความเป็นธรรมชาติ สื่อสารบนโซเชียลมีเดีย หรือพูดคุยในชีวิตประจำวัน`,
      when_to_use_formal: `ใช้ "${formalTerm}" ในเอกสารทางการ รายงานวิชาการ การนำเสนอระดับมืออาชีพ หรือเมื่อต้องการความชัดเจนตามหลักภาษามาตรฐาน`,
    },
  });
}
