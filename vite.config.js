import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import seo from './build/seo.js';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), seo()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
