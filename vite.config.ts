import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 3000, // Fija el puerto a 3000
  },
  resolve: {
    alias: {
      '/assets': '/src/assets', // Asegura que los archivos estáticos se sirvan correctamente
    },
  },
});
