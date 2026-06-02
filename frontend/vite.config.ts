import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// During development the frontend proxies API calls to the FastAPI backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
