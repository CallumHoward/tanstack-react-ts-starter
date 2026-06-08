# Conventions & decisions

A `.claude/rules/` file — auto-loaded as project memory alongside `CLAUDE.md`
(rules without a `paths:` frontmatter load at startup). Records the *why* behind
the toolchain so decisions aren't re-litigated.

## oxc toolchain

- Migrated off ESLint/Prettier to **oxlint + oxfmt** (Rust, fast). `tsgo`
  (`@typescript/native-preview`) does typechecking. Don't reintroduce
  ESLint/Prettier.
- **Configs are TypeScript** (`*.config.ts`), loaded via Node's native
  type-stripping (Node 24, `.nvmrc`). oxlint's TS-config support is technically
  experimental but works via the npm `oxlint` shim (which runs through Node).
- oxfmt also handles JSON/YAML/Markdown and does **JSDoc formatting**, **import
  sorting**, and **Tailwind class sorting** (`oxfmt.config.ts`). `sortPackageJson`
  is on by default. `.claude/**` is in oxfmt `ignorePatterns` (don't reformat
  vendored skills / memory).

## oxlint JS plugins (`jsPlugins`)

- ESLint-ecosystem plugins run through oxlint's `jsPlugins`: `eslint-plugin-playwright`,
  `eslint-plugin-react-hooks` (aliased **`react-hooks-js`** — `react-hooks` is
  reserved for oxlint's native plugin), `@tanstack/eslint-plugin-router` (alias
  `router`), `eslint-plugin-check-file`.
- **Gotcha:** oxlint has *no* "enable recommended/all" switch for JS plugins —
  `categories` only reach native Rust rules. Every JS-plugin rule must be listed
  by hand. Reconcile manually when a plugin's recommended set changes.
- React Compiler / Rules-of-React rules come from `eslint-plugin-react-hooks`
  recommended set: `rules-of-hooks` + `exhaustive-deps` run as oxlint **native**;
  the other 15 via the `react-hooks-js` JS plugin.

## Filename rules (PR: claude/no-js-lint)

- Hybrid: native `unicorn/filename-case` for kebab (has autofix); `check-file`
  for the JS-family ban, per-directory secondary-extension allowlist, and the
  `__test*` directory ban.
- `check-file/filename-naming-convention` uses a **case-agnostic** `[^.]` base
  (casing is unicorn's job); the `?(.@(...))` group is an extglob **optional**
  group, so a plain `router.tsx` passes.
- `src/routes/**` is exempt from both naming rules. The TanStack Router plugin
  validates route *semantics* (param names, option order), NOT filenames, so it
  does not replace the exemption.

### Known lint-perf trade-off

`check-file` makes `oxlint` ~3× slower (≈288 ms → ≈860 ms; +~570 ms) on this
repo. Investigated and accepted as-is. Ruled out: it's not check-file's own
import cost (light), not the JS runtime (bun was same/slightly worse), not
TS-vs-JSON config loading, not ESLint peer presence (main has ESLint too). If it
ever needs fixing, the mapped path is: drop `check-file` and do those three
path-checks in a tiny TS script (pre-commit + CI), keeping native unicorn kebab.

## Stylelint

- `stylelint-config-standard`, full (incl. notation rules). Tailwind v4 at-rules
  (`@theme`, `@apply`, `@custom-variant`, …) allowed via `at-rule-no-unknown`.
- `import-notation` is exempted **only** on the `@import "tailwindcss"` line via
  an inline `stylelint-disable` — its autofix would rewrite to `url()`, which
  Tailwind v4 doesn't accept. CSS theme uses number-form `oklch` (shadcn output);
  do not let Stylelint rewrite it project-wide.

## Fallow (codebase intelligence)

- `fallow` devDep ships `fallow`, `fallow-lsp`, `fallow-mcp` + a Claude Code skill.
- MCP server registered in `/.mcp.json` (project-scoped). The skill is provided to
  Claude Code via a committed symlink `.claude/skills/fallow → node_modules/...`.

## CI / hooks

- CI (`.github/workflows/ci.yml`) runs typecheck, lint, lint:css, format:check,
  test, build, e2e. Actions are pinned to Node 24 majors.
- lefthook pre-commit: oxlint `--fix` (glob includes js-family so stray JS is
  blocked), stylelint `--fix` on CSS, oxfmt, and `tsgo` check.
