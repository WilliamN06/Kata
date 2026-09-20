import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@kata/core': './packages/core/src',
      '@kata/rendering': './packages/rendering/src',
      '@kata/db': './packages/db/src',
      '@kata/ui': './packages/ui/src',
      '@kata/drawing': './packages/drawing/src',
      '@kata/music': './packages/music/src',
      '@kata/app': './packages/app/src',
    },
  },
});