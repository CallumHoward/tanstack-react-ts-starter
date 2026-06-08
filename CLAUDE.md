# Project memory

TanStack Start app (React 19 + TypeScript). This file is the primary, auto-loaded
project memory. Detailed conventions and the rationale behind tooling decisions
live in @.claude/memory/MEMORY.md.

## Package manager

- **pnpm only.** `packageManager` is pinned and Corepack enforces it — never run
  `npm` or `yarn` (they'd create the wrong lockfile / are blocked).
- A pnpm `minimumReleaseAge` policy blocks very fresh releases; installs may select
  a slightly older version than `latest`. That is expected.

## Toolchain (oxc-based)

| Concern               | Tool                                | Command                                  |
| --------------------- | ----------------------------------- | ---------------------------------------- |
| Lint (JS/TS)          | oxlint (`--type-aware`)             | `pnpm lint`                              |
| Lint (CSS)            | Stylelint                           | `pnpm lint:css`                          |
| Format                | oxfmt                               | `pnpm format` / `pnpm format:check`      |
| Typecheck             | tsgo (`@typescript/native-preview`) | `pnpm check`                             |
| Unit tests            | Vitest                              | `pnpm test`                              |
| E2E                   | Playwright                          | `pnpm test:e2e`                          |
| Codebase intelligence | Fallow                              | `pnpm exec fallow`                       |
| Git hooks             | lefthook (pre-commit)               | auto                                     |
| Dev / build           | Vite                                | `pnpm dev` / `pnpm build` / `pnpm serve` |

There is no ESLint or Prettier — oxlint/oxfmt replace them. ESLint plugins are
loaded through oxlint's `jsPlugins` (see MEMORY.md).

## Conventions (enforced by lint)

- **TypeScript only** — no `.js` / `.jsx` / `.mjs` / `.cjs` source files. Config
  files and scripts are `.ts`, run via Node's native type-stripping (Node 24,
  pinned in `.nvmrc`). Tool configs: `oxlint.config.ts`, `oxfmt.config.ts`,
  `stylelint.config.ts`.
- **kebab-case filenames** (`unicorn/filename-case`). `src/routes/**` is exempt
  (TanStack Router uses `__root`, `$param`, `_layout`, dotted nesting).
- **Allowed secondary extensions**, by directory: `src/**` → `.test` / `.stories`
  / `.d`; `e2e/**` → `.spec`; root → `.config` / `.d`.
- **No `__test` / `__tests__` directories** — co-locate tests as `*.test.ts`.

## Working agreements

- Develop on feature branches; never push directly to `main`. Land via PR.
- Don't add ESLint, Prettier, npm, or yarn back into the project.
- Keep tool configs in TypeScript.
