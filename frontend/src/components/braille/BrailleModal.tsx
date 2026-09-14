"use client";

import { useEffect, useRef, useState } from "react";
import type { BrailleCell, BrailleData } from "@/lib/accessibility-types";
import { fetchBraille } from "@/lib/api-client";
import {
  dotsToCellGrid,
  dotsToBrailleChar,
  decodeDotsToThai,
  decodeBrailleToThai,
} from "@/lib/braille-encoder";
import { audioManager } from "@/lib/audio-manager";
import Icon from "../ui/Icon";

export interface BrailleModalProps {
  word: string;
  isOpen: boolean;
  onClose: () => void;
  initialData?: BrailleData | null;
}

export default function BrailleModal({
  word,
  isOpen,
  onClose,
  initialData,
}: BrailleModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Mode tab state: "forward" (Thai -> Braille) or "reverse" (Braille -> Thai)
  const [activeTab, setActiveTab] = useState<"forward" | "reverse">("forward");

  // Forward mode state
  const [data, setData] = useState<BrailleData | null>(initialData ?? null);
  const [loading, setLoading] = useState(initialData === undefined);
  const [error, setError] = useState<string | null>(null);
  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // Reverse mode state
  const [reverseInput, setReverseInput] = useState<string>(
    initialData?.brailleUnicode ?? ""
  );
  const [keypadDots, setKeypadDots] = useState<number[]>([]);
  const [reverseCopied, setReverseCopied] = useState(false);

  // Dialog open / close and body overflow lifecycle + Focus management
  useEffect(() => {
    if (!isOpen) return;

    const prior = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    const dialogElement = dialogRef.current;

    if (dialogElement && !dialogElement.open) {
      dialogElement.showModal();
      document.body.style.overflow = "hidden";
      // Move focus into modal on open
      requestAnimationFrame(() => {
        closeBtnRef.current?.focus();
      });
    }

    return () => {
      document.body.style.overflow = oldOverflow;
      if (dialogElement?.open) {
        dialogElement.close();
      }
      // Return focus to trigger button on close
      prior?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  // Data fetching lifecycle for forward mode
  useEffect(() => {
    if (!isOpen || !word) return;

    if (initialData !== undefined) {
      setData(initialData);
      setLoading(false);
      setError(null);
      if (initialData?.brailleUnicode) {
        setReverseInput((prev) => prev || initialData.brailleUnicode);
      }
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchBraille(word, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
          if (result) {
            setAnnouncement(
              `โหลดอักษรเบรลล์สำหรับคำว่า ${word} เรียบร้อยแล้ว ตัวอักษรเบรลล์คือ ${result.brailleUnicode}`
            );
            setReverseInput(result.brailleUnicode);
          }
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err?.message || "ไม่สามารถโหลดข้อมูลอักษรเบรลล์ได้");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [isOpen, word, initialData]);

  if (!isOpen) return null;

  // Forward Handlers
  const handleCopy = () => {
    if (!data?.brailleUnicode) return;
    navigator.clipboard?.writeText(data.brailleUnicode).then(() => {
      setCopied(true);
      setAnnouncement("คัดลอกอักษรเบรลล์ลงคลิปบอร์ดแล้ว");
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleTTS = () => {
    audioManager.toggle({ headword: word, definition: "" });
    setAnnouncement(`กำลังเล่นเสียงอ่านคำว่า ${word}`);
  };

  // Reverse Handlers
  const toggleDot = (dotNum: number) => {
    setKeypadDots((prev) => {
      const exists = prev.includes(dotNum);
      const next = exists
        ? prev.filter((d) => d !== dotNum)
        : [...prev, dotNum].sort((a, b) => a - b);
      setAnnouncement(exists ? `ยกเลิกจุด ${dotNum}` : `เลือกจุด ${dotNum}`);
      return next;
    });
  };

  const handleAddKeypadCell = () => {
    const cellBraille =
      keypadDots.length > 0 ? dotsToBrailleChar(keypadDots) : " ";
    const decoded = decodeDotsToThai(keypadDots);
    setReverseInput((prev) => prev + cellBraille);
    setKeypadDots([]);
    setAnnouncement(
      `เพิ่มเซลล์ ${cellBraille} (ถอดรหัสเป็น ${
        decoded.char === " " ? "ช่องว่าง" : decoded.char
      }) แล้ว`
    );
  };

  const handleAddSpace = () => {
    setReverseInput((prev) => prev + " ");
    setKeypadDots([]);
    setAnnouncement("เพิ่มช่องว่างแล้ว");
  };

  const handleBackspace = () => {
    setReverseInput((prev) => prev.slice(0, -1));
    setAnnouncement("ลบตัวอักษรล่าสุดแล้ว");
  };

  const handleClearAll = () => {
    setReverseInput("");
    setKeypadDots([]);
    setAnnouncement("ล้างข้อความและจุดทั้งหมดแล้ว");
  };

  const reverseResult = decodeBrailleToThai(reverseInput);

  const handleTTSDecoded = () => {
    if (!reverseResult.decodedText.trim()) return;
    audioManager.toggle({ headword: reverseResult.decodedText, definition: "" });
    setAnnouncement(`กำลังเล่นเสียงอ่านข้อความ: ${reverseResult.decodedText}`);
  };

  const handleCopyDecoded = () => {
    if (!reverseResult.decodedText) return;
    navigator.clipboard?.writeText(reverseResult.decodedText).then(() => {
      setReverseCopied(true);
      setAnnouncement(`คัดลอกข้อความ "${reverseResult.decodedText}" แล้ว`);
      setTimeout(() => setReverseCopied(false), 2200);
    });
  };

  const currentKeypadBraille = dotsToBrailleChar(keypadDots);
  const currentKeypadDecoded = decodeDotsToThai(keypadDots);

  const cells = data?.brailleCells ?? [];
  const selectedCell: BrailleCell | undefined =
    activeCellIndex !== null ? cells[activeCellIndex] : undefined;

  return (
    <dialog
      ref={dialogRef}
      className="braille-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="braille-modal-title"
      aria-describedby="braille-reading-guide"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
          return;
        }
        if (e.key === "Tab") {
          const controls = e.currentTarget.querySelectorAll<HTMLElement>(
            'button, a[href], input, select, textarea, [tabindex="0"]'
          );
          if (controls.length === 0) return;
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="braille-modal-surface">
        {/* Accessible Live Region for Screen Readers */}
        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>

        <header className="braille-modal-header">
          <div className="braille-header-title">
            <span className="braille-icon-pill" aria-hidden="true">
              ⠃
            </span>
            <div>
              <span className="braille-kicker font-thai-reading">
                อักษรเบรลล์ไทย (Thai Braille)
              </span>
              <h2 id="braille-modal-title" className="font-thai-reading">
                {word}
              </h2>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="braille-close-btn"
            onClick={onClose}
            aria-label="ปิดหน้าต่างอักษรเบรลล์"
          >
            ×
          </button>
        </header>

        {/* Mode Switcher Tabs */}
        <nav
          className="braille-mode-bar font-thai-reading"
          role="tablist"
          aria-label="เลือกโหมดอักษรเบรลล์"
        >
          <button
            type="button"
            role="tab"
            id="tab-braille-forward"
            aria-selected={activeTab === "forward"}
            aria-controls="panel-braille-forward"
            className={`braille-tab-btn ${
              activeTab === "forward" ? "is-active" : ""
            }`}
            onClick={() => {
              setActiveTab("forward");
              setAnnouncement("เข้าสู่โหมด คำศัพท์เป็นอักษรเบรลล์");
            }}
          >
            <span>คำศัพท์ → อักษรเบรลล์</span>
          </button>
          <button
            type="button"
            role="tab"
            id="tab-braille-reverse"
            aria-selected={activeTab === "reverse"}
            aria-controls="panel-braille-reverse"
            className={`braille-tab-btn ${
              activeTab === "reverse" ? "is-active" : ""
            }`}
            onClick={() => {
              setActiveTab("reverse");
              setAnnouncement(
                "เข้าสู่โหมด ถอดรหัสย้อนกลับ อักษรเบรลล์เป็นข้อความภาษาไทย"
              );
            }}
          >
            <span>ถอดรหัสย้อนกลับ (Reverse Braille) 🔄</span>
          </button>
        </nav>

        <div className="braille-modal-body">
          {activeTab === "forward" ? (
            /* TAB 1: FORWARD BRAILLE (Thai Word -> Braille) */
            loading ? (
              <div
                className="braille-state-box braille-loading-state"
                role="status"
                aria-busy="true"
              >
                <div className="braille-spinner" aria-hidden="true" />
                <p className="font-thai-reading">กำลังประมวลผลอักษรเบรลล์…</p>
                <span className="sr-only">กำลังโหลดข้อมูลอักษรเบรลล์</span>
              </div>
            ) : error ? (
              <div
                className="braille-state-box braille-error-state"
                role="alert"
              >
                <span className="braille-state-icon" aria-hidden="true">
                  ⚠️
                </span>
                <h3 className="font-thai-reading">เกิดข้อผิดพลาดในการโหลด</h3>
                <p className="font-thai-reading">{error}</p>
                <button
                  type="button"
                  className="braille-action-btn font-thai-reading"
                  onClick={() => {
                    setLoading(true);
                    fetchBraille(word)
                      .then((r) => setData(r))
                      .catch((err) => setError(err?.message))
                      .finally(() => setLoading(false));
                  }}
                >
                  ลองใหม่อีกครั้ง
                </button>
              </div>
            ) : !data || cells.length === 0 ? (
              <div
                className="braille-state-box braille-empty-state"
                role="status"
              >
                <span className="braille-state-icon" aria-hidden="true">
                  ⠃
                </span>
                <h3 className="font-thai-reading">
                  ไม่มีข้อมูลอักษรเบรลล์สำหรับคำนี้
                </h3>
                <p className="font-thai-reading">
                  ไม่พบรูปแบบอักษรเบรลล์ที่สอดคล้องกับคำว่า &ldquo;
                  <strong>{word}</strong>&rdquo;
                </p>
                <button
                  type="button"
                  className="braille-action-btn font-thai-reading"
                  onClick={onClose}
                >
                  กลับสู่หน้ารายละเอียดคำ
                </button>
              </div>
            ) : (
              <div
                id="panel-braille-forward"
                role="tabpanel"
                aria-labelledby="tab-braille-forward"
                className="braille-content-stack"
              >
                {/* Primary Unicode Braille Pattern Display Banner */}
                <section
                  className="braille-banner"
                  aria-label={`รูปแบบอักษรเบรลล์ของคำว่า ${word}`}
                >
                  <div className="braille-banner-left">
                    <span className="braille-banner-label font-thai-reading">
                      รูปแบบอักษรเบรลล์ (Unicode Braille Pattern)
                    </span>
                    <div
                      className="braille-unicode-display"
                      tabIndex={0}
                      role="region"
                      aria-label={`อักษรเบรลล์: ${data.brailleUnicode} จำนวน ${cells.length} เซลล์`}
                    >
                      <span className="braille-chars">
                        {data.brailleUnicode}
                      </span>
                    </div>
                  </div>

                  <div className="braille-banner-actions">
                    <button
                      type="button"
                      className="braille-tts-btn font-thai-reading"
                      onClick={handleTTS}
                      aria-label={`ฟังเสียงอ่านคำว่า ${word}`}
                      title="ฟังเสียงอ่านออกเสียงคำศัพท์"
                    >
                      <Icon name="volume" />
                      <span>ฟังเสียงอ่าน</span>
                    </button>
                    <button
                      type="button"
                      className="braille-copy-btn font-thai-reading"
                      onClick={handleCopy}
                      aria-label="คัดลอกอักษรเบรลล์"
                      title="คัดลอกอักขระเบรลล์ยูนิโค้ด"
                    >
                      <Icon name="copy" />
                      <span>{copied ? "คัดลอกแล้ว!" : "คัดลอก"}</span>
                    </button>
                  </div>
                </section>

                {/* Visual 6-Dot Cells Breakdown */}
                <section
                  className="braille-cells-section"
                  aria-label="การกระจายจุดสัมผัส 6 จุดของแต่ละตัวอักษร"
                >
                  <div className="section-head">
                    <h3 className="braille-section-title font-thai-reading">
                      เซลล์อักษรเบรลล์ 6 จุด (Visual 6-Dot Cells)
                    </h3>
                    <span className="braille-help-tip font-thai-reading">
                      เลือกตัวอักษรเพื่อดูตำแหน่งจุดนูน
                    </span>
                  </div>

                  <div
                    className="braille-cells-grid"
                    role="list"
                    aria-label="รายการเซลล์อักษรเบรลล์"
                  >
                    {cells.map((cell, idx) => {
                      const grid = dotsToCellGrid(cell.dots);
                      const isSelected = activeCellIndex === idx;
                      const dotsLabel =
                        cell.dots.length > 0
                          ? `จุด ${cell.dots.join("-")}`
                          : "ไม่มีจุด";

                      return (
                        /* eslint-disable-next-line jsx-a11y/role-supports-aria-props */
                        <button
                          key={`${cell.char}-${idx}`}
                          type="button"
                          role="listitem"
                          className={`braille-cell-card ${
                            isSelected ? "is-selected" : ""
                          }`}
                            onClick={() => {
                              const next = isSelected ? null : idx;
                              setActiveCellIndex(next);
                              setAnnouncement(
                                next !== null
                                  ? `เลือกอักษร ${cell.char} อักษรเบรลล์ ${cell.braille} ${cell.description}`
                                  : "ยกเลิกการเลือกเซลล์"
                              );
                            }}
                            aria-pressed={isSelected}
                            aria-label={`ตัวอักษร ${cell.char}, อักษรเบรลล์ ${cell.braille}, ${dotsLabel}`}
                          >
                            <span className="cell-thai-char font-thai-reading">
                              {cell.char === " " ? "␣" : cell.char}
                            </span>

                            {/* Standard 2x3 Braille Dot Matrix */}
                            <div
                              className="braille-dot-matrix"
                              aria-hidden="true"
                              title={`จุด: ${dotsLabel}`}
                            >
                              {/* Left column: Dots 1, 2, 3 */}
                              <div className="matrix-col">
                                <span
                                  className={`dot dot-1 ${
                                    grid[0][0] ? "is-filled" : ""
                                  }`}
                                />
                                <span
                                  className={`dot dot-2 ${
                                    grid[1][0] ? "is-filled" : ""
                                  }`}
                                />
                                <span
                                  className={`dot dot-3 ${
                                    grid[2][0] ? "is-filled" : ""
                                  }`}
                                />
                              </div>
                              {/* Right column: Dots 4, 5, 6 */}
                              <div className="matrix-col">
                                <span
                                  className={`dot dot-4 ${
                                    grid[0][1] ? "is-filled" : ""
                                  }`}
                                />
                                <span
                                  className={`dot dot-5 ${
                                    grid[1][1] ? "is-filled" : ""
                                  }`}
                                />
                                <span
                                  className={`dot dot-6 ${
                                    grid[2][1] ? "is-filled" : ""
                                  }`}
                                />
                              </div>
                            </div>

                            <span className="cell-unicode-char">
                              {cell.braille}
                            </span>
                            <span className="cell-dots-badge font-thai-reading">
                              {cell.dots.length > 0 ? cell.dots.join(",") : "—"}
                            </span>
                          </button>
                      );
                    })}
                  </div>

                  {/* Selected Cell Inspector */}
                  {selectedCell && (
                    <div
                      className="cell-inspector-box font-thai-reading"
                      role="region"
                      aria-label={`รายละเอียดเซลล์ ${selectedCell.char}`}
                    >
                      <span className="inspector-badge">รายละเอียดจุดนูน</span>
                      <strong className="inspector-title">
                        ตัวอักษร: {selectedCell.char} &rarr;{" "}
                        {selectedCell.braille}
                      </strong>
                      <p className="inspector-desc">{selectedCell.description}</p>
                      <span className="inspector-role">
                        ประเภท:{" "}
                        {selectedCell.role === "consonant"
                          ? "พยัญชนะ"
                          : selectedCell.role === "vowel"
                          ? "สระ"
                          : selectedCell.role === "tone"
                          ? "วรรณยุกต์"
                          : "สัญลักษณ์"}
                      </span>
                    </div>
                  )}
                </section>

                {/* Reading & Spelling Guide */}
                {data.readingGuide && (
                  <section
                    id="braille-reading-guide"
                    className="braille-guide-section"
                    aria-labelledby="guide-heading"
                  >
                    <h3
                      id="guide-heading"
                      className="braille-section-title font-thai-reading"
                    >
                      วิธีการสะกดและอ่านอักษรเบรลล์ (Spelling &amp; Reading Guide)
                    </h3>
                    <div className="guide-content-box font-thai-reading">
                      <p>{data.readingGuide}</p>
                    </div>
                  </section>
                )}

                {/* Attribution and Standard Footer */}
                <footer className="braille-footer-meta font-thai-reading">
                  <div className="meta-left">
                    <span>มาตรฐานอ้างอิง:</span>
                    <strong>
                      {data.sourceAttribution ||
                        "สมาคมคนตาบอดแห่งประเทศไทย"}
                    </strong>
                  </div>
                  <div className="meta-right">
                    <span className="meta-status">
                      ✓{" "}
                      {data.verificationStatus === "OFFICIAL"
                        ? "รับรองมาตรฐานทางการ"
                        : data.verificationStatus}
                    </span>
                  </div>
                </footer>
              </div>
            )
          ) : (
            /* TAB 2: REVERSE BRAILLE (Braille Dots / Characters -> Thai Text) */
            <div
              id="panel-braille-reverse"
              role="tabpanel"
              aria-labelledby="tab-braille-reverse"
              className="braille-content-stack reverse-stack"
            >
              {/* Interactive 6-Dot Keypad Card */}
              <section
                className="reverse-keypad-card"
                aria-labelledby="reverse-keypad-heading"
              >
                <div className="section-head">
                  <div>
                    <h3
                      id="reverse-keypad-heading"
                      className="braille-section-title font-thai-reading"
                    >
                      แป้นสัมผัสจำลอง 6 จุด (Tactile 6-Dot Keypad)
                    </h3>
                    <span className="braille-help-tip font-thai-reading">
                      กดเลือกจุด (1–6) เพื่อประกอบเซลล์อักษรเบรลล์ แล้วกด &quot;เพิ่มเซลล์นี้&quot;
                    </span>
                  </div>
                  {data?.brailleUnicode && (
                    <button
                      type="button"
                      className="reverse-load-current-btn font-thai-reading"
                      onClick={() => {
                        setReverseInput(data.brailleUnicode);
                        setAnnouncement(`โหลดอักษรเบรลล์ของคำว่า ${word} แล้ว`);
                      }}
                      title={`โหลดอักษรเบรลล์ของคำว่า "${word}"`}
                    >
                      ใช้อักษรเบรลล์ของคำนี้ ({word})
                    </button>
                  )}
                </div>

                <div className="reverse-keypad-workspace">
                  {/* Standard 2x3 Matrix Keypad */}
                  <div
                    className="reverse-dot-matrix-controls"
                    role="group"
                    aria-label="แป้นกดจุด 6 จุด"
                  >
                    {/* Left column: Dots 1, 2, 3 */}
                    <div className="reverse-matrix-col">
                      {[1, 2, 3].map((dotNum) => {
                        const isToggled = keypadDots.includes(dotNum);
                        return (
                          <button
                            key={dotNum}
                            type="button"
                            className={`reverse-dot-btn ${
                              isToggled ? "is-active" : ""
                            }`}
                            onClick={() => toggleDot(dotNum)}
                            aria-pressed={isToggled}
                            aria-label={`จุดที่ ${dotNum}${
                              isToggled ? " (เลือกอยู่)" : ""
                            }`}
                          >
                            <span className="reverse-dot-indicator" />
                            <span className="reverse-dot-label">
                              จุด {dotNum}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right column: Dots 4, 5, 6 */}
                    <div className="reverse-matrix-col">
                      {[4, 5, 6].map((dotNum) => {
                        const isToggled = keypadDots.includes(dotNum);
                        return (
                          <button
                            key={dotNum}
                            type="button"
                            className={`reverse-dot-btn ${
                              isToggled ? "is-active" : ""
                            }`}
                            onClick={() => toggleDot(dotNum)}
                            aria-pressed={isToggled}
                            aria-label={`จุดที่ ${dotNum}${
                              isToggled ? " (เลือกอยู่)" : ""
                            }`}
                          >
                            <span className="reverse-dot-indicator" />
                            <span className="reverse-dot-label">
                              จุด {dotNum}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Cell Preview & Actions */}
                  <div className="reverse-cell-preview-card font-thai-reading">
                    <span className="preview-label">เซลล์ที่กำลังสร้าง</span>
                    <div className="preview-cell-stage">
                      <span className="preview-braille-char">
                        {currentKeypadBraille}
                      </span>
                      <div className="preview-cell-info">
                        <span className="preview-thai-char">
                          {currentKeypadDecoded.char === " "
                            ? "(ช่องว่าง)"
                            : currentKeypadDecoded.char}
                        </span>
                        <span className="preview-dots-summary">
                          {keypadDots.length > 0
                            ? `จุด ${keypadDots.join("-")}`
                            : "ยังไม่ได้เลือกจุด"}
                        </span>
                        <span className="preview-desc">
                          {currentKeypadDecoded.description}
                        </span>
                      </div>
                    </div>

                    <div className="reverse-keypad-actions">
                      <button
                        type="button"
                        className="reverse-action-add font-thai-reading"
                        onClick={handleAddKeypadCell}
                        aria-label={`เพิ่มตัวอักษร ${currentKeypadDecoded.char} ลงในข้อความ`}
                      >
                        + เพิ่มเซลล์นี้
                      </button>
                      <button
                        type="button"
                        className="reverse-action-aux font-thai-reading"
                        onClick={handleAddSpace}
                        aria-label="เพิ่มช่องว่าง"
                      >
                        ␣ เว้นวรรค
                      </button>
                      <button
                        type="button"
                        className="reverse-action-aux font-thai-reading"
                        onClick={handleBackspace}
                        aria-label="ลบตัวอักษรล่าสุด"
                      >
                        ⌫ ลบตัวล่าสุด
                      </button>
                      <button
                        type="button"
                        className="reverse-action-aux font-thai-reading"
                        onClick={handleClearAll}
                        aria-label="ล้างข้อความทั้งหมด"
                      >
                        ล้างทั้งหมด
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Direct Braille Unicode Input Field */}
              <section
                className="reverse-input-section"
                aria-label="กรอกอักษรเบรลล์ยูนิโค้ด"
              >
                <div className="reverse-input-header">
                  <label
                    htmlFor="braille-text-input"
                    className="reverse-input-label font-thai-reading"
                  >
                    ข้อความอักษรเบรลล์ (Unicode Braille):
                  </label>
                  <span className="braille-help-tip font-thai-reading">
                    {reverseInput.length} ตัวอักษร
                  </span>
                </div>
                <input
                  id="braille-text-input"
                  type="text"
                  className="braille-text-input-field"
                  value={reverseInput}
                  onChange={(e) => setReverseInput(e.target.value)}
                  placeholder="พิมพ์, วางอักษรเบรลล์ (เช่น ⠏⠇⠣) หรือกดจากแป้นจุดด้านบน"
                  aria-label="กล่องข้อความอักษรเบรลล์"
                />
              </section>

              {/* Decoded Thai Result Banner */}
              <section
                className="reverse-output-section"
                aria-label="ผลลัพธ์การถอดรหัสเป็นข้อความภาษาไทย"
              >
                <div className="reverse-result-banner">
                  <div className="reverse-result-left">
                    <span className="reverse-result-label font-thai-reading">
                      ข้อความภาษาไทยที่ถอดรหัสได้ (Decoded Thai Text)
                    </span>
                    <div
                      className="reverse-thai-display font-thai-reading"
                      tabIndex={0}
                      role="region"
                      aria-label={`ข้อความที่ถอดรหัสได้: ${
                        reverseResult.decodedText || "ยังไม่มีข้อความ"
                      }`}
                    >
                      {reverseResult.decodedText ? (
                        <span className="reverse-thai-text">
                          {reverseResult.decodedText}
                        </span>
                      ) : (
                        <span className="reverse-thai-placeholder">
                          (ยังไม่มีข้อความ — กดจุดเพื่อสร้างเซลล์หรือพิมพ์อักษรเบรลล์)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="braille-banner-actions">
                    <button
                      type="button"
                      className="braille-tts-btn font-thai-reading"
                      onClick={handleTTSDecoded}
                      disabled={!reverseResult.decodedText}
                      aria-label={`ฟังเสียงอ่านข้อความที่ถอดรหัสได้ ${reverseResult.decodedText}`}
                      title="ฟังเสียงอ่านออกเสียงภาษาไทย"
                    >
                      <Icon name="volume" />
                      <span>ฟังเสียงอ่าน</span>
                    </button>
                    <button
                      type="button"
                      className="braille-copy-btn font-thai-reading"
                      onClick={handleCopyDecoded}
                      disabled={!reverseResult.decodedText}
                      aria-label="คัดลอกข้อความภาษาไทย"
                      title="คัดลอกข้อความภาษาไทยลงคลิปบอร์ด"
                    >
                      <Icon name="copy" />
                      <span>{reverseCopied ? "คัดลอกแล้ว!" : "คัดลอก"}</span>
                    </button>
                  </div>
                </div>

                {/* Ambiguity notice if shared dot combinations exist */}
                {reverseResult.hasAmbiguity && (
                  <div
                    className="reverse-ambiguity-notice font-thai-reading"
                    role="note"
                    aria-label="ข้อสังเกตจุดร่วมอักษรเบรลล์"
                  >
                    <span className="notice-icon" aria-hidden="true">
                      💡
                    </span>
                    <div>
                      <strong>ข้อสังเกตเรื่องอักขระจุดร่วม (Shared Braille Cells):</strong>
                      <p>
                        ในระบบอักษรเบรลล์ไทย มีพยัญชนะบางคู่ที่ใช้จุดสัมผัสชุดเดียวกัน
                        (เช่น ข/ฃ, ค/ฅ, ช/ฉ/ศ, ย/ญ, พ/ภ/ษ, ล/ฬ) ระบบได้เลือกตัวอักษรหลักที่พบบ่อยที่สุด
                        และแสดงตัวเลือกสำรองไว้ให้ตรวจสอบในการวิเคราะห์แต่ละเซลล์ด้านล่าง
                      </p>
                    </div>
                  </div>
                )}

                {/* Decoded Cells Breakdown Grid */}
                {reverseResult.cells.length > 0 && (
                  <div
                    className="reverse-breakdown-section"
                    aria-label="รายละเอียดการถอดรหัสแยกรายเซลล์"
                  >
                    <h4 className="reverse-breakdown-title font-thai-reading">
                      การวิเคราะห์ทีละเซลล์ ({reverseResult.cells.length} เซลล์)
                    </h4>
                    <div className="reverse-chips-grid font-thai-reading">
                      {reverseResult.cells.map((cell, idx) => (
                        <div
                          key={`${cell.braille}-${idx}`}
                          className="reverse-cell-chip"
                          title={cell.description}
                        >
                          <span className="chip-braille">{cell.braille}</span>
                          <span className="chip-arrow">&rarr;</span>
                          <span className="chip-thai">
                            {cell.char === " " ? "␣ (เว้นวรรค)" : cell.char}
                          </span>
                          <span className="chip-dots">
                            {cell.dots.length > 0
                              ? `จุด ${cell.dots.join("-")}`
                              : "ช่องว่าง"}
                          </span>
                          {cell.alternatives && cell.alternatives.length > 0 && (
                            <span className="chip-alternatives">
                              (หรือ {cell.alternatives.join(", ")})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reading Guide */}
                {reverseResult.readingGuide && (
                  <div className="guide-content-box font-thai-reading">
                    <p>{reverseResult.readingGuide}</p>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
