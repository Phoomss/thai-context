"use client";

import React, { useState, useEffect } from "react";

interface ModernTermSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: (term: string) => void;
}

export default function ModernTermSubmissionModal({
  isOpen,
  onClose,
  onSubmitted,
}: ModernTermSubmissionModalProps) {
  const [term, setTerm] = useState("");
  const [suggestedMeaning, setSuggestedMeaning] = useState("");
  const [category, setCategory] = useState("SOCIAL_MEDIA");
  const [contextSentence, setContextSentence] = useState("");
  const [sourceReference, setSourceReference] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSubmittedSuccess(false);
      setErrorMsg("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !suggestedMeaning.trim()) {
      setErrorMsg("กรุณากรอกคำศัพท์และความหมายที่ต้องการเสนอ");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/modern-vocabulary/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: term.trim(),
          suggested_meaning: suggestedMeaning.trim(),
          category,
          context_sentence: contextSentence.trim() || undefined,
          source_reference: sourceReference.trim() || undefined,
          submitter_name: submitterName.trim() || undefined,
          submitter_email: submitterEmail.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSubmittedSuccess(true);
        if (onSubmitted) onSubmitted(term.trim());
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="submission-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        className="submission-modal relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          maxWidth: "540px",
          width: "100%",
          maxHeight: "88vh",
          overflowY: "auto",
          padding: "28px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิด"
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            color: "#64748b",
            fontSize: "16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        <h3
          id="submission-modal-title"
          style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px 0" }}
        >
          ✨ เสนอคำศัพท์ภาษาไทยร่วมสมัย
        </h3>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>
          ช่วยสร้างคลังภาษาไทยให้ทันยุคสมัย โดยเสนอคำศัพท์ที่ใช้จริงในชีวิตประจำวัน สื่อสังคม หรือวงการเทคโนโลยี
        </p>

        {/* Governance Box */}
        <div
          style={{
            padding: "10px 12px",
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            fontSize: "11.5px",
            color: "#1e40af",
            marginBottom: "16px",
          }}
        >
          🛡️ <strong>เกณฑ์การตรวจสอบ:</strong> ทุกคำที่เสนอจะผ่านการตรวจสอบแหล่งอ้างอิงและประเมินโดยกองบรรณาธิการก่อนบันทึกเข้าระบบ และจะไม่ถูกระบุเป็นคำศัพท์ทางการราชบัณฑิต
        </div>

        {submittedSuccess ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>🎉</div>
            <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#15803d", margin: "0 0 8px 0" }}>
              ส่งข้อเสนอคำศัพท์เรียบร้อยแล้ว!
            </h4>
            <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 20px 0" }}>
              คำว่า &ldquo;{term}&rdquo; อยู่ในคิวตรวจสอบโดยกองบรรณาธิการภาษา ขอบคุณสำหรับการมีส่วนร่วมพัฒนาคลังข้อมูลภาษาไทย
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 20px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                borderRadius: "8px",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ตกลง
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {errorMsg && (
              <div
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#fee2e2",
                  color: "#b91c1c",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              >
                {errorMsg}
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>
                คำศัพท์ที่ต้องการเสนอ <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="เช่น ป้ายยา, RAG, จึ้ง, Prompt Engineering"
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>
                หมวดหมู่
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="AI">ปัญญาประดิษฐ์ (AI)</option>
                <option value="TECHNOLOGY">เทคโนโลยี (Technology)</option>
                <option value="SOCIAL_MEDIA">โซเชียลมีเดีย (Social Media)</option>
                <option value="SLANG">สแลงวัยรุ่น (Slang)</option>
                <option value="WORKPLACE">การทำงาน / ออฟฟิศ (Workplace)</option>
                <option value="BUSINESS">ธุรกิจ / การตลาด (Business)</option>
                <option value="POP_CULTURE">วัฒนธรรมร่วมสมัย / บันเทิง (Pop Culture)</option>
                <option value="FANDOM">แฟนคลับ / แวดวงแฟนดอม (Fandom)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>
                ความหมายที่เสนอ <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={suggestedMeaning}
                onChange={(e) => setSuggestedMeaning(e.target.value)}
                placeholder="อธิบายความหมาย วิธีใช้ หรือบริบทที่พบบ่อย"
                rows={3}
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>
                ตัวอย่างประโยคการใช้งานจริง
              </label>
              <input
                type="text"
                value={contextSentence}
                onChange={(e) => setContextSentence(e.target.value)}
                placeholder="เช่น โดนเพื่อนป้ายยาหูฟังตัวใหม่มา เสียงดีมาก"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>
                แหล่งอ้างอิง (URL ลิงก์ / โพสต์ / ข่าว / บทความ)
              </label>
              <input
                type="text"
                value={sourceReference}
                onChange={(e) => setSourceReference(e.target.value)}
                placeholder="เช่น https://x.com/... หรือ บทความจาก TechCrunch"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "4px" }}>
                  ชื่อผู้เสนอ (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "4px" }}>
                  อีเมล (ไม่บังคับ)
                </label>
                <input
                  type="email"
                  value={submitterEmail}
                  onChange={(e) => setSubmitterEmail(e.target.value)}
                  placeholder="somchai@example.com"
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "กำลังส่ง..." : "ส่งข้อเสนอคำศัพท์ ➔"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
