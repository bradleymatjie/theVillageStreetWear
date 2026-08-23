import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/app/lib/types";
import { slugifyBrandName } from "@/app/lib/brandSlug";
import BrandsBrowser, { BrandCardData } from "./BrandsBrowser";

export const dynamic = "force-dynamic";

type Brand = {
  id: string;
  name: string;
  status?: string | null;
  tagline?: string | null;
  logo_url?: string | null;
  location_city?: string | null;
  location_province?: string | null;
  location_country?: string | null;
  style_category?: string | null;
};

export const metadata: Metadata = {
  title: "Brands in The Village",
  description:
    "Discover independent South African streetwear brands selling through The Village.",
  alternates: {
    canonical: "/brands",
  },
  openGraph: {
    title: "Brands in The Village",
    description:
      "Discover independent South African streetwear brands selling through The Village.",
    url: "/brands",
    type: "website",
  },
};

function productMatchesBrand(product: Product, brand: Brand) {
  return (
    product.brand_id === brand.id ||
    slugifyBrandName(product.brand_name || "") === slugifyBrandName(brand.name)
  );
}

function getBrandProducts(products: Product[], brand: Brand) {
  return products.filter((product) => productMatchesBrand(product, brand));
}

function buildBrandCards(brands: Brand[], products: Product[]) {
  const brandMap = new Map<string, BrandCardData>();

  brands
    .filter((brand) => brand.name)
    .forEach((brand) => {
      const brandProducts = getBrandProducts(products, brand);
      const productCount = brandProducts.length;

      if (productCount === 0) return;

      const key = slugifyBrandName(brand.name) || brand.id;
      const categories = [
        ...new Set(
          brandProducts
            .map((product) => product.category)
            .filter(Boolean) as string[]
        ),
      ];
      const card: BrandCardData = {
        id: brand.id,
        name: brand.name,
        tagline: brand.tagline,
        logo_url: brand.logo_url,
        location_city: brand.location_city,
        location_province: brand.location_province,
        location_country: brand.location_country,
        style_category: brand.style_category,
        productCount,
        categories,
      };
      const existing = brandMap.get(key);

      if (!existing || card.productCount > existing.productCount) {
        brandMap.set(key, card);
      }
    });

  return [...brandMap.values()].sort((a, b) => b.productCount - a.productCount);
}

async function getBrands() {
  const [{ data: brands }, { data: products }] = await Promise.all([
    supabase.from("brands").select("*").eq("status", "active"),
    supabase
      .from("thevillageproducts")
      .select("id, name, category, brand_id, brand_name")
      .order("created_at", { ascending: false }),
  ]);

  return buildBrandCards((brands || []) as Brand[], (products || []) as Product[]);
}

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
          <div>
            <p className="mb-5 inline-flex border border-white/20 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-white/55">
              Browse brands
            </p>
            <h1 className="max-w-4xl text-6xl font-black leading-[0.88] sm:text-8xl">
              BRANDS IN THE VILLAGE.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              Discover independent South African streetwear labels, explore
              their stories, and shop their latest products.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.04] p-5">
            <p className="text-5xl font-black">{brands.length}</p>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-white/45">
              Active brands with products live
            </p>
            <Link
              href="/sell"
              className="mt-6 inline-flex items-center text-sm font-black uppercase tracking-wide text-white/60 underline underline-offset-4 transition hover:text-white"
            >
              Sell your brand <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <BrandsBrowser brands={brands} />
    </main>
  );
}
