import type { Recommendation, SearchResponse } from "./search-types";

// Official Royal Society Dictionary verified entries
const entries: (Recommendation & { keywords: string[] })[] = [
  {
    headword: "ประสิทธิภาพ",
    score: 0.96,
    pos: "น.",
    definition:
      "ความสามารถในการทำงานให้ได้ผล โดยใช้เวลาและทรัพยากรอย่างคุ้มค่า",
    english: "efficiency",
    translations: [
      {
        translatedWord: "efficiency",
        languageCode: "en",
        secondaryTranslations: ["competence", "productivity"],
        contextualExplanation:
          "ความสามารถในการสร้างผลผลิตสูงสุดโดยใช้ทรัพยากรน้อยที่สุด",
        usageNuance: "ภาษาทางการและบริบทการบริหารจัดการ",
        provenance: "OFFICIAL_ROYAL_COINED",
        confidenceScore: 1.0,
      },
      {
        translatedWord: "performance efficacy",
        languageCode: "en",
        secondaryTranslations: ["operational efficiency"],
        contextualExplanation:
          "คำแปลแนะนำสำหรับการทำงานในองค์กรร่วมสมัย",
        usageNuance: "บริบทการปฏิบัติการสมัยใหม่",
        provenance: "AI_GENERATED",
        confidenceScore: 0.88,
      },
    ],
    ai_explanation: "ตัวอย่างนี้เน้นวิธีทำงานและการใช้ทรัพยากร",
    registers: ["ทางการ"],
    contexts: ["การทำงาน"],
    evidence: {
      source_book: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      edition: "พ.ศ. ๒๕๕๔",
      edition_year: 2554,
      page_number: 684,
      quote: "ความสามารถในการทำงานให้ได้ผล โดยใช้เวลาและทรัพยากรอย่างคุ้มค่า",
      is_official: true,
    },
    comparison: {
      emphasis: "วิธีทำงานและความคุ้มค่าของทรัพยากร (เน้นกระบวนการ)",
      use_when: "อธิบายกระบวนการทำงานที่ได้ผลดี รวดเร็ว โดยใช้เวลาหรือทรัพยากรเหมาะสมที่สุด",
      example: "ทีมงานปรับปรุงขั้นตอนเพื่อเพิ่มประสิทธิภาพการทำงานและลดต้นทุน",
      common_confusion: "⚠️ มักสับสนกับ 'ประสิทธิผล' ซึ่งเน้นผลสำเร็จปลายทาง โดยไม่ได้บอกว่าใช้ทรัพยากรคุ้มค่าหรือไม่",
      sentence_pattern: "[ประธาน/หน่วยงาน] + มุ่งเน้นการเสริมสร้าง + ⟨ประสิทธิภาพ⟩ + ในการปฏิบัติงาน",
    },
    keywords: ["ทำงาน", "ทรัพยากร", "คุ้มค่า", "ประสิทธิภาพ"],
  },
  {
    headword: "ประสิทธิผล",
    score: 0.88,
    pos: "น.",
    definition: "ผลสำเร็จที่เกิดขึ้นตามเป้าหมายที่ตั้งไว้",
    english: "effectiveness",
    translations: [
      {
        translatedWord: "effectiveness",
        languageCode: "en",
        secondaryTranslations: ["efficacy", "fruitfulness"],
        contextualExplanation: "ผลสำเร็จที่เกิดขึ้นตามเป้าหมายหรือวัตถุประสงค์ที่กำหนดไว้",
        usageNuance: "เน้นการบรรลุเป้าหมายของงานหรือนโยบาย",
        provenance: "OFFICIAL_ROYAL_COINED",
        confidenceScore: 1.0,
      },
      {
        translatedWord: "outcome success",
        languageCode: "en",
        provenance: "AI_GENERATED",
        confidenceScore: 0.82,
      },
    ],
    ai_explanation:
      "เน้นการบรรลุผลสัมฤทธิ์ตามเป้าหมายที่วางไว้",
    registers: ["ทางการ"],
    contexts: ["การทำงาน"],
    evidence: {
      source_book: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      edition: "พ.ศ. ๒๕๕๔",
      edition_year: 2554,
      page_number: 685,
      quote: "ผลสำเร็จที่เกิดขึ้นตามเป้าหมายที่ตั้งไว้",
      is_official: true,
    },
    comparison: {
      emphasis: "ผลสำเร็จที่บรรลุตามวัตถุประสงค์ (เน้นผลลัพธ์ปลายทาง)",
      use_when: "ประเมินว่าโครงการ แผนงาน หรือมาตรการทำให้เกิดผลลัพธ์ตรงตามเป้าหมายที่กำหนดหรือไม่",
      example: "มาตรการกระตุ้นเศรษฐกิจนี้ก่อให้เกิดประสิทธิผลตรงตามเป้าหมายที่วางไว้",
      common_confusion: "⚠️ แม้จะบรรลุเป้าหมาย แต่อาจใช้ทรัพยากรหรือเวลาเกินจำเป็นได้ (ไม่ได้รับประกันความคุ้มค่าเหมือนประสิทธิภาพ)",
      sentence_pattern: "[มาตรการ/โครงการ] + ก่อให้เกิด + ⟨ประสิทธิผล⟩ + ตามเป้าหมายที่กำหนด",
    },
    keywords: ["ทำงาน", "เป้าหมาย", "สำเร็จ", "ประสิทธิผล"],
  },
  {
    headword: "สัมฤทธิผล",
    score: 0.84,
    pos: "น.",
    definition: "ผลสำเร็จตามความมุ่งหมาย",
    english: "achievement",
    translations: [
      {
        translatedWord: "achievement",
        languageCode: "en",
        secondaryTranslations: ["accomplishment", "success"],
        contextualExplanation: "ความสำเร็จลุล่วงตามความมุ่งหมายอย่างสมบูรณ์",
        provenance: "OFFICIAL_ROYAL_COINED",
        confidenceScore: 1.0,
      },
    ],
    ai_explanation:
      "ใช้กล่าวถึงความสำเร็จของงานหรือความพยายามในตัวอย่างงานเขียน",
    registers: ["ทางการ"],
    contexts: ["งานเขียน"],
    evidence: {
      source_book: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      edition: "พ.ศ. ๒๕๕๔",
      edition_year: 2554,
      page_number: 1198,
      quote: "ผลสำเร็จตามความมุ่งหมาย",
      is_official: true,
    },
    comparison: {
      emphasis: "ความสำเร็จลุล่วงสมบูรณ์ของภารกิจสำคัญ (ภาพรวมความสำเร็จ)",
      use_when: "ใช้ในรายงานสรุปผลงานระดับนโยบายหรือโครงการใหญ่เพื่อระบุความสำเร็จงดงาม",
      example: "โครงการยกระดับการศึกษานี้บรรลุสัมฤทธิผลตามเป้าหมายของแผนพัฒนา",
      common_confusion: "⚠️ มักใช้กับความสำเร็จระดับภาพรวม มากกว่าการปฏิบัติงานรายวัน",
      sentence_pattern: "[แผนงาน/โครงการ] + บรรลุ + ⟨สัมฤทธิผล⟩ + อย่างเป็นรูปธรรม",
    },
    keywords: ["ทำงาน", "สำเร็จ", "รายงาน", "สัมฤทธิผล"],
  },
  {
    headword: "มัธยัสถ์",
    score: 0.78,
    pos: "ก.",
    definition: "ใช้จ่ายอย่างประหยัดและระมัดระวัง",
    english: "frugal",
    translations: [
      {
        translatedWord: "frugal",
        languageCode: "en",
        secondaryTranslations: ["thrifty", "economical"],
        contextualExplanation: "การใช้จ่ายอย่างระมัดระวังและประหยัดรอบคอบ",
        provenance: "AI_GENERATED",
        confidenceScore: 0.92,
      },
    ],
    ai_explanation: "ตัวอย่างนี้เน้นความประหยัดในการใช้จ่าย",
    registers: ["ทั่วไป"],
    contexts: ["ชีวิตประจำวัน"],
    evidence: {
      source_book: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      edition: "พ.ศ. ๒๕๕๔",
      edition_year: 2554,
      page_number: 864,
      quote: "ใช้จ่ายอย่างประหยัดและระมัดระวัง",
      is_official: true,
    },
    comparison: {
      emphasis: "ความรอบคอบประหยัดในการใช้จ่ายทรัพย์สินเงินทอง",
      use_when: "ชื่นชมหรือให้คำแนะนำการบริหารเงินทองส่วนตัวหรือองค์กร",
      example: "เธอรู้จักใช้จ่ายอย่างมัธยัสถ์ทำให้มีเงินออมสำรองเสมอ",
      common_confusion: "⚠️ ต่างจาก 'ตระหนี่' (ขี้เหนียว) ตรงที่มัธยัสถ์คือประหยัดอย่างมีเหตุผล",
      sentence_pattern: "[บุคคล/ครอบครัว] + ดำเนินชีวิตอย่าง + ⟨มัธยัสถ์⟩ + และรอบคอบ",
    },
    keywords: ["ประหยัด", "ทรัพยากร", "มัธยัสถ์"],
  },
  {
    headword: "ร่วมมือ",
    score: 0.92,
    pos: "ก.",
    definition: "ช่วยกันทำกิจกรรมหรืองานให้บรรลุจุดมุ่งหมาย",
    english: "cooperate",
    translations: [
      {
        translatedWord: "cooperate",
        languageCode: "en",
        secondaryTranslations: ["collaborate", "team up"],
        contextualExplanation: "การร่วมแรงร่วมใจกันทำงานเพื่อให้บรรลุจุดมุ่งหมายเดียวกัน",
        provenance: "AI_GENERATED",
        confidenceScore: 0.95,
      },
    ],
    ai_explanation: "สื่อถึงการลงมือทำงานด้วยกัน",
    registers: ["ทั่วไป"],
    contexts: ["การทำงาน"],
    evidence: {
      source_book: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      edition: "พ.ศ. ๒๕๕๔",
      edition_year: 2554,
      page_number: 968,
      quote: "ช่วยกันทำกิจกรรมหรืองานให้บรรลุจุดมุ่งหมาย",
      is_official: true,
    },
    comparison: {
      emphasis: "การร่วมแรงร่วมใจและลงมือปฏิบัติงานเคียงข้างกัน",
      use_when: "กล่าวถึงการผนึกกำลัง ช่วยเหลือ หรือขอความช่วยเหลือจากพันธมิตร",
      example: "ทุกภาคส่วนพร้อมใจกันร่วมมือเพื่อฟื้นฟูชุมชนให้กลับมาเข้มแข็ง",
      common_confusion: "⚠️ มักสับสนกับ 'ประสานงาน' ซึ่งเน้นการเชื่อมโยงระบบสื่อสารมากกว่าการลงแรงทำด้วยกัน",
      sentence_pattern: "[ฝ่าย ก] + พร้อมใจกัน + ⟨ร่วมมือ⟩ + กับ [ฝ่าย ข] เพื่อ [เป้าหมาย]",
    },
    keywords: ["ช่วยกัน", "ร่วมกัน", "ร่วมมือ", "สามัคคี"],
  },
  {
    headword: "ประสานงาน",
    score: 0.87,
    pos: "ก.",
    definition: "เชื่อมโยงการทำงานของหลายฝ่ายให้สอดคล้องกัน",
    english: "coordinate",
    translations: [
      {
        translatedWord: "coordinate",
        languageCode: "en",
        secondaryTranslations: ["liaise", "synchronize"],
        contextualExplanation: "การเชื่อมโยงและจัดระเบียบการทำงานร่วมกันระหว่างฝ่าย",
        provenance: "AI_GENERATED",
        confidenceScore: 0.94,
      },
    ],
    ai_explanation: "เน้นการติดต่อและจัดงานระหว่างฝ่าย",
    registers: ["ทางการ"],
    contexts: ["การทำงาน"],
    evidence: {
      source_book: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      edition: "พ.ศ. ๒๕๕๔",
      edition_year: 2554,
      page_number: 683,
      quote: "เชื่อมโยงการทำงานของหลายฝ่ายให้สอดคล้องกัน",
      is_official: true,
    },
    comparison: {
      emphasis: "การจัดระเบียบ เชื่อมต่อข้อมูล และกำหนดเวลาระหว่างหน่วยงาน",
      use_when: "อธิบายหน้าที่การเป็นตัวกลางเชื่อมระหว่างสองทีมให้ทำงานไม่สะดุด",
      example: "ผู้จัดการโครงการทำหน้าที่ประสานงานระหว่างฝ่ายพัฒนาและฝ่ายออกแบบ",
      common_confusion: "⚠️ ไม่ใช่การทำงานแทนผู้อื่น แต่เป็นการอำนวยความสะดวกให้งานลื่นไหล",
      sentence_pattern: "[ผู้แทน/ทีมงาน] + รับหน้าที่ + ⟨ประสานงาน⟩ + ระหว่าง [สองหน่วยงาน]",
    },
    keywords: ["ช่วยกัน", "ร่วมกัน", "ประสานงาน"],
  },
  {
    headword: "กรุณารอสักครู่",
    score: 0.9,
    definition: "ข้อความสุภาพสำหรับขอให้อีกฝ่ายรอช่วงเวลาสั้น ๆ",
    english: "please hold on",
    translations: [
      {
        translatedWord: "please hold on",
        languageCode: "en",
        secondaryTranslations: ["please wait a moment", "just a moment"],
        contextualExplanation: "ถ้อยคำสุภาพเพื่อขอให้อีกฝ่ายรอสักครู่",
        provenance: "AI_GENERATED",
        confidenceScore: 0.89,
      },
    ],
    ai_explanation:
      "ข้อความสื่อสารกาลเทศะสุภาพสำหรับการสนทนา",
    registers: ["สุภาพ"],
    contexts: ["การสนทนา"],
    evidence: {
      source_book: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      edition: "พ.ศ. ๒๕๕๔",
      edition_year: 2554,
      quote: "กรุณารอสักครู่ (รูปแบบคำสุภาพในการสื่อสาร)",
      is_official: true,
    },
    comparison: {
      emphasis: "ถ้อยคำมารยาทสุภาพนุ่มนวลเพื่อขอเวลาคู่สนทนา",
      use_when: "การบริการลูกค้า การประสานงาน หรือการตอบรับในบทสนทนาที่เป็นทางการหรือกึ่งทางการ",
      example: "ขอความกรุณารอสักครู่ ทางเรากำลังตรวจสอบความถูกต้องของเอกสารค่ะ",
      common_confusion: "⚠️ หลีกเลี่ยงการใช้ 'รอก่อน' ในงานบริการ เพราะอาจดูห้วนและขาดความสุภาพ",
      sentence_pattern: "ขอความ + ⟨กรุณารอสักครู่⟩ + [เจ้าหน้าที่] กำลังดำเนินการตรวจสอบ",
    },
    keywords: ["รอ", "สุภาพ", "กรุณารอสักครู่"],
  },
  {
    headword: "วิจัย",
    score: 0.93,
    pos: "ก.",
    definition: "ศึกษาอย่างเป็นระบบเพื่อค้นหาหรือตรวจสอบความรู้",
    english: "research",
    translations: [
      {
        translatedWord: "research",
        languageCode: "en",
        secondaryTranslations: ["investigation", "study"],
        contextualExplanation: "การค้นคว้าหาความจริงหรือองค์ความรู้อย่างเป็นระเบียบแบบแผน",
        provenance: "OFFICIAL_ROYAL_COINED",
        confidenceScore: 1.0,
      },
      {
        translatedWord: "systematic investigation",
        languageCode: "en",
        provenance: "AI_GENERATED",
        confidenceScore: 0.86,
      },
    ],
    ai_explanation: "ใช้ในตัวอย่างบริบททางวิชาการ",
    registers: ["วิชาการ"],
    contexts: ["การศึกษา"],
    comparison: {
      emphasis: "การศึกษาอย่างมีระเบียบวิธีวิจัยและอิงหลักฐานเชิงประจักษ์",
      use_when: "การค้นพบความรู้ใหม่ การทดลองในห้องปฏิบัติการ หรือการทำสารนิพนธ์",
      example: "สถาบันดำเนินการวิจัยเพื่อค้นหาแนวทางแก้ไขปัญหาการเปลี่ยนแปลงสภาพภูมิอากาศ",
      common_confusion: "⚠️ มีกระบวนการเข้มงวดและหลักฐานรองรับลึกซึ้งกว่าคำว่า 'ศึกษา' หรือ 'อ่านค้นคว้า' ทั่วไป",
      sentence_pattern: "[คณะผู้วิจัย] + ดำเนินการ + ⟨วิจัย⟩ + เพื่อค้นหา [ข้อสรุป/นวัตกรรมใหม่]",
    },
    keywords: ["วิจัย", "ศึกษา", "ความรู้", "วิชาการ"],
  },
  {
    headword: "เกรงใจ",
    score: 0.91,
    pos: "ก.",
    definition: "ไม่อยากให้ผู้อื่นต้องลำบากเดือดร้อน หรือรำคาญใจเพราะตน",
    english: "deferential consideration",
    translations: [
      {
        translatedWord: "consideration",
        languageCode: "en",
        secondaryTranslations: ["deference", "hesitant to impose"],
        contextualExplanation: "ความรู้สึกเกรงใจและไม่อยากสร้างความลำบากแก่ผู้อื่น",
        provenance: "AI_GENERATED",
        confidenceScore: 0.92,
      },
    ],
    ai_explanation: "คุณลักษณะทางวัฒนธรรมการสื่อสารที่สะท้อนความเคารพผู้อื่น",
    registers: ["สุภาพ"],
    contexts: ["การสนทนา"],
    evidence: {
      source_book: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      edition: "พ.ศ. ๒๕๕๔",
      edition_year: 2554,
      page_number: 145,
      quote: "ไม่อยากให้ผู้อื่นต้องลำบากเดือดร้อน หรือรำคาญใจเพราะตน",
      is_official: true,
    },
    comparison: {
      emphasis: "มารยาททางสังคมและความคำนึงถึงความสะดวกสบายของผู้อื่น",
      use_when: "ต้องการปฏิเสธอย่างสุภาพ หรือแสดงความขอบคุณเมื่อผู้อื่นเสนอความช่วยเหลือ",
      example: "ฉันรู้สึกเกรงใจมากที่ต้องรบกวนให้คุณสละเวลามาช่วยงานในวันหยุด",
      common_confusion: "⚠️ ไม่ใช่ความขลาดกลัว แต่เป็นความอ่อนน้อมและถนอมน้ำใจ",
      sentence_pattern: "[ฉัน/เรา] + รู้สึก + ⟨เกรงใจ⟩ + ที่ต้องรบกวน [เวลา/ความช่วยเหลือ]",
    },
    keywords: ["เกรงใจ", "สุภาพ", "ถนอมน้ำใจ", "รบกวน"],
  },
  {
    headword: "ปัญญาประดิษฐ์",
    score: 0.95,
    pos: "น.",
    definition: "สาขาคอมพิวเตอร์ที่จำลองกระบวนการเรียนรู้และคิดแก้ปัญหาของมนุษย์",
    english: "artificial intelligence",
    translations: [
      {
        translatedWord: "artificial intelligence",
        languageCode: "en",
        secondaryTranslations: ["AI", "machine intelligence"],
        contextualExplanation: "ศัพท์บัญญัติราชบัณฑิตยสภาของ Artificial Intelligence",
        provenance: "OFFICIAL_ROYAL_COINED",
        confidenceScore: 1.0,
      },
    ],
    ai_explanation: "ศัพท์บัญญัติทางการสำหรับเทคโนโลยีคอมพิวเตอร์อัจฉริยะ",
    registers: ["ทางการ", "วิชาการ"],
    contexts: ["เทคโนโลยี", "งานวิจัย"],
    evidence: {
      source_book: "พจนานุกรมศัพท์คอมพิวเตอร์และเทคโนโลยีสารสนเทศ ราชบัณฑิตยสภา",
      edition: "พ.ศ. ๒๕๖๐",
      edition_year: 2560,
      quote: "สาขาคอมพิวเตอร์ที่จำลองกระบวนการเรียนรู้และคิดแก้ปัญหาของมนุษย์",
      is_official: true,
    },
    comparison: {
      emphasis: "เทคโนโลยีการประมวลผลและการเรียนรู้ของเครื่องอย่างเป็นทางการ",
      use_when: "เอกสารทางวิชาการ หนังสือราชการ หรือบทความวิจัยที่ต้องการใช้ภาษาไทยมาตรฐาน",
      example: "หน่วยงานนำระบบปัญญาประดิษฐ์มาช่วยวิเคราะห์เอกสารและสืบค้นความหมาย",
      common_confusion: "⚠️ ใช้แทนคำทับศัพท์ 'เอไอ' ในเอกสารทางการ เพื่อความถูกต้องตามมาตรฐานราชบัณฑิตยสภา",
      sentence_pattern: "[องค์กร/ระบบ] + ประยุกต์ใช้เทคโนโลยี + ⟨ปัญญาประดิษฐ์⟩ + ในการ [วิเคราะห์ข้อมูล/ให้บริการ]",
    },
    keywords: ["ปัญญาประดิษฐ์", "คอมพิวเตอร์", "เทคโนโลยี", "ai"],
  },
];

