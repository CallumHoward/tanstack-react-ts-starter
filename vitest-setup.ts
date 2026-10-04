import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";
import { configureAxe } from "vitest-axe";
import * as matchers from "vitest-axe/matchers";

declare module "vitest" {
  // Type parameters must mirror vitest's own Matchers declaration exactly, or
  // the merge fails; T is unused here.
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown> {
    toHaveNoViolations(): R;
  }
}

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

export const axe = configureAxe({
  rules: {
    // jsdom has no canvas, so axe can't compute colours
    "color-contrast": { enabled: false },
    // Components are rendered in isolation, not as a full page, so the
    // page-level landmark best-practice rule does not apply here.
    region: { enabled: false },
  },
});
