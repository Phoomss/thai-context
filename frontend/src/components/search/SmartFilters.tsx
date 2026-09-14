export type SmartFilterValue = {
  register: string;
  context: string;
  excluded: string;
};

export default function SmartFilters({
  registers,
  contexts,
  value,
  disabled,
  onChange,
}: {
  registers: string[];
  contexts: string[];
  value: SmartFilterValue;
  disabled: boolean;
  onChange: (value: SmartFilterValue) => void;
}) {
  const quickRegisters = ["ทางการ", "กึ่งทางการ", "ภาษาปาก"];

  return (
    <fieldset className="smart-filters" disabled={disabled}>
      <legend>ปรับบริบทของคำแนะนำ</legend>

      {/* Quick Register Switcher Pills */}
      <div
        className="quick-register-row"
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px",
          marginBottom: "10px",
          paddingBottom: "10px",
          borderBottom: "1px dashed var(--border)",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--muted)",
          }}
        >
          เลือกระดับภาษาด่วน:
        </span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange({ ...value, register: "" })}
          style={{
            padding: "4px 10px",
            borderRadius: "8px",
            fontSize: "12px",
            border: "1px solid var(--border)",
            background: value.register === "" ? "var(--accent)" : "white",
            color: value.register === "" ? "white" : "var(--ink)",
            cursor: "pointer",
            fontWeight: value.register === "" ? 600 : 400,
          }}
        >
          🌐 ทั้งหมด
        </button>
        {quickRegisters.map((reg) => {
          const isActive = value.register === reg;
          const label =
            reg === "ทางการ"
              ? "🏛️ ทางการ (Official)"
              : reg === "กึ่งทางการ"
              ? "💼 ธุรกิจ / กึ่งทางการ"
              : "💬 ภาษาปาก / พูด";
          return (
            <button
              key={reg}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ ...value, register: reg })}
              style={{
                padding: "4px 10px",
                borderRadius: "8px",
                fontSize: "12px",
                border: "1px solid var(--border)",
                background: isActive ? "var(--accent)" : "white",
                color: isActive ? "white" : "var(--ink)",
                cursor: "pointer",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <label>
        <span>ระดับภาษา</span>
        <select
          aria-label="เลือกระดับภาษา"
          value={value.register}
          onChange={(event) =>
            onChange({ ...value, register: event.target.value })
          }
        >
          <option value="">ทั้งหมด</option>
          {registers.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label>
        <span>บริบท</span>
        <select
          aria-label="เลือกบริบท"
          value={value.context}
          onChange={(event) =>
            onChange({ ...value, context: event.target.value })
          }
        >
          <option value="">ทุกบริบท</option>
          {contexts.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="excluded-filter">
        <span>คำที่ไม่ต้องการใช้</span>
        <input
          aria-label="ระบุคำที่ไม่ต้องการใช้"
          value={value.excluded}
          placeholder="เช่น เก่ง"
          onChange={(event) =>
            onChange({ ...value, excluded: event.target.value })
          }
        />
      </label>
      {(value.register || value.context || value.excluded) && (
        <button
          className="clear-filters"
          type="button"
          onClick={() => onChange({ register: "", context: "", excluded: "" })}
        >
          ล้างตัวกรอง
        </button>
      )}
    </fieldset>
  );
}
