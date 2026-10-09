import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sadesk Suivi de Trésorerie",
    short_name: "SADesk",
    description: "Suivi local et prévisionnel de trésorerie.",
    start_url: "/produits/tresorerie",
    display: "standalone",
    background_color: "#e9f0ee",
    theme_color: "#0d3b37",
    icons: [{ src: "/logo_sadesk.png", sizes: "283x283", type: "image/png", purpose: "any" }],
  };
}