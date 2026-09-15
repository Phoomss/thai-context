import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import ForeignerTranslatorView from "../src/components/translate/ForeignerTranslatorView";
import { GET as translateApiGet } from "../src/app/api/v1/translate/route";
import { audioManager } from "../src/lib/audio-manager";
import { NextRequest } from "next/server";

describe("Foreigner Translation API Route (/api/v1/translate)", () => {
  it("translates English 'hello' into Thai 'สวัสดี' with RTGS, tones, and gender variants", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/translate?q=hello&gender=male");
    const res = await translateApiGet(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.thaiScript).toBe("สวัสดี");
    expect(data.phoneticRtgs).toBe("sa-wat-di");
    expect(data.tones).toBeDefined();
    expect(data.tones.length).toBe(3);
    expect(data.genderVariants.male.text).toBe("สวัสดีครับ");
    expect(data.genderVariants.female.text).toBe("สวัสดีค่ะ");
    expect(data.culturalEtiquette.category).toBe("GREETING");
    expect(data.culturalEtiquette.politenessNote).toContain("ครับ (khrap)");
  });

  it("translates 'not spicy' with dining and food cultural advice", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/translate?q=not%20spicy");
    const res = await translateApiGet(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.thaiScript).toBe("ไม่เผ็ด");
    expect(data.phoneticRtgs).toBe("mai-phet");
    expect(data.culturalEtiquette.category).toBe("FOOD");
    expect(data.culturalEtiquette.politenessNote).toContain("Traditional Thai food");
  });

  it("handles Thai cultural word 'เกรงใจ' with deep social etiquette context", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/translate?q=เกรงใจ");
    const res = await translateApiGet(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.thaiScript).toBe("เกรงใจ");
    expect(data.englishGloss).toContain("considerate");
    expect(data.culturalEtiquette.krengJaiFactor).toBeDefined();
  });

  it("supports Romanized transliteration input like 'sawasdee'", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/translate?q=sawasdee");
    const res = await translateApiGet(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.thaiScript).toBe("สวัสดี");
    expect(data.phoneticRtgs).toBe("sa-wat-di");
  });

  it("returns 400 when query parameter 'q' is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/translate");
    const res = await translateApiGet(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});

describe("ForeignerTranslatorView Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock global fetch for the component
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("translate")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              sourceText: "Hello",
              sourceLanguage: "en",
              targetLanguage: "th",
              translatedText: "สวัสดี",
              thaiScript: "สวัสดี",
              englishGloss: "hello / greetings / goodbye",
              phoneticRtgs: "sa-wat-di",
              phoneticIpa: "/sa.wat.diː/",
              syllables: ["sa", "wat", "di"],
              tones: [
                { syllable: "sa", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low tone" },
                { syllable: "wat", tone: "low", symbol: "↘", labelThai: "เอก", description: "Low tone" },
                { syllable: "di", tone: "mid", symbol: "—", labelThai: "สามัญ", description: "Mid tone" },
              ],
              genderVariants: {
                male: { text: "สวัสดีครับ", rtgs: "sa-wat-di khrap", particle: "ครับ (khrap)" },
                female: { text: "สวัสดีค่ะ", rtgs: "sa-wat-di kha", particle: "ค่ะ / คะ (kha)" },
              },
              secondaryMeanings: ["good day", "hi"],
              culturalEtiquette: {
                category: "GREETING",
                politenessNote: "Universal Thai greeting for hello or goodbye.",
                waiGuidance: "Accompany with a polite Wai.",
              },
              examples: [
                { th: "สวัสดีครับ ยินดีที่ได้รู้จัก", en: "Hello, nice to meet you.", rtgs: "sa-wat-di khrap, yin-di thi dai ru-jak" },
              ],
              provenance: "OFFICIAL_CURATED",
              confidenceScore: 1.0,
            }),
        });
      }
      return Promise.reject(new Error("Unknown route"));
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders header, hero, input form, and speaker gender toggles", async () => {
    render(<ForeignerTranslatorView />);

    expect(screen.getByText(/Thai Language & Cultural Bridge/i)).toBeTruthy();
    expect(screen.getByText(/\bMale Speaker/i)).toBeTruthy();
    expect(screen.getByText(/\bFemale Speaker/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Type in English, Thai, or Romanized/i)).toBeTruthy();
  });

  it("displays translated Thai script, RTGS phonetics, and tone breakdown", async () => {
    render(<ForeignerTranslatorView />);

    await waitFor(() => {
      expect(screen.getByText(/สวัสดี/)).toBeTruthy();
      expect(screen.getByText(/sa-wat-di/)).toBeTruthy();
    }, { timeout: 8000 });

    // Tone breakdown should be visible
    expect(screen.getByText(/Tone Breakdown & Pitch Guide/i)).toBeTruthy();
    expect(screen.getAllByText(/Low Tone \(เอก\)/i).length).toBeGreaterThanOrEqual(1);
  });

  it("switches gender variants to Female Speaker with polite 'ค่ะ'", async () => {
    render(<ForeignerTranslatorView />);

    await waitFor(() => {
      expect(screen.getByText(/สวัสดี/)).toBeTruthy();
    }, { timeout: 8000 });

    const femaleBtn = screen.getByText(/Female Speaker/i);
    fireEvent.click(femaleBtn);

    await waitFor(() => {
      expect(screen.getByText("สวัสดีค่ะ")).toBeTruthy();
      expect(screen.getByText("[ sa-wat-di kha ]")).toBeTruthy();
    }, { timeout: 8000 });
  });

  it("triggers audioManager.toggle when listen pronunciation button is clicked", async () => {
    const toggleSpy = vi.spyOn(audioManager, "toggle").mockResolvedValue();

    render(<ForeignerTranslatorView />);

    await waitFor(() => {
      expect(screen.getByText(/สวัสดี/)).toBeTruthy();
    }, { timeout: 8000 });

    const audioBtn = screen.getByRole("button", { name: /Listen Pronunciation/i });
    fireEvent.click(audioBtn);

    expect(toggleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        headword: expect.stringMatching(/สวัสดี/),
      })
    );
  });

  it("renders survival preset categories and allows clicking a preset phrase", async () => {
    render(<ForeignerTranslatorView />);

    expect(screen.getByText(/Foreigner Travel & Daily Life Survival Kits/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /🍜 Food & Dining/i })).toBeTruthy();

    const notSpicyPreset = screen.getByText("Not spicy please");
    expect(notSpicyPreset).toBeTruthy();

    fireEvent.click(notSpicyPreset);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("q=Not%20spicy%20please")
    );
  });

  it("copies Thai script to clipboard when copy button is clicked", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<ForeignerTranslatorView />);

    await waitFor(() => {
      expect(screen.getByText("สวัสดีครับ")).toBeTruthy();
    });

    const copyBtn = screen.getByRole("button", { name: /Copy Thai/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith("สวัสดีครับ");
  });
});
