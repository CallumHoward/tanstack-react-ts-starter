import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

export type Theme = "light" | "dark" | "system";

/** Selectable themes, in display order. */
export const THEMES: ReadonlyArray<Theme> = ["light", "dark", "system"];

/**
 * Theme used when no cookie is set (first visit). `system` resolves to the OS preference in pure
 * CSS via light-dark(). An app that wants light by default can change this to "light" — keep the
 * bare `color-scheme` in src/styles.css in sync.
 */
const DEFAULT_THEME: Theme = "system";

const THEME_COOKIE = "theme";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function isTheme(value: string | undefined): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

/** Resolve a raw cookie value to a theme, falling back to the default. */
export function resolveTheme(cookie: string | undefined): Theme {
  return isTheme(cookie) ? cookie : DEFAULT_THEME;
}

/**
 * Read the persisted theme on the server so the root route can stamp the correct class on <html>
 * before the first byte is sent — no flash, no JS.
 */
export const getThemeServerFn = createServerFn({ method: "GET" }).handler(() =>
  resolveTheme(getCookie(THEME_COOKIE)),
);

/**
 * Persist and apply a theme on the client without a round trip: swap the <html> class (which drives
 * color-scheme, which light-dark() reads) and write the cookie so the next SSR render agrees.
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.remove(...THEMES);
  root.classList.add(theme);
  // Mark the cookie Secure on HTTPS so it is never sent over plain HTTP; omit it
  // on http (e.g. local dev) where a Secure cookie would be dropped.
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax${secure}`;
}
