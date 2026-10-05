import playwright from "@wcmj/config-playwright/oxlint";
import { defineOxlint } from "@wcmj/config-react/oxlint";
import { tanstackRouter } from "@wcmj/config-tanstack/oxlint";

export default defineOxlint(tanstackRouter, playwright);
