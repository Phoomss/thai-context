import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import AIAssistantDrawer from "@/components/ai/AIAssistantDrawer";

describe("Task: AI Agent Workspace (ผู้ช่วย AI ภาษาไทย as an AI Agent)", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders multi-agent persona tabs and agent role selector", () => {
    render(
      <AIAssistantDrawer
        isOpen={true}
        initialWord="ประสิทธิภาพ"
        initialContext="รายงานวิชาการ"
        onClose={vi.fn()}
      />
    );

    // Header identity
    expect(screen.getByText("✨ ผู้ช่วย AI ภาษาไทย")).toBeTruthy();
    expect(screen.getByText("🤖 AI Agent Workspace")).toBeTruthy();
    expect(
      screen.getByText(
        "ระบบตัวแทนอัจฉริยะแบบมัลติเอเจนต์ (Multi-Agent System) พร้อมทำงานอัตโนมัติ ไม่ใช่แค่วิเคราะห์คำ"
      )
    ).toBeTruthy();

    // Persona tabs
    expect(screen.getByRole("tab", { name: /ตัวแทนอัตโนมัติ/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /ร่างและเขียน/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /ขัดเกลาสำนวน/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /วิจัยเปรียบเทียบคำ/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /ค้นหาคำจากความคิด/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /ตรวจทานหลักภาษา/ })).toBeTruthy();
  });

  it("switches agent persona and updates placeholder and mission prompts", () => {
    render(
      <AIAssistantDrawer
        isOpen={true}
        initialWord=""
        initialContext="รายงานวิชาการ"
        onClose={vi.fn()}
      />
    );

    // Switch to Writing Agent tab
    const writingTab = screen.getByRole("tab", { name: /ร่างและเขียน/ });
    fireEvent.click(writingTab);
    expect(writingTab.getAttribute("aria-selected")).toBe("true");

    // Check textarea placeholder update
    const textarea = screen.getByPlaceholderText(
      /สั่งให้ Writing Agent ร่างข้อความ/
    );
    expect(textarea).toBeTruthy();

    // Check mission prompts for Writing Agent
    expect(
      screen.getByText(/ช่วยร่างอีเมลขอความอนุเคราะห์เข้าศึกษาดูงานอย่างเป็นทางการ/)
    ).toBeTruthy();
    expect(
      screen.getByText(/ร่างบทคัดย่อเกริ่นนำโครงการวิจัยเกี่ยวกับการเพิ่มประสิทธิภาพ/)
    ).toBeTruthy();
  });

  it("displays agent execution pipeline traces and interactive artifact toolbar on response", async () => {
    const sseChunks = [
      'event: trace\ndata: [{"agent": "ContextAgent", "status": "completed", "summary": "วิเคราะห์บริบท"}, {"agent": "WritingAgent", "status": "completed", "summary": "สร้างร่างอีเมลสำเร็จ"}]\n\n',
      'event: token\ndata: {"token": "🤖 **[ตัวแทนอัจฉริยะ: WritingAgent]**\\nเรียน ท่านผู้บริหาร"}\n\n',
      'event: complete\ndata: {"confidence": 0.98, "grounded": true, "agent": "WritingAgent"}\n\n',
    ];

    const encoder = new TextEncoder();
    let chunkIndex = 0;

    const mockReadableStream = new ReadableStream({
      pull(controller) {
        if (chunkIndex < sseChunks.length) {
          controller.enqueue(encoder.encode(sseChunks[chunkIndex++]));
        } else {
          controller.close();
        }
      },
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "Content-Type": "text/event-stream" }),
      body: mockReadableStream,
    });

    render(
      <AIAssistantDrawer
        isOpen={true}
        initialWord="ประสิทธิภาพ"
        initialContext="รายงานวิชาการ"
        onClose={vi.fn()}
      />
    );

    // Type a prompt to the agent
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "ช่วยร่างอีเมลขอความอนุเคราะห์" } });

    const sendBtn = screen.getByLabelText("สั่งงาน AI Agent");
    fireEvent.click(sendBtn);

    // Verify fetch was initiated with agentMode
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/v1/ai/chat/stream",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("ช่วยร่างอีเมลขอความอนุเคราะห์"),
        })
      );
    });

    // Verify Agent Execution Trace Bar appears
    await waitFor(() => {
      expect(screen.getByText("กระบวนการทำงานของ Agent:")).toBeTruthy();
      expect(screen.getByText("ContextAgent")).toBeTruthy();
    });

    // Verify Agent Artifact Toolbar appears (Copy + Refine chips)
    await waitFor(() => {
      expect(screen.getByText("📋 คัดลอกผลลัพธ์")).toBeTruthy();
      expect(screen.getByText("✨ ปรับให้ทางการขึ้น")).toBeTruthy();
      expect(screen.getByText("✂️ สรุปให้กระชับ")).toBeTruthy();
      expect(screen.getByText("📝 เพิ่มตัวอย่างอีก 2 แบบ")).toBeTruthy();
    });

    // Clicking follow-up refine action triggers agent again
    const refineBtn = screen.getByText("✨ ปรับให้ทางการขึ้น");
    fireEvent.click(refineBtn);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
