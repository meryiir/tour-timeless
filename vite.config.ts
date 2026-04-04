import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Default 8082 = docker-compose BACKEND_PORT default. If `docker ps` shows :8081->8081, set .env to 8081.
  // Local Spring in IDE (no Docker): VITE_DEV_API_PROXY=http://127.0.0.1:8081
  const apiProxyTarget = env.VITE_DEV_API_PROXY || "http://127.0.0.1:8082";

  return {
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        timeout: 120_000,
        proxyTimeout: 120_000,
      },
      "/uploads": {
        target: apiProxyTarget,
        changeOrigin: true,
        timeout: 120_000,
        proxyTimeout: 120_000,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
});
