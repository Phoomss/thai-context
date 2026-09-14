import type {
  BrailleCell,
  BrailleData,
  DecodedBrailleCell,
  DecodedBrailleResult,
} from "./accessibility-types";

export const THAI_BRAILLE_MAP: Record<
  string,
  { dots: number[]; role: "consonant" | "vowel" | "tone" | "symbol" | "other"; description: string }
> = {
  // Consonants
  'ก': { dots: [1, 2, 4, 5], role: "consonant", description: "ก. ไก่ (จุด 1-2-4-5)" },
  'ข': { dots: [1, 3], role: "consonant", description: "ข. ไข่ (จุด 1-3)" },
  'ฃ': { dots: [1, 3], role: "consonant", description: "ฃ. ขวด (จุด 1-3)" },
  'ค': { dots: [1, 4], role: "consonant", description: "ค. ควาย (จุด 1-4)" },
  'ฅ': { dots: [1, 4], role: "consonant", description: "ฅ. คน (จุด 1-4)" },
  'ฆ': { dots: [1, 2, 4, 5, 6], role: "consonant", description: "ฆ. ระฆัง (จุด 1-2-4-5-6)" },
  'ง': { dots: [3, 4, 5, 6], role: "consonant", description: "ง. งู (จุด 3-4-5-6)" },
  'จ': { dots: [2, 4, 5], role: "consonant", description: "จ. จาน (จุด 2-4-5)" },
  'ฉ': { dots: [1, 4, 6], role: "consonant", description: "ฉ. ฉิ่ง (จุด 1-4-6)" },
  'ช': { dots: [1, 4, 6], role: "consonant", description: "ช. ช้าง (จุด 1-4-6)" },
  'ซ': { dots: [1, 3, 5, 6], role: "consonant", description: "ซ. โซ่ (จุด 1-3-5-6)" },
  'ฌ': { dots: [1, 4, 6], role: "consonant", description: "ฌ. เฌอ (จุด 1-4-6)" },
  'ญ': { dots: [1, 3, 4, 5, 6], role: "consonant", description: "ญ. หญิง (จุด 1-3-4-5-6)" },
  'ฎ': { dots: [1, 4, 5], role: "consonant", description: "ฎ. ชฎา (จุด 1-4-5)" },
  'ฏ': { dots: [2, 3, 4, 5], role: "consonant", description: "ฏ. ปฏัก (จุด 2-3-4-5)" },
  'ฐ': { dots: [2, 3, 4, 6], role: "consonant", description: "ฐ. ฐาน (จุด 2-3-4-6)" },
  'ฑ': { dots: [2, 3, 4, 5, 6], role: "consonant", description: "ฑ. มณโฑ (จุด 2-3-4-5-6)" },
  'ฒ': { dots: [2, 3, 4, 5, 6], role: "consonant", description: "ฒ. ผู้เฒ่า (จุด 2-3-4-5-6)" },
  'ณ': { dots: [1, 3, 4, 5], role: "consonant", description: "ณ. เณร (จุด 1-3-4-5)" },
  'ด': { dots: [1, 4, 5], role: "consonant", description: "ด. เด็ก (จุด 1-4-5)" },
  'ต': { dots: [2, 3, 4, 5], role: "consonant", description: "ต. เต่า (จุด 2-3-4-5)" },
  'ถ': { dots: [2, 3, 4, 6], role: "consonant", description: "ถ. ถุง (จุด 2-3-4-6)" },
  'ท': { dots: [2, 3, 4, 5, 6], role: "consonant", description: "ท. ทหาร (จุด 2-3-4-5-6)" },
  'ธ': { dots: [2, 3, 4, 5, 6], role: "consonant", description: "ธ. ธง (จุด 2-3-4-5-6)" },
  'น': { dots: [1, 3, 4, 5], role: "consonant", description: "น. หนู (จุด 1-3-4-5)" },
  'บ': { dots: [1, 2], role: "consonant", description: "บ. ใบไม้ (จุด 1-2)" },
  'ป': { dots: [1, 2, 3, 4], role: "consonant", description: "ป. ปลา (จุด 1-2-3-4)" },
  'ผ': { dots: [1, 2, 3, 6], role: "consonant", description: "ผ. ผึ้ง (จุด 1-2-3-6)" },
  'ฝ': { dots: [1, 2, 4], role: "consonant", description: "ฝ. ฝา (จุด 1-2-4)" },
  'พ': { dots: [1, 2, 3, 4, 6], role: "consonant", description: "พ. พาน (จุด 1-2-3-4-6)" },
  'ฟ': { dots: [1, 2, 3, 5], role: "consonant", description: "ฟ. ฟัน (จุด 1-2-3-5)" },
  'ภ': { dots: [1, 2, 3, 4, 6], role: "consonant", description: "ภ. สำเภา (จุด 1-2-3-4-6)" },
  'ม': { dots: [1, 3, 4], role: "consonant", description: "ม. ม้า (จุด 1-3-4)" },
  'ย': { dots: [1, 3, 4, 5, 6], role: "consonant", description: "ย. ยักษ์ (จุด 1-3-4-5-6)" },
  'ร': { dots: [1, 2, 3, 5], role: "consonant", description: "ร. เรือ (จุด 1-2-3-5)" },
  'ฤ': { dots: [1, 2, 3, 5], role: "vowel", description: "ตัว ฤ (จุด 1-2-3-5)" },
  'ล': { dots: [1, 2, 3], role: "consonant", description: "ล. ลิง (จุด 1-2-3)" },
  'ว': { dots: [2, 4, 5, 6], role: "consonant", description: "ว. แหวน (จุด 2-4-5-6)" },
  'ศ': { dots: [1, 4, 6], role: "consonant", description: "ศ. ศาลา (จุด 1-4-6)" },
  'ษ': { dots: [1, 2, 3, 4, 6], role: "consonant", description: "ษ. ฤๅษี (จุด 1-2-3-4-6)" },
  'ส': { dots: [2, 3, 4], role: "consonant", description: "ส. เสือ (จุด 2-3-4)" },
  'ห': { dots: [1, 2, 5], role: "consonant", description: "ห. หีบ (จุด 1-2-5)" },
  'ฬ': { dots: [1, 2, 3], role: "consonant", description: "ฬ. จุฬา (จุด 1-2-3)" },
  'อ': { dots: [1, 3, 5], role: "consonant", description: "อ. อ่าง (จุด 1-3-5)" },
  'ฮ': { dots: [1, 2, 3, 4, 5, 6], role: "consonant", description: "ฮ. นกฮูก (จุด 1-2-3-4-5-6)" },

  // Vowels
  'ะ': { dots: [1], role: "vowel", description: "สระ อะ (จุด 1)" },
  'ั': { dots: [1, 6], role: "vowel", description: "ไม้หันอากาศ (จุด 1-6)" },
  'า': { dots: [1, 2, 6], role: "vowel", description: "สระ อา (จุด 1-2-6)" },
  'ำ': { dots: [2, 3, 5], role: "vowel", description: "สระ อำ (จุด 2-3-5)" },
  'ิ': { dots: [2, 4], role: "vowel", description: "สระ อิ (จุด 2-4)" },
  'ี': { dots: [3, 5], role: "vowel", description: "สระ อี (จุด 3-5)" },
  'ึ': { dots: [3, 4, 6], role: "vowel", description: "สระ อึ (จุด 3-4-6)" },
  'ื': { dots: [1, 2, 4, 6], role: "vowel", description: "สระ อือ (จุด 1-2-4-6)" },
  'ุ': { dots: [1, 3, 6], role: "vowel", description: "สระ อุ (จุด 1-3-6)" },
  'ู': { dots: [1, 2, 5, 6], role: "vowel", description: "สระ อู (จุด 1-2-5-6)" },
  'เ': { dots: [1, 5], role: "vowel", description: "สระ เอ (จุด 1-5)" },
  'แ': { dots: [1, 2, 4, 6], role: "vowel", description: "สระ แอ (จุด 1-2-4-6)" },
  'โ': { dots: [1, 3, 5], role: "vowel", description: "สระ โอ (จุด 1-3-5)" },
  'ใ': { dots: [1, 2, 3, 5, 6], role: "vowel", description: "สระ ใอ ไม้ม้วน (จุด 1-2-3-5-6)" },
  'ไ': { dots: [3, 4], role: "vowel", description: "สระ ไอ ไม้มลาย (จุด 3-4)" },

  // Tone marks & Special
  '็': { dots: [2, 6], role: "symbol", description: "ไม้ไต่คู้ (จุด 2-6)" },
  '่': { dots: [2], role: "tone", description: "ไม้เอก (จุด 2)" },
  '้': { dots: [2, 3], role: "tone", description: "ไม้โท (จุด 2-3)" },
  '๊': { dots: [2, 3, 5, 6], role: "tone", description: "ไม้ตรี (จุด 2-3-5-6)" },
  '๋': { dots: [2, 5, 6], role: "tone", description: "ไม้จัตวา (จุด 2-5-6)" },
  '์': { dots: [3, 6], role: "symbol", description: "ไม้ทัณฑฆาต / การันต์ (จุด 3-6)" },
  'ๆ': { dots: [5], role: "symbol", description: "ไม้ยมก (จุด 5)" },
  'ฯ': { dots: [2], role: "symbol", description: "ไปยาลน้อย (จุด 2)" },
};

