import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import EvidenceDrawer from "../src/components/evidence/EvidenceDrawer";
import WordResultCard from "../src/components/search/WordResultCard";
import SmartFilters from "../src/components/search/SmartFilters";
import ContextComparator from "../src/components/compare/ContextComparator";
import type { Recommendation } from "../src/lib/search-types";

describe("Product Excellence Enhancements", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  describe("1. One-Click Academic Citation in EvidenceDrawer", () => {
    const mockWord: Recommendation = {
      headword: "ประสิทธิภาพ",
      definition: "ความสามารถในการทำงานให้ได้ผลคุ้มค่า",
      evidence: {
        source_book: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
        edition: "ฉบับพิมพ์ครั้งที่ ๔",
        edition_year: 2554,
        page_number: 734,
        quote: "ความสามารถในการทำงานให้ได้ผล โดยใช้เวลาและทรัพยากรอย่างคุ้มค่า",
        is_official: true,
      },
    };

    it("renders APA / Royal Society academic citation box and copy button", () => {
      render(
        <EvidenceDrawer
          word={mockWord}
          isDemo={false}
          onClose={vi.fn()}
        />
      );

      expect(
        screen.getByText(/การอ้างอิงทางวิชาการ \(APA \/ มาตรฐานราชบัณฑิตยสภา\)/)
      ).toBeTruthy();

      expect(
        screen.getByText(/สำนักงานราชบัณฑิตยสภา\. \(๒๕๕๔\)\. พจนานุกรม ฉบับราชบัณฑิตยสถาน/)
      ).toBeTruthy();

      const copyBtn = screen.getByRole("button", { name: /คัดลอกการอ้างอิง/ });
      expect(copyBtn).toBeTruthy();

      // Click copy button
      fireEvent.click(copyBtn);
      expect(screen.getByText(/คัดลอกการอ้างอิงแล้ว ✓/)).toBeTruthy();
    });
  });

  describe("2. In-Sentence Word Swap and 1-Click Copy in WordResultCard", () => {
    const mockWord: Recommendation = {
      headword: "ประสิทธิผล",
      definition: "ผลสำเร็จที่เกิดขึ้นตามเป้าหมายที่ตั้งไว้",
      score: 0.92,
      pos: "น.",
      comparison: {
        emphasis: "ผลสำเร็จตามเป้าหมาย",
        use_when: "เมื่อต้องการเน้นผลลัพธ์สุดท้าย",
        example: "โครงการนี้ก่อให้เกิดประสิทธิผลในการพัฒนาชุมชนอย่างยั่งยืน",
        common_confusion: "มักสับสนกับประสิทธิภาพ",
      },
    };

    it("renders copy word button and in-sentence word swap box", () => {
      render(
        <WordResultCard
          word={mockWord}
          index={0}
          revision={1}
          loading={false}
          selected={false}
          onEvidence={vi.fn()}
          onCompare={vi.fn()}
        />
      );

      // 1. Copy word button
      const copyWordBtn = screen.getByRole("button", {
        name: "คัดลอกคำว่า ประสิทธิผล",
      });
      expect(copyWordBtn).toBeTruthy();
      fireEvent.click(copyWordBtn);
      expect(screen.getByText("คัดลอกแล้ว ✓")).toBeTruthy();

      // 2. In-Sentence Word Swap Box
      expect(screen.getByText(/ตัวอย่างการใช้จริงในประโยค/)).toBeTruthy();
      expect(
        screen.getByText(/โครงการนี้ก่อให้เกิดประสิทธิผลในการพัฒนาชุมชนอย่างยั่งยืน/)
      ).toBeTruthy();

      // 3. Copy sentence button
      const copySentenceBtn = screen.getByRole("button", {
        name: /คัดลอกประโยค/,
      });
      expect(copySentenceBtn).toBeTruthy();
      fireEvent.click(copySentenceBtn);
      expect(screen.getByText(/คัดลอกประโยคแล้ว ✓/)).toBeTruthy();
    });
  });

  describe("3. Quick Register Switcher Pills in SmartFilters", () => {
    it("renders horizontal register pills and triggers onChange on click", () => {
      const onChange = vi.fn();
      render(
        <SmartFilters
          registers={["ทางการ", "กึ่งทางการ", "ภาษาปาก"]}
          contexts={["การทำงาน", "วิชาการ"]}
          value={{ register: "", context: "", excluded: "" }}
          disabled={false}
          onChange={onChange}
        />
      );

      expect(screen.getByText("เลือกระดับภาษาด่วน:")).toBeTruthy();
      expect(screen.getByRole("button", { name: "🌐 ทั้งหมด" })).toBeTruthy();
      expect(
        screen.getByRole("button", { name: "🏛️ ทางการ (Official)" })
      ).toBeTruthy();
      expect(
        screen.getByRole("button", { name: "💼 ธุรกิจ / กึ่งทางการ" })
      ).toBeTruthy();

      // Click "ทางการ" pill
      fireEvent.click(
        screen.getByRole("button", { name: "🏛️ ทางการ (Official)" })
      );
      expect(onChange).toHaveBeenCalledWith({
        register: "ทางการ",
        context: "",
        excluded: "",
      });
    });

    it("renders active filter tags and allows removing individual filters", () => {
      const onChange = vi.fn();
      render(
        <SmartFilters
          registers={["ทางการ", "กึ่งทางการ"]}
          contexts={["การทำงาน"]}
          value={{ register: "ทางการ", context: "การทำงาน", excluded: "เก่ง" }}
          disabled={false}
          onChange={onChange}
        />
      );

      // Header shows active count badge and reset button
      expect(screen.getByText(/กำลังกรอง 3 เงื่อนไข/)).toBeTruthy();
      expect(screen.getByRole("button", { name: /ล้างตัวกรอง/ })).toBeTruthy();

      // Active filter tags rendered
      expect(screen.getByText("ตัวกรองที่เลือกไว้:")).toBeTruthy();
      const removeRegisterBtn = screen.getByRole("button", {
        name: "ลบตัวกรองระดับภาษา",
      });
      expect(removeRegisterBtn).toBeTruthy();
      fireEvent.click(removeRegisterBtn);
      expect(onChange).toHaveBeenCalledWith({
        register: "",
        context: "การทำงาน",
        excluded: "เก่ง",
      });

      // Clear excluded button in input
      const clearExcludedBtn = screen.getByRole("button", {
        name: "ล้างคำที่ไม่ต้องการใช้",
      });
      expect(clearExcludedBtn).toBeTruthy();
      fireEvent.click(clearExcludedBtn);
      expect(onChange).toHaveBeenCalledWith({
        register: "ทางการ",
        context: "การทำงาน",
        excluded: "",
      });
    });
  });

  describe("4. Nuance Delta Summary in ContextComparator", () => {
    const mockWords: Recommendation[] = [
      {
        headword: "ประสิทธิภาพ",
        definition: "ความสามารถในการทำงานให้ได้ผลคุ้มค่า",
        comparison: {
          emphasis: "กระบวนการประหยัดทรัพยากรและเวลา",
          use_when: "เมื่อพูดถึงวิธีการทำงาน",
          example: "เพิ่มประสิทธิภาพการทำงาน",
          common_confusion: "ประสิทธิผล",
        },
      },
      {
        headword: "ประสิทธิผล",
        definition: "ผลสำเร็จที่เกิดขึ้นตามเป้าหมาย",
        comparison: {
          emphasis: "การบรรลุเป้าหมายที่กำหนดไว้",
          use_when: "เมื่อพูดถึงผลลัพธ์สุดท้าย",
          example: "ประเมินประสิทธิผลของโครงการ",
          common_confusion: "ประสิทธิภาพ",
        },
      },
    ];

    it("renders Nuance Delta Summary banner explaining differences between 2 words", () => {
      render(
        <ContextComparator
          words={mockWords}
          selected={["ประสิทธิภาพ", "ประสิทธิผล"]}
          onSelect={vi.fn()}
          onEvidence={vi.fn()}
        />
      );

      expect(
        screen.getByRole("complementary", { name: "สรุปจุดต่างสำคัญ" })
      ).toBeTruthy();
      expect(screen.getByText("สรุปจุดต่างสำคัญ (Nuance Delta):")).toBeTruthy();
      expect(
        screen.getByText(/เน้นกระบวนการประหยัดทรัพยากรและเวลา/)
      ).toBeTruthy();
      expect(
        screen.getByText(/เน้นการบรรลุเป้าหมายที่กำหนดไว้/)
      ).toBeTruthy();
    });
  });
});
