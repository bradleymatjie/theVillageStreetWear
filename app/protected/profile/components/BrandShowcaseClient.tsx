"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/lib/types";

interface BrandShowcaseClientProps {
  products: Product[];
}

export default function BrandShowcaseClient({
  products,
}: BrandShowcaseClientProps) {
  const [activeBrand, setActiveBrand] = useState("all");
  const brands = useMemo(() => {
    const uniqueBrands = Array.from(
      new Set(
        products
          .map((product) => product.brand_name?.trim())
          .filter(Boolean)
      )
    ) as string[];

    return [
      { id: "all", name: "All" },
      ...uniqueBrands.map((brand) => ({
        id: brand.toLowerCase(),
        name: brand,
      })),
    ];
  }, [products]);

  const filteredProducts =
    activeBrand === "all"
      ? products
      : products.filter(
          (product) =>
            product.brand_name?.trim().toLowerCase() === activeBrand
        );

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-black">Discover Brands</h2>
        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          Browse brands and their latest drops.
        </p>
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth pb-2">
        {brands.map((brand) => {
          const active = activeBrand === brand.id;

          return (
            <button
              key={brand.id}
              onClick={() => setActiveBrand(brand.id)}
              className={`shrink-0 rounded-2xl px-5 py-3 text-sm font-black transition ${
                active
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "border border-black/10 bg-black/5 text-black/60 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
              }`}
            >
              {brand.name}
            </button>
          );
        })}
      </div>

      <div className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            href={`/protected/profile/products/${product.id}`}
            className="w-[160px] shrink-0 overflow-hidden rounded-3xl border border-black/10 bg-black/5 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <div className="relative aspect-[4/5] bg-white">
              <Image
                src={product.imageurl || "/noImage.jpg"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-3">
              <p className="line-clamp-2 text-xs font-black leading-snug text-black dark:text-white">
                {product.name}
              </p>

              <p className="mt-2 text-sm font-black text-black dark:text-white">
                {product.price?.startsWith("R")
                  ? product.price
                  : `R${product.price}`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}