export function dotsToBrailleChar(dots: number[]): string {
  const mask = dots.reduce((acc, d) => acc | (1 << (d - 1)), 0);
  return String.fromCharCode(0x2800 | mask);
}

/**
 * Returns a 2-column x 3-row boolean matrix for a standard 6-dot Braille cell.
 * Row 0: [dot 1, dot 4]
 * Row 1: [dot 2, dot 5]
 * Row 2: [dot 3, dot 6]
 */
export function dotsToCellGrid(dots: number[]): boolean[][] {
  const set = new Set(dots);
  return [
    [set.has(1), set.has(4)],
    [set.has(2), set.has(5)],
    [set.has(3), set.has(6)],
  ];
}

export function encodeThaiToBraille(word: string): BrailleData {
  const cleaned = word.trim();
  if (!cleaned) {
    return {
      word: "",
      brailleUnicode: "",
      brailleCells: [],
      readingGuide: "",
      audioText: "",
      sourceAttribution: "สมาคมคนตาบอดแห่งประเทศไทย",
      verificationStatus: "OFFICIAL",
    };
  }

  const cells: BrailleCell[] = [];
  const guideParts: string[] = [];

  for (const char of cleaned) {
    if (char === " ") {
      cells.push({
        char: " ",
        braille: "⠀",
        dots: [],
        role: "other",
        description: "เว้นวรรค (ช่องว่าง)",
      });
      continue;
    }

    const mapping = THAI_BRAILLE_MAP[char];
    if (mapping) {
      const brailleChar = dotsToBrailleChar(mapping.dots);
      cells.push({
        char,
        braille: brailleChar,
        dots: mapping.dots,
        role: mapping.role,
        description: mapping.description,
      });
      guideParts.push(`${char} (${brailleChar}, จุด ${mapping.dots.join("-")})`);
    } else {
      // Fallback for English or digits or punctuation
      const code = char.charCodeAt(0);
      const dots = code >= 65 && code <= 90 ? [1, 2] : [1];
      const brailleChar = dotsToBrailleChar(dots);
      cells.push({
        char,
        braille: brailleChar,
        dots,
        role: "other",
        description: `${char}`,
      });
      guideParts.push(`${char} (${brailleChar})`);
    }
  }

  const brailleUnicode = cells.map((c) => c.braille).join("");
  const readingGuide = `สะกดอักษรเบรลล์: ${guideParts.join(" + ")}`;

  return {
    word: cleaned,
    brailleUnicode,
    brailleCells: cells,
    readingGuide,
    audioText: cleaned,
    sourceAttribution: "สมาคมคนตาบอดแห่งประเทศไทย (สถาบันวิจัยและส่งเสริมอักษรเบรลล์แห่งชาติ)",
    verificationStatus: "OFFICIAL",
  };
}

