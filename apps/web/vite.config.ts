import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()] as any,
  resolve: {
    alias: {
      '@kata/core': path.resolve(__dirname, '../../packages/core/src'),
      '@kata/rendering': path.resolve(__dirname, '../../packages/rendering/src'),
      '@kata/db': path.resolve(__dirname, '../../packages/db/src'),
      '@kata/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@kata/drawing': path.resolve(__dirname, '../../packages/drawing/src'),
      '@kata/music': path.resolve(__dirname, '../../packages/music/src'),
      '@kata/app': path.resolve(__dirname, '../../packages/app/src'),
    },
  },
  // Copy sql.js WASM to public on dev/build
  assetsInclude: ['**/*.wasm'],
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    sourcemap: true,
  },
});