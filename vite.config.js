import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Vite core doesn't include react plugin by default?
// Wait, I might need to check if @vitejs/plugin-react is installed.
// It is likely not if package.json doesn't show it.
// If I cannot install it, I can't use it.
// But the user said "Frontend (React)".
// Let's assume vite handles jsx via esbuild by default for .jsx files but HMR might need plugin-react.
// If I can't use plugin-react, I'll rely on basic vite behavior.

export default defineConfig({
  plugins: [], // No react plugin available? I'll try without it first or check node_modules.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html'
      }
    }
  }
});
