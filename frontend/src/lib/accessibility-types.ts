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
