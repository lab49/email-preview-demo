import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base path for GitHub Pages - update 'email-preview' to match your repo name
  base: '/email-preview/',
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
