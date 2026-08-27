"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, ShoppingCart } from "lucide-react";
import { Product } from "@/app/lib/types";
import { useCartStore } from "@/app/lib/cartStore";
import { getBrandPath } from "@/app/lib/brandSlug";

interface ProductCardProps {
  product: Product;
  className?: string;
  detailBasePath?: string;
  showAddToCart?: boolean;
}

export default function ProductCard({
  product,
  className = "",
  detailBasePath = "/products",
  showAddToCart = true,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

  const detailHref = `${detailBasePath}/${product.id}`;
  const primaryImage = product.imageurl || product.images?.[0] || "/noImage.jpg";
  const isSoldOut = product.soldOut ?? false;
  const formattedPrice =
    typeof product.price === "string"
      ? product.price.startsWith("R")
        ? product.price
        : `R${product.price}`
      : `R${product.price}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultSize = product.availableSizes?.[0] || "M";
    const defaultMaterial = product.availableMaterials?.[0] || "Cotton";

    addItem(product, defaultSize, defaultMaterial);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <article
      className={`group relative overflow-hidden border border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-white/35 hover:bg-white/[0.07] ${className}`}
    >
      {isSoldOut && (
        <div className="absolute left-3 top-3 z-20 bg-white px-3 py-1 text-xs font-black uppercase text-black">
          Sold out
        </div>
      )}

      {product.category && (
        <div className="absolute right-3 top-3 z-20 bg-black/70 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white backdrop-blur">
          {product.category}
        </div>
      )}

      <Link href={detailHref} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
          <img
            src={primaryImage}
            alt={product.name}
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
              isSoldOut ? "opacity-45 grayscale" : ""
            }`}
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
      </Link>

      <div className="space-y-4 p-4">
        <div>
          {product.brand_id || product.brand_name ? (
            <Link
              href={getBrandPath({
                id: product.brand_id,
                name: product.brand_name,
              })}
              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/60 underline underline-offset-4 transition hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white"
            >
              {product.brand_name || "The Village"}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          ) : (
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
              The Village
            </p>
          )}

          <Link href={detailHref} className="block">
            <h3 className="mt-2 min-h-10 text-sm font-black leading-5 text-white transition hover:text-white/75">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xl font-black leading-none text-white">
            {formattedPrice}
          </p>

          {showAddToCart && !isSoldOut ? (
            <button
              onClick={handleAddToCart}
              className={`flex h-10 min-w-10 items-center justify-center gap-2 px-3 text-xs font-black uppercase transition-all duration-300 ${
                isAdded
                  ? "bg-emerald-500 text-black"
                  : "bg-white text-black hover:bg-white/85"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Add</span>
                </>
              )}
            </button>
          ) : (
            <Link
              href={detailHref}
              className="flex h-10 min-w-10 items-center justify-center gap-2 bg-white px-3 text-xs font-black uppercase text-black transition hover:bg-white/85"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span className="hidden sm:inline">View</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
