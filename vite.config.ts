import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import packageJson from './package.json';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8787',
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.API_KEY': JSON.stringify(mode === 'development' ? env.GEMINI_API_KEY : ''),
      '__APP_VERSION__': JSON.stringify(packageJson.version),
      '__COMMIT_HASH__': JSON.stringify(commitHash),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['**/*.test.ts', '**/*.test.tsx'],
      typecheck: {
        checker: 'vue-tsc',
      },
    },
  };
});
