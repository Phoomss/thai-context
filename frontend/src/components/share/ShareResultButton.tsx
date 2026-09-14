"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Recommendation } from "@/lib/search-types";
import { sharePayload } from "@/lib/share";
import Icon from "../ui/Icon";
export default function ShareResultButton({ word, query, demo }: { word: Recommendation; query: string; demo: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [message, setMessage] = useState("");
  const [native, setNative] = useState(false);
  useEffect(() => { setNative(typeof navigator.share === "function"); }, []);
  useEffect(() => { if (!message) return; const timer = window.setTimeout(() => setMessage(""), 2200); return () => clearTimeout(timer); }, [message]);
  function close() { dialog.current?.close(); trigger.current?.focus({ preventScroll: true }); }
  function open() {
    const element = dialog.current;
    if (!element || !trigger.current) return;
    const rect = trigger.current.getBoundingClientRect();
    element.style.setProperty("--share-left", `${Math.max(16, Math.min(rect.left, innerWidth - 396))}px`);
    element.style.setProperty("--share-top", `${Math.max(16, Math.min(rect.bottom + 12, innerHeight - 380))}px`);
    element.showModal();
  }
  async function copy(kind: "link" | "meaning" | "native") {
    const payload = sharePayload(word, query, location.origin, demo);
    try {
      if (kind === "native") await navigator.share(payload);
      else {
        await navigator.clipboard.writeText(kind === "link" ? payload.url : `${payload.text}\n\nดูรายละเอียด: ${payload.url}`);
        setMessage(kind === "link" ? "คัดลอกลิงก์แล้ว" : "คัดลอกความหมายแล้ว");
      }
      close();
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setMessage("คัดลอกไม่ได้ กรุณาเลือกลิงก์ด้านล่าง");
    }
  }
  return <div className="share-control">
    <button ref={trigger} className="icon-button" aria-label={`แชร์ความหมายของคำว่า ${word.headword}`} onClick={open}><Icon name="share" /><span>แชร์</span></button>
    <dialog ref={dialog} className="share-dialog" aria-labelledby="share-title" onCancel={e => { e.preventDefault(); close(); }} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="share-content">
        <header><h3 id="share-title">แชร์คำว่า “{word.headword}”</h3><button className="icon-button" onClick={close} aria-label="ปิดการแชร์"><Icon name="close" /></button></header>
        <p>ส่งต่อความหมาย บริบท และแหล่งที่มา</p>
        <button onClick={() => copy("link")}><Icon name="copy" />คัดลอกลิงก์</button>
        <button onClick={() => copy("meaning")}><Icon name="source" />คัดลอกความหมาย</button>
        {native && <button onClick={() => copy("native")}><Icon name="share" />แชร์ผ่านอุปกรณ์</button>}
        {message && <p role="status">{message}</p>}
        <input aria-label="ลิงก์สำหรับแชร์" readOnly value={typeof location === "undefined" ? "" : sharePayload(word, query, location.origin, demo).url} onFocus={e => e.target.select()} />
      </div>
    </dialog>
    {message && createPortal(<span className="toast" role="status">{message}</span>, document.body)}
  </div>;
}
