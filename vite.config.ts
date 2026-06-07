import { defineConfig } from "vitest/config";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { visualizer } from "rollup-plugin-visualizer";

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
    plugins: [
      viteTsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tailwindcss(),
      ...modePlugins,
      viteReact(),
      babel({
        presets: [reactCompilerPreset()],
      }),
    ],
    test: {
      environment: "jsdom",
    },
  };
});
