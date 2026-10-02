import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "img/*.svg", "push-sw.js", "apple-touch-icon.png"],
      workbox: { importScripts: ["push-sw.js"], navigateFallbackDenylist: [/^\/api/] },
      manifest: {
        name: "ESAS - Monitoring Gejala Pasca Kemoterapi",
        short_name: "ESAS",
        description: "Pantau gejala pasca kemoterapi secara mandiri.",
        lang: "id",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#F5F8FE",
        theme_color: "#2563EB",
        id: "/",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      }
    })
  ]
});
