/**
 * Thai Word Scrambler Data & Sentence Utilities
 * Grounded in Royal Society Dictionary (ราชบัณฑิตยสภา ๗๗,๐๐๐+ รายการ)
 */

import type { QuirkifyWordMapping } from "./api-client";

export interface SentencePreset {
  id: string;
  text: string;
  category: string;
  label: string;
}

export const SENTENCE_PRESETS: SentencePreset[] = [
  {
    id: "p-1",
    text: "วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว",
    category: "ชีวิตประจำวัน",
    label: "เหนื่อยมากอยากนอน",
  },
  {
    id: "p-2",
    text: "หิวข้าวมาก เที่ยงนี้ไปกินอะไรกันดี",
    category: "อาหารการกิน",
    label: "หิวข้าวเที่ยง",
  },
  {
    id: "p-3",
    text: "อากาศร้อนขนาดนี้ ไม่อยากก้าวเท้าออกจากห้องเลย",
    category: "สภาพอากาศ",
    label: "อากาศร้อนอบอ้าว",
  },
  {
    id: "p-4",
    text: "ขอบใจมากนะแก ช่วยชีวิตไว้แท้ๆ",
    category: "มิตรภาพ",
    label: "ขอบคุณเพื่อนแท้",
  },
  {
    id: "p-5",
    text: "อย่าคิดมากเลย เดี๋ยวทุกอย่างก็ดีขึ้นเอง",
    category: "ความรู้สึก",
    label: "ให้กำลังใจ",
  },
  {
    id: "p-6",
    text: "เบื่องานประจำ อยากลาออกไปเปิดร้านกาแฟ",
    category: "การทำงาน",
    label: "อยากเปิดร้านกาแฟ",
  },
];

export interface DictionaryReplacementWord {
  headword: string;
  pos: string;
  definition: string;
  sourceEdition: string;
  rationale: string;
  triggerWords: string[];
}

