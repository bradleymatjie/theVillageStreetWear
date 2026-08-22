import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/app/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/checkout",
          "/login",
          "/signup",
          "/success",
          "/order-success",
          "/protected/",
          "/studio/",
          "/verify/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
