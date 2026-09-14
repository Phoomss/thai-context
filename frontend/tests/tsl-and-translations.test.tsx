import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import ProvenanceBadge, {
  PROVENANCE_CONFIGS,
} from "../src/components/translations/ProvenanceBadge";
import WordTranslations from "../src/components/translations/WordTranslations";
import SignLanguageModal from "../src/components/tsl/SignLanguageModal";
import WordResultCard from "../src/components/search/WordResultCard";
import SearchResults from "../src/components/search/SearchResults";
import {
  sortTranslations,
  type TranslationItem,
  type SignLanguageEntry,
} from "../src/lib/accessibility-types";
import { mockSearch } from "../src/lib/mock-search";
import { GET as getSignLanguageRoute } from "../src/app/api/v1/dictionary/words/[word]/sign-language/route";
import { GET as getTranslationsRoute } from "../src/app/api/v1/dictionary/words/[word]/translations/route";

describe("ProvenanceBadge component", () => {
  afterEach(cleanup);

  it("renders OFFICIAL_ROYAL_TRANSLITERATION with exact emoji 🏛️, label 'คำทับศัพท์ทางการ', and tier-official class", () => {
    render(<ProvenanceBadge provenance="OFFICIAL_ROYAL_TRANSLITERATION" />);
    const badge = screen.getByRole("status");
    expect(badge.textContent).toContain("🏛️");
    expect(badge.textContent).toContain("คำทับศัพท์ทางการ");
    expect(badge.classList.contains("tier-official")).toBe(true);
  });

  it("renders OFFICIAL_ROYAL_COINED with exact emoji 📜, label 'ศัพท์บัญญัติราชบัณฑิต', and tier-official class", () => {
    render(<ProvenanceBadge provenance="OFFICIAL_ROYAL_COINED" />);
    const badge = screen.getByRole("status");
    expect(badge.textContent).toContain("📜");
    expect(badge.textContent).toContain("ศัพท์บัญญัติราชบัณฑิต");
    expect(badge.classList.contains("tier-official")).toBe(true);
  });

  it("renders AI_GENERATED with exact emoji 🤖, label 'AI แนะนำ', and tier-ai class (muted/dashed visual indicator)", () => {
    render(<ProvenanceBadge provenance="AI_GENERATED" />);
    const badge = screen.getByRole("status");
    expect(badge.textContent).toContain("🤖");
    expect(badge.textContent).toContain("AI แนะนำ");
    expect(badge.classList.contains("tier-ai")).toBe(true);
  });
});

describe("Translations sorting utility", () => {
  it("sorts official sources first and AI-generated last", () => {
    const mixed: TranslationItem[] = [
      {
        translatedWord: "ai translation",
        languageCode: "en",
        provenance: "AI_GENERATED",
        confidenceScore: 0.99,
      },
      {
        translatedWord: "coined term",
        languageCode: "en",
        provenance: "OFFICIAL_ROYAL_COINED",
        confidenceScore: 1.0,
      },
      {
        translatedWord: "transliterated term",
        languageCode: "en",
        provenance: "OFFICIAL_ROYAL_TRANSLITERATION",
        confidenceScore: 1.0,
      },
    ];

    const sorted = sortTranslations(mixed);
    expect(sorted[0].provenance).toBe("OFFICIAL_ROYAL_TRANSLITERATION");
    expect(sorted[1].provenance).toBe("OFFICIAL_ROYAL_COINED");
    expect(sorted[2].provenance).toBe("AI_GENERATED");
  });
});

