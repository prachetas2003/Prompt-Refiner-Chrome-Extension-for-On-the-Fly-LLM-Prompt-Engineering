// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import manifest from './manifest.json' assert { type: "json" };

// Create manifest without background script for CRXJS
const manifestForCrx = {
  ...manifest,
  background: undefined
};

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifestForCrx }),
    dts(),
  ],
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        options: resolve(process.cwd(), 'src/options/index.html'),
      },
    },
  },
});
