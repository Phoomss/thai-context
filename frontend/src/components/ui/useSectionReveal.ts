"use client";
import { useEffect, type RefObject } from "react";
import gsap from "gsap";

/** Content stays visible without JS; each group reveals once, including on keyboard focus. */
export function useSectionReveal(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!root.current || typeof IntersectionObserver === "undefined") return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const sections = Array.from(root.current!.querySelectorAll(".feature-section"));
      const pending = new Map<Element, Element[]>();
      const tweens: gsap.core.Tween[] = [];
      const reveal = (section: Element, immediate = false) => {
        const items = pending.get(section);
        if (!items) return;
        pending.delete(section);
        observer.unobserve(section);
        tweens.push(gsap.to(items, {
          opacity: 1, y: 0, duration: immediate ? 0 : 0.6,
          stagger: immediate ? 0 : 0.065, ease: "power2.out",
          clearProps: "opacity,transform",
        }));
      };
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
      }, { threshold: 0, rootMargin: "0px 0px -32px 0px" });
      sections.forEach(section => {
        // Never hide content already in view (including direct anchor navigation).
        if (section.getBoundingClientRect().top < innerHeight) return;
        const items = Array.from(section.querySelectorAll(":scope > .section-heading, :scope > .comparison-surface, :scope > .evolution-card, .dialect-card"));
        pending.set(section, items);
        gsap.set(items, { opacity: 0, y: 24 });
        observer.observe(section);
      });
      const focus = (event: FocusEvent) => {
        const section = (event.target as Element).closest(".feature-section");
        if (section) reveal(section, true);
      };
      const element = root.current!;
      element.addEventListener("focusin", focus);
      return () => {
        observer.disconnect();
        element.removeEventListener("focusin", focus);
        tweens.forEach(tween => tween.kill());
        gsap.set(sections.flatMap(section => Array.from(section.querySelectorAll(".section-heading, .comparison-surface, .evolution-card, .dialect-card"))), { clearProps: "opacity,transform" });
      };
    });
    return () => media.revert();
  }, [root]);
}
