import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const developmentPlugins = [
    devtools(),
    nitro(),
    tanstackStart(),
    visualizer({
      filename: "./stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ];
  const modePlugins = mode === "test" ? [] : developmentPlugins;

  return {
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      tailwindcss(),
      ...modePlugins,
      viteReact(),
      babel({
        presets: [reactCompilerPreset()],
      }),
    ],
    test: {
      environment: "jsdom",
      setupFiles: ["./vitest-setup.ts"],
      // Playwright e2e specs live in e2e/ and must not be picked up by Vitest.
      exclude: [...configDefaults.exclude, "e2e/**"],
    },
  };
});
