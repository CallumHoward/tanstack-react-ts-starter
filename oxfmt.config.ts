// Loaded by the oxfmt CLI at runtime (pnpm format / format:check); it is never
// imported by application code, so fallow's reachability graph can't see it.
// fallow-ignore-file unused-file
import { defineConfig } from "oxfmt";

export default defineConfig({
  jsdoc: true,
  sortImports: true,
  sortTailwindcss: { stylesheet: "src/styles.css" },
  ignorePatterns: [".claude/**", "src/routeTree.gen.ts", "pnpm-lock.yaml"],
});
