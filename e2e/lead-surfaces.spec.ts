import { test, expect } from "@playwright/test";

test("careers page hero loads", async ({ page }) => {
  await page.goto("/careers", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await expect(page.getByRole("heading", { name: /Work Where/i })).toBeVisible();
});

test("contact page hero loads", async ({ page }) => {
  await page.goto("/contact", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await expect(
    page.getByRole("heading", { name: /Planning a stay/i }),
  ).toBeVisible();
});
