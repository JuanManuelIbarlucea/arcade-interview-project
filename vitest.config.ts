import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    environmentMatchGlobs: [
      ["tests/unit/**", "node"],
      ["tests/integration/**", "node"],
      ["tests/components/**", "jsdom"],
    ],
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "node_modules/",
        ".next/",
        "prisma/",
        "src/generated/**",
        "**/*.config.*",
        "**/types/**",
      ],
      all: true,
    },
    include: ["tests/**/*.test.{ts,tsx}"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
