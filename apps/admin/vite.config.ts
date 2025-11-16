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
      { find: "@components", replacement: resolvePath("src/components") },
      { find: "@styles", replacement: resolvePath("styles") },
      { find: "@public", replacement: resolvePath("public") },
      { find: "@apps/admin", replacement: resolvePath("src") },
      { find: "@apps/consumer", replacement: resolvePath("../consumer/src") },
      { find: "context", replacement: resolvePath("../consumer/src/context") },
      { find: "@context", replacement: resolvePath("../consumer/src/context") },
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
    port: 3001,
  },
  preview: {
    port: 4301,
  },
});
