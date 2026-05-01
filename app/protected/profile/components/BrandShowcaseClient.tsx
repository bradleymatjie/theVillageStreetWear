"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/lib/types";

interface BrandShowcaseClientProps {
  products: Product[];
}

const brands = [
  { id: "all", name: "All" },
  { id: "the-village", name: "The Village" },
  { id: "guru-nation", name: "GURU NATION" },
  { id: "skippa", name: "SKIPPA" },
  { id: "adidas", name: "ADIDAS" },
  { id: "nike", name: "NIKE" },
];

export default function BrandShowcaseClient({
  products,
}: BrandShowcaseClientProps) {
  const [activeBrand, setActiveBrand] = useState("all");

  const filteredProducts = products;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-black">Discover Brands</h2>
        <p className="mt-1 text-sm text-white/50">
          Browse brands and their latest drops.
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {brands.map((brand) => {
          const active = activeBrand === brand.id;

          return (
            <button
              key={brand.id}
              onClick={() => setActiveBrand(brand.id)}
              className={`shrink-0 rounded-2xl px-5 py-3 text-sm font-black transition ${
                active
                  ? "bg-white text-black"
                  : "border border-white/10 bg-white/5 text-white/60"
              }`}
            >
              {brand.name}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            href={`/protected/profile/products/${product.id}`}
            className="w-[160px] shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5"
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
              <p className="line-clamp-2 text-xs font-black leading-snug">
                {product.name}
              </p>
              <p className="mt-2 text-sm font-black">
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