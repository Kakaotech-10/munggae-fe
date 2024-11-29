import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".");

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: mode === "production",
          ws: true,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              if (req.headers.authorization) {
                proxyReq.setHeader("Authorization", req.headers.authorization);
              }

              if (req.headers.cookie) {
                proxyReq.setHeader("Cookie", req.headers.cookie);
              }
            });
          },
        },
      },
    },
  };
});
