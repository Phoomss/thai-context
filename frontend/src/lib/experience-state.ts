import type { Recommendation, SearchResponse } from "./search-types";
export type ExperienceState =
  | "hero-idle"
  | "hero-search-submitting"
  | "hero-cinematic-transition"
  | "results-active"
  | "results-searching"
  | "evidence-open";
export type Experience = {
  state: ExperienceState;
  requestId: number;
  query: string;
  result: SearchResponse | null;
  staged: SearchResponse | null;
  error: string;
  stagedError: string;
  loading: boolean;
  hasResults: boolean;
  revealed: boolean;
  revision: number;
  evidence: Recommendation | null;
};
export const initialExperience: Experience = {
  state: "hero-idle",
  requestId: 0,
  query: "",
  result: null,
  staged: null,
  error: "",
  stagedError: "",
  loading: false,
  hasResults: false,
  revealed: false,
  revision: 0,
  evidence: null,
};
export type Event =
  | { type: "HERO_SEARCH" | "COMPOSER_SEARCH" | "DIRECT_SEARCH"; query: string; id: number }
  | { type: "RESOLVE"; id: number; result: SearchResponse }
  | { type: "REJECT"; id: number; error: string }
  | {
      type:
        | "CINEMATIC"
        | "WHITE"
        | "REVEAL"
        | "BACK"
        | "VIEW_RESULTS"
        | "CLOSE_EVIDENCE";
    }
  | { type: "OPEN_EVIDENCE"; word: Recommendation };
export const isCinematic = (s: ExperienceState) =>
  s === "hero-search-submitting" || s === "hero-cinematic-transition";
export function experienceReducer(s: Experience, e: Event): Experience {
  switch (e.type) {
    case "DIRECT_SEARCH":
      return { ...s, state: "results-searching", hasResults: true, revealed: true, query: e.query, requestId: e.id, loading: true, error: "" };
    case "HERO_SEARCH":
      if (s.state !== "hero-idle") return s;
      return {
        ...s,
        state: "hero-search-submitting",
        requestId: e.id,
        query: e.query,
        staged: null,
        stagedError: "",
        error: "",
        loading: true,
        revealed: false,
        evidence: null,
      };
    case "CINEMATIC":
      return s.state === "hero-search-submitting"
        ? { ...s, state: "hero-cinematic-transition" }
        : s;
    case "RESOLVE":
      if (e.id !== s.requestId) return s;
      if (isCinematic(s.state))
        return { ...s, staged: e.result, stagedError: "", loading: false };
      return {
        ...s,
        result: e.result,
        loading: false,
        error: "",
        state: s.state === "hero-idle" ? "hero-idle" : "results-active",
        revision: s.revision + 1,
      };
    case "REJECT":
      if (e.id !== s.requestId) return s;
      if (isCinematic(s.state))
        return { ...s, stagedError: e.error, loading: false };
      return {
        ...s,
        error: e.error,
        loading: false,
        state: s.state === "hero-idle" ? "hero-idle" : "results-active",
      };
    case "WHITE":
      if (!isCinematic(s.state)) return s;
      return {
        ...s,
        state: "results-active",
        hasResults: true,
        result: s.staged,
        error: s.stagedError,
        staged: null,
        revision: s.revision + 1,
      };
    case "REVEAL":
      return { ...s, revealed: true };
    case "COMPOSER_SEARCH":
      if (s.state !== "results-active" || s.loading) return s;
      return {
        ...s,
        state: "results-searching",
        requestId: e.id,
        query: e.query,
        loading: true,
        error: "",
        evidence: null,
      };
    case "BACK":
      if (isCinematic(s.state) || s.state === "evidence-open") return s;
      return {
        ...s,
        state: "hero-idle",
        loading: false,
        requestId: s.requestId + 1,
      };
    case "VIEW_RESULTS":
      return s.state === "hero-idle"
        ? { ...s, state: "results-active", hasResults: true, revealed: true }
        : s;
    case "OPEN_EVIDENCE":
      return s.state === "results-active" && !s.loading
        ? { ...s, state: "evidence-open", evidence: e.word }
        : s;
    case "CLOSE_EVIDENCE":
      return s.state === "evidence-open"
        ? { ...s, state: "results-active", evidence: null }
        : s;
  }
}
