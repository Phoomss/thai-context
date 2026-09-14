"use client";
import { useEffect, useState, type RefObject, type MouseEvent } from "react";
import Image from "next/image";
export default function MorphingNavbar({
  navRef,
  busy,
  onHome,
  onAIChat,
}: {
  navRef: RefObject<HTMLElement | null>;
  busy: boolean;
  onHome: (event: MouseEvent<HTMLAnchorElement>) => void;
  onAIChat?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [floating, setFloating] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    // Navbar presentation follows the Hero boundary, independently of search state.
    // Synchronize immediately for restored scroll / deep links before observing.
    const update = () => setFloating(hero.getBoundingClientRect().bottom <= 84);
    update();
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(update, { rootMargin: "-84px 0px 0px 0px" });
    observer?.observe(hero);
    if (!observer) window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("pageshow", update);
    return () => {
      observer?.disconnect();
      if (!observer) window.removeEventListener("scroll", update);
      window.removeEventListener("pageshow", update);
    };
  }, []);
  useEffect(() => {
    if (!floating) setOpen(false);
  }, [floating]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent | FocusEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
    };
  }, [open, navRef]);
  return (
    <header
      ref={navRef}
      className={`navbar ${floating ? "navbar-floating" : ""}`}
      data-cinematic={busy}
      inert={busy}
    >
      <a
        className="wordmark"
        href="#hero"
        onClick={e => { setOpen(false); onHome(e); }}
        aria-label="THAI CONTEXT หน้าแรก"
      >
        <Image
          className="brand-logo"
          src="/assets/thai-context-logo.png"
          width={46}
          height={40}
          alt=""
          aria-hidden="true"
        />
        <span className="brand-copy">
          <span className="brand" aria-label="THAI CONTEXT">
            <span className="brand-thai">THAI</span>
            <span className="brand-context">CONTEXT</span>
          </span>
          <small>จากค้นคำ สู่เข้าใจภาษา</small>
        </span>
      </a>
      <nav id="primary-navigation" className={`nav-links ${open ? "is-open" : ""}`} aria-label="เมนูหลัก" onKeyDown={e => { if (e.key === "Escape") { setOpen(false); document.getElementById("menu-toggle")?.focus(); } }}>
        <a href="#hero" aria-current={!floating ? "page" : undefined} onClick={e => { setOpen(false); onHome(e); }}>หน้าหลัก</a>
        <a href="#compare" onClick={() => setOpen(false)}>เปรียบเทียบคำ</a>
        <a href="#evolution" onClick={() => setOpen(false)}>สำรวจคำ</a>
        <a href="#dialects" onClick={() => setOpen(false)}>ภาษาถิ่น</a>
        <a href="#dictionary" onClick={() => setOpen(false)}>ค้นตามเล่ม</a>
        {onAIChat && (
          <button
            type="button"
            className="nav-ai-button font-thai-reading"
            onClick={() => {
              setOpen(false);
              onAIChat();
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              background: "#eff6ff",
              color: "#1d4ed8",
              border: "1px solid #bfdbfe",
              borderRadius: "16px",
              padding: "4px 12px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <span aria-hidden="true">✨</span>
            <span>ผู้ช่วย AI</span>
          </button>
        )}
        <a
          className="nav-search"
          href={floating ? "#persistent-meaning" : "#meaning"}
          onClick={e => {
            e.preventDefault(); setOpen(false);
            const composer = document.querySelector('.composer-wrap[data-visible="true"]');
            if (floating && composer) document.getElementById("persistent-meaning")?.focus({ preventScroll: true });
            else onHome(e);
          }}
        >
          เริ่มค้นหาความหมาย <span aria-hidden="true">↗</span>
        </a>
      </nav>
      {(
        <button
          id="menu-toggle"
          type="button"
          className="nav-menu-button"
          aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
          aria-expanded={open}
          aria-controls="primary-navigation"
          onKeyDown={e => { if (e.key === "Escape") setOpen(false); }}
          onClick={() => setOpen((value) => !value)}
        >
          <span /><span /><span />
        </button>
      )}
    </header>
  );
}