/**
 * Converts a Unicode Braille character (U+2800..U+28FF) into an array of dot numbers [1..8].
 */
export function brailleCharToDots(char: string): number[] {
  if (!char) return [];
  const code = char.charCodeAt(0);
  if (code >= 0x2800 && code <= 0x28ff) {
    const mask = code - 0x2800;
    const dots: number[] = [];
    for (let d = 1; d <= 8; d++) {
      if ((mask & (1 << (d - 1))) !== 0) {
        dots.push(d);
      }
    }
    return dots;
  }
  return [];
}

/**
 * Priority primary Thai characters for dot combinations that are shared by multiple letters.
 */
const PRIMARY_THAI_BY_DOT_KEY: Record<string, { primary: string; alternatives: string[] }> = {
  "1-3": { primary: "ข", alternatives: ["ฃ"] },
  "1-4": { primary: "ค", alternatives: ["ฅ"] },
  "1-4-6": { primary: "ช", alternatives: ["ฉ", "ฌ", "ศ"] },
  "1-4-5": { primary: "ด", alternatives: ["ฎ"] },
  "2-3-4-5": { primary: "ต", alternatives: ["ฏ"] },
  "2-3-4-6": { primary: "ถ", alternatives: ["ฐ"] },
  "2-3-4-5-6": { primary: "ท", alternatives: ["ฑ", "ฒ", "ธ"] },
  "1-3-4-5": { primary: "น", alternatives: ["ณ"] },
  "1-2-3-4-6": { primary: "พ", alternatives: ["ภ", "ษ"] },
  "1-2-3-5": { primary: "ร", alternatives: ["ฟ", "ฤ"] },
  "1-2-3": { primary: "ล", alternatives: ["ฬ"] },
  "1-3-4-5-6": { primary: "ย", alternatives: ["ญ"] },
  "1-3-5": { primary: "อ", alternatives: ["โ"] },
  "1-2-4-6": { primary: "แ", alternatives: ["ื"] },
};

