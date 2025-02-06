import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import mkcert from "vite-plugin-mkcert";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait(), tailwindcss(), mkcert()],
  server: {
    allowedHosts: [".ngrok-free.app"] // ✅ Correct way to allow *.ngrok-free.app
  },
  build: {
    target: "esnext" // ✅ Ensures top-level await support
  }
});
