import type { Config } from "stylelint";

const tailwindAtRules = [
  "theme",
  "apply",
  "custom-variant",
  "variant",
  "utility",
  "source",
  "plugin",
  "reference",
  "config",
  "tailwind",
  "screen",
  "responsive",
];

const config: Config = {
  extends: ["stylelint-config-standard"],
  // www/ and ios/ hold generated Capacitor build output (minified bundles).
  ignoreFiles: ["dist/**", ".output/**", "node_modules/**", "www/**", "ios/**"],
  rules: {
    "declaration-no-important": true,
    "max-nesting-depth": [2, { ignoreAtRules: ["media", "supports", "layer"] }],
    "no-unknown-animations": true,
    "selector-max-id": 0,
    "at-rule-no-unknown": [true, { ignoreAtRules: tailwindAtRules }],
    // csstree validates `@apply` against the CSS Mixins draft, not Tailwind's syntax
    "at-rule-prelude-no-invalid": [true, { ignoreAtRules: tailwindAtRules }],
  },
};

export default config;
