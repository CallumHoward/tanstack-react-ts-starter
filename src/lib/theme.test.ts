import { describe, expect, it } from "vitest";

import { resolveTheme } from "#/lib/theme";

describe("resolveTheme", () => {
  it.each(["light", "dark", "system"] as const)(
    "returns the value for the valid theme %s",
    (theme) => {
      expect(resolveTheme(theme)).toBe(theme);
    },
  );

  it("falls back to the default for an unknown value", () => {
    expect(resolveTheme("banana")).toBe("system");
  });

  it("falls back to the default when no cookie is set", () => {
    expect(resolveTheme(undefined)).toBe("system");
  });
});
