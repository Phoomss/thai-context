import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import SignMotionPlayer from "../src/components/tsl/SignMotionPlayer";
import SignLanguageSection from "../src/components/tsl/SignLanguageSection";
import SignContributionModal from "../src/components/tsl/SignContributionModal";
import SignAvatarCanvas from "../src/components/tsl/SignAvatarCanvas";
import {
  getSignResource,
  generateSawasdeeMotion,
  generateKrengJaiMotion,
  generateEfficiencyMotion,
  SIGN_CATALOG,
} from "../src/lib/sign-motion-data";
import { GET as getSignLanguageRoute } from "../src/app/api/v1/dictionary/words/[word]/sign-language/route";
import { POST as postResourceRoute } from "../src/app/api/v1/sign-language/resources/route";
import { POST as postContributeRoute } from "../src/app/api/v1/sign-language/contribute/route";

describe("Thai Sign Language Accessibility Layer — Structured Motion Data", () => {
  it("generates structured motion keyframes for 'สวัสดี' with 30fps and 1800ms duration", () => {
    const motion = generateSawasdeeMotion();
    expect(motion.version).toBe("1.0");
    expect(motion.fps).toBe(30);
    expect(motion.duration_ms).toBe(1800);
    expect(motion.frames.length).toBeGreaterThanOrEqual(50);

    const firstFrame = motion.frames[0];
    expect(firstFrame.timestamp).toBe(0);
    expect(firstFrame.landmarks.head).toBeDefined();
    expect(firstFrame.landmarks.chest).toBeDefined();
    expect(firstFrame.landmarks.left_wrist).toBeDefined();
    expect(firstFrame.landmarks.right_wrist).toBeDefined();
  });

  it("generates structured motion keyframes for 'เกรงใจ' with 2000ms duration", () => {
    const motion = generateKrengJaiMotion();
    expect(motion.duration_ms).toBe(2000);
    expect(motion.frames.length).toBeGreaterThanOrEqual(50);
  });

  it("generates structured motion keyframes for 'ประสิทธิภาพ' with coordinated spiral gesture", () => {
    const motion = generateEfficiencyMotion();
    expect(motion.duration_ms).toBe(1800);
    expect(motion.frames.length).toBeGreaterThanOrEqual(50);
  });
});

