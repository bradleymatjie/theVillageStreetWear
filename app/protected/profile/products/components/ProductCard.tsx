"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/app/lib/types";
import { ArrowUpRight, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({
  product,
  className = "",
}: ProductCardProps) {
  const primaryImage = product.imageurl || "/noImage.jpg";
  const isSoldOut = product.soldOut ?? false;

  const formattedPrice =
    typeof product.price === "string"
      ? product.price.startsWith("R")
        ? product.price
        : `R${product.price}`
      : `R${product.price}`;

  return (
    <Link
      href={`/protected/profile/products/${product.id}`}
      className={`group block ${className}`}
    >
      <article className="overflow-hidden rounded-2xl border border-black/10 bg-black/5 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-black/30 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-white">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-contain transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            {product.category && (
              <span className="rounded-full bg-black/80 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white backdrop-blur dark:bg-white/80 dark:text-black">
                {product.category}
              </span>
            )}

            {isSoldOut && (
              <span className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                Sold Out
              </span>
            )}
          </div>

          {/* Hover Icon */}
          <div className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white opacity-0 transition group-hover:opacity-100 dark:bg-white dark:text-black">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 p-4">
          <div>
            <h3 className="line-clamp-2 text-sm font-black leading-snug text-black dark:text-white">
              {product.name}
            </h3>

            <p className="mt-1 text-xs text-black/45 dark:text-white/45">
              Tap to view details
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-black/10 pt-3 dark:border-white/10 w-full">
            <p className="text-sm font-black text-black dark:text-white">
              {formattedPrice}
            </p>

            <div className="flex items-center gap-1 rounded-full bg-black px-3 py-1.5 text-xs font-black text-white dark:bg-white dark:text-black">
              <ShoppingBag className="h-2 w-2" />
              View
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}