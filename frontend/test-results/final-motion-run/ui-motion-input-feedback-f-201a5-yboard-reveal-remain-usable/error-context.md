# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-motion.spec.ts >> input feedback, filter recovery, card hover and keyboard reveal remain usable
- Location: tests\browser\ui-motion.spec.ts:59:1

# Error details

```
Error: expect(locator).toHaveCSS(expected) failed

Locator:  locator('.hero-search')
Expected: "rgb(108, 159, 217)"
Received: "rgb(220, 233, 244)"
Timeout:  10000ms

Call log:
  - Expect "toHaveCSS" locator('.hero-search') with timeout 10000ms
  - waiting for locator('.hero-search')
    23 × locator resolved to <form role="search" aria-busy="false" class="hero-search">…</form>
       - unexpected value "rgb(220, 233, 244)"

```

```yaml
- search:
  - text: ความหมายที่คุณอยากสื่อ
  - textbox "ความหมายที่คุณอยากสื่อ":
    - /placeholder: "เช่น อยากได้คำที่หมายถึง “ทำงานได้ผลดี\nโดยใช้ทรัพยากรน้อย”"
  - button "ค้นหาคำที่ใช่"
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | for (const width of [375, 390, 768, 1024, 1440, 1920]) {
  4  |   test(`UI audit ${width}px: layout, navigation, sections and runtime`, async ({ page }) => {
  5  |     const errors: string[] = [];
  6  |     page.on("pageerror", error => errors.push(error.message));
  7  |     page.on("console", message => {
  8  |       if (message.type() === "error" || /hydration|react warning/i.test(message.text())) errors.push(message.text());
  9  |     });
  10 |     await page.setViewportSize({ width, height: 900 });
  11 |     await page.goto("/");
  12 |     await expect(page.locator("#meaning")).toBeEditable();
  13 |     await expect(page.locator("#hero")).toHaveAttribute("data-scene", /ready|fallback/);
  14 |     await page.evaluate(() => document.fonts.ready);
  15 |     const navBefore = await page.locator(".navbar").boundingBox();
  16 |     const copy = await page.locator(".hero-copy").boundingBox();
  17 |     const foot = await page.locator(".hero-foot").boundingBox();
  18 |     expect(copy!.y + copy!.height).toBeLessThan(foot!.y);
  19 |     await page.screenshot({ path: `test-results/ui-audit/hero-${width}.png` });
  20 |     await page.locator("#meaning").fill("ทำงานทรัพยากร");
  21 |     await page.locator(".search-submit").click();
  22 |     await expect(page.locator("#word-title")).toHaveText("ประสิทธิภาพ");
  23 |     await expect(page.locator(".transition-overlay")).toHaveCSS("opacity", "0");
  24 |     await expect(page.locator(".word-detail")).toHaveCSS("opacity", "1");
  25 |     const navAfter = await page.locator(".navbar").boundingBox();
  26 |     expect(navAfter).toEqual(navBefore);
  27 |     await page.screenshot({ path: `test-results/ui-audit/results-${width}.png` });
  28 |     for (const id of ["compare", "evolution", "dialects"]) {
  29 |       await page.locator(`#${id}`).evaluate(element => element.scrollIntoView({ behavior: "instant", block: "start" }));
  30 |       await expect(page.locator(`#${id} .section-heading`)).toHaveCSS("opacity", "1");
  31 |       expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  32 |       await page.screenshot({ path: `test-results/ui-audit/${id}-${width}.png` });
  33 |     }
  34 |     if (width < 900) {
  35 |       await page.locator("#menu-toggle").click();
  36 |       await expect(page.locator("#menu-toggle")).toHaveAttribute("aria-expanded", "true");
  37 |       await page.locator("#dialect-title").click();
  38 |       await expect(page.locator("#menu-toggle")).toHaveAttribute("aria-expanded", "false");
  39 |     }
  40 |     expect(errors).toEqual([]);
  41 |   });
  42 | }
  43 | 
  44 | test("reduced motion reveals pending sections; enlarged mobile text stays inside hero", async ({ page }) => {
  45 |   await page.setViewportSize({ width: 375, height: 667 });
  46 |   await page.goto("/");
  47 |   await expect(page.locator("#meaning")).toBeEditable();
  48 |   await page.emulateMedia({ reducedMotion: "reduce" });
  49 |   await expect(page.locator("#dialects .section-heading")).toHaveCSS("opacity", "1");
  50 |   await page.addStyleTag({ content: ".hero-copy { font-size:20px } .hero-copy h1 { font-size:48px } .support { font-size:20px }" });
  51 |   const copy = await page.locator(".hero-copy").boundingBox();
  52 |   const foot = await page.locator(".hero-foot").boundingBox();
  53 |   const hero = await page.locator("#hero").boundingBox();
  54 |   expect(copy!.y + copy!.height).toBeLessThan(foot!.y);
  55 |   expect(foot!.y + foot!.height).toBeLessThan(hero!.height);
  56 |   await page.screenshot({ path: "test-results/ui-audit/enlarged-mobile.png" });
  57 | });
  58 | 
  59 | test("input feedback, filter recovery, card hover and keyboard reveal remain usable", async ({ page }) => {
  60 |   await page.goto("/");
  61 |   await page.locator("#meaning").focus();
> 62 |   await expect(page.locator(".hero-search")).toHaveCSS("border-top-color", "rgb(108, 159, 217)");
     |                                              ^ Error: expect(locator).toHaveCSS(expected) failed
  63 |   await page.locator("#meaning").fill("ทำงานทรัพยากร");
  64 |   await page.locator(".search-submit").click();
  65 |   await expect(page.locator("#word-title")).toBeVisible();
  66 |   await page.locator(".smart-filters input").fill("ประสิทธิภาพ ประสิทธิผล สัมฤทธิผล มัธยัสถ์");
  67 |   await expect(page.locator(".empty-results")).toBeVisible();
  68 |   await page.locator(".empty-results button").click();
  69 |   await expect(page.locator(".candidate-row")).toHaveCount(4);
  70 |   await expect(page.locator("#persistent-meaning")).toBeFocused();
  71 |   // Programmatic focus models keyboard navigation into a section below the viewport.
  72 |   await page.locator(".dialect-card").first().focus();
  73 |   await expect(page.locator(".dialect-card").first()).toHaveCSS("opacity", "0.85");
  74 |   await page.locator(".dialect-card").first().hover();
  75 |   await expect(page.locator(".dialect-card").first()).toHaveCSS("translate", "0px -4px");
  76 |   await page.emulateMedia({ reducedMotion: "reduce" });
  77 |   await expect(page.locator(".dialect-card").first()).toHaveCSS("translate", "none");
  78 | });
  79 | 
```