describe("SignMotionPlayer Component", () => {
  afterEach(cleanup);

  const verifiedResource = getSignResource("สวัสดี");

  it("renders 3D Avatar/Skeleton canvas, timeline scrubber, and accessibility labels", () => {
    render(<SignMotionPlayer resource={verifiedResource} initialSpeed={1.0} autoPlay={false} />);

    const playerRegion = screen.getByRole("region", {
      name: /เครื่องเล่นการเคลื่อนไหวภาษามือไทยสำหรับคำว่า สวัสดี/i,
    });
    expect(playerRegion).toBeTruthy();

    // Timeline scrubber slider
    const slider = screen.getByLabelText("แถบเลื่อนความคืบหน้าท่าภาษามือ");
    expect(slider).toBeTruthy();

    // Text description fallback
    expect(
      screen.getByText(/พนมมือทั้งสองข้างระดับอก ปลายนิ้วชี้ขึ้น/)
    ).toBeTruthy();
  });

  it("handles Play, Pause, and Replay control interactions", () => {
    render(<SignMotionPlayer resource={verifiedResource} initialSpeed={1.0} autoPlay={false} />);

    const playBtn = screen.getByRole("button", { name: /เล่นท่ามือ/i });
    expect(playBtn).toBeTruthy();

    // Click to Play
    fireEvent.click(playBtn);
    expect(screen.getByRole("button", { name: /หยุดชั่วคราว/i })).toBeTruthy();

    // Click Replay
    const replayBtn = screen.getByRole("button", { name: /เล่นอีกครั้ง/i });
    fireEvent.click(replayBtn);
    expect(screen.getByRole("button", { name: /หยุดชั่วคราว/i })).toBeTruthy();
  });

  it("supports playback speed changes (0.5x, 1x, 1.5x) for learning and accessibility", () => {
    render(<SignMotionPlayer resource={verifiedResource} initialSpeed={1.0} autoPlay={false} />);

    const speedGroup = screen.getByRole("group", { name: /ความเร็วการเล่น/i });
    expect(speedGroup).toBeTruthy();

    const slowBtn = screen.getByRole("button", { name: "0.5x" });
    const fastBtn = screen.getByRole("button", { name: "1.5x" });

    fireEvent.click(slowBtn);
    expect(slowBtn.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(fastBtn);
    expect(fastBtn.getAttribute("aria-pressed")).toBe("true");
  });

  it("supports toggling between 3D Avatar mode and Skeleton (โครงกระดูก) mode", () => {
    render(<SignMotionPlayer resource={verifiedResource} initialSpeed={1.0} autoPlay={false} />);

    const toggleBtn = screen.getByRole("button", { name: /สลับมุมมอง/i });
    expect(toggleBtn.textContent).toContain("ดูโครงกระดูก");

    fireEvent.click(toggleBtn);
    expect(toggleBtn.textContent).toContain("ดู 3D อวตาร");
  });

  it("supports keyboard controls (Space to toggle play, R to replay)", () => {
    render(<SignMotionPlayer resource={verifiedResource} initialSpeed={1.0} autoPlay={false} />);

    const playerRegion = screen.getByRole("region", {
      name: /เครื่องเล่นการเคลื่อนไหวภาษามือไทยสำหรับคำว่า สวัสดี/i,
    });

    // Space to toggle play
    fireEvent.keyDown(playerRegion, { key: " " });
    expect(screen.getByRole("button", { name: /หยุดชั่วคราว/i })).toBeTruthy();

    // R to replay
    fireEvent.keyDown(playerRegion, { key: "r" });
    expect(screen.getByRole("button", { name: /หยุดชั่วคราว/i })).toBeTruthy();
  });
});

describe("SignLanguageSection Component — Three Data States", () => {
  afterEach(cleanup);

  it("STATE 1 (VERIFIED): renders 3D avatar player, DEMO badge, and clear provenance info", () => {
    render(<SignLanguageSection word="สวัสดี" />);

    expect(screen.getByText("ภาษามือไทย (Thai Sign Language)")).toBeTruthy();
    expect(screen.getAllByText(/DEMO/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/THAI CONTEXT 3D Gesture Lab/i)).toBeTruthy();
    expect(screen.getByText(/คณะทำงานวิจัยสรีระการเคลื่อนไหวทางภาษา/i)).toBeTruthy();
  });

  it("STATE 2 (EXTERNAL_RESOURCE): renders external resource notice, does not host media, links to original source", () => {
    render(<SignLanguageSection word="สมานฉันท์" />);

    expect(screen.getByText("ข้อมูลภาษามือมีอยู่จากแหล่งภายนอก")).toBeTruthy();
    expect(screen.getByText(/External Resource/i)).toBeTruthy();

    const extLink = screen.getByRole("link", { name: /เปิดแหล่งข้อมูลต้นฉบับ/i });
    expect(extLink).toBeTruthy();
    expect(extLink.getAttribute("href")).toContain("thaisigndictionary.org");
    expect(extLink.getAttribute("rel")).toContain("noopener");
  });

  it("STATE 3 (NOT_AVAILABLE): displays strict legal governance policy (no invented signs) and contribution CTA", () => {
    render(<SignLanguageSection word="คำที่ไม่เคยมีในพจนานุกรม" />);

    expect(screen.getByText(/ยังไม่มีข้อมูลภาษามือไทยที่ผ่านการตรวจสอบสำหรับคำนี้/i)).toBeTruthy();
    expect(screen.getByText(/จะไม่สร้างหรือคาดเดาท่ามือขึ้นเองโดยไม่มีแหล่งอ้างอิงที่ตรวจสอบได้/i)).toBeTruthy();

    const contribBtn = screen.getByRole("button", { name: /เสนอแหล่งข้อมูล/i });
    expect(contribBtn).toBeTruthy();

    // Click opens contribution modal
    fireEvent.click(contribBtn);
    expect(screen.getByRole("dialog", { name: /เสนอแหล่งข้อมูลภาษามือ/i })).toBeTruthy();
  });
});

describe("SignContributionModal Component", () => {
  afterEach(cleanup);

  it("renders contribution dialog with legal governance notice and form inputs", () => {
    render(<SignContributionModal word="วิจัย" isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/เสนอแหล่งข้อมูลภาษามือ \(วิจัย\)/i)).toBeTruthy();
    expect(screen.getByLabelText(/ลิงก์หรือ URL แหล่งข้อมูลต้นฉบับ/i)).toBeTruthy();
    expect(screen.getByLabelText(/ชื่อหน่วยงาน \/ ผู้เผยแพร่/i)).toBeTruthy();
  });

  it("submits source proposal and displays PENDING_REVIEW workflow confirmation", async () => {
    const handleClose = vi.fn();
    render(<SignContributionModal word="วิจัย" isOpen={true} onClose={handleClose} />);

    const urlInput = screen.getByLabelText(/ลิงก์หรือ URL แหล่งข้อมูลต้นฉบับ/i);
    fireEvent.change(urlInput, { target: { value: "https://example.org/sign/research" } });

    const submitBtn = screen.getByRole("button", { name: /ส่งเพื่อตรวจสอบ/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText(/ได้รับข้อมูลข้อเสนอของคุณแล้ว/i)).toBeTruthy();
    expect(screen.getByText(/PENDING_REVIEW/i)).toBeTruthy();
  });
});

describe("Next.js API Routes for Thai Sign Language Accessibility", () => {
  it("GET /api/v1/dictionary/words/:word/sign-language?format=structured returns VERIFIED state for 'สวัสดี'", async () => {
    const req = new Request("http://localhost:3000/api/v1/dictionary/words/%E0%B8%AA%E0%B8%A7%E0%B8%B1%E0%B8%AA%E0%B8%94%E0%B8%B5/sign-language?format=structured");
    const res = await getSignLanguageRoute(req as any, {
      params: Promise.resolve({ word: "สวัสดี" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("VERIFIED");
    expect(data.word).toBe("สวัสดี");
    expect(data.representation.type).toBe("MOTION");
    expect(data.representation.data.duration_ms).toBe(1800);
    expect(data.source.type).toBe("DEMO_DATA");
    expect(data.verification.status).toBe("VERIFIED");
  });

  it("GET /api/v1/dictionary/words/:word/sign-language?format=structured returns EXTERNAL_RESOURCE state for 'สมานฉันท์'", async () => {
    const req = new Request("http://localhost:3000/api/v1/dictionary/words/%E0%B8%AA%E0%B8%A1%E0%B8%B2%E0%B8%99%E0%B8%89%E0%B8%B1%E0%B8%99%E0%B8%97%E0%B9%8C/sign-language?format=structured");
    const res = await getSignLanguageRoute(req as any, {
      params: Promise.resolve({ word: "สมานฉันท์" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("EXTERNAL_RESOURCE");
    expect(data.source.url).toContain("thaisigndictionary.org");
    expect(data.source.permission_status).toBe("EXTERNAL_ONLY");
  });

  it("GET /api/v1/dictionary/words/:word/sign-language?format=structured returns NOT_AVAILABLE for unknown word", async () => {
    const req = new Request("http://localhost:3000/api/v1/dictionary/words/%E0%B8%84%E0%B8%B3%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B8%A3%E0%B8%B9%E0%B9%89%E0%B8%88%E0%B8%B1%E0%B8%81/sign-language?format=structured");
    const res = await getSignLanguageRoute(req as any, {
      params: Promise.resolve({ word: "คำไม่รู้จัก" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("NOT_AVAILABLE");
    expect(data.message).toContain("ยังไม่มีข้อมูลภาษามือไทยที่ผ่านการตรวจสอบ");
  });

  it("POST /api/v1/sign-language/resources creates resource with 201 Created", async () => {
    const req = new Request("http://localhost:3000/api/v1/sign-language/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word: "สวัสดี",
        representation_type: "MOTION",
        source_type: "DEMO_DATA",
        permission_status: "AUTHORIZED",
      }),
    });

    const res = await postResourceRoute(req as any);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.message).toContain("บันทึกทรัพยากรภาษามือไทยเรียบร้อยแล้ว");
    expect(body.resource.word).toBe("สวัสดี");
  });

  it("POST /api/v1/sign-language/contribute accepts suggestion with status PENDING_REVIEW (202 Accepted)", async () => {
    const req = new Request("http://localhost:3000/api/v1/sign-language/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word: "คำทดสอบ",
        source_url: "https://example.com/sign",
        provider_name: "สมาคมคนหูหนวก",
        notes: "ทดสอบการส่งข้อมูล",
      }),
    });

    const res = await postContributeRoute(req as any);
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.status).toBe("PENDING_REVIEW");
    expect(body.submission.source_type).toBe("USER_SUBMISSION");
  });
});
