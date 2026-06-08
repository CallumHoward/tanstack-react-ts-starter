// Copies Fallow's version-matched Agent Skill from node_modules into
// .claude/skills/ so Claude Code can discover it. Run from `postinstall`,
// it keeps the skill in sync with the installed fallow version without
// committing vendored content (.claude is gitignored).
//
// Best-effort: never fails the install — a missing skill or copy error just
// logs a warning and exits 0.
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules", "fallow", "skills", "fallow");
const dest = join(root, ".claude", "skills", "fallow");

try {
  if (!existsSync(source)) {
    console.warn(`[fallow-skill] source not found, skipping: ${source}`);
    process.exit(0);
  }
  rmSync(dest, { recursive: true, force: true });
  cpSync(source, dest, { recursive: true });
  console.log(`[fallow-skill] installed skill -> ${dest}`);
} catch (error) {
  console.warn(`[fallow-skill] skipped (${error.message})`);
}
