"use client";

import Link from "next/link";
import { Product } from "@/app/lib/types";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/app/lib/cartStore";
import { usePathname } from "next/navigation";
import { useUser } from "@/app/lib/user";
import { getCurrentProfileBase, joinProfilePath } from "@/app/lib/profileRoutes";

interface BrandShowcaseClientProps {
  products: Product[];
}

export default function BrandShowcaseClient({ products }: BrandShowcaseClientProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const profileBase = getCurrentProfileBase(pathname, user);
  const addItem = useCartStore((state) => state.addItem);

  function addToCart(product: Product) {
    if (product.soldOut) return;
    const size = product.availableSizes?.[0] || "M";
    const material = product.availableMaterials?.[0] || "Cotton";
    addItem(product, size, material);
    toast.success(`${product.name} added to cart`, {
      description: `Size: ${size} · ${material}`,
    });
  }

  return (
    <section>
      <div className="mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <h2 className="text-xl font-black sm:text-2xl">New from local brands</h2>
            <span className="hidden h-px w-10 shrink-0 bg-theme-ink/30 sm:block" />
          </div>
          <Link href="/products" className="flex shrink-0 items-center gap-2 text-xs font-bold underline underline-offset-4 sm:text-sm">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-1 text-sm text-theme-ink/60">Fresh drops from across The Village.</p>
      </div>

      <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
        {products.map((product) => (
          <article
            key={product.id}
            className="group w-[76vw] max-w-[310px] shrink-0 snap-start overflow-hidden rounded-2xl border border-theme-ink/10 bg-theme-ink/[0.03] text-theme-ink transition hover:-translate-y-1 hover:bg-theme-ink/[0.06] sm:w-auto sm:max-w-none"
          >
            <div className="relative">
              <Link href={joinProfilePath(profileBase, `products/${product.id}`)} className="block aspect-[4/3] overflow-hidden bg-theme-ink/5 sm:aspect-[4/5]">
                <img src={product.imageurl || "/noImage.jpg"} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </Link>
              <button
                type="button"
                onClick={() => addToCart(product)}
                disabled={product.soldOut}
                aria-label={product.soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
                title={product.soldOut ? "Sold out" : "Add to cart"}
                className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-theme-ink/20 bg-theme-base/90 text-theme-ink backdrop-blur transition hover:bg-theme-base focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            </div>
            <Link href={joinProfilePath(profileBase, `products/${product.id}`)} className="block p-4">
              <p className="truncate text-sm font-black">{product.name}</p>
              <p className="mt-2 text-base font-black">{product.price?.startsWith("R") ? product.price : `R${product.price}`}</p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
