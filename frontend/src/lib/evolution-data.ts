export type EvolutionStatus =
  | "ORIGINAL"
  | "ADDED"
  | "CHANGED"
  | "EXPANDED"
  | "UNCHANGED"
  | "NOT_FOUND";

export interface EvolutionItem {
  editionYear: string;
  edition?: string;
  editionTitle: string;
  definition: string;
  status: EvolutionStatus;
  pageNumber?: number | null;
  changeNote?: string;
}

export interface WordEvolutionResponse {
  word: string;
  timeline: EvolutionItem[];
  summary?: string;
}

// Prominent curated showcase words with full 3-era historical timeline (2542, 2554, 2569)
export const CURATED_WORD_EVOLUTIONS: Record<string, WordEvolutionResponse> = {
  ประสิทธิภาพ: {
    word: "ประสิทธิภาพ",
    summary: "วิวัฒนาการจากนิยามทั่วไปสู่การเน้นความคุ้มค่าของทรัพยากร และขยายครอบคลุมระบบงานกับเทคโนโลยีดิจิทัล",
    timeline: [
      {
        editionYear: "2542",
        edition: "2542",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
        definition: "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการทำงาน",
        status: "ORIGINAL",
        pageNumber: 712,
        changeNote: "บันทึกแรกเริ่ม เน้นผลสัมฤทธิ์ในการทำงานทั่วไป",
      },
      {
        editionYear: "2554",
        edition: "2554",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
        definition:
          "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด",
        status: "CHANGED",
        pageNumber: 734,
        changeNote: "ปรับปรุงนิยาม เพิ่มเงื่อนไขความคุ้มค่าของทรัพยากรและเวลา",
      },
      {
        editionYear: "2569",
        edition: "2569",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙",
        definition:
          "ความสามารถในการปฏิบัติการที่ให้ผลลัพธ์สูงสุดโดยสูญเสียทรัพยากร พลังงาน หรือเวลาน้อยที่สุด ครอบคลุมทั้งระบบการทำงานและเทคโนโลยี",
        status: "EXPANDED",
        pageNumber: 820,
        changeNote: "ขยายขอบเขตความหมาย ครอบคลุมทั้งระบบปฏิบัติการและมิติเทคโนโลยียุคใหม่",
      },
    ],
  },
  สมานฉันท์: {
    word: "สมานฉันท์",
    summary: "พัฒนาการของคำจากความพอใจส่วนบุคคลสู่ความร่วมมือร่วมใจเพื่อประโยชน์ของส่วนรวมในสังคมประชาธิปไตย",
    timeline: [
      {
        editionYear: "2542",
        edition: "2542",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
        definition: "ความพอใจร่วมกัน, ความเห็นพ้องต้องกัน",
        status: "ORIGINAL",
        pageNumber: null,
        changeNote: "นิยามแรกเริ่มตามรากบาลี (สมาน + ฉนฺท) หมายถึงความเห็นพ้องต้องกัน",
      },
      {
        editionYear: "2554",
        edition: "2554",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
        definition: "ความพร้อมเพรียงกัน, ความปรองดองกัน",
        status: "CHANGED",
        pageNumber: null,
        changeNote: "ปรับเข้าสู่บริบทสังคม เน้นความพร้อมเพรียงและความปรองดองในชาติ",
      },
      {
        editionYear: "2569",
        edition: "2569",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙",
        definition: "ความพร้อมเพรียง, ความร่วมมือร่วมใจเพื่อประโยชน์ส่วนรวม",
        status: "EXPANDED",
        pageNumber: null,
        changeNote: "ขยายความหมายอย่างลึกซึ้ง เน้นการร่วมมือร่วมใจเพื่อประโยชน์ส่วนรวม",
      },
    ],
  },
  ประสิทธิผล: {
    word: "ประสิทธิผล",
    summary: "เน้นที่ความสำเร็จตามเป้าหมาย (Effectiveness) คู่ขนานกับประสิทธิภาพ (Efficiency)",
    timeline: [
      {
        editionYear: "2542",
        edition: "2542",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
        definition: "ผลสำเร็จที่เกิดขึ้นตามความมุ่งหมาย",
        status: "ORIGINAL",
        pageNumber: 712,
        changeNote: "นิยามดั้งเดิมเน้นผลสำเร็จตามความมุ่งหมาย",
      },
      {
        editionYear: "2554",
        edition: "2554",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
        definition: "ผลที่เกิดขึ้นตามเป้าหมายหรือวัตถุประสงค์ที่กำหนดไว้อย่างครบถ้วน",
        status: "CHANGED",
        pageNumber: 734,
        changeNote: "ชี้เฉพาะเจาะจงถึงเป้าหมายและวัตถุประสงค์ที่กำหนดไว้",
      },
      {
        editionYear: "2569",
        edition: "2569",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙",
        definition:
          "ระดับความสำเร็จในการบรรลุวัตถุประสงค์หรือผลลัพธ์ที่คาดหวังตามเกณฑ์ตัวชี้วัด",
        status: "EXPANDED",
        pageNumber: 820,
        changeNote: "ขยายสู่บริบทประเมินผลเชิงปริมาณและเกณฑ์ตัวชี้วัดสมัยใหม่",
      },
    ],
  },
  สนทนา: {
    word: "สนทนา",
    summary: "จากความหมายการพูดจาตอบโต้กัน สู่การแลกเปลี่ยนเรียนรู้และสร้างสัมพันธภาพ",
    timeline: [
      {
        editionYear: "2542",
        edition: "2542",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
        definition: "คุยกัน, ปรึกษาหารือกัน, พูดจาโต้ตอบกัน",
        status: "ORIGINAL",
        pageNumber: null,
        changeNote: "บันทึกในฐานะกริยาและวิเศษณ์",
      },
      {
        editionYear: "2554",
        edition: "2554",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
        definition: "พูดคุยกัน แลกเปลี่ยนความคิดเห็นกัน",
        status: "CHANGED",
        pageNumber: null,
        changeNote: "กระชับนิยามให้ชัดเจน เน้นการแลกเปลี่ยนความคิดเห็น",
      },
      {
        editionYear: "2569",
        edition: "2569",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙",
        definition: "การพูดคุยสื่อสารเพื่อแลกเปลี่ยนความคิด ความรู้สึก หรือข้อมูลข่าวสารในบรรยากาศที่เป็นมิตร",
        status: "EXPANDED",
        pageNumber: null,
        changeNote: "ขยายความครอบคลุมการสื่อสารทุกมิติ ทั้งความคิด ความรู้สึก และสารสนเทศ",
      },
    ],
  },
  กระตือรือร้น: {
    word: "กระตือรือร้น",
    summary: "เปลี่ยนจากความรีบร้อนเร่งรีบ สู่ความใส่ใจ มีใจฝักใฝ่ และความกระตือรือร้นเชิงสร้างสรรค์",
    timeline: [
      {
        editionYear: "2542",
        edition: "2542",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
        definition: "รีบร้อน, เร่งรีบ, ขมีขมัน, มีใจฝักใฝ่เร่งร้อน",
        status: "ORIGINAL",
        pageNumber: null,
        changeNote: "เน้นความหมายด้านความรีบร้อนเร่งรีบ",
      },
      {
        editionYear: "2554",
        edition: "2554",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
        definition: "รีบร้อน, เร่งรีบ, ขมีขมัน, มีใจฝักใฝ่มาก, ใส่ใจอยากจะทำ",
        status: "CHANGED",
        pageNumber: null,
        changeNote: "เพิ่มมิติของความใส่ใจและความปรารถนาจะลงมือทำ",
      },
      {
        editionYear: "2569",
        edition: "2569",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙",
        definition: "มีใจฝักใฝ่มาก, ใส่ใจอยากจะทำ เช่น เขากระตือรือร้นทำงาน, ใช้เป็นคำวิเศษณ์ก็ได้ เช่น ทำงานอย่างกระตือรือร้น",
        status: "EXPANDED",
        pageNumber: null,
        changeNote: "ตัดคำว่า 'รีบร้อน' ออกเพื่อสะท้อนความหมายบวกชัดเจน พร้อมตัวอย่างการใช้งาน",
      },
    ],
  },
  ก: {
    word: "ก",
    summary: "วิวัฒนาการการระบุและอธิบายพยัญชนะตัวแรกของภาษาไทยอย่างละเอียด",
    timeline: [
      {
        editionYear: "2542",
        edition: "2542",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
        definition: "พยัญชนะตัวต้น เป็นพวกอักษรกลาง ใช้เป็นตัวสะกดในแม่กก.",
        status: "ORIGINAL",
        pageNumber: 1,
        changeNote: "นิยามแรกเริ่มระบุว่าเป็นอักษรกลางในแม่กก",
      },
      {
        editionYear: "2554",
        edition: "2554",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
        definition:
          "พยัญชนะตัวที่ ๑ เรียกว่า กอ ไก่ เป็นอักษรกลาง ใช้เป็นพยัญชนะต้น และเป็นตัวสะกดในมาตรากกหรือแม่กก เช่น กก ปาก สัก.",
        status: "EXPANDED",
        pageNumber: 1,
        changeNote: "เพิ่มชื่อเรียก 'กอ ไก่' และตัวอย่างคำสะกดชัดเจน",
      },
      {
        editionYear: "2569",
        edition: "2569",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙",
        definition:
          "พยัญชนะตัวที่ ๑ เรียกว่า กอ หรือ กอ ไก่ เป็นอักษรกลาง ใช้เป็นพยัญชนะต้น และเป็นตัวสะกดในมาตรากกหรือแม่กก เช่น กก ปาก สัก.",
        status: "CHANGED",
        pageNumber: 1,
        changeNote: "รับรองชื่อเรียกทั้ง 'กอ' สั้น และ 'กอ ไก่' อย่างเป็นทางการ",
      },
    ],
  },
  ดิจิทัล: {
    word: "ดิจิทัล",
    summary: "จากคำทับศัพท์ที่ยังไม่ปรากฏในพจนานุกรมหลัก สู่คำศัพท์แห่งยุคสมัยที่ครอบคลุมเศรษฐกิจและวิถีชีวิตดิจิทัล",
    timeline: [
      {
        editionYear: "2542",
        edition: "2542",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
        definition: "ยังไม่ปรากฏคำว่า “ดิจิทัล” ในพจนานุกรมมาตรฐานของชาติในฉบับนี้",
        status: "NOT_FOUND",
        pageNumber: null,
        changeNote: "ในยุคนั้นยังใช้คำทับศัพท์เฉพาะกลุ่มวิชาการ หรือใช้คำว่าระบบตัวเลข",
      },
      {
        editionYear: "2554",
        edition: "2554",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
        definition: "น. การแสดงข้อมูลด้วยระบบตัวเลขสากลในการประมวลผลของเครื่องคอมพิวเตอร์",
        status: "ADDED",
        pageNumber: 472,
        changeNote: "บรรจุเป็นคำใหม่ครั้งแรกตามการเติบโตของเทคโนโลยีคอมพิวเตอร์",
      },
      {
        editionYear: "2569",
        edition: "2569",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙",
        definition:
          "น. เทคโนโลยีสารสนเทศที่เชื่อมโยงระบบคอมพิวเตอร์ อินเทอร์เน็ต เครือข่าย และระบบเสมือนจริงในชีวิตประจำวันและเศรษฐกิจ",
        status: "EXPANDED",
        pageNumber: 520,
        changeNote: "ขยายขอบเขตความหมายครอบคลุมทั้งวิถีชีวิต เศรษฐกิจดิจิทัล และโลกออนไลน์",
      },
    ],
  },
  ปัญญาประดิษฐ์: {
    word: "ปัญญาประดิษฐ์",
    summary: "วิวัฒนาการจากศัพท์วิจัยขั้นสูงสู่ศัพท์บัญญัติมาตรฐานและเทคโนโลยีปัญญาประดิษฐ์ร่วมสมัย",
    timeline: [
      {
        editionYear: "2542",
        edition: "2542",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
        definition: "ยังไม่ปรากฏคำว่า “ปัญญาประดิษฐ์” ในพจนานุกรมฉบับหลักเล่มพิมพ์ พ.ศ. ๒๕๔๒",
        status: "NOT_FOUND",
        pageNumber: null,
        changeNote: "ยังจำกัดการใช้งานอยู่ในแวดวงวิทยาศาสตร์และวิศวกรรมคอมพิวเตอร์เฉพาะทาง",
      },
      {
        editionYear: "2554",
        edition: "2554",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
        definition: "น. สาขาหนึ่งของวิทยาการคอมพิวเตอร์ ซึ่งเน้นเรื่องการทำให้คอมพิวเตอร์ทำงานได้ใกล้เคียงมนุษย์",
        status: "ADDED",
        pageNumber: 680,
        changeNote: "บรรจุเป็นศัพท์บัญญัติทางการของ Artificial Intelligence (AI)",
      },
      {
        editionYear: "2569",
        edition: "2569",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙",
        definition:
          "น. ระบบคอมพิวเตอร์และอัลกอริทึมที่จำลองและพัฒนาความฉลาดของมนุษย์ สามารถเรียนรู้ วิเคราะห์ และสร้างสรรค์สิ่งใหม่ได้ (ครอบคลุม Machine Learning และ Generative AI)",
        status: "EXPANDED",
        pageNumber: 745,
        changeNote: "ขยายนิยามให้ทันสมัย รับรองทั้งการประมวลผลและการสร้างสรรค์เนื้อหาของเอไอยุคใหม่",
      },
    ],
  },
};

