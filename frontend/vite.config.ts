import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import relay from 'vite-plugin-relay'
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // Load environment variables

  return {
    plugins: [react(),relay,tsconfigPaths()],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
      // You can add other environment variables here if needed, for example:
      // 'import.meta.env.OTHER_ENV_VAR': JSON.stringify(env.OTHER_ENV_VAR),
    },
  }
})