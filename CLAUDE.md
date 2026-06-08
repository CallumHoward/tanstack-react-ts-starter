# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Unit testing

Stack: Vitest + React Testing Library (jsdom). `vitest-setup.ts` registers
jest-dom matchers, RTL `cleanup`, and a configured `vitest-axe` `axe` helper
globally. Co-locate tests as `*.test.tsx` next to the code under test.

Rules for writing unit tests:

1. **Prefer the extended (jest-dom) matchers.** Reach for the most specific
   matcher the assertion allows — e.g. `toBeVisible()` over
   `toBeInTheDocument()`, `toBeDisabled()` over reading an attribute,
   `toHaveValue()` over inspecting `.value`. They assert intent, not just
   presence.

2. **Do not nest `describe` blocks.** One top-level `describe` per test file.
   If grouping tempts you to nest, split into separate files or rely on clear
   `it` descriptions instead.

3. **Do not query or assert by user-facing copy.** Text is brittle — a wording
   change should not break a test. Query by role / accessible name / label
   (`getByRole`, `getByLabelText`) or an explicit `data-testid`, and assert on
   logical behaviour (state, emitted callbacks, what the user can do), not on
   exact strings. Treat copy as data, not as the contract under test.

4. **Make every test fail before you make it pass.** Before considering a test
   done, prove it exercises the behaviour: break the implementation or invert
   the assertion, watch it go red, then restore it and watch it go green. A
   test that has never failed proves nothing.
