import { defineConfig } from "vitest/config";
import { wasm } from "@rollup/plugin-wasm";

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
    wasm({ // https://github.com/rollup/plugins/tree/master/packages/wasm/#options
    }),
  ],
});