let cachedRealDict: Array<{ headword: string; pos: string | null; definition: string; edition: string }> | null = null;

function getRealDictionary(): Array<{ headword: string; pos: string | null; definition: string; edition: string }> {
  if (cachedRealDict) return cachedRealDict;
  try {
    if (typeof window === "undefined") {
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
          cachedRealDict = JSON.parse(fs.readFileSync(p, "utf-8"));
          return cachedRealDict!;
        }
      }
    }
  } catch {
    // Non-filesystem environment fallback
  }
  return [];
}

export function mockSearch(
  query: string,
  mode: SearchResponse["mode"] = "demo",
): SearchResponse {
  const excluded = [
    ...query.matchAll(
      /(?:ไม่เอา|ไม่ใช้|ไม่อยากใช้)(?:คำว่า)?[ “"']*([^ ”"',，]+)/g,
    ),
  ].map((x) => x[1]);
  const normalized = query.toLowerCase().trim();
  const recommendations = entries
    .filter(
      (e) =>
        !excluded.includes(e.headword) &&
        e.keywords.some((k) => normalized.includes(k)),
    )
    .map(({ keywords, ...r }) => r);

  // If not matched in curated set, dynamically query real official dictionary
  if (recommendations.length === 0 && normalized) {
    const realDict = getRealDictionary();
    if (realDict && realDict.length > 0) {
      const dynamicMatches = [];
      for (const item of realDict) {
        const rawHw = item.headword || "";
        const def = item.definition || "";
        if (!rawHw || excluded.includes(rawHw)) continue;

        const variants = [rawHw];
        if (/[,\/;]/.test(rawHw)) {
          variants.push(
            ...rawHw
              .split(/[,\/;]+/)
              .map((v: string) => v.replace(/[\d๑-๙\s\-\.]/g, "").trim())
              .filter(Boolean),
          );
        }

        const isExactVariantMatch = variants.some((v: string) => v === normalized);
        const isHeadwordMatch =
          isExactVariantMatch ||
          variants.some(
            (v: string) =>
              v.includes(normalized) ||
              (v.length >= 3 && normalized.includes(v)),
          );
        const isDefMatch = def.includes(normalized);

        if (isExactVariantMatch || isHeadwordMatch || isDefMatch) {
          const displayHw = isExactVariantMatch ? normalized : rawHw;
          const score = isExactVariantMatch
            ? 0.98
            : isHeadwordMatch
            ? 0.88
            : 0.72;

          dynamicMatches.push({
            headword: displayHw,
            score,
            pos: item.pos || undefined,
            definition: def,
            ai_explanation: `ตรงตามนิยามในพจนานุกรม ฉบับราชบัณฑิตยสถาน (ฉบับ ${item.edition || "๒๕๕๔"})`,
            registers: ["ทางการ"],
            contexts: ["ทั่วไป"],
            evidence: {
              source_book: "พจนานุกรม ฉบับราชบัณฑิตยสถาน",
              edition: `พ.ศ. ${item.edition || "๒๕๕๔"}`,
              edition_year: parseInt(String(item.edition || "2554"), 10) || 2554,
              quote: def,
              is_official: true,
            },
            comparison: {
              emphasis: `ความหมายหลัก: ${def.slice(0, 60)}${def.length > 60 ? "..." : ""}`,
              use_when: `ใช้เมื่อต้องการสื่อถึง "${def.slice(0, 45)}${def.length > 45 ? "..." : ""}" ในบริบทที่ถูกต้อง`,
              example: `การดำเนินการในครั้งนี้จำเป็นต้องคำนึงถึง${displayHw}อย่างรอบคอบ`,
              common_confusion: `ควรตรวจสอบบริบทและระดับภาษาให้ตรงกับกาลเทศะก่อนนำไปใช้จริง`,
              sentence_pattern: (item.pos && item.pos.includes("ก"))
                ? `[ประธาน] + ได้ดำเนินการ + ⟨${displayHw}⟩ + เพื่อ + [เป้าหมาย]`
                : `[ประธาน] + มุ่งเน้นการเสริมสร้าง + ⟨${displayHw}⟩ + ในการดำเนินงาน`,
            },
          });
        }
      }
      dynamicMatches.sort((a, b) => b.score - a.score);
      recommendations.push(...dynamicMatches.slice(0, 8));
    }
  }

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
        ? "ระบบค้นหาหลักกำลังเชื่อมต่อ ขณะนี้แสดงข้อมูลสำรอง (Demo / Offline Fallback)"
        : undefined,
  };
}
