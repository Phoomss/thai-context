const DEFAULT_TTS_ENDPOINT = "http://localhost:3001/api/v1/tts/synthesize";

const errorResponse = (message: string, status: number) =>
  Response.json(
    { success: false, error: { message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );

export async function POST(request: Request) {
  let text: unknown;
  try {
    const body: unknown = await request.json();
    text =
      typeof body === "object" && body !== null && "text" in body
        ? body.text
        : undefined;
  } catch {
    return errorResponse("รูปแบบคำที่ต้องการออกเสียงไม่ถูกต้อง", 400);
  }

  if (typeof text !== "string" || !text.trim())
    return errorResponse("กรุณาระบุคำที่ต้องการออกเสียง", 400);

  const endpoint =
    process.env.THAI_CONTEXT_TTS_API_URL ?? DEFAULT_TTS_ENDPOINT;
  const timeout = AbortSignal.timeout(8000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim() }),
      cache: "no-store",
      signal: AbortSignal.any([request.signal, timeout]),
    });

    if (!response.ok)
      return errorResponse("บริการเสียงอ่านไม่พร้อมใช้งาน", response.status);

    const payload: unknown = await response.json();
    return Response.json(payload, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return errorResponse(
      timeout.aborted
        ? "บริการเสียงอ่านใช้เวลานานเกินไป"
        : "ไม่สามารถเชื่อมต่อบริการเสียงอ่านได้",
      timeout.aborted ? 504 : 502,
    );
  }
}
