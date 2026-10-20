"use client";

import Link from "next/link";
import { Product } from "@/app/lib/types";
import { ArrowRight, Heart } from "lucide-react";
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

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black sm:text-2xl">New from local brands</h2>
            <span className="hidden h-px w-10 bg-theme-base/30 dark:bg-theme-ink/30 sm:block" />
          </div>
          <p className="mt-1 text-sm text-theme-base/50 dark:text-theme-ink/50">Fresh drops from across The Village.</p>
        </div>
        <Link href="/products" className="flex shrink-0 items-center gap-2 text-xs font-bold underline underline-offset-4 sm:text-sm">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={joinProfilePath(profileBase, `products/${product.id}`)}
            className="group w-[76vw] max-w-[310px] shrink-0 snap-start overflow-hidden rounded-2xl border border-theme-base/10 bg-theme-base/[0.025] transition hover:-translate-y-1 hover:bg-theme-base/5 dark:border-theme-ink/10 dark:bg-theme-ink/[0.03] dark:hover:bg-theme-ink/[0.06] sm:w-auto sm:max-w-none"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-theme-ink sm:aspect-[4/5]">
              <img src={product.imageurl || "/noImage.jpg"} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-theme-ink/20 bg-theme-base/70 text-theme-ink backdrop-blur">
                <Heart className="h-5 w-5" />
              </span>
            </div>
            <div className="p-4">
              <p className="truncate text-sm font-black">{product.name}</p>
              <p className="mt-2 text-base font-black">{product.price?.startsWith("R") ? product.price : `R${product.price}`}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
