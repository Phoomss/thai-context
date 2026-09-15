import React, { createRef } from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import MorphingNavbar from "../src/components/layout/MorphingNavbar";

describe("MorphingNavbar Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("does not render 'เริ่มค้นหาความหมาย' and renders all section links", () => {
    const navRef = createRef<HTMLElement | null>();
    const onHome = vi.fn();
    const onAIChat = vi.fn();

    render(
      <MorphingNavbar
        navRef={navRef}
        busy={false}
        onHome={onHome}
        onAIChat={onAIChat}
      />
    );

    // 1. "เริ่มค้นหาความหมาย" must NOT exist
    expect(screen.queryByText(/เริ่มค้นหาความหมาย/i)).toBeNull();

    // 2. All section links must exist
    expect(screen.getByText("หน้าหลัก")).toBeTruthy();
    expect(screen.getByText("เปรียบเทียบคำ")).toBeTruthy();
    expect(screen.getByText("สำรวจคำ")).toBeTruthy();
    expect(screen.getByText("ภาษาถิ่น")).toBeTruthy();
    expect(screen.getByText("สุ่มเปลี่ยนคำ 🔀")).toBeTruthy();
    expect(screen.getByText("AI Workspace ✦")).toBeTruthy();

    // 3. AI Assistant button must exist
    expect(screen.getByText("ผู้ช่วย AI")).toBeTruthy();
  });

  it("positions AI Assistant button on the right after navigation links", () => {
    const navRef = createRef<HTMLElement | null>();
    const onHome = vi.fn();
    const onAIChat = vi.fn();

    const { container } = render(
      <MorphingNavbar
        navRef={navRef}
        busy={false}
        onHome={onHome}
        onAIChat={onAIChat}
      />
    );

    const primaryNav = container.querySelector("#primary-navigation");
    expect(primaryNav).toBeTruthy();

    const children = Array.from(primaryNav!.children);
    const lastChild = children[children.length - 1];

    // The AI Assistant button should be the last child inside #primary-navigation
    expect(lastChild.textContent).toContain("ผู้ช่วย AI");
  });

  it("highlights the active section on click and sets aria-current='page'", () => {
    const navRef = createRef<HTMLElement | null>();
    const onHome = vi.fn();
    const onAIChat = vi.fn();

    render(
      <MorphingNavbar
        navRef={navRef}
        busy={false}
        onHome={onHome}
        onAIChat={onAIChat}
      />
    );

    const homeLink = screen.getByText("หน้าหลัก");
    const compareLink = screen.getByText("เปรียบเทียบคำ");
    const evolutionLink = screen.getByText("สำรวจคำ");
    const dialectLink = screen.getByText("ภาษาถิ่น");
    const scramblerLink = screen.getByText("สุ่มเปลี่ยนคำ 🔀");

    // Word Scrambler links to its own dedicated page
    expect(scramblerLink.getAttribute("href")).toBe("/word-scrambler");

    // Initially, home is active
    expect(homeLink.getAttribute("aria-current")).toBe("page");
    expect(homeLink.classList.contains("active")).toBe(true);

    // Click on compare
    fireEvent.click(compareLink);
    expect(compareLink.getAttribute("aria-current")).toBe("page");
    expect(compareLink.classList.contains("active")).toBe(true);
    expect(homeLink.getAttribute("aria-current")).toBeNull();

    // Click on dialects
    fireEvent.click(dialectLink);
    expect(dialectLink.getAttribute("aria-current")).toBe("page");
    expect(dialectLink.classList.contains("active")).toBe(true);
    expect(compareLink.getAttribute("aria-current")).toBeNull();

    // Click on evolution
    fireEvent.click(evolutionLink);
    expect(evolutionLink.getAttribute("aria-current")).toBe("page");
    expect(evolutionLink.classList.contains("active")).toBe(true);
    expect(dialectLink.getAttribute("aria-current")).toBeNull();
  });

  it("calls onAIChat when clicking the AI Assistant button", () => {
    const navRef = createRef<HTMLElement | null>();
    const onHome = vi.fn();
    const onAIChat = vi.fn();

    render(
      <MorphingNavbar
        navRef={navRef}
        busy={false}
        onHome={onHome}
        onAIChat={onAIChat}
      />
    );

    const aiButton = screen.getByRole("button", { name: /ผู้ช่วย AI/i });
    fireEvent.click(aiButton);
    expect(onAIChat).toHaveBeenCalledTimes(1);
  });

  it("updates active section highlight on scroll when section enters view", () => {
    // Create mock sections in the document
    const heroEl = document.createElement("div");
    heroEl.id = "hero";
    const compareEl = document.createElement("div");
    compareEl.id = "compare";
    const dialectsEl = document.createElement("div");
    dialectsEl.id = "dialects";

    document.body.appendChild(heroEl);
    document.body.appendChild(compareEl);
    document.body.appendChild(dialectsEl);

    // Mock getBoundingClientRect
    // When hero is scrolled away and dialects is at top <= 180
    heroEl.getBoundingClientRect = () => ({ top: -800, bottom: -200, left: 0, right: 0, width: 100, height: 600, x: 0, y: -800, toJSON: () => {} });
    compareEl.getBoundingClientRect = () => ({ top: -200, bottom: 0, left: 0, right: 0, width: 100, height: 200, x: 0, y: -200, toJSON: () => {} });
    dialectsEl.getBoundingClientRect = () => ({ top: 100, bottom: 500, left: 0, right: 0, width: 100, height: 400, x: 0, y: 100, toJSON: () => {} });

    // Mock scrollHeight to be larger than innerHeight
    Object.defineProperty(document.documentElement, "scrollHeight", { value: 3000, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    Object.defineProperty(window, "scrollY", { value: 600, configurable: true });

    const navRef = createRef<HTMLElement | null>();
    render(
      <MorphingNavbar
        navRef={navRef}
        busy={false}
        onHome={vi.fn()}
      />
    );

    // Trigger scroll
    fireEvent.scroll(window);

    const dialectLink = screen.getByText("ภาษาถิ่น");
    expect(dialectLink.getAttribute("aria-current")).toBe("page");
    expect(dialectLink.classList.contains("active")).toBe(true);

    // Clean up mock elements
    heroEl.remove();
    compareEl.remove();
    dialectsEl.remove();
  });

  it("handles clicking AI Assistant button safely without crashing when onAIChat is undefined", () => {
    const navRef = createRef<HTMLElement | null>();
    render(
      <MorphingNavbar
        navRef={navRef}
        busy={false}
        onHome={vi.fn()}
      />
    );

    const aiButton = screen.getByText("ผู้ช่วย AI");
    expect(() => fireEvent.click(aiButton)).not.toThrow();
  });

  it("calls onAIChat when onAIChat prop is provided", () => {
    const navRef = createRef<HTMLElement | null>();
    const onAIChat = vi.fn();
    render(
      <MorphingNavbar
        navRef={navRef}
        busy={false}
        onHome={vi.fn()}
        onAIChat={onAIChat}
      />
    );

    const aiButton = screen.getByText("ผู้ช่วย AI");
    fireEvent.click(aiButton);
    expect(onAIChat).toHaveBeenCalledTimes(1);
  });
});
