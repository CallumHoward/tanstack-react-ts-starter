import { expect, test } from "@playwright/test";

test("home page renders and the console stays clean", async ({ page }) => {
  const consoleErrors: Array<string> = [];
  const pageErrors: Array<string> = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto("/");

  // The route renders <main>Hello world</main>; this also confirms the page
  // responded and the document mounted.
  await expect(page.locator("main")).toContainText("Hello world");

  // Give hydration a moment to flush any deferred errors.
  await page.waitForLoadState("networkidle");

  expect(pageErrors, "uncaught page exceptions").toEqual([]);
  expect(consoleErrors, "browser console errors").toEqual([]);
});
