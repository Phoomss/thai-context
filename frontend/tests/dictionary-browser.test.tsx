import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import DictionaryBrowser from "../src/components/dictionary/DictionaryBrowser";
import * as apiClient from "../src/lib/api-client";
import { audioManager } from "../src/lib/audio-manager";

describe("DictionaryBrowser Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders heading, search input, and filter controls", () => {
    render(<DictionaryBrowser initialWord="ประสิทธิภาพ" />);

    expect(
      screen.getByRole("heading", { name: "ค้นหาคำตรงตัวตามเล่มพจนานุกรม" })
    ).toBeTruthy();

    expect(screen.getByLabelText("ค้นหาคำศัพท์ตามแม่คำ")).toBeTruthy();
    expect(screen.getByLabelText("เลือกฉบับพจนานุกรม")).toBeTruthy();
    expect(screen.getByLabelText("เลือกแหล่งข้อมูล")).toBeTruthy();
    expect(
      screen.getByLabelText(/ค้นหาเฉพาะแม่คำที่ตรงกันเป๊ะ/)
    ).toBeTruthy();
  });

  it("displays search results on initial mount from benchmark data", () => {
    render(<DictionaryBrowser initialWord="ประสิทธิภาพ" />);

    expect(screen.getByText(/พบ 3 รายการ/)).toBeTruthy();
    expect(
      screen.getByText(/ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงาน/)
    ).toBeTruthy();
    expect(screen.getAllByText(/พ.ศ. ๒๕๕๔/).length).toBeGreaterThanOrEqual(1);
  });

  it("submits form when searching for a new keyword", async () => {
    const mockSearchFn = vi
      .spyOn(apiClient, "searchDictionaryByKeyword")
      .mockResolvedValue({
        query: "วิจัย",
        total: 1,
        page: 1,
        limit: 20,
        filters: { edition: null, source: null, exact: false },
        results: [
          {
            word: "วิจัย",
            headwordClean: "วิจัย",
            definition: "การค้นคว้าเพื่อหาข้อมูลอย่างถี่ถ้วนตามหลักวิชา",
            partOfSpeech: "ก.",
            source: "สำนักงานราชบัณฑิตยสภา",
            sourceCode: "ROYAL_SOCIETY",
            edition: "2554",
            editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
            editionCode: "ROYAL_2554",
            subjectDomain: null,
            pageNumber: null,
            metadata: null,
          },
        ],
      });

    render(<DictionaryBrowser initialWord="ประสิทธิภาพ" />);

    const input = screen.getByLabelText("ค้นหาคำศัพท์ตามแม่คำ");
    fireEvent.change(input, { target: { value: "วิจัย" } });

    const submitBtn = screen.getByRole("button", { name: "ค้นหาตามเล่ม" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSearchFn).toHaveBeenCalledWith("วิจัย", {
        edition: undefined,
        source: undefined,
        exact: false,
      });
      expect(screen.getByText(/การค้นคว้าเพื่อหาข้อมูลอย่างถี่ถ้วนตามหลักวิชา/)).toBeTruthy();
    });
  });

  it("filters by edition when changing edition dropdown", async () => {
    const mockSearchFn = vi
      .spyOn(apiClient, "searchDictionaryByKeyword")
      .mockResolvedValue({
        query: "ประสิทธิภาพ",
        total: 1,
        page: 1,
        limit: 20,
        filters: { edition: "2542", source: null, exact: false },
        results: [
          {
            word: "ประสิทธิภาพ",
            headwordClean: "ประสิทธิภาพ",
            definition: "ความสามารถที่ทำให้เกิดผลในการทำงาน",
            partOfSpeech: "น.",
            source: "สำนักงานราชบัณฑิตยสภา",
            sourceCode: "ROYAL_SOCIETY",
            edition: "2542",
            editionTitle: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๔๒",
            editionCode: "ROYAL_2542",
            subjectDomain: null,
            pageNumber: null,
            metadata: null,
          },
        ],
      });

    render(<DictionaryBrowser initialWord="ประสิทธิภาพ" />);

    const editionSelect = screen.getByLabelText("เลือกฉบับพจนานุกรม");
    fireEvent.change(editionSelect, { target: { value: "2542" } });

    await waitFor(() => {
      expect(mockSearchFn).toHaveBeenCalledWith("ประสิทธิภาพ", {
        edition: "2542",
        source: undefined,
        exact: false,
      });
      expect(screen.getByText(/ความสามารถที่ทำให้เกิดผลในการทำงาน/)).toBeTruthy();
    });
  });

  it("triggers exact match when checkbox is toggled", async () => {
    const mockSearchFn = vi
      .spyOn(apiClient, "searchDictionaryByKeyword")
      .mockResolvedValue({
        query: "สมานฉันท์",
        total: 1,
        page: 1,
        limit: 20,
        filters: { edition: null, source: null, exact: true },
        results: [],
      });

    render(<DictionaryBrowser initialWord="สมานฉันท์" />);

    const exactCheckbox = screen.getByLabelText(/ค้นหาเฉพาะแม่คำที่ตรงกันเป๊ะ/);
    fireEvent.click(exactCheckbox);

    await waitFor(() => {
      expect(mockSearchFn).toHaveBeenCalledWith("สมานฉันท์", {
        edition: undefined,
        source: undefined,
        exact: true,
      });
    });
  });

  it("triggers quick-search chips when clicked", async () => {
    const mockSearchFn = vi
      .spyOn(apiClient, "searchDictionaryByKeyword")
      .mockResolvedValue({
        query: "นวัตกรรม",
        total: 1,
        page: 1,
        limit: 20,
        filters: { edition: null, source: null, exact: false },
        results: [],
      });

    render(<DictionaryBrowser initialWord="ประสิทธิภาพ" />);

    const chip = screen.getByRole("button", { name: "นวัตกรรม" });
    fireEvent.click(chip);

    await waitFor(() => {
      expect(mockSearchFn).toHaveBeenCalledWith("นวัตกรรม", {
        edition: undefined,
        source: undefined,
        exact: false,
      });
    });
  });

  it("invokes audio pronunciation when audio button is clicked", async () => {
    const toggleSpy = vi.spyOn(audioManager, "toggle").mockImplementation(() => Promise.resolve());

    render(<DictionaryBrowser initialWord="ประสิทธิภาพ" />);

    const audioBtns = screen.getAllByLabelText(/ฟังเสียงคำว่า ประสิทธิภาพ/);
    expect(audioBtns.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(audioBtns[0]);
    expect(toggleSpy).toHaveBeenCalledWith(expect.objectContaining({ headword: "ประสิทธิภาพ" }));
  });
});
