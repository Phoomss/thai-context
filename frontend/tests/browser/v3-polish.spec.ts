import { test, expect } from "@playwright/test";

test("ambient scene, reversible transitions, footer shortcut and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator("#hero")).toHaveAttribute("data-scene", "ready");
  const canvas = page.locator("canvas");
  const first = await canvas.screenshot();
  await page.mouse.move(1250, 400);
  await page.waitForTimeout(350);
  expect((await canvas.screenshot()).equals(first)).toBe(false);
  await page.mouse.move(0, 0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(400);
  const still = await canvas.screenshot();
  await page.waitForTimeout(300);
  expect((await canvas.screenshot()).equals(still)).toBe(true);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator("#meaning").fill("ทำงานทรัพยากร");
  await page.locator(".search-submit").click();
  await expect(page.locator("#hero")).toHaveAttribute("data-state", "completed");
  await expect(page.locator(".composer-wrap")).toHaveCSS("opacity", "1");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.locator(".composer-wrap")).toHaveAttribute("data-visible", "false");
  const duringExit = await page.locator(".composer-wrap").evaluate(e => ({
    opacity: Number(getComputedStyle(e).opacity), hidden: e.hasAttribute("inert"),
  }));
  expect(duringExit.opacity).toBeGreaterThan(0);
  expect(duringExit.hidden).toBe(false);
  await expect(page.locator(".composer-wrap")).toHaveCSS("visibility", "hidden");
  await expect(page.locator(".composer-wrap")).toHaveAttribute("inert", "");
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => scrollTo({ top: innerHeight * 1.2, behavior: "instant" }));
    await page.waitForTimeout(80);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(80);
  }
  await expect(page.locator(".navbar")).not.toHaveClass(/navbar-floating/);
  await expect(page.locator(".composer-wrap")).toHaveCSS("visibility", "hidden");
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await expect(page.locator(".composer-wrap")).toHaveCSS("visibility", "hidden");
  await page.locator(".nav-search").click();
  await expect(page.locator("#meaning")).toBeFocused();
});

test("recorded pronunciation pause/resume, stop on replacement, copy and mobile share", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  // A real PCM WAV exercises HTMLAudioElement in Chrome without relying on
  // an installed Thai speech voice or external audio service.
  const wav = Buffer.alloc(44 + 8000 * 2 * 8);
  wav.write("RIFF"); wav.writeUInt32LE(wav.length - 8, 4); wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
  wav.write("data", 36); wav.writeUInt32LE(wav.length - 44, 40);
  await page.route("**/qa-audio.wav", route => route.fulfill({ contentType: "audio/wav", body: wav }));
  await page.route("**/api/search", async route => {
    const response = await route.fetch();
    const data = await response.json();
    for (const word of data.recommendations) word.pronunciation = { audio_url: "/qa-audio.wav", locale: "th-TH" };
    await route.fulfill({ json: data });
  });
  await page.goto("/");
  await page.locator("#meaning").fill("ทำงานทรัพยากร");
  await page.locator(".search-submit").click();
  const speaker = page.locator(".audio-control button");
  await expect(speaker).toHaveAttribute("aria-pressed", "false");
  await speaker.click();
  await expect(speaker).toHaveAttribute("aria-pressed", "true");
  await speaker.click();
  await expect(speaker).toHaveAttribute("aria-pressed", "false");
  await speaker.click();
  await expect(speaker).toHaveAttribute("aria-pressed", "true");
  await page.locator(".candidate-row").nth(1).click();
  await expect(speaker).toHaveAttribute("aria-pressed", "false");
  await speaker.click();
  await expect(speaker).toHaveAttribute("aria-pressed", "true");
  await page.locator("#persistent-meaning").fill("วิจัย");
  await page.locator(".bottom-composer button").click();
  await expect(page.locator("#word-title")).toHaveText("วิจัย");
  await expect(speaker).toHaveAttribute("aria-pressed", "false");
  await page.locator(".share-control>button").click();
  await page.getByRole("button", { name: "คัดลอกความหมาย", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("วิจัย");
  await page.setViewportSize({ width: 375, height: 850 });
  await page.locator(".share-control>button").click();
  const sheet = await page.locator(".share-dialog").boundingBox();
  expect(sheet!.x).toBe(0);
  expect(sheet!.y + sheet!.height).toBeCloseTo(850, 0);
  await page.keyboard.press("Escape");
  await expect(page.locator(".share-control>button")).toBeFocused();
  await page.unroute("**/qa-audio.wav");
  await page.route("**/qa-audio.wav", route => route.fulfill({ contentType: "audio/wav", body: "invalid" }));
  await speaker.click();
  await expect(page.locator(".audio-control [role=status]")).toBeVisible();
});
