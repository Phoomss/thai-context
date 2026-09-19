export type DialectRegionName = "เหนือ" | "อีสาน" | "กลาง" | "ใต้";
export type DialectProvenance = "official" | "inferred";

export type DialectEntry = {
  region: DialectRegionName;
  word: string;
  phonetic?: string;
  meaning: string;
  culturalNotes?: string;
  provenance: DialectProvenance;
  source: string;
};

export type DialectCategoryKey = "conversation" | "kinship" | "body_parts";

export type DialectCategory = {
  key: DialectCategoryKey;
  label: string;
  description: string;
  badge: string;
  totalEntries: number;
};

export type DialectWordGroup = {
  id: string;
  standardWord: string;
  category: DialectCategoryKey;
  categoryLabel: string;
  dialects: DialectEntry[];
};

export const DIALECT_CATEGORIES: DialectCategory[] = [
  {
    key: "conversation",
    label: "สนทนายอดนิยม",
    description: "คำกริยาและคำแสดงอารมณ์ความรู้สึกในชีวิตประจำวัน",
    badge: "คำทั่วไป",
    totalEntries: 8,
  },
  {
    key: "kinship",
    label: "หมวดเครือญาติ",
    description: "คำเรียกบุคคลและลำดับญาติ จากคลังข้อมูลภาษาถิ่น ๓ ภาค",
    badge: "๓๔๖ รายการ",
    totalEntries: 346,
  },
  {
    key: "body_parts",
    label: "หมวดอวัยวะร่างกาย",
    description: "คำเรียกส่วนต่างๆ ของร่างกาย จากคลังข้อมูลภาษาถิ่น ๓ ภาค",
    badge: "๑,๑๐๒ รายการ",
    totalEntries: 1102,
  },
];

