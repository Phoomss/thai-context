const suggestions = [
  ["เขียนรายงาน", "ทำงานได้ผลดีโดยใช้ทรัพยากรน้อย สำหรับเขียนรายงาน"],
  ["หาคำทางการ", "คำทางการที่หมายถึงการช่วยกันทำงานให้สำเร็จ"],
  ["คำที่สุภาพกว่า", "อยากขอให้ผู้อื่นรอสักครู่ด้วยคำที่สุภาพ"],
  ["งานวิชาการ", "คำที่หมายถึงการศึกษาอย่างเป็นระบบเพื่อค้นหาความรู้ใหม่"],
];
export default function PopularSuggestions({
  onSelect,
  disabled,
}: {
  onSelect: (query: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="suggestions">
      <span>ลองเริ่มจาก</span>
      <div>
        {suggestions.map(([label, query]) => (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(query)}
            key={label}
          >
            {label}
            <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    </div>
  );
}
