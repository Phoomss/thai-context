import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.word || !body.source_url) {
      return NextResponse.json(
        { error: "word และ source_url จำเป็นต้องระบุ" },
        { status: 400 }
      );
    }

    // Community submissions are strictly saved with PENDING_REVIEW
    // and never published directly without expert verification
    const submission = {
      id: `contrib-${Date.now()}`,
      word: body.word.trim(),
      source_url: body.source_url.trim(),
      provider_name: body.provider_name ? body.provider_name.trim() : null,
      notes: body.notes ? body.notes.trim() : null,
      source_type: "USER_SUBMISSION",
      verification_status: "PENDING_REVIEW",
      permission_status: "PENDING",
      submitted_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        status: "PENDING_REVIEW",
        message: "ข้อเสนอแหล่งข้อมูลภาษามือถูกบันทึกเพื่อรอการตรวจสอบจากผู้เชี่ยวชาญแล้ว",
        submission,
      },
      { status: 202 }
    );
  } catch {
    return NextResponse.json(
      { error: "รูปแบบข้อมูลไม่ถูกต้อง" },
      { status: 400 }
    );
  }
}
