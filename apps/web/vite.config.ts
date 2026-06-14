import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Lê o .env da raiz do monorepo (um único arquivo para todo o projeto).
  // Apenas variáveis com prefixo VITE_ são expostas ao cliente.
  envDir: fileURLToPath(new URL('../../', import.meta.url)),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
