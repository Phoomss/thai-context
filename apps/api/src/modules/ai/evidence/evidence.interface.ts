export interface Evidence {
  id: string;
  word: string;
  source: string;
  sourceType:
    | 'OFFICIAL'
    | 'EXTERNAL'
    | 'USER'
    | 'AI_GENERATED'
    | 'AI_INFERRED';
  edition?: string;
  definition?: string;
  example?: string;
  relevanceScore?: number;
  verified: boolean;
}
