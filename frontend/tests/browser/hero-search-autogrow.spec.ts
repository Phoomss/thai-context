import { test, expect, type Page } from "@playwright/test";

type SearchGeometry = {
  formHeight: number;
  textareaHeight: number;
  buttonRightInset: number;
  buttonBottomInset: number;
  buttonCenterX: number;
  overflowY: string;
};

async function searchGeometry(page: Page): Promise<SearchGeometry> {
  return page.locator(".hero-search").evaluate(form => {
    const textarea = form.querySelector("textarea");
    const button = form.querySelector(".search-submit");
    if (!(textarea instanceof HTMLTextAreaElement) || !(button instanceof HTMLButtonElement)) {
      throw new Error("Hero Search controls are missing");
    }

    const formBox = form.getBoundingClientRect();
    const textareaBox = textarea.getBoundingClientRect();
    const buttonBox = button.getBoundingClientRect();
    return {
      formHeight: formBox.height,
      textareaHeight: textareaBox.height,
      buttonRightInset: formBox.right - buttonBox.right,
      buttonBottomInset: formBox.bottom - buttonBox.bottom,
      buttonCenterX: buttonBox.x + buttonBox.width / 2,
      overflowY: getComputedStyle(textarea).overflowY,
    };
  });
}

test("Hero Search grows, clamps and shrinks at desktop, tablet and mobile widths", async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const textarea = page.locator("#meaning");
    const initial = await searchGeometry(page);
    expect(initial.formHeight).toBeGreaterThanOrEqual(58);
    expect(initial.formHeight).toBeLessThanOrEqual(66);
    expect(initial.overflowY).toBe("hidden");

    await textarea.fill("ความหมายสั้นหนึ่งบรรทัด");
    const singleLine = await searchGeometry(page);
    expect(singleLine.formHeight).toBeCloseTo(initial.formHeight, 0);

    await textarea.fill("บรรทัดหนึ่ง\nบรรทัดสอง\nบรรทัดสาม\nบรรทัดสี่");
    const expanded = await searchGeometry(page);
    expect(expanded.formHeight).toBeGreaterThan(singleLine.formHeight + 50);
    expect(expanded.buttonRightInset).toBeCloseTo(initial.buttonRightInset, 0);
    expect(expanded.buttonBottomInset).toBeCloseTo(initial.buttonBottomInset, 0);
    expect(expanded.buttonCenterX).toBeCloseTo(initial.buttonCenterX, 0);

    await textarea.fill(Array.from({ length: 14 }, (_, index) => `บรรทัด ${index + 1}`).join("\n"));
    const clamped = await searchGeometry(page);
    expect(clamped.textareaHeight).toBeLessThanOrEqual(viewport.width < 768 ? 136 : 160);
    expect(clamped.overflowY).toBe("auto");

    await textarea.fill("สั้นลง");
    const shrunk = await searchGeometry(page);
    expect(shrunk.formHeight).toBeCloseTo(initial.formHeight, 0);
    expect(shrunk.overflowY).toBe("hidden");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      ),
    ).toBe(true);
  }
});

test("Hero Search keeps newline, IME and Enter submission behavior", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const textarea = page.locator("#meaning");
  await textarea.fill("บรรทัดแรก");
  await textarea.press("Shift+Enter");
  await textarea.type("บรรทัดที่สอง");
  await expect(textarea).toHaveValue("บรรทัดแรก\nบรรทัดที่สอง");
  await expect(page.locator(".experience")).toHaveAttribute("data-experience-state", "hero-idle");

  await textarea.evaluate(element => {
    element.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "ง" }));
    element.dispatchEvent(new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Enter",
      isComposing: true,
    }));
    element.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "งาน" }));
  });
  await expect(page.locator(".experience")).toHaveAttribute("data-experience-state", "hero-idle");

  await textarea.fill("ทำงาน");
  await textarea.press("Enter");
  await expect(page.locator(".experience")).toHaveAttribute("data-experience-state", "results-active");
  await expect(page.locator("#word-title")).toBeVisible();
  await expect(page.locator(".transition-overlay")).toHaveCSS("opacity", "0");
});
