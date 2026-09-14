import { parseResponse, type SearchResponse } from "./search-types";
export async function searchMeaning(
  query: string,
  signal: AbortSignal,
): Promise<SearchResponse> {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]),
  });
  if (!response.ok) throw new Error("ขณะนี้ค้นหาไม่ได้ กรุณาลองอีกครั้ง");
  const raw = await response.json();
  return parseResponse(
    raw,
    raw.mode === "demo" || raw.mode === "fallback" ? raw.mode : "live",
  );
}
