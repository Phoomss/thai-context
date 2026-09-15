import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContextComparator from "@/components/compare/ContextComparator";
import { compareWords } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({ compareWords: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const recommendations = ["คำหนึ่ง", "คำสอง", "คำสาม", "คำสี่", "คำห้า"].map((headword) => ({
  headword,
  definition: `ผลค้นหาเดิมของ${headword}`,
}));

describe("ContextComparator", () => {
  it("submits three selected words and renders only the real API result", async () => {
    vi.mocked(compareWords).mockResolvedValue({
      words: recommendations.slice(0, 3).map((word) => ({
        headword: word.headword,
        definition: `นิยาม API ของ${word.headword}`,
        edition: "2554",
      })),
      comparison: {
        meaningDifference: "ความหมายจาก API",
        contextDifference: "บริบทจาก API",
        usageGuidance: "คำแนะนำจาก API",
      },
      evidence: [{
        word: "คำหนึ่ง",
        source: "สำนักงานราชบัณฑิตยสภา",
        edition: "2554",
        definition: "นิยาม API ของคำหนึ่ง",
        relevance: 1,
      }],
    });

    render(
      <ContextComparator
        words={recommendations}
        selected={["คำหนึ่ง", "คำสอง", "คำสาม"]}
        onSelect={vi.fn()}
        onEvidence={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "เปรียบเทียบคำ" }));

    await waitFor(() => expect(compareWords).toHaveBeenCalledWith(
      ["คำหนึ่ง", "คำสอง", "คำสาม"],
      expect.any(AbortSignal),
    ));
    expect(await screen.findByText("ความหมายจาก API")).toBeTruthy();
    expect(screen.getByText("นิยาม API ของคำสาม")).toBeTruthy();
    expect(screen.queryByText("ผลค้นหาเดิมของคำหนึ่ง")).toBeNull();
    expect(screen.getByText("หลักฐานอ้างอิงจาก API")).toBeTruthy();
  });

  it("uses matching live search metadata when compare returns dictionary sentinels", async () => {
    vi.mocked(compareWords).mockResolvedValue({
      words: [
        { headword: "คำหนึ่ง", definition: "ไม่มีข้อมูลในพจนานุกรมทางการ", partOfSpeech: "ไม่ระบุ" },
        { headword: "คำสอง", definition: "นิยามจาก Compare API", partOfSpeech: "น." },
      ],
      comparison: {
        meaningDifference: "ความต่างจาก API",
        contextDifference: "บริบทจาก API",
        usageGuidance: "คำแนะนำจาก API",
      },
      evidence: [],
    });

    render(
      <ContextComparator
        words={recommendations.map((word) => ({ ...word, pos: "ก." }))}
        selected={["คำหนึ่ง", "คำสอง"]}
        sourceMode="live"
        onSelect={vi.fn()}
        onEvidence={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "เปรียบเทียบคำ" }));

    expect(await screen.findByText("ผลค้นหาเดิมของคำหนึ่ง")).toBeTruthy();
    expect(screen.getByText("ก.")).toBeTruthy();
    expect(screen.queryByText("ไม่มีข้อมูลในพจนานุกรมทางการ")).toBeNull();
    expect(screen.queryByText("ไม่ระบุ")).toBeNull();
    expect(screen.getByText("นิยามจาก Compare API")).toBeTruthy();
  });

  it("does not use fallback search metadata as official comparison data", async () => {
    vi.mocked(compareWords).mockResolvedValue({
      words: [
        { headword: "คำหนึ่ง", definition: "ไม่มีข้อมูลในพจนานุกรมทางการ", partOfSpeech: "ไม่ระบุ" },
        { headword: "คำสอง", definition: "นิยามจาก Compare API" },
      ],
      comparison: {
        meaningDifference: "ความต่างจาก API",
        contextDifference: "บริบทจาก API",
        usageGuidance: "คำแนะนำจาก API",
      },
      evidence: [],
    });

    render(
      <ContextComparator
        words={recommendations.map((word) => ({ ...word, pos: "ก." }))}
        selected={["คำหนึ่ง", "คำสอง"]}
        sourceMode="fallback"
        onSelect={vi.fn()}
        onEvidence={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "เปรียบเทียบคำ" }));

    expect(await screen.findByText("ไม่มีข้อมูลในพจนานุกรมทางการ")).toBeTruthy();
    expect(screen.queryByText("ไม่ระบุ")).toBeNull();
    expect(screen.queryByText("ผลค้นหาเดิมของคำหนึ่ง")).toBeNull();
  });

  it("blocks duplicate words without calling the API", async () => {
    render(
      <ContextComparator words={[]} selected={[]} onSelect={vi.fn()} onEvidence={vi.fn()} />,
    );
    fireEvent.change(screen.getByRole("combobox", { name: "คำที่ 1" }), { target: { value: "ดี" } });
    fireEvent.change(screen.getByRole("combobox", { name: "คำที่ 2" }), { target: { value: " ดี " } });
    fireEvent.click(screen.getByRole("button", { name: "เปรียบเทียบคำ" }));
    expect((await screen.findByRole("alert")).textContent).toContain("กรุณาเลือกคำที่ไม่ซ้ำกัน");
    expect(compareWords).not.toHaveBeenCalled();
  });

  it("supports adding inputs up to the five-word boundary", () => {
    render(
      <ContextComparator words={[]} selected={[]} onSelect={vi.fn()} onEvidence={vi.fn()} />,
    );
    const add = () => fireEvent.click(screen.getByRole("button", { name: "+ เพิ่มคำ" }));
    add(); add(); add();
    expect(screen.getAllByRole("combobox")).toHaveLength(5);
    expect(screen.queryByRole("button", { name: "+ เพิ่มคำ" })).toBeNull();
  });

  it("does not render a stale response after the inputs change", async () => {
    let resolveRequest!: (value: Awaited<ReturnType<typeof compareWords>>) => void;
    vi.mocked(compareWords).mockReturnValue(new Promise((resolve) => { resolveRequest = resolve; }));
    render(
      <ContextComparator
        words={recommendations}
        selected={["คำหนึ่ง", "คำสอง"]}
        onSelect={vi.fn()}
        onEvidence={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "เปรียบเทียบคำ" }));
    fireEvent.change(screen.getByRole("combobox", { name: "คำที่ 2" }), { target: { value: "คำสาม" } });
    resolveRequest({
      words: [{ headword: "คำหนึ่ง", definition: "ผลเก่า" }, { headword: "คำสอง", definition: "ผลเก่า" }],
      comparison: { meaningDifference: "ผลเก่า", contextDifference: "ผลเก่า", usageGuidance: "ผลเก่า" },
      evidence: [],
    });

    await waitFor(() => expect(
      (screen.getByRole("button", { name: "เปรียบเทียบคำ" }) as HTMLButtonElement).disabled,
    ).toBe(false));
    expect(screen.queryByText("ผลเก่า")).toBeNull();
  });
});
