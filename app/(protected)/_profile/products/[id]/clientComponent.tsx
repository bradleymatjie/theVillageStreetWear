"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/app/lib/cartStore";
import { Product } from "@/app/lib/types";
import { useUser } from "@/app/lib/user";
import { getCurrentProfileBase, joinProfilePath } from "@/app/lib/profileRoutes";

interface ProductPageClientProps {
  product: Product;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const addItem = useCartStore((state) => state.addItem);
  const pathname = usePathname();
  const { user } = useUser();
  const profileBase = getCurrentProfileBase(pathname, user);

  const availableSizes =
    product.availableSizes?.length > 0
      ? product.availableSizes
      : ["S", "M", "L", "XL"];

  const productImages =
    product.images?.length > 0
      ? product.images
      : [product.imageurl || "/noImage.jpg"];

  const [selectedSize, setSelectedSize] = useState(availableSizes[0]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  const imageUrl = productImages[selectedImageIndex];
  const isSoldOut = product.soldOut ?? false;

  const formattedPrice =
    typeof product.price === "string"
      ? product.price.startsWith("R")
        ? product.price
        : `R${product.price}`
      : `R${product.price}`;

  const handleAddToCart = () => {
    addItem(product, selectedSize, "Default");
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-theme-ink p-4 text-theme-base dark:bg-theme-base dark:text-theme-ink lg:pb-4">
      <div className="mx-auto max-w-6xl">
        {/* BACK */}
        <Link
          href={joinProfilePath(profileBase, "products")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          ← Back to Catalog
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* IMAGE */}
          <div>
            <div className="group relative aspect-square overflow-hidden rounded-xl border border-theme-base/10 bg-theme-ink dark:border-theme-ink/10">
              <img
                src={imageUrl}
                alt={product.name}                className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
              />

              {isSoldOut && (
                <div className="absolute inset-0 flex items-center justify-center bg-theme-base/60">
                  <span className="rounded-full bg-theme-base/40 px-4 py-2 text-xl font-bold uppercase text-theme-ink">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* THUMBNAILS */}
            {productImages.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 w-20 overflow-hidden rounded-md border-2 ${
                      selectedImageIndex === index
                        ? "border-theme-base dark:border-theme-ink"
                        : "border-theme-base/10 dark:border-theme-ink/10"
                    }`}
                  >
                    <img
                      src={img}
                      alt="product"                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="space-y-6">
            {product.category && (
              <p className="text-sm uppercase tracking-wide text-theme-base/50 dark:text-theme-ink/50">
                {product.category}
              </p>
            )}

            <h1 className="text-4xl font-black">{product.name}</h1>

            <p className="text-3xl font-bold">{formattedPrice}</p>

            {product.description && (
              <p className="leading-relaxed text-theme-base/70 dark:text-theme-ink/70">
                {product.description}
              </p>
            )}

            {/* SIZE */}
            <div>
              <p className="mb-2 font-medium text-theme-base/70 dark:text-theme-ink/70">
                Select Size
              </p>

              <div className="flex gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-md border px-4 py-2 ${
                      selectedSize === size
                        ? "bg-theme-base text-theme-ink dark:bg-theme-ink dark:text-theme-base"
                        : "border-theme-base/20 dark:border-theme-ink/20"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* DESKTOP ACTIONS */}
            <div className="hidden gap-4 sm:flex">
              <button
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className={`flex-1 rounded-md px-6 py-4 font-bold transition ${
                  isAdded
                    ? "bg-green-600 text-theme-ink"
                    : "bg-theme-base text-theme-ink hover:bg-theme-base/80 dark:bg-theme-ink dark:text-theme-base"
                }`}
              >
                {isSoldOut
                  ? "Sold Out"
                  : isAdded
                  ? "✓ Added"
                  : "Add to Cart"}
              </button>

              <Link
                href={isSoldOut ? "#" : "/checkout"}
                className="rounded-md border border-theme-base/20 px-6 py-4 text-center font-bold dark:border-theme-ink/20"
              >
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 MOBILE FIXED ADD TO CART */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t z-10000 border-theme-base/10 bg-theme-ink/95 p-4 backdrop-blur-xl dark:border-theme-ink/10 dark:bg-theme-base/95 sm:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black">{formattedPrice}</p>
            <p className="text-sm font-bold text-theme-base/60 dark:text-theme-ink/60">
              <span>Size: {selectedSize}</span>
            </p>

          </div>

          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className={`rounded-full px-6 py-4 text-sm font-black transition ${
              isAdded
                ? "bg-green-600 text-theme-ink"
                : "bg-theme-base text-theme-ink dark:bg-theme-ink dark:text-theme-base"
            } ${isSoldOut ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {isSoldOut ? "Sold Out" : isAdded ? "✓ Added" : "Add To Bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
