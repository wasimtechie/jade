import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  // Hero/video assets may defer `load`; DOM is enough for smoke coverage.
  await page.goto("/", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await expect(page).toHaveTitle(/Jade/i);
});

test("book flow shell loads", async ({ page }) => {
  await page.goto("/book", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await expect(page.getByRole("heading", { name: /Select Dates/i })).toBeVisible();
});
