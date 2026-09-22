import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import AIAssistantPageView from "@/components/ai/AIAssistantPageView";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("word=ประสิทธิภาพ&context=รายงานวิชาการ"),
}));

describe("AIAssistantPageView Dedicated Page View", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dedicated AI Assistant page with brand, navigation toggle, and agent workspace", () => {
    render(<AIAssistantPageView />);

    // Brand and Page Header
    expect(screen.getByText("ศูนย์ปฏิบัติการ AI Agent ด้านภาษาไทย")).toBeTruthy();
    expect(screen.getByText(/ผู้ช่วย AI Agent Workspace/)).toBeTruthy();

    // Toggle back to Main Search Page
    const backBtn = screen.getByRole("link", {
      name: /สลับไปหน้าค้นหาหลัก/,
    });
    expect(backBtn).toBeTruthy();
    expect(backBtn.getAttribute("href")).toBe("/");

    // Persona Tabs
    expect(screen.getByRole("tab", { name: /ตัวแทนอัตโนมัติ/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /ร่างและเขียน/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /ขัดเกลาสำนวน/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /วิจัยเปรียบเทียบคำ/ })).toBeTruthy();

    // Word pre-filled from search params
    expect(screen.getByText("ประสิทธิภาพ")).toBeTruthy();
  });

  it("switches personas on the dedicated page and sends prompt to streaming API", async () => {
    const sseChunks = [
      'event: trace\ndata: [{"agent": "ContextAgent", "status": "completed", "summary": "วิเคราะห์บริบท"}, {"agent": "RewriteAgent", "status": "completed", "summary": "ปรับระดับภาษาสำเร็จ"}]\n\n',
      'event: token\ndata: {"token": "🤖 **[ตัวแทนอัจฉริยะ: RewriteAgent]**\\nผลงานขัดเกลาสำนวน"}\n\n',
      'event: complete\ndata: {"confidence": 0.95, "grounded": true, "agent": "RewriteAgent"}\n\n',
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

    render(<AIAssistantPageView />);

    // Click Rewrite Agent tab
    const rewriteTab = screen.getByRole("tab", { name: /ขัดเกลาสำนวน/ });
    fireEvent.click(rewriteTab);
    expect(rewriteTab.getAttribute("aria-selected")).toBe("true");

    // Click quick mission button
    const missionBtn = screen.getByText(/เปลี่ยนข้อความนี้ให้เป็นภาษาราชการ/);
    fireEvent.click(missionBtn);

    // Verify fetch was called
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/v1/ai/chat/stream",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("เปลี่ยนข้อความนี้ให้เป็นภาษาราชการ"),
        })
      );
    });

    // Verify response rendered with traces and action buttons
    await waitFor(() => {
      expect(screen.getByText("ContextAgent")).toBeTruthy();
      expect(screen.getByText(/คัดลอกผลลัพธ์/)).toBeTruthy();
      expect(screen.getByText(/ฟังเสียง/)).toBeTruthy();
    });

    // Test assistant message "Speak to emotion" menu with emojis
    const assistantEmotionBtns = screen.getAllByRole("button", { name: /Speak to emotion/ });
    expect(assistantEmotionBtns.length).toBeGreaterThanOrEqual(1);

    // Click the assistant toolbar emotion button
    fireEvent.click(assistantEmotionBtns[0]);

    // Verify emoji choices appear
    expect(screen.getByText(/สดใส \/ ร่าเริง/)).toBeTruthy();
    expect(screen.getByText(/ซาบซึ้ง \/ เห็นใจ/)).toBeTruthy();
    expect(screen.getByText(/สุขุม \/ ลึกซึ้ง/)).toBeTruthy();
    expect(screen.getByText(/หนักแน่น \/ ดุดัน/)).toBeTruthy();
    expect(screen.getByText(/อ่อนโยน \/ อบอุ่น/)).toBeTruthy();
    expect(screen.getByText(/ตื่นเต้น \/ เร้าใจ/)).toBeTruthy();
    expect(screen.getByText(/สงบ \/ นอบน้อม/)).toBeTruthy();
    expect(screen.getByText("😊")).toBeTruthy();
    expect(screen.getByText("🥺")).toBeTruthy();
    expect(screen.getByText("🕊️")).toBeTruthy();
  });

  it("toggles the Speak to emotion menu in the context bar with emojis", () => {
    render(<AIAssistantPageView />);

    // Find the Speak to emotion button in the prompt / context area
    const emotionToggleBtn = screen.getAllByTitle("เปิดเมนูพูดสื่ออารมณ์")[0];
    expect(emotionToggleBtn).toBeTruthy();

    // Click to open emotion palette
    fireEvent.click(emotionToggleBtn);

    // Verify all emoji tone options are rendered
    expect(screen.getByText("😊")).toBeTruthy();
    expect(screen.getByText("🥺")).toBeTruthy();
    expect(screen.getByText("🧐")).toBeTruthy();
    expect(screen.getByText("😠")).toBeTruthy();
    expect(screen.getByText("💖")).toBeTruthy();
    expect(screen.getByText("🥳")).toBeTruthy();
    expect(screen.getByText("🕊️")).toBeTruthy();

    // Click an emotion tone to select it
    const cheerfulBtn = screen.getByText(/สดใส \/ ร่าเริง/);
    fireEvent.click(cheerfulBtn);

    // Verify toast or active tone is selected
    expect(screen.getByText(/อารมณ์ปัจจุบัน: 😊 สดใส \/ ร่าเริง/)).toBeTruthy();
  });
});
