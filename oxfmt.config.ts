import { defineOxfmt } from "@wcmj/config-base/oxfmt";
import { tailwindOxfmt } from "@wcmj/config-tailwind/oxfmt";
import { tanstackOxfmt } from "@wcmj/config-tanstack/oxfmt";

export default defineOxfmt(tanstackOxfmt, tailwindOxfmt({ stylesheet: "src/styles.css" }));
