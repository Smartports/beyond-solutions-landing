import { defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { Plugin } from 'vite';

// CSP injection plugin
const cspPlugin = (): Plugin => ({
  name: 'inject-csp',
  transformIndexHtml(html) {
    const csp =
      "default-src 'self' https:; " +
      "script-src 'self' 'unsafe-inline' https:; " +
      "style-src 'self' 'unsafe-inline' https:; " +
      "img-src 'self' data: blob: https:; " +
      "connect-src 'self' https:; " +
      "font-src 'self' https://fonts.gstatic.com https:; " +
      "frame-src 'self' https:;";
    // remove existing CSP meta if any
    const withoutOld = html.replace(/<meta[^>]+http-equiv="Content-Security-Policy"[^>]*>/i, '');
    return withoutOld.replace(
      '<head>',
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}">`,
    );
  },
});

export default defineConfig(({ mode }): UserConfig => ({
  root: '.', 
  publicDir: 'public',
  build: {
    outDir: 'dist',
    // Don't override rollupOptions input - let Vite use the default index.html
    minify: mode === 'production',
    cssCodeSplit: true,
    sourcemap: false,
    assetsInlineLimit: 4096,
  },
  server: {
    port: 5173,
    host: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Beyond Calculator',
        short_name: 'Calculator',
        description: 'Calculadora de presupuesto inmobiliario Beyond Solutions',
        theme_color: '#334b4e',
        background_color: '#ffffff',
        display: 'standalone',
        lang: 'es',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
    // Inject CSP only in production to avoid hindering local dev & HMR
    ...(mode === 'production' ? [cspPlugin()] : []),
  ],
}));
