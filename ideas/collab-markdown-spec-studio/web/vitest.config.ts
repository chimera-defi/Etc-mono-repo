import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.spec.ts"],
    globals: true,
    testTimeout: 10_000,
  },
});
