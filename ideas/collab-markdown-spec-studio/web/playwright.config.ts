import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["demo.spec.ts"],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm run build && pnpm exec next start --hostname 127.0.0.1",
      port: 3100,
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        PORT: "3100",
        NEXT_PUBLIC_COLLAB_URL: "ws://127.0.0.1:4322",
        SPECFORGE_DB_PATH: ".data/specforge-db-playwright.json",
      },
    },
    {
      command: "pnpm --dir ../collab-server start",
      port: 4322,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        PORT: "4322",
      },
    },
  ],
});
