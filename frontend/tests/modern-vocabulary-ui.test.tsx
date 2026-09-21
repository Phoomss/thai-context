import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ModernVocabularyExplorer from "../src/components/modern-vocabulary/ModernVocabularyExplorer";
import ModernTermCard from "../src/components/modern-vocabulary/ModernTermCard";
import { ModernTerm } from "../src/lib/modern-vocabulary-types";
import { audioManager } from "../src/lib/audio-manager";

// Create 15 mock terms for testing pagination
const createMockTerms = (count: number): ModernTerm[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-term-${i + 1}`,
    term: `คำศัพท์ทดสอบ ${i + 1}`,
    slug: `mock-term-${i + 1}`,
    language: "th",
    term_type: "SLANG",
    categories: i % 2 === 0 ? ["AI", "TECHNOLOGY"] : ["SLANG", "SOCIAL_MEDIA"],
    status: "COMMON",
    origin: "INTERNET",
    register: "SLANG",
    audience: "GENERAL",
    description: `คำอธิบายจำลองของคำศัพท์ที่ ${i + 1}`,
    first_seen_at: "2024-01-01",
    confidence: 0.9,
    transliteration: `term-${i + 1}`,
    english_meaning: `Mock term ${i + 1} definition`,
    pronunciation: `คำ-สับ-${i + 1}`,
    usage_warning: null,
    sources: [],
    definitions: [
      {
        definition: `นิยามตัวอย่างของคำศัพท์ที่ ${i + 1}`,
        definition_type: "COMMUNITY_DEFINED",
        verified: true,
      },
    ],
    examples: [],
    relationships: [],
  }));
};

describe("Modern Vocabulary Explorer Pagination UI", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders status bar and paginates items with default page size 9", () => {
    const mockTerms = createMockTerms(20);
    render(<ModernVocabularyExplorer initialTerms={mockTerms} />);

    // Header & Title
    expect(screen.getByText("คลังคำศัพท์ภาษาไทยร่วมสมัย")).toBeTruthy();
    expect(screen.getByText(/Modern Thai Vocabulary Layer/)).toBeTruthy();

    // Status bar shows range: 1 - 9 of 20
    expect(screen.getByText(/แสดงรายการที่/)).toBeTruthy();
    expect(screen.getByText(/1 – 9/)).toBeTruthy();
    expect(screen.getByText(/พบ 20 คำ/)).toBeTruthy();
    expect(screen.getByText("(หน้า 1/3)")).toBeTruthy();

    // Exactly 9 term cards rendered
    expect(screen.getByText("คำศัพท์ทดสอบ 1")).toBeTruthy();
    expect(screen.getByText("คำศัพท์ทดสอบ 9")).toBeTruthy();
    expect(screen.queryByText("คำศัพท์ทดสอบ 10")).toBeNull();

    // Pagination buttons
    const nextBtn = screen.getByRole("button", { name: "ไปยังหน้าถัดไป" });
    const prevBtn = screen.getByRole("button", { name: "ไปยังหน้าก่อนหน้า" });
    const firstBtn = screen.getByRole("button", { name: "ไปยังหน้าแรก" });

    // Page 1: Prev & First disabled
    expect((prevBtn as HTMLButtonElement).disabled).toBe(true);
    expect((firstBtn as HTMLButtonElement).disabled).toBe(true);
    expect((nextBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it("navigates to page 2 when clicking next button", () => {
    const mockTerms = createMockTerms(20);
    render(<ModernVocabularyExplorer initialTerms={mockTerms} />);

    const nextBtn = screen.getByRole("button", { name: "ไปยังหน้าถัดไป" });
    fireEvent.click(nextBtn);

    // Now on page 2: items 10 - 18
    expect(screen.getByText(/10 – 18/)).toBeTruthy();
    expect(screen.getByText("(หน้า 2/3)")).toBeTruthy();
    expect(screen.getByText("คำศัพท์ทดสอบ 10")).toBeTruthy();
    expect(screen.getByText("คำศัพท์ทดสอบ 18")).toBeTruthy();
    expect(screen.queryByText("คำศัพท์ทดสอบ 9")).toBeNull();
    expect(screen.queryByText("คำศัพท์ทดสอบ 19")).toBeNull();
  });

  it("navigates to last page and disables next/last buttons", () => {
    const mockTerms = createMockTerms(20);
    render(<ModernVocabularyExplorer initialTerms={mockTerms} />);

    const lastBtn = screen.getByRole("button", { name: "ไปยังหน้าสุดท้าย" });
    fireEvent.click(lastBtn);

    // On page 3: items 19 - 20
    expect(screen.getByText(/19 – 20/)).toBeTruthy();
    expect(screen.getByText("(หน้า 3/3)")).toBeTruthy();
    expect(screen.getByText("คำศัพท์ทดสอบ 19")).toBeTruthy();
    expect(screen.getByText("คำศัพท์ทดสอบ 20")).toBeTruthy();

    const nextBtn = screen.getByRole("button", { name: "ไปยังหน้าถัดไป" });
    expect((nextBtn as HTMLButtonElement).disabled).toBe(true);
    expect((lastBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it("changes items per page when clicking page size buttons", () => {
    const mockTerms = createMockTerms(20);
    render(<ModernVocabularyExplorer initialTerms={mockTerms} />);

    // Click 6 items per page
    const size6Btn = screen.getByRole("button", { name: "แสดง 6 คำต่อหน้า" });
    fireEvent.click(size6Btn);

    // Should show 1 - 6 of 20 (page 1/4)
    expect(screen.getByText(/1 – 6/)).toBeTruthy();
    expect(screen.getByText("(หน้า 1/4)")).toBeTruthy();
    expect(screen.getByText("คำศัพท์ทดสอบ 1")).toBeTruthy();
    expect(screen.getByText("คำศัพท์ทดสอบ 6")).toBeTruthy();
    expect(screen.queryByText("คำศัพท์ทดสอบ 7")).toBeNull();

    // Click All items in single page
    const allBtn = screen.getByRole("button", { name: "แสดงคำทั้งหมดในหน้าเดียว" });
    fireEvent.click(allBtn);

    // Shows 1 - 20 of 20, no pagination nav bar
    expect(screen.getByText(/1 – 20/)).toBeTruthy();
    expect(screen.getByText("คำศัพท์ทดสอบ 1")).toBeTruthy();
    expect(screen.getByText("คำศัพท์ทดสอบ 20")).toBeTruthy();
    expect(screen.queryByRole("navigation", { name: "การแบ่งหน้าคลังคำศัพท์ภาษาไทยร่วมสมัย" })).toBeNull();
  });

  it("resets back to page 1 when user searches or filters", () => {
    const mockTerms = createMockTerms(20);
    render(<ModernVocabularyExplorer initialTerms={mockTerms} />);

    // Go to page 2 first
    const nextBtn = screen.getByRole("button", { name: "ไปยังหน้าถัดไป" });
    fireEvent.click(nextBtn);
    expect(screen.getByText("(หน้า 2/3)")).toBeTruthy();

    // Type in search query
    const searchInput = screen.getByPlaceholderText("ค้นหาคำศัพท์ร่วมสมัย เช่น ป้ายยา, RAG, จึ้ง, Prompt...");
    fireEvent.change(searchInput, { target: { value: "คำศัพท์ทดสอบ 1" } });

    // Should reset to page 1 automatically
    expect(screen.getByText(/แสดงรายการที่/)).toBeTruthy();
    expect(screen.getByText("คำศัพท์ทดสอบ 1")).toBeTruthy();
  });
});

describe("ModernTermCard User-Friendly UI", () => {
  const sampleTerm: ModernTerm = {
    id: "term-pai-ya",
    term: "ป้ายยา",
    slug: "pai-ya",
    language: "th",
    term_type: "SLANG",
    categories: ["SOCIAL_MEDIA", "SLANG"],
    status: "TRENDING",
    origin: "INTERNET",
    register: "SLANG",
    audience: "GENERAL",
    description: "การแนะนำ บอกต่อ หรือรีวิวสินค้าอย่างกระตือรือร้นจนผู้อื่นอยากซื้อตาม",
    first_seen_at: "2019-01-01",
    confidence: 0.96,
    transliteration: "pai-ya",
    english_meaning: "To enthusiastically recommend a product to someone.",
    pronunciation: "ป้าย-ยา",
    usage_warning: "เป็นภาษาพูดและสแลง ไม่ควรใช้ในหนังสือราชการ",
    sources: [
      {
        source_type: "COMMUNITY",
        source_name: "Social Media Lexicon / BLT Bangkok",
        verification_status: "VERIFIED",
      },
    ],
    definitions: [
      {
        definition: "การแนะนำ ชักชวน หรือรีวิวสิ่งของ สินค้า บริการ อย่างมีพลังดึงดูด",
        definition_type: "EDITOR_REVIEWED",
        verified: true,
      },
    ],
    examples: [
      {
        example_text: "เพื่อนในกลุ่มโดนป้ายยาหูฟังไร้สายตัวนี้กันหมดเลย",
        context_note: "การใช้งานในสื่อสังคมออนไลน์",
      },
    ],
    relationships: [
      {
        target_type: "OFFICIAL",
        target_id: "recommend",
        target_headword: "ชักชวน/โน้มน้าว",
        relationship_type: "FORMAL_EQUIVALENT",
        is_inferred: false,
        confidence: 0.95,
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders headword, pronunciation phonetics, transliteration, and category chips", () => {
    const handleViewDetail = vi.fn();
    render(<ModernTermCard term={sampleTerm} onViewDetail={handleViewDetail} />);

    expect(screen.getByRole("heading", { name: "ป้ายยา", level: 3 })).toBeTruthy();
    expect(screen.getByText("/ป้าย-ยา/")).toBeTruthy();
    expect(screen.getByText("(pai-ya)")).toBeTruthy();
    expect(screen.getByText("สแลงร่วมสมัย")).toBeTruthy();
    expect(screen.getByText("กำลังนิยม")).toBeTruthy();
    expect(screen.getByText("โซเชียล")).toBeTruthy();
  });

  it("renders definition, source tag, and usage warning callout", () => {
    const handleViewDetail = vi.fn();
    render(<ModernTermCard term={sampleTerm} onViewDetail={handleViewDetail} />);

    expect(screen.getByText("บรรณาธิการตรวจรับรอง")).toBeTruthy();
    expect(screen.getByText("การแนะนำ ชักชวน หรือรีวิวสิ่งของ สินค้า บริการ อย่างมีพลังดึงดูด")).toBeTruthy();
    expect(screen.getByText(/ข้อควรระวังการใช้:/)).toBeTruthy();
    expect(screen.getByText(/เป็นภาษาพูดและสแลง ไม่ควรใช้ในหนังสือราชการ/)).toBeTruthy();
  });

  it("renders example sentence and allows copying sentence", () => {
    const handleViewDetail = vi.fn();
    render(<ModernTermCard term={sampleTerm} onViewDetail={handleViewDetail} />);

    expect(screen.getByText(/เพื่อนในกลุ่มโดน/)).toBeTruthy();
    expect(screen.getByText("📌 การใช้งานในสื่อสังคมออนไลน์")).toBeTruthy();

    const copySentenceBtn = screen.getByRole("button", { name: "คัดลอกตัวอย่างประโยค" });
    fireEvent.click(copySentenceBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("เพื่อนในกลุ่มโดนป้ายยาหูฟังไร้สายตัวนี้กันหมดเลย");
    expect(screen.getByText("คัดลอกแล้ว")).toBeTruthy();
  });

  it("renders formal equivalent banner and triggers onCompareWithFormal", () => {
    const handleViewDetail = vi.fn();
    const handleCompare = vi.fn();
    render(
      <ModernTermCard
        term={sampleTerm}
        onViewDetail={handleViewDetail}
        onCompareWithFormal={handleCompare}
      />
    );

    expect(screen.getByText("คำทางการเทียบเคียง:")).toBeTruthy();
    expect(screen.getByText("ชักชวน/โน้มน้าว")).toBeTruthy();

    const banner = screen.getByTitle(/เปรียบเทียบความหมายกับคำทางการ/);
    fireEvent.click(banner);

    expect(handleCompare).toHaveBeenCalledWith("ป้ายยา", "ชักชวน/โน้มน้าว");
    expect(handleViewDetail).not.toHaveBeenCalled();
  });

  it("clicking the card body triggers onViewDetail", () => {
    const handleViewDetail = vi.fn();
    render(<ModernTermCard term={sampleTerm} onViewDetail={handleViewDetail} />);

    const card = screen.getByRole("button", { name: /คำศัพท์ ป้ายยา/ });
    fireEvent.click(card);

    expect(handleViewDetail).toHaveBeenCalledWith(sampleTerm);
  });

  it("keyboard navigation (Enter key) on card triggers onViewDetail", () => {
    const handleViewDetail = vi.fn();
    render(<ModernTermCard term={sampleTerm} onViewDetail={handleViewDetail} />);

    const card = screen.getByRole("button", { name: /คำศัพท์ ป้ายยา/ });
    fireEvent.keyDown(card, { key: "Enter" });

    expect(handleViewDetail).toHaveBeenCalledWith(sampleTerm);
  });

  it("clicking copy term button copies headword and displays confirmation", () => {
    const handleViewDetail = vi.fn();
    render(<ModernTermCard term={sampleTerm} onViewDetail={handleViewDetail} />);

    const copyBtn = screen.getByRole("button", { name: "คัดลอกคำว่า ป้ายยา" });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("ป้ายยา");
    expect(screen.getByText("คัดลอกแล้ว")).toBeTruthy();
    expect(handleViewDetail).not.toHaveBeenCalled();
  });

  it("supports Foreigner Mode with English explanation and pronunciation", () => {
    const handleViewDetail = vi.fn();
    render(
      <ModernTermCard
        term={sampleTerm}
        onViewDetail={handleViewDetail}
        foreignerMode={true}
      />
    );

    expect(screen.getByText("English Meaning:")).toBeTruthy();
    expect(screen.getByText("To enthusiastically recommend a product to someone.")).toBeTruthy();
    expect(screen.getByText("Pronounced: /ป้าย-ยา/")).toBeTruthy();
  });

  it("plays pronunciation audio when clicking audio button", () => {
    const handleViewDetail = vi.fn();
    const toggleSpy = vi.spyOn(audioManager, "toggle").mockImplementation(() => Promise.resolve());

    render(<ModernTermCard term={sampleTerm} onViewDetail={handleViewDetail} />);

    const audioBtn = screen.getByRole("button", { name: "ฟังเสียงการออกเสียงคำว่า ป้ายยา" });
    fireEvent.click(audioBtn);

    expect(toggleSpy).toHaveBeenCalled();
    expect(handleViewDetail).not.toHaveBeenCalled();
  });
});

