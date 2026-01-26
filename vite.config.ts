import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base path - use '/' since GitHub Pages deploys to root of the domain
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        compose: resolve(__dirname, 'compose.html'),
        preview: resolve(__dirname, 'preview.html'),
      },
    },
  },
  server: {
    // Redirect root to /compose
    open: '/compose',
  },
});
