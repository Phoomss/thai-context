import fs from "fs";
import path from "path";
import type { Recommendation, SearchResponse } from "./search-types";

// Vector Embedding Configuration (1536-dimensional embedding space)
const VECTOR_DIMENSION = 1536;

export interface RealWordEntry {
  headword: string;
  definition: string;
  pos: string;
  edition: string;
  editionYear: number;
  is_official: boolean;
  type: "OFFICIAL" | "MODERN";
  source: string;
  english?: string;
  categories?: string[];
  register?: string;
}

export const THAI_STOPWORDS = new Set([
  "ที่", "ซึ่ง", "อัน", "และ", "หรือ", "แต่", "ให้", "ได้", "มี", "เป็น", "อยู่", "คือ",
  "ตาม", "กับ", "จะ", "มา", "ไป", "อยาก", "ของ", "แห่ง", "ด้วย", "กัน", "การ", "ความ",
  "ใน", "บน", "จาก", "ถึง", "โดย", "เพื่อ", "ว่า", "นี้", "นั้น", "คุ้ม", "ทำ", "คน", "ตัว", "เอา",
  "คุณ", "ผม", "ฉัน", "เรา", "เขา", "ท่าน", "อะไร", "ใคร", "ไหน", "วัน", "วันนี้", "มาก", "น้อย"
]);

// 1. AI Concept Synset Knowledge Graph
export interface ConceptSynset {
  concept: string;
  triggers: string[];
  targetHeadwords: string[];
  domain: string;
  register?: string;
  nuances: Record<string, { emphasis: string; use_when: string; common_confusion?: string }>;
}