export const DICTIONARY_REPLACEMENTS: DictionaryReplacementWord[] = [
  {
    headword: "ระโหย",
    pos: "ว.",
    definition: "อ่อนเพลียหมดกำลัง, อ่อนระโหย, อ่อนแรงลงเรื่อยๆ",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าเหนื่อยด้วยคำวิเศษณ์วรรณศิลป์อันสื่อถึงความอ่อนเพลียอย่างนุ่มนวล",
    triggerWords: ["เหนื่อย", "เพลีย", "เมื่อย", "ล้า"],
  },
  {
    headword: "จำศีล",
    pos: "ก.",
    definition: "ถือศีล, การที่สัตว์บางชนิดหลบอยู่นิ่ง ๆ ในที่พักช่วงหนึ่งเพื่อสงวนพลังงาน",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่านอนเป็นการกบดานพักผ่อนอย่างสงบเสงี่ยม",
    triggerWords: ["นอน", "หลับ", "พักผ่อน", "พัก"],
  },
  {
    headword: "โอชาหาร",
    pos: "น.",
    definition: "อาหารอันมีรสอร่อย, อาหารที่น่าพึงใจและทรงคุณค่า",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่ากินข้าวด้วยนามศัพท์อันหมายถึงอาหารอันเลิศรส",
    triggerWords: ["กินข้าว", "ข้าว", "อาหาร", "กิน", "ของกิน"],
  },
  {
    headword: "กรณียกิจ",
    pos: "น.",
    definition: "กิจที่พึงทำ, กิจธุระหรือหน้าที่การงานที่ต้องกระทำให้ลุล่วง",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่างานด้วยคำศัพท์ทางการอันทรงเกียรติ",
    triggerWords: ["งาน", "ทำงาน", "การงาน", "โปรเจกต์"],
  },
  {
    headword: "สหายสนิท",
    pos: "น.",
    definition: "เพื่อนร่วมใจ, มิตรแท้ผู้ร่วมทุกข์ร่วมสุขและเข้าใจกัน",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าแกหรือเพื่อนเป็นคำเรียกมิตรภาพอันงดงาม",
    triggerWords: ["แก", "เพื่อน", "เธอ", "มึง"],
  },
  {
    headword: "เร่าร้อน",
    pos: "ว.",
    definition: "ร้อนรุ่ม, ร้อนจัดอย่างยิ่ง, กระวนกระวายเพราะความร้อน",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าร้อนด้วยคำคุณศัพท์ที่สื่ออุณหภูมิอันเดือดพล่าน",
    triggerWords: ["ร้อน", "อบอ้าว", "ร้อนมาก"],
  },
  {
    headword: "วิตกจริต",
    pos: "น.",
    definition: "ความกังวลใจเกินกว่าเหตุ, ภาวะจิตใจที่ครุ่นคิดว้าวุ่น",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าคิดมากด้วยศัพท์จิตวิทยาและพจนานุกรม",
    triggerWords: ["คิดมาก", "กังวล", "เครียด", "ฟุ้งซ่าน"],
  },
  {
    headword: "สุคนธโอสถ",
    pos: "น.",
    definition: "เครื่องหอมและโอสถที่ให้กลิ่นหอมจรุงใจ ชวนให้สดชื่นแจ่มใส",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่ากาแฟด้วยคำโบราณหมายถึงเครื่องดื่มหอมละมุน",
    triggerWords: ["กาแฟ", "ชานม", "น้ำ", "เครื่องดื่ม"],
  },
  {
    headword: "ยาตรา",
    pos: "ก.",
    definition: "เดิน, เคลื่อนที่ไปข้างหน้าอย่างมีท่วงท่าและจังหวะ",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าเดินหรือก้าวเท้าด้วยคำกริยาวรรณคดี",
    triggerWords: ["ก้าวเท้า", "เดิน", "ออก", "ไป"],
  },
  {
    headword: "กมล",
    pos: "น.",
    definition: "ดอกบัว, จิตใจ, หัวใจอันบริสุทธิ์",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าใจด้วยคำไวพจน์เปี่ยมความหมายลึกซึ้ง",
    triggerWords: ["ใจ", "จิตใจ", "หัวใจ"],
  },
  {
    headword: "ชีวา",
    pos: "น.",
    definition: "ชีวิต, ลมหายใจ, ความเป็นอยู่",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าชีวิตด้วยคำไวพจน์กวี",
    triggerWords: ["ชีวิต", "ความเป็นอยู่"],
  },
  {
    headword: "วิจิตร",
    pos: "ว.",
    definition: "งามประณีต, งามแปลกตา, สวยสดงดงามอย่างมีชั้นเชิง",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าสวยงามด้วยคำคุณศัพท์ชั้นสูง",
    triggerWords: ["สวย", "งาม", "สวยงาม", "ดี"],
  },
  {
    headword: "อนุเคราะห์",
    pos: "ก.",
    definition: "เอื้อเฟื้อ, ช่วยเหลือด้วยความเมตตาปรานีหรือความปรารถนาดี",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าช่วยด้วยคำกริยาแสดงน้ำใจและการเกื้อกูลอย่างเป็นทางการ",
    triggerWords: ["ช่วย", "ช่วยเหลือ", "ช่วยชีวิต", "ดูแล"],
  },
  {
    headword: "นิวาสสถาน",
    pos: "น.",
    definition: "ที่อยู่, ที่พักอาศัย, เรือนพักพิงอันมั่นคง",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าบ้านหรือห้องด้วยคำนามพจนานุกรมชั้นสูง",
    triggerWords: ["บ้าน", "ห้อง", "ที่พัก", "หอพัก", "คอนโด"],
  },
  {
    headword: "บริโภค",
    pos: "ก.",
    definition: "กิน (ใช้เฉพาะอาหาร), ใช้สอยสิ่งของเครื่องอุปโภค",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่ากินด้วยคำกริยาทางการตามพจนานุกรม",
    triggerWords: ["กิน", "ดื่ม", "ทาน", "รับประทาน"],
  },
  {
    headword: "ผาสุก",
    pos: "น.",
    definition: "ความสำราญ, ความอยู่ดีมีสุข, ความสงบเรียบร้อยไร้กังวล",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าดีขึ้นด้วยคำแสดงภาวะแห่งความสุขร่มเย็น",
    triggerWords: ["ดีขึ้น", "สบาย", "ความสุข", "แฮปปี้"],
  },
  {
    headword: "เกษมศานต์",
    pos: "ว.",
    definition: "ชื่นบาน, มีความสุขสำราญ, สบายใจอย่างยิ่ง",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำบอกอารมณ์สนุกสนานด้วยคำวิเศษณ์แสดงความเบิกบานใจ",
    triggerWords: ["สนุก", "ดีใจ", "ร่าเริง", "ตื่นเต้น"],
  },
  {
    headword: "โสภา",
    pos: "ว.",
    definition: "งาม, สวยสดงดงาม, ผุดผ่องชวนมอง",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำชื่นชมด้วยคำไวพจน์ความงามคลาสสิก",
    triggerWords: ["น่ารัก", "สดใส", "น่ามอง"],
  },
  {
    headword: "ยวดยาน",
    pos: "น.",
    definition: "ยานพาหนะสำหรับขับขี่หรือใช้เดินทางสัญจร",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่ารถด้วยศัพท์ทางการตามระเบียบ",
    triggerWords: ["รถ", "ขับรถ", "นั่งรถ", "เดินทาง"],
  },
  {
    headword: "มิตรสหาย",
    pos: "น.",
    definition: "เพื่อนสนิทชิดเชื้อ, เพื่อนร่วมเป็นร่วมตาย",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าเพื่อนด้วยคำนามแสดงมิตรภาพอันเหนียวแน่น",
    triggerWords: ["เพื่อน", "มิตร", "เกลอ"],
  },
  {
    headword: "วารี",
    pos: "น.",
    definition: "น้ำ, สายน้ำ, กระแสน้ำอันใสสะอาด",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าน้ำด้วยคำไวพจน์วรรณคดี",
    triggerWords: ["น้ำ", "แม่น้ำ", "ทะเล"],
  },
  {
    headword: "สิเน่หา",
    pos: "น.",
    definition: "ความรักใคร่เสน่หา, ความผูกพันด้วยความรักอันลึกซึ้ง",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่ารักด้วยนามธรรมแห่งความผูกพัน",
    triggerWords: ["รัก", "ชอบ", "คิดถึง"],
  },
  {
    headword: "ฉับพลัน",
    pos: "ว.",
    definition: "ในทันทีทันใด, รวดเร็วชั่วพริบตาโดยมิได้คาดหมาย",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าเร็วด้วยคำวิเศษณ์แสดงความฉับไว",
    triggerWords: ["เร็ว", "ด่วน", "ทันที", "ไว"],
  },
  {
    headword: "โภคทรัพย์",
    pos: "น.",
    definition: "ทรัพย์สิ่งของเครื่องอุปโภคบริโภค, เงินทองอันพึงใช้สอย",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าเงินด้วยคำนามทางเศรษฐกิจโบราณ",
    triggerWords: ["เงิน", "ตังค์", "ทอง", "รวย"],
  },
  {
    headword: "เพลานี้",
    pos: "น.",
    definition: "เวลานี้, ขณะนี้, ช่วงเวลาปัจจุบัน",
    sourceEdition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
    rationale: "สุ่มเปลี่ยนคำว่าตอนนี้หรือวันนี้ด้วยคำบอกเวลาโบราณ",
    triggerWords: ["ตอนนี้", "วันนี้", "เวลานี้", "เดี๋ยวนี้"],
  },
];

