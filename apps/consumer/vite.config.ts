import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const resolvePath = (...segments: string[]) => path.resolve(__dirname, ...segments);
const rootDir = resolvePath("..", "..");
const tsconfigProjects = [
  resolvePath("tsconfig.json"),
  resolvePath("..", "..", "tsconfig.json")
];

export default defineConfig({
  envDir: rootDir,
  plugins: [react(), tsconfigPaths({ projects: tsconfigProjects })],
  resolve: {
    alias: {
      "@styles": resolvePath("styles"),
      "@components": resolvePath("components"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern",
        additionalData: '@use "@styles/theme.scss" as *;',
      },
    },
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 4300,
  },
});
