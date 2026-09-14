"use client";

import { useEffect, useRef, useState } from "react";
import type { SignLanguageEntry } from "@/lib/accessibility-types";
import type { SignResourceItem } from "@/lib/sign-language-types";
import { getSignResource } from "@/lib/sign-motion-data";
import { fetchSignLanguage } from "@/lib/api-client";
import SignMotionPlayer from "./SignMotionPlayer";
import SignContributionModal from "./SignContributionModal";
import Icon from "../ui/Icon";

export interface SignLanguageModalProps {
  word: string;
  isOpen: boolean;
  onClose: () => void;
  initialData?: SignLanguageEntry[];
  initialResource?: SignResourceItem;
}

export default function SignLanguageModal({
  word,
  isOpen,
  onClose,
  initialData,
  initialResource,
}: SignLanguageModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [entries, setEntries] = useState<SignLanguageEntry[]>(initialData ?? []);
  const [loading, setLoading] = useState(initialData === undefined && initialResource === undefined);
  const [isLoop, setIsLoop] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [resource, setResource] = useState<SignResourceItem>(
    initialResource ?? getSignResource(word)
  );
  const [activeMediaTab, setActiveMediaTab] = useState<"AVATAR_3D" | "VIDEO">(() => {
    if (initialData && initialData.length > 0 && initialData[0]?.media?.length > 0) {
      return "VIDEO";
    }
    return "AVATAR_3D";
  });
  const [isContribOpen, setIsContribOpen] = useState(false);

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

    const clean = word.trim();
    const localRes = getSignResource(clean);
    setResource(localRes);

    if (initialData !== undefined) {
      setEntries(initialData);
      setSelectedVariant(0);
      setLoading(false);
      if (initialData.length > 0 && initialData[0]?.media?.length > 0) {
        setActiveMediaTab("VIDEO");
      }
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetchSignLanguage(clean, controller.signal)
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
  const gestureDescription =
    currentEntry?.handshapeDescription || resource.metadata?.description_th;

  const hasMotionData = Boolean(resource.representation?.data);
  const isExternal = resource.status === "EXTERNAL_RESOURCE";
  const isNotAvailable =
    (!entries || entries.length === 0) &&
    (resource.status === "NOT_AVAILABLE" || (!hasMotionData && !isExternal && !videoUrl));

  // Determine effective tab
  const showVideoPlayer = videoUrl && (activeMediaTab === "VIDEO" || !hasMotionData);

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
          ) : isNotAvailable ? (
            /* STATE 3: NOT AVAILABLE */
            <div className="tsl-state-box tsl-empty-state" role="status">
              <div className="tsl-empty-icon" aria-hidden="true">
                🤟
              </div>
              <h3 className="font-thai-reading">ยังไม่มีข้อมูลภาษามือไทยสำหรับคำนี้</h3>
              <p className="font-thai-reading">
                ขณะนี้ยังไม่มีข้อมูลภาษามือไทยที่ผ่านการรับรองสำหรับคำว่า &ldquo;<strong>{word}</strong>&rdquo;
              </p>
              <p className="tsl-empty-subtext font-thai-reading" style={{ maxWidth: "480px", margin: "0 auto 16px" }}>
                THAI CONTEXT <strong>จะไม่สร้างหรือคาดเดาท่ามือขึ้นเอง</strong> เพื่อป้องกันการนำเสนอภาษามือที่ไม่ถูกต้องตามหลักมาตรฐานสากล
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="tsl-back-btn font-thai-reading"
                  style={{ background: "#ffffff", color: "#0284c7", border: "1px solid #0284c7" }}
                  onClick={() => setIsContribOpen(true)}
                >
                  + เสนอแหล่งข้อมูลภาษามือ (Contribute)
                </button>
                <button
                  type="button"
                  className="tsl-back-btn font-thai-reading"
                  onClick={onClose}
                >
                  กลับสู่หน้ารายละเอียดคำ
                </button>
              </div>
            </div>
          ) : isExternal ? (
            /* STATE 2: EXTERNAL RESOURCE */
            <div
              className="tsl-state-box font-thai-reading"
              style={{
                padding: "32px 24px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div style={{ fontSize: "40px" }}>🌐</div>
              <h3 style={{ margin: 0, fontSize: "18px" }}>ข้อมูลภาษามือมีอยู่จากแหล่งภายนอก</h3>
              <p style={{ maxWidth: "520px", margin: 0, color: "#475569", lineHeight: 1.6, fontSize: "14px" }}>
                คำนี้มีข้อมูลภาษามือบันทึกไว้ในเว็บไซต์ภายนอก THAI CONTEXT ปฏิบัติตามหลัก Data Governance
                โดยไม่ดาวน์โหลดหรือทำซ้ำสื่อที่มีลิขสิทธิ์ แต่คุณสามารถเปิดดูจากแหล่งข้อมูลต้นฉบับได้โดยตรง
              </p>
              {resource.source?.url && (
                <a
                  href={resource.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 24px",
                    borderRadius: "12px",
                    background: "var(--accent, #0284c7)",
                    color: "white",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  <span>เปิดแหล่งข้อมูลต้นฉบับ ({resource.source.name})</span>
                  <span>↗</span>
                </a>
              )}
            </div>
          ) : (
            /* STATE 1: VERIFIED / MOTION DATA */
            <div className="tsl-content-layout">
              <div className="tsl-video-pane">
                {/* Media Selector Tab (when both 3D motion and video exist) */}
                {hasMotionData && videoUrl && (
                  <div
                    role="tablist"
                    aria-label="เลือกมุมมองการแสดงผล"
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeMediaTab === "AVATAR_3D"}
                      onClick={() => setActiveMediaTab("AVATAR_3D")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "none",
                        background: activeMediaTab === "AVATAR_3D" ? "var(--accent, #0284c7)" : "#f1f5f9",
                        color: activeMediaTab === "AVATAR_3D" ? "white" : "#334155",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      👤 3D Avatar & Skeleton
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeMediaTab === "VIDEO"}
                      onClick={() => setActiveMediaTab("VIDEO")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "none",
                        background: activeMediaTab === "VIDEO" ? "var(--accent, #0284c7)" : "#f1f5f9",
                        color: activeMediaTab === "VIDEO" ? "white" : "#334155",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      🎬 วิดีโออ้างอิง
                    </button>
                  </div>
                )}

                {hasMotionData && activeMediaTab === "AVATAR_3D" ? (
                  <SignMotionPlayer resource={resource} initialSpeed={1.0} autoPlay={true} />
                ) : (
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
                      {videoUrl && <source src={videoUrl} type="video/mp4" />}
                      เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ HTML5
                    </video>
                  </div>
                )}

                {showVideoPlayer && (
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
                )}
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
                  {(currentEntry?.dialectRegion || resource.metadata?.dialect_region) && (
                    <div className="tsl-meta-item">
                      <span className="meta-label">ภูมิภาค / ถิ่น:</span>
                      <strong className="meta-value font-thai-reading">
                        {currentEntry?.dialectRegion || resource.metadata?.dialect_region}
                      </strong>
                    </div>
                  )}

                  <div className="tsl-meta-item">
                    <span className="meta-label">สถานะการรับรอง:</span>
                    <strong className="meta-value status-verified font-thai-reading">
                      {resource.source?.type === "DEMO_DATA"
                        ? "⚡ ข้อมูลตัวอย่างเพื่อการทดสอบต้นแบบ (DEMO DATA)"
                        : `✓ ${
                            currentEntry?.verificationStatus === "OFFICIAL"
                              ? "รับรองมาตรฐานทางการ"
                              : "Verified"
                          }`}
                    </strong>
                  </div>

                  {(currentEntry?.sourceAttribution || resource.source?.name) && (
                    <div className="tsl-meta-item tsl-meta-full">
                      <span className="meta-label">แหล่งข้อมูลอ้างอิง:</span>
                      <p className="meta-value font-thai-reading">
                        {currentEntry?.sourceAttribution || resource.source?.name}
                        {(currentEntry?.license || resource.source?.license) &&
                          ` (${currentEntry?.license || resource.source?.license})`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <SignContributionModal
        word={word}
        isOpen={isContribOpen}
        onClose={() => setIsContribOpen(false)}
      />
    </dialog>
  );
}
