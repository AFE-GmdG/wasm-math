import typescript from "rollup-plugin-typescript2";
import terser from "@rollup/plugin-terser";
import { wasm } from "@rollup/plugin-wasm";

export default {
  input: "src/wasm-math.ts",

  output: {
    file: "dist/wasm-math.js",
    format: "es",
  },

  plugins: [
    typescript({ // https://github.com/ezolenko/rollup-plugin-typescript2/blob/master/README.md#plugin-options
      tsconfig: "tsconfig.json",
      clean: true,
    }),
    terser({ // https://github.com/terser/terser#minify-options
    }),
    wasm({ // https://github.com/rollup/plugins/tree/master/packages/wasm/#options
    }),
  ],
};
