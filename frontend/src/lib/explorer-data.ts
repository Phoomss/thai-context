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
    state: "NOT_FOUND",
    label: "ยังไม่พบ",
    definition: "ยังไม่พบหัวคำนี้ในชุดข้อมูลตัวอย่างของฉบับปีดังกล่าว",
    note: "สถานะนี้ไม่ได้แปลว่าคำยังไม่ถูกใช้ เพียงแต่ยังไม่มีหลักฐานในชุดข้อมูลที่เชื่อมต่อ",
  },
  {
    year: "๒๕๕๔",
    state: "ADDED",
    label: "เพิ่มคำแล้ว",
    definition: "เริ่มพบคำและความหมายที่บันทึกไว้อย่างเป็นระบบในชุดข้อมูลตัวอย่าง",
    note: "แสดงจุดที่คำเข้าสู่ฐานข้อมูล ไม่ใช่ข้อสรุปเรื่องปีที่เริ่มใช้จริง",
  },
  {
    year: "๒๕๖๙",
    state: "MODIFIED",
    label: "ความหมายเปลี่ยน",
    definition: "บริบทการใช้ขยายจากความหมายเดิมไปสู่งานร่วมสมัยและการสื่อสารดิจิทัล",
    note: "ข้อความนี้เป็นข้อมูลเดโมเพื่อสาธิตสถานะ MODIFIED และพร้อมแทนด้วยข้อมูล backend",
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
    meaning: "คิดถึง ระลึกถึง",
    provenance: "official",
    source: "ชุดข้อมูลภาษาถิ่นตัวอย่าง — รอต่อคลังคำจริง",
  },
  {
    region: "อีสาน",
    word: "คึดฮอด",
    meaning: "คิดถึง อยากพบ",
    provenance: "official",
    source: "ชุดข้อมูลภาษาถิ่นตัวอย่าง — รอต่อคลังคำจริง",
  },
  {
    region: "กลาง",
    word: "คิดถึง",
    meaning: "นึกถึงด้วยความผูกพัน",
    provenance: "official",
    source: "คำมาตรฐานในชุดข้อมูลสาธิต",
  },
  {
    region: "ใต้",
    word: "ข้องใจถึง",
    meaning: "ตัวอย่างคำอนุมานสำหรับความหมายใกล้เคียง",
    provenance: "inferred",
    source: "AI ช่วยอนุมาน — ต้องตรวจสอบกับผู้รู้ภาษาถิ่นก่อนใช้งานจริง",
  },
];

