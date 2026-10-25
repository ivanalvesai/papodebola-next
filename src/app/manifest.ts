import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Papo de Bola",
    short_name: "Papo de Bola",
    description: "Portal de futebol brasileiro e mundial",
    start_url: "/",
    display: "standalone",
    background_color: "#F2F3F5",
    theme_color: "#00965E",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
