export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://thevillagestreetwear.com"
).replace(/\/$/, "");

export const siteConfig = {
  name: "The Village",
  title: "The Village | South African Streetwear Marketplace",
  description:
    "Shop independent South African streetwear brands, discover local drops, and choose delivery or pickup from brands near you.",
  url: siteUrl,
  ogImage: "/og-image.png",
};

export function absoluteUrl(path: string) {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
