"use client";

import { useEffect, useRef, useState } from "react";
import type { SignLanguageEntry } from "@/lib/accessibility-types";
import { fetchSignLanguage } from "@/lib/api-client";
import Icon from "../ui/Icon";

export interface SignLanguageModalProps {
  word: string;
  isOpen: boolean;
  onClose: () => void;
  initialData?: SignLanguageEntry[];
}

export default function SignLanguageModal({
  word,
  isOpen,
  onClose,
  initialData,
}: SignLanguageModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [entries, setEntries] = useState<SignLanguageEntry[]>(initialData ?? []);
  const [loading, setLoading] = useState(initialData === undefined);
  const [isLoop, setIsLoop] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);

  // Dialog open / close and body overflow lifecycle
  useEffect(() => {
    if (!isOpen) return;

    const prior = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    const dialogElement = dialogRef.current;

    if (dialogElement && !dialogElement.open) {
      dialogElement.showModal();
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = oldOverflow;
      if (dialogElement?.open) {
        dialogElement.close();
      }
      prior?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  // Data fetching lifecycle when word changes or modal opens
  useEffect(() => {
    if (!isOpen || !word) return;

    if (initialData !== undefined) {
      setEntries(initialData);
      setSelectedVariant(0);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetchSignLanguage(word, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setEntries(data);
          setSelectedVariant(0);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setEntries([]);
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

  const currentEntry: SignLanguageEntry | undefined = entries[selectedVariant] ?? entries[0];
  const primaryMedia = currentEntry?.media?.find((m) => m.isPrimary) ?? currentEntry?.media?.[0];
  const videoUrl = primaryMedia?.mediaUrl;
  const thumbnailUrl = primaryMedia?.thumbnailUrl;
  const gestureDescription = currentEntry?.handshapeDescription;

  return (
    <dialog
      ref={dialogRef}
      className="tsl-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tsl-modal-title"
      aria-describedby={gestureDescription ? "tsl-gesture-desc" : undefined}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
          return;
        }
        if (e.key === "Tab") {
          const controls = e.currentTarget.querySelectorAll<HTMLElement>(
            'button, a[href], input, select, textarea, video, [tabindex="0"]'
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
      <div className="tsl-modal-surface">
        <header className="tsl-modal-header">
          <div className="tsl-header-title">
            <span className="tsl-icon-pill" aria-hidden="true">
              🤟
            </span>
            <div>
              <span className="tsl-kicker">ภาษามือไทย (Thai Sign Language)</span>
              <h2 id="tsl-modal-title" className="font-thai-reading">
                {word}
              </h2>
            </div>
          </div>
          <button
            autoFocus
            type="button"
            className="tsl-close-btn"
            onClick={onClose}
            aria-label="ปิดหน้าต่างภาษามือไทย"
          >
            ×
          </button>
        </header>

        <div className="tsl-modal-body">
          {loading ? (
            <div className="tsl-state-box tsl-loading-state" role="status" aria-busy="true">
              <div className="tsl-spinner" aria-hidden="true" />
              <p className="font-thai-reading">กำลังค้นหาคลิปวิดีโอภาษามือไทย…</p>
              <span className="sr-only">กำลังโหลดข้อมูลภาษามือไทย</span>
            </div>
          ) : !currentEntry || !videoUrl ? (
            <div className="tsl-state-box tsl-empty-state" role="status">
              <div className="tsl-empty-icon" aria-hidden="true">
                🤟
              </div>
              <h3 className="font-thai-reading">ยังไม่มีข้อมูลภาษามือไทยสำหรับคำนี้</h3>
              <p className="font-thai-reading">
                ขณะนี้ยังไม่มีคลิปวิดีโอภาษามือไทยสำหรับคำว่า &ldquo;<strong>{word}</strong>&rdquo; ในคลังข้อมูลมาตรฐาน
              </p>
              <p className="tsl-empty-subtext font-thai-reading">
                ทีมงานกำลังประสานงานกับผู้เชี่ยวชาญภาษามือไทยและสถาบันราชสุดาเพื่อบันทึกท่ามือมาตรฐานและอัปเดตลงระบบอย่างต่อเนื่อง
              </p>
              <button
                type="button"
                className="tsl-back-btn font-thai-reading"
                onClick={onClose}
              >
                กลับสู่หน้ารายละเอียดคำ
              </button>
            </div>
          ) : (
            <div className="tsl-content-layout">
              <div className="tsl-video-pane">
                <div className="tsl-video-wrapper">
                  <video
                    ref={videoRef}
                    key={videoUrl}
                    controls
                    loop={isLoop}
                    playsInline
                    preload="metadata"
                    poster={thumbnailUrl}
                    className="tsl-video-player"
                    aria-label={`วิดีโอภาษามือไทย แสดงท่ามือของคำว่า ${word}`}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ HTML5
                  </video>
                </div>

                <div className="tsl-video-toolbar">
                  <label className="tsl-loop-toggle">
                    <input
                      type="checkbox"
                      checked={isLoop}
                      onChange={(e) => setIsLoop(e.target.checked)}
                      aria-label="เล่นวิดีโอวนซ้ำ"
                    />
                    <span className="font-thai-reading">เล่นวนซ้ำ (Loop)</span>
                  </label>

                  {entries.length > 1 && (
                    <div className="tsl-variant-selector">
                      <span className="font-thai-reading">รูปแบบ:</span>
                      <div className="tsl-variant-buttons">
                        {entries.map((entry, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`variant-pill ${
                              idx === selectedVariant ? "is-active" : ""
                            }`}
                            onClick={() => setSelectedVariant(idx)}
                            aria-pressed={idx === selectedVariant}
                          >
                            แบบที่ {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="tsl-info-pane">
                <section className="tsl-gesture-section">
                  <h3 className="tsl-section-label">คำอธิบายท่ามือ (Handshape & Gesture)</h3>
                  <div
                    id="tsl-gesture-desc"
                    className="tsl-gesture-description font-thai-reading"
                    tabIndex={0}
                    aria-label={`คำอธิบายท่ามือสำหรับคำว่า ${word}`}
                  >
                    <p>{gestureDescription || "ไม่มีคำอธิบายท่ามือเพิ่มเติม"}</p>
                  </div>
                </section>

                <div className="tsl-meta-grid">
                  {currentEntry.dialectRegion && (
                    <div className="tsl-meta-item">
                      <span className="meta-label">ภูมิภาค / ถิ่น:</span>
                      <strong className="meta-value font-thai-reading">
                        {currentEntry.dialectRegion}
                      </strong>
                    </div>
                  )}

                  {currentEntry.verificationStatus && (
                    <div className="tsl-meta-item">
                      <span className="meta-label">สถานะการรับรอง:</span>
                      <strong className="meta-value status-verified font-thai-reading">
                        ✓ {currentEntry.verificationStatus === "OFFICIAL"
                          ? "รับรองมาตรฐานทางการ"
                          : currentEntry.verificationStatus}
                      </strong>
                    </div>
                  )}

                  {currentEntry.sourceAttribution && (
                    <div className="tsl-meta-item tsl-meta-full">
                      <span className="meta-label">แหล่งข้อมูลอ้างอิง:</span>
                      <p className="meta-value font-thai-reading">
                        {currentEntry.sourceAttribution}
                        {currentEntry.license && ` (${currentEntry.license})`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