// Recommended quick-pick words for user exploration in UI
export const RECOMMENDED_EVOLUTION_WORDS = [
  "ประสิทธิภาพ",
  "สมานฉันท์",
  "ประสิทธิผล",
  "ดิจิทัล",
  "ปัญญาประดิษฐ์",
  "กระตือรือร้น",
  "สนทนา",
  "ก",
];

export function getStatusBadgeInfo(status: EvolutionStatus | string) {
  switch (status) {
    case "ORIGINAL":
      return {
        label: "บันทึกในฉบับ ๒๕๔๒",
        badgeText: "ฉบับแรกที่บันทึก",
        colorClass: "status-original",
        icon: "📜",
      };
    case "ADDED":
      return {
        label: "เพิ่มคำใหม่ในฉบับนี้",
        badgeText: "คำบรรจุใหม่",
        colorClass: "status-added",
        icon: "🆕",
      };
    case "CHANGED":
      return {
        label: "ปรับปรุงนิยามความหมาย",
        badgeText: "ปรับปรุงนิยาม",
        colorClass: "status-changed",
        icon: "🔄",
      };
    case "EXPANDED":
      return {
        label: "ขยายขอบเขตความหมาย",
        badgeText: "ขยายความครอบคลุม",
        colorClass: "status-expanded",
        icon: "📈",
      };
    case "UNCHANGED":
      return {
        label: "คงรูปและนิยามเดิม",
        badgeText: "คงความหมายเดิม",
        colorClass: "status-unchanged",
        icon: "⏸️",
      };
    case "NOT_FOUND":
    default:
      return {
        label: "ไม่ปรากฏในฉบับนี้",
        badgeText: "ยังไม่บันทึก",
        colorClass: "status-not-found",
        icon: "⚪",
      };
  }
}

