// @ts-expect-error
import { tanstackConfig } from "@tanstack/eslint-config";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";
import jsxA11y from "eslint-plugin-jsx-a11y";
import vitest from "eslint-plugin-vitest";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "src/routeTree.gen.ts"]),
  ...tanstackConfig,
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      reactX.configs["recommended-typescript"],
      reactDom.configs.recommended,
      jsxA11y.flatConfigs.recommended,
      unicorn.configs.recommended,
      prettier,
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "unicorn/filename-case": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    extends: [vitest.configs.recommended],
  },
]);
