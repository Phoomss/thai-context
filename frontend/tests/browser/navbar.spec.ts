import { test, expect, type Page } from "@playwright/test";

async function expectFloating(page: Page) {
  const nav = page.locator(".navbar");
  await expect(nav).toHaveCount(1);
  await expect(nav).toHaveClass(/navbar-floating/);
  await expect(nav).toHaveCSS("opacity", "1");
  await expect(nav).not.toHaveAttribute("inert", "");
  await expect.poll(() => nav.evaluate(element => getComputedStyle(element, "::before").opacity)).toBe("1");
  await expect.poll(() => nav.evaluate(element => element.getBoundingClientRect().width)).toBeLessThanOrEqual(1180);
  const appearance = await nav.evaluate(element => {
    const surface = getComputedStyle(element, "::before");
    const rect = element.getBoundingClientRect();
    return { background: surface.backgroundColor, blur: surface.backdropFilter,
      inViewport: rect.top >= 0 && rect.bottom < innerHeight,
      hit: !!document.elementFromPoint(rect.x + 30, rect.y + rect.height / 2)?.closest(".navbar") };
  });
  expect(appearance).toMatchObject({ background: "rgba(255, 255, 255, 0.72)", inViewport: true, hit: true });
  expect(appearance.blur).toContain("blur(20px)");
}

for (const width of [375, 768, 1024, 1440, 1920]) {
  test(`navbar morph ${width}px without searching and back`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("#meaning")).toBeEditable();
    const original = await page.locator(".navbar").elementHandle();
    for (let cycle = 0; cycle < 2; cycle++) {
      await page.locator("#hero").evaluate(hero => scrollTo({ top: hero.getBoundingClientRect().height + 20, behavior: "instant" }));
      await expectFloating(page);
      expect(await original!.evaluate(element => element === document.querySelector(".navbar"))).toBe(true);
      if (!cycle) await page.screenshot({ path: `test-results/navbar/floating-${width}.png` });
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await expect(page.locator(".navbar")).not.toHaveClass(/navbar-floating/);
      await expect(page.locator(".navbar")).toHaveCSS("opacity", "1");
      await expect.poll(() => page.locator(".navbar").evaluate(element => getComputedStyle(element, "::before").opacity)).toBe("0");
    }
    expect(errors).toEqual([]);
  });
}

test("anchor initialization, resize and reduced motion retain floating navigation", async ({ page }) => {
  await page.goto("/#dialects");
  await expectFloating(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expectFloating(page);
  await page.locator("#menu-toggle").click();
  await page.locator("#primary-navigation a[href='#evolution']").click();
  await expect(page.locator("#menu-toggle")).toHaveAttribute("aria-expanded", "false");
  await expectFloating(page);
  await page.locator(".wordmark").click();
  await expect(page.locator("#meaning")).toBeFocused();
  await expect(page.locator(".navbar")).not.toHaveClass(/navbar-floating/);
});

test("cinematic restores visible navbar and composer searches do not hide it", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#hero")).toHaveAttribute("data-scene", "ready");
  await page.locator("#meaning").fill("ทำงานทรัพยากร");
  await page.locator(".search-submit").click();
  await expect(page.locator(".navbar")).toHaveAttribute("data-cinematic", "true");
  await expect(page.locator(".transition-overlay")).toHaveCSS("opacity", "0");
  await expect(page.locator("#hero")).toHaveAttribute("data-state", "completed");
  await expectFloating(page);
  await page.locator("#persistent-meaning").fill("วิจัย");
  await page.locator(".bottom-composer button").click();
  await expect(page.locator("#word-title")).toHaveText(/^วิจัย(?: \(research\))?$/);
  await expectFloating(page);
});
