import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const APP_VERSION = '2.4.18';

function getGitCommit(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'prod-latest';
  }
}

function otaVersionPlugin(): Plugin {
  return {
    name: 'vite-plugin-ota-version',
    buildStart() {
      const commit = getGitCommit();
      const now = new Date();
      const meta = {
        commit,
        buildTime: now.toISOString(),
        date: now.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        timestamp: Date.now(),
        version: APP_VERSION,
      };

      const publicDir = path.resolve(__dirname, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(path.resolve(publicDir, 'version.json'), JSON.stringify(meta, null, 2));
    },
    generateBundle() {
      const commit = getGitCommit();
      const now = new Date();
      const meta = {
        commit,
        buildTime: now.toISOString(),
        date: now.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        timestamp: Date.now(),
        version: APP_VERSION,
      };

      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify(meta, null, 2),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), otaVersionPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
