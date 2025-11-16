import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const resolvePath = (...segments: string[]) => path.resolve(__dirname, ...segments);
const rootDir = resolvePath("..", "..");

export default defineConfig({
  envDir: rootDir,
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: [
      { find: "@", replacement: resolvePath("src") },
      { find: "@components", replacement: resolvePath("components") },
      { find: "@styles", replacement: resolvePath("styles") },
  { find: "@assets", replacement: resolvePath("assets") },
      { find: "@public", replacement: resolvePath("public") },
      { find: "@apps/consumer", replacement: resolvePath("src") },
      { find: "@apps/artist", replacement: resolvePath("src/artist") },
      { find: "context", replacement: resolvePath("src/context") },
      { find: "@context", replacement: resolvePath("../../packages/context/src") },
      { find: "@api", replacement: resolvePath("../../packages/api/src") }
    ]
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
