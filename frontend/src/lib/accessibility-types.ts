export type ProvenanceType =
  | "OFFICIAL_ROYAL_TRANSLITERATION"
  | "OFFICIAL_ROYAL_COINED"
  | "AI_GENERATED"
  | "OFFICIAL_CURATED"
  | string;

export interface TranslationItem {
  translatedWord: string;
  languageCode: string;
  secondaryTranslations?: string[];
  contextualExplanation?: string;
  usageNuance?: string;
  provenance: ProvenanceType;
  confidenceScore?: number;
}

export interface SignMedia {
  mediaType: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
}

export interface SignLanguageEntry {
  signName: string;
  handshapeDescription?: string;
  dialectRegion?: string;
  verificationStatus?: string;
  sourceAttribution?: string;
  license?: string;
  media: SignMedia[];
}

export const PROVENANCE_ORDER: Record<string, number> = {
  OFFICIAL_ROYAL_TRANSLITERATION: 1,
  OFFICIAL_ROYAL_COINED: 2,
  OFFICIAL_CURATED: 3,
  AI_GENERATED: 10,
};

export function sortTranslations(entries: TranslationItem[]): TranslationItem[] {
  return [...entries].sort((a, b) => {
    const orderA = PROVENANCE_ORDER[a.provenance] ?? 5;
    const orderB = PROVENANCE_ORDER[b.provenance] ?? 5;
    if (orderA !== orderB) return orderA - orderB;
    return (b.confidenceScore ?? 0) - (a.confidenceScore ?? 0);
  });
}

export interface BrailleCell {
  char: string;
  braille: string; // Unicode Braille character (e.g. ⠏)
  dots: number[]; // Array of dot numbers [1..6]
  role: "consonant" | "vowel" | "tone" | "symbol" | "other";
  description: string;
}

export interface BrailleData {
  word: string;
  brailleUnicode: string;
  brailleCells: BrailleCell[];
  readingGuide?: string;
  audioText?: string;
  sourceAttribution?: string;
  verificationStatus?: string;
}

export interface DecodedBrailleCell {
  braille: string; // Unicode Braille character (e.g. ⠏)
  dots: number[]; // Array of dot numbers [1..6]
  char: string; // Primary decoded Thai character (e.g. 'ป')
  alternatives?: string[]; // Alternative characters sharing the same dots (e.g. ['ฉ', 'ฌ'])
  role: "consonant" | "vowel" | "tone" | "symbol" | "other";
  description: string;
}

export interface DecodedBrailleResult {
  brailleInput: string;
  decodedText: string;
  cells: DecodedBrailleCell[];
  readingGuide: string;
  hasAmbiguity: boolean;
}

export type AccessibilityProfile = "auto" | "text" | "audio" | "sign" | "braille";

export interface AccessibilityWordRepresentation {
  word: string;
  audio: {
    available: boolean;
    phonetic?: string;
    locale?: string;
  };
  signLanguage: {
    available: boolean;
    status: "VERIFIED" | "EXTERNAL_RESOURCE" | "NOT_AVAILABLE" | "PENDING_REVIEW";
    resource?: any;
  };
  braille: {
    available: boolean;
    unicode: string;
    cellsCount: number;
    readingGuide?: string;
    sourceAttribution?: string;
  };
  governance?: {
    isDeterministic: boolean;
    aiGeneratedSign: boolean;
    aiGeneratedBraille: boolean;
    standard: string;
  };
}

export interface BrailleConvertResponse {
  text: string;
  brailleUnicode: string;
  cellsCount: number;
  cells: BrailleCell[];
  readingGuide: string;
  sourceAttribution?: string;
  verificationStatus?: string;
  export: {
    rawUnicode: string;
    textWithBraille: string;
    accessibleFormat: string;
  };
}

export interface AccessibilityCheckItem {
  id: string;
  category: "SIGN_LANGUAGE" | "BRAILLE" | "SCREEN_READER" | "READABILITY";
  title: string;
  status: "PASS" | "WARN" | "INFO";
  detail: string;
  recommendation?: string;
}

export interface AccessibilityCheckResponse {
  text: string;
  readinessScore: number;
  readinessRating: "HIGH" | "MODERATE" | "NEEDS_IMPROVEMENT";
  disclaimer: string;
  detectedSignTerms: Array<{
    word: string;
    status: string;
    hasMotion: boolean;
    signName?: string;
  }>;
  braille: {
    unicode: string;
    cellsCount: number;
    readingGuide: string;
  };
  checklist: AccessibilityCheckItem[];
  suggestedImprovements: string[];
}


