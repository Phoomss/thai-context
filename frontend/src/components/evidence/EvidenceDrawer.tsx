import { useEffect, useRef, useState } from "react";
import type { Recommendation } from "@/lib/search-types";
import { toThaiNumerals } from "@/lib/evolution-data";

function formatAcademicCitation(
  headword: string,
  ev: {
    source_book?: string;
    edition?: string;
    edition_year?: number;
    page_number?: number;
  }
): string {
  const author = "สำนักงานราชบัณฑิตยสภา";
  const yearStr = ev.edition_year
    ? `(${toThaiNumerals(ev.edition_year)})`
    : "(๒๕๕๔)";
  const book = ev.source_book || "พจนานุกรม ฉบับราชบัณฑิตยสถาน";
  const edStr = ev.edition ? ` (${ev.edition})` : "";
  const pageStr = ev.page_number
    ? `. หน้า ${toThaiNumerals(ev.page_number)}.`
    : ".";
  return `${author}. ${yearStr}. ${book}${edStr}${pageStr} คำว่า "${headword}".`;
}

export default function EvidenceDrawer({
  word,
  isDemo,
  onClose,
}: {
  word: Recommendation;
  isDemo: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const prior = document.activeElement as HTMLElement | null;
    const old = document.body.style.overflow;
    const element = dialog.current;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      element?.close();
      prior?.focus({ preventScroll: true });
    };
  }, []);

  const handleCopyCitation = (citationText: string, idx: number) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(citationText);
      }
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2500);
    } catch {
      // Fallback
    }
  };

  const sources = word.sources ?? (word.evidence ? [word.evidence] : []);

  return (
    <dialog
      ref={dialog}
      className="evidence-drawer"
      aria-labelledby="evidence-title"
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const controls = e.currentTarget.querySelectorAll<HTMLElement>(
          'button, a[href], input, select, textarea, [tabindex="0"]'
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (
          (e.shiftKey && document.activeElement === first) ||
          (!e.shiftKey && document.activeElement === last)
        ) {
          e.preventDefault();
          (e.shiftKey ? last : first)?.focus();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drawer-content">
        <header>
          <span>หลักฐานอ้างอิง</span>
          <button
            autoFocus
            type="button"
            onClick={onClose}
            aria-label="ปิดหลักฐาน"
          >
            ×
          </button>
        </header>
        <h2 id="evidence-title" className="font-thai-reading">
          {word.headword}
        </h2>
        {sources.length ? (
          sources.map((evidence, index) => {
            const citation = formatAcademicCitation(word.headword, evidence);
            return (
              <section
                key={index}
                className="evidence-source font-thai-reading"
              >
                <p className="evidence-status">
                  {isDemo
                    ? "ข้อมูลเดโม — ยังไม่รับรองหลักฐาน"
                    : evidence.is_official
                    ? "✓ Official Verified · แหล่งข้อมูลทางการ"
                    : "แหล่งข้อมูลที่ยังไม่รับรอง"}
                </p>
                <h3>{evidence.source_book}</h3>
                <p>
                  {evidence.edition ? `${evidence.edition} · ` : ""}
                  {evidence.edition_year
                    ? `พ.ศ. ${toThaiNumerals(evidence.edition_year)}`
                    : ""}
                  {evidence.page_number
                    ? ` · หน้า ${toThaiNumerals(evidence.page_number)}`
                    : ""}
                </p>
                <blockquote>{evidence.quote}</blockquote>

                {/* Academic Citation Generator Box */}
                <div
                  className="citation-box"
                  style={{
                    marginTop: "16px",
                    padding: "12px 14px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "var(--muted)",
                      }}
                    >
                      การอ้างอิงทางวิชาการ (APA / มาตรฐานราชบัณฑิตยสภา):
                    </span>
                    <button
                      type="button"
                      className="citation-copy-btn"
                      onClick={() => handleCopyCitation(citation, index)}
                      style={{
                        fontSize: "11px",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background:
                          copiedIndex === index ? "#ecfdf5" : "white",
                        color:
                          copiedIndex === index ? "#047857" : "var(--ink)",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {copiedIndex === index
                        ? "คัดลอกการอ้างอิงแล้ว ✓"
                        : "📋 คัดลอกการอ้างอิง"}
                    </button>
                  </div>
                  <code
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#334155",
                      lineHeight: 1.6,
                      wordBreak: "break-word",
                      fontFamily: "var(--font-thai-reading)",
                    }}
                  >
                    {citation}
                  </code>
                </div>
              </section>
            );
          })
        ) : (
          <div className="safe-abstention">
            <h3>ยังไม่มีหลักฐานที่รับรอง</h3>
            <p>
              ระบบยังไม่พบหลักฐานที่เพียงพอสำหรับยืนยันข้อมูลนี้
              จึงไม่ควรสรุปเป็นข้อเท็จจริง
            </p>
            {isDemo && <p>คำแนะนำนี้เป็นข้อมูลเดโมสำหรับทดสอบการใช้งาน</p>}
          </div>
        )}
      </div>
    </dialog>
  );
}
