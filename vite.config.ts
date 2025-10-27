import { defineConfig, type UserConfig } from "vite"
import react from "@vitejs/plugin-react"
import basicSsl from "@vitejs/plugin-basic-ssl"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  // const { default: tsconfigPaths } = await import('vite-tsconfig-paths');
  // return {
  plugins: [react(), tsconfigPaths(), basicSsl()],
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
        api: "modern", // 'api' no es una opción válida en Vite 5. Si usabas SASS, esto se maneja automáticamente. Comentario de Gemini
        additionalData: `@use "@/styles/theme.scss" as *;`,
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
} as UserConfig)
