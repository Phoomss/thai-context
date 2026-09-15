// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/v1/feedback/route";
import { sendFeedback } from "../src/lib/api-client";
import { NextRequest } from "next/server";

const createNextRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/v1/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Feedback API Route (POST /api/v1/feedback)", () => {
  it("rejects request when query is missing or empty", async () => {
    const resEmpty = await POST(createNextRequest({ query: "" }));
    expect(resEmpty.status).toBe(400);
    const data = await resEmpty.json();
    expect(data.error).toBe("กรุณาระบุข้อความค้นหา (query)");

    const resNoQuery = await POST(createNextRequest({ selectedWord: "ประสิทธิภาพ" }));
    expect(resNoQuery.status).toBe(400);
  });

  it("handles malformed JSON body with 400", async () => {
    const badReq = new NextRequest("http://localhost/api/v1/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-a-valid-json",
    });
    const res = await POST(badReq);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("ข้อมูล JSON ไม่ถูกต้อง");
  });

  it("forwards normalized feedback to configured NestJS backend", async () => {
    vi.stubEnv("THAI_CONTEXT_API_URL", "http://localhost:3001/api/v1");

    const mockBackendResponse = {
      success: true,
      feedbackId: "uuid-feedback-123",
      message: "Feedback recorded successfully",
    };

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockBackendResponse), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const req = createNextRequest({
      query: "ทำงานได้ดี รวดเร็ว",
      selectedWord: "ประสิทธิภาพ",
      relevanceScore: 1,
      userComment: "ตรงความหมายมาก",
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toEqual(mockBackendResponse);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/feedback",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          queryText: "ทำงานได้ดี รวดเร็ว",
          recommendedWord: "ประสิทธิภาพ",
          userAction: "THUMBS_UP",
          rating: 5,
          feedbackNotes: "ตรงความหมายมาก",
        }),
      })
    );
  });

  it("gracefully falls back when backend is offline or errors", async () => {
    vi.stubEnv("THAI_CONTEXT_API_URL", "http://localhost:3001/api/v1");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("ECONNREFUSED")));

    const req = createNextRequest({
      query: "ทำงานได้ดี",
      selectedWord: "ประสิทธิผล",
      relevanceScore: -1,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.feedbackId).toMatch(/^fb_local_/);
  });
});

describe("Client sendFeedback function", () => {
  it("sends feedback payload to /api/v1/feedback", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          feedbackId: "fb-777",
          message: "Feedback recorded successfully",
        }),
        { status: 201 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendFeedback({
      query: "ทำงานได้ดี",
      selectedWord: "ประสิทธิภาพ",
      relevanceScore: 1,
      userAction: "THUMBS_UP",
    });

    expect(result.success).toBe(true);
    expect(result.feedbackId).toBe("fb-777");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/feedback",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("rejects when query is empty", async () => {
    await expect(
      sendFeedback({
        query: "   ",
        selectedWord: "ประสิทธิภาพ",
        relevanceScore: 1,
      })
    ).rejects.toThrow("กรุณาระบุข้อความค้นหา (query)");
  });

  it("falls back gracefully when network fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Network error")));

    const result = await sendFeedback({
      query: "ทำงานสำเร็จ",
      selectedWord: "สัมฤทธิผล",
      relevanceScore: 1,
    });

    expect(result.success).toBe(true);
    expect(result.feedbackId).toMatch(/^fb_offline_/);
  });
});
