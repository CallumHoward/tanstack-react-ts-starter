// Validate JSON and YAML config files that declare a schema against that schema.
//
// A file is checked when it references a schema:
//   - JSON/JSONC: a top-level "$schema" string
//   - YAML:       a `# yaml-language-server: $schema=<ref>` modeline (the editor
//                 convention), or a top-level `$schema:` key
// Vendored schemas under schemas/ are themselves meta-validated against their
// declared JSON Schema dialect. Every other file is skipped. JSON is parsed as
// JSONC (comments and trailing commas tolerated) so tsconfig-style configs work.
// The reference may be a local path (relative to the file) or a remote URL.
// Remote URLs are NOT fetched here
// -- this gate is hermetic: remote schemas are vendored under schemas/ and mapped
// by schemas/manifest.json, so CI works offline and validation is deterministic.
// Refresh the vendored copies with `pnpm schemas:update` (the only network step).
//
// Run with Node's native TypeScript support (Node 24, see .nvmrc):
//   node scripts/validate-schemas.ts               # all tracked config files
//   node scripts/validate-schemas.ts a.json b.yml  # explicit files

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, isAbsolute, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import Ajv, { type AnySchemaObject, type ValidateFunction } from "ajv";
import AjvDraft04 from "ajv-draft-04";
import addFormatsImport from "ajv-formats";
import Ajv2019 from "ajv/dist/2019.js";
import Ajv2020 from "ajv/dist/2020.js";
import type AjvCore from "ajv/dist/core.js";
import { type ParseError, parse as parseJsonc, printParseErrorCode } from "jsonc-parser";
import { parse as parseYaml } from "yaml";

const require = createRequire(import.meta.url);
const draft06MetaSchema = require("ajv/dist/refs/json-schema-draft-06.json") as AnySchemaObject;
const addFormats = (
  typeof addFormatsImport === "function"
    ? addFormatsImport
    : (addFormatsImport as { default: typeof addFormatsImport }).default
) as (ajv: AjvCore) => AjvCore;

const SCHEMAS_DIR = resolve("schemas");

// Map of remote "$schema" URL -> vendored filename under schemas/. Lets the gate
// resolve a remote reference to a local copy without any network access.
const manifest: Record<string, string> = (() => {
  const p = resolve(SCHEMAS_DIR, "manifest.json");
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as Record<string, string>) : {};
})();

// YAML's editor convention for associating a schema is a modeline comment, e.g.
//   # yaml-language-server: $schema=https://example.com/schema.json
const YAML_MODELINE = /^\s*#\s*yaml-language-server:\s*\$schema=(\S+)/m;

/** Extract a schema reference: a YAML modeline, or a top-level "$schema" string. */
function schemaReference(text: string, data: unknown): string | null {
  const modeline = text.match(YAML_MODELINE);
  if (modeline) return modeline[1];
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const ref = (data as Record<string, unknown>).$schema;
    if (typeof ref === "string") return ref;
  }
  return null;
}

type Result = "valid" | "invalid" | "skip";

