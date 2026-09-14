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
  return (
    <fieldset className="smart-filters" disabled={disabled}>
      <legend>ปรับบริบทของคำแนะนำ</legend>
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

