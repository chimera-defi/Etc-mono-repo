import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
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
      command: "npm run build && npm run start -- --hostname 127.0.0.1",
      port: 3000,
      reuseExistingServer: true,
      timeout: 180_000,
      env: {
        NEXT_PUBLIC_COLLAB_URL: "ws://127.0.0.1:4321",
        SPECFORGE_DB_PATH: ".data/specforge-db-playwright",
      },
    },
    {
      command: "npm start --prefix ../collab-server",
      port: 4321,
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
