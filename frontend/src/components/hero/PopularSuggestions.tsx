"use client";

export interface ContextPreset {
  category: string;
  label: string;
  query: string;
  targetPattern: string;
  guidanceHint: string;
  targetWordCandidate: string;
}

export const CONTEXT_PRESETS: ContextPreset[] = [
  {
    category: "💼 การทำงาน",
    label: "ทำงานได้ผลดีคุ้มค่า",
    query: "ทำงานได้ผลดีโดยใช้ทรัพยากรน้อย สำหรับเขียนรายงาน",
    targetPattern: "[ทีมงาน] ปรับขั้นตอนเพื่อเพิ่ม [ประสิทธิภาพ] ในการทำงาน",
    guidanceHint: "เน้นกระบวนการทำงานที่ประหยัดเวลา/งบประมาณ (ประสิทธิภาพ)",
    targetWordCandidate: "ประสิทธิภาพ",
  },
  {
    category: "🎯 บรรลุเป้าหมาย",
    label: "ผลสำเร็จตามเป้าหมาย",
    query: "ผลสำเร็จที่เกิดขึ้นตามเป้าหมายที่ตั้งไว้",
    targetPattern: "[มาตรการ] ก่อให้เกิด [ประสิทธิผล] ตรงตามเป้าหมายที่กำหนด",
    guidanceHint: "เน้นผลลัพธ์ปลายทางที่บรรลุตามวัตถุประสงค์ (ประสิทธิผล)",
    targetWordCandidate: "ประสิทธิผล",
  },
  {
    category: "🤝 ร่วมแรงร่วมใจ",
    label: "ช่วยกันทำงานให้สำเร็จ",
    query: "คำทางการที่หมายถึงการช่วยกันทำงานให้สำเร็จ",
    targetPattern: "[ทุกฝ่าย] ยินดีให้ความ [ร่วมมือ] ในการดำเนินงาน",
    guidanceHint: "เน้นการลงแรงร่วมใจกันของพันธมิตร (ร่วมมือ)",
    targetWordCandidate: "ร่วมมือ",
  },
  {
    category: "🗣️ มารยาทสุภาพ",
    label: "ขอให้รออย่างสุภาพ",
    query: "อยากขอให้ผู้อื่นรอสักครู่ด้วยคำที่สุภาพ",
    targetPattern: "ขอความ [กรุณารอสักครู่] เจ้าหน้าที่กำลังตรวจสอบข้อมูล",
    guidanceHint: "กาลเทศะงานบริการและธุรกิจ ไม่ใช้คำว่ารอก่อน (กรุณารอสักครู่)",
    targetWordCandidate: "กรุณารอสักครู่",
  },
  {
    category: "🎓 งานวิชาการ",
    label: "ศึกษาอย่างเป็นระบบ",
    query: "คำที่หมายถึงการศึกษาอย่างเป็นระบบเพื่อค้นหาความรู้ใหม่",
    targetPattern: "[คณะผู้วิจัย] ได้ดำเนินการ [วิจัย] เพื่อหาข้อสรุปเชิงประจักษ์",
    guidanceHint: "ระเบียบวิธีวิจัยและหลักฐานเชิงประจักษ์ (วิจัย)",
    targetWordCandidate: "วิจัย",
  },
  {
    category: "💭 ถนอมน้ำใจ",
    label: "ไม่อยากให้ผู้อื่นลำบาก",
    query: "ไม่อยากให้ผู้อื่นต้องลำบากเดือดร้อน หรือรำคาญใจเพราะตน",
    targetPattern: "[เรา] รู้สึก [เกรงใจ] ที่ต้องรบกวนเวลาในวันหยุด",
    guidanceHint: "ความเคารพและมารยาททางสังคมที่ถนอมน้ำใจ (เกรงใจ)",
    targetWordCandidate: "เกรงใจ",
  },
];

export default function PopularSuggestions({
  onSelect,
  disabled,
}: {
  onSelect: (query: string) => void;
  onSearchExecute?: (query: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="popular-suggestions-container">
      <div className="popular-suggestions-header">
        <span className="popular-suggestions-title font-ui">
          <span>💡</span>
          <span>สถานการณ์และบริบทตัวอย่างที่พบบ่อย (คลิกเพื่อเลือกข้อความ):</span>
        </span>
      </div>

      <div className="popular-presets-grid" role="group" aria-label="สถานการณ์บริบทตัวอย่าง">
        {CONTEXT_PRESETS.map((preset) => (
          <button
            className="preset-chip-btn font-thai-reading"
            type="button"
            disabled={disabled}
            onClick={() => onSelect(preset.query)}
            key={preset.label}
            title={`เลือกข้อความ: ${preset.label}`}
          >
            <span className="preset-category-tag">{preset.category}</span>
            <span className="preset-label-text">{preset.label}</span>
            <span className="preset-arrow-hint" aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    </div>
  );
}
