import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import BrailleModal from "../src/components/braille/BrailleModal";
import SearchResults from "../src/components/search/SearchResults";
import {
  encodeThaiToBraille,
  dotsToBrailleChar,
  dotsToCellGrid,
  brailleCharToDots,
  decodeDotsToThai,
  decodeBrailleToThai,
} from "../src/lib/braille-encoder";
import { mockSearch } from "../src/lib/mock-search";
import { audioManager } from "../src/lib/audio-manager";
import { GET as getBrailleRoute } from "../src/app/api/v1/dictionary/words/[word]/braille/route";
import { POST as postDecodeBrailleRoute } from "../src/app/api/v1/dictionary/braille/decode/route";
import type { BrailleData } from "../src/lib/accessibility-types";

describe("Thai Braille Encoder and Grid Utilities", () => {
  it("converts dot lists into standard Unicode Braille characters", () => {
    // 0x2800 is empty Braille pattern
    expect(dotsToBrailleChar([])).toBe("⠀");
    // Dot 1 (1 << 0) = U+2801 (⠁)
    expect(dotsToBrailleChar([1])).toBe("⠁");
    // Dot 1, 2 (1 + 2 = 3) = U+2803 (⠃)
    expect(dotsToBrailleChar([1, 2])).toBe("⠃");
    // Dot 1, 2, 3, 4 (1 + 2 + 4 + 8 = 15 = 0xF) = U+280F (⠏) -> 'ป'
    expect(dotsToBrailleChar([1, 2, 3, 4])).toBe("⠏");
    // All 6 dots (0x3F) = U+283F (⠿) -> 'ฮ'
    expect(dotsToBrailleChar([1, 2, 3, 4, 5, 6])).toBe("⠿");
  });

  it("produces standard 2-column x 3-row tactile grid from dots", () => {
    // Cell with dots 1 and 5
    // Row 0: [dot 1, dot 4] -> [true, false]
    // Row 1: [dot 2, dot 5] -> [false, true]
    // Row 2: [dot 3, dot 6] -> [false, false]
    const grid = dotsToCellGrid([1, 5]);
    expect(grid).toHaveLength(3);
    expect(grid[0]).toEqual([true, false]);
    expect(grid[1]).toEqual([false, true]);
    expect(grid[2]).toEqual([false, false]);
  });

  it("encodes a Thai word into BrailleData with cells, reading guide, and attribution", () => {
    const data = encodeThaiToBraille("ปลา");
    expect(data.word).toBe("ปลา");
    expect(data.brailleCells).toHaveLength(3);

    // First char: ป (dots 1-2-3-4) -> ⠏
    expect(data.brailleCells[0].char).toBe("ป");
    expect(data.brailleCells[0].braille).toBe("⠏");
    expect(data.brailleCells[0].dots).toEqual([1, 2, 3, 4]);
    expect(data.brailleCells[0].role).toBe("consonant");

    // Second char: ล (dots 1-2-3) -> ⠇
    expect(data.brailleCells[1].char).toBe("ล");
    expect(data.brailleCells[1].braille).toBe("⠇");
    expect(data.brailleCells[1].dots).toEqual([1, 2, 3]);

    // Third char: า (dots 1-2-6) -> ⠡
    expect(data.brailleCells[2].char).toBe("า");
    expect(data.brailleCells[2].dots).toEqual([1, 2, 6]);

    expect(data.brailleUnicode).toBe("⠏⠇⠣");
    expect(data.readingGuide).toContain("สะกดอักษรเบรลล์:");
    expect(data.readingGuide).toContain("ป (⠏, จุด 1-2-3-4)");
    expect(data.verificationStatus).toBe("OFFICIAL");
    expect(data.sourceAttribution).toContain("สมาคมคนตาบอดแห่งประเทศไทย");
  });

  it("handles empty and whitespace strings gracefully", () => {
    const empty = encodeThaiToBraille("   ");
    expect(empty.word).toBe("");
    expect(empty.brailleUnicode).toBe("");
    expect(empty.brailleCells).toEqual([]);
  });

  it("handles spaces within words", () => {
    const data = encodeThaiToBraille("ก ข");
    expect(data.brailleCells).toHaveLength(3);
    expect(data.brailleCells[1].char).toBe(" ");
    expect(data.brailleCells[1].braille).toBe("⠀");
    expect(data.brailleCells[1].description).toContain("เว้นวรรค");
  });
});

