import type { MetadataRoute } from "next";
import { siteConfig } from "@/app/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "The Village",
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/brand/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/favicon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/brand/app-icon-dark.png",
        sizes: "144x144",
        type: "image/png",
      },
    ],
  };
}
