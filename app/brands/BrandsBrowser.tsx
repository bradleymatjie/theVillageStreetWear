"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, MapPin, Package, Search } from "lucide-react";
import { getBrandPath } from "@/app/lib/brandSlug";

export type BrandCardData = {
  id: string;
  name: string;
  tagline?: string | null;
  logo_url?: string | null;
  location_city?: string | null;
  location_province?: string | null;
  location_country?: string | null;
  style_category?: string | null;
  productCount: number;
  categories: string[];
};

function getLocation(brand: BrandCardData) {
  return [brand.location_city, brand.location_province, brand.location_country]
    .filter(Boolean)
    .join(", ");
}

function getCityLabel(brand: BrandCardData) {
  return brand.location_city || brand.location_province || brand.location_country || "";
}

export default function BrandsBrowser({ brands }: { brands: BrandCardData[] }) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState("all");

  const cities = useMemo(
    () =>
      [...new Set(brands.map(getCityLabel).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [brands]
  );

  const categories = useMemo(
    () =>
      [
        ...new Set(
          brands
            .flatMap((brand) => [
              brand.style_category,
              ...brand.categories,
            ])
            .filter(Boolean) as string[]
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [brands]
  );

  const filteredBrands = brands.filter((brand) => {
    const query = search.trim().toLowerCase();
    const brandLocation = getLocation(brand).toLowerCase();
    const brandCategories = [brand.style_category, ...brand.categories]
      .filter(Boolean)
      .map((item) => item!.toLowerCase());

    const matchesSearch =
      !query ||
      brand.name.toLowerCase().includes(query) ||
      brand.tagline?.toLowerCase().includes(query) ||
      brandLocation.includes(query) ||
      brandCategories.some((item) => item.includes(query));

    const matchesCity = city === "all" || getCityLabel(brand) === city;
    const matchesCategory =
      category === "all" ||
      brandCategories.some((item) => item === category.toLowerCase());

    return matchesSearch && matchesCity && matchesCategory;
  });

  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search brands, cities, categories..."
                className="h-12 w-full border border-white/10 bg-black pl-11 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-white/30 focus:border-white/40"
              />
            </label>

            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="h-12 w-full border border-white/10 bg-black px-4 text-sm font-bold text-white outline-none transition focus:border-white/40"
            >
              <option value="all">All locations</option>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-12 w-full border border-white/10 bg-black px-4 text-sm font-bold text-white outline-none transition focus:border-white/40"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm font-bold text-white/45">
            Showing {filteredBrands.length} of {brands.length} brands
          </p>
          {(search || city !== "all" || category !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCity("all");
                setCategory("all");
              }}
              className="text-xs font-black uppercase tracking-wide text-white/60 underline underline-offset-4 transition hover:text-white"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredBrands.length === 0 ? (
          <div className="mt-6 border border-white/10 bg-white/[0.04] p-10 text-center">
            <p className="text-xl font-black">No brands match those filters.</p>
            <p className="mt-2 text-sm text-white/50">
              Try a different location, category, or search term.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBrands.map((brand) => (
              <Link
                key={brand.id}
                href={getBrandPath({ id: brand.id, name: brand.name })}
                className="group flex min-h-[280px] flex-col border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/[0.07]"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden border border-white/10 bg-black">
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={`${brand.name} logo`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-black text-white/45">
                        {brand.name.slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <span className="border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white/45">
                    {brand.style_category || brand.categories[0] || "Streetwear"}
                  </span>
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-black leading-tight">
                    {brand.name}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/55">
                    {brand.tagline ||
                      "Independent streetwear brand building inside The Village."}
                  </p>
                </div>

                <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
                  {getLocation(brand) && (
                    <p className="flex items-center gap-2 text-xs font-bold text-white/45">
                      <MapPin className="h-4 w-4" />
                      {getLocation(brand)}
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-xs font-bold text-white/45">
                    <Package className="h-4 w-4" />
                    {brand.productCount} products live
                  </p>
                  <p className="inline-flex items-center text-xs font-black uppercase tracking-wide text-white/60 group-hover:text-white">
                    View storefront <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
