"use client";

import { useState, useEffect, useId } from "react";
import Icon from "../ui/Icon";
import { sendFeedback } from "@/lib/api-client";

export interface SearchResultFeedbackProps {
  query: string;
  word: string;
  compact?: boolean;
  className?: string;
  onFeedbackSubmitted?: (score: number) => void;
}

export default function SearchResultFeedback({
  query,
  word,
  compact = false,
  className = "",
  onFeedbackSubmitted,
}: SearchResultFeedbackProps) {
  const [score, setScore] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const commentInputId = useId();

  // Reset feedback state when user navigates to another word or new query
  useEffect(() => {
    setScore(null);
    setStatus("idle");
    setComment("");
    setShowCommentBox(false);
    setCommentSubmitted(false);
    setFeedbackMessage("");
  }, [word, query]);

  const handleRate = async (newScore: number) => {
    if (status === "submitting") return;
    setStatus("submitting");
    setScore(newScore);

    try {
      const res = await sendFeedback({
        query: query || "ค้นหาคำศัพท์",
        selectedWord: word,
        relevanceScore: newScore,
        userAction: newScore > 0 ? "THUMBS_UP" : "THUMBS_DOWN",
        userComment: comment.trim() || undefined,
      });

      setStatus("submitted");
      if (newScore > 0) {
        setFeedbackMessage("ขอบคุณสำหรับข้อเสนอแนะ! ระบบบันทึกว่าคำนี้ตรงใจคุณแล้ว");
        setShowCommentBox(false);
      } else {
        setFeedbackMessage("ขอบคุณสำหรับข้อเสนอแนะ! ระบบบันทึกว่าคำนี้ไม่ตรงบริบทแล้ว");
        if (!compact) {
          setShowCommentBox(true);
        }
      }
      onFeedbackSubmitted?.(newScore);
    } catch {
      setStatus("error");
      setFeedbackMessage("ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || status === "submitting") return;

    setStatus("submitting");
    try {
      await sendFeedback({
        query: query || "ค้นหาคำศัพท์",
        selectedWord: word,
        relevanceScore: score ?? -1,
        userAction: (score ?? -1) > 0 ? "THUMBS_UP" : "THUMBS_DOWN",
        userComment: comment.trim(),
      });
      setStatus("submitted");
      setCommentSubmitted(true);
      setShowCommentBox(false);
      setFeedbackMessage("ขอบคุณสำหรับคำแนะนำเพิ่มเติม! เราจะนำไปพัฒนาความแม่นยำ");
    } catch {
      setStatus("error");
    }
  };

  if (compact) {
    return (
      <div
        className={`feedback-compact ${className}`}
        role="group"
        aria-label={`ประเมินผลลัพธ์คำว่า ${word}`}
      >
        <span className="feedback-compact-label">ผลลัพธ์ตรงใจไหม?</span>
        <div className="feedback-buttons">
          <button
            type="button"
            className={`feedback-btn thumbs-up ${score === 1 ? "is-active" : ""}`}
            aria-pressed={score === 1}
            disabled={status === "submitting"}
            onClick={() => handleRate(1)}
            aria-label={`คำว่า ${word} ตรงใจ (มีประโยชน์)`}
            title="คำนี้ตรงใจ"
          >
            <Icon name="thumbsUp" style={{ width: 14, height: 14 }} />
            <span>ตรงใจ</span>
          </button>
          <button
            type="button"
            className={`feedback-btn thumbs-down ${score === -1 ? "is-active" : ""}`}
            aria-pressed={score === -1}
            disabled={status === "submitting"}
            onClick={() => handleRate(-1)}
            aria-label={`คำว่า ${word} ไม่ตรงบริบท`}
            title="คำนี้ไม่ตรงบริบท"
          >
            <Icon name="thumbsDown" style={{ width: 14, height: 14 }} />
            <span>ไม่ตรง</span>
          </button>
        </div>
        {status === "submitted" && (
          <span className="feedback-compact-status" role="status" aria-live="polite">
            <Icon name="check" style={{ width: 13, height: 13, display: "inline" }} /> บันทึกแล้ว
          </span>
        )}
      </div>
    );
  }

  return (
    <section
      className={`search-feedback-panel font-thai-reading ${className}`}
      role="group"
      aria-labelledby={`feedback-title-${word}`}
    >
      <div className="feedback-header">
        <div className="feedback-text">
          <h4 id={`feedback-title-${word}`} className="feedback-heading">
            คำนี้ตรงกับสิ่งที่คุณค้นหาหรือไม่?
          </h4>
          <p className="feedback-subheading">
            ทุกการประเมินช่วยสอนระบบให้เข้าใจบริบทภาษาไทยได้แม่นยำยิ่งขึ้น
          </p>
        </div>

        <div className="feedback-action-buttons">
          <button
            type="button"
            className={`feedback-rate-btn rate-up ${score === 1 ? "is-active" : ""}`}
            aria-pressed={score === 1}
            disabled={status === "submitting"}
            onClick={() => handleRate(1)}
            aria-label={`คำว่า ${word} ตรงใจ`}
          >
            <Icon name="thumbsUp" style={{ width: 16, height: 16 }} />
            <span>ตรงใจ</span>
          </button>

          <button
            type="button"
            className={`feedback-rate-btn rate-down ${score === -1 ? "is-active" : ""}`}
            aria-pressed={score === -1}
            disabled={status === "submitting"}
            onClick={() => handleRate(-1)}
            aria-label={`คำว่า ${word} ไม่ตรงบริบท`}
          >
            <Icon name="thumbsDown" style={{ width: 16, height: 16 }} />
            <span>ไม่ตรงบริบท</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`feedback-status-message ${status === "error" ? "is-error" : "is-success"}`}
          role="status"
          aria-live="polite"
        >
          <Icon
            name={status === "error" ? "close" : "check"}
            style={{ width: 15, height: 15, flexShrink: 0 }}
          />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {showCommentBox && !commentSubmitted && (
        <form onSubmit={handleCommentSubmit} className="feedback-comment-form">
          <label htmlFor={commentInputId} className="feedback-comment-label">
            ช่วยบอกเราเพิ่มเติมได้ไหม เพื่อให้เราปรับปรุงให้ดียิ่งขึ้น (ไม่บังคับ):
          </label>
          <div className="feedback-comment-input-row">
            <input
              id={commentInputId}
              type="text"
              className="feedback-comment-input"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="เช่น ควรเป็นคำว่า... หรือ ไม่เหมาะกับบริบททางการ"
              maxLength={200}
              disabled={status === "submitting"}
            />
            <button
              type="submit"
              className="feedback-comment-submit-btn"
              disabled={!comment.trim() || status === "submitting"}
            >
              ส่งข้อเสนอแนะ
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
