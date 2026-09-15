import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import SentenceQuirkifier from "../src/components/quirkify/SentenceQuirkifier";
import * as apiClient from "../src/lib/api-client";

describe("Word Scrambler & Quirkifier UI Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the 3 master tabs correctly", () => {
    render(<SentenceQuirkifier embedded={false} />);

    expect(
      screen.getByText("ปั่นคำปริศนา (Word Scrambler & Anagram)")
    ).toBeTruthy();
    expect(
      screen.getByText("แปลงให้ปั่น (Sentence Quirkifier)")
    ).toBeTruthy();
    expect(
      screen.getByText("เกลาให้สละสลวย (Make Beautiful)")
    ).toBeTruthy();
  });

  it("renders the Word Scrambler algorithm options and tiles on initial load", () => {
    render(<SentenceQuirkifier embedded={false} />);

    // Check algorithm pills
    expect(screen.getByText(/สลับตัวอักษร \(Anagram Puzzle\)/)).toBeTruthy();
    expect(screen.getByText(/คำผวนสุดฮา \(Thai Spoonerisms\)/)).toBeTruthy();
    expect(screen.getByText(/สลับพยางค์ \(Syllable Shuffle\)/)).toBeTruthy();

    // Check challenge categories
    expect(screen.getByText("🌟 คำทั่วไป")).toBeTruthy();
    expect(screen.getByText("📜 วรรณคดี & วิจิตร")).toBeTruthy();
    expect(screen.getByText("🍜 อาหารการกิน")).toBeTruthy();
    expect(screen.getByText("🔄 คำผวนชวนฮา")).toBeTruthy();
  });

  it("shows hint when clicking 'ดูคำใบ้'", () => {
    render(<SentenceQuirkifier embedded={false} />);

    const hintBtn = screen.getByText("ดูคำใบ้");
    fireEvent.click(hintBtn);

    expect(screen.getByText(/คำใบ้จากพจนานุกรมราชบัณฑิตยสภา/)).toBeTruthy();
  });

  it("allows moving tiles between rack and tray", async () => {
    const { container } = render(<SentenceQuirkifier embedded={false} />);

    // Wait for letter tiles in rack to be rendered
    await waitFor(() => {
      const rackTiles = container.querySelectorAll(".scrambler-tile");
      expect(rackTiles.length).toBeGreaterThan(0);
    });

    const rackTiles = container.querySelectorAll<HTMLButtonElement>(".scrambler-tile");
    const firstTile = rackTiles[0];
    const char = firstTile.textContent?.trim();
    fireEvent.click(firstTile);

    // After clicking, the tile should be in the guess tray
    await waitFor(() => {
      const trayTiles = container.querySelectorAll(".scrambler-tray-tile");
      expect(trayTiles.length).toBe(1);
      expect(trayTiles[0].textContent?.trim()).toBe(char);
    });

    // Click the tray tile to return it to the rack
    const trayTile = container.querySelector<HTMLButtonElement>(".scrambler-tray-tile");
    expect(trayTile).toBeTruthy();
    fireEvent.click(trayTile!);

    await waitFor(() => {
      const trayTiles = container.querySelectorAll(".scrambler-tray-tile");
      expect(trayTiles.length).toBe(0);
    });
  });

  it("switches to Sentence Quirkifier tab and displays presets and styles", () => {
    render(<SentenceQuirkifier embedded={false} />);

    const quirkTab = screen.getByText("แปลงให้ปั่น (Sentence Quirkifier)");
    fireEvent.click(quirkTab);

    expect(screen.getByText("โบราณพงศาวดาร")).toBeTruthy();
    expect(screen.getByText("วิชาการราชการขั้นสุด")).toBeTruthy();
    expect(screen.getByText("สำนวนกวีปั่นประสาท")).toBeTruthy();
    expect(screen.getByText("ภาษาถิ่นสำนวนท้าทาย")).toBeTruthy();
    expect(screen.getByText(/แปลงให้ปั่น \(Quirkify\) ✦/)).toBeTruthy();
  });

  it("switches to Make Beautiful tab and displays poetic and gentle styles", () => {
    render(<SentenceQuirkifier embedded={false} />);

    const beautyTab = screen.getByText("เกลาให้สละสลวย (Make Beautiful)");
    fireEvent.click(beautyTab);

    expect(screen.getByText("วรรณศิลป์ร้อยแก้ว")).toBeTruthy();
    expect(screen.getByText("สุภาพชนชั้นสูง")).toBeTruthy();
    expect(screen.getByText("สุนทรพจน์เฉลิมฉลอง")).toBeTruthy();
    expect(screen.getByText("คมคายลึกซึ้งสงบงาม")).toBeTruthy();
    expect(screen.getByText(/ขัดเกลาให้สละสลวย \(Make Beautiful\) ✦/)).toBeTruthy();
  });

  it("calls quirkifySentence API when clicking transform", async () => {
    const mockQuirkify = vi.spyOn(apiClient, "quirkifySentence").mockResolvedValue({
      original_sentence: "วันนี้เหนื่อยมาก",
      quirkified_sentence: "เพลานี้ ข้าพเจ้ารู้สึก 'โรยรา' ยิ่งนัก",
      vibe_style: "โบราณพงศาวดารราชสำนัก",
      punchline_explanation: "แปลงภาษาพูดให้แลดูเหน็ดเหนื่อยแบบคลาสสิก",
      word_mappings: [
        {
          original_phrase: "เหนื่อยมาก",
          replaced_word: "โรยรา",
          part_of_speech: "ก.",
          official_definition: "หมดแรง, ร่วงโรย, อ่อนเพลีย.",
          source_edition: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
          quirk_reason: "เปลี่ยนภาษาพูดเป็นคำวรรณคดี",
        },
      ],
    });

    render(<SentenceQuirkifier embedded={false} />);

    // Switch to Quirkify tab
    fireEvent.click(screen.getByText("แปลงให้ปั่น (Sentence Quirkifier)"));

    const submitBtn = screen.getByText(/แปลงให้ปั่น \(Quirkify\) ✦/);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockQuirkify).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(/เพลานี้ ข้าพเจ้ารู้สึก/)).toBeTruthy();
      expect(screen.getByText("โรยรา")).toBeTruthy();
      expect(screen.getByText(/แปลงภาษาพูดให้แลดูเหน็ดเหนื่อยแบบคลาสสิก/)).toBeTruthy();
    });
  });
});
