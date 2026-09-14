import { expect, test, type Page } from "@playwright/test";

const thaiSamples = [
  "เกื้อหนุน",
  "ละเอียดอ่อน",
  "ผู้เชี่ยวชาญ",
  "วิจารณญาณ",
  "สิ่งแวดล้อม",
  "ประณีต",
  "น้ำใจ",
];

async function openResults(page: Page) {
  await page.goto("/");
  await page.locator("#meaning").fill("ทำงานทรัพยากร");
  await page.getByRole("button", { name: "ค้นหาคำที่ใช่", exact: true }).click();
  await expect(page.locator("#word-title")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

for (const width of [1440, 768, 375]) {
  test(`Thai learning typography remains readable at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.setViewportSize({ width, height: 950 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openResults(page);

    const typography = await page.evaluate(async (samples) => {
      await document.fonts.ready;
      const style = (selector: string) => getComputedStyle(document.querySelector(selector)!);
      const learningElements = [...document.querySelectorAll<HTMLElement>(".font-thai-reading")];
      const clipped = learningElements
        .filter((element) => {
          const computed = getComputedStyle(element);
          const clips = ["hidden", "clip"].includes(computed.overflowY);
          return clips && element.scrollHeight > element.clientHeight + 1;
        })
        .map((element) => element.className);

      const sample = document.createElement("div");
      sample.className = "font-thai-reading thai-diacritic-sample";
      sample.lang = "th";
      sample.textContent = samples.join("\n");
      Object.assign(sample.style, {
        position: "fixed",
        inset: "16px auto auto 16px",
        zIndex: "9999",
        width: `min(430px, calc(100vw - 32px))`,
        padding: "20px",
        background: "white",
        color: "#13233b",
        fontSize: "36px",
        fontWeight: "600",
        lineHeight: "1.8",
        letterSpacing: "normal",
        whiteSpace: "pre-line",
        overflow: "visible",
      });
      document.body.append(sample);

      return {
        bodyFont: style("body").fontFamily,
        brandFont: style(".brand").fontFamily,
        learningFonts: learningElements.map((element) => getComputedStyle(element).fontFamily),
        headwordWeight: style("#word-title").fontWeight,
        headwordLineHeight: parseFloat(style("#word-title").lineHeight),
        headwordSize: parseFloat(style("#word-title").fontSize),
        definitionLineHeight: parseFloat(style(".definition").lineHeight),
        definitionSize: parseFloat(style(".definition").fontSize),
        fontLoaded: document.fonts.check('36px "IBM Plex Sans Thai Looped"', samples.join("")),
        clipped,
      };
    }, thaiSamples);

    expect(typography.bodyFont).toContain("Noto Sans Thai");
    expect(typography.bodyFont).not.toContain("IBM Plex Sans Thai Looped");
    expect(typography.brandFont).not.toContain("IBM Plex Sans Thai Looped");
    expect(typography.learningFonts.length).toBeGreaterThan(20);
    expect(typography.learningFonts.every((font) => font.includes("IBM Plex Sans Thai Looped"))).toBe(true);
    expect(typography.headwordWeight).toBe("600");
    expect(typography.headwordLineHeight / typography.headwordSize).toBeGreaterThanOrEqual(1.5);
    expect(typography.definitionLineHeight / typography.definitionSize).toBeGreaterThanOrEqual(1.7);
    expect(typography.fontLoaded).toBe(true);
    expect(typography.clipped).toEqual([]);

    await page.locator(".thai-diacritic-sample").evaluate((element) => element.remove());

    await page.locator(".sources-panel .evidence-button").click();
    await expect(page.locator(".evidence-drawer .font-thai-reading")).toHaveCount(2);
    expect(
      await page.locator(".evidence-source").evaluate((element) => getComputedStyle(element).fontFamily),
    ).toContain("IBM Plex Sans Thai Looped");
    await page.keyboard.press("Escape");

    expect(errors).toEqual([]);
  });
}