export const DIALECT_WORD_GROUPS: DialectWordGroup[] = [
  // 1. หมวดสนทนายอดนิยม
  {
    id: "miss-you",
    standardWord: "คิดถึง",
    category: "conversation",
    categoryLabel: "สนทนายอดนิยม",
    dialects: [
      {
        region: "กลาง",
        word: "คิดถึง",
        phonetic: "[คิด-ถึง]",
        meaning: "นึกถึงด้วยความผูกพันหรือระลึกถึง",
        provenance: "official",
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      },
      {
        region: "เหนือ",
        word: "กึ๊ดเติงหา",
        phonetic: "[กึ๊ด-เติง-หา]",
        meaning: "คิดถึง ระลึกถึง, คำแสดงความผูกพันในภาษาถิ่นล้านนา ('กึ๊ด' = คิด, 'เติง' = ถึง)",
        culturalNotes: "คำเมืองล้านนานิยมใช้ 'กึ๊ดเติง' หรือ 'กึ๊ดเติงหา' ในบทกวีและเพลงซอ",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคเหนือ สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
      },
      {
        region: "อีสาน",
        word: "คึดฮอด",
        phonetic: "[คึด-ฮอด]",
        meaning: "คิดถึง อยากพบ, ปรากฏในวรรณกรรมและภาษาถิ่นอีสาน ('คึด' = คิด, 'ฮอด' = ถึง)",
        culturalNotes: "ใช้ทั่วไปในชีวิตประจำวันและวรรณกรรมอีสาน เช่น 'คึดฮอดหลายๆ'",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นอีสาน สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
      },
      {
        region: "ใต้",
        word: "ข้องใจ",
        phonetic: "[ข้อง-ใจ / ขิด-ถึง]",
        meaning: "คิดถึง ระลึกถึงด้วยความห่วงใยในภาษาถิ่นใต้ (คนใต้มักใช้ 'ข้องใจ' ในบริบทห่วงหา หรือใช้ 'คิดถึง' สำเนียงใต้)",
        culturalNotes: "ในภาษาถิ่นใต้ดั้งเดิม คำว่า 'ข้องใจ' แปลว่า เป็นห่วงหรือคิดถึงอย่างห่วงใย ส่วนคำว่า 'คิดถึง' ออกเสียงสำเนียงใต้ว่า 'ขิดถึง'",
        provenance: "inferred",
        source: "AI ช่วยอนุมาน — ต้องตรวจสอบกับผู้รู้ภาษาถิ่นก่อนใช้งานจริง",
      },
    ],
  },
  {
    id: "eat",
    standardWord: "กิน",
    category: "conversation",
    categoryLabel: "สนทนายอดนิยม",
    dialects: [
      {
        region: "กลาง",
        word: "กิน",
        phonetic: "[กิน]",
        meaning: "เคี้ยวกลืนอาหาร, รับประทานอาหาร",
        provenance: "official",
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      },
      {
        region: "เหนือ",
        word: "กิ๋น",
        phonetic: "[กิ๋น]",
        meaning: "รับประทานอาหาร เคี้ยวกลืนอาหาร ในภาษาถิ่นล้านนา",
        culturalNotes: "ใช้ทั่วไปในภาษาล้านนา เช่น 'ไปกิ๋นข้าวแลงตวยกั๋นบ่'",
        provenance: "official",
        source: "พจนานุกรมคำเมือง-ไทย ฉบับราชบัณฑิตยสภา",
      },
      {
        region: "อีสาน",
        word: "กิน / โสภ",
        phonetic: "[กิน / โสบ]",
        meaning: "รับประทานอาหาร เคี้ยวกลืนอาหาร",
        culturalNotes: "ภาษาอีสานใช้ 'กิน' ทั่วไป เช่น กินข้าว, และมีคำเก่า 'โสภ'",
        provenance: "official",
        source: "พจนานุกรมภาษาถิ่นอีสาน สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
      },
      {
        region: "ใต้",
        word: "กิน",
        phonetic: "[กิ่น]",
        meaning: "รับประทานอาหาร เคี้ยวกลืนอาหาร สำเนียงปักษ์ใต้",
        culturalNotes: "ออกเสียงสั้นห้วนตามลักษณะภาษาถิ่นใต้ เช่น กินข้าว",
        provenance: "official",
        source: "พจนานุกรมภาษาถิ่นใต้ ฉบับราชบัณฑิตยสถาน",
      },
    ],
  },
  {
    id: "delicious",
    standardWord: "อร่อย",
    category: "conversation",
    categoryLabel: "สนทนายอดนิยม",
    dialects: [
      {
        region: "กลาง",
        word: "อร่อย",
        phonetic: "[อะ-หฺร่อย]",
        meaning: "มีรสดี, ถูกปาก",
        provenance: "official",
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      },
      {
        region: "เหนือ",
        word: "ลำ",
        phonetic: "[ลำ / ลำ-ขะ-หนาด]",
        meaning: "อร่อย, มีรสชาติดี (เช่น 'ลำแต้ๆ', 'ลำขนาด')",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคเหนือ สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
      },
      {
        region: "อีสาน",
        word: "แซ่บ",
        phonetic: "[แซ่บ / แซ่บ-อี-หลี]",
        meaning: "อร่อย, รสชาติกลมกล่อมถูกใจ (เช่น 'แซ่บหลาย', 'แซ่บอีหลี')",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นอีสาน สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
      },
      {
        region: "ใต้",
        word: "หรอย",
        phonetic: "[หฺรอย / หฺรอย-จัง-ฮู้]",
        meaning: "อร่อย, รสชาติถึงเครื่องจัดจ้าน (เช่น 'หรอยแรง', 'หรอยจังหู')",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคใต้ สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
      },
    ],
  },
  {
    id: "speak",
    standardWord: "พูด",
    category: "conversation",
    categoryLabel: "สนทนายอดนิยม",
    dialects: [
      {
        region: "กลาง",
        word: "พูด",
        phonetic: "[พูต]",
        meaning: "เปล่งเสียงออกเป็นถ้อยคำ, เจรจา",
        provenance: "official",
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      },
      {
        region: "เหนือ",
        word: "อู้",
        phonetic: "[อู้]",
        meaning: "พูด, สนทนา เช่น 'อู้กำเมือง' (พูดภาษาเมือง)",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคเหนือ สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
      },
      {
        region: "อีสาน",
        word: "เว้า",
        phonetic: "[เว้า]",
        meaning: "พูด, จา เช่น 'เว้าพื้น' (พูดถึง), 'เว้าความ' (เจรจาความ)",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นอีสาน สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
      },
      {
        region: "ใต้",
        word: "แหลง",
        phonetic: "[แหลฺง]",
        meaning: "พูด, สนทนา เช่น 'แหลงใต้' (พูดภาษาใต้)",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคใต้ สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
      },
    ],
  },
  {
    id: "lie",
    standardWord: "โกหก",
    category: "conversation",
    categoryLabel: "สนทนายอดนิยม",
    dialects: [
      {
        region: "กลาง",
        word: "โกหก",
        phonetic: "[โก-หก]",
        meaning: "พูดปด, ไม่จริง",
        provenance: "official",
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      },
      {
        region: "เหนือ",
        word: "ขี้จุ๊",
        phonetic: "[ขี้-จุ๊]",
        meaning: "โกหก, พูดเท็จ, หลอกลวง",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคเหนือ สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
      },
      {
        region: "อีสาน",
        word: "ขี้ตั๋ว",
        phonetic: "[ขี้-ตั๋ว]",
        meaning: "โกหก, พูดไม่จริง, หลอกให้หลงเชื่อ",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นอีสาน สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
      },
      {
        region: "ใต้",
        word: "ขี้ฮก",
        phonetic: "[ขี้-ฮก]",
        meaning: "โกหก, พูดปด, ไม่พูดความจริง",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคใต้ สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
      },
    ],
  },
  {
    id: "go-home",
    standardWord: "กลับบ้าน",
    category: "conversation",
    categoryLabel: "สนทนายอดนิยม",
    dialects: [
      {
        region: "กลาง",
        word: "กลับบ้าน",
        phonetic: "[กฺลับ-บ่าน]",
        meaning: "เดินทางกลับสู่ที่อยู่อาศัย",
        provenance: "official",
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      },
      {
        region: "เหนือ",
        word: "ปิ๊กบ้าน",
        phonetic: "[ปิ๊ก-บ่าน]",
        meaning: "กลับบ้าน ('ปิ๊ก' แปลว่า กลับ หรือย้อนคืน)",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคเหนือ สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
      },
      {
        region: "อีสาน",
        word: "เมือบ้าน",
        phonetic: "[เมือ-บ่าน]",
        meaning: "กลับบ้าน ('เมือ' แปลว่า กลับ หรือเดินทางกลับ)",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นอีสาน สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
      },
      {
        region: "ใต้",
        word: "หลบเริน",
        phonetic: "[หฺลบ-เริน]",
        meaning: "กลับบ้าน ('หลบ' แปลว่า กลับ, 'เริน' แปลว่า เรือนหรือบ้าน)",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคใต้ สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
      },
    ],
  },

  // 2. หมวดเครือญาติ (Kinship)
  {
    id: "kinship-father",
    standardWord: "พ่อ",
    category: "kinship",
    categoryLabel: "หมวดเครือญาติ",
    dialects: [
      {
        region: "กลาง",
        word: "พ่อ",
        phonetic: "[พ่อ]",
        meaning: "ชายผู้ให้กำเนิด, บิดา",
        provenance: "official",
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      },
      {
        region: "เหนือ",
        word: "ป้อ",
        phonetic: "[ป้อ]",
        meaning: "พ่อ, ชายผู้ให้กำเนิด",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคเหนือ (หมวดคำเรียกญาติ) ม.มหิดล",
      },
      {
        region: "อีสาน",
        word: "อีพ่อ / พ่อ",
        phonetic: "[อี-พ่อ]",
        meaning: "พ่อ, คำเรียกบิดาด้วยความเคารพรัก",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นอีสาน (หมวดคำเรียกญาติ) ม.มหิดล",
      },
      {
        region: "ใต้",
        word: "ผ่อ / พ่อ",
        phonetic: "[ผ่อ / pʰɔː⁵]",
        meaning: "พ่อ, ชายผู้ให้กำเนิด (มีคำเรียกอื่นตามท้องถิ่น เช่น เตี่ย, ปะ, ป๋า, เปาะ)",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคใต้ (หมวดคำเรียกญาติ) ม.มหิดล",
      },
    ],
  },
  {
    id: "kinship-mother",
    standardWord: "แม่",
    category: "kinship",
    categoryLabel: "หมวดเครือญาติ",
    dialects: [
      {
        region: "กลาง",
        word: "แม่",
        phonetic: "[แม่]",
        meaning: "หญิงผู้ให้กำเนิด, มารดา",
        provenance: "official",
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      },
      {
        region: "เหนือ",
        word: "แม่",
        phonetic: "[แม่]",
        meaning: "แม่, หญิงผู้ให้กำเนิด",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคเหนือ (หมวดคำเรียกญาติ) ม.มหิดล",
      },
      {
        region: "อีสาน",
        word: "อีแม่ / แม่",
        phonetic: "[อี-แม่]",
        meaning: "แม่, คำเรียกมารดาด้วยความเคารพรัก",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นอีสาน (หมวดคำเรียกญาติ) ม.มหิดล",
      },
      {
        region: "ใต้",
        word: "แหฺม / แม่",
        phonetic: "[แหฺม / mɛː⁵]",
        meaning: "แม่, หญิงผู้ให้กำเนิด (มีคำเรียกตามท้องถิ่น เช่น นม, เมาะ, อีบู, มะ)",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคใต้ (หมวดคำเรียกญาติ) ม.มหิดล",
      },
    ],
  },
  {
    id: "kinship-maternal-grandfather",
    standardWord: "ตา",
    category: "kinship",
    categoryLabel: "หมวดเครือญาติ",
    dialects: [
      {
        region: "กลาง",
        word: "ตา",
        phonetic: "[ตา]",
        meaning: "พ่อของแม่",
        provenance: "official",
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      },
      {
        region: "เหนือ",
        word: "ต๋า / อุ้ยต๋า",
        phonetic: "[ต๋า / taː⁵]",
        meaning: "ตา, พ่อของแม่ หรือผู้อาวุโสฝ่ายแม่",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคเหนือ (หมวดคำเรียกญาติ) ม.มหิดล",
      },
      {
        region: "อีสาน",
        word: "พ่อใหญ่ / ตา",
        phonetic: "[พ่อ-ไหย่]",
        meaning: "ตา หรือ พ่อของแม่ (มักเรียกร่วมกับปู่ว่า 'พ่อใหญ่')",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นอีสาน (หมวดคำเรียกญาติ) ม.มหิดล",
      },
      {
        region: "ใต้",
        word: "พ่อเถ้า / ตา",
        phonetic: "[ผ่อ-ท่าว / ก้ง]",
        meaning: "ตา, พ่อของแม่ (บางท้องถิ่นเรียก 'ก้ง' หรือ 'พ่อแก่')",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคใต้ (หมวดคำเรียกญาติ) ม.มหิดล",
      },
    ],
  },
  {
    id: "kinship-older-brother",
    standardWord: "พี่ชาย",
    category: "kinship",
    categoryLabel: "หมวดเครือญาติ",
    dialects: [
      {
        region: "กลาง",
        word: "พี่ชาย",
        phonetic: "[พี่-ชาย]",
        meaning: "พี่ที่เป็นผู้ชาย",
        provenance: "official",
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      },
      {
        region: "เหนือ",
        word: "อ้าย / ปี่อ้าย",
        phonetic: "[อ้าย / ปี่-อ้าย]",
        meaning: "พี่ชาย, ชายที่เกิดก่อนตนในครอบครัว",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคเหนือ (หมวดคำเรียกญาติ) ม.มหิดล",
      },
      {
        region: "อีสาน",
        word: "อ้าย",
        phonetic: "[อ้าย]",
        meaning: "พี่ชาย, คำเรียกผู้ชายที่อายุมากกว่า",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นอีสาน (หมวดคำเรียกญาติ) ม.มหิดล",
      },
      {
        region: "ใต้",
        word: "พี่บ่าว",
        phonetic: "[ผี-บาว / pʰiː⁵-baːw⁶]",
        meaning: "พี่ชาย, พี่ที่เป็นผู้ชาย",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคใต้ (หมวดคำเรียกญาติ) ม.มหิดล",
      },
    ],
  },
  {
    id: "kinship-younger-sibling",
    standardWord: "น้อง",
    category: "kinship",
    categoryLabel: "หมวดเครือญาติ",
    dialects: [
      {
        region: "กลาง",
        word: "น้อง",
        phonetic: "[น้อง]",
        meaning: "ผู้ร่วมบิดาหรือมารดาเดียวกันที่เกิดทีหลัง",
        provenance: "official",
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      },
      {
        region: "เหนือ",
        word: "น้อง / น้องหล้า",
        phonetic: "[น้อง / น้อง-หล้า]",
        meaning: "น้อง, ผู้ร่วมบิดามารดาที่เกิดทีหลัง ('น้องหล้า' = น้องคนสุดท้อง)",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคเหนือ (หมวดคำเรียกญาติ) ม.มหิดล",
      },
      {
        region: "อีสาน",
        word: "น้อง / น้องหล่า",
        phonetic: "[น้อง / น้อง-หล่า]",
        meaning: "น้อง หรือ ผู้ที่มีอายุน้อยกว่าตน",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นอีสาน (หมวดคำเรียกญาติ) ม.มหิดล",
      },
      {
        region: "ใต้",
        word: "น้อง / นุ้ย",
        phonetic: "[หฺน่อง / nɔːŋ²]",
        meaning: "น้อง หรือผู้มีอายุน้อยกว่า (คำเรียกเอ็นดูมักใช้ 'นุ้ย')",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคใต้ (หมวดคำเรียกญาติ) ม.มหิดล",
      },
    ],
  },

  // 3. หมวดอวัยวะร่างกาย (Body Parts)
  {
    id: "body-eyes",
    standardWord: "ตา (ดวงตา)",
    category: "body_parts",
    categoryLabel: "หมวดอวัยวะร่างกาย",
    dialects: [
      {
        region: "กลาง",
        word: "ตา",
        phonetic: "[ตา]",
        meaning: "อวัยวะส่วนหนึ่งของร่างกายสำหรับมองดูสิ่งต่างๆ",
        provenance: "official",
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      },
      {
        region: "เหนือ",
        word: "แก่นตา / ต๋า",
        phonetic: "[แก่น-ต๋า / kɛn²-taː⁵]",
        meaning: "ดวงตา, ลูกตา, อวัยวะการมองเห็น",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคเหนือ (หมวดอวัยวะของคนและสัตว์) ม.มหิดล",
      },
      {
        region: "อีสาน",
        word: "หน่วยตา / ตา",
        phonetic: "[หฺน่วย-ตา]",
        meaning: "ดวงตา, ลูกตา",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นอีสาน (หมวดอวัยวะของคนและสัตว์) ม.มหิดล",
      },
      {
        region: "ใต้",
        word: "หน่วยตา / ตา",
        phonetic: "[หฺน่วย-ตา / taː⁶]",
        meaning: "ดวงตา, ลูกตาสำหรับมองดู",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคใต้ (หมวดอวัยวะของคนและสัตว์) ม.มหิดล",
      },
    ],
  },
  {
    id: "body-teeth",
    standardWord: "ฟัน",
    category: "body_parts",
    categoryLabel: "หมวดอวัยวะร่างกาย",
    dialects: [
      {
        region: "กลาง",
        word: "ฟัน",
        phonetic: "[ฟัน]",
        meaning: "กระดูกเป็นซี่ๆ อยู่ในปากสำหรับบดเคี้ยวอาหาร",
        provenance: "official",
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      },
      {
        region: "เหนือ",
        word: "เขี้ยว",
        phonetic: "[เขี้ยว / kʰiaw⁶]",
        meaning: "ฟัน, ซี่ฟันในช่องปากสำหรับบดเคี้ยว",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคเหนือ (หมวดอวัยวะของคนและสัตว์) ม.มหิดล",
      },
      {
        region: "อีสาน",
        word: "แข้ว",
        phonetic: "[แข้ว / kʰɛːw⁶]",
        meaning: "ฟัน (เช่น 'กกแข้ว' แปลว่า โคนฟันหรือเหงือก)",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นอีสาน (หมวดอวัยวะของคนและสัตว์) ม.มหิดล",
      },
      {
        region: "ใต้",
        word: "ฟัน",
        phonetic: "[ฟัน]",
        meaning: "ฟัน, ซี่กระดูกในปากสำหรับเคี้ยวอาหาร",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคใต้ (หมวดอวัยวะของคนและสัตว์) ม.มหิดล",
      },
    ],
  },
  {
    id: "body-coccyx",
    standardWord: "ก้นกบ",
    category: "body_parts",
    categoryLabel: "หมวดอวัยวะร่างกาย",
    dialects: [
      {
        region: "กลาง",
        word: "ก้นกบ",
        phonetic: "[ก้น-กบ]",
        meaning: "ปลายกระดูกสันหลังที่สุดลงมาข้างล่าง",
        provenance: "official",
        source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
      },
      {
        region: "เหนือ",
        word: "ก้นหย่อน / ก้นย้อย",
        phonetic: "[ก้น-หย่อน / kon⁶-yɔn²]",
        meaning: "ก้นกบ, ปลายกระดูกสันหลังที่สุดลงมาข้างล่าง",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคเหนือ (หมวดอวัยวะของคนและสัตว์) ม.มหิดล",
      },
      {
        region: "อีสาน",
        word: "ก้นกบ",
        phonetic: "[ก้น-ก๊บ / kon³-kop⁴]",
        meaning: "ก้นกบ, กระดูกส่วนท้ายสุดของลำตัว",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นอีสาน (หมวดอวัยวะของคนและสัตว์) ม.มหิดล",
      },
      {
        region: "ใต้",
        word: "ก้นขบ / ก้นหอย",
        phonetic: "[ก้น-ขบ]",
        meaning: "ก้นกบ, ส่วนปลายกระดูกสันหลัง",
        provenance: "official",
        source: "คลังข้อมูลภาษาถิ่นภาคใต้ (หมวดอวัยวะของคนและสัตว์) ม.มหิดล",
      },
    ],
  },
];

export const DEFAULT_DIALECT_GROUP = DIALECT_WORD_GROUPS[0];

export function getDialectGroup(wordOrId: string): DialectWordGroup | undefined {
  const normalized = wordOrId.trim().toLowerCase();
  return DIALECT_WORD_GROUPS.find(
    (g) =>
      g.id === normalized ||
      g.standardWord.toLowerCase() === normalized ||
      g.standardWord.includes(wordOrId) ||
      g.dialects.some((d) => d.word.includes(wordOrId)),
  );
}

export function getDialectsByCategory(category: DialectCategoryKey): DialectWordGroup[] {
  return DIALECT_WORD_GROUPS.filter((g) => g.category === category);
}

export function searchDialectGroups(query: string): DialectWordGroup[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return DIALECT_WORD_GROUPS;

  return DIALECT_WORD_GROUPS.filter(
    (g) =>
      g.standardWord.toLowerCase().includes(trimmed) ||
      g.categoryLabel.toLowerCase().includes(trimmed) ||
      g.dialects.some(
        (d) =>
          d.word.toLowerCase().includes(trimmed) ||
          d.meaning.toLowerCase().includes(trimmed) ||
          d.region.includes(trimmed),
      ),
  );
}