/**
 * Decodes an array of Braille dot numbers (e.g. [1, 2, 3, 4]) back to a Thai character cell.
 */
export function decodeDotsToThai(dots: number[]): DecodedBrailleCell {
  const sortedDots = [...dots].sort((a, b) => a - b);
  const brailleChar = dotsToBrailleChar(sortedDots);

  if (sortedDots.length === 0) {
    return {
      char: " ",
      braille: "⠀",
      dots: [],
      role: "other",
      description: "เว้นวรรค (ช่องว่าง)",
    };
  }

  const dotKey = sortedDots.join("-");

  // 1. Check priority mapping if dot combination is shared
  const priority = PRIMARY_THAI_BY_DOT_KEY[dotKey];
  if (priority) {
    const mapping = THAI_BRAILLE_MAP[priority.primary];
    return {
      char: priority.primary,
      braille: brailleChar,
      dots: sortedDots,
      alternatives: priority.alternatives,
      role: mapping?.role || "consonant",
      description: mapping?.description || `${priority.primary} (จุด ${dotKey})`,
    };
  }

  // 2. Linear scan of THAI_BRAILLE_MAP
  for (const [char, meta] of Object.entries(THAI_BRAILLE_MAP)) {
    const metaKey = [...meta.dots].sort((a, b) => a - b).join("-");
    if (metaKey === dotKey) {
      return {
        char,
        braille: brailleChar,
        dots: sortedDots,
        role: meta.role,
        description: meta.description,
      };
    }
  }

  // 3. Unknown dot pattern
  return {
    char: "?",
    braille: brailleChar,
    dots: sortedDots,
    role: "other",
    description: `จุด ${dotKey} (ยังไม่มีในสารบบอักษรเบรลล์ไทย)`,
  };
}

/**
 * Decodes a sequence of Unicode Braille characters back into a Thai text representation.
 */
export function decodeBrailleToThai(brailleInput: string): DecodedBrailleResult {
  const input = brailleInput.trim();
  if (!input) {
    return {
      brailleInput: "",
      decodedText: "",
      cells: [],
      readingGuide: "",
      hasAmbiguity: false,
    };
  }

  const cells: DecodedBrailleCell[] = [];
  const guideParts: string[] = [];

  for (const char of input) {
    if (char === " " || char === "⠀") {
      cells.push({
        char: " ",
        braille: "⠀",
        dots: [],
        role: "other",
        description: "เว้นวรรค",
      });
      guideParts.push("เว้นวรรค");
      continue;
    }

    const code = char.charCodeAt(0);
    let dots: number[] = [];

    if (code >= 0x2800 && code <= 0x28ff) {
      dots = brailleCharToDots(char);
    } else {
      // If user typed Thai character instead, reverse map it
      const existing = THAI_BRAILLE_MAP[char];
      if (existing) {
        dots = existing.dots;
      }
    }

    const decoded = decodeDotsToThai(dots);
    // If the input was plain non-braille and not in map, preserve original char
    if (dots.length === 0 && (code < 0x2800 || code > 0x28ff)) {
      decoded.char = char;
      decoded.description = char;
    }

    cells.push(decoded);

    const altText = decoded.alternatives?.length
      ? ` (หรือ ${decoded.alternatives.join(", ")})`
      : "";
    guideParts.push(`${decoded.char}${altText}`);
  }

  const decodedText = cells.map((c) => c.char).join("");
  const hasAmbiguity = cells.some((c) => !!c.alternatives && c.alternatives.length > 0);
  const readingGuide = `ถอดรหัสเป็นข้อความ: ${guideParts.join(" + ")}`;

  return {
    brailleInput: input,
    decodedText,
    cells,
    readingGuide,
    hasAmbiguity,
  };
}

