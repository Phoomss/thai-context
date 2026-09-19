export type ModernTermType =
  | 'WORD'
  | 'PHRASE'
  | 'SLANG'
  | 'ACRONYM'
  | 'COMPOUND'
  | 'LOANWORD';

export type ModernTermStatus =
  | 'EMERGING'
  | 'TRENDING'
  | 'COMMON'
  | 'DECLINING'
  | 'HISTORICAL'
  | 'SPECIALIZED';

export type ModernTermOrigin =
  | 'INTERNET_SLANG'
  | 'ENGLISH_BORROWING'
  | 'CHINESE_BORROWING'
  | 'JAPANESE_BORROWING'
  | 'KOREAN_BORROWING'
  | 'SUB_CULTURE'
  | 'TECH_INNOVATION'
  | 'WORKPLACE'
  | 'MEDIA_POP'
  | 'NEOLOGISM'
  | 'OTHER';

export type ModernTermRegister =
  | 'SLANG'
  | 'INFORMAL'
  | 'NEUTRAL'
  | 'SEMI_FORMAL'
  | 'FORMAL'
  | 'SPECIALIZED'
  | 'TABOO';

export type ModernTermAudience =
  | 'GENERAL'
  | 'YOUTH'
  | 'GAMER'
  | 'TECHNICAL'
  | 'CORPORATE'
  | 'LGBTQPLUS'
  | 'FANDOM'
  | 'OTHER';

export interface ModernTermSource {
  id?: string;
  source_type: 'WEB' | 'SOCIAL' | 'NEWS' | 'RESEARCH' | 'COMMUNITY' | 'OFFICIAL_SURVEY' | 'DEMO';
  source_name: string;
  source_url?: string | null;
  source_date?: string | null;
  excerpt?: string | null;
  license?: string | null;
  verification_status: 'UNVERIFIED' | 'VERIFIED' | 'DISPUTED';
}

export interface ModernTermDefinition {
  id?: string;
  definition: string;
  definition_type: 'SOURCE_DEFINED' | 'AI_GENERATED' | 'EDITOR_REVIEWED' | 'COMMUNITY_DEFINED';
  domain?: string | null;
  generated_by?: string | null;
  model_version?: string | null;
  prompt_template?: string | null;
  verified: boolean;
}

export interface ModernTermExample {
  id?: string;
  example_text: string;
  context_note?: string | null;
  source_attribution?: string | null;
  register?: string | null;
}

export interface ModernTermRelationship {
  id?: string;
  target_type: 'MODERN' | 'OFFICIAL' | 'DIALECT';
  target_id: string;
  target_headword?: string;
  relationship_type:
    | 'FORMAL_EQUIVALENT'
    | 'SYNONYM'
    | 'ANTONYM'
    | 'HYPONYM'
    | 'HYPERNYM'
    | 'SLANG_COUNTERPART'
    | 'BORROWED_FROM';
  note?: string | null;
  is_inferred: boolean;
  confidence: number;
}

export interface ModernTermOfficialComparison {
  word: string;
  found_in_official: boolean;
  relationship: 'BOTH' | 'MODERN_ONLY';
  editions: Array<{
    edition_year: string;
    edition_title?: string;
    source?: string;
    status?: string;
    definitions?: Array<{ text: string; pos: string | null }>;
  }>;
  note: string;
}

export interface ForeignerSupport {
  pronunciation: string | null;
  transliteration: string | null;
  english_meaning: string | null;
  usage_guidance: string | null;
}

export interface ModernTerm {
  id: string;
  term: string;
  slug: string;
  language: string;
  term_type: ModernTermType | string;
  categories: string[];
  status: ModernTermStatus | string;
  origin: ModernTermOrigin | string;
  register: ModernTermRegister | string;
  audience: ModernTermAudience | string;
  description: string;
  first_seen_at?: string | null;
  last_seen_at?: string | null;
  confidence: number;
  transliteration?: string | null;
  english_meaning?: string | null;
  pronunciation?: string | null;
  usage_warning?: string | null;
  official_word_id?: string | null;
  sources?: ModernTermSource[];
  definitions?: ModernTermDefinition[];
  examples?: ModernTermExample[];
  relationships?: ModernTermRelationship[];
  foreigner_support?: ForeignerSupport;
  official_comparison?: ModernTermOfficialComparison | null;
  created_at?: string;
  updated_at?: string;
}

export interface ModernTermListResponse {
  items: ModernTerm[];
  total: number;
  page: number;
  limit: number;
  categories: Array<{ category: string; count: number }>;
}

export interface ModernTermSubmission {
  term: string;
  suggested_meaning: string;
  category?: string;
  context_sentence?: string;
  source_reference?: string;
  submitter_name?: string;
  submitter_email?: string;
}

export interface ModernCompareResult {
  modern_term: {
    term: string;
    status: string;
    register: string;
    categories: string[];
    origin: string;
    primary_definition: string;
    sources: ModernTermSource[];
    warning?: string | null;
  };
  formal_term: {
    headword: string;
    is_official: boolean;
    editions: Array<{
      edition_year: string;
      title?: string;
      source?: string;
      definitions: string[];
    }>;
  };
  comparison: {
    relationship: string;
    usage_recommendation: string;
    formality_comparison: string;
    when_to_use_modern: string;
    when_to_use_formal: string;
  };
}