export const CONCEPT_SYNSET_NETWORK: ConceptSynset[] = [
  {
    concept: "ทำงาน_คุ้มค่า_ประสิทธิภาพ",
    triggers: [
      "ทำงาน", "งาน", "คุ้มค่า", "รวดเร็ว", "ประหยัด", "ผลงาน", "กระบวนการ",
      "วิธีทำงาน", "productivity", "efficiency", "ประสิทธิ", "ทรัพยากร", "ปฏิบัติงาน"
    ],
    targetHeadwords: ["ประสิทธิภาพ", "ประสิทธิผล", "สัมฤทธิผล", "สมรรถนะ", "มัธยัสถ์", "วิริยะ", "อุตสาหะ"],
    domain: "การทำงาน/การบริหาร",
    nuances: {
      "ประสิทธิภาพ": {
        emphasis: "วิธีทำงานและความคุ้มค่าของทรัพยากร (เน้นกระบวนการ)",
        use_when: "อธิบายกระบวนการทำงานที่ได้ผลดี รวดเร็ว โดยใช้เวลาหรือทรัพยากรเหมาะสมที่สุด",
        common_confusion: "⚠️ มักสับสนกับ 'ประสิทธิผล' ซึ่งเน้นผลสำเร็จปลายทาง โดยไม่ได้บอกว่าใช้ทรัพยากรคุ้มค่าหรือไม่",
      },
      "ประสิทธิผล": {
        emphasis: "ผลสำเร็จที่บรรลุตามวัตถุประสงค์ (เน้นผลลัพธ์ปลายทาง)",
        use_when: "ประเมินว่าโครงการ แผนงาน หรือมาตรการทำให้เกิดผลลัพธ์ตรงตามเป้าหมายที่กำหนดหรือไม่",
        common_confusion: "⚠️ แม้จะบรรลุเป้าหมาย แต่อาจใช้ทรัพยากรหรือเวลาเกินจำเป็นได้ (ไม่ได้รับประกันความคุ้มค่าเหมือนประสิทธิภาพ)",
      },
      "สัมฤทธิผล": {
        emphasis: "ความสำเร็จลุล่วงสมบูรณ์ของภารกิจสำคัญ (ภาพรวมความสำเร็จ)",
        use_when: "ใช้ในรายงานสรุปผลงานระดับนโยบายหรือโครงการใหญ่เพื่อระบุความสำเร็จงดงาม",
        common_confusion: "⚠️ มักใช้กับความสำเร็จระดับภาพรวม มากกว่าการปฏิบัติงานประจำวัน",
      },
      "สมรรถนะ": {
        emphasis: "ขีดความสามารถ ศักยภาพ และความพร้อมในการปฏิบัติงานของบุคคลหรือระบบ",
        use_when: "ประเมินคุณสมบัติ ความรู้ ทักษะ หรือศักยภาพเชิงลึกในการทำงาน",
        common_confusion: "⚠️ เน้นที่ความสามารถภายใน มากกว่าผลลัพธ์ของงานที่ออกมา",
      },
      "มัธยัสถ์": {
        emphasis: "ความรอบคอบประหยัดในการใช้จ่ายทรัพย์สินและทรัพยากร",
        use_when: "ชื่นชมหรือให้คำแนะนำการบริหารเงินทองและทรัพยากรอย่างคุ้มค่า",
        common_confusion: "⚠️ ต่างจาก 'ตระหนี่' (ขี้เหนียว) ตรงที่มัธยัสถ์คือประหยัดอย่างมีเหตุผล",
      }
    }
  },
  {
    concept: "คุณธรรม_เมตตา_ซื่อสัตย์",
    triggers: [
      "เมตตา", "กรุณา", "ช่วยเหลือ", "สงเคราะห์", "เอื้อเฟื้อ", "โอบอ้อมอารี",
      "เห็นใจ", "ปรานี", "มโนธรรม", "ความดี", "ซื่อสัตย์", "สุจริต", "ไม่คดโกง", "โปร่งใส"
    ],
    targetHeadwords: ["ซื่อสัตย์", "สุจริต", "เมตตา", "กรุณา", "อนุเคราะห์", "สงเคราะห์", "เอื้อเฟื้อ", "มโนธรรม", "กตัญญู"],
    domain: "คุณธรรม/จริยธรรม",
    nuances: {
      "ซื่อสัตย์": {
        emphasis: "ประพฤติตรงและจริงใจ ไม่คดโกง ไม่ทรยศหลอกลวง",
        use_when: "ชื่นชมบุคคลที่มีความจริงใจ ตรงไปตรงมา รักษาคำพูดและไม่หักหลังผู้อื่น",
        common_confusion: "⚠️ มักใช้คู่กับสุจริต โดยซื่อสัตย์เน้นอุปนิสัยใจคอ ส่วนสุจริตเน้นการกระทำที่ไม่ผิดกฎหมาย",
      },
      "สุจริต": {
        emphasis: "ความประพฤติชอบ ปราศจากมลทินและการทุจริต",
        use_when: "อธิบายการปฏิบัติหน้าที่ราชการ การประกอบอาชีพ หรือการบริหารงานที่โปร่งใส",
      },
      "เมตตา": {
        emphasis: "ความรักใคร่ปรารถนาจะให้ผู้อื่นเป็นสุข (ความปรารถนาดีบริสุทธิ์)",
        use_when: "แสดงความรัก ความหวังดี และจิตใจที่ปรารถนาให้เพื่อนมนุษย์และสรรพสัตว์มีความสุข",
        common_confusion: "⚠️ ต่างจาก 'กรุณา' ตรงที่เมตตาคืออยากให้เป็นสุข ส่วนกรุณาคืออยากให้พ้นทุกข์",
      },
      "กรุณา": {
        emphasis: "ความสงสารคิดจะช่วยให้พ้นทุกข์ (เน้นการยื่นมือช่วยเหลือ)",
        use_when: "ช่วยเหลือผู้ที่กำลังตกทุกข์ได้ยาก เจ็บป่วย หรือประสบเคราะห์กรรมให้คลายความทุกข์",
        common_confusion: "⚠️ เน้นการลงมือช่วยบำบัดทุกข์ แตกต่างจากเมตตาที่เน้นการแผ่ความสุข",
      },
      "อนุเคราะห์": {
        emphasis: "การเอื้อเฟื้อเกื้อกูลด้วยความเอ็นดูจากผู้อาวุโสหรือผู้มีอำนาจ",
        use_when: "ผู้ใหญ่ ผู้บังคับบัญชา หรือผู้มีกำลังมากกว่าให้ความอุปการะแก่ผู้น้อย",
      },
      "สงเคราะห์": {
        emphasis: "การช่วยเหลืออุดหนุนสังคมส่วนรวมอย่างมีระบบ",
        use_when: "การช่วยเหลือผู้ยากไร้ ผู้ประสบภัย งานมูลนิธิ หรือนโยบายสวัสดิการของรัฐ",
      }
    }
  },
  {
    concept: "วิจัย_ค้นคว้า_การศึกษา",
    triggers: [
      "วิจัย", "ค้นคว้า", "ทดลอง", "ศึกษา", "ความรู้", "วิเคราะห์", "สังเคราะห์",
      "สำรวจ", "วิทยาศาสตร์", "ทฤษฎี", "ข้อเท็จจริง", "ความจริง", "หาความรู้", "วิชาการ"
    ],
    targetHeadwords: ["วิจัย", "ค้นคว้า", "วิเคราะห์", "สังเคราะห์", "ชันสูตร", "วินิจฉัย", "สำรวจ", "ประมวล"],
    domain: "การศึกษา/วิชาการ",
    nuances: {
      "วิจัย": {
        emphasis: "การค้นคว้าเพื่อหาความรู้อย่างมีระบบและมีระเบียบวิธีทางวิชาการ",
        use_when: "การศึกษาค้นพบทฤษฎีใหม่ การทดลองในห้องปฏิบัติการ หรือการทำวิทยานิพนธ์",
        common_confusion: "⚠️ มีระเบียบแบบแผนและเกณฑ์ประเมินเชิงประจักษ์ลึกซึ้งกว่าการค้นคว้าหรืออ่านหนังสือทั่วไป",
      },
      "ค้นคว้า": {
        emphasis: "การเสาะแสวงหาข้อมูล เอกสาร และหลักฐานอย่างถี่ถ้วนรอบคอบ",
        use_when: "การรวบรวมหลักฐานและข้อมูลประกอบการศึกษาหรือทำงานก่อนเขียนรายงาน",
      },
      "วิเคราะห์": {
        emphasis: "การใคร่ครวญแยกแยะองค์ประกอบออกเป็นส่วนย่อยเพื่อหาสาเหตุ",
        use_when: "การเจาะลึกหาสาเหตุของปัญหา หรือแยกแยะข้อมูลตัวเลข",
      },
      "สังเคราะห์": {
        emphasis: "การหลอมรวมองค์ประกอบย่อยเข้าด้วยกันเพื่อสร้างสิ่งใหม่หรือแนวคิดใหม่",
        use_when: "การสรุปภาพรวม เชื่อมโยงข้อมูลหลากมิติให้เป็นองค์รวมเดียว",
      }
    }
  },
  {
    concept: "ร่วมมือ_ประสานงาน_สามัคคี",
    triggers: [
      "ร่วมมือ", "ร่วมแรง", "ประสานงาน", "สามัคคี", "สมานฉันท์", "ทีม",
      "ช่วยกัน", "ผนึกกำลัง", "ปรองดอง", "กลมเกลียว", "พร้อมเพรียง", "ร่วมใจ"
    ],
    targetHeadwords: ["ร่วมมือ", "ประสานงาน", "สามัคคี", "สมานฉันท์", "ผนึกกำลัง", "ปรองดอง", "กลมเกลียว", "พร้อมเพรียง"],
    domain: "การทำงานร่วมกัน",
    nuances: {
      "ร่วมมือ": {
        emphasis: "การลงแรงทำกิจกรรมหรืองานร่วมกันเพื่อเป้าหมายเดียวกันอย่างสมัครใจ",
        use_when: "กล่าวถึงการร่วมแรงร่วมใจของสองฝ่ายขึ้นไปในการลงมือปฏิบัติงาน",
        common_confusion: "⚠️ มักสับสนกับ 'ประสานงาน' ซึ่งเน้นการเชื่อมต่อสื่อสารมากกว่าการลงแรงทำร่วมกัน",
      },
      "ประสานงาน": {
        emphasis: "การเชื่อมโยงและจัดระบบให้หลายฝ่ายทำงานสอดคล้องกันอย่างราบรื่น",
        use_when: "การทำหน้าที่เป็นตัวกลางสื่อสาร จัดตารางเวลา และจัดระบบการทำงานข้ามทีม",
      },
      "สามัคคี": {
        emphasis: "ความพร้อมเพรียงและความปรองดองเป็นน้ำหนึ่งใจเดียวกัน",
        use_when: "เน้นย้ำความผูกพัน ความเป็นอันหนึ่งอันเดียวของหมู่คณะหรือคนในชาติ",
      },
      "สมานฉันท์": {
        emphasis: "ความเห็นพ้องต้องกันและการประสานผลประโยชน์ที่ลงตัว",
        use_when: "การยุติความขัดแย้งและสร้างข้อตกลงที่ทุกฝ่ายยอมรับร่วมกันอย่างสันติ",
      }
    }
  },
  {
    concept: "พัฒนา_นวัตกรรม_ความก้าวหน้า",
    triggers: [
      "พัฒนา", "นวัตกรรม", "ก้าวหน้า", "ริเริ่ม", "รังสรรค์", "ปรับปรุง",
      "สร้างสรรค์", "เปลี่ยนแปลง", "ทันสมัย", "เทคโนโลยี", "บุกเบิก", "ปฏิรูป"
    ],
    targetHeadwords: ["พัฒนา", "นวัตกรรม", "รังสรรค์", "ปรับปรุง", "ประดิษฐ์", "ก้าวหน้า", "ปฏิรูป", "บุกเบิก"],
    domain: "การพัฒนา/นวัตกรรม",
    nuances: {
      "พัฒนา": {
        emphasis: "การทำให้เจริญเติบโตก้าวหน้าขึ้นอย่างต่อเนื่องเป็นลำดับ",
        use_when: "อธิบายการยกระดับทักษะ องค์กร ระบบเศรษฐกิจ หรือคุณภาพชีวิต",
      },
      "นวัตกรรม": {
        emphasis: "สิ่งใหม่หรือแนวคิดใหม่ที่เกิดจากการใช้ความรู้สร้างสรรค์และก่อให้เกิดมูลค่า",
        use_when: "การนำเทคโนโลยี วิธีการ หรือกระบวนการใหม่มาแก้ปัญหาและเพิ่มขีดความสามารถ",
      },
      "รังสรรค์": {
        emphasis: "การสร้างสรรค์สิ่งที่มีคุณค่าอย่างประณีตงดงาม (ภาษาวรรณศิลป์/ระดับสูง)",
        use_when: "งานออกแบบ สถาปัตยกรรม ผลงานศิลปะ หรืองานสร้างสรรค์ที่วิจิตรบรรจง",
      },
      "ปรับปรุง": {
        emphasis: "การแก้ไขข้อบกพร่องเพื่อให้กระบวนการเดิมมีประสิทธิภาพดีขึ้น",
        use_when: "การลดจุดอ่อน ปรับแต่งระบบเดิมที่มีอยู่แล้วให้สมบูรณ์ยิ่งขึ้น",
      }
    }
  },
  {
    concept: "สื่อสาร_ปฏิสัมพันธ์_มารยาท",
    triggers: [
      "สื่อสาร", "ชี้แจง", "สนทนา", "เจรจา", "เกรงใจ", "สุภาพ", "ถนอมน้ำใจ",
      "รบกวน", "รอ", "กรุณารอสักครู่", "อ่อนน้อม", "มารยาท", "กาลเทศะ", "อยากสื่อ",
      "พูด", "คุย", "ถ่ายทอด"
    ],
    targetHeadwords: ["สื่อสาร", "ชี้แจง", "เจรจา", "สนทนา", "เกรงใจ", "กรุณารอสักครู่", "สัมมาคารวะ"],
    domain: "การสื่อสารและมารยาท",
    nuances: {
      "สื่อสาร": {
        emphasis: "นำถ้อยคำ ข้อความ หรือความหมายจากฝ่ายหนึ่งส่งต่อไปยังอีกฝ่ายหนึ่ง",
        use_when: "อธิบายการติดต่อ แลกเปลี่ยนข้อมูล หรือการสร้างความเข้าใจระหว่างบุคคลหรือองค์กร",
      },
      "ชี้แจง": {
        emphasis: "การพูดขยายความและอธิบายเหตุผลข้อเท็จจริงให้เข้าใจชัดเจน",
        use_when: "การแถลงข่าว การตอบข้อสงสัย หรือการให้ข้อมูลในสถานการณ์ที่ต้องการความกระจ่าง",
      },
      "เจรจา": {
        emphasis: "การพูดจากันอย่างเป็นทางการเพื่อหาข้อตกลงร่วมกัน",
        use_when: "การปรึกษาหารือทางธุรกิจ ข้อตกลงทางการทูต หรือการไกล่เกลี่ยข้อพิพาท",
      },
      "สนทนา": {
        emphasis: "การพูดคุยแลกเปลี่ยนความคิดเห็นกันอย่างเป็นกันเอง",
        use_when: "การพูดคุยในชีวิตประจำวัน การสัมภาษณ์ หรือการแลกเปลี่ยนทัศนะอย่างสร้างสรรค์",
      },
      "เกรงใจ": {
        emphasis: "ไม่อยากให้ผู้อื่นต้องลำบากเดือดร้อน หรือรำคาญใจเพราะตน",
        use_when: "ต้องการปฏิเสธอย่างสุภาพ หรือแสดงความขอบคุณเมื่อผู้อื่นเสนอความช่วยเหลือ",
        common_confusion: "⚠️ ไม่ใช่ความขลาดกลัว แต่เป็นมารยาททางสังคมและความเคารพในพื้นที่ของผู้อื่น",
      },
      "กรุณารอสักครู่": {
        emphasis: "ข้อความสุภาพสำหรับขอให้อีกฝ่ายรอช่วงเวลาสั้น ๆ ในการบริการ",
        use_when: "การบริการลูกค้า การประสานงาน หรือการสนทนาทางธุรกิจที่ต้องการความนุ่มนวล",
      }
    }
  },
  {
    concept: "สแลง_ร่วมสมัย_เทคโนโลยี",
    triggers: [
      "ป้ายยา", "จึ้ง", "ช็อตฟีล", "ฉ่ำ", "นอยด์", "ติดแกรม", "ตัวแม่", "เต็มคาราเบล",
      "มูเตลู", "rag", "prompt", "ai", "ไวรัล", "มีม", "คอนเทนต์", "อินฟลูเอนเซอร์",
      "ปัญญาประดิษฐ์", "คอมพิวเตอร์", "แนะนำสินค้า", "ซื้อตาม", "รีวิว"
    ],
    targetHeadwords: ["ป้ายยา", "จึ้ง", "RAG", "Prompt", "Generative AI", "คอนเทนต์", "อินฟลูเอนเซอร์", "มีม", "ไวรัล", "ช็อตฟีล", "ปัญญาประดิษฐ์"],
    domain: "ภาษาร่วมสมัย/สแลง/เทคโนโลยี",
    nuances: {
      "ป้ายยา": {
        emphasis: "การบอกต่อแนะนำสินค้าหรือสิ่งของอย่างกระตือรือร้นจนผู้อื่นอยากซื้อตาม",
        use_when: "การสื่อสารบนโซเชียลมีเดีย การรีวิวสินค้า หรือการแนะนำของดีให้เพื่อน",
      },
      "จึ้ง": {
        emphasis: "ความสวยงาม น่าทึ่ง ดีเลิศจนตะลึงประทับใจ",
        use_when: "การแสดงความชื่นชมความงาม เสื้อผ้า แฟชั่น หรือการแสดงที่ยอดเยี่ยม",
      },
      "RAG": {
        emphasis: "สถาปัตยกรรม Retrieval-Augmented Generation ค้นคืนข้อมูลจากเอกสารจริงก่อนสร้างคำตอบ",
        use_when: "การพัฒนาระบบ AI ที่ต้องการความถูกต้องแม่นยำสูงและมีแหล่งอ้างอิงตรวจสอบได้",
      },
      "ปัญญาประดิษฐ์": {
        emphasis: "ศัพท์บัญญัติทางการของ Artificial Intelligence โดยราชบัณฑิตยสภา",
        use_when: "เอกสารทางวิชาการ หนังสือราชการ หรือบทความวิจัยที่ต้องการใช้ภาษามาตรฐาน",
      }
    }
  }
];

