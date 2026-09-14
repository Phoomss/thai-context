import { useEffect, useRef, useState } from "react";
export default function PersistentSearchComposer({
  query,
  busy,
  onSearch,
  visible = true,
}: {
  query: string;
  busy: boolean;
  onSearch: (query: string) => void;
  visible?: boolean;
}) {
  const [value, setValue] = useState(query);
  const [error, setError] = useState("");
  const [hidden, setHidden] = useState(!visible);
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => setValue(query), [query]);
  useEffect(() => { if (visible) setHidden(false); }, [visible]);
  function submit() {
    if (busy) return;
    if (!value.trim()) {
      setError("ลองเล่าความหมายเพิ่มอีกนิด");
      input.current?.focus();
      return;
    }
    setError("");
    input.current?.blur();
    onSearch(value.trim());
  }
  return (
    <div className="composer-wrap" data-visible={visible} inert={hidden} aria-hidden={hidden}
      onTransitionEnd={event => {
        if (event.target !== event.currentTarget || event.propertyName !== "opacity" || visible) return;
        if (event.currentTarget.contains(document.activeElement)) {
          (document.activeElement as HTMLElement)?.blur();
        }
        setHidden(true);
      }}>
      <form
        className="bottom-composer"
        role="search"
        aria-label="ค้นหาความหมายเพิ่มเติม"
        aria-busy={busy}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="sr-only" htmlFor="persistent-meaning">
          เล่าความหมายอื่นที่คุณกำลังคิด
        </label>
        <textarea
          id="persistent-meaning"
          ref={input}
          rows={2}
          maxLength={600}
          value={value}
          disabled={busy}
          placeholder="เล่าความหมายอื่นที่คุณกำลังคิด…"
          aria-invalid={!!error}
          aria-describedby={error ? "composer-error" : undefined}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          disabled={busy}
          type="submit"
          aria-label={busy ? "กำลังค้นหา" : "ค้นหาคำอีกครั้ง"}
        >
          {busy ? (
            <span className="loading-dot" aria-hidden="true">
              ···
            </span>
          ) : (
            <span aria-hidden="true">↑</span>
          )}
        </button>
      </form>
      {error && (
        <p role="alert" id="composer-error">
          {error}
        </p>
      )}
      <p className="composer-hint" role="status">
        {busy ? "กำลังค้นจากบริบทและแหล่งข้อมูล…" : "เล่าความหมายใหม่ได้เสมอ"}
      </p>
    </div>
  );
}
