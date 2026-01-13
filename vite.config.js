import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        services: resolve(__dirname, 'services.html'),
        projects: resolve(__dirname, 'projects.html'),
        blogs: resolve(__dirname, 'blogs.html'),
        contact: resolve(__dirname, 'contact.html'),
        whyCam: resolve(__dirname, 'why-cam.html'),
        getQuote: resolve(__dirname, 'get-a-quote.html'),
        projectDetails: resolve(__dirname, 'project-details.html'),
        realEstate: resolve(__dirname, 'real-estate.html'),
        architecture: resolve(__dirname, 'architecture.html'),
        construction: resolve(__dirname, 'construction.html'),
        interiors: resolve(__dirname, 'interiors.html'),
        loading: resolve(__dirname, 'loadingPage.html'),
        login: resolve(__dirname, 'login.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      },
    },
  },
});
