import { render, screen } from "@testing-library/react";
import { axe } from "@wcmj/config-react/vitest-setup";
import { describe, expect, it } from "vitest";

import { AppShell } from "#/components/app-shell";

describe("AppShell", () => {
  it("renders the theme toggle and its children", () => {
    render(
      <AppShell theme="light">
        <main>Page content</main>
      </AppShell>,
    );

    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByRole("main")).toBeVisible();
  });

  it("reflects the provided theme in the toggle", () => {
    render(
      <AppShell theme="dark">
        <main>Page content</main>
      </AppShell>,
    );

    expect(screen.getByRole("button", { name: /dark/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AppShell theme="light">
        <main>Page content</main>
      </AppShell>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
