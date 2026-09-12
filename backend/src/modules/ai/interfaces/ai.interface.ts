export interface ParsedQueryIntent {
  raw_query: string;
  detected_meaning: string;
  context: string;
  excluded_words: string[];
  target_register?: 'formal' | 'informal' | 'poetic' | 'slang' | 'all';
}

export interface CandidateSearchHit {
  word_id: string;
  headword: string;
  pos: string;
  definition: string;
  edition_year: number;
  edition_name: string;
  page_number: number;
  cosine_distance: number;
  dense_rank: number;
  sparse_rank: number;
  rrf_score: number;
}

export interface GroundedEvidence {
  source_book: string;
  edition_year: number;
  page_number: number;
  exact_quote: string;
  is_official: boolean;
}

export interface RecommendedWordOutput {
  headword: string;
  pos: string;
  match_score: number;
  official_definition: string;
  edition_name: string;
  ai_explanation: string;
  evidence: GroundedEvidence;
}

export interface AISearchResult {
  query_understanding: ParsedQueryIntent;
  recommendations: RecommendedWordOutput[];
  guardrail: {
    passed: boolean;
    confidence_score: number;
    abstention_triggered: boolean;
    message?: string;
  };
}
