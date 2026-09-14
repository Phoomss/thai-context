import { test, expect } from "@playwright/test";

test("Hero background video autoplays behind the existing interface", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const hero = page.locator("#hero");
  const video = page.locator(".hero-background-video");
  const initialHeroBox = await hero.boundingBox();
  await expect(video).toBeVisible();
  await expect(video).toHaveAttribute("autoplay", "");
  await expect(video).toHaveAttribute("loop", "");
  await expect(video).toHaveAttribute("playsinline", "");
  await expect(video).toHaveAttribute("preload", "metadata");
  await expect(video).toHaveAttribute(
    "poster",
    "/assets/thai-context-hero-poster.webp",
  );
  expect(
    await video.locator("source").evaluateAll(sources =>
      sources.map(source => ({
        src: source.getAttribute("src"),
        type: source.getAttribute("type"),
      })),
    ),
  ).toEqual([
    { src: "/assets/thai-context-hero-bg.webm", type: "video/webm" },
    { src: "/assets/thai-context-hero-bg.mp4", type: "video/mp4" },
  ]);

  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).readyState)).toBeGreaterThanOrEqual(2);
  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).paused)).toBe(false);
  expect(await video.evaluate(element => (element as HTMLVideoElement).muted)).toBe(true);
  expect(await video.evaluate(element => (element as HTMLVideoElement).currentSrc)).toMatch(
    /thai-context-hero-bg\.webm$/,
  );
  await expect(video).toHaveCSS("object-fit", "cover");
  await expect(video).toHaveCSS("pointer-events", "none");
  await expect(page.locator("#meaning")).toBeEditable();
  await expect(page.locator(".navbar")).toBeVisible();
  expect(await hero.boundingBox()).toEqual(initialHeroBox);

  const firstTime = await video.evaluate(element => (element as HTMLVideoElement).currentTime);
  await page.waitForTimeout(300);
  expect(await video.evaluate(element => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(firstTime);
  expect(await video.evaluate(element => (element as HTMLVideoElement).error)).toBeNull();

  const duration = await video.evaluate(element => (element as HTMLVideoElement).duration);
  await expect
    .poll(
      () => video.evaluate(element => (element as HTMLVideoElement).currentTime),
      { timeout: 12000, intervals: [100] },
    )
    .toBeGreaterThan(duration - 0.75);
  await expect
    .poll(
      () => video.evaluate(element => (element as HTMLVideoElement).currentTime),
      { timeout: 3000, intervals: [50] },
    )
    .toBeLessThan(0.75);
  expect(await video.evaluate(element => (element as HTMLVideoElement).paused)).toBe(false);
  expect(errors).toEqual([]);
});

test("video remains cover-sized while responsive Search and cinematic flow work", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error" || /hydration|react warning/i.test(message.text()))
      errors.push(message.text());
  });
  await page.goto("/");

  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    const heroBox = await page.locator("#hero").boundingBox();
    const videoBox = await page.locator(".hero-background-video").boundingBox();
    expect(videoBox).toEqual(heroBox);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      ),
    ).toBe(true);
    await expect(page.locator("#meaning")).toBeEditable();
    await expect(page.locator(".navbar")).toBeVisible();
  }

  await page.locator("#meaning").fill("ทำงานทรัพยากร");
  await page.locator(".search-submit").click();
  await expect(page.locator(".experience")).toHaveAttribute(
    "data-experience-state",
    "results-active",
  );
  await expect(page.locator("#word-title")).toBeVisible();
  await expect(page.locator(".transition-overlay")).toHaveCSS("opacity", "0");
  expect(errors).toEqual([]);
});

test("reduced motion uses the poster without requesting video files", async ({ page }) => {
  const videoRequests: string[] = [];
  page.on("request", request => {
    if (/thai-context-hero-bg\.(?:webm|mp4)$/.test(request.url()))
      videoRequests.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator(".hero-background-video")).toHaveCount(0);
  await expect(page.locator(".hero-background")).toHaveCSS(
    "background-image",
    /thai-context-hero-poster\.webp/,
  );
  await expect(page.locator("#meaning")).toBeEditable();
  expect(videoRequests).toEqual([]);
});
