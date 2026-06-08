import { defineConfig } from "oxfmt";

export default defineConfig({
  jsdoc: true,
  sortImports: true,
  sortTailwindcss: { stylesheet: "src/styles.css" },
  ignorePatterns: ["src/routeTree.gen.ts", "pnpm-lock.yaml", "package-lock.json", "yarn.lock"],
});
