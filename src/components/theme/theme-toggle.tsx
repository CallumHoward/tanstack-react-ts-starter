import type { SubmitEvent } from "react";

import { useTheme } from "#/components/theme/theme-context";
import { isTheme, setThemeServerFunction, THEMES, type Theme } from "#/lib/theme";

const LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    const submitter = event.nativeEvent.submitter;
    const value = submitter instanceof HTMLButtonElement ? submitter.value : undefined;
    // Progressive enhancement: when JS runs, apply the theme client-side and skip
    // the round-trip. Without JS this handler never fires and the form posts to
    // setThemeServerFunction, which sets the cookie and redirects back.
    if (isTheme(value)) {
      event.preventDefault();
      setTheme(value);
    }
  }

  return (
    <form method="post" action={setThemeServerFunction.url} onSubmit={handleSubmit}>
      <fieldset
        aria-label="Color theme"
        className="inline-flex gap-1 rounded-lg border border-border bg-card p-1"
      >
        {THEMES.map((option) => (
          <button
            key={option}
            type="submit"
            name="theme"
            value={option}
            aria-pressed={theme === option}
            className="cursor-pointer rounded-md px-3 py-1 text-sm text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            {LABELS[option]}
          </button>
        ))}
      </fieldset>
    </form>
  );
}
