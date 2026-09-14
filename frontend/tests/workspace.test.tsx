import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import WorkspaceView from "../src/components/workspace/WorkspaceView";
import * as apiClient from "../src/lib/api-client";
import type { WorkspaceResponsePayload } from "../src/lib/workspace-types";

describe("WorkspaceView Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders workspace banner, context pills, and preset buttons", () => {
    render(<WorkspaceView />);

    expect(screen.getByText("THAI CONTEXT Workspace")).toBeTruthy();
    expect(screen.getByText(/ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน/)).toBeTruthy();
    expect(screen.getByText("🎓 วิชาการ")).toBeTruthy();
    expect(screen.getByText("💼 ธุรกิจ")).toBeTruthy();
    expect(screen.getByText("🏛️ ราชการ")).toBeTruthy();
    expect(screen.getByText("💬 สนทนา")).toBeTruthy();

    // Preset buttons
    expect(screen.getByText("🚀 ค้นหาคำจากเจตนา")).toBeTruthy();
    expect(screen.getByText("⚖️ เปรียบเทียบเฉดคำ")).toBeTruthy();
    expect(screen.getByText("✍️ แต่งประโยควิชาการ")).toBeTruthy();
  });

  it("triggers query execution and renders result card and agent pipeline", async () => {
    const mockResponse: WorkspaceResponsePayload = {
      session_id: "test-session-123",
      intent: "WORD_DISCOVERY",
      tasks: ["CONTEXT_ANALYSIS", "WORD_DISCOVERY"],
      answer: "พบคลังคำศัพท์และหลักฐานจากพจนานุกรมทางการ",
      context: {
        type: "academic",
        tone: "formal",
        audience: "คณะกรรมการวิชาการ",
        source: "AI_INFERRED",
      },
      recommendations: [
        {
          word: "ประสิทธิภาพ",
          score: 0.94,
          pos: "น.",
          definition: "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด",
          reason: "ตรงกับความต้องการสื่อถึงความคุ้มค่า",
          source: "สำนักงานราชบัณฑิตยสภา",
          edition: "2554",
          evidence: [
            {
              source_book: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
              edition: "ฉบับพิมพ์ครั้งที่ ๔",
              edition_year: 2554,
              page_number: 734,
              quote: "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงาน",
              is_official: true,
            },
          ],
        },
      ],
      comparison: {
        wordA: "ประสิทธิภาพ",
        wordB: "ประสิทธิผล",
        details: {
          ประสิทธิภาพ: {
            meaning: "เน้นวิธีการและความคุ้มค่า",
            emphasis: "Input vs Output",
            use_when: "กระบวนการประหยัด",
            example: "เพิ่มประสิทธิภาพการทำงาน",
          },
          ประสิทธิผล: {
            meaning: "เน้นผลลัพธ์ปลายทาง",
            emphasis: "Goal Attainment",
            use_when: "การบรรลุเป้าหมาย",
            example: "เกิดประสิทธิผลตามเป้าหมาย",
          },
        },
        difference_summary: "ประสิทธิภาพเน้นวิธี ประสิทธิผลเน้นเป้าหมาย",
        guidance: "ควรใช้ประสิทธิภาพเมื่อเน้นลดเวลา",
        evidence: [],
      },
      generated_content: [
        {
          type: "sentence",
          content: "การประยุกต์ใช้อัลกอริทึมใหม่ช่วยเพิ่มประสิทธิภาพในการประมวลผล",
          register: "academic",
          notes: "เน้นความคุ้มค่าของการใช้ทรัพยากร",
        },
      ],
      language_check: {
        score: 95,
        status: "OPTIMAL",
        issues: [],
        summary: "โครงสร้างประโยคถูกต้องและสละสลวย",
      },
      language_bridge: null,
      evidence: [
        {
          source_book: "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔",
          edition: "ฉบับพิมพ์ครั้งที่ ๔",
          edition_year: 2554,
          page_number: 734,
          quote: "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงาน",
          is_official: true,
        },
      ],
      confidence: 0.94,
      confidence_level: "HIGH",
      abstained: false,
      agent_traces: [
        {
          agent: "ContextAgent",
          status: "completed",
          summary: "วิเคราะห์บริบท: academic (formal)",
          duration_ms: 10,
        },
        {
          agent: "WordDiscoveryAgent",
          status: "completed",
          summary: "ค้นพบคำแนะนำ 1 คำ: ประสิทธิภาพ",
          duration_ms: 20,
        },
      ],
    };

    const executeSpy = vi
      .spyOn(apiClient, "executeWorkspace")
      .mockResolvedValue(mockResponse);

    render(<WorkspaceView />);

    const sendBtn = screen.getByText("ประมวลผล Workspace");
    const textarea = screen.getByPlaceholderText(/พิมพ์เจตนาที่ต้องการ/);

    fireEvent.change(textarea, {
      target: { value: "หาคำที่หมายถึงทำงานได้ดีและใช้ทรัพยากรน้อย" },
    });

    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(executeSpy).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      // Pipeline status rendered
      expect(screen.getByText("AI Sub-Agent Orchestration Pipeline")).toBeTruthy();
      // Recommendations rendered
      expect(screen.getAllByText("ประสิทธิภาพ").length).toBeGreaterThan(0);
      // Comparison rendered
      expect(screen.getByText("ประสิทธิภาพเน้นวิธี ประสิทธิผลเน้นเป้าหมาย")).toBeTruthy();
      // Generated sentence rendered
      expect(screen.getByText(/การประยุกต์ใช้อัลกอริทึมใหม่ช่วยเพิ่มประสิทธิภาพ/)).toBeTruthy();
      // Language check rendered
      expect(screen.getByText("คะแนน: 95/100")).toBeTruthy();
      // Next actions rendered
      expect(screen.getByText("✂️ ทำให้สั้นลง")).toBeTruthy();
    });
  });

  it("handles one-click preset buttons and updates prompt", async () => {
    const executeSpy = vi
      .spyOn(apiClient, "executeWorkspace")
      .mockResolvedValue({
        session_id: "test-preset-session",
        intent: "WORD_DISCOVERY",
        tasks: ["CONTEXT_ANALYSIS", "WORD_DISCOVERY"],
        answer: "ผลลัพธ์คำค้น",
        context: {
          type: "academic",
          tone: "formal",
          audience: "ทั่วไป",
          source: "AI_INFERRED",
        },
        recommendations: [],
        comparison: null,
        generated_content: [],
        language_check: null,
        language_bridge: null,
        evidence: [],
        confidence: 0.9,
        confidence_level: "HIGH",
        abstained: false,
        agent_traces: [],
      });

    render(<WorkspaceView />);

    const presetBtn = screen.getByText("🚀 ค้นหาคำจากเจตนา");
    fireEvent.click(presetBtn);

    await waitFor(() => {
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "หาคำที่หมายถึงทำงานได้ดีและใช้ทรัพยากรน้อย",
        })
      );
    });
  });

  it("renders abstention alert when hallucination guard triggers", async () => {
    vi.spyOn(apiClient, "executeWorkspace").mockResolvedValue({
      session_id: "test-abstain",
      intent: "ABSTAIN",
      tasks: [],
      answer: "ขออภัย ไม่พบข้อมูล",
      context: {
        type: "general",
        tone: "neutral",
        audience: "ทั่วไป",
        source: "AI_INFERRED",
      },
      recommendations: [],
      comparison: null,
      generated_content: [],
      language_check: null,
      language_bridge: null,
      evidence: [],
      confidence: 0.15,
      confidence_level: "LOW",
      abstained: true,
      abstention_reason: "ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลพจนานุกรมที่ระบบรองรับ",
      agent_traces: [
        {
          agent: "HallucinationGuard",
          status: "completed",
          summary: "ระงับการตอบเนื่องจากไม่พบหลักฐาน",
        },
      ],
    });

    render(<WorkspaceView />);

    const textarea = screen.getByPlaceholderText(/พิมพ์เจตนาที่ต้องการ/);
    fireEvent.change(textarea, { target: { value: "คำที่ไม่มีในโลก" } });
    fireEvent.click(screen.getByText("ประมวลผล Workspace"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
      expect(
        screen.getByText("ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลพจนานุกรมที่ระบบรองรับ")
      ).toBeTruthy();
      expect(screen.getByText(/LOW \(15%\)/)).toBeTruthy();
    });
  });
});
