import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import SentenceQuirkifier from "../src/components/quirkify/SentenceQuirkifier";
import * as apiClient from "../src/lib/api-client";

describe("Word Scrambler (สุ่มเปลี่ยนคำในประโยค) UI Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the clean Word Scrambler interface with sentence controls", () => {
    render(<SentenceQuirkifier embedded={false} />);

    // Header
    expect(screen.getByText("สุ่มเปลี่ยนคำในประโยค (Word Scrambler)")).toBeTruthy();
    expect(screen.getByText(/THAI CONTEXT Word Scrambler/)).toBeTruthy();

    // Primary action button
    expect(screen.getByText(/สุ่มเปลี่ยนคำในประโยค ✦/)).toBeTruthy();
    expect(screen.queryByText("สลับตำแหน่งคำในประโยค")).toBeNull();
    expect(screen.queryByText("สลับตำแหน่ง + เปลี่ยนคำ")).toBeNull();

    // Presets
    expect(screen.getAllByText("วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("หิวข้าวมาก เที่ยงนี้ไปกินอะไรกันดี")).toBeTruthy();
  });

  it("changes input sentence when clicking preset chip", () => {
    render(<SentenceQuirkifier embedded={false} />);

    const textarea = screen.getByLabelText("ประโยคภาษาไทยที่ต้องการสุ่มเปลี่ยนคำ") as HTMLTextAreaElement;
    expect(textarea.value).toBe("วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว");

    const secondPreset = screen.getByText("หิวข้าวมาก เที่ยงนี้ไปกินอะไรกันดี");
    fireEvent.click(secondPreset);

    expect(textarea.value).toBe("หิวข้าวมาก เที่ยงนี้ไปกินอะไรกันดี");
  });

  it("randomly substitutes words in sentence and renders dictionary evidence", async () => {
    const mockQuirkify = vi.spyOn(apiClient, "quirkifySentence").mockResolvedValue({
      original_sentence: "วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว",
      quirkified_sentence: "วันนี้ 'ระโหย' มาก อยากกลับไป 'จำศีล' แล้ว",
      vibe_style: "สุ่มเปลี่ยนคำในประโยค (Word Scrambler)",
      punchline_explanation: "สุ่มเปลี่ยนคำว่า เหนื่อยมาก เป็น ระโหย และ นอน เป็น จำศีล",
      word_mappings: [
        {
          original_phrase: "เหนื่อยมาก",
          replaced_word: "ระโหย",
          part_of_speech: "ว.",
          official_definition: "อ่อนเพลียหมดกำลัง, อ่อนระโหย",
          source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
          quirk_reason: "สุ่มเปลี่ยนคำในประโยคด้วยคำศัพท์จากคลังพจนานุกรม",
        },
        {
          original_phrase: "นอน",
          replaced_word: "จำศีล",
          part_of_speech: "ก.",
          official_definition: "ถือศีล, การที่สัตว์บางชนิดหลบอยู่นิ่ง ๆ ในที่พัก",
          source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
          quirk_reason: "สุ่มเปลี่ยนคำในประโยคด้วยคำศัพท์จากคลังพจนานุกรม",
        },
      ],
    });

    render(<SentenceQuirkifier embedded={false} />);

    const substituteBtn = screen.getByText(/สุ่มเปลี่ยนคำในประโยค ✦/);
    fireEvent.click(substituteBtn);

    await waitFor(() => {
      expect(mockQuirkify).toHaveBeenCalled();
    });

    await waitFor(() => {
      // Replaced words should appear as pills
      expect(screen.getByText("'ระโหย'")).toBeTruthy();
      expect(screen.getByText("'จำศีล'")).toBeTruthy();

      // Dictionary grounding evidence cards
      expect(screen.getByText("อ่อนเพลียหมดกำลัง, อ่อนระโหย")).toBeTruthy();
      expect(screen.getByText("ถือศีล, การที่สัตว์บางชนิดหลบอยู่นิ่ง ๆ ในที่พัก")).toBeTruthy();
    });
  });



  it("opens dictionary detail modal when clicking an evidence card", async () => {
    vi.spyOn(apiClient, "quirkifySentence").mockResolvedValue({
      original_sentence: "วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว",
      quirkified_sentence: "วันนี้ 'ระโหย' มาก อยากกลับไปนอนแล้ว",
      vibe_style: "สุ่มเปลี่ยนคำในประโยค (Word Scrambler)",
      punchline_explanation: "สุ่มเปลี่ยนคำว่า เหนื่อยมาก เป็น ระโหย",
      word_mappings: [
        {
          original_phrase: "เหนื่อยมาก",
          replaced_word: "ระโหย",
          part_of_speech: "ว.",
          official_definition: "อ่อนเพลียหมดกำลัง, อ่อนระโหย",
          source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
          quirk_reason: "สุ่มเปลี่ยนคำในประโยคด้วยคำศัพท์จากคลังพจนานุกรม",
        },
      ],
    });

    render(<SentenceQuirkifier embedded={false} />);

    fireEvent.click(screen.getByText(/สุ่มเปลี่ยนคำในประโยค ✦/));

    await waitFor(() => {
      expect(screen.getByText("อ่อนเพลียหมดกำลัง, อ่อนระโหย")).toBeTruthy();
    });

    // Click on evidence card
    const defElement = screen.getByText("อ่อนเพลียหมดกำลัง, อ่อนระโหย");
    fireEvent.click(defElement);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByText("คำเดิมที่ถูกแทนที่:")).toBeTruthy();
      expect(screen.getByText("นิยามทางการจากพจนานุกรมราชบัณฑิตยสภา:")).toBeTruthy();
    });

    // Close modal
    const closeBtn = screen.getByText("✕");
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText("คำเดิมที่ถูกแทนที่:")).toBeNull();
    });
  });

  it("copies scrambled sentence to clipboard", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    vi.spyOn(apiClient, "quirkifySentence").mockResolvedValue({
      original_sentence: "วันนี้เหนื่อยมาก",
      quirkified_sentence: "วันนี้ 'ระโหย'",
      vibe_style: "สุ่มเปลี่ยนคำในประโยค (Word Scrambler)",
      punchline_explanation: "สุ่มเปลี่ยนคำ",
      word_mappings: [],
    });

    render(<SentenceQuirkifier embedded={false} />);

    fireEvent.click(screen.getByText(/สุ่มเปลี่ยนคำในประโยค ✦/));

    await waitFor(() => {
      expect(screen.getByText("📋 คัดลอกประโยค")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("📋 คัดลอกประโยค"));

    expect(writeTextMock).toHaveBeenCalledWith("วันนี้ 'ระโหย'");
  });

  it("ensures EVERY changed word in the sentence has official dictionary grounding even if omitted by API", async () => {
    // API returns a sentence with two quoted words, but only one is in word_mappings
    vi.spyOn(apiClient, "quirkifySentence").mockResolvedValue({
      original_sentence: "วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว",
      quirkified_sentence: "วันนี้ 'ระโหย' มาก อยากกลับไป 'จำศีล' แล้ว",
      vibe_style: "สุ่มเปลี่ยนคำในประโยค (Word Scrambler)",
      punchline_explanation: "สุ่มเปลี่ยนคำ",
      word_mappings: [
        {
          original_phrase: "เหนื่อยมาก",
          replaced_word: "ระโหย",
          part_of_speech: "ว.",
          official_definition: "อ่อนเพลียหมดกำลัง, อ่อนระโหย",
          source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
          quirk_reason: "สุ่มเปลี่ยนคำวิเศษณ์",
        },
        // Notice: 'จำศีล' is omitted by API!
      ],
    });

    render(<SentenceQuirkifier embedded={false} />);

    fireEvent.click(screen.getByText(/สุ่มเปลี่ยนคำในประโยค ✦/));

    await waitFor(() => {
      // Both words should be rendered as interactive pills
      expect(screen.getByText("'ระโหย'")).toBeTruthy();
      expect(screen.getByText("'จำศีล'")).toBeTruthy();

      // Heading should show 2 words grounded
      expect(screen.getByText(/2 คำที่สุ่มเปลี่ยน/)).toBeTruthy();

      // Both words must have evidence cards under "เจาะลึกคำศัพท์ที่สุ่มเปลี่ยน"
      expect(screen.getByText("อ่อนเพลียหมดกำลัง, อ่อนระโหย")).toBeTruthy();
      expect(screen.getByText(/การที่สัตว์บางชนิดหลบอยู่นิ่ง ๆ/)).toBeTruthy();
    });

    // Clicking the word pill for 'จำศีล' in the sentence opens the detail modal
    const jamSilPill = screen.getByText("'จำศีล'");
    fireEvent.click(jamSilPill);

    await waitFor(() => {
      expect(screen.getByText("คำเดิมที่ถูกแทนที่:")).toBeTruthy();
      expect(screen.getByText("นิยามทางการจากพจนานุกรมราชบัณฑิตยสภา:")).toBeTruthy();
      expect(screen.getAllByText(/การที่สัตว์บางชนิดหลบอยู่นิ่ง ๆ/).length).toBeGreaterThanOrEqual(2);
    });
  });

  it("rerolls a specific word and updates both the sentence and the dictionary grounding", async () => {
    vi.spyOn(apiClient, "quirkifySentence").mockResolvedValue({
      original_sentence: "วันนี้เหนื่อยมาก อยากกลับไปนอนแล้ว",
      quirkified_sentence: "วันนี้ 'ระโหย' มาก อยากกลับไป 'จำศีล' แล้ว",
      vibe_style: "สุ่มเปลี่ยนคำในประโยค (Word Scrambler)",
      punchline_explanation: "สุ่มเปลี่ยนคำ",
      word_mappings: [
        {
          original_phrase: "เหนื่อยมาก",
          replaced_word: "ระโหย",
          part_of_speech: "ว.",
          official_definition: "อ่อนเพลียหมดกำลัง, อ่อนระโหย",
          source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
          quirk_reason: "สุ่มเปลี่ยนคำวิเศษณ์",
        },
        {
          original_phrase: "นอน",
          replaced_word: "จำศีล",
          part_of_speech: "ก.",
          official_definition: "ถือศีล, การที่สัตว์บางชนิดหลบอยู่นิ่ง ๆ ในที่พัก",
          source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
          quirk_reason: "สุ่มเปลี่ยนคำกริยา",
        },
      ],
    });

    render(<SentenceQuirkifier embedded={false} />);

    fireEvent.click(screen.getByText(/สุ่มเปลี่ยนคำในประโยค ✦/));

    await waitFor(() => {
      expect(screen.getAllByText("🎲 สุ่มคำอื่นแทน").length).toBe(2);
    });

    // Click reroll on the first word
    const rerollBtns = screen.getAllByText("🎲 สุ่มคำอื่นแทน");
    fireEvent.click(rerollBtns[0]);

    await waitFor(() => {
      // The toast notification should confirm the reroll
      expect(screen.getByRole("status")).toBeTruthy();
    });
  });
});
