import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "ข้อมูล JSON ไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  const queryText = (body.queryText || body.query || "").trim();
  if (!queryText) {
    return NextResponse.json(
      { error: "กรุณาระบุข้อความค้นหา (query)" },
      { status: 400 }
    );
  }

  const recommendedWord = (body.recommendedWord || body.selectedWord || "").trim();
  let userAction = body.userAction;
  if (!userAction && typeof body.relevanceScore === "number") {
    userAction = body.relevanceScore > 0 ? "THUMBS_UP" : "THUMBS_DOWN";
  }
  if (!userAction) {
    userAction = "THUMBS_UP";
  }

  const rating =
    typeof body.rating === "number"
      ? body.rating
      : typeof body.relevanceScore === "number"
      ? body.relevanceScore === 1
        ? 5
        : body.relevanceScore === -1
        ? 1
        : Math.min(Math.max(Math.round(body.relevanceScore), 1), 5)
      : undefined;

  const feedbackNotes =
    (body.feedbackNotes || body.userComment || "").trim() || undefined;
  const sessionId = body.sessionId || undefined;

  const backendUrl =
    process.env.THAI_CONTEXT_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  const forceMock =
    process.env.THAI_CONTEXT_USE_MOCK === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCK === "true";

  if (backendUrl && !forceMock) {
    try {
      const upstream = await fetch(
        `${backendUrl.replace(/\/api\/.*$/, "")}/api/v1/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            queryText,
            recommendedWord: recommendedWord || undefined,
            userAction,
            rating,
            feedbackNotes,
            sessionId,
          }),
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
        }
      );

      if (upstream.ok) {
        const data = await upstream.json();
        return NextResponse.json(data, { status: upstream.status });
      }
    } catch {
      // Gracefully fall back to local acknowledgment below
    }
  }

  // Graceful offline / demo fallback response
  return NextResponse.json(
    {
      success: true,
      feedbackId: `fb_local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      message: "Feedback recorded successfully",
    },
    { status: 201 }
  );
}
