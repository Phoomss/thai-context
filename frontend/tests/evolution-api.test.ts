import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as evolutionHandler } from "../src/app/api/v1/dictionary/words/[word]/evolution/route";
import { GET as evolutionAliasHandler } from "../src/app/api/v1/evolution/[word]/route";

describe("Word Evolution API (/api/v1/dictionary/words/:word/evolution)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 400 when word parameter is empty", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/dictionary/words/%20/evolution");
    const res = await evolutionHandler(req, {
      params: Promise.resolve({ word: "   " }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("กรุณาระบุคำศัพท์");
  });

  it("returns 3-era evolution timeline for curated benchmark term 'สมานฉันท์'", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/v1/dictionary/words/%E0%B8%AA%E0%B8%A1%E0%B8%B2%E0%B8%99%E0%B8%89%E0%B8%B1%E0%B8%99%E0%B8%97%E0%B9%8C/evolution"
    );
    const res = await evolutionHandler(req, {
      params: Promise.resolve({ word: "สมานฉันท์" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.word).toBe("สมานฉันท์");
    expect(body.timeline).toHaveLength(3);

    expect(body.timeline[0].editionYear).toBe("2542");
    expect(body.timeline[0].status).toBe("ORIGINAL");
    expect(body.timeline[0].definition).toContain("ความพอใจร่วมกัน");

    expect(body.timeline[1].editionYear).toBe("2554");
    expect(body.timeline[1].status).toBe("CHANGED");
    expect(body.timeline[1].definition).toContain("ความพร้อมเพรียงกัน");

    expect(body.timeline[2].editionYear).toBe("2569");
    expect(body.timeline[2].status).toBe("EXPANDED");
    expect(body.timeline[2].definition).toContain("ความร่วมมือร่วมใจ");
  });

  it("returns 3-era evolution timeline for 'ประสิทธิภาพ'", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/v1/dictionary/words/%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%AA%E0%B8%B4%E0%B8%97%E0%B8%98%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%9E/evolution"
    );
    const res = await evolutionHandler(req, {
      params: Promise.resolve({ word: "ประสิทธิภาพ" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.word).toBe("ประสิทธิภาพ");
    expect(body.timeline).toHaveLength(3);
    expect(body.timeline[0].editionYear).toBe("2542");
    expect(body.timeline[1].editionYear).toBe("2554");
    expect(body.timeline[2].editionYear).toBe("2569");
  });

  it("retrieves words from 8,331 comparison dataset like 'กระตือรือร้น'", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/v1/dictionary/words/%E0%B8%81%E0%B8%A3%E0%B8%B0%E0%B8%95%E0%B8%B7%E0%B8%AD%E0%B8%A3%E0%B8%B7%E0%B8%AD%E0%B8%A3%E0%B9%89%E0%B8%99/evolution"
    );
    const res = await evolutionHandler(req, {
      params: Promise.resolve({ word: "กระตือรือร้น" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.word).toBe("กระตือรือร้น");
    expect(body.timeline.length).toBeGreaterThan(0);
    expect(body.timeline[0].definition).toContain("รีบร้อน");
  });

  it("handles alias route /api/v1/evolution/:word correctly", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/evolution/%E0%B8%AA%E0%B8%99%E0%B8%97%E0%B8%99%E0%B8%B2");
    const res = await evolutionAliasHandler(req, {
      params: Promise.resolve({ word: "สนทนา" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.word).toBe("สนทนา");
    expect(body.timeline).toBeDefined();
  });
});
