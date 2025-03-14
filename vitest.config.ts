import process from "node:process";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    reporters: ["default", "junit"],
    outputFile: {
      junit: ".github/reports/junit.xml",
    },
  },
  plugins: [
  ],
});
