import { test, expect } from "@playwright/test";

for (const width of [375, 390, 768, 1024, 1440, 1920]) {
  test(`UI audit ${width}px: layout, navigation, sections and runtime`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
      if (message.type() === "error" || /hydration|react warning/i.test(message.text())) errors.push(message.text());
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("#meaning")).toBeEditable();
    await expect(page.locator("#hero")).toHaveAttribute("data-scene", /ready|fallback/);
    await page.evaluate(() => document.fonts.ready);
    const navBefore = await page.locator(".navbar").boundingBox();
    const copy = await page.locator(".hero-copy").boundingBox();
    const foot = await page.locator(".hero-foot").boundingBox();
    expect(copy!.y + copy!.height).toBeLessThan(foot!.y);
    await page.screenshot({ path: `test-results/ui-audit/hero-${width}.png` });
    await page.locator("#meaning").fill("ทำงานทรัพยากร");
    await page.locator(".search-submit").click();
    await expect(page.locator("#word-title")).toHaveText("ประสิทธิภาพ");
    await expect(page.locator(".transition-overlay")).toHaveCSS("opacity", "0");
    await expect(page.locator(".word-detail")).toHaveCSS("opacity", "1");
    const navAfter = await page.locator(".navbar").boundingBox();
    expect(navAfter!.width).toBeLessThan(navBefore!.width);
    expect(navAfter!.width).toBeLessThanOrEqual(1180);
    expect(navAfter!.height).toBeLessThan(navBefore!.height);
    await page.screenshot({ path: `test-results/ui-audit/results-${width}.png` });
    for (const id of ["compare", "evolution", "dialects"]) {
      await page.locator(`#${id}`).evaluate(element => element.scrollIntoView({ behavior: "instant", block: "start" }));
      await expect(page.locator(`#${id} .section-heading`)).toHaveCSS("opacity", "1");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      await page.screenshot({ path: `test-results/ui-audit/${id}-${width}.png` });
    }
    if (width < 900) {
      await page.locator("#menu-toggle").click();
      await expect(page.locator("#menu-toggle")).toHaveAttribute("aria-expanded", "true");
      await page.locator("#dialect-title").click();
      await expect(page.locator("#menu-toggle")).toHaveAttribute("aria-expanded", "false");
    }
    expect(errors).toEqual([]);
  });
}

test("reduced motion reveals pending sections; enlarged mobile text stays inside hero", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await expect(page.locator("#meaning")).toBeEditable();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("#dialects .section-heading")).toHaveCSS("opacity", "1");
  await page.addStyleTag({ content: ".hero-copy { font-size:20px } .hero-copy h1 { font-size:48px } .support { font-size:20px }" });
  const copy = await page.locator(".hero-copy").boundingBox();
  const foot = await page.locator(".hero-foot").boundingBox();
  const hero = await page.locator("#hero").boundingBox();
  expect(copy!.y + copy!.height).toBeLessThan(foot!.y);
  expect(foot!.y + foot!.height).toBeLessThan(hero!.height);
  await page.screenshot({ path: "test-results/ui-audit/enlarged-mobile.png" });
});

test("input feedback, filter recovery, card hover and keyboard reveal remain usable", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#meaning")).toBeEditable();
  await page.locator("#meaning").focus();
  await expect(page.locator(".hero-search")).toHaveCSS("border-top-color", "rgb(108, 159, 217)");
  await page.locator("#meaning").fill("ทำงานทรัพยากร");
  await page.locator(".search-submit").click();
  await expect(page.locator("#word-title")).toBeVisible();
  await page.locator(".smart-filters input").fill("ประสิทธิภาพ ประสิทธิผล สัมฤทธิผล มัธยัสถ์");
  await expect(page.locator(".empty-results")).toBeVisible();
  await page.locator(".empty-results button").click();
  await expect(page.locator(".candidate-row")).toHaveCount(4);
  await expect(page.locator("#persistent-meaning")).toBeFocused();
  // Programmatic focus models keyboard navigation into a section below the viewport.
  await page.locator(".dialect-card").first().focus();
  await expect(page.locator(".dialect-card").first()).toHaveCSS("opacity", "0.85");
  await page.locator(".dialect-card").first().hover();
  await expect(page.locator(".dialect-card").first()).toHaveCSS("translate", "0px -4px");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".dialect-card").first()).toHaveCSS("translate", "none");
});
