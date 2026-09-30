import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.TRAMA_PUBLIC_BASE_URL ?? "https://trama-control-center.onrender.com";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "public-browser-certification.spec.ts",
  fullyParallel: false,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  outputDir: "public-certification-results",
  reporter: [["line"], ["html", { outputFolder: "public-certification-report", open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    ignoreHTTPSErrors: false,
  },
  projects: [
    {
      name: "public-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
