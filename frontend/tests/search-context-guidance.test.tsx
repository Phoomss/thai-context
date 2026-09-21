import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import WordResultCard from "../src/components/search/WordResultCard";
import ParsedIntent from "../src/components/search/ParsedIntent";
import { mockSearch } from "../src/lib/mock-search";

describe("Search Context Guidance & Sentence Pattern Feature", () => {
  it("renders sentence pattern, when-to-use, and common confusion on WordResultCard", () => {
    const searchRes = mockSearch("ทำงานได้ผลดีโดยใช้ทรัพยากรน้อย");
    const rec = searchRes.recommendations[0]; // ประสิทธิภาพ

    expect(rec).toBeDefined();
    expect(rec.comparison?.sentence_pattern).toBeDefined();

    render(
      <WordResultCard
        word={rec}
        index={0}
        revision={1}
        loading={false}
        selected={false}
        onEvidence={() => {}}
        onCompare={() => {}}
      />
    );

    // Check sentence pattern section
    expect(screen.getByText(/รูปแบบโครงสร้างประโยค/i)).toBeTruthy();
    expect(screen.getByText(/มุ่งเน้นการเสริมสร้าง/i)).toBeTruthy();

    // Check context guidance
    expect(screen.getByText(/เหมาะกับ:/i)).toBeTruthy();
    expect(screen.getByText(/กระบวนการทำงานที่ได้ผลดี/i)).toBeTruthy();

    // Check watch-out / common confusion
    expect(screen.getByText(/มักสับสนกับ 'ประสิทธิผล'/i)).toBeTruthy();
  });

  it("renders contextual disambiguation guidance box in ParsedIntent when multiple related words exist", () => {
    const searchRes = mockSearch("ทำงาน");
    // "ทำงาน" returns ประสิทธิภาพ, ประสิทธิผล, สัมฤทธิผล

    render(
      <ParsedIntent
        result={searchRes}
        query="ทำงาน"
        loading={false}
      />
    );

    expect(screen.getByText(/คำแนะนำแยกแยะบริบท เพื่อเลือกคำให้ตรงกับสิ่งที่คุณต้องการสื่อ/i)).toBeTruthy();
    expect(screen.getAllByText(/ประสิทธิภาพ/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ประสิทธิผล/i).length).toBeGreaterThanOrEqual(1);
  });
});
