import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Instagram,
  MapPin,
  Package,
  Shirt,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/app/lib/types";
import ProductCard from "@/app/products/components/ProductCard";
import { slugifyBrandName } from "@/app/lib/brandSlug";
import { absoluteUrl, siteConfig } from "@/app/lib/seo";

export const dynamic = "force-dynamic";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

type BrandProfile = {
  id: string;
  name: string;
  tagline?: string | null;
  story?: string | null;
  street_address?: string | null;
  location_city?: string | null;
  location_province?: string | null;
  location_country?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  founded_year?: string | number | null;
  style_category?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
};

function matchesBrandSlug(brand: Pick<BrandProfile, "id" | "name">, slug: string) {
  return brand.id === slug || slugifyBrandName(brand.name || "") === slug;
}

function matchesProductBrand(product: Product, slug: string, brandId?: string) {
  return (
    (brandId && product.brand_id === brandId) ||
    product.brand_id === slug ||
    slugifyBrandName(product.brand_name || "") === slug
  );
}

function brandFromProduct(product: Product, slug: string): BrandProfile {
  return {
    id: product.brand_id || slug,
    name: product.brand_name || slug.replace(/-/g, " "),
    style_category: product.category || "Streetwear brand",
  };
}

function getSocialHref(value: string, platform: "instagram" | "tiktok") {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const handle = value.replace(/^@/, "");
  return platform === "instagram"
    ? `https://instagram.com/${handle}`
    : `https://tiktok.com/@${handle}`;
}

