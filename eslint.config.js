import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import stylistic from "@stylistic/eslint-plugin-ts";
import eslintImport from "eslint-plugin-import";

export default [
  {
    files: ["**/*.js", "**/*.ts"],

    settings: {
    },

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "tsconfig.eslint.json",
        warnOnUnsupportedTypeScriptVersion: true,
      },
    },

    plugins: {
      tseslint,
      stylistic,
      import: eslintImport,
    },

    rules: {
      "no-console": "off",
      "no-debugger": "warn",
      "max-len": [2, 160, 2, {"ignoreUrls": true}],
      "no-implied-eval": "error",
      "no-labels": "error",
      "eqeqeq": ["error", "always", {"null": "ignore"}],
      "no-var": "error",
      "prefer-const": "error",
      "comma-dangle": ["error", {
        "arrays": "always-multiline",
        "objects": "always-multiline",
        "imports": "always-multiline",
        "exports": "always-multiline",
        "functions": "always-multiline"
      }],
      "comma-spacing": ["error", { "before": false, "after": true }],
      "comma-style": ["error", "last"],
      "dot-location": ["error", "property"],
      "eol-last": ["error", "always"],
      "space-in-parens": ["error", "never"],
      "array-bracket-spacing": ["error", "never"],
      "space-infix-ops": ["error", { "int32Hint": true }],
      "space-unary-ops": "error",
      "no-implicit-globals": "error",
      "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 1 }],
      "no-trailing-spaces": "error",

      "lines-between-class-members": "off",
      "stylistic/lines-between-class-members": ["error", { enforce: [{ blankLine: "always", prev: "*", next: "method" }]}, { "exceptAfterSingleLine": true }],
      "quotes": "off",
      "stylistic/quotes": ["error", "double"],
      "object-curly-spacing": "off",
      "stylistic/object-curly-spacing": ["error", "always"],

      "no-unused-vars": "off",
      "tseslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_",  "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_", "ignoreRestSiblings": true }],
    },

    ignores: [
      "node_modules/**/*",
      "dist/**/*",
      "eslint.config.js",
      "rollup.config.js",
      "vitest.config.ts",
    ],
  },
];
