import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import relay from 'vite-plugin-relay';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), relay, tsconfigPaths()],
    resolve: {
      alias: {
        'workflows-lib': path.resolve(__dirname, 'node_modules/workflows-lib/dist')
      }
    },
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL)
    }
  };
});