/**
 * Find replacement info for a headword from our grounded dictionary data.
 */
export function getReplacementForHeadword(headword: string): DictionaryReplacementWord | undefined {
  const clean = headword.replace(/['"“”‘’]/g, "").trim();
  return DICTIONARY_REPLACEMENTS.find((d) => d.headword === clean);
}

/**
 * Segment a Thai sentence into words using Intl.Segmenter or fallback word boundary regex.
 */
export function segmentThaiWords(sentence: string): string[] {
  const trimmed = sentence.trim();
  if (!trimmed) return [];

  if (typeof Intl !== "undefined" && (Intl as any).Segmenter) {
    try {
      const segmenter = new (Intl as any).Segmenter("th", { granularity: "word" });
      const words: string[] = [];
      for (const item of segmenter.segment(trimmed)) {
        if (item.segment) {
          words.push(item.segment);
        }
      }
      if (words.length > 0) return words;
    } catch {
      // Fallback below
    }
  }

  // Regex fallback
  return trimmed.split(/(\s+|[，,。！？!?])/g).filter((w) => w.length > 0);
}

/**
 * Randomly shuffles the words within a Thai sentence while keeping spaces/punctuation in natural flow.
 */
export function shuffleSentenceWords(sentence: string): string {
  const tokens = segmentThaiWords(sentence);
  const isContentWord = (w: string) => !/^\s+$/.test(w) && !/^[，,。！？!?.,]+$/.test(w);
  const contentWords = tokens.filter(isContentWord);

  if (contentWords.length <= 1) return sentence;

  const shuffledWords = [...contentWords];
  for (let i = shuffledWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
  }

  if (shuffledWords.join("") === contentWords.join("") && shuffledWords.length >= 2) {
    [shuffledWords[0], shuffledWords[1]] = [shuffledWords[1], shuffledWords[0]];
  }

  let shuffleIdx = 0;
  return tokens
    .map((t) => {
      if (isContentWord(t)) {
        return shuffledWords[shuffleIdx++];
      }
      return t;
    })
    .join(" ");
}

/**
 * In-Sentence Word Scrambler:
 * Randomly substitutes 1-3 words in a sentence with grounded Royal Society Dictionary words,
 * strictly maintaining the original sentence structure.
 */
export function substituteSentenceWords(
  sentence: string,
  maxSwaps: number = 2
): {
  scrambledSentence: string;
  mappings: QuirkifyWordMapping[];
} {
  const trimmed = sentence.trim();
  if (!trimmed) {
    return { scrambledSentence: sentence, mappings: [] };
  }

  const mappings: QuirkifyWordMapping[] = [];
  let result = trimmed;

  const matchedReplacements: Array<{
    matchWord: string;
    replacement: DictionaryReplacementWord;
  }> = [];

  for (const item of DICTIONARY_REPLACEMENTS) {
    for (const trig of item.triggerWords) {
      if (result.includes(trig) && !matchedReplacements.some((m) => m.matchWord === trig)) {
        matchedReplacements.push({ matchWord: trig, replacement: item });
      }
    }
  }

  if (matchedReplacements.length === 0) {
    const words = segmentThaiWords(trimmed).filter((w) => w.length >= 2 && !/^\s+$/.test(w));
    if (words.length > 0) {
      const shuffledWords = [...words].sort(() => 0.5 - Math.random());
      const chosenWords = shuffledWords.slice(0, Math.min(maxSwaps, words.length));
      for (const cw of chosenWords) {
        const randomRepl =
          DICTIONARY_REPLACEMENTS[Math.floor(Math.random() * DICTIONARY_REPLACEMENTS.length)];
        matchedReplacements.push({ matchWord: cw, replacement: randomRepl });
      }
    }
  }

  const shuffledMatches = [...matchedReplacements].sort(() => 0.5 - Math.random());
  const selected = shuffledMatches.slice(0, maxSwaps);

  for (const item of selected) {
    if (result.includes(item.matchWord)) {
      result = result.replace(item.matchWord, `'${item.replacement.headword}'`);
      mappings.push({
        original_phrase: item.matchWord,
        replaced_word: item.replacement.headword,
        part_of_speech: item.replacement.pos,
        official_definition: item.replacement.definition,
        source_edition: item.replacement.sourceEdition,
        quirk_reason: item.replacement.rationale,
      });
    }
  }

  return {
    scrambledSentence: result,
    mappings,
  };
}

// --------------------------------------------------------------------------
// Backward-compatible cluster & challenge exports
// --------------------------------------------------------------------------

export function segmentThaiClusters(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (typeof Intl !== "undefined" && (Intl as any).Segmenter) {
    try {
      const segmenter = new (Intl as any).Segmenter("th", { granularity: "grapheme" });
      const segments: string[] = [];
      for (const item of segmenter.segment(trimmed)) {
        if (item.segment && item.segment.trim()) segments.push(item.segment);
      }
      if (segments.length > 0) return segments;
    } catch {
      // fallback
    }
  }
  const thaiClusterPattern = /[\u0E01-\u0E2E][\u0E30-\u0E3A\u0E47-\u0E4E]*/g;
  const matches = trimmed.match(thaiClusterPattern);
  return matches && matches.length > 0 ? matches : trimmed.split("");
}

export function scrambleClusters(clusters: string[]): string[] {
  if (clusters.length <= 1) return [...clusters];
  const originalStr = clusters.join("");
  let attempts = 0;
  let result = [...clusters];
  while (attempts < 10) {
    attempts++;
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    if (result.join("") !== originalStr) return result;
  }
  if (result.length >= 2) [result[0], result[1]] = [result[1], result[0]];
  return result;
}

export interface ChallengeWord {
  id: string;
  headword: string;
  pos: string;
  definition: string;
  category: "general" | "literary" | "food" | "spoonerism";
  hint?: string;
  spoonerism?: {
    puanResult: string;
    explanation: string;
    funMeaning: string;
  };
}

export const CHALLENGE_CATEGORIES = [
  { id: "general", label: "🌟 คำทั่วไป", desc: "คำศัพท์คุ้นเคยในชีวิตประจำวัน" },
  { id: "literary", label: "📜 วรรณคดี & วิจิตร", desc: "ศัพท์ไพเราะ คลังคำระดับสูง" },
  { id: "food", label: "🍜 อาหารการกิน", desc: "เมนูยอดนิยมและของอร่อยรสเลิศ" },
  { id: "spoonerism", label: "🔄 คำผวนชวนฮา", desc: "ภูมิปัญญาการผวนคำสุดคลาสสิก" },
] as const;

export const CHALLENGE_WORDS: ChallengeWord[] = [
  // --- General ---
  {
    id: "gen-1",
    headword: "สับปะรด",
    pos: "น.",
    definition: "ไม้ล้มลุก ผลมีตาโดยรอบ รสเปรี้ยวหวาน ใช้กินเป็นผลไม้หรือปรุงอาหาร",
    category: "general",
    hint: "ผลไม้ที่มีตาอยู่รอบตัว รสเปรี้ยวอมหวาน",
  },
  {
    id: "gen-2",
    headword: "กาลเวลา",
    pos: "น.",
    definition: "เวลาอันยาวนานที่ล่วงผ่านไป ช่วงเวลาที่มีการเปลี่ยนแปลงตามธรรมชาติ",
    category: "general",
    hint: "สิ่งที่เดินไปข้างหน้าเสมอและไม่มีวันย้อนกลับ",
  },
  {
    id: "gen-3",
    headword: "ความสุข",
    pos: "น.",
    definition: "ความสบายกายสบายใจ ความรื่นรมย์ยินดีในจิตใจ",
    category: "general",
    hint: "สภาวะจิตใจที่เบิกบาน ไร้ความทุกข์กังวล",
  },
  {
    id: "gen-4",
    headword: "มิตรภาพ",
    pos: "น.",
    definition: "ความเป็นเพื่อน ความผูกพันอันบริสุทธิ์และจริงใจระหว่างมิตรสหาย",
    category: "general",
    hint: "สายสัมพันธ์อันงดงามระหว่างเพื่อนแท้",
  },
  {
    id: "gen-5",
    headword: "สายรุ้ง",
    pos: "น.",
    definition: "แถบแสงสี ๗ สีโค้งบนท้องฟ้า เกิดจากการหักเหของแสงแดดผ่านละอองน้ำ",
    category: "general",
    hint: "ปรากฏการณ์ธรรมชาติเจ็ดสีบนฟ้าหลังฝนพรำ",
  },
  {
    id: "gen-6",
    headword: "ผีเสื้อ",
    pos: "น.",
    definition: "แมลงมีปีกสองคู่ ปีกมีเกล็ดสีสันลวดลายสวยงาม บินดูดน้ำหวานจากเกสรดอกไม้",
    category: "general",
    hint: "แมลงปีกสวยที่เติบโตมาจากดักแด้",
  },
  {
    id: "gen-7",
    headword: "ดาวหาง",
    pos: "น.",
    definition: "เทหวัตถุบนท้องฟ้า มีทางโคจรรอบดวงอาทิตย์ ยามเข้าใกล้จะมีแก๊สและฝุ่นส่องสว่างเป็นทางยาว",
    category: "general",
    hint: "วัตถุท้องฟ้าที่มีแสงทอดยาวเป็นหางยามค่ำคืน",
  },

  // --- Literary ---
  {
    id: "lit-1",
    headword: "ประสิทธิภาพ",
    pos: "น.",
    definition: "ความสามารถในการทำงานจนเกิดผลสัมฤทธิ์สูงสุดโดยใช้ทรัพยากรอย่างคุ้มค่า",
    category: "literary",
    hint: "การทำงานที่เกิดผลลัพธ์ดีเลิศ รวดเร็ว และคุ้มค่า",
  },
  {
    id: "lit-2",
    headword: "อัศจรรย์",
    pos: "ว.",
    definition: "แปลกประหลาด น่าพิศวง ไม่เคยพบเห็นมาก่อน ชวนให้ตื่นตาตื่นใจ",
    category: "literary",
    hint: "มหัศจรรย์ เหนือความคาดหมาย ชวนทึ่ง",
  },
  {
    id: "lit-3",
    headword: "วรรณคดี",
    pos: "น.",
    definition: "หนังสือที่ได้รับการยกย่องว่าแต่งดี มีคุณค่าทางวรรณศิลป์และจรรโลงใจ",
    category: "literary",
    hint: "งานประพันธ์อันทรงคุณค่าที่สืบทอดข้ามกาลเวลา",
  },
  {
    id: "lit-4",
    headword: "บุปผาราตรี",
    pos: "น.",
    definition: "ดอกไม้ที่เบ่งบานและส่งกลิ่นหอมฟุ้งจรุงใจในยามราตรีกาล",
    category: "literary",
    hint: "มวลดอกไม้ที่ส่งกลิ่นหอมเฉพาะยามค่ำคืน",
  },

  // --- Food ---
  {
    id: "food-1",
    headword: "ต้มยำกุ้ง",
    pos: "น.",
    definition: "อาหารคาวรสจัดจ้าน ครบรสเปรี้ยว เค็ม เผ็ด หอมกลิ่นสมุนไพร ข่า ตะไคร้ ใบมะกรูด และกุ้งสด",
    category: "food",
    hint: "ซุปสมุนไพรรสแซ่บประจำชาติไทยที่โด่งดังไปทั่วโลก",
  },
  {
    id: "food-2",
    headword: "ผัดไทย",
    pos: "น.",
    definition: "ก๋วยเตี๋ยวผัดรสกลมกล่อม ใส่เต้าหู้ ถั่วงอก กุ้งแห้ง ไข่ และถั่วลิสงบด",
    category: "food",
    hint: "เมนูเส้นผัดเอกลักษณ์ไทย กินคู่หัวปลีและมะนาว",
  },
  {
    id: "food-3",
    headword: "ข้าวเหนียวมะม่วง",
    pos: "น.",
    definition: "ของหวานไทยยอดนิยม ทำจากข้าวเหนียวมูนกะทิหวานมัน กินคู่กับมะม่วงน้ำดอกไม้สุกสีทอง",
    category: "food",
    hint: "ของหวานคู่หน้าร้อน ข้าวเหนียวมูนกับมะม่วงสุกหอมหวาน",
  },

  // --- Spoonerisms ---
  {
    id: "puan-1",
    headword: "น่ารัก",
    pos: "ว.",
    definition: "ชวนให้เอ็นดู ชวนมอง เจริญตาเจริญใจ",
    category: "spoonerism",
    hint: "คำชมคนที่เห็นแล้วใจฟู เอ็นดู",
    spoonerism: {
      puanResult: "นักล่า",
      explanation: "สลับพยัญชนะต้น 'น' กับ 'ร' และสระ/ตัวสะกด -> น่า-รัก เป็น นัก-ล่า",
      funMeaning: "จากคนที่น่ารักนุ่มนิ่ม กลายเป็นนักล่าตัวพ่อ/ตัวแม่สุดดุเดือด!",
    },
  },
  {
    id: "puan-2",
    headword: "คิดถึง",
    pos: "ก.",
    definition: "นึกถึงด้วยความผูกพัน อาลัย หรือห่วงใย",
    category: "spoonerism",
    hint: "ความรู้สึกเวลาห่างไกลคนที่เรารัก",
    spoonerism: {
      puanResult: "คึงถิด",
      explanation: "สลับสระ 'อิ' กับ 'อึ' ระหว่างพยางค์หน้าและหลัง",
      funMeaning: "คำผวนสลับสระยอดนิยม ฟังดูน่ารักปนกวนประสาท",
    },
  },
  {
    id: "puan-3",
    headword: "นอนหลับ",
    pos: "ก.",
    definition: "พักผ่อนทอดกายหลับตาเพื่อให้ร่างกายได้ฟื้นฟูกำลัง",
    category: "spoonerism",
    hint: "การพักผ่อนของมนุษย์ในยามค่ำคืน",
    spoonerism: {
      puanResult: "นับหลอน",
      explanation: "สลับพยัญชนะต้น 'น' กับ 'หล' -> นอน-หลับ เป็น นับ-หลอน",
      funMeaning: "จะนอนพักสบายๆ กลายเป็นต้องมานั่งนับเรื่องหลอนๆ กลางดึกซะงั้น!",
    },
  },
  {
    id: "puan-4",
    headword: "สวยงาม",
    pos: "ว.",
    definition: "งดงาม เจริญตา ต้องใจผู้พบเห็น",
    category: "spoonerism",
    hint: "คำชมความงามที่เพลินตา",
    spoonerism: {
      puanResult: "สามงวย",
      explanation: "สลับสระ 'อัว' กับ 'อา' และตัวสะกด -> สวย-งาม เป็น สาม-งวย",
      funMeaning: "จากความงามเลอค่า กลายเป็นสามงวย ชวนงุนงงสงสัย!",
    },
  },
  {
    id: "puan-5",
    headword: "หัวใจ",
    pos: "น.",
    definition: "อวัยวะสูบฉีดโลหิต หรือหมายถึงจิตใจ ความรู้สึกอันลึกซึ้ง",
    category: "spoonerism",
    hint: "อวัยวะที่เต้นอยู่ข้างซ้าย สัญลักษณ์แห่งความรัก",
    spoonerism: {
      puanResult: "ไหจัว",
      explanation: "สลับสระ 'อัว' กับ 'ไอ' -> หัว-ใจ เป็น ไห-จัว",
      funMeaning: "ดวงใจที่มีค่า กลายร่างเป็นไหใส่ของสุดวินเทจ!",
    },
  },
];

export function formatChallengeShare(
  word: string,
  hint: string,
  scrambledLetters: string[]
): string {
  const letterBoxes = scrambledLetters.map((l) => `[ ${l} ]`).join(" ");
  return [
    `🧩 ปริศนาปั่นคำ THAI CONTEXT Word Scrambler!`,
    `🔤 ตัวอักษรสลับ: ${letterBoxes}`,
    `💡 คำใบ้: ${hint || "ทายซิคำว่าอะไร?"} (ความยาว ${word.length} ตัวอักษร)`,
    `🎯 มาท้าทายคลังศัพท์ราชบัณฑิตยสภาด้วยกันได้ที่ THAI CONTEXT!`,
  ].join("\n\n");
}
