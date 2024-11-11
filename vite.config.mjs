import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sass from 'sass';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
        api: 'modern',
      }
    }
  },
  resolve: {
    alias: {
        'components': path.resolve(__dirname, 'src/components'),
        'context': path.resolve(__dirname, 'src/context'),
        'apps': path.resolve(__dirname, 'src/apps'),
        'images': path.resolve(__dirname, 'src/images'),
        'types': path.resolve(__dirname, 'src/types'),
        'utils': path.resolve(__dirname, 'src/utils'),
        '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000, // Optional: match CRA's default port if desired
  }
});
