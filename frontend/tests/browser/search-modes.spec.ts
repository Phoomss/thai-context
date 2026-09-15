import { test, expect } from "@playwright/test";

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`dual search glass and real interactions at ${width}px`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    const knownMissingDialect: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
      if (message.type() !== "error") return;
      const url = message.location().url;
      // The existing dialect API intentionally returns 404 for unmapped words.
      // Record only this known response separately; do not mask runtime errors.
      if (message.text().includes("404 (Not Found)") && /\/api\/v1\/dialect\/mapping\//.test(url))
        knownMissingDialect.push(url);
      else errors.push(`${message.text()} (${url})`);
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("#meaning")).toBeEditable();
    const heroModes = page.locator(".hero-mode-switcher");
    const resultModes = page.locator(".composer-mode-switcher");
    await expect(heroModes.getByRole("button", { name: "Context Search", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(heroModes.locator(".search-mode-pill")).toHaveCSS("transition-duration", "0.22s");
    await expect(page.locator(".navbar")).not.toContainText(/Word Scrambler|ผู้ช่วย AI|AI Workspace/);
    const searchBox = await page.locator(".hero-search").boundingBox();
    const switchBox = await heroModes.locator(".search-mode-switcher").boundingBox();
    expect(switchBox!.y - searchBox!.y - searchBox!.height).toBeCloseTo(16, 0);
    expect(switchBox!.width).toBeLessThanOrEqual(390);
    expect(switchBox!.height).toBeGreaterThanOrEqual(40);
    expect(switchBox!.height).toBeLessThanOrEqual(width <= 480 ? 48 : 46);
    const controls = heroModes.locator("button,a");
    for (const control of await controls.all()) {
      const bounds = await control.boundingBox();
      expect(bounds!.height).toBeGreaterThanOrEqual(width <= 480 ? 40 : 36);
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      expect(await control.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    }
    await page.locator("#hero").screenshot({ path: `test-results/search-glass/hero-${width}.png` });
    await heroModes.getByRole("button", { name: "Context Search", exact: true }).focus();
    await page.keyboard.press("Tab");
    await expect(heroModes.getByRole("button", { name: "AI Assistant", exact: true })).toHaveCSS("outline-style", "solid");
    await expect(heroModes.getByRole("button", { name: "AI Assistant", exact: true })).not.toHaveCSS("box-shadow", "none");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(resultModes.locator('[aria-pressed="true"]')).toHaveText("AI Assistant");
    await expect.poll(() => heroModes.locator(".search-mode-pill").evaluate(el => {
      const pill = el.getBoundingClientRect();
      const target = el.parentElement!.querySelectorAll("button")[1].getBoundingClientRect();
      return Math.abs(pill.x - target.x);
    })).toBeLessThan(1);
    await page.getByRole("button", { name: "ปิดหน้าต่างผู้ช่วย AI" }).click();
    await expect(heroModes.getByRole("button", { name: "AI Assistant", exact: true })).toBeFocused();
    await expect(heroModes.locator('[aria-pressed="true"]')).toHaveText("Context Search");
    await page.locator("#meaning").fill("ทำงานได้ดีโดยใช้ทรัพยากรน้อย");
    const firstResponse = page.waitForResponse(r => r.url().endsWith("/api/search") && r.request().method() === "POST");
    await page.locator(".search-submit").click();
    const initialResult = await firstResponse;
    expect(initialResult.ok()).toBe(true);
    console.log(`Search API ${width}px mode: ${(await initialResult.json()).mode}`);
    await expect(page.locator("#hero")).toHaveAttribute("data-state", "completed");
    await expect(page.locator(".composer-wrap")).toHaveAttribute("data-visible", "true");
    await expect(page.locator(".navbar")).toHaveClass(/navbar-floating/);
    const modes = await resultModes.boundingBox();
    const composer = await page.locator(".bottom-composer").boundingBox();
    expect(composer!.y - modes!.y - modes!.height).toBeCloseTo(12, 0);
    await expect(page.locator("#persistent-meaning")).toBeEditable();
    const persistentInput = page.locator("#persistent-meaning");
    await persistentInput.fill("");
    const compactComposer = await page.locator(".bottom-composer").boundingBox();
    expect(compactComposer!.height).toBeGreaterThanOrEqual(56);
    expect(compactComposer!.height).toBeLessThanOrEqual(64);
    const compactInputHeight = await persistentInput.evaluate(element => element.getBoundingClientRect().height);
    await persistentInput.fill("บรรทัดหนึ่ง\nบรรทัดสอง\nบรรทัดสาม\nบรรทัดสี่");
    const expandedComposer = await page.locator(".bottom-composer").boundingBox();
    const expandedInputHeight = await persistentInput.evaluate(element => element.getBoundingClientRect().height);
    expect(expandedComposer!.height).toBeGreaterThan(compactComposer!.height);
    expect(expandedInputHeight).toBeGreaterThan(compactInputHeight);
    expect(expandedInputHeight).toBeLessThanOrEqual(160);
    const composerBottom = expandedComposer!.y + expandedComposer!.height;
    const submitBottom = await page.locator(".bottom-composer button").evaluate(element => {
      const rect = element.getBoundingClientRect();
      return rect.y + rect.height;
    });
    expect(composerBottom - submitBottom).toBeCloseTo(8, 0);
    await page.screenshot({ path: `test-results/search-glass/results-multiline-${width}.png` });
    await persistentInput.fill(Array.from({ length: 10 }, (_, index) => `บรรทัดที่ ${index + 1}`).join("\n"));
    await expect.poll(() => persistentInput.evaluate(element => element.getBoundingClientRect().height)).toBe(160);
    await expect(persistentInput).toHaveCSS("overflow-y", "auto");
    await persistentInput.fill("สั้น");
    const shrunkComposer = await page.locator(".bottom-composer").boundingBox();
    expect(shrunkComposer!.height).toBeCloseTo(compactComposer!.height, 0);
    await persistentInput.focus();
    await expect.poll(() => page.locator(".bottom-composer").evaluate(element => getComputedStyle(element).boxShadow)).toContain("78px");
    await page.screenshot({ path: `test-results/search-glass/results-${width}.png` });
    await page.locator(".experience").evaluate(el => {
      el.setAttribute("data-test-cinematic-replayed", "false");
      new MutationObserver(records => {
        if (records.some(r => r.attributeName === "data-experience-state") && el.getAttribute("data-experience-state")?.includes("cinematic"))
          el.setAttribute("data-test-cinematic-replayed", "true");
      }).observe(el, { attributes: true, attributeFilter: ["data-experience-state"] });
    });
    const nextResponse = page.waitForResponse(r => r.url().endsWith("/api/search") && r.request().method() === "POST");
    await page.locator("#persistent-meaning").fill("วิจัย");
    await page.locator(".bottom-composer button").click();
    expect((await nextResponse).ok()).toBe(true);
    await expect(page.locator(".experience")).toHaveAttribute("data-experience-state", "results-active");
    await expect(page.locator(".experience")).toHaveAttribute("data-test-cinematic-replayed", "false");
    await expect(page.locator("#hero")).toHaveAttribute("data-state", "completed");
    await resultModes.getByRole("button", { name: "AI Assistant", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const chatResponse = page.waitForResponse(r => r.url().endsWith("/api/v1/ai/chat/stream"));
    await page.locator(".ai-quick-prompt-btn").first().click();
    expect((await chatResponse).ok()).toBe(true);
    await expect(page.locator(".ai-messages-list")).toContainText("ประสิทธิภาพ");
    await page.getByRole("button", { name: "ปิดหน้าต่างผู้ช่วย AI" }).click();
    const overflow = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      elements: [...document.querySelectorAll("body *")].filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.right > innerWidth && getComputedStyle(el).position !== "fixed";
      }).slice(0, 12).map(el => ({ tag: el.tagName, className: el.className, right: el.getBoundingClientRect().right })),
    }));
    expect(overflow.scrollWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(width);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(resultModes.locator(".search-mode-pill")).toHaveCSS("transition-duration", "0s");
    await resultModes.getByRole("link", { name: "AI Workspace", exact: true }).click();
    await expect(page).toHaveURL(/\/workspace$/);
    await expect(page.getByRole("heading", { name: "THAI CONTEXT Workspace" })).toBeVisible();
    await page.locator(".workspace-textarea").fill("แต่งประโยคคำว่า ประสิทธิภาพ สำหรับรายงานวิชาการ");
    const workspaceResponse = page.waitForResponse(r => r.url().endsWith("/api/v1/ai/workspace"));
    await page.locator(".workspace-submit-btn").click();
    expect((await workspaceResponse).ok()).toBe(true);
    await expect(page.locator(".workspace-draft-textarea")).not.toHaveValue("");
    await testInfo.attach("existing-dialect-404s", { body: JSON.stringify(knownMissingDialect, null, 2), contentType: "application/json" });
    expect(errors).toEqual([]);
  });
}

test("Hero Workspace control keeps its existing route", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#meaning")).toBeEditable();
  await page.locator(".hero-mode-switcher").getByRole("link", { name: "AI Workspace", exact: true }).click();
  await expect(page).toHaveURL(/\/workspace$/);
  await expect(page.getByRole("heading", { name: "THAI CONTEXT Workspace" })).toBeVisible();
});
