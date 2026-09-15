export type SpeakerGender = "male" | "female";
export type TranslateDirection = "en-th" | "th-en" | "auto";

export interface ToneInfo {
  syllable: string;
  tone: "mid" | "low" | "falling" | "high" | "rising";
  symbol: string; // '—', '↘', '∧', '↗', '∨'
  labelThai: string; // 'สามัญ', 'เอก', 'โท', 'ตรี', 'จัตวา'
  description: string;
}

export interface GenderVariant {
  male: {
    text: string;
    rtgs: string;
    particle: string; // 'ครับ (khrap)'
  };
  female: {
    text: string;
    rtgs: string;
    particle: string; // 'ค่ะ / คะ (kha)'
  };
}

export interface CulturalEtiquette {
  category: "GREETING" | "FOOD" | "TRAVEL" | "SHOPPING" | "HEALTH" | "BUSINESS" | "CULTURE" | "GENERAL";
  politenessNote: string;
  waiGuidance?: string;
  krengJaiFactor?: string;
  registerDifference?: string;
  situationalTips?: string[];
}

export interface ExampleSentence {
  th: string;
  en: string;
  rtgs: string;
}

export interface TranslateResult {
  sourceText: string;
  sourceLanguage: "en" | "th";
  targetLanguage: "en" | "th";
  translatedText: string;
  thaiScript: string;
  englishGloss: string;
  phoneticRtgs: string;
  phoneticIpa?: string;
  syllables: string[];
  tones: ToneInfo[];
  genderVariants?: GenderVariant;
  secondaryMeanings?: string[];
  culturalEtiquette: CulturalEtiquette;
  examples: ExampleSentence[];
  provenance: "OFFICIAL_CURATED" | "OFFICIAL_ROYAL_COINED" | "OFFICIAL_ROYAL_TRANSLITERATION" | "AI_INFERRED";
  confidenceScore: number;
}

export interface PresetPhrase {
  id: string;
  en: string;
  th: string;
  rtgs: string;
  category: "greetings" | "food" | "transport" | "shopping" | "emergency" | "business";
  tones: string;
  tag: string;
  culturalHint: string;
}