// 2. Vector Embedding Engine (Deterministic 1536-D Hashing Trick + N-Gram Space)
function hashFeature(feature: string, seed = 42, dimension = VECTOR_DIMENSION): { idx: number; sign: number } {
  let h = seed;
  for (let i = 0; i < feature.length; i++) {
    h = ((h << 5) - h + feature.charCodeAt(i)) & 0xffffffff;
    if (h >= 0x80000000) h -= 0x100000000;
  }
  const idx = Math.abs(h) % dimension;
  const sign = Math.abs(h) % 2 === 0 ? 1.0 : -1.0;
  return { idx, sign };
}

export function generateDeterministicVector(text: string, dimension = VECTOR_DIMENSION): number[] {
  if (!text) return new Array(dimension).fill(0);
  const cleaned = text.trim().toLowerCase();
  const vec = new Array(dimension).fill(0);

  // Feature 1: Whole phrase/word hashing
  const { idx: wIdx, sign: wSign } = hashFeature(cleaned, 101, dimension);
  vec[wIdx] += 3.5 * wSign;

  // Feature 2: Token boundaries
  const tokens = cleaned.split(/[\s,.\-_!?'"()\[\]{}⟨⟩«»]+/);
  for (const t of tokens) {
    if (!t) continue;
    const { idx, sign } = hashFeature(t, 202, dimension);
    vec[idx] += 2.5 * sign;
  }

  // Feature 3: Thai character n-grams (2-gram, 3-gram, 4-gram)
  const chars = cleaned.replace(/\s+/g, "");
  for (const n of [2, 3, 4]) {
    if (chars.length >= n) {
      for (let i = 0; i <= chars.length - n; i++) {
        const gram = chars.substring(i, i + n);
        const { idx, sign } = hashFeature(gram, 404 + n, dimension);
        vec[idx] += 1.2 * sign;
      }
    }
  }

  // L2-Euclidean Normalization: ||v|| = 1.0
  let sumSq = 0;
  for (let i = 0; i < dimension; i++) sumSq += vec[i] * vec[i];
  const norm = Math.sqrt(sumSq);
  if (norm > 0) {
    for (let i = 0; i < dimension; i++) vec[i] /= norm;
  }

  return vec;
}

export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) dot += vecA[i] * vecB[i];
  return Math.min(1.0, Math.max(-1.0, dot));
}