describe("BrailleModal Component", () => {
  const sampleBraille: BrailleData = encodeThaiToBraille("ประสิทธิภาพ");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders modal dialog with accessible attributes and word title", () => {
    render(
      <BrailleModal
        word="ประสิทธิภาพ"
        isOpen={true}
        onClose={vi.fn()}
        initialData={sampleBraille}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBe("braille-modal-title");

    const heading = screen.getByRole("heading", { name: "ประสิทธิภาพ" });
    expect(heading).toBeTruthy();
  });

  it("displays Unicode Braille pattern banner and supports clipboard copy", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <BrailleModal
        word="ประสิทธิภาพ"
        isOpen={true}
        onClose={vi.fn()}
        initialData={sampleBraille}
      />
    );

    const unicodeDisplay = screen.getByLabelText(
      new RegExp(`อักษรเบรลล์: ${sampleBraille.brailleUnicode}`)
    );
    expect(unicodeDisplay).toBeTruthy();
    expect(unicodeDisplay.textContent).toContain(sampleBraille.brailleUnicode);

    // Click copy button
    const copyBtn = screen.getByRole("button", { name: "คัดลอกอักษรเบรลล์" });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith(sampleBraille.brailleUnicode);
    expect(screen.getByText("คัดลอกแล้ว!")).toBeTruthy();
  });

  it("invokes TTS audio playback when 'ฟังเสียงอ่าน' button is clicked", () => {
    const toggleSpy = vi.spyOn(audioManager, "toggle").mockResolvedValue(undefined as any);

    render(
      <BrailleModal
        word="ประสิทธิภาพ"
        isOpen={true}
        onClose={vi.fn()}
        initialData={sampleBraille}
      />
    );

    const ttsBtn = screen.getByRole("button", { name: /ฟังเสียงอ่านคำว่า ประสิทธิภาพ/ });
    fireEvent.click(ttsBtn);

    expect(toggleSpy).toHaveBeenCalledTimes(1);
    expect(toggleSpy).toHaveBeenCalledWith({
      headword: "ประสิทธิภาพ",
      definition: "",
    });
  });

  it("renders visual 6-dot matrix cells and displays cell inspector on click", () => {
    render(
      <BrailleModal
        word="ประสิทธิภาพ"
        isOpen={true}
        onClose={vi.fn()}
        initialData={sampleBraille}
      />
    );

    const cellCards = screen.getAllByRole("listitem");
    expect(cellCards.length).toBe(sampleBraille.brailleCells.length);

    // Click first cell (ป)
    const firstCell = cellCards[0];
    fireEvent.click(firstCell);

    // Inspector appears
    const inspector = screen.getByRole("region", {
      name: "รายละเอียดเซลล์ ป",
    });
    expect(inspector).toBeTruthy();
    expect(inspector.textContent).toContain("ตัวอักษร: ป → ⠏");
    expect(inspector.textContent).toContain("ป. ปลา (จุด 1-2-3-4)");
    expect(inspector.textContent).toContain("ประเภท: พยัญชนะ");

    // Clicking the same cell again deselects it
    fireEvent.click(firstCell);
    expect(screen.queryByRole("region", { name: "รายละเอียดเซลล์ ป" })).toBeNull();
  });

  it("renders spelling and reading guide section", () => {
    render(
      <BrailleModal
        word="ประสิทธิภาพ"
        isOpen={true}
        onClose={vi.fn()}
        initialData={sampleBraille}
      />
    );

    expect(screen.getByText(/วิธีการสะกดและอ่านอักษรเบรลล์/)).toBeTruthy();
    expect(screen.getByText(/สะกดอักษรเบรลล์: ป/)).toBeTruthy();
    expect(screen.getByText(/สมาคมคนตาบอดแห่งประเทศไทย/)).toBeTruthy();
  });

  it("is keyboard-dismissible via Escape key", () => {
    const handleClose = vi.fn();
    render(
      <BrailleModal
        word="ประสิทธิภาพ"
        isOpen={true}
        onClose={handleClose}
        initialData={sampleBraille}
      />
    );

    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("closes when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <BrailleModal
        word="ประสิทธิภาพ"
        isOpen={true}
        onClose={handleClose}
        initialData={sampleBraille}
      />
    );

    const closeBtn = screen.getByRole("button", { name: "ปิดหน้าต่างอักษรเบรลล์" });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("closes when clicking on dialog backdrop", () => {
    const handleClose = vi.fn();
    render(
      <BrailleModal
        word="ประสิทธิภาพ"
        isOpen={true}
        onClose={handleClose}
        initialData={sampleBraille}
      />
    );

    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("handles loading state when resolving braille data", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));

    render(
      <BrailleModal
        word="ประสิทธิภาพ"
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("กำลังประมวลผลอักษรเบรลล์…")).toBeTruthy();
    const loadingBox = document.querySelector(".braille-loading-state")!;
    expect(loadingBox).toBeTruthy();
    expect(loadingBox.getAttribute("aria-busy")).toBe("true");
  });

  it("handles empty state when braille cells are empty", () => {
    const emptyData: BrailleData = {
      word: "ว่างเปล่า",
      brailleUnicode: "",
      brailleCells: [],
      readingGuide: "",
      audioText: "",
      sourceAttribution: "",
      verificationStatus: "OFFICIAL",
    };

    render(
      <BrailleModal
        word="ว่างเปล่า"
        isOpen={true}
        onClose={vi.fn()}
        initialData={emptyData}
      />
    );

    expect(screen.getByText("ไม่มีข้อมูลอักษรเบรลล์สำหรับคำนี้")).toBeTruthy();
  });

  it("cycles keyboard focus with Tab and Shift+Tab within modal", () => {
    render(
      <BrailleModal
        word="ประสิทธิภาพ"
        isOpen={true}
        onClose={vi.fn()}
        initialData={sampleBraille}
      />
    );

    const dialog = screen.getByRole("dialog");
    const controls = dialog.querySelectorAll<HTMLElement>(
      'button, a[href], input, select, textarea, [tabindex="0"]'
    );
    expect(controls.length).toBeGreaterThan(1);

    const first = controls[0];
    const last = controls[controls.length - 1];

    // Shift-Tab on first element moves focus to last
    first.focus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);

    // Tab on last element moves focus to first
    last.focus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(first);
  });
});

