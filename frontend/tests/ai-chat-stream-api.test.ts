import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/v1/ai/chat/stream/route";

describe("Task 2: AI Chat Stream API Route Handler (POST /api/v1/ai/chat/stream)", () => {
  it("returns 400 if message is empty or missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/v1/ai/chat/stream", {
      method: "POST",
      body: JSON.stringify({ message: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain("message");
  });

  it("returns 200 text/event-stream with tokens, evidence, and complete events", async () => {
    const request = new NextRequest("http://localhost:3000/api/v1/ai/chat/stream", {
      method: "POST",
      body: JSON.stringify({
        message: "คำว่า 'ประสิทธิภาพ' ต่างกับ 'ประสิทธิผล' ในงานวิจัยอย่างไร",
        word: "ประสิทธิภาพ",
        context: "รายงานวิชาการ",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/event-stream");

    // Read the stream
    const reader = response.body?.getReader();
    expect(reader).toBeDefined();

    const decoder = new TextDecoder();
    let fullOutput = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      fullOutput += decoder.decode(value, { stream: true });
    }

    // Verify SSE structure
    expect(fullOutput).toContain("event: token");
    expect(fullOutput).toContain("event: evidence");
    expect(fullOutput).toContain("event: complete");

    // Parse blocks
    const blocks = fullOutput.split("\n\n").filter(Boolean);
    const events: Array<{ event: string; data: any }> = [];

    for (const block of blocks) {
      const lines = block.split("\n");
      let event = "";
      let dataStr = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.replace("event:", "").trim();
        if (line.startsWith("data:")) dataStr = line.replace("data:", "").trim();
      }
      if (event && dataStr) {
        try {
          events.push({ event, data: JSON.parse(dataStr) });
        } catch {}
      }
    }

    // 1. Verify token events have token property
    const tokenEvents = events.filter((e) => e.event === "token");
    expect(tokenEvents.length).toBeGreaterThan(0);
    expect(tokenEvents[0].data).toHaveProperty("token");

    // 2. Verify evidence event has source and definition
    const evidenceEvent = events.find((e) => e.event === "evidence");
    expect(evidenceEvent).toBeDefined();
    expect(Array.isArray(evidenceEvent!.data)).toBe(true);
    expect(evidenceEvent!.data[0]).toHaveProperty("source");
    expect(evidenceEvent!.data[0]).toHaveProperty("definition");

    // 3. Verify complete event has confidence and grounded = true
    const completeEvent = events.find((e) => e.event === "complete");
    expect(completeEvent).toBeDefined();
    expect(completeEvent!.data.grounded).toBe(true);
    expect(completeEvent!.data.confidence).toBeGreaterThan(0.5);
  });
});
