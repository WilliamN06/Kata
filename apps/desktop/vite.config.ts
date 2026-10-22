import react from '@vitejs/plugin-react';
import path from 'path';

export default {
  plugins: [react()],
  resolve: {
    alias: {
      '@kata/core': path.resolve(__dirname, '../../packages/core/src'),
      '@kata/rendering': path.resolve(__dirname, '../../packages/rendering/src'),
      '@kata/db': path.resolve(__dirname, '../../packages/db/src'),
      '@kata/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@kata/drawing': path.resolve(__dirname, '../../packages/drawing/src'),
      '@kata/audio': path.resolve(__dirname, '../../packages/audio/src'),
      '@kata/music': path.resolve(__dirname, '../../packages/music/src'),
      '@kata/app': path.resolve(__dirname, '../../packages/app/src'),
    },
  },
  clearScreen: false,
  server: { port: 5173, strictPort: true },
  envPrefix: ['VITE_', 'TAURI_'],
};