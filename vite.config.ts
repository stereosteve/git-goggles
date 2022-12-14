import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/git": "http://localhost:8090",
      "/gitws": {
        target: "http://localhost:8090",
        ws: true,
      },
    },
  },
});
