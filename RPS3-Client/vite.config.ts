import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // Important for Docker
    },
    host: true, // Listen on all interfaces
    strictPort: true,
    port: 3000,
    allowedHosts: [
      "localhost", // Local access
      "client",
    ],
  },
});
