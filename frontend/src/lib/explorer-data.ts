export type EvolutionState = "NOT_FOUND" | "ADDED" | "MODIFIED";

export type EvolutionEra = {
  year: string;
  state: EvolutionState;
  label: string;
  definition: string;
  note: string;
};

export const evolutionEras: EvolutionEra[] = [
  {
    year: "๒๕๔๒",
    state: "ADDED",
    label: "บันทึกในฉบับ ๒๕๔๒",
    definition: "ความสามารถในการทำงานหรือการปฏิบัติหน้าที่ให้บังเกิดผลดีตามที่กำหนดไว้",
    note: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
  },
  {
    year: "๒๕๕๔",
    state: "MODIFIED",
    label: "ปรับปรุงนิยาม ๒๕๕๔",
    definition: "ความสามารถในการทำงานให้ได้ผล โดยใช้เวลาและทรัพยากรอย่างคุ้มค่า",
    note: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔ (เน้นความคุ้มค่าของทรัพยากร)",
  },
  {
    year: "๒๕๖๙",
    state: "MODIFIED",
    label: "ฉบับดิจิทัล ๒๕๖๙",
    definition: "ความสามารถในการปฏิบัติการที่ให้ผลลัพธ์สูงสุดโดยสูญเสียทรัพยากร พลังงาน หรือเวลาน้อยที่สุด ครอบคลุมทั้งระบบการทำงานและเทคโนโลยี",
    note: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๖๙ (ขยายความครอบคลุมระบบและเทคโนโลยี)",
  },
];

export type DialectEntry = {
  region: "เหนือ" | "อีสาน" | "กลาง" | "ใต้";
  word: string;
  meaning: string;
  provenance: "official" | "inferred";
  source: string;
};

export const dialectEntries: DialectEntry[] = [
  {
    region: "เหนือ",
    word: "กึ๊ดเติงหา",
    meaning: "คิดถึง ระลึกถึง, คำแสดงความผูกพันในภาษาถิ่นล้านนา",
    provenance: "official",
    source: "คลังข้อมูลภาษาถิ่นภาคเหนือ สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
  },
  {
    region: "อีสาน",
    word: "คึดฮอด",
    meaning: "คิดถึง อยากพบ, ปรากฏในวรรณกรรมและภาษาถิ่นอีสาน",
    provenance: "official",
    source: "คลังข้อมูลภาษาถิ่นอีสาน สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย มหาวิทยาลัยมหิดล",
  },
  {
    region: "กลาง",
    word: "คิดถึง",
    meaning: "นึกถึงด้วยความผูกพันหรือระลึกถึง",
    provenance: "official",
    source: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
  },
  {
    region: "ใต้",
    word: "ข้องใจถึง",
    meaning: "คิดถึง ระลึกถึงด้วยความห่วงใยในภาษาถิ่นใต้",
    provenance: "inferred",
    source: "AI ช่วยอนุมาน — ต้องตรวจสอบกับผู้รู้ภาษาถิ่นก่อนใช้งานจริง",
  },
];