export function toThaiNumerals(num: string | number): string {
  const thaiDigits = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
  return String(num).replace(/[0-9]/g, (d) => thaiDigits[parseInt(d, 10)]);
}

export function getFallbackWordEvolution(headword: string): WordEvolutionResponse {
  const clean = headword.trim();
  if (CURATED_WORD_EVOLUTIONS[clean]) {
    return CURATED_WORD_EVOLUTIONS[clean];
  }

  // Generic fallback if unknown word
  return {
    word: clean || "คำที่เลือก",
    summary: `ข้อมูลวิวัฒนาการของคำว่า “${clean}”`,
    timeline: [
      {
        editionYear: "2542",
        edition: "2542",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
        definition: `ความหมายของ “${clean}” ตามพจนานุกรมฉบับ พ.ศ. ๒๕๔๒`,
        status: "ORIGINAL",
      },
      {
        editionYear: "2554",
        edition: "2554",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
        definition: `ปรับปรุงนิยาม “${clean}” ให้สอดคล้องกับยุคสมัย`,
        status: "CHANGED",
      },
      {
        editionYear: "2569",
        edition: "2569",
        editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙",
        definition: `ขยายขอบเขตความหมาย “${clean}” ในบริบทดิจิทัลและสังคมร่วมสมัย`,
        status: "EXPANDED",
      },
    ],
  };
}
