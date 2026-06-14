import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { ThemeProvider } from "#/components/theme/theme-provider";
import { ThemeToggle } from "#/components/theme/theme-toggle";
import type { Theme } from "#/lib/theme";

import { axe } from "../../../vitest-setup";

function renderToggle(initialTheme: Theme = "system") {
  return {
    user: userEvent.setup(),
    ...render(
      <ThemeProvider initialTheme={initialTheme}>
        <ThemeToggle />
      </ThemeProvider>,
    ),
  };
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    document.cookie = "theme=; path=/; max-age=0";
  });

  it("reflects the initial theme as the checked option", () => {
    renderToggle("dark");

    expect(screen.getByRole("radio", { name: /dark/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /light/i })).not.toBeChecked();
  });

  it("applies the chosen theme to the document element and cookie", async () => {
    const { user } = renderToggle("system");

    await user.click(screen.getByRole("radio", { name: /dark/i }));

    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement).not.toHaveClass("system");
    expect(document.cookie).toContain("theme=dark");
    expect(screen.getByRole("radio", { name: /dark/i })).toBeChecked();
  });

  it("swaps the class when switching between themes", async () => {
    const { user } = renderToggle("dark");

    await user.click(screen.getByRole("radio", { name: /light/i }));

    expect(document.documentElement).toHaveClass("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("has no accessibility violations", async () => {
    const { container } = renderToggle();

    expect(await axe(container)).toHaveNoViolations();
  });
});
