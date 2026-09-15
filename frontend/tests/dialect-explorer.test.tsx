import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import DialectExplorer from "@/components/dialect/DialectExplorer";
import { GET as getDialectsRoute } from "@/app/api/v1/dialect/route";
import { GET as getDialectMappingRoute } from "@/app/api/v1/dialect/mapping/[word]/route";
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

describe("DialectExplorer Component", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading, 4 regional cards, and default word 'คิดถึง'", () => {
    render(<DialectExplorer />);

    expect(
      screen.getByRole("heading", { name: "สำรวจคลังคำภาษาถิ่น 4 ภาค" }),
    ).toBeTruthy();

    expect(
      screen.getByText(/คำมาตรฐาน: คิดถึง — แตะการ์ดเพื่อดูที่มาของข้อมูล/),
    ).toBeTruthy();

    // Check 4 regions
    expect(screen.getByRole("button", { name: /กลาง/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /เหนือ/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /อีสาน/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /ใต้/ })).toBeTruthy();

    // Check words on cards
    expect(screen.getByText("กึ๊ดเติงหา")).toBeTruthy();
    expect(screen.getByText("คึดฮอด")).toBeTruthy();
    expect(screen.getByText("ข้องใจ")).toBeTruthy();
  });

  it("displays correct provenance badges: official for North/Isaan/Central, inferred for South", () => {
    render(<DialectExplorer />);

    const officialBadges = screen.getAllByText("✓ คลังข้อมูลภาษาถิ่นทางการ");
    expect(officialBadges.length).toBeGreaterThanOrEqual(3);

    const inferredBadges = screen.getAllByText("◌ อยู่ระหว่างการตรวจสอบ");
    expect(inferredBadges).toHaveLength(1);

    expect(screen.getByText(/AI ช่วยอนุมาน — ต้องตรวจสอบ/)).toBeTruthy();
  });

  it("switches categories and updates word chips accordingly", () => {
    render(<DialectExplorer />);

    // Switch to Kinship category
    const kinshipTab = screen.getByRole("tab", { name: /หมวดเครือญาติ/ });
    fireEvent.click(kinshipTab);

    // Expect kinship chips like พ่อ, แม่, ตา, พี่ชาย, น้อง
    expect(screen.getByRole("button", { name: "พ่อ" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "แม่" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "ตา" })).toBeTruthy();

    // Switch to Body Parts category
    const bodyPartsTab = screen.getByRole("tab", { name: /หมวดอวัยวะร่างกาย/ });
    fireEvent.click(bodyPartsTab);

    expect(screen.getByRole("button", { name: /ตา \(ดวงตา\)/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "ฟัน" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "ก้นกบ" })).toBeTruthy();
  });

  it("changes the active word and updates cards when clicking a word chip", () => {
    render(<DialectExplorer />);

    // Click 'อร่อย' chip in conversation
    const deliciousChip = screen.getByRole("button", { name: "อร่อย" });
    fireEvent.click(deliciousChip);

    expect(screen.getByText(/คำมาตรฐาน: อร่อย/)).toBeTruthy();
    expect(screen.getByText("ลำ")).toBeTruthy();
    expect(screen.getByText("แซ่บ")).toBeTruthy();
    expect(screen.getByText("หรอย")).toBeTruthy();
  });

  it("filters words when typing into search input", () => {
    render(<DialectExplorer />);

    const searchInput = screen.getByPlaceholderText(/ค้นหาคำ/);
    fireEvent.change(searchInput, { target: { value: "เว้า" } });

    // Should filter to 'พูด'
    expect(screen.getByText(/คำมาตรฐาน: พูด/)).toBeTruthy();
    expect(screen.getByText("อู้")).toBeTruthy();
    expect(screen.getByText("เว้า")).toBeTruthy();
    expect(screen.getByText("แหลง")).toBeTruthy();
  });

  it("plays audio pronunciation when clicking the audio button", () => {
    render(<DialectExplorer />);

    const playBtn = screen.getByRole("button", { name: /ฟังเสียงคำว่า/ });
    fireEvent.click(playBtn);

    expect(audioManager.toggle).toHaveBeenCalled();
  });
});

describe("Dialect API Route Handlers", () => {
  it("GET /api/v1/dialect returns list of categories and groups", async () => {
    const request = new Request("http://localhost:3000/api/v1/dialect");
    const response = await getDialectsRoute(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.categories).toHaveLength(3);
    expect(data.count).toBeGreaterThan(0);
    expect(Array.isArray(data.results)).toBe(true);
  });

  it("GET /api/v1/dialect with category filter", async () => {
    const request = new Request(
      "http://localhost:3000/api/v1/dialect?category=kinship",
    );
    const response = await getDialectsRoute(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.results.every((r: any) => r.category === "kinship")).toBe(true);
  });

  it("GET /api/v1/dialect/mapping/[word] returns 4-region mapped terms", async () => {
    const request = new Request(
      "http://localhost:3000/api/v1/dialect/mapping/คิดถึง",
    );
    const context = {
      params: Promise.resolve({ word: encodeURIComponent("คิดถึง") }),
    };

    const response = await getDialectMappingRoute(request, context);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.standardWord).toBe("คิดถึง");
    expect(data.mappings).toHaveLength(4);

    const regions = data.mappings.map((m: any) => m.region);
    expect(regions).toContain("กลาง");
    expect(regions).toContain("เหนือ");
    expect(regions).toContain("อีสาน");
    expect(regions).toContain("ใต้");

    const southMapping = data.mappings.find((m: any) => m.region === "ใต้");
    expect(southMapping.word).toBe("ข้องใจ");
    expect(southMapping.type).toBe("AI_INFERRED");
  });
});
