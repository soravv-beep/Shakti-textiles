import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // Dev ke dauraan kabhi bhi browser-cache se purana code na chale —
    // ye ek hi kaam karta hai: "destroy is not a function" jaise stale-HMR
    // crashes hamesha ke liye khatam.
    headers: { 'Cache-Control': 'no-store' },
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
  preview: {
    port: 4173,
    headers: { 'Cache-Control': 'no-store' },
  },
});
