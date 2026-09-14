import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import AIAssistantDrawer from "@/components/ai/AIAssistantDrawer";

describe("Task 2: AIAssistantDrawer Component (Grounded RAG Assistant)", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(
      <AIAssistantDrawer
        isOpen={false}
        initialWord="ประสิทธิภาพ"
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByText("ปรึกษาการใช้คำศัพท์และบริบท")).toBeNull();
  });

  it("renders drawer header, anti-hallucination badges, and target word when open", () => {
    render(
      <AIAssistantDrawer
        isOpen={true}
        initialWord="ประสิทธิภาพ"
        initialContext="รายงานวิชาการ"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("ปรึกษาการใช้คำศัพท์และบริบท")).toBeTruthy();
    expect(screen.getByText("✨ ผู้ช่วย AI ภาษาไทย")).toBeTruthy();
    expect(screen.getByText("🛡️ Grounded RAG (ไม่มโน)")).toBeTruthy();
    expect(screen.getByText("ประสิทธิภาพ")).toBeTruthy();
    expect(screen.getByText("รายงานวิชาการ")).toBeTruthy();
  });

  it("switches context chip when clicked", () => {
    render(
      <AIAssistantDrawer
        isOpen={true}
        initialWord="ประสิทธิภาพ"
        initialContext="รายงานวิชาการ"
        onClose={vi.fn()}
      />
    );

    const businessChip = screen.getByRole("radio", { name: "เชิงบริหาร" });
    fireEvent.click(businessChip);

    expect(businessChip.getAttribute("aria-checked")).toBe("true");
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <AIAssistantDrawer
        isOpen={true}
        initialWord="ประสิทธิภาพ"
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByLabelText("ปิดหน้าต่างผู้ช่วย AI");
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("streams response from /api/v1/ai/chat/stream and renders grounded evidence and confidence", async () => {
    // Mock SSE fetch response
    const sseChunks = [
      'event: token\ndata: {"token": "คำว่า "}\n\n',
      'event: token\ndata: {"token": "ประสิทธิภาพ มุ่งเน้นความคุ้มค่า..."}\n\n',
      'event: evidence\ndata: [{"source": "พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔", "edition": "2554", "definition": "ความสามารถที่ทำให้เกิดผลสัมฤทธิ์ในการปฏิบัติงานโดยใช้ทรัพยากรและเวลาอย่างคุ้มค่าที่สุด"}]\n\n',
      'event: complete\ndata: {"confidence": 0.95, "grounded": true}\n\n',
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

    // Click a quick prompt button
    const quickPrompt = screen.getByText(/คำว่า 'ประสิทธิภาพ' ต่างกับ 'ประสิทธิผล' ในงานวิจัยอย่างไร/);
    fireEvent.click(quickPrompt);

    // Verify fetch was called with expected payload
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/v1/ai/chat/stream",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("ประสิทธิภาพ"),
        })
      );
    });

    // Verify streamed tokens appear
    await waitFor(() => {
      expect(screen.getByText(/ประสิทธิภาพ มุ่งเน้นความคุ้มค่า/)).toBeTruthy();
    });

    // Verify official evidence card appears
    await waitFor(() => {
      expect(screen.getByText("หลักฐานพจนานุกรมทางการ (Official Evidence)")).toBeTruthy();
      expect(screen.getByText("พจนานุกรม ฉบับราชบัณฑิตยสถาน พ.ศ. ๒๕๕๔")).toBeTruthy();
    });

    // Verify grounded badge and confidence score appear
    await waitFor(() => {
      expect(screen.getByText("อ้างอิงพจนานุกรมทางการ (Grounded)")).toBeTruthy();
      expect(screen.getByText("ความเชื่อมั่น 95%")).toBeTruthy();
    });
  });
});
