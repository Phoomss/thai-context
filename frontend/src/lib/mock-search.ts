import type { Recommendation, SearchResponse } from "./search-types";
// Editorial demo content, not verified dictionary quotations or semantic-search scores.
const entries: (Recommendation & { keywords: string[] })[] = [
  {
    headword: "ประสิทธิภาพ",
    score: 0.96,
    pos: "น.",
    definition:
      "ความสามารถในการทำงานให้ได้ผล โดยใช้เวลาและทรัพยากรอย่างคุ้มค่า",
    ai_explanation: "ตัวอย่างนี้เน้นวิธีทำงานและการใช้ทรัพยากร",
    registers: ["ทางการ"],
    contexts: ["การทำงาน"],
    evidence: {
      source_book: "พจนานุกรมฉบับตัวอย่างสำหรับการสาธิต",
      edition: "ฉบับทดลอง",
      edition_year: 2554,
      page_number: 120,
      quote: "ข้อมูลตัวอย่างเพื่อสาธิตรูปแบบหลักฐานเท่านั้น",
      is_official: false,
    },
    comparison: {
      emphasis: "วิธีทำงานและความคุ้มค่าของทรัพยากร",
      use_when: "อธิบายกระบวนการที่ให้ผลดีโดยใช้ทรัพยากรเหมาะสม",
      example: "ทีมปรับขั้นตอนเพื่อเพิ่มประสิทธิภาพการทำงาน",
      common_confusion: "มักสับสนกับประสิทธิผล ซึ่งเน้นผลสำเร็จมากกว่าวิธีการ",
    },
    keywords: ["ทำงาน", "ทรัพยากร", "คุ้มค่า", "ประสิทธิภาพ"],
  },
  {
    headword: "ประสิทธิผล",
    score: 0.88,
    pos: "น.",
    definition: "ผลสำเร็จที่เกิดขึ้นตามเป้าหมายที่ตั้งไว้",
    ai_explanation:
      "ตัวอย่างนี้เน้นการบรรลุเป้าหมาย มากกว่าปริมาณทรัพยากรที่ใช้",
    registers: ["ทางการ"],
    contexts: ["การทำงาน"],
    comparison: {
      emphasis: "ผลลัพธ์ที่บรรลุตามเป้าหมาย",
      use_when: "ประเมินว่างานหรือมาตรการทำให้เกิดผลที่ต้องการหรือไม่",
      example: "มาตรการนี้มีประสิทธิผลตามเป้าหมายที่กำหนด",
      common_confusion: "ไม่ได้บอกโดยตรงว่าใช้ทรัพยากรคุ้มค่าเพียงใด",
    },
    keywords: ["ทำงาน", "เป้าหมาย", "สำเร็จ", "ประสิทธิผล"],
  },
  {
    headword: "สัมฤทธิผล",
    score: 0.84,
    pos: "น.",
    definition: "ผลสำเร็จตามความมุ่งหมาย",
    ai_explanation:
      "ใช้กล่าวถึงความสำเร็จของงานหรือความพยายามในตัวอย่างงานเขียน",
    registers: ["ทางการ"],
    contexts: ["งานเขียน"],
    keywords: ["ทำงาน", "สำเร็จ", "รายงาน", "สัมฤทธิผล"],
  },
  {
    headword: "มัธยัสถ์",
    score: 0.78,
    pos: "ก.",
    definition: "ใช้จ่ายอย่างประหยัดและระมัดระวัง",
    ai_explanation: "ตัวอย่างนี้เน้นความประหยัดในการใช้จ่าย",
    registers: ["ทั่วไป"],
    contexts: ["ชีวิตประจำวัน"],
    keywords: ["ประหยัด", "ทรัพยากร", "มัธยัสถ์"],
  },
  {
    headword: "ร่วมมือ",
    score: 0.92,
    pos: "ก.",
    definition: "ช่วยกันทำกิจกรรมหรืองานให้บรรลุจุดมุ่งหมาย",
    ai_explanation: "สื่อถึงการลงมือทำงานด้วยกัน",
    registers: ["ทั่วไป"],
    contexts: ["การทำงาน"],
    keywords: ["ช่วยกัน", "ร่วมกัน", "ร่วมมือ", "สามัคคี"],
  },
  {
    headword: "ประสานงาน",
    score: 0.87,
    pos: "ก.",
    definition: "เชื่อมโยงการทำงานของหลายฝ่ายให้สอดคล้องกัน",
    ai_explanation: "เน้นการติดต่อและจัดงานระหว่างฝ่าย",
    registers: ["ทางการ"],
    contexts: ["การทำงาน"],
    keywords: ["ช่วยกัน", "ร่วมกัน", "ประสานงาน"],
  },
  {
    headword: "กรุณารอสักครู่",
    score: 0.9,
    definition: "ข้อความสุภาพสำหรับขอให้อีกฝ่ายรอช่วงเวลาสั้น ๆ",
    ai_explanation:
      "เป็นตัวอย่างข้อความสำหรับการสื่อสาร ไม่ใช่หัวคำที่ยืนยันจากพจนานุกรม",
    registers: ["สุภาพ"],
    contexts: ["การสนทนา"],
    keywords: ["รอ", "สุภาพ"],
  },
  {
    headword: "วิจัย",
    score: 0.93,
    pos: "ก.",
    definition: "ศึกษาอย่างเป็นระบบเพื่อค้นหาหรือตรวจสอบความรู้",
    ai_explanation: "ใช้ในตัวอย่างบริบททางวิชาการ",
    registers: ["วิชาการ"],
    contexts: ["การศึกษา"],
    keywords: ["วิจัย", "ศึกษา", "ความรู้", "วิชาการ"],
  },
];
export function mockSearch(
  query: string,
  mode: SearchResponse["mode"] = "demo",
): SearchResponse {
  const excluded = [
    ...query.matchAll(
      /(?:ไม่เอา|ไม่ใช้|ไม่อยากใช้)(?:คำว่า)?[ “"']*([^ ”"',，]+)/g,
    ),
  ].map((x) => x[1]);
  const normalized = query.toLowerCase();
  const recommendations = entries
    .filter(
      (e) =>
        !excluded.includes(e.headword) &&
        e.keywords.some((k) => normalized.includes(k)),
    )
    .map(({ keywords, ...r }) => r);
  return {
    query_understanding: {
      raw_query: query,
      detected_meaning: query,
      excluded_words: excluded,
    },
    recommendations,
    mode,
    notice:
      mode === "fallback"
        ? "เชื่อมต่อบริการค้นหาไม่ได้ ขณะนี้แสดงข้อมูลเดโม"
        : "ข้อมูลเดโม — คำอธิบายและคะแนนเป็นตัวอย่าง ยังไม่ใช่ผลค้นหาหรือหลักฐานที่รับรอง",
  };
}
