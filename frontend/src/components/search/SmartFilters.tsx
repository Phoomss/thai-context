export type SmartFilterValue = {
  register: string;
  context: string;
  excluded: string;
  hasSignLanguage?: boolean;
  hasAudio?: boolean;
  hasBraille?: boolean;
  hasEnglish?: boolean;
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
  const activeCount =
    (value.register ? 1 : 0) +
    (value.context ? 1 : 0) +
    (value.excluded ? 1 : 0) +
    (value.hasSignLanguage ? 1 : 0) +
    (value.hasAudio ? 1 : 0) +
    (value.hasBraille ? 1 : 0) +
    (value.hasEnglish ? 1 : 0);

  return (
    <fieldset className="smart-filters" disabled={disabled}>
      {/* Header: Title, Active Filter Badge & Reset Button */}
      <div className="smart-filters-header">
        <div className="smart-filters-title-wrap">
          <span className="smart-filters-icon-badge" aria-hidden="true">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </span>
          <legend className="smart-filters-legend">ปรับบริบทของคำแนะนำ</legend>
          {activeCount > 0 && (
            <span className="smart-filters-active-count">
              กำลังกรอง {activeCount} เงื่อนไข
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            className="clear-filters smart-filters-reset-btn"
            type="button"
            disabled={disabled}
            onClick={() =>
              onChange({
                register: "",
                context: "",
                excluded: "",
                hasSignLanguage: false,
                hasAudio: false,
                hasBraille: false,
                hasEnglish: false,
              })
            }
            title="ล้างตัวกรองทั้งหมด"
          >
            <span aria-hidden="true">✕</span>
            <span>ล้างตัวกรอง</span>
          </button>
        )}
      </div>

      {/* Quick Register Switcher Pills */}
      <div className="smart-filters-quick-section">
        <span className="smart-filters-quick-label">เลือกระดับภาษาด่วน:</span>
        <div
          className="smart-filters-pills-row"
          role="group"
          aria-label="เลือกระดับภาษาด่วน"
        >
          <button
            type="button"
            disabled={disabled}
            className={`smart-filter-pill ${value.register === "" ? "is-active" : ""}`}
            onClick={() => onChange({ ...value, register: "" })}
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
                className={`smart-filter-pill ${isActive ? "is-active" : ""}`}
                onClick={() => onChange({ ...value, register: reg })}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Filters Controls Grid */}
      <div className="smart-filters-grid">
        {/* Register Dropdown */}
        <label className="smart-filter-control">
          <span className="smart-filter-label">
            <span className="label-icon" aria-hidden="true">📜</span>
            <span>ระดับภาษา</span>
          </span>
          <div className="smart-select-wrapper">
            <select
              aria-label="เลือกระดับภาษา"
              value={value.register}
              onChange={(event) =>
                onChange({ ...value, register: event.target.value })
              }
              className="smart-filter-select"
            >
              <option value="">ทั้งหมด</option>
              {registers.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <span className="select-chevron" aria-hidden="true">▾</span>
          </div>
        </label>

        {/* Context Dropdown */}
        <label className="smart-filter-control">
          <span className="smart-filter-label">
            <span className="label-icon" aria-hidden="true">🎯</span>
            <span>บริบท</span>
          </span>
          <div className="smart-select-wrapper">
            <select
              aria-label="เลือกบริบท"
              value={value.context}
              onChange={(event) =>
                onChange({ ...value, context: event.target.value })
              }
              className="smart-filter-select"
            >
              <option value="">ทุกบริบท</option>
              {contexts.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <span className="select-chevron" aria-hidden="true">▾</span>
          </div>
        </label>

        {/* Excluded Words Input */}
        <label className="smart-filter-control smart-filter-excluded">
          <span className="smart-filter-label">
            <span className="label-icon" aria-hidden="true">🚫</span>
            <span>คำที่ไม่ต้องการใช้</span>
          </span>
          <div className="smart-input-wrapper">
            <input
              aria-label="ระบุคำที่ไม่ต้องการใช้"
              value={value.excluded}
              placeholder="เช่น เก่ง, สวย..."
              onChange={(event) =>
                onChange({ ...value, excluded: event.target.value })
              }
              className="smart-filter-input"
            />
            {value.excluded && (
              <button
                type="button"
                className="smart-input-clear-btn"
                onClick={() => onChange({ ...value, excluded: "" })}
                aria-label="ล้างคำที่ไม่ต้องการใช้"
                title="ล้างข้อความนี้"
              >
                ✕
              </button>
            )}
          </div>
        </label>
      </div>

      {/* Accessibility Capabilities Filter Row */}
      <div
        className="smart-filters-access-row"
        style={{
          marginTop: "12px",
          paddingTop: "10px",
          borderTop: "1px dashed var(--border, #e2e8f0)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted, #64748b)" }}>
          ♿ มิติการเข้าถึง:
        </span>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={!!value.hasSignLanguage}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, hasSignLanguage: e.target.checked })}
          />
          <span>🤟 มีภาษามือไทย</span>
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={!!value.hasAudio}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, hasAudio: e.target.checked })}
          />
          <span>🔊 มีเสียงอ่าน</span>
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={!!value.hasBraille}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, hasBraille: e.target.checked })}
          />
          <span>⠠ มีเบรลล์</span>
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={!!value.hasEnglish}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, hasEnglish: e.target.checked })}
          />
          <span>🌐 มีแปลอังกฤษ</span>
        </label>
      </div>

      {/* Active Filter Tags / Quick Remove Chips */}
      {activeCount > 0 && (
        <div className="smart-filters-active-bar">
          <span className="active-bar-label">ตัวกรองที่เลือกไว้:</span>
          <div className="active-tags-list">
            {value.register && (
              <span className="active-filter-tag">
                ระดับภาษา: <strong>{value.register}</strong>
                <button
                  type="button"
                  onClick={() => onChange({ ...value, register: "" })}
                  aria-label="ลบตัวกรองระดับภาษา"
                  title="ยกเลิกตัวกรองระดับภาษา"
                >
                  ✕
                </button>
              </span>
            )}
            {value.context && (
              <span className="active-filter-tag">
                บริบท: <strong>{value.context}</strong>
                <button
                  type="button"
                  onClick={() => onChange({ ...value, context: "" })}
                  aria-label="ลบตัวกรองบริบท"
                  title="ยกเลิกตัวกรองบริบท"
                >
                  ✕
                </button>
              </span>
            )}
            {value.excluded && (
              <span className="active-filter-tag">
                ไม่เอาคำว่า: <strong>{value.excluded}</strong>
                <button
                  type="button"
                  onClick={() => onChange({ ...value, excluded: "" })}
                  aria-label="ลบคำที่ไม่ต้องการ"
                  title="ยกเลิกคำที่ไม่ต้องการ"
                >
                  ✕
                </button>
              </span>
            )}
            {value.hasSignLanguage && (
              <span className="active-filter-tag">
                🤟 <strong>มีภาษามือไทย</strong>
                <button
                  type="button"
                  onClick={() => onChange({ ...value, hasSignLanguage: false })}
                  aria-label="ลบตัวกรองภาษามือไทย"
                >
                  ✕
                </button>
              </span>
            )}
            {value.hasAudio && (
              <span className="active-filter-tag">
                🔊 <strong>มีเสียงอ่าน</strong>
                <button
                  type="button"
                  onClick={() => onChange({ ...value, hasAudio: false })}
                  aria-label="ลบตัวกรองเสียงอ่าน"
                >
                  ✕
                </button>
              </span>
            )}
            {value.hasBraille && (
              <span className="active-filter-tag">
                ⠠ <strong>มีเบรลล์</strong>
                <button
                  type="button"
                  onClick={() => onChange({ ...value, hasBraille: false })}
                  aria-label="ลบตัวกรองเบรลล์"
                >
                  ✕
                </button>
              </span>
            )}
            {value.hasEnglish && (
              <span className="active-filter-tag">
                🌐 <strong>มีแปลอังกฤษ</strong>
                <button
                  type="button"
                  onClick={() => onChange({ ...value, hasEnglish: false })}
                  aria-label="ลบตัวกรองแปลอังกฤษ"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </fieldset>
  );
}

