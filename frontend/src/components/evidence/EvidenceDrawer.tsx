import { useEffect, useRef } from "react";
import type { Recommendation } from "@/lib/search-types";
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
  const sources = word.sources ?? (word.evidence ? [word.evidence] : []);
  return (
    <dialog
      ref={dialog}
      className="evidence-drawer"
      aria-labelledby="evidence-title"
      onKeyDown={e => {
        if (e.key !== "Tab") return;
        const controls = e.currentTarget.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex="0"]');
        const first = controls[0], last = controls[controls.length - 1];
        if ((e.shiftKey && document.activeElement === first) || (!e.shiftKey && document.activeElement === last)) {
          e.preventDefault(); (e.shiftKey ? last : first)?.focus();
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
        <h2 id="evidence-title">{word.headword}</h2>
        {sources.length ? (
          sources.map((evidence, index) => <section key={index} className="evidence-source">
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
              {evidence.edition_year ? `พ.ศ. ${evidence.edition_year}` : ""}
              {evidence.page_number ? ` · หน้า ${evidence.page_number}` : ""}
            </p>
            <blockquote>{evidence.quote}</blockquote>
          </section>)
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
