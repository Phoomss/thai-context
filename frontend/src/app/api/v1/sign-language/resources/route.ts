import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.word && !body.word_id) {
      return NextResponse.json(
        { error: "word หรือ word_id จำเป็นต้องระบุ" },
        { status: 400 }
      );
    }

    if (!body.representation_type) {
      return NextResponse.json(
        { error: "representation_type จำเป็นต้องระบุ (MOTION | SKELETON | AVATAR | EXTERNAL_VIDEO)" },
        { status: 400 }
      );
    }

    const createdResource = {
      id: `sr-${Date.now()}`,
      word: body.word || body.word_id,
      representation_type: body.representation_type,
      source_type: body.source_type || "DEMO_DATA",
      permission_status: body.permission_status || "AUTHORIZED",
      verification_status: body.verification_status || "VERIFIED",
      source_url: body.source_url || null,
      motion_data: body.motion_data || null,
      metadata: body.metadata || {},
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        message: "บันทึกทรัพยากรภาษามือไทยเรียบร้อยแล้ว",
        resource: createdResource,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "รูปแบบข้อมูลไม่ถูกต้อง" },
      { status: 400 }
    );
  }
}
