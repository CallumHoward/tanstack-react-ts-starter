import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { NotFound } from "#/components/not-found";

describe("NotFound", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the 404 status heading", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("404");
  });

  it("shows the page-not-found message", () => {
    render(<NotFound />);

    expect(screen.getByText("Page not found")).toBeTruthy();
  });
});
