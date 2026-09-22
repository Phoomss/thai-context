"use client";
import { useEffect, useState, type RefObject, type MouseEvent } from "react";
import Image from "next/image";
import { Home, Scale, BookOpen, Compass, Sparkles } from "lucide-react";

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
  const [activeSection, setActiveSection] = useState("hero");

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
    const sectionIds = ["hero", "compare", "evolution", "dialects", "modern-vocabulary"];
    let ticking = false;

    const updateActive = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const isBottom =
        scrollHeight > window.innerHeight &&
        window.innerHeight + window.scrollY >= scrollHeight - 80;

      if (isBottom) {
        setActiveSection("modern-vocabulary");
        return;
      }

      let current = "hero";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActive();
          ticking = false;
        });
        ticking = true;
      }
    };

    updateActive();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    window.addEventListener("hashchange", updateActive);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("hashchange", updateActive);
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
        onClick={e => {
          setOpen(false);
          setActiveSection("hero");
          onHome(e);
        }}
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
        <a
          href="#hero"
          aria-current={activeSection === "hero" ? "page" : undefined}
          className={activeSection === "hero" ? "active" : ""}
          onClick={e => { setOpen(false); setActiveSection("hero"); onHome(e); }}
        >
          <Home className="w-3.5 h-3.5 mr-1.5 inline" />หน้าหลัก
        </a>
        <a
          href="#compare"
          aria-current={activeSection === "compare" ? "page" : undefined}
          className={activeSection === "compare" ? "active" : ""}
          onClick={() => { setOpen(false); setActiveSection("compare"); }}
        >
          <Scale className="w-3.5 h-3.5 mr-1.5 inline" />เปรียบเทียบคำ
        </a>
        <a
          href="#evolution"
          aria-current={activeSection === "evolution" ? "page" : undefined}
          className={activeSection === "evolution" ? "active" : ""}
          onClick={() => { setOpen(false); setActiveSection("evolution"); }}
        >
          <BookOpen className="w-3.5 h-3.5 mr-1.5 inline" />สำรวจคำ
        </a>
        <a
          href="#dialects"
          aria-current={activeSection === "dialects" ? "page" : undefined}
          className={activeSection === "dialects" ? "active" : ""}
          onClick={() => { setOpen(false); setActiveSection("dialects"); }}
        >
          <Compass className="w-3.5 h-3.5 mr-1.5 inline" />ภาษาถิ่น
        </a>
        <a
          href="#modern-vocabulary"
          aria-current={activeSection === "modern-vocabulary" ? "page" : undefined}
          className={activeSection === "modern-vocabulary" ? "active" : ""}
          onClick={() => { setOpen(false); setActiveSection("modern-vocabulary"); }}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />คำศัพท์สมัยใหม่
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