/** Resolve the list of files to validate. */
function targetFiles(): string[] {
  // lefthook passes "{staged_files}" which may arrive as one space-joined arg
  // (depending on quoting), so split each arg on whitespace to be safe.
  const args = process.argv
    .slice(2)
    .filter((a) => !a.startsWith("-"))
    .flatMap((a) => a.split(/\s+/))
    .filter(Boolean);
  if (args.length > 0) return args;

  // Default: every tracked JSON/YAML config file in the repo.
  const out = execFileSync("git", ["ls-files", "*.json", "*.jsonc", "*.yml", "*.yaml"], {
    encoding: "utf8",
  });
  return out
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Resolve a schema reference to a local file path, hermetically. Remote URLs must be vendored
 * (present in the manifest); local references are resolved relative to the referring file.
 */
function localSchemaPath(ref: string, fromFile: string): string {
  if (/^https?:\/\//.test(ref)) {
    const vendored = manifest[ref];
    if (!vendored) {
      throw new Error(
        `remote schema "${ref}" is not vendored -- add it to schemas/manifest.json and run \`pnpm schemas:update\``,
      );
    }
    return resolve(SCHEMAS_DIR, vendored);
  }
  if (ref.startsWith("file://")) return fileURLToPath(ref);
  return isAbsolute(ref) ? ref : resolve(dirname(fromFile), ref);
}

/** Load a schema document for an Ajv $ref, from vendored/local copies only. */
async function loadSchemaDocument(uri: string): Promise<AnySchemaObject> {
  return JSON.parse(readFileSync(localSchemaPath(uri, SCHEMAS_DIR), "utf8")) as AnySchemaObject;
}

/** Map a meta-schema URI to the matching Ajv flavour. */
function ajvForDialect(metaSchema: unknown): { ajv: AjvCore; dialect: string } {
  const meta = typeof metaSchema === "string" ? metaSchema : "";
  const opts = {
    allErrors: true,
    strict: false,
    loadSchema: loadSchemaDocument,
    // Suppress "unknown format" / strict-mode warnings (schema-authoring noise);
    // keep real errors. Instance validation is unaffected.
    logger: { log: () => {}, warn: () => {}, error: console.error },
  };
  let ajv: AjvCore;
  let dialect: string;
  if (meta.includes("2020-12")) {
    ajv = new Ajv2020(opts);
    dialect = "2020-12";
  } else if (meta.includes("2019-09")) {
    ajv = new Ajv2019(opts);
    dialect = "2019-09";
  } else if (meta.includes("draft-04")) {
    ajv = new AjvDraft04(opts);
    dialect = "draft-04";
  } else if (meta.includes("draft-06")) {
    ajv = new Ajv(opts);
    ajv.addMetaSchema(draft06MetaSchema);
    dialect = "draft-06";
  } else if (meta.includes("draft-07")) {
    ajv = new Ajv(opts);
    dialect = "draft-07";
  } else {
    // No declared dialect: default to the latest, which is the most common for
    // schemas that omit $schema today.
    ajv = new Ajv2020(opts);
    dialect = "2020-12 (assumed)";
  }
  addFormats(ajv);
  return { ajv, dialect };
}

/** Validate a vendored schema document against its declared dialect's meta-schema. */
function metaValidate(file: string, schema: AnySchemaObject): Result {
  const { ajv, dialect } = ajvForDialect(schema.$schema);
  let ok: boolean;
  try {
    // Ajv ships the standard meta-schemas, so this stays hermetic.
    ok = ajv.validateSchema(schema) as boolean;
  } catch (err) {
    console.error(`✖ ${file}: cannot meta-validate (${(err as Error).message})`);
    return "invalid";
  }
  if (ok) {
    console.log(`✓ ${file} (valid ${dialect} schema)`);
    return "valid";
  }
  console.error(`✖ ${file} is not a valid ${dialect} schema:`);
  for (const e of ajv.errors ?? []) {
    console.error(`    ${e.instancePath || "(root)"} ${e.message}`);
  }
  return "invalid";
}

/** Validate a single file. */
async function validateFile(file: string): Promise<Result> {
  if (!existsSync(file)) {
    console.error(`✖ ${file}: file not found`);
    return "invalid";
  }
  // Files under schemas/ are the vendored schema store: meta-validate them
  // against their own dialect rather than treating them as config instances.
  const isVendoredSchema = resolve(file).startsWith(SCHEMAS_DIR + sep);
  const text = readFileSync(file, "utf8");
  // Cheap pre-filter: only files that reference a schema are candidates.
  if (!/\$schema/.test(text)) return "skip";

  const ext = extname(file).toLowerCase();
  const isYaml = ext === ".yml" || ext === ".yaml";

  let data: unknown;
  if (isYaml) {
    try {
      data = parseYaml(text);
    } catch (err) {
      console.error(`✖ ${file}: not valid YAML (${(err as Error).message})`);
      return "invalid";
    }
  } else {
    const parseErrors: ParseError[] = [];
    data = parseJsonc(text, parseErrors, { allowTrailingComma: true });
    if (parseErrors.length > 0) {
      const e = parseErrors[0];
      console.error(
        `✖ ${file}: not valid JSON/JSONC (${printParseErrorCode(e.error)} at offset ${e.offset})`,
      );
      return "invalid";
    }
  }

  if (isVendoredSchema) return metaValidate(file, data as AnySchemaObject);

  const schemaRef = schemaReference(text, data);
  if (!schemaRef) return "skip"; // no resolvable schema reference

  let schema: AnySchemaObject;
  let baseId: string;
  try {
    const path = localSchemaPath(schemaRef, file);
    schema = JSON.parse(readFileSync(path, "utf8")) as AnySchemaObject;
    baseId = pathToFileURL(path).href;
  } catch (err) {
    console.error(`✖ ${file}: could not load schema "${schemaRef}" (${(err as Error).message})`);
    return "invalid";
  }

  const { ajv, dialect } = ajvForDialect(schema.$schema);

  // Give the root schema an absolute base so relative $refs resolve correctly.
  if (!schema.$id && !schema.id) {
    const idKey = dialect.startsWith("draft-04") ? "id" : "$id";
    schema = { ...schema, [idKey]: baseId };
  }

  let validate: ValidateFunction;
  try {
    validate = await ajv.compileAsync(schema);
  } catch (err) {
    console.error(`✖ ${file}: failed to compile schema "${schemaRef}" (${(err as Error).message})`);
    return "invalid";
  }

  if (validate(data)) {
    console.log(`✓ ${file} (against ${schemaRef})`);
    return "valid";
  }

  console.error(`✖ ${file} does not match ${schemaRef}:`);
  for (const e of validate.errors ?? []) {
    console.error(`    ${e.instancePath || "(root)"} ${e.message}`);
  }
  return "invalid";
}

async function main(): Promise<void> {
  let valid = 0;
  let invalid = 0;
  let skipped = 0;

  for (const file of targetFiles()) {
    const result = await validateFile(file);
    if (result === "valid") valid += 1;
    else if (result === "invalid") invalid += 1;
    else skipped += 1;
  }

  if (valid === 0 && invalid === 0) {
    console.log("No config files with a schema reference to validate.");
    return;
  }

  console.log(
    `\nChecked ${valid + invalid} schema-bearing file(s): ${valid} valid, ${invalid} invalid (${skipped} skipped).`,
  );
  if (invalid > 0) process.exitCode = 1;
}

// eslint-disable-next-line vitest/require-hook -- top-level CLI entrypoint, not a test
main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
