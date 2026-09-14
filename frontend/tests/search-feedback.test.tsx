import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import SearchResultFeedback from "../src/components/feedback/SearchResultFeedback";
import WordResultCard from "../src/components/search/WordResultCard";
import * as apiClient from "../src/lib/api-client";

describe("SearchResultFeedback Component", () => {
  let sendFeedbackSpy: any;

  beforeEach(() => {
    sendFeedbackSpy = vi.spyOn(apiClient, "sendFeedback").mockResolvedValue({
      success: true,
      feedbackId: "fb-test-123",
      message: "Feedback recorded successfully",
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders the feedback prompt and evaluation buttons", () => {
    render(
      <SearchResultFeedback
        query="ทำงานได้ดี รวดเร็ว"
        word="ประสิทธิภาพ"
      />
    );

    expect(
      screen.getByText("คำนี้ตรงกับสิ่งที่คุณค้นหาหรือไม่?")
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "คำว่า ประสิทธิภาพ ตรงใจ" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "คำว่า ประสิทธิภาพ ไม่ตรงบริบท" })).toBeTruthy();
  });

  it("handles Thumbs Up click correctly and updates aria-pressed", async () => {
    const onFeedbackSubmitted = vi.fn();
    render(
      <SearchResultFeedback
        query="ทำงานได้ดี"
        word="ประสิทธิภาพ"
        onFeedbackSubmitted={onFeedbackSubmitted}
      />
    );

    const upBtn = screen.getByRole("button", { name: "คำว่า ประสิทธิภาพ ตรงใจ" });
    expect(upBtn.getAttribute("aria-pressed")).toBe("false");

    await act(async () => {
      fireEvent.click(upBtn);
    });

    expect(sendFeedbackSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "ทำงานได้ดี",
        selectedWord: "ประสิทธิภาพ",
        relevanceScore: 1,
        userAction: "THUMBS_UP",
      })
    );

    expect(upBtn.getAttribute("aria-pressed")).toBe("true");
    expect(onFeedbackSubmitted).toHaveBeenCalledWith(1);
    expect(
      screen.getByText(/ขอบคุณสำหรับข้อเสนอแนะ! ระบบบันทึกว่าคำนี้ตรงใจคุณแล้ว/)
    ).toBeTruthy();
  });

  it("handles Thumbs Down click, shows optional comment form, and allows submitting comment", async () => {
    render(
      <SearchResultFeedback
        query="ทำงานได้ดี"
        word="ประสิทธิผล"
      />
    );

    const downBtn = screen.getByRole("button", { name: "คำว่า ประสิทธิผล ไม่ตรงบริบท" });
    await act(async () => {
      fireEvent.click(downBtn);
    });

    expect(sendFeedbackSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "ทำงานได้ดี",
        selectedWord: "ประสิทธิผล",
        relevanceScore: -1,
        userAction: "THUMBS_DOWN",
      })
    );

    expect(downBtn.getAttribute("aria-pressed")).toBe("true");

    // Optional comment box should be visible
    const input = screen.getByPlaceholderText(/เช่น ควรเป็นคำว่า/) as HTMLInputElement;
    expect(input).toBeTruthy();

    await act(async () => {
      fireEvent.change(input, { target: { value: "ควรเป็นคำว่า ประสิทธิภาพ มากกว่า" } });
    });

    const submitCommentBtn = screen.getByRole("button", { name: "ส่งข้อเสนอแนะ" });
    await act(async () => {
      fireEvent.click(submitCommentBtn);
    });

    expect(sendFeedbackSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedWord: "ประสิทธิผล",
        relevanceScore: -1,
        userComment: "ควรเป็นคำว่า ประสิทธิภาพ มากกว่า",
      })
    );

    expect(
      screen.getByText(/ขอบคุณสำหรับคำแนะนำเพิ่มเติม!/)
    ).toBeTruthy();
  });

  it("renders in compact mode with compact buttons and status", async () => {
    render(
      <SearchResultFeedback
        query="ทำงานได้ดี"
        word="ประสิทธิภาพ"
        compact
      />
    );

    expect(screen.getByText("ผลลัพธ์ตรงใจไหม?")).toBeTruthy();
    const upBtn = screen.getByRole("button", { name: "คำว่า ประสิทธิภาพ ตรงใจ (มีประโยชน์)" });
    expect(upBtn).toBeTruthy();

    await act(async () => {
      fireEvent.click(upBtn);
    });

    expect(screen.getByText("บันทึกแล้ว")).toBeTruthy();
  });

  it("resets state when word prop changes", async () => {
    const { rerender } = render(
      <SearchResultFeedback
        query="ทำงานได้ดี"
        word="ประสิทธิภาพ"
      />
    );

    const upBtn = screen.getByRole("button", { name: "คำว่า ประสิทธิภาพ ตรงใจ" });
    await act(async () => {
      fireEvent.click(upBtn);
    });

    expect(upBtn.getAttribute("aria-pressed")).toBe("true");

    // Rerender with a new word
    rerender(
      <SearchResultFeedback
        query="ทำงานได้ดี"
        word="ประสิทธิผล"
      />
    );

    const newUpBtn = screen.getByRole("button", { name: "คำว่า ประสิทธิผล ตรงใจ" });
    expect(newUpBtn.getAttribute("aria-pressed")).toBe("false");
    expect(
      screen.queryByText(/ขอบคุณสำหรับข้อเสนอแนะ/)
    ).toBeNull();
  });

  it("integrates seamlessly into WordResultCard", () => {
    render(
      <WordResultCard
        word={{
          headword: "ประสิทธิภาพ",
          definition: "ความสามารถในการทำงาน",
          score: 0.95,
        }}
        index={0}
        revision={1}
        loading={false}
        selected={false}
        query="ทำงานได้ผลดี"
        onEvidence={vi.fn()}
        onCompare={vi.fn()}
      />
    );

    expect(screen.getByText("ผลลัพธ์ตรงใจไหม?")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "คำว่า ประสิทธิภาพ ตรงใจ (มีประโยชน์)" })
    ).toBeTruthy();
  });
});
