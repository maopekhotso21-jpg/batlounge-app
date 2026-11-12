import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules\/recharts\//.test(id)) return 'recharts';
          if (/node_modules\/d3-[^/]+\//.test(id)) return 'd3';
        }
      }
    }
  }
});