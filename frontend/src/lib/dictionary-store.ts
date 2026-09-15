export interface OfficialWordDefinition {
  headword: string;
  definition: string;
  partOfSpeech?: string;
  edition?: string;
  source?: string;
}

let dictionaryCache: Map<string, OfficialWordDefinition> | null = null;

// Curated high-priority definitions matching Royal Society standards
const CURATED_DEFINITIONS: Record<string, OfficialWordDefinition> = {
  ประสิทธิภาพ: {
    headword: "ประสิทธิภาพ",
    definition: "ความสามารถในการปฏิบัติการที่ให้ผลลัพธ์สูงสุดโดยสูญเสียทรัพยากร พลังงาน หรือเวลาน้อยที่สุด",
    partOfSpeech: "น.",
    edition: "2554",
    source: "สำนักงานราชบัณฑิตยสภา",
  },
  ประสิทธิผล: {
    headword: "ประสิทธิผล",
    definition: "ผลสำเร็จที่เกิดขึ้นตรงตามวัตถุประสงค์หรือเป้าหมายที่กำหนดไว้ โดยไม่คำนึงถึงปริมาณทรัพยากรที่ใช้",
    partOfSpeech: "น.",
    edition: "2554",
    source: "สำนักงานราชบัณฑิตยสภา",
  },
  สัมฤทธิผล: {
    headword: "สัมฤทธิผล",
    definition: "ผลสำเร็จอันสมบูรณ์ตามที่มุ่งหวังไว้ หรือความสำเร็จสูงสุดของกิจการ",
    partOfSpeech: "น.",
    edition: "2554",
    source: "สำนักงานราชบัณฑิตยสภา",
  },
  ยินดี: {
    headword: "ยินดี",
    definition: "ชอบใจ, ดีใจ, ปรีดา, พอใจด้วยความเบิกบานใจ",
    partOfSpeech: "ก.",
    edition: "2554",
    source: "สำนักงานราชบัณฑิตยสภา",
  },
  ยินยอม: {
    headword: "ยินยอม",
    definition: "ยอม, ไม่ขัดขืน, ตกลงตาม, เห็นพ้องหรืออนุญาตด้วยความสมัครใจ",
    partOfSpeech: "ก.",
    edition: "2554",
    source: "สำนักงานราชบัณฑิตยสภา",
  },
  เกรงใจ: {
    headword: "เกรงใจ",
    definition: "ไม่อยากจะให้ผู้อื่นรู้สึกลำบากเดือดร้อนรำคาญใจ หรือระมัดระวังมิให้กระทบกระเทือนใจผู้อื่น",
    partOfSpeech: "ก.",
    edition: "2554",
    source: "สำนักงานราชบัณฑิตยสภา",
  },
  ร่วมมือ: {
    headword: "ร่วมมือ",
    definition: "พร้อมใจช่วยกันทำงานหรือประสานพลังเพื่อบรรลุผลสำเร็จร่วมกัน",
    partOfSpeech: "ก.",
    edition: "2554",
    source: "สำนักงานราชบัณฑิตยสภา",
  },
  วิจัย: {
    headword: "วิจัย",
    definition: "การค้นคว้าเพื่อหาข้อมูลความรู้อย่างถี่ถ้วน ถูกต้อง และเป็นระบบตามหลักวิชาการ",
    partOfSpeech: "น.",
    edition: "2554",
    source: "สำนักงานราชบัณฑิตยสภา",
  },
  มัธยัสถ์: {
    headword: "มัธยัสถ์",
    definition: "การใช้จ่ายอย่างประหยัด ระมัดระวัง และรู้คุณค่าของทรัพย์สิน",
    partOfSpeech: "ก.",
    edition: "2554",
    source: "สำนักงานราชบัณฑิตยสภา",
  },
  ศักยภาพ: {
    headword: "ศักยภาพ",
    definition: "อำนาจหรือพลังแฝงที่มีอยู่ภายใน ซึ่งสามารถพัฒนาหรือนำมาใช้ให้เกิดประโยชน์ได้",
    partOfSpeech: "น.",
    edition: "2554",
    source: "สำนักงานราชบัณฑิตยสภา",
  },
  ประสานงาน: {
    headword: "ประสานงาน",
    definition: "สร้างความสัมพันธ์และการร่วมมือระหว่างส่วนประกอบหรือหน่วยงานต่าง ๆ เพื่อให้การดำเนินงานสอดคล้องและมีประสิทธิภาพ",
    partOfSpeech: "ก.",
    edition: "2554",
    source: "สำนักงานราชบัณฑิตยสภา",
  },
};

export function getDictionaryCache(): Map<string, OfficialWordDefinition> {
  if (dictionaryCache) return dictionaryCache;

  const map = new Map<string, OfficialWordDefinition>();

  // 1. Preload Curated Entries first
  for (const [key, item] of Object.entries(CURATED_DEFINITIONS)) {
    map.set(key, item);
  }

  // 2. Load from JSON database on filesystem if available
  if (typeof window === "undefined") {
    try {
      const fs = require("fs");
      const path = require("path");
      const candidatePaths = [
        path.resolve(process.cwd(), "data/processed/dict/dict_all_editions.json"),
        path.resolve(process.cwd(), "../data/processed/dict/dict_all_editions.json"),
        path.resolve(process.cwd(), "../../data/processed/dict/dict_all_editions.json"),
        path.resolve(process.cwd(), "data/processed/dict/dict_2554.json"),
        path.resolve(process.cwd(), "../data/processed/dict/dict_2554.json"),
      ];

      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, "utf-8");
          const items: Array<{
            headword?: string;
            pos?: string | null;
            definition?: string;
            edition?: string | number;
          }> = JSON.parse(raw);

          for (const it of items) {
            const hw = it.headword?.trim();
            const def = it.definition?.trim();
            if (hw && def && !map.has(hw)) {
              map.set(hw, {
                headword: hw,
                definition: def,
                partOfSpeech: it.pos || undefined,
                edition: it.edition ? String(it.edition) : "2554",
                source: "สำนักงานราชบัณฑิตยสภา",
              });
            }
          }
          break;
        }
      }
    } catch {
      // Ignore if filesystem read fails
    }
  }

  dictionaryCache = map;
  return map;
}

export function lookupOfficialDefinition(word: string): OfficialWordDefinition | null {
  const cleanWord = word.trim();
  if (!cleanWord) return null;

  // Direct check in curated map
  if (CURATED_DEFINITIONS[cleanWord]) {
    return CURATED_DEFINITIONS[cleanWord];
  }

  const dict = getDictionaryCache();
  return dict.get(cleanWord) || null;
}
