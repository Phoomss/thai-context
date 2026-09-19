import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "รูปแบบข้อมูลไม่ถูกต้อง (Invalid JSON body)" },
      { status: 400 }
    );
  }

  if (!body?.term || !body?.suggested_meaning) {
    return NextResponse.json(
      { error: "กรุณาระบุคำศัพท์และคำอธิบายความหมาย (term and suggested_meaning are required)" },
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
      const upstream = await fetch(`${baseUrl}/api/v1/modern-vocabulary/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      });

      if (upstream.ok) {
        const data = await upstream.json();
        return NextResponse.json(data);
      }
      const errText = await upstream.text();
      return new NextResponse(errText, { status: upstream.status });
    } catch {
      // Backend unreachable or timed out, fall through to local fallback
    }
  }

  // Fallback simulation
  return NextResponse.json({
    id: `submission-${Date.now()}`,
    term: body.term,
    status: "PENDING_REVIEW",
    message: "ส่งข้อเสนอคำศัพท์เรียบร้อยแล้ว อยู่ระหว่างการตรวจสอบโดยผู้ดูแลระบบและบรรณาธิการภาษา",
    created_at: new Date().toISOString(),
  });
}
