/**
 * Thai Word Scrambler & Anagram & Spoonerism Data & Utilities
 * Grounded in Royal Society Dictionary (ราชบัณฑิตยสภา)
 */

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

  // --- Literary & Rare Thai ---
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
  {
    id: "lit-5",
    headword: "สุวรรณภูมิ",
    pos: "น.",
    definition: "แผ่นดินทอง ดินแดนอันอุดมสมบูรณ์ในภูมิภาคเอเชียตะวันออกเฉียงใต้",
    category: "literary",
    hint: "แผ่นดินทองคำอันเปี่ยมด้วยความรุ่มรวยทางวัฒนธรรม",
  },
  {
    id: "lit-6",
    headword: "ทัศนศิลป์",
    pos: "น.",
    definition: "ศิลปะที่รับรู้ได้ด้วยการมองเห็น ได้แก่ จิตรกรรม ประติมากรรม และสถาปัตยกรรม",
    category: "literary",
    hint: "ศาสตร์แห่งความงามที่สัมผัสได้ผ่านสายตา",
  },

  // --- Food & Culinary ---
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
  {
    id: "food-4",
    headword: "ชาไทยไข่มุก",
    pos: "น.",
    definition: "เครื่องดื่มชาสีส้มใส่นม รสชาติหวานมันเข้มข้น ใส่เม็ดแป้งมันสำปะหลังเคี้ยวหนึบ",
    category: "food",
    hint: "เครื่องดื่มสีส้มยอดฮิตพร้อมท็อปปิ้งเคี้ยวหนึบ",
  },
  {
    id: "food-5",
    headword: "แกงมัสมั่น",
    pos: "น.",
    definition: "แกงกะทิรสชาติเข้มข้น หวาน มัน เค็ม กลมกล่อม หอมกลิ่นเครื่องเทศเทศและถั่วลิสงคั่ว",
    category: "food",
    hint: "แกงไทยที่ได้รับการยกย่องว่าอร่อยติดอันดับหนึ่งของโลก",
  },

  // --- Kham Puan (Spoonerisms) ---
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
  {
    id: "puan-6",
    headword: "สวัสดี",
    pos: "น./ก.",
    definition: "คำทักทายและอวยพรอันเป็นเอกลักษณ์ของคนไทย มีความหมายถึงความดีงามและความเจริญ",
    category: "spoonerism",
    hint: "คำทักทายประจำชาติไทยเวลาพบเจอกัน",
    spoonerism: {
      puanResult: "สะหรีดั๊ด",
      explanation: "ผวนแบบ ๓ พยางค์สไตล์ไทยคลาสสิก",
      funMeaning: "คำทักทายวัยรุ่นยุคเก่าที่กวนโอ๊ยและชวนหัวเราะ",
    },
  },
];

/**
 * Segment Thai text into natural grapheme clusters.
 * Ensures vowels, tone marks, and thanthakhat stay bound to their base consonant
 * so Thai orthography is preserved without broken or floating marks.
 */
export function segmentThaiClusters(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (typeof Intl !== "undefined" && (Intl as any).Segmenter) {
    try {
      const segmenter = new (Intl as any).Segmenter("th", { granularity: "grapheme" });
      const segments: string[] = [];
      for (const item of segmenter.segment(trimmed)) {
        if (item.segment && item.segment.trim()) {
          segments.push(item.segment);
        }
      }
      if (segments.length > 0) return segments;
    } catch {
      // fallback below
    }
  }

  // Regex fallback: Consonant + optional vowels/tone marks
  const thaiClusterPattern = /[\u0E01-\u0E2E][\u0E30-\u0E3A\u0E47-\u0E4E]*/g;
  const matches = trimmed.match(thaiClusterPattern);
  if (matches && matches.length > 0) {
    return matches;
  }

  return trimmed.split("");
}

/**
 * Fisher-Yates shuffle that ensures the result is different from original order
 * (unless original length <= 1).
 */
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
    if (result.join("") !== originalStr) {
      return result;
    }
  }

  // If still same, swap first two
  if (result.length >= 2) {
    [result[0], result[1]] = [result[1], result[0]];
  }
  return result;
}

/**
 * Formats a challenge string ready to copy and share on social media.
 */
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
