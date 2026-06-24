// Refresh the vendored JSON schemas from their upstream URLs.
//
// This is the ONLY place that touches the network for schemas. The validation
// gate (validate-schemas.ts) is hermetic: it reads the checked-in copies
// under schemas/ so CI works offline and stays deterministic. Run this manually
// when an upstream schema changes, then review and commit the diff:
//
//   pnpm schemas:update
//
// schemas/manifest.json maps each remote "$schema" URL to its local filename.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SCHEMAS_DIR = resolve("schemas");
const MANIFEST = resolve(SCHEMAS_DIR, "manifest.json");

async function main(): Promise<void> {
  if (!existsSync(MANIFEST)) {
    console.error(`✖ no manifest at ${MANIFEST}`);
    process.exitCode = 1;
    return;
  }
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8")) as Record<string, string>;
  const entries = Object.entries(manifest);
  if (entries.length === 0) {
    console.log("Manifest is empty; nothing to refresh.");
    return;
  }

  for (const [url, file] of entries) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
    // Parse to confirm it's valid JSON, then pretty-print for readable diffs.
    const json = JSON.parse(await res.text()) as unknown;
    writeFileSync(resolve(SCHEMAS_DIR, file), JSON.stringify(json, null, 2) + "\n");
    console.log(`✓ ${file} ← ${url}`);
  }

  console.log(`\nRefreshed ${entries.length} schema(s). Review the diff and commit.`);
}

// eslint-disable-next-line vitest/require-hook -- top-level CLI entrypoint, not a test
main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
