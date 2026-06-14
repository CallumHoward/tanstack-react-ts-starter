import { useTheme } from "@/components/theme-context";
import { THEMES, type Theme } from "@/lib/theme";

const LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset
      aria-label="Color theme"
      className="inline-flex gap-1 rounded-lg border border-border bg-card p-1"
    >
      {THEMES.map((option) => (
        <label
          key={option}
          className="cursor-pointer rounded-md px-3 py-1 text-sm text-muted-foreground has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring"
        >
          <input
            type="radio"
            name="theme"
            value={option}
            aria-label={LABELS[option]}
            checked={theme === option}
            onChange={() => setTheme(option)}
            className="sr-only"
          />
          {LABELS[option]}
        </label>
      ))}
    </fieldset>
  );
}
