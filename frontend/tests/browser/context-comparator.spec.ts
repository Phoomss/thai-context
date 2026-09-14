import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`Task 5 comparator renders five real API words at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/api/v1/compare", async (route) => {
      const body = route.request().postDataJSON() as { words: string[] };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          words: body.words.map((headword) => ({
            headword,
            definition: `นิยาม API ของ${headword}`,
            partOfSpeech: "น.",
            edition: "2554",
          })),
          comparison: {
            meaningDifference: "ความหมายจาก API",
            contextDifference: "บริบทจาก API",
            usageGuidance: "คำแนะนำจาก API",
          },
          evidence: body.words.map((word) => ({
            word,
            source: "สำนักงานราชบัณฑิตยสภา",
            edition: "2554",
            definition: `นิยาม API ของ${word}`,
            relevance: 1,
          })),
        }),
      });
    });

    await page.goto("/");
    const comparator = page.locator("#compare");
    await comparator.scrollIntoViewIfNeeded();
    await page.getByRole("combobox", { name: "คำที่ 1" }).fill("คำหนึ่ง");
    await page.getByRole("combobox", { name: "คำที่ 2" }).fill("คำสอง");
    await page.getByRole("button", { name: "+ เพิ่มคำ" }).click();
    await expect(comparator.getByRole("combobox")).toHaveCount(3);
    await page.getByRole("combobox", { name: "คำที่ 3" }).fill("คำสาม");
    await page.getByRole("button", { name: "+ เพิ่มคำ" }).click();
    await expect(comparator.getByRole("combobox")).toHaveCount(4);
    await page.getByRole("combobox", { name: "คำที่ 4" }).fill("คำสี่");
    await page.getByRole("button", { name: "+ เพิ่มคำ" }).click();
    await expect(comparator.getByRole("combobox")).toHaveCount(5);
    await page.getByRole("combobox", { name: "คำที่ 5" }).fill("คำห้า");
    await page.getByRole("button", { name: "เปรียบเทียบคำ" }).click();

    await expect(page.getByText("ความหมายจาก API")).toBeVisible();
    await expect(page.locator(".comparison-card")).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}

test("Task 5 live Next.js BFF renders the NestJS comparison", async ({ page }) => {
  test.skip(process.env.TASK5_LIVE_API !== "true", "requires the live NestJS and AI services");
  await page.goto("/");
  await page.locator("#compare").scrollIntoViewIfNeeded();
  await page.getByRole("combobox", { name: "คำที่ 1" }).fill("ประสิทธิภาพ");
  await page.getByRole("combobox", { name: "คำที่ 2" }).fill("ประสิทธิผล");
  await page.getByRole("button", { name: "เปรียบเทียบคำ" }).click();

  await expect(page.locator(".comparison-card")).toHaveCount(2);
  await expect(page.locator(".comparison-summary section")).toHaveCount(3);
  await expect(page.locator(".comparison-evidence li")).toHaveCount(2);
  await expect(page.locator(".comparison-card").first()).toContainText("พ.ศ. 2569");
});
