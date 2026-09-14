import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  // Keep traces separate so Playwright does not clear the saved UI screenshots.
  outputDir: "./test-results/browser-runs",
  timeout: 45000,
  expect: { timeout: 10000 },
  workers: 1,
  reporter: "list",
  use: { baseURL: process.env.TEST_BASE_URL ?? "http://localhost:3000", channel: "chrome", headless: true, screenshot: "only-on-failure", trace: "retain-on-failure" },
});