describe("WordTranslations component", () => {
  afterEach(cleanup);

  it("renders Translations section with sorted entries and ProvenanceBadges", () => {
    const sampleTranslations: TranslationItem[] = [
      {
        translatedWord: "performance efficacy",
        languageCode: "en",
        contextualExplanation: "AI recommended modern workplace usage",
        provenance: "AI_GENERATED",
      },
      {
        translatedWord: "efficiency",
        languageCode: "en",
        secondaryTranslations: ["competence", "productivity"],
        contextualExplanation: "ความสามารถในการทำงานให้คุ้มค่า",
        usageNuance: "ภาษาทางการ",
        provenance: "OFFICIAL_ROYAL_COINED",
      },
    ];

    render(
      <WordTranslations
        headword="ประสิทธิภาพ"
        initialTranslations={sampleTranslations}
      />
    );

    expect(
      screen.getByRole("heading", { name: /Translations/i })
    ).toBeTruthy();

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);

    // First item should be sorted to OFFICIAL_ROYAL_COINED
    expect(items[0].textContent).toContain("efficiency");
    expect(items[0].textContent).toContain("ศัพท์บัญญัติราชบัณฑิต");
    expect(items[0].textContent).toContain("competence, productivity");

    // Second item should be AI_GENERATED
    expect(items[1].textContent).toContain("performance efficacy");
    expect(items[1].textContent).toContain("AI แนะนำ");
  });

  it("handles empty translations state gracefully without crashing or breaking layout", () => {
    render(<WordTranslations headword="คำที่ไม่มีคำแปล" initialTranslations={[]} />);
    expect(
      screen.getByText("ยังไม่มีข้อมูลคำแปลหรือศัพท์บัญญัติสำหรับคำนี้")
    ).toBeTruthy();
  });

  it("displays loading state while resolving translations", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<WordTranslations headword="คำทดสอบ" />);
    expect(screen.getByLabelText("กำลังโหลดข้อมูลคำแปล")).toBeTruthy();
    expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true");
    vi.unstubAllGlobals();
  });
});

describe("WordResultCard with inline English translation", () => {
  afterEach(cleanup);

  it("displays English translation inline on search result card", () => {
    const word = {
      headword: "ประสิทธิภาพ",
      score: 0.96,
      pos: "น.",
      definition: "ความสามารถในการทำงาน",
      english: "efficiency",
    };

    render(
      <WordResultCard
        word={word}
        index={0}
        revision={1}
        loading={false}
        selected={false}
        onEvidence={vi.fn()}
        onCompare={vi.fn()}
      />
    );

    expect(screen.getByText("(efficiency)")).toBeTruthy();
    expect(screen.getByText("ประสิทธิภาพ")).toBeTruthy();
  });
});

describe("SignLanguageModal component", () => {
  afterEach(cleanup);

  const sampleTsl: SignLanguageEntry[] = [
    {
      signName: "ประสิทธิภาพ",
      handshapeDescription:
        "มือขวาตั้งนิ้วชี้และนิ้วกลาง หมุนวนเป็นเกลียวไปข้างหน้าแล้วประกบฝ่ามือซ้าย",
      dialectRegion: "ภาคกลาง (CENTRAL)",
      verificationStatus: "OFFICIAL",
      sourceAttribution: "วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล",
      license: "CC-BY-SA 4.0",
      media: [
        {
          mediaType: "VIDEO_MP4",
          mediaUrl: "https://assets.thai-context.org/tsl/videos/prasitthiphap.mp4",
          thumbnailUrl: "https://assets.thai-context.org/tsl/thumbs/prasitthiphap.jpg",
          isPrimary: true,
        },
      ],
    },
  ];

  it("renders video player, controls, loop toggle, and gesture description", () => {
    render(
      <SignLanguageModal
        word="ประสิทธิภาพ"
        isOpen={true}
        onClose={vi.fn()}
        initialData={sampleTsl}
      />
    );

    expect(screen.getByRole("heading", { name: "ประสิทธิภาพ" })).toBeTruthy();
    const video = document.querySelector("video") as HTMLVideoElement;
    expect(video).toBeTruthy();
    expect(video.getAttribute("src") || video.querySelector("source")?.getAttribute("src")).toContain("prasitthiphap.mp4");

    // Loop checkbox toggle
    const loopToggle = screen.getByLabelText("เล่นวิดีโอวนซ้ำ") as HTMLInputElement;
    expect(loopToggle.checked).toBe(false);
    fireEvent.click(loopToggle);
    expect(loopToggle.checked).toBe(true);

    // Gesture text description
    expect(
      screen.getByText(/มือขวาตั้งนิ้วชี้และนิ้วกลาง หมุนวนเป็นเกลียว/)
    ).toBeTruthy();

    // Source attribution
    expect(
      screen.getByText(/วิทยาลัยราชสุดา มหาวิทยาลัยมหิดล/)
    ).toBeTruthy();
  });

  it("handles empty state gracefully when no sign language data is found", () => {
    render(
      <SignLanguageModal
        word="คำที่ไม่มีภาษามือ"
        isOpen={true}
        onClose={vi.fn()}
        initialData={[]}
      />
    );

    expect(
      screen.getByText("ยังไม่มีข้อมูลภาษามือไทยสำหรับคำนี้")
    ).toBeTruthy();
    expect(screen.getAllByText(/คำที่ไม่มีภาษามือ/).length).toBeGreaterThanOrEqual(1);
  });

  it("is keyboard-dismissible via Escape key", () => {
    const handleClose = vi.fn();
    render(
      <SignLanguageModal
        word="ประสิทธิภาพ"
        isOpen={true}
        onClose={handleClose}
        initialData={sampleTsl}
      />
    );

    const dialog = document.querySelector("dialog")!;
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("displays loading state while resolving sign language data", () => {
    // Stub global fetch with a pending promise
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));

    render(
      <SignLanguageModal
        word="ประสิทธิภาพ"
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("กำลังค้นหาคลิปวิดีโอภาษามือไทย…")).toBeTruthy();
    expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true");

    vi.unstubAllGlobals();
  });

  it("supports switching between multiple sign language variants", () => {
    const multiVariant: SignLanguageEntry[] = [
      {
        signName: "ประสิทธิภาพ (แบบ 1)",
        handshapeDescription: "ท่ามือแบบที่หนึ่ง",
        media: [
          {
            mediaType: "VIDEO_MP4",
            mediaUrl: "https://assets.thai-context.org/tsl/videos/v1.mp4",
            isPrimary: true,
          },
        ],
      },
      {
        signName: "ประสิทธิภาพ (แบบ 2)",
        handshapeDescription: "ท่ามือแบบที่สอง",
        media: [
          {
            mediaType: "VIDEO_MP4",
            mediaUrl: "https://assets.thai-context.org/tsl/videos/v2.mp4",
            isPrimary: true,
          },
        ],
      },
    ];

    render(
      <SignLanguageModal
        word="ประสิทธิภาพ"
        isOpen={true}
        onClose={vi.fn()}
        initialData={multiVariant}
      />
    );

    expect(screen.getByText("ท่ามือแบบที่หนึ่ง")).toBeTruthy();

    const v2Btn = screen.getByRole("button", { name: "แบบที่ 2" });
    fireEvent.click(v2Btn);

    expect(screen.getByText("ท่ามือแบบที่สอง")).toBeTruthy();
  });
});

