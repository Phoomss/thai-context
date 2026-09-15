import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { getSignResource, SIGN_CATALOG } from "@/lib/sign-motion-data";
import { encodeThaiToBraille } from "@/lib/braille-encoder";
import LanguageRepresentationCard from "@/components/accessibility/LanguageRepresentationCard";
import SmartFilters, { type SmartFilterValue } from "@/components/search/SmartFilters";
import { audioManager } from "@/lib/audio-manager";
import { GET as getAccessibilityWord } from "@/app/api/v1/accessibility/words/[word]/route";
import { POST as convertBrailleRoute } from "@/app/api/v1/accessibility/braille/convert/route";
import { POST as checkAccessibilityRoute } from "@/app/api/v1/accessibility/check/route";
import { NextRequest } from "next/server";

describe("THAI CONTEXT — Accessibility Expansion", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. Strict Data Governance & Sign Language Catalog", () => {
    it("provides verified 3D motion data for core hackathon demo terms", () => {
      const welcome = getSignResource("ต้อนรับ");
      expect(welcome.status).toBe("VERIFIED");
      expect(welcome.representation?.type).toBe("MOTION");
      expect(welcome.representation?.data?.frames.length).toBeGreaterThan(0);

      const student = getSignResource("นักศึกษา");
      expect(student.status).toBe("VERIFIED");
      expect(student.representation?.type).toBe("MOTION");

      const delight = getSignResource("ยินดี");
      expect(delight.status).toBe("VERIFIED");

      const effectiveness = getSignResource("ประสิทธิผล");
      expect(effectiveness.status).toBe("VERIFIED");

      const develop = getSignResource("พัฒนา");
      expect(develop.status).toBe("VERIFIED");
    });

    it("returns NOT_AVAILABLE with strict provenance policy for unverified words (No AI Hallucination)", () => {
      const unverified = getSignResource("มหาวิทยาลัย");
      expect(unverified.status).toBe("NOT_AVAILABLE");
      expect(unverified.message).toContain("จะไม่สร้างท่ามือขึ้นเอง");
    });
  });

  describe("2. Deterministic Thai Braille & Conversion API", () => {
    it("encodes Thai text to standard Unicode Braille deterministically", () => {
      const result = encodeThaiToBraille("สวัสดี");
      expect(result.brailleUnicode.length).toBeGreaterThan(0);
      expect(result.brailleCells.length).toBe(6); // ส, ว, ั, ส, ด, ี
      expect(result.readingGuide).toContain("สะกดอักษรเบรลล์");
    });

    it("POST /api/v1/accessibility/braille/convert converts text and generates export formats", async () => {
      const req = new NextRequest("http://localhost/api/v1/accessibility/braille/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "ต้อนรับ" }),
      });

      const res = await convertBrailleRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.text).toBe("ต้อนรับ");
      expect(data.brailleUnicode).toBeDefined();
      expect(data.cells.length).toBeGreaterThan(0);
      expect(data.export.accessibleFormat).toContain("[ข้อความภาษาไทย]: ต้อนรับ");
    });
  });

  describe("3. Accessibility Check API & Readiness Evaluation", () => {
    it("POST /api/v1/accessibility/check analyzes text, detects sign terms, and evaluates readiness", async () => {
      const req = new NextRequest("http://localhost/api/v1/accessibility/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "ขอต้อนรับนักศึกษาและคณาจารย์ทุกท่าน ด้วยความยินดียิ่ง",
        }),
      });

      const res = await checkAccessibilityRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.readinessScore).toBeGreaterThanOrEqual(70);
      expect(data.readinessRating).toBe("HIGH");
      expect(data.disclaimer).toContain("ไม่ใช่การรับรองทางกฎหมาย");

      // Verify recognized sign terms
      const signWords = data.detectedSignTerms.map((t: any) => t.word);
      expect(signWords).toContain("ต้อนรับ");
      expect(signWords).toContain("นักศึกษา");
      expect(signWords).toContain("ยินดี");

      // Verify Braille output
      expect(data.braille.unicode).toBeDefined();
      expect(data.checklist.length).toBeGreaterThan(0);
    });
  });

  describe("4. Unified Accessibility Word API", () => {
    it("GET /api/v1/accessibility/words/[word] aggregates audio, sign language, and braille", async () => {
      const req = new NextRequest("http://localhost/api/v1/accessibility/words/ต้อนรับ");
      const res = await getAccessibilityWord(req, {
        params: Promise.resolve({ word: "ต้อนรับ" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.word).toBe("ต้อนรับ");
      expect(data.audio.available).toBe(true);
      expect(data.signLanguage.available).toBe(true);
      expect(data.signLanguage.status).toBe("VERIFIED");
      expect(data.braille.available).toBe(true);
      expect(data.braille.unicode).toBeDefined();
      expect(data.governance.isDeterministic).toBe(true);
    });
  });

  describe("5. LanguageRepresentationCard Component", () => {
    it("renders multimodal selector tabs: text, audio, sign language, braille", () => {
      render(
        <LanguageRepresentationCard
          word="ต้อนรับ"
          definition="รับรองผู้มาหาหรือแขกผู้มาเยือน"
          english="Welcome"
        />
      );

      expect(screen.getByRole("tab", { name: /ข้อความ/i })).toBeTruthy();
      expect(screen.getByRole("tab", { name: /เสียง/i })).toBeTruthy();
      expect(screen.getByRole("tab", { name: /ภาษามือ/i })).toBeTruthy();
      expect(screen.getByRole("tab", { name: /เบรลล์/i })).toBeTruthy();
    });

    it("switches to Braille tab and displays Unicode Braille and copy button", () => {
      render(
        <LanguageRepresentationCard
          word="ต้อนรับ"
          definition="รับรองผู้มาหาหรือแขกผู้มาเยือน"
        />
      );

      const brailleTab = screen.getByRole("tab", { name: /เบรลล์/i });
      fireEvent.click(brailleTab);

      expect(screen.getByText(/Unicode Thai Braille/i)).toBeTruthy();
      expect(screen.getByText(/คัดลอกเบรลล์/i)).toBeTruthy();
      expect(screen.getByText(/โครงสร้างจุดนูนมาตรฐาน 6 จุด/i)).toBeTruthy();
    });

    it("switches to Sign Language tab and shows verified badge and speed toggles", () => {
      render(
        <LanguageRepresentationCard
          word="ต้อนรับ"
          definition="รับรองผู้มาหาหรือแขกผู้มาเยือน"
        />
      );

      const signTab = screen.getByRole("tab", { name: /ภาษามือ/i });
      fireEvent.click(signTab);

      expect(
        screen.getByText(/ผ่านการตรวจสอบความถูกต้อง \(Verified TSL\)/i)
      ).toBeTruthy();
      expect(screen.getAllByText(/0\.5x/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/1\.5x/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/ค้นหาจากภาษามือไทย/i)).toBeTruthy();
    });

    it("switches to Audio tab and plays pronunciation", () => {
      const toggleSpy = vi.spyOn(audioManager, "toggle").mockImplementation(async () => {});

      render(
        <LanguageRepresentationCard
          word="ต้อนรับ"
          phonetic="tɔ́ɔn-ráp"
        />
      );

      const audioTab = screen.getByRole("tab", { name: /เสียง/i });
      fireEvent.click(audioTab);

      expect(toggleSpy).toHaveBeenCalled();
    });
  });

  describe("6. SmartFilters Accessibility Toggles", () => {
    it("renders accessibility checkboxes and notifies onChange", () => {
      const onChange = vi.fn();
      const value: SmartFilterValue = {
        register: "",
        context: "",
        excluded: "",
        hasSignLanguage: false,
        hasAudio: false,
        hasBraille: false,
        hasEnglish: false,
      };

      render(
        <SmartFilters
          registers={["ทางการ", "กึ่งทางการ"]}
          contexts={["การศึกษา", "ทั่วไป"]}
          value={value}
          disabled={false}
          onChange={onChange}
        />
      );

      const signCheckbox = screen.getByLabelText(/มีภาษามือไทย/i);
      expect(signCheckbox).toBeTruthy();

      fireEvent.click(signCheckbox);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ hasSignLanguage: true })
      );

      const brailleCheckbox = screen.getByLabelText(/มีเบรลล์/i);
      fireEvent.click(brailleCheckbox);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ hasBraille: true })
      );
    });
  });
});
