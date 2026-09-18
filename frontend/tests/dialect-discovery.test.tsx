import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import DialectDiscoveryView from "@/components/dialect/DialectDiscoveryView";
import { POST as searchMeaningRoute } from "@/app/api/v1/dialect/search/meaning/route";
import { POST as compareRoute } from "@/app/api/v1/dialect/compare/route";
import { POST as explainRoute } from "@/app/api/v1/dialect/explain/route";
import { GET as getRegionsRoute } from "@/app/api/v1/dialect/regions/route";
import { GET as getProvincesRoute } from "@/app/api/v1/dialect/provinces/route";
import { audioManager } from "@/lib/audio-manager";

vi.mock("@/lib/audio-manager", () => ({
  audioManager: {
    toggle: vi.fn(),
    active: vi.fn(() => ""),
    snapshot: vi.fn(() => "idle"),
    subscribe: vi.fn(() => () => {}),
    stop: vi.fn(),
  },
}));

describe("Dialect Intelligence & Discovery Feature", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Backend Proxy Routes & Fallbacks", () => {
    it("POST /api/v1/dialect/search/meaning finds regional candidates by meaning", async () => {
      const req = new Request("http://localhost:3000/api/v1/dialect/search/meaning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "กิน" }),
      });

      const res = await searchMeaningRoute(req as any);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.query_understanding).toBeDefined();
      expect(data.regional_grouped).toBeDefined();
      expect(data.regional_grouped.NORTH).toBeDefined();
      expect(data.regional_grouped.NORTHEAST).toBeDefined();
      expect(data.results.length).toBeGreaterThan(0);
    });

    it("POST /api/v1/dialect/compare returns 4-region comparative matrix", async () => {
      const req = new Request("http://localhost:3000/api/v1/dialect/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: "คิดถึง" }),
      });

      const res = await compareRoute(req as any);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.concept).toBe("คิดถึง");
      expect(data.results).toHaveLength(4);
      const north = data.results.find((r: any) => r.region === "NORTH");
      expect(north.term).toBe("กึ๊ดเติงหา");
      expect(north.found).toBe(true);
    });

    it("POST /api/v1/dialect/explain returns grounded explanation and adheres to hallucination guard", async () => {
      // 1. Known concept
      const reqValid = new Request("http://localhost:3000/api/v1/dialect/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "อธิบายคำว่า กิน", concept: "กิน" }),
      });
      const resValid = await explainRoute(reqValid as any);
      expect(resValid.status).toBe(200);
      const dataValid = await resValid.json();
      expect(dataValid.grounded).toBe(true);
      expect(dataValid.abstained).toBe(false);
      expect(dataValid.answer).toBeDefined();
      expect(dataValid.evidence.length).toBeGreaterThan(0);

      // 2. Unknown gibberish concept - Hallucination Guard must abstain
      const reqInvalid = new Request("http://localhost:3000/api/v1/dialect/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "คำที่ไม่มีในโลก9999", concept: "คำที่ไม่มีในโลก9999" }),
      });
      const resInvalid = await explainRoute(reqInvalid as any);
      const dataInvalid = await resInvalid.json();
      expect(dataInvalid.abstained).toBe(true);
      expect(dataInvalid.grounded).toBe(false);
      expect(dataInvalid.answer).toContain("ไม่พบข้อมูลที่เพียงพอจากแหล่งข้อมูลภาษาถิ่นที่ระบบรองรับ");
    });

    it("GET /api/v1/dialect/regions returns list of regions", async () => {
      const res = await getRegionsRoute();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.regions).toHaveLength(4);
    });

    it("GET /api/v1/dialect/provinces returns provinces list", async () => {
      const req = new Request("http://localhost:3000/api/v1/dialect/provinces");
      const res = await getProvincesRoute(req as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.provinces.length).toBeGreaterThan(5);
    });
  });

  describe("DialectDiscoveryView Component", () => {
    it("renders search controls, mode tabs, and quick concept chips", () => {
      render(<DialectDiscoveryView />);

      expect(screen.getByText(/ค้นหาจากความหมาย \(Meaning-First\)/)).toBeTruthy();
      expect(screen.getByText(/ค้นหาตามคำถิ่น \(Word Lookup\)/)).toBeTruthy();
      expect(screen.getByRole("button", { name: "ค้นหา" })).toBeTruthy();
      expect(screen.getByText(/กิน \(รับประทาน\)/)).toBeTruthy();
      expect(screen.getByText(/คิดถึง \(ระลึกถึง\)/)).toBeTruthy();
      expect(screen.getByText(/อร่อย \(รสชาติดี\)/)).toBeTruthy();
    });

    it("switches tabs between Discovery Grid, Comparison Matrix, and AI Explanation", () => {
      render(<DialectDiscoveryView />);

      const compareTab = screen.getByRole("button", { name: /ตารางเปรียบเทียบ 4 ภาค/ });
      fireEvent.click(compareTab);
      expect(screen.getByText(/ตารางเปรียบเทียบ 4 ภูมิภาคสำหรับแนวคิด/)).toBeTruthy();

      const aiTab = screen.getByRole("button", { name: /AI อธิบายความแตกต่างเชิงวัฒนธรรม/ });
      fireEvent.click(aiTab);
      expect(screen.getByText(/คำอธิบายภาษาถิ่นโดย AI ตามหลักฐานคลังข้อมูล/)).toBeTruthy();
    });

    it("invokes audioManager when playing audio", async () => {
      render(<DialectDiscoveryView />);

      // Switch to compare tab where audio buttons exist
      const compareTab = screen.getByRole("button", { name: /ตารางเปรียบเทียบ 4 ภาค/ });
      fireEvent.click(compareTab);

      // Audio buttons
      const audioButtons = screen.getAllByTitle("ฟังเสียงอ่าน");
      if (audioButtons.length > 0) {
        fireEvent.click(audioButtons[0]);
        expect(audioManager.toggle).toHaveBeenCalled();
      }
    });
  });
});