describe("Integration: SearchResults page has TSL button and Translations section", () => {
  afterEach(cleanup);

  it("renders [ภาษามือไทย 🤟] trigger button and opens TSL modal", () => {
    const dummyExperience = {
      state: "results-active" as const,
      hasResults: true,
      requestId: 1,
      query: "ทำงาน",
      revealed: true,
      revision: 1,
      loading: false,
      result: mockSearch("ทำงาน"),
      staged: null,
      error: "",
      stagedError: "",
      evidence: null,
    };

    render(
      <SearchResults
        experience={dummyExperience}
        reduced={false}
        sectionRef={{ current: null }}
        onEvidence={vi.fn()}
        compareSelected={[]}
        onCompare={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    // 1. Check trigger button
    const tslBtn = screen.getByRole("button", { name: /ภาษามือไทย/ });
    expect(tslBtn.textContent).toContain("ภาษามือไทย 🤟");

    // 2. Check Translations section is rendered in the word detail
    expect(
      screen.getByRole("heading", { name: /Translations/i })
    ).toBeTruthy();

    // 3. Click TSL button and verify modal opens
    fireEvent.click(tslBtn);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "ประสิทธิภาพ" })
    ).toBeTruthy();
  });
});

describe("Next.js API routes for TSL and Translations", () => {
  it("returns sign language data for known word and empty array for unknown word", async () => {
    const req = new Request(
      "http://localhost:3000/api/v1/dictionary/words/%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%88%E0%B8%A0%E0%B8%B2%E0%B8%9E/sign-language"
    );
    const res = await getSignLanguageRoute(req as any, {
      params: Promise.resolve({ word: "ประสิทธิภาพ" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].signName).toBe("ประสิทธิภาพ");
    expect(data[0].media[0].mediaUrl).toContain("prasitthiphap.mp4");

    const unknownRes = await getSignLanguageRoute(req as any, {
      params: Promise.resolve({ word: "คำที่ไม่เคยมี" }),
    });
    const unknownData = await unknownRes.json();
    expect(unknownData).toEqual([]);
  });

  it("returns translations with Royal Institute coined/transliterated terms", async () => {
    const req = new Request(
      "http://localhost:3000/api/v1/dictionary/words/%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%88%E0%B8%A0%E0%B8%B2%E0%B8%9E/translations"
    );
    const res = await getTranslationsRoute(req as any, {
      params: Promise.resolve({ word: "ประสิทธิภาพ" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].translatedWord).toBe("efficiency");
    expect(data[0].provenance).toBe("OFFICIAL_ROYAL_COINED");
  });
});

