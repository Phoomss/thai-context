import type { Recommendation } from "./search-types";
export function sharePayload(word: Recommendation, query: string, origin: string, demo: boolean) {
  const url = new URL("/", origin);
  url.searchParams.set("q", query);
  url.searchParams.set("word", word.headword);
  return {
    title: `${word.headword} — THAI CONTEXT`,
    text: `“${word.headword}”\nความหมาย: ${word.definition}\nบริบท: ${word.contexts?.join(" · ") || "ไม่ระบุ"}\nแหล่งข้อมูล: ${demo ? "ข้อมูลสาธิต THAI CONTEXT — ยังไม่รับรอง" : word.evidence?.source_book || "ยังไม่มีหลักฐานเพียงพอ"}`,
    url: url.toString(),
  };
}
