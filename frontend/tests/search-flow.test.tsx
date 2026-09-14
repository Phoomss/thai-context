import React, { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import gsap from "gsap";
import SearchExperience from "../src/components/SearchExperience";
import { mockSearch } from "../src/lib/mock-search";
// Replace only GPU scene. Real Hero DOM, GSAP, reducer, fetch client and result UI execute.
vi.mock("next/dynamic", () => ({
  default: () =>
    function Scene({ onReady }: { onReady: () => void }) {
      useEffect(() => onReady(), [onReady]);
      return <div data-testid="gpu-stub" />;
    },
}));
let resolveFetch: (v: Response) => void;
let pending: Promise<Response>;
let timelines: gsap.core.Timeline[] = [];
const original = gsap.timeline.bind(gsap);
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ getExtension: () => null } as unknown as WebGL2RenderingContext);
  timelines = [];
  pending = new Promise((r) => (resolveFetch = r));
  vi.spyOn(gsap, "timeline").mockImplementation((vars) => {
    const t = original(vars);
    timelines.push(t);
    return t;
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(() => pending),
  );
});
afterEach(() => {
  cleanup();
  gsap.globalTimeline.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function submitHero(q = "ทำงาน") {
  fireEvent.change(screen.getByLabelText("ความหมายที่คุณอยากสื่อ"), {
    target: { value: q },
  });
  fireEvent.click(screen.getByRole("button", { name: "ค้นหาคำที่ใช่" }));
  return timelines[0];
}
async function respond(q = "ทำงาน") {
  await act(async () => {
    resolveFetch(Response.json(mockSearch(q)));
    await pending;
  });
}
function seek(t: gsap.core.Timeline, time: number) {
  act(() => {
    t.pause();
    t.time(time, false);
  });
}
const phase = () =>
  document.querySelector(".experience")?.getAttribute("data-experience-state");

describe("Search orchestration with real GSAP and DOM", () => {
  it("starts request immediately, stages early data until full white, jumps once, then reveals", async () => {
    render(<SearchExperience />);
    const t = submitHero();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(phase()).toBe("hero-cinematic-transition");
    expect(t.duration()).toBeCloseTo(1.92);
    await respond();
    expect((document.querySelector(".results-inner") as HTMLElement).style.visibility).toBe("hidden");
    let opacityAtJump = "";
    vi.mocked(HTMLElement.prototype.scrollIntoView).mockImplementation(
      function (this: HTMLElement, options) {
        if (this.id === "search-results") {
          opacityAtJump = (
            document.querySelector(".transition-overlay") as HTMLElement
          ).style.opacity;
          expect(options).toEqual({ behavior: "auto", block: "start" });
        }
      },
    );
    seek(t, 1.6);
    expect(opacityAtJump).toBe("1");
    expect(phase()).toBe("results-active");
    expect(document.querySelectorAll(".candidate-row")).toHaveLength(3);
    expect(document.querySelector(".navbar-floating")).not.toBeNull();
    expect(document.querySelector(".bottom-composer")).not.toBeNull();
    expect(
      (document.querySelector(".results-inner") as HTMLElement).style
        .visibility,
    ).toBe("hidden");
    seek(t, 1.92);
    expect(
      (document.querySelector(".transition-overlay") as HTMLElement).style
        .opacity,
    ).toBe("0");
    expect(
      (document.querySelector(".results-inner") as HTMLElement).style
        .visibility,
    ).toBe("visible");
    expect(document.activeElement?.id).toBe("results-title");
    expect(document.body.style.overflow).not.toBe("hidden");
  });
  it("does not hold white for a slow response, then fills the skeleton", async () => {
    render(<SearchExperience />);
    const t = submitHero();
    seek(t, 1.6);
    expect(document.querySelectorAll(".result-skeleton")).toHaveLength(3);
    seek(t, 1.92);
    expect(
      (document.querySelector(".transition-overlay") as HTMLElement).style
        .opacity,
    ).toBe("0");
    await respond("วิจัย");
    expect(document.querySelectorAll(".candidate-row")).toHaveLength(1);
    expect(document.querySelectorAll(".result-skeleton")).toHaveLength(0);
  });
  it("composer updates directly without cinematic replay or a second scroll", async () => {
    render(<SearchExperience />);
    const t = submitHero();
    await respond();
    seek(t, 1.92);
    const oldScroll = vi.mocked(HTMLElement.prototype.scrollIntoView).mock.calls
      .length;
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json(mockSearch("ช่วยกัน")),
    );
    fireEvent.change(screen.getByLabelText("เล่าความหมายอื่นที่คุณกำลังคิด"), {
      target: { value: "ช่วยกัน" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "ค้นหาคำอีกครั้ง" }));
    });
    expect(document.querySelectorAll(".candidate-row")).toHaveLength(2);
    expect(timelines).toHaveLength(1);
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(
      oldScroll,
    );
    expect(phase()).toBe("results-active");
  });
  it.each([
    ["ไม่พบคำนี้xyz", 0],
    ["วิจัย", 1],
    ["ช่วยกัน", 2],
    ["ทำงาน", 3],
    ["ทำงานทรัพยากร", 4],
  ])("renders query %s with %i results", async (q, count) => {
    render(<SearchExperience />);
    const t = submitHero(q);
    await respond(q);
    seek(t, 1.92);
    expect(document.querySelectorAll(".candidate-row")).toHaveLength(count);
    if (!count) expect(screen.getByText("ยังไม่พบคำที่ตรงพอ")).toBeTruthy();
  });
  it("reduced motion uses the short fade and still reaches results", async () => {
    vi.mocked(matchMedia).mockReturnValue({
      matches: true,
      media: "",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    render(<SearchExperience />);
    const t = submitHero();
    await respond();
    expect(t.duration()).toBeCloseTo(0.28);
    seek(t, 0.28);
    expect(phase()).toBe("results-active");
    expect(document.querySelectorAll(".candidate-row")).toHaveLength(3);
  });
  it("blank input does not request; evidence opens and closes through the central state", async () => {
    render(<SearchExperience />);
    fireEvent.click(screen.getByRole("button", { name: "ค้นหาคำที่ใช่" }));
    expect(fetch).not.toHaveBeenCalled();
    const t = submitHero("วิจัย");
    await respond("วิจัย");
    seek(t, t.duration());
    fireEvent.click(
      screen.getByRole("button", { name: /สถานะหลักฐานอ้างอิง/ }),
    );
    expect(phase()).toBe("evidence-open");
    expect(screen.getByText("ยังไม่มีหลักฐานที่รับรอง")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "ปิดหลักฐาน" }));
    expect(phase()).toBe("results-active");
  });
  it("can return to the approved Hero and play its cinematic again", async () => {
    render(<SearchExperience />);
    const t = submitHero();
    await respond();
    seek(t, t.duration());
    fireEvent.click(screen.getByRole("link", { name: "THAI CONTEXT หน้าแรก" }));
    expect(phase()).toBe("hero-idle");
    expect(document.getElementById("hero")?.getAttribute("data-state")).toBe(
      "idle",
    );
    const t2 = submitHero("วิจัย");
    expect(t2).toBe(t);
    expect(timelines).toHaveLength(2);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("supports comparison, era tabs and dialect provenance interactions", async () => {
    render(<SearchExperience />);
    const t = submitHero("ทำงาน");
    await respond("ทำงาน");
    seek(t, t.duration());

    expect(screen.getByRole("heading", { name: "เปรียบเทียบคำในบริบท" })).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "เลือกเปรียบเทียบ" })[0]);
    expect(
      screen.getByRole("button", { name: "เลือกเทียบแล้ว" }).getAttribute("aria-pressed"),
    ).toBe("true");

    fireEvent.click(screen.getByRole("tab", { name: /๒๕๖๙/ }));
    expect(document.querySelector(".era-status")?.textContent).toContain("MODIFIED");

    fireEvent.click(screen.getByRole("button", { name: /ใต้/ }));
    expect(screen.getByText(/AI ช่วยอนุมาน — ต้องตรวจสอบ/)).toBeTruthy();
  });
});
