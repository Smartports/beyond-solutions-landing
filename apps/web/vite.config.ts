import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',              // mantiene cwd
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'public/index.html'
    }
  },
  plugins: [react()]
});
