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
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
