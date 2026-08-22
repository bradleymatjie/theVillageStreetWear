import type { MetadataRoute } from "next";
import { slugifyBrandName } from "@/app/lib/brandSlug";
import { absoluteUrl } from "@/app/lib/seo";
import { supabase } from "@/lib/supabaseClient";

type SitemapProduct = {
  id: string;
  slug?: string | null;
  brand_id?: string | null;
  brand_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type SitemapBrand = {
  id: string;
  name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/products", priority: 0.95 },
  { path: "/sell", priority: 0.8 },
  { path: "/about", priority: 0.55 },
  { path: "/contact", priority: 0.45 },
  { path: "/shipping", priority: 0.35 },
  { path: "/returns", priority: 0.35 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
];

function getLastModified(value?: string | null) {
  return value ? new Date(value) : new Date();
}

function getBrandSitemapEntries(
  brands: SitemapBrand[],
  products: SitemapProduct[]
) {
  const brandMap = new Map<
    string,
    { slug: string; lastModified: Date }
  >();

  brands.forEach((brand) => {
    const slug = brand.name ? slugifyBrandName(brand.name) : brand.id;

    if (slug) {
      brandMap.set(slug, {
        slug,
        lastModified: getLastModified(brand.updated_at || brand.created_at),
      });
    }
  });

  products.forEach((product) => {
    const slug = product.brand_name
      ? slugifyBrandName(product.brand_name)
      : product.brand_id;

    if (slug && !brandMap.has(slug)) {
      brandMap.set(slug, {
        slug,
        lastModified: getLastModified(product.updated_at || product.created_at),
      });
    }
  });

  return [...brandMap.values()];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: products }, { data: brands }] = await Promise.all([
    supabase
      .from("thevillageproducts")
      .select("id, slug, brand_id, brand_name, created_at, updated_at")
      .order("created_at", { ascending: false }),
    supabase.from("brands").select("id, name, created_at, updated_at"),
  ]);

  const productEntries = (products || []) as SitemapProduct[];
  const brandEntries = getBrandSitemapEntries(
    (brands || []) as SitemapBrand[],
    productEntries
  );

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route.priority,
    })),
    ...productEntries.map((product) => ({
      url: absoluteUrl(`/products/${product.slug || product.id}`),
      lastModified: getLastModified(product.updated_at || product.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...brandEntries.map((brand) => ({
      url: absoluteUrl(`/brands/${brand.slug}`),
      lastModified: brand.lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
