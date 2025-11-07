import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  // const { default: tsconfigPaths } = await import("vite-tsconfig-paths");

  // return {
    plugins: [react(), tsconfigPaths()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    optimizeDeps: {
      include: ["date-fns"],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern",
          additionalData: `@use "@/styles/theme.scss" as *;`,
        },
      },
    },
    server: {
      port: 3000,
    },
  // };
});