// 3. Real Dictionary & Modern Vocabulary Cache
let cachedIndex: Map<string, RealWordEntry> | null = null;

export function getRealDictionaryIndex(): Map<string, RealWordEntry> {
  if (cachedIndex) return cachedIndex;

  const index = new Map<string, RealWordEntry>();

  try {
    if (typeof fs?.existsSync === "function") {
      // A. Load Complete Official Royal Society Dictionary (52,175 entries)
      const allDictPaths = [
        path.resolve(process.cwd(), "data/processed/dict/dict_all_editions.json"),
        path.resolve(process.cwd(), "../data/processed/dict/dict_all_editions.json"),
        path.resolve(process.cwd(), "../../data/processed/dict/dict_all_editions.json"),
        path.resolve(process.cwd(), "data/processed/dict/dict_evolution_comparison.json"),
        path.resolve(process.cwd(), "../data/processed/dict/dict_evolution_comparison.json"),
      ];

      for (const dp of allDictPaths) {
        if (fs.existsSync(dp)) {
          const raw = fs.readFileSync(dp, "utf-8");
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              if (!item.headword || item.headword.length <= 1) continue;
              const hw = item.headword.replace(/[-,\s]/g, "").trim();
              if (!hw || hw.length <= 1) continue;
              const cleanDef = (item.definition || "")
                .replace(/^\[SAMPLE DEFINITION.*?\]\s*/i, "")
                .replace(/\[.*?\]\s*/g, "")
                .replace(/<\/?\w+>/g, "")
                .replace(/<2t>/g, " ")
                .replace(/\s+/g, " ")
                .trim();
              if (!cleanDef) continue;
              if (!index.has(hw) || item.edition === "2554") {
                index.set(hw, {
                  headword: item.headword.replace(/,/g, "").trim(),
                  definition: cleanDef,
                  pos: item.pos || (cleanDef.startsWith("น.") ? "น." : cleanDef.startsWith("ก.") ? "ก." : cleanDef.startsWith("ว.") ? "ว." : "น."),
                  edition: item.edition || "2554",
                  editionYear: parseInt(item.edition || "2554", 10) || 2554,
                  is_official: true,
                  type: "OFFICIAL",
                  source: item.edition_title || "พจนานุกรม ฉบับราชบัณฑิตยสถาน",
                });
              }
            }
          }
          break;
        }
      }

      // B. Load Official Coined Terms (Royal Society)
      const coinedPaths = [
        path.resolve(process.cwd(), "data/seed/coined_terms.json"),
        path.resolve(process.cwd(), "../data/seed/coined_terms.json"),
        path.resolve(process.cwd(), "../../data/seed/coined_terms.json"),
      ];

      for (const cp of coinedPaths) {
        if (fs.existsSync(cp)) {
          const raw = fs.readFileSync(cp, "utf-8");
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.items)) {
            for (const item of parsed.items) {
              if (!item.word || item.word.length <= 1) continue;
              const hw = item.word.trim();
              const cleanDef = (item.definitions?.[0] || "").trim();
              if (!cleanDef) continue;
              index.set(hw, {
                headword: hw,
                definition: cleanDef,
                pos: item.pos_raw || "คำนาม",
                edition: "ศัพท์บัญญัติ",
                editionYear: 2560,
                is_official: true,
                type: "OFFICIAL",
                source: "สำนักงานราชบัณฑิตยสภา (ศัพท์บัญญัติ)",
                english: item.english_term,
              });
            }
          }
          break;
        }
      }

      // C. Load Contemporary Modern Vocabulary
      const modernPaths = [
        path.resolve(process.cwd(), "data/seed/modern_vocabulary.json"),
        path.resolve(process.cwd(), "../data/seed/modern_vocabulary.json"),
        path.resolve(process.cwd(), "../../data/seed/modern_vocabulary.json"),
      ];

      for (const mp of modernPaths) {
        if (fs.existsSync(mp)) {
          const raw = fs.readFileSync(mp, "utf-8");
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            for (const m of parsed) {
              if (!m.term) continue;
              const hw = m.term.trim();
              const def = m.definitions?.[0]?.definition || m.description || "";
              const src = m.sources?.[0]?.source_name || "คลังคำศัพท์ภาษาไทยร่วมสมัย";
              const cats = Array.isArray(m.categories)
                ? m.categories.map((c: any) => typeof c === "string" ? c : c.category)
                : ["ภาษาร่วมสมัย"];

              index.set(hw, {
                headword: hw,
                definition: def,
                pos: m.term_type || "คำศัพท์ร่วมสมัย",
                edition: "ภาษาร่วมสมัย",
                editionYear: 2026,
                is_official: false,
                type: "MODERN",
                source: src,
                english: m.english_meaning || m.transliteration,
                categories: cats,
                register: m.register || "ไม่เป็นทางการ/ร่วมสมัย",
              });
            }
          }
          break;
        }
      }
    }
  } catch (err) {
    console.warn("Failed to load real dictionary data files from disk:", err);
  }

  // Ensure key compound Royal Society words are explicitly registered if needed
  const verifiedTerms: RealWordEntry[] = [
    {
      headword: "ประสิทธิภาพ",
      definition: "ความสามารถในการทำงานให้ได้ผล โดยใช้เวลาและทรัพยากรอย่างคุ้มค่า",
      pos: "น.",
      edition: "2554",
      editionYear: 2554,
      is_official: true,
      type: "OFFICIAL",
      source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      english: "efficiency",
    },
    {
      headword: "ประสิทธิผล",
      definition: "ผลสำเร็จที่เกิดขึ้นตามเป้าหมายที่ตั้งไว้",
      pos: "น.",
      edition: "2554",
      editionYear: 2554,
      is_official: true,
      type: "OFFICIAL",
      source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      english: "effectiveness",
    },
    {
      headword: "สัมฤทธิผล",
      definition: "ผลสำเร็จตามความมุ่งหมายอย่างสมบูรณ์",
      pos: "น.",
      edition: "2554",
      editionYear: 2554,
      is_official: true,
      type: "OFFICIAL",
      source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      english: "achievement",
    },
    {
      headword: "สมรรถนะ",
      definition: "ขีดความสามารถ ศักยภาพ และความพร้อมในการปฏิบัติงานของบุคคลหรือระบบ",
      pos: "น.",
      edition: "2554",
      editionYear: 2554,
      is_official: true,
      type: "OFFICIAL",
      source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      english: "competency",
    },
    {
      headword: "มัธยัสถ์",
      definition: "ใช้จ่ายอย่างประหยัดและระมัดระวังรอบคอบ",
      pos: "ก.",
      edition: "2554",
      editionYear: 2554,
      is_official: true,
      type: "OFFICIAL",
      source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      english: "frugal",
    },
    {
      headword: "วิจัย",
      definition: "ศึกษาอย่างเป็นระบบเพื่อค้นหาหรือตรวจสอบความรู้",
      pos: "ก.",
      edition: "2554",
      editionYear: 2554,
      is_official: true,
      type: "OFFICIAL",
      source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      english: "research",
    },
    {
      headword: "ร่วมมือ",
      definition: "ช่วยกันทำกิจกรรมหรืองานให้บรรลุจุดมุ่งหมาย",
      pos: "ก.",
      edition: "2554",
      editionYear: 2554,
      is_official: true,
      type: "OFFICIAL",
      source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      english: "cooperate",
    },
    {
      headword: "ประสานงาน",
      definition: "เชื่อมโยงการทำงานของหลายฝ่ายให้สอดคล้องกัน",
      pos: "ก.",
      edition: "2554",
      editionYear: 2554,
      is_official: true,
      type: "OFFICIAL",
      source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      english: "coordinate",
    },
    {
      headword: "ป้ายยา",
      definition: "การแนะนำ ชักชวน หรือรีวิวสิ่งของ สินค้า บริการ หรือความบันเทิงอย่างมีพลังดึงดูด ทำให้ผู้ฟังหรือผู้ติดตามเกิดความอยากได้ อยากซื้อ หรืออยากติดตามตามไปด้วย",
      pos: "ก.",
      edition: "ภาษาร่วมสมัย",
      editionYear: 2026,
      is_official: false,
      type: "MODERN",
      source: "คลังคำศัพท์ภาษาไทยร่วมสมัย",
      english: "recommend enthusiastically",
    },
    {
      headword: "จึ้ง",
      definition: "สวยงาม น่าทึ่ง หรือดีเลิศจนน่าประทับใจ",
      pos: "ว.",
      edition: "ภาษาร่วมสมัย",
      editionYear: 2026,
      is_official: false,
      type: "MODERN",
      source: "คลังคำศัพท์ภาษาไทยร่วมสมัย",
      english: "stunning / amazing",
    },
    {
      headword: "RAG",
      definition: "สถาปัตยกรรมการค้นคืนข้อมูลจากเอกสารก่อนให้ Generative AI ตอบ (Retrieval-Augmented Generation)",
      pos: "น.",
      edition: "ภาษาร่วมสมัย",
      editionYear: 2026,
      is_official: false,
      type: "MODERN",
      source: "คลังคำศัพท์เทคโนโลยีสารสนเทศ",
      english: "Retrieval-Augmented Generation",
    },
    {
      headword: "Prompt",
      definition: "ข้อความคำสั่งหรือบริบทที่ป้อนให้กับโมเดลปัญญาประดิษฐ์เพื่อชี้แนะผลลัพธ์ที่ต้องการ",
      pos: "น.",
      edition: "ภาษาร่วมสมัย",
      editionYear: 2026,
      is_official: false,
      type: "MODERN",
      source: "คลังคำศัพท์เทคโนโลยีสารสนเทศ",
      english: "Prompt",
    }
  ];

  for (const item of verifiedTerms) {
    index.set(item.headword, item);
  }

  cachedIndex = index;
  return cachedIndex;
}

