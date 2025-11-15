import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const resolvePath = (...segments: string[]) => path.resolve(__dirname, ...segments);

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: [
      { find: "@components", replacement: resolvePath("src/components") },
      { find: "components", replacement: resolvePath("src/components") },
      { find: "@utils", replacement: resolvePath("src/utils") },
      { find: "utils", replacement: resolvePath("src/utils") },
      { find: "@apps/artist", replacement: resolvePath("src/apps/artist") },
      { find: "apps/artist", replacement: resolvePath("src/apps/artist") },
      { find: "@apps/admin", replacement: resolvePath("src/apps/admin") },
      { find: "apps/admin", replacement: resolvePath("src/apps/admin") },
      { find: "@apps/consumer", replacement: resolvePath("src/apps/consumer") },
      { find: "apps/consumer", replacement: resolvePath("src/apps/consumer") },
      { find: "@apps/map", replacement: resolvePath("src/apps/map") },
      { find: "@apps/orgs", replacement: resolvePath("src/apps/orgs") },
      { find: "@apps", replacement: resolvePath("apps") },
      { find: "apps", replacement: resolvePath("apps") },
  { find: "@context", replacement: resolvePath("src/context") },
  { find: "context", replacement: resolvePath("src/context") },
  { find: "@data", replacement: resolvePath("src/data") },

  { find: "@/styles", replacement: resolvePath("src/styles") },
      { find: "@/assets", replacement: resolvePath("src/assets") },
      { find: "@/public", replacement: resolvePath("public") },

      { find: "@prixpon/ui", replacement: resolvePath("packages/ui/src") },
      { find: "@prixpon/types", replacement: resolvePath("packages/types/src") },
      { find: "@prixpon/tokens", replacement: resolvePath("packages/tokens/src") },
      { find: "@prixpon/config", replacement: resolvePath("packages/config/src") },
      { find: "@prixpon/utils", replacement: resolvePath("packages/utils/src") },
      { find: "@prixpon/api", replacement: resolvePath("packages/api/src") },
      { find: "@prixpon/data", replacement: resolvePath("packages/data/src") },
      { find: "@prixpon/context", replacement: resolvePath("packages/context/src") }
    ]
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
