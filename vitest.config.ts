import path from "path";
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
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", ".next/", "prisma/", "**/*.config.*", "**/types/**"],
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
