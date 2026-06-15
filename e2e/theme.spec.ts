import { expect, test } from "@playwright/test";

test.describe("theme", () => {
  test("server renders the class from the theme cookie (no JS required)", async ({
    context,
    page,
  }) => {
    await context.addCookies([{ name: "theme", value: "dark", url: "http://localhost:3000" }]);

    const response = await page.goto("/");
    const html = (await response?.text()) ?? "";

    // The class must be in the server HTML itself, before hydration, so there
    // is no flash and it works with JS disabled.
    expect(html).toMatch(/<html[^>]*class="[^"]*\bdark\b/);
  });

  test("system mode resolves from the OS preference via CSS", async ({ context, page }) => {
    await context.addCookies([{ name: "theme", value: "system", url: "http://localhost:3000" }]);
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    await expect(page.locator("html")).toHaveClass(/system/);
    await expect(page.locator("body")).toHaveCSS("color-scheme", "light dark");
  });

  test("toggling updates the document class (JS-enhanced, no reload)", async ({ page }) => {
    await page.goto("/");

    await page.locator('button[value="dark"]').click();

    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});

test.describe("theme without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the toggle still switches theme via a form POST", async ({ page }) => {
    await page.goto("/");

    // With JS disabled, clicking submits the form to the server function, which
    // sets the cookie and redirects back — the reloaded page is server-rendered
    // with the new class.
    await page.locator('button[value="dark"]').click();

    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
