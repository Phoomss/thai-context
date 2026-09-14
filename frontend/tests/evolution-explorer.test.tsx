import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import EvolutionExplorer from "../src/components/evolution/EvolutionExplorer";
import { audioManager } from "../src/lib/audio-manager";

describe("EvolutionExplorer Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders heading, word title, and 3 era tabs by default", () => {
    render(<EvolutionExplorer word="ประสิทธิภาพ" />);

    expect(screen.getByRole("heading", { name: "วิวัฒนาการคำศัพท์ตามยุคสมัย" })).toBeTruthy();
    expect(screen.getByText(/สำรวจสถานะของ “ประสิทธิภาพ”/)).toBeTruthy();

    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThanOrEqual(3);

    expect(screen.getByRole("tab", { name: /๒๕๔๒/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /๒๕๕๔/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /๒๕๖๙/ })).toBeTruthy();
  });

  it("switches tabs and displays definitions for each era", () => {
    render(<EvolutionExplorer word="ประสิทธิภาพ" />);

    // Click 2542 tab
    fireEvent.click(screen.getByRole("tab", { name: /๒๕๔๒/ }));
    expect(screen.getByRole("tab", { name: /๒๕๔๒/ }).getAttribute("aria-selected")).toBe("true");
    expect(document.querySelector(".era-status")?.textContent).toContain("บันทึกในฉบับ ๒๕๔๒");
    expect(screen.getAllByText(/ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการทำงาน/)[0]).toBeTruthy();

    // Click 2569 tab
    fireEvent.click(screen.getByRole("tab", { name: /๒๕๖๙/ }));
    expect(screen.getByRole("tab", { name: /๒๕๖๙/ }).getAttribute("aria-selected")).toBe("true");
    expect(document.querySelector(".era-status")?.textContent).toContain("MODIFIED");
    expect(screen.getAllByText(/ความสามารถในการปฏิบัติการที่ให้ผลลัพธ์สูงสุด/)[0]).toBeTruthy();
  });

  it("allows switching words via quick-pick chips", () => {
    render(<EvolutionExplorer word="ประสิทธิภาพ" />);

    const chip = screen.getByRole("button", { name: "สมานฉันท์" });
    expect(chip).toBeTruthy();

    fireEvent.click(chip);
    expect(screen.getByText(/สำรวจสถานะของ “สมานฉันท์”/)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "สมานฉันท์" })).toBeTruthy();

    // In 2542, definition contains ความพอใจร่วมกัน
    fireEvent.click(screen.getByRole("tab", { name: /๒๕๔๒/ }));
    expect(screen.getAllByText(/ความพอใจร่วมกัน/)[0]).toBeTruthy();

    // In 2569, definition contains ความร่วมมือร่วมใจ
    fireEvent.click(screen.getByRole("tab", { name: /๒๕๖๙/ }));
    expect(screen.getAllByText(/ความร่วมมือร่วมใจเพื่อประโยชน์ส่วนรวม/)[0]).toBeTruthy();
  });

  it("supports searching custom words in the search box", () => {
    render(<EvolutionExplorer word="ประสิทธิภาพ" />);

    const input = screen.getByPlaceholderText("พิมพ์คำที่ต้องการสำรวจ...");
    fireEvent.change(input, { target: { value: "กระตือรือร้น" } });
    fireEvent.click(screen.getByRole("button", { name: "ค้นหา" }));

    expect(screen.getByRole("heading", { name: "กระตือรือร้น" })).toBeTruthy();
  });

  it("triggers audio pronunciation when clicking the audio button", () => {
    const toggleSpy = vi.spyOn(audioManager, "toggle").mockImplementation(() => Promise.resolve());
    render(<EvolutionExplorer word="ประสิทธิภาพ" />);

    const audioBtn = screen.getByLabelText("ฟังเสียงอ่านคำว่า ประสิทธิภาพ");
    expect(audioBtn).toBeTruthy();

    fireEvent.click(audioBtn);
    expect(toggleSpy).toHaveBeenCalledWith(expect.objectContaining({ headword: "ประสิทธิภาพ" }));
  });

  it("supports keyboard navigation across era tabs", () => {
    render(<EvolutionExplorer word="ประสิทธิภาพ" />);

    const tab0 = screen.getByRole("tab", { name: /๒๕๔๒/ });
    const tab1 = screen.getByRole("tab", { name: /๒๕๕๔/ });

    fireEvent.click(tab0);
    expect(tab0.getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(tab0, { key: "ArrowRight" });
    expect(tab1.getAttribute("aria-selected")).toBe("true");
  });
});
