import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: [
    "typescript",
    "unicorn",
    "oxc",
    "react",
    "jsx-a11y",
    "import",
    "vitest",
    "promise",
    "jsdoc",
  ],
  jsPlugins: [
    "eslint-plugin-playwright",
    { name: "react-hooks-js", specifier: "eslint-plugin-react-hooks" },
    { name: "router", specifier: "@tanstack/eslint-plugin-router" },
  ],
  categories: {
    correctness: "error",
  },
  env: {
    builtin: true,
  },
  ignorePatterns: [".output", "dist", "src/routeTree.gen.ts"],
  rules: {
    "unicorn/filename-case": "off",
    "unicorn/no-null": "off",
    "react/only-export-components": "warn",
    "react/no-array-index-key": "error",

    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
    "typescript/await-thenable": "error",
    "typescript/switch-exhaustiveness-check": "error",
    "typescript/no-unnecessary-condition": "warn",

    "import/no-cycle": "error",

    "jsdoc/check-tag-names": "error",
    "jsdoc/check-property-names": "error",
    "jsdoc/check-access": "error",
    "jsdoc/empty-tags": "error",
    "jsdoc/implements-on-classes": "error",

    "react-hooks-js/static-components": "error",
    "react-hooks-js/use-memo": "error",
    "react-hooks-js/void-use-memo": "error",
    "react-hooks-js/preserve-manual-memoization": "error",
    "react-hooks-js/incompatible-library": "warn",
    "react-hooks-js/immutability": "error",
    "react-hooks-js/globals": "error",
    "react-hooks-js/refs": "error",
    "react-hooks-js/set-state-in-effect": "error",
    "react-hooks-js/error-boundaries": "error",
    "react-hooks-js/purity": "error",
    "react-hooks-js/set-state-in-render": "error",
    "react-hooks-js/unsupported-syntax": "warn",
    "react-hooks-js/config": "error",
    "react-hooks-js/gating": "error",
  },
  overrides: [
    {
      files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "!e2e/**"],
      rules: {
        "vitest/require-top-level-describe": "error",
      },
    },
    {
      files: ["src/routes/**/*.{ts,tsx}"],
      rules: {
        "react/only-export-components": "off",
        "router/create-route-property-order": "error",
        "router/route-param-names": "error",
      },
    },
    {
      files: ["e2e/**/*.{ts,tsx}"],
      rules: {
        "playwright/require-top-level-describe": "error",
        "playwright/no-skipped-test": "warn",
        "playwright/no-focused-test": "error",
        "playwright/no-conditional-in-test": "warn",
        "playwright/valid-expect": "error",
      },
    },
  ],
});
