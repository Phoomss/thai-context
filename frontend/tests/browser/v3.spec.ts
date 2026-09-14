import { test, expect, type Page } from "@playwright/test";

async function search(page: Page, query = "ทำงานทรัพยากร") {
  await page.locator("#meaning").fill(query);
  await page.getByRole("button", { name: "ค้นหาคำที่ใช่", exact: true }).click();
  await expect(page.locator(".experience")).toHaveAttribute("data-experience-state", "results-active");
  await expect(page.locator("#word-title")).toBeVisible();
  await expect(page.locator(".transition-overlay")).toHaveCSS("opacity", "0");
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
}

test("cinematic, selection, composer, evidence, share and reverse scroll", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator("#meaning")).toBeEditable();
  await expect(page.locator("#hero")).toHaveAttribute("data-scene", "ready");
  await page.screenshot({ path: "test-results/v3-hero-desktop.png" });
  await search(page);
  await expect(page.locator(".candidate-row")).toHaveCount(4);
  await page.locator(".candidate-row").nth(1).click();
  await expect(page.locator("#word-title")).toHaveText("ประสิทธิผล");
  await page.locator(".word-detail .compare-button").click();
  await expect(page.locator(".word-detail .compare-button")).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "แชร์ความหมายของคำว่า ประสิทธิผล" }).click();
  await expect(page.locator(".share-dialog")).toBeVisible();
  const shared = await page.getByLabel("ลิงก์สำหรับแชร์").inputValue();
  await page.keyboard.press("Escape");
  await expect(page.locator(".share-dialog")).not.toBeVisible();
  await page.locator(".sources-panel .evidence-button").click();
  await expect(page.locator(".evidence-drawer")).toBeVisible();
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator(".evidence-drawer")).not.toBeVisible();
  await page.screenshot({ path: "test-results/v3-workspace-desktop.png" });
  const y = await page.evaluate(() => scrollY);
  await page.locator("#persistent-meaning").fill("วิจัย");
  await page.getByRole("button", { name: "ค้นหาคำอีกครั้ง" }).click();
  await expect(page.locator("#word-title")).toHaveText("วิจัย");
  expect(Math.abs(await page.evaluate(() => scrollY) - y)).toBeLessThan(3);
  await expect(page.locator("#hero")).toHaveAttribute("data-state", "completed");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.locator(".navbar")).not.toHaveClass(/navbar-floating/);
  await expect(page.locator(".composer-wrap")).toHaveCSS("visibility", "hidden");
  await expect(page.locator("#meaning")).toBeEditable();
  await page.goto(shared);
  await expect(page.locator("#word-title")).toHaveText("ประสิทธิผล");
  await expect(page.locator("#hero")).toHaveAttribute("data-state", "idle");
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await expect(page.locator(".composer-wrap")).toHaveCSS("visibility", "hidden");
  await noOverflow(page);
  expect(errors).toEqual([]);
});

for (const width of [375, 430, 768, 900, 1024, 1280, 1440]) {
  test(`responsive ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await noOverflow(page);
    const heroBox = await page.locator("#hero").boundingBox();
    const inputBox = await page.locator("#meaning").boundingBox();
    expect(inputBox!.y + inputBox!.height).toBeLessThan(heroBox!.height);
    await page.screenshot({ path: `test-results/v3-hero-${width}.png` });
    await search(page);
    await noOverflow(page);
    const composer = await page.locator(".composer-wrap").boundingBox();
    expect(composer!.x).toBeGreaterThanOrEqual(0);
    expect(composer!.x + composer!.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `test-results/v3-results-${width}.png` });
    await page.locator(".candidate-row").last().click();
    await expect(page.locator("#word-title")).toHaveText("มัธยัสถ์");
    if (width < 900) {
      await page.getByRole("button", { name: "เปิดเมนู" }).click();
      await page.locator("#primary-navigation").getByRole("link", { name: "ภาษาถิ่น", exact: true }).click();
      await expect(page.locator("#menu-toggle")).toHaveAttribute("aria-expanded", "false");
    }
    await page.locator("#evolution").scrollIntoViewIfNeeded();
    await page.getByRole("tab", { name: /๒๕๔๒/ }).click();
    await expect(page.locator(".era-content")).toHaveAttribute("data-era-state", "NOT_FOUND");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".era-content")).toHaveAttribute("data-era-state", "ADDED");
    await page.locator("#dialects").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: /ใต้/ }).click();
    await noOverflow(page);
  });
}

test("WebGL unavailable uses a working poster and search fallback", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === "webgl2") return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator("#hero")).toHaveAttribute("data-scene", "fallback");
  await expect(page.locator(".book-poster")).toBeVisible();
  await search(page);
  expect(errors).toEqual([]);
});

test("empty, slow API and failed API remain usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/search", async route => {
    await new Promise(resolve => setTimeout(resolve, 700));
    await route.continue();
  });
  await page.goto("/");
  await page.locator("#meaning").fill("xyzไม่พบคำ");
  await page.getByRole("button", { name: "ค้นหาคำที่ใช่", exact: true }).click();
  await expect(page.locator(".result-skeleton")).toHaveCount(3);
  await expect(page.getByText("ยังไม่พบคำที่ตรงพอ", { exact: true })).toBeVisible();
  await page.unroute("**/api/search");
  await page.route("**/api/search", route => route.abort());
  await page.locator("#persistent-meaning").fill("ทำงาน");
  await page.getByRole("button", { name: "ค้นหาคำอีกครั้ง" }).click();
  await expect(page.locator(".result-error")).toBeVisible();
});
