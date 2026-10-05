import process from "node:process";

import { defineViteConfig } from "@wcmj/config-react/vite";
import tailwind from "@wcmj/config-tailwind/vite";
import tanstack from "@wcmj/config-tanstack/vite";
import { visualizer } from "rollup-plugin-visualizer";

const analyze = {
  order: 20,
  plugins: () =>
    process.env["ANALYZE"] === "true"
      ? [visualizer({ filename: "./stats.html", open: true, gzipSize: true, brotliSize: true })]
      : [],
};

export default defineViteConfig({ addons: [tanstack, tailwind, analyze] });