function getSocialLabel(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const url = new URL(value);
      return url.pathname.replace(/^\/@?/, "@") || url.hostname;
    } catch {
      return value;
    }
  }

  return value.startsWith("@") ? value : `@${value}`;
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;

  const [{ data: brands }, { data: products }] = await Promise.all([
    supabase.from("brands").select("*"),
    supabase
      .from("thevillageproducts")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const brand = ((brands || []) as BrandProfile[]).find((item) =>
    matchesBrandSlug(item, slug)
  );
  const allProducts = (products || []) as Product[];
  const brandProducts = allProducts.filter((product) =>
    matchesProductBrand(product, slug, brand?.id)
  );
  const fallbackProduct = brandProducts[0];
  const brandProfile = brand || (fallbackProduct ? brandFromProduct(fallbackProduct, slug) : null);

  if (!brandProfile) {
    notFound();
  }

  const brandPath = `/brands/${slugifyBrandName(brandProfile.name) || brandProfile.id}`;
  const addressParts = [
    brandProfile.street_address,
    brandProfile.location_city,
    brandProfile.location_province,
    brandProfile.location_country,
  ].filter(Boolean);
  const sameAs = [
    brandProfile.instagram
      ? getSocialHref(brandProfile.instagram, "instagram")
      : null,
    brandProfile.tiktok ? getSocialHref(brandProfile.tiktok, "tiktok") : null,
  ].filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brandProfile.name,
    description:
      brandProfile.tagline ||
      brandProfile.story ||
      `Shop ${brandProfile.name} on ${siteConfig.name}.`,
    url: absoluteUrl(brandPath),
    logo: brandProfile.logo_url || undefined,
    image: brandProfile.cover_image_url || undefined,
    sameAs,
    address: addressParts.length
      ? {
          "@type": "PostalAddress",
          streetAddress: brandProfile.street_address || undefined,
          addressLocality: brandProfile.location_city || undefined,
          addressRegion: brandProfile.location_province || undefined,
          addressCountry: brandProfile.location_country || undefined,
        }
      : undefined,
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative border-b border-white/10">
        <div className="relative h-[320px] overflow-hidden bg-white/5 sm:h-[420px]">
          {brandProfile.cover_image_url ? (
            <img
              src={brandProfile.cover_image_url}
              alt={`${brandProfile.name} cover`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl font-black text-white/10">
              {brandProfile.name.slice(0, 1)}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/10" />
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
            <Link
              href="/products"
              className="mb-6 inline-flex items-center gap-2 border border-white/15 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-wide text-white/70 backdrop-blur transition hover:bg-white hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to marketplace
            </Link>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden border border-white/20 bg-black">
                {brandProfile.logo_url ? (
                  <img
                    src={brandProfile.logo_url}
                    alt={`${brandProfile.name} logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-black">
                    {brandProfile.name.slice(0, 1)}
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">
                  {brandProfile.style_category || "Streetwear brand"}
                </p>
                <h1 className="mt-2 text-5xl font-black leading-none sm:text-7xl">
                  {brandProfile.name}
                </h1>
                {brandProfile.tagline && (
                  <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-white/75 sm:text-lg">
                    {brandProfile.tagline}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-stretch gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="space-y-4">
              <div className="flex h-full flex-col border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
                  Brand details
                </p>
                <div className="mt-5 space-y-4 text-sm text-white/65">
                  {brandProfile.street_address && (
                    <p className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/45" />
                      <span>{brandProfile.street_address}</span>
                    </p>
                  )}
                  {(brandProfile.location_city ||
                    brandProfile.location_province ||
                    brandProfile.location_country) && (
                    <p className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/45" />
                      <span>
                        {[
                          brandProfile.location_city,
                          brandProfile.location_province,
                          brandProfile.location_country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </p>
                  )}
                  {brandProfile.founded_year && (
                    <p className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-white/45" />
                      Founded {brandProfile.founded_year}
                    </p>
                  )}
                  {brandProfile.instagram && (
                    <a
                      href={getSocialHref(brandProfile.instagram, "instagram")}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 transition hover:text-white"
                    >
                      <Instagram className="h-4 w-4 text-white/45" />
                      <span>{getSocialLabel(brandProfile.instagram)}</span>
                      <ExternalLink className="ml-auto h-3.5 w-3.5 text-white/35" />
                    </a>
                  )}
                  {brandProfile.tiktok && (
                    <a
                      href={getSocialHref(brandProfile.tiktok, "tiktok")}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 transition hover:text-white"
                    >
                      <Shirt className="h-4 w-4 text-white/45" />
                      <span>{getSocialLabel(brandProfile.tiktok)}</span>
                      <ExternalLink className="ml-auto h-3.5 w-3.5 text-white/35" />
                    </a>
                  )}
                  <p className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-white/45" />
                    {brandProducts.length} products live
                  </p>
                </div>
              </div>
            </aside>

            <section className="h-full border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
                Story
              </p>
              <h2 className="mt-2 text-3xl font-black">About {brandProfile.name}</h2>
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-white/65 sm:text-base">
                {brandProfile.story ||
                  "This brand is still building out their story. Check back soon for more about who they are and what they stand for."}
              </p>
            </section>
          </div>

          <section className="mt-10">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
                  Products
                </p>
                <h2 className="mt-2 text-3xl font-black">Latest drops</h2>
              </div>
              <p className="text-sm text-white/45">
                Shop pieces listed by {brandProfile.name}.
              </p>
            </div>

            {brandProducts.length === 0 ? (
              <div className="border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="font-black">No products live yet</p>
                <p className="mt-2 text-sm text-white/50">
                  This brand has not listed products yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {brandProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [{ data: brands }, { data: products }] = await Promise.all([
    supabase.from("brands").select("id, name, tagline, cover_image_url"),
    supabase.from("thevillageproducts").select("*"),
  ]);

  const brand = ((brands || []) as BrandProfile[]).find((item) =>
    matchesBrandSlug(item, slug)
  );
  const productBrand = ((products || []) as Product[]).find((product) =>
    matchesProductBrand(product, slug, brand?.id)
  );
  const brandProfile = brand || (productBrand ? brandFromProduct(productBrand, slug) : null);

  if (!brandProfile) {
    return {
      title: "Brand Not Found",
    };
  }

  const brandPath = `/brands/${slugifyBrandName(brandProfile.name) || brandProfile.id}`;
  const title = `${brandProfile.name} on The Village`;
  const description =
    brandProfile.tagline ||
    `Shop ${brandProfile.name} products and read their story on The Village.`;

  return {
    title,
    description,
    alternates: {
      canonical: brandPath,
    },
    openGraph: {
      title,
      description,
      url: brandPath,
      images: brandProfile.cover_image_url ? [brandProfile.cover_image_url] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: brandProfile.cover_image_url ? [brandProfile.cover_image_url] : [],
    },
  };
}
