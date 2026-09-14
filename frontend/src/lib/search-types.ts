export type Evidence = {
  source_book: string;
  edition?: string;
  edition_year?: number;
  page_number?: number;
  quote: string;
  is_official?: boolean;
};
export type Recommendation = {
  id?: string;
  headword: string;
  score?: number;
  pos?: string;
  definition: string;
  ai_explanation?: string;
  contextual_explanation?: string;
  examples?: string[];
  pronunciation?: { phonetic?: string; audio_url?: string; locale?: string };
  related_words?: { id?: string; headword: string; relation?: string }[];
  canonical_url?: string;
  sources?: Evidence[];
  registers?: string[];
  contexts?: string[];
  evidence?: Evidence;
  comparison?: {
    emphasis: string;
    use_when: string;
    example: string;
    common_confusion: string;
  };
};
export type SearchResponse = {
  query_understanding: {
    raw_query: string;
    detected_meaning: string;
    context?: string;
    excluded_words?: string[];
  };
  recommendations: Recommendation[];
  mode: "live" | "demo" | "fallback";
  notice?: string;
};
const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const strings = (v: unknown) =>
  v === undefined ||
  (Array.isArray(v) && v.every((x) => typeof x === "string"));
export function parseResponse(
  value: unknown,
  mode: SearchResponse["mode"] = "live",
): SearchResponse {
  if (!object(value)) throw new Error("Invalid search response");
  const data = object(value.data) ? value.data : value;
  const q = data.query_understanding;
  if (
    !object(q) ||
    typeof q.raw_query !== "string" ||
    typeof q.detected_meaning !== "string" ||
    (q.context !== undefined && typeof q.context !== "string") ||
    !strings(q.excluded_words) ||
    !Array.isArray(data.recommendations)
  )
    throw new Error("Invalid search response");
  for (const r of data.recommendations) {
    if (
      !object(r) ||
      typeof r.headword !== "string" ||
      typeof r.definition !== "string" ||
      (r.score !== undefined && (typeof r.score !== "number" ||
      !Number.isFinite(r.score) || r.score < 0 || r.score > 1)) ||
      !strings(r.registers) ||
      !strings(r.contexts) || !strings(r.examples)
    )
      throw new Error("Invalid recommendation");
    for (const key of ["id", "pos", "ai_explanation", "contextual_explanation", "canonical_url"])
      if (r[key] !== undefined && typeof r[key] !== "string")
        throw new Error("Invalid text");
    if (r.pronunciation !== undefined) {
      const p = r.pronunciation;
      if (!object(p) || ["phonetic", "audio_url", "locale"].some(k => p[k] !== undefined && typeof p[k] !== "string"))
        throw new Error("Invalid pronunciation");
      if (typeof p.audio_url === "string" && !/^(https?:\/\/|\/(?!\/))/.test(p.audio_url))
        throw new Error("Invalid audio URL");
    }
    if (r.related_words !== undefined && (!Array.isArray(r.related_words) || r.related_words.some(w =>
      !object(w) || typeof w.headword !== "string" || ["id", "relation"].some(k => w[k] !== undefined && typeof w[k] !== "string"))))
      throw new Error("Invalid related words");
    if (r.sources !== undefined && !Array.isArray(r.sources)) throw new Error("Invalid sources");
    const sources = [...(r.sources ?? []) as unknown[], ...(r.evidence === undefined ? [] : Array.isArray(r.evidence) ? r.evidence : [r.evidence])];
    for (const e of sources) {
      if (
        !object(e) ||
        typeof e.source_book !== "string" ||
        typeof e.quote !== "string" ||
        (e.is_official !== undefined && typeof e.is_official !== "boolean") ||
        (e.edition !== undefined && typeof e.edition !== "string") ||
        ["page_number", "edition_year"].some(
          (k) =>
            e[k] !== undefined &&
            (typeof e[k] !== "number" || !Number.isFinite(e[k])),
        )
      )
        throw new Error("Invalid evidence");
    }
    if (r.comparison !== undefined) {
      const c = r.comparison;
      if (
        !object(c) ||
        ["emphasis", "use_when", "example", "common_confusion"].some(
          (key) => typeof c[key] !== "string",
        )
      )
        throw new Error("Invalid comparison profile");
    }
  }
  return {
    query_understanding: q,
    recommendations: data.recommendations.map(r => {
      const sources = Array.isArray(r.evidence) ? r.evidence : r.sources ?? (r.evidence ? [r.evidence] : []);
      return { ...r, evidence: sources[0], sources };
    }),
    mode,
    notice: typeof data.notice === "string" ? data.notice : undefined,
  } as SearchResponse;
}