describe("Integration: SearchResults page has [Braille ⠃] button and opens Braille modal", () => {
  afterEach(cleanup);

  it("renders [Braille ⠃] trigger button and opens BrailleModal", () => {
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
    const brailleBtn = screen.getByRole("button", { name: /ดูอักษรเบรลล์/ });
    expect(brailleBtn.textContent).toContain("[Braille ⠃]");
    expect(brailleBtn.classList.contains("braille-trigger-btn")).toBe(true);

    // 2. Click button and verify Braille modal dialog opens
    fireEvent.click(brailleBtn);

    const dialogs = screen.getAllByRole("dialog");
    expect(dialogs.length).toBeGreaterThan(0);
    expect(screen.getByText("อักษรเบรลล์ไทย (Thai Braille)")).toBeTruthy();
  });
});

describe("Next.js API route for Braille", () => {
  it("returns 200 with BrailleData for a valid Thai word", async () => {
    const req = new Request(
      "http://localhost:3000/api/v1/dictionary/words/%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%9E/braille"
    );
    const res = await getBrailleRoute(req as any, {
      params: Promise.resolve({ word: "ประสิทธิภาพ" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.word).toBe("ประสิทธิภาพ");
    expect(data.brailleUnicode).toBeDefined();
    expect(data.brailleCells.length).toBe("ประสิทธิภาพ".length);
    expect(data.readingGuide).toContain("สะกดอักษรเบรลล์:");
    expect(data.sourceAttribution).toContain("สมาคมคนตาบอดแห่งประเทศไทย");
  });

  it("returns 400 when word is empty or whitespace", async () => {
    const req = new Request("http://localhost:3000/api/v1/dictionary/words/%20/braille");
    const res = await getBrailleRoute(req as any, {
      params: Promise.resolve({ word: "   " }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("กรุณาระบุคำศัพท์");
  });
});

describe("Reverse Braille Decoder Utilities", () => {
  it("converts Unicode Braille characters back to dot numbers", () => {
    expect(brailleCharToDots("⠀")).toEqual([]);
    expect(brailleCharToDots("⠁")).toEqual([1]);
    expect(brailleCharToDots("⠃")).toEqual([1, 2]);
    expect(brailleCharToDots("⠏")).toEqual([1, 2, 3, 4]);
    expect(brailleCharToDots("⠿")).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("decodes dot arrays into Thai character cells with metadata", () => {
    // ป (dots 1-2-3-4)
    const p = decodeDotsToThai([1, 2, 3, 4]);
    expect(p.char).toBe("ป");
    expect(p.braille).toBe("⠏");
    expect(p.role).toBe("consonant");

    // Empty dot array -> space
    const space = decodeDotsToThai([]);
    expect(space.char).toBe(" ");
    expect(space.braille).toBe("⠀");

    // Shared dot cell: 1-4-6 -> ช with alternatives ฉ, ฌ, ศ
    const ch = decodeDotsToThai([1, 4, 6]);
    expect(ch.char).toBe("ช");
    expect(ch.alternatives).toEqual(["ฉ", "ฌ", "ศ"]);

    // Shared dot cell: 1-3-4-5-6 -> ย with alternative ญ
    const y = decodeDotsToThai([1, 3, 4, 5, 6]);
    expect(y.char).toBe("ย");
    expect(y.alternatives).toEqual(["ญ"]);
  });

  it("decodes Unicode Braille string back into Thai text with reading guide", () => {
    // ⠏⠇⠣ -> ป + ล + า = ปลา
    const res = decodeBrailleToThai("⠏⠇⠣");
    expect(res.decodedText).toBe("ปลา");
    expect(res.cells).toHaveLength(3);
    expect(res.cells[0].char).toBe("ป");
    expect(res.cells[1].char).toBe("ล");
    expect(res.cells[2].char).toBe("า");
    expect(res.readingGuide).toContain("ป");
    expect(res.readingGuide).toContain("ล");
    expect(res.readingGuide).toContain("า");
    expect(res.hasAmbiguity).toBe(true); // ล has alternative ฬ
  });

  it("handles whitespace and empty strings gracefully", () => {
    const res = decodeBrailleToThai("");
    expect(res.decodedText).toBe("");
    expect(res.cells).toEqual([]);
    expect(res.hasAmbiguity).toBe(false);
  });
});

describe("BrailleModal Component - Reverse Braille Mode", () => {
  const sampleBraille: BrailleData = encodeThaiToBraille("ปลา");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("switches to Reverse Braille mode and displays the interactive keypad and prefilled braille", () => {
    render(
      <BrailleModal
        word="ปลา"
        isOpen={true}
        onClose={vi.fn()}
        initialData={sampleBraille}
      />
    );

    // Click Reverse Braille tab
    const reverseTab = screen.getByRole("tab", { name: /ถอดรหัสย้อนกลับ/ });
    fireEvent.click(reverseTab);

    expect(reverseTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("แป้นสัมผัสจำลอง 6 จุด (Tactile 6-Dot Keypad)")).toBeTruthy();
    expect(screen.getByLabelText("กล่องข้อความอักษรเบรลล์")).toBeTruthy();

    // The decoded text banner should show "ปลา"
    const decodedBanner = screen.getByLabelText(/ข้อความที่ถอดรหัสได้: ปลา/);
    expect(decodedBanner).toBeTruthy();
    expect(decodedBanner.textContent).toContain("ปลา");
  });

  it("interacts with 6-dot matrix keypad to assemble cells and add them to input", () => {
    render(
      <BrailleModal
        word="ปลา"
        isOpen={true}
        onClose={vi.fn()}
        initialData={{
          ...sampleBraille,
          brailleUnicode: "",
        }}
      />
    );

    // Switch to reverse tab
    fireEvent.click(screen.getByRole("tab", { name: /ถอดรหัสย้อนกลับ/ }));

    // Click Dot 1, Dot 2, Dot 3, Dot 4 (which forms 'ป' -> ⠏)
    fireEvent.click(screen.getByRole("button", { name: /จุดที่ 1/ }));
    fireEvent.click(screen.getByRole("button", { name: /จุดที่ 2/ }));
    fireEvent.click(screen.getByRole("button", { name: /จุดที่ 3/ }));
    fireEvent.click(screen.getByRole("button", { name: /จุดที่ 4/ }));

    // Verify preview shows 'ป'
    expect(screen.getByText("ป. ปลา (จุด 1-2-3-4)")).toBeTruthy();

    // Click "+ เพิ่มเซลล์นี้"
    const addBtn = screen.getByRole("button", { name: /เพิ่มตัวอักษร ป/ });
    fireEvent.click(addBtn);

    // Decoded text banner should now show "ป"
    const decodedBannerCell = screen.getByLabelText(/ข้อความที่ถอดรหัสได้: ป/);
    expect(decodedBannerCell).toBeTruthy();
    expect(decodedBannerCell.textContent).toContain("ป");
  });

  it("supports adding spaces, deleting characters, and clearing all", () => {
    render(
      <BrailleModal
        word="ปลา"
        isOpen={true}
        onClose={vi.fn()}
        initialData={sampleBraille} // preloaded with '⠏⠇⠣' -> 'ปลา'
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: /ถอดรหัสย้อนกลับ/ }));
    expect(screen.getByLabelText(/ข้อความที่ถอดรหัสได้: ปลา/)).toBeTruthy();

    // Add space
    fireEvent.click(screen.getByRole("button", { name: "เพิ่มช่องว่าง" }));
    // Backspace
    fireEvent.click(screen.getByRole("button", { name: "ลบตัวอักษรล่าสุด" }));

    // Clear all
    fireEvent.click(screen.getByRole("button", { name: "ล้างข้อความทั้งหมด" }));
    expect(screen.getByText(/ยังไม่มีข้อความ/)).toBeTruthy();
  });

  it("updates decoded text in real-time when typing in the Braille input field", () => {
    render(
      <BrailleModal
        word="ปลา"
        isOpen={true}
        onClose={vi.fn()}
        initialData={{ ...sampleBraille, brailleUnicode: "" }}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: /ถอดรหัสย้อนกลับ/ }));

    const input = screen.getByLabelText("กล่องข้อความอักษรเบรลล์");
    fireEvent.change(input, { target: { value: "⠏⠇⠣" } });

    expect(screen.getByLabelText(/ข้อความที่ถอดรหัสได้: ปลา/)).toBeTruthy();
    expect(screen.getByText(/การวิเคราะห์ทีละเซลล์ \(3 เซลล์\)/)).toBeTruthy();
  });

  it("plays TTS and copies decoded Thai text in Reverse mode", async () => {
    const toggleSpy = vi.spyOn(audioManager, "toggle").mockResolvedValue(undefined as any);
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <BrailleModal
        word="ปลา"
        isOpen={true}
        onClose={vi.fn()}
        initialData={sampleBraille}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: /ถอดรหัสย้อนกลับ/ }));

    // Click TTS
    const ttsBtn = screen.getByRole("button", { name: /ฟังเสียงอ่านข้อความที่ถอดรหัสได้/ });
    fireEvent.click(ttsBtn);
    expect(toggleSpy).toHaveBeenCalledWith({ headword: "ปลา", definition: "" });

    // Click Copy
    const copyBtn = screen.getByRole("button", { name: "คัดลอกข้อความภาษาไทย" });
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    expect(writeTextMock).toHaveBeenCalledWith("ปลา");
  });

  it("displays ambiguity alert when Braille cells share multiple Thai consonants", () => {
    render(
      <BrailleModal
        word="ช้าง"
        isOpen={true}
        onClose={vi.fn()}
        initialData={encodeThaiToBraille("ช้าง")}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: /ถอดรหัสย้อนกลับ/ }));
    expect(screen.getByLabelText("ข้อสังเกตจุดร่วมอักษรเบรลล์")).toBeTruthy();
    expect(screen.getByText(/ข้อสังเกตเรื่องอักขระจุดร่วม/)).toBeTruthy();
  });
});

describe("Next.js API route for Reverse Braille decoding", () => {
  it("returns 200 with DecodedBrailleResult for a valid Braille string", async () => {
    const req = new Request("http://localhost:3000/api/v1/dictionary/braille/decode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ braille: "⠏⠇⠣" }),
    });

    const res = await postDecodeBrailleRoute(req as any);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.decodedText).toBe("ปลา");
    expect(data.brailleInput).toBe("⠏⠇⠣");
    expect(data.cells).toHaveLength(3);
    expect(data.readingGuide).toContain("ป");
  });

  it("returns 400 when braille input is empty", async () => {
    const req = new Request("http://localhost:3000/api/v1/dictionary/braille/decode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ braille: "   " }),
    });

    const res = await postDecodeBrailleRoute(req as any);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("กรุณาระบุอักษรเบรลล์ที่ต้องการถอดรหัส");
  });
});