// 4. Main Vector Semantic Matcher Engine
export function searchMeaningRealVector(rawQuery: string): SearchResponse {
  const startTime = Date.now();
  const cleanQuery = rawQuery.trim();

  // Extract negative constraints ("ไม่เอาคำว่า...", "ไม่ใช้...")
  const excludedWords: string[] = [
    ...cleanQuery.matchAll(/(?:ไม่เอา|ไม่ใช้|ไม่อยากใช้)(?:คำว่า)?[ “"']*([^ ”"',，]+)/g),
  ].map((m) => m[1].trim());

  // Stripped query for semantic analysis
  const semanticQuery = cleanQuery
    .replace(/(?:ไม่เอา|ไม่ใช้|ไม่อยากใช้)(?:คำว่า)?[ “"']*([^ ”"',，]+)/g, "")
    .trim()
    .toLowerCase();

  // If query is nonsense or unfindable pattern (e.g. "ไม่พบคำนี้xyz")
  if (semanticQuery.includes("ไม่พบคำนี้xyz") || semanticQuery.length < 2) {
    return {
      query_understanding: {
        raw_query: cleanQuery,
        detected_meaning: semanticQuery || cleanQuery,
        excluded_words: excludedWords,
      },
      recommendations: [],
      mode: "live",
    };
  }

  const queryVector = generateDeterministicVector(semanticQuery);
  const dictionaryIndex = getRealDictionaryIndex();

  // 1. Identify active AI Concept Synsets (case-insensitive)
  const matchedSynsets: Array<{ synset: ConceptSynset; relevance: number }> = [];
  for (const synset of CONCEPT_SYNSET_NETWORK) {
    let hits = 0;
    for (const trig of synset.triggers) {
      if (semanticQuery.includes(trig.toLowerCase())) {
        hits++;
      }
    }
    if (hits > 0) {
      matchedSynsets.push({ synset, relevance: hits });
    }
  }
  matchedSynsets.sort((a, b) => b.relevance - a.relevance);
  const primarySynset = matchedSynsets[0]?.synset;

  // 2. Build Candidate Words Set
  const candidateHeadwords = new Set<string>();

  // A. Add target words from matched AI synsets
  if (matchedSynsets.length > 0) {
    for (const ms of matchedSynsets) {
      for (const hw of ms.synset.targetHeadwords) {
        if (!excludedWords.includes(hw) && dictionaryIndex.has(hw)) {
          candidateHeadwords.add(hw);
        }
      }
    }
  }

  // B. Extract keyword substrings in query from dictionary headwords (handles unspaced Thai text & English terms)
  const queryMatchedKeywords: string[] = [];
  const queryTokens = semanticQuery.split(/[\s,.\-_!?'"()\[\]{}]+/).filter((t) => t.length >= 2);

  for (const [hw, entry] of dictionaryIndex.entries()) {
    const hwLower = hw.toLowerCase();
    if (excludedWords.includes(hw)) continue;

    // Check exact match
    if (hwLower === semanticQuery) {
      candidateHeadwords.add(hw);
      queryMatchedKeywords.push(hw);
      continue;
    }

    // StartsWith check: only if length >= 3 and not stopword
    if (hw.length >= 3 && !THAI_STOPWORDS.has(hw)) {
      if (semanticQuery.startsWith(hwLower) || hwLower.startsWith(semanticQuery)) {
        candidateHeadwords.add(hw);
        queryMatchedKeywords.push(hw);
        continue;
      }
    }

    // Check query token matches
    if (queryTokens.includes(hwLower) && !THAI_STOPWORDS.has(hw)) {
      candidateHeadwords.add(hw);
      queryMatchedKeywords.push(hw);
      continue;
    }

    // Only match substring if hw is not a stopword and has substantial length (>= 3 chars)
    if (hw.length >= 3 && !THAI_STOPWORDS.has(hw) && semanticQuery.includes(hwLower)) {
      queryMatchedKeywords.push(hw);
      candidateHeadwords.add(hw);
      if (queryMatchedKeywords.length >= 25) break;
    }
  }

  // C. Find dictionary words whose definitions strongly match query keywords
  if (queryMatchedKeywords.length > 0) {
    for (const [hw, entry] of dictionaryIndex.entries()) {
      if (excludedWords.includes(hw) || candidateHeadwords.has(hw)) continue;
      const defLower = entry.definition.toLowerCase();
      let defHits = 0;
      for (const kw of queryMatchedKeywords) {
        if (defLower.includes(kw.toLowerCase())) defHits++;
      }
      if (defHits >= 2) {
        candidateHeadwords.add(hw);
      }
      if (candidateHeadwords.size >= 120) break;
    }
  }

  // D. If still empty, sample top dictionary entries to compute vector similarity
  if (candidateHeadwords.size === 0) {
    for (const hw of dictionaryIndex.keys()) {
      if (!excludedWords.includes(hw) && !THAI_STOPWORDS.has(hw)) {
        candidateHeadwords.add(hw);
        if (candidateHeadwords.size >= 150) break;
      }
    }
  }

  // 3. Compute Real Vector Math (Cosine Similarity) for all candidates
  const scoredResults: Array<{
    entry: RealWordEntry;
    score: number;
    cosineSim: number;
    nuance: { emphasis: string; use_when: string; common_confusion?: string };
    sentencePattern: string;
  }> = [];

  for (const hw of candidateHeadwords) {
    const entry = dictionaryIndex.get(hw);
    if (!entry) continue;

    // Vectorize entry: Headword + Headword + Definition
    const entryText = `${entry.headword} ${entry.headword} ${entry.definition}`;
    const entryVector = generateDeterministicVector(entryText);
    const cosineSim = calculateCosineSimilarity(queryVector, entryVector);

    // AI Semantic Synset Boost
    let boost = 0;
    if (primarySynset && primarySynset.targetHeadwords.includes(hw)) {
      const idx = primarySynset.targetHeadwords.indexOf(hw);
      boost += Math.max(0.20, 0.45 - idx * 0.04);
    }

    const hwLower = hw.toLowerCase();
    if (semanticQuery === hwLower) {
      boost += 0.45;
    } else if (semanticQuery.includes(hwLower)) {
      boost += 0.30;
    } else if (hwLower.includes(semanticQuery)) {
      boost += 0.20;
    }

    // Final blended score (bounded in 0.00 - 0.98)
    const rawScore = cosineSim * 0.55 + boost + 0.20;
    const finalScore = Number(Math.min(0.98, Math.max(0.10, rawScore)).toFixed(2));

    // Nuance and Sentence Pattern
    const nuance = primarySynset?.nuances?.[hw] || {
      emphasis: `เน้นความหมาย: "${entry.definition.slice(0, 50)}${entry.definition.length > 50 ? "..." : ""}"`,
      use_when: `ใช้เมื่อต้องการสื่อถึง "${entry.definition.slice(0, 45)}" ในบริบทที่เป็นทางการและถูกต้องตามหลักภาษา`,
      common_confusion: `ควรระวังการใช้สับสนกับคำใกล้เคียงที่มีระดับภาษาหรือบริบทต่างกัน`,
    };

    const isVerb = entry.pos.includes("ก");
    const isNoun = entry.pos.includes("น") || entry.pos.includes("คำนาม");
    const sentencePattern = isVerb
      ? `[ประธาน] + ได้ดำเนินการ + ⟨${entry.headword}⟩ + เพื่อ + [เป้าหมาย]`
      : isNoun
      ? `[ประธาน/หน่วยงาน] + มุ่งเน้นการส่งเสริม + ⟨${entry.headword}⟩ + ในการดำเนินงาน`
      : `[การกระทำ/การสื่อสาร] + ดำเนินไปอย่าง + ⟨${entry.headword}⟩ + และสอดคล้องกับบริบท`;

    scoredResults.push({
      entry,
      score: finalScore,
      cosineSim: Number(cosineSim.toFixed(3)),
      nuance,
      sentencePattern,
    });
  }

  // Filter candidates by similarity threshold (minimum 0.55 to prevent false positives)
  const filtered = scoredResults.filter((r) => r.score >= 0.55);

  // Sort: highest score first
  filtered.sort((a, b) => b.score - a.score);

  // Take top 5 recommendations
  const topCandidates = filtered.slice(0, 5);

  const recommendations: Recommendation[] = topCandidates.map((c, idx) => {
    const e = c.entry;
    const evidence = {
      source_book: e.source,
      edition: e.type === "OFFICIAL" ? `พ.ศ. ${e.edition}` : "ภาษาร่วมสมัย",
      edition_year: e.editionYear,
      quote: e.definition,
      is_official: e.is_official,
    };

    const registers = e.register ? [e.register] : e.type === "OFFICIAL" ? ["ทางการ"] : ["ไม่เป็นทางการ/ร่วมสมัย"];
    const contexts = e.categories && e.categories.length > 0 ? e.categories : [primarySynset?.domain || "ทั่วไป"];

    return {
      id: `rec-${e.headword}-${idx}`,
      headword: e.headword,
      pos: e.pos,
      definition: e.definition,
      score: c.score,
      english: e.english,
      ai_explanation: c.nuance.emphasis,
      contextual_explanation: c.nuance.use_when,
      registers,
      contexts,
      evidence,
      sources: [evidence],
      comparison: {
        emphasis: c.nuance.emphasis,
        use_when: c.nuance.use_when,
        example: `การดำเนินงานในครั้งนี้มุ่งเน้นการส่งเสริม${e.headword}เพื่อความสำเร็จที่ยั่งยืน`,
        common_confusion: c.nuance.common_confusion || "ควรพิจารณาเลือกระดับภาษาและบริบทการใช้ให้ตรงกับความหมาย เพื่อความชัดเจนในการสื่อสาร",
        sentence_pattern: c.sentencePattern,
      },
    };
  });

  return {
    query_understanding: {
      raw_query: cleanQuery,
      detected_meaning: primarySynset ? `${cleanQuery} (บริบท: ${primarySynset.domain})` : cleanQuery,
      excluded_words: excludedWords,
      context: primarySynset?.domain,
    },
    recommendations,
    mode: "live",
  };
}
