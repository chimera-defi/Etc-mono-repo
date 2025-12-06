import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // Allow importing from the wallets folder
      '@wallets': resolve(__dirname, '../../wallets')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router']
        }
      }
    }
  },
  server: {
    port: 3001,  // Different port from wallet-rankings
    open: true
  }
});
