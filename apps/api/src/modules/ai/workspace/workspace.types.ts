export type AgentTask =
  | 'WORD_DISCOVERY'
  | 'CONTEXT_ANALYSIS'
  | 'WORD_COMPARE'
  | 'WRITING'
  | 'REWRITE'
  | 'LANGUAGE_CHECK'
  | 'TRANSLATION'
  | 'EXPLANATION';

export type ContextType =
  | 'academic'
  | 'business'
  | 'government'
  | 'professional'
  | 'casual'
  | 'social'
  | 'general';

export interface ContextInfo {
  type: ContextType | string;
  tone: string;
  audience: string;
  domain?: string;
  source: 'USER_PROVIDED' | 'AI_INFERRED';
}

export interface WordRecommendation {
  word: string;
  score: number;
  pos?: string;
  definition?: string;
  reason: string;
  source?: string;
  edition?: string;
  evidence?: EvidenceItem[];
}

export interface EvidenceItem {
  source_book: string;
  edition?: string;
  edition_year?: number;
  page_number?: number;
  quote: string;
  is_official: boolean;
}

export interface WordComparisonItem {
  meaning: string;
  emphasis: string;
  use_when: string;
  example: string;
  common_confusion?: string;
}

export interface WordComparisonResult {
  wordA: string;
  wordB: string;
  details: Record<string, WordComparisonItem>;
  difference_summary: string;
  guidance: string;
  evidence: EvidenceItem[];
}

export interface GeneratedContentItem {
  type: 'sentence' | 'paragraph' | 'rewrite' | 'bullet_points';
  content: string;
  register: string;
  notes?: string;
}

export interface LanguageIssue {
  type: 'REDUNDANCY' | 'AWKWARD_WORDING' | 'WORD_MISUSE' | 'FORMALITY_MISMATCH' | 'AMBIGUITY';
  text: string;
  suggestion: string;
  rule_type: 'FACTUAL_DICTIONARY_ISSUE' | 'AI_LANGUAGE_SUGGESTION';
  description: string;
}

export interface LanguageCheckResult {
  score: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'NEEDS_IMPROVEMENT';
  issues: LanguageIssue[];
  summary: string;
}

export interface LanguageBridgeResult {
  word: string;
  english_translation: string;
  english_explanation: string;
  pronunciation: string;
  transliteration: string;
  cultural_context: string;
  example: string;
}

export interface AgentTrace {
  agent: string;
  status: 'running' | 'completed' | 'skipped';
  summary: string;
  duration_ms?: number;
}

export interface WorkspaceContext {
  sessionId: string;
  message: string;
  intent: string;
  tasks: AgentTask[];
  userContext?: { type?: string; tone?: string; audience?: string };
  inferredContext?: ContextInfo;
  selectedWords: string[];
  currentText?: string;
  previousRecommendations: WordRecommendation[];
  recommendations: WordRecommendation[];
  comparison?: WordComparisonResult | null;
  generatedContent: GeneratedContentItem[];
  languageCheck?: LanguageCheckResult | null;
  languageBridge?: LanguageBridgeResult | null;
  evidence: EvidenceItem[];
  confidence: number;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  abstained: boolean;
  abstentionReason?: string;
  agentTraces: AgentTrace[];
  history: Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>;
}

export interface WorkspaceRequestDto {
  message: string;
  session_id?: string;
  context?: {
    type?: string;
    tone?: string;
    audience?: string;
  };
  current_text?: string;
  selected_words?: string[];
}

export interface WorkspaceResponseDto {
  session_id: string;
  intent: string;
  tasks: AgentTask[];
  answer: string;
  context: ContextInfo;
  recommendations: WordRecommendation[];
  comparison?: WordComparisonResult | null;
  generated_content: GeneratedContentItem[];
  language_check?: LanguageCheckResult | null;
  language_bridge?: LanguageBridgeResult | null;
  evidence: EvidenceItem[];
  confidence: number;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
  abstained: boolean;
  abstention_reason?: string;
  agent_traces: AgentTrace[];
}
