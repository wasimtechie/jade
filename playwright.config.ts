import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
/** In CI (or after `npm run build`), `next start` avoids dev-compiler races that cause flaky navigations. */
const useProdServer = process.env.CI === "true";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  /** Default Playwright test timeout is 30s — home/book first hits can exceed that during dev compile. */
  timeout: 120_000,
  workers: process.env.CI ? 2 : 1,
  use: {
    baseURL,
    trace: "on-first-retry",
    navigationTimeout: 90_000,
    actionTimeout: 30_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: useProdServer
    ? {
        command: "npm run start",
        url: baseURL,
        reuseExistingServer: false,
        timeout: 90_000,
      }
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        // First compile after cold start can exceed 2 minutes on some machines.
        timeout: 300_000,
      },
});
