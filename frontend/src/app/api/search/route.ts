import { mockSearch } from "@/lib/mock-search";
import { parseResponse } from "@/lib/search-types";
export async function POST(request: Request) {
  let query: unknown;
  try {
    query = (await request.json()).query;
  } catch {
    return Response.json({ error: "รูปแบบคำค้นไม่ถูกต้อง" }, { status: 400 });
  }
  if (typeof query !== "string" || !query.trim() || query.length > 600)
    return Response.json(
      { error: "กรุณาระบุความหมาย 1–600 ตัวอักษร" },
      { status: 400 },
    );
  query = query.trim();
  const endpoint =
    process.env.THAI_CONTEXT_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  const forceMock =
    process.env.THAI_CONTEXT_USE_MOCK === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCK === "true";
  if (!endpoint || forceMock)
    return Response.json(mockSearch(query as string), {
      headers: { "Cache-Control": "no-store" },
    });
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      cache: "no-store",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(7000)]),
    });
    if (!response.ok) throw new Error("Upstream unavailable");
    return Response.json(parseResponse(await response.json()), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(mockSearch(query as string, "fallback"), {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
