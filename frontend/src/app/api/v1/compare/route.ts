import { normalizeCompareWords } from "@/lib/compare-types";

function apiBaseUrl(): string {
  const configured =
    process.env.THAI_CONTEXT_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001/api/v1";
  const origin = configured
    .trim()
    .replace(/\/api\/.*$/, "")
    .replace(/\/+$/, "");
  return `${origin}/api/v1`;
}

const errorResponse = (message: string, status: number) =>
  Response.json(
    { success: false, error: { message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );

export async function POST(request: Request) {
  let words: unknown;
  try {
    const body: unknown = await request.json();
    words =
      typeof body === "object" && body !== null && "words" in body
        ? body.words
        : undefined;
  } catch {
    return errorResponse("รูปแบบข้อมูลเปรียบเทียบไม่ถูกต้อง", 400);
  }

  if (!Array.isArray(words) || !words.every((word) => typeof word === "string")) {
    return errorResponse("กรุณาระบุคำภาษาไทย 2–5 คำ", 400);
  }

  let normalized: string[];
  try {
    normalized = normalizeCompareWords(words);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "ข้อมูลเปรียบเทียบไม่ถูกต้อง",
      400,
    );
  }

  const timeout = AbortSignal.timeout(12000);
  try {
    const upstream = await fetch(`${apiBaseUrl()}/compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ words: normalized }),
      cache: "no-store",
      signal: AbortSignal.any([request.signal, timeout]),
    });
    const text = await upstream.text();
    const headers = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
    if (!text) return new Response(null, { status: upstream.status, headers });
    try {
      JSON.parse(text);
    } catch {
      return errorResponse("บริการเปรียบเทียบส่งข้อมูลไม่ถูกต้อง", 502);
    }
    return new Response(text, { status: upstream.status, headers });
  } catch {
    return errorResponse(
      timeout.aborted
        ? "บริการเปรียบเทียบใช้เวลานานเกินไป"
        : "ไม่สามารถเชื่อมต่อบริการเปรียบเทียบได้",
      timeout.aborted ? 504 : 502,
    );
  }
}
