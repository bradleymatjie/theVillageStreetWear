"use client";

import { useMemo, useState } from "react";
import { Product } from "@/app/lib/types";
import ProductCard from "./ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/app/lib/cartStore";
import CartSidebar from "../../components/CartItems";

interface ProductFiltersProps {
  data: Product[] | null;
}

export default function ProductFilters({ data }: ProductFiltersProps) {
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sortBy, setSortBy] = useState<
    "featured" | "price-low" | "price-high" | "name-az"
  >("featured");

  const cartItemCount = useCartStore((state) => state.getTotalItems());

  const brands = useMemo(() => {
    if (!data) return ["all"];

    const uniqueBrands = Array.from(
      new Set(
        data
          .map((product) => product.brand_name?.trim())
          .filter(Boolean)
      )
    ) as string[];

    return ["all", ...uniqueBrands];
  }, [data]);

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-black/50 dark:text-white/50">
          Loading products...
        </p>
      </div>
    );
  }

  let filteredProducts =
    selectedBrand === "all"
      ? data
      : data.filter(
          (product) =>
            product.brand_name?.trim().toLowerCase() ===
            selectedBrand.toLowerCase()
        );

  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();

    filteredProducts = filteredProducts.filter((product) =>
      product.name?.toLowerCase().includes(lowerSearch)
    );
  }

  const sortedProducts = [...filteredProducts];

  if (sortBy === "price-low") {
    sortedProducts.sort(
      (a, b) => Number(a.price || 0) - Number(b.price || 0)
    );
  } else if (sortBy === "price-high") {
    sortedProducts.sort(
      (a, b) => Number(b.price || 0) - Number(a.price || 0)
    );
  } else if (sortBy === "name-az") {
    sortedProducts.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-full bg-black/5 text-black placeholder-black/50 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white/5 dark:text-white dark:placeholder-white/50 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black sm:w-80"
        />

        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as typeof sortBy)}
        >
          <SelectTrigger className="w-full rounded-full bg-black/5 text-black focus-visible:ring-2 focus-visible:ring-black dark:bg-white/5 dark:text-white dark:focus-visible:ring-white sm:w-[220px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>

          <SelectContent className="border-black/10 bg-white text-black dark:border-white/10 dark:bg-black dark:text-white">
            <SelectItem value="featured">Latest</SelectItem>
            <SelectItem value="price-low">Price: Low → High</SelectItem>
            <SelectItem value="price-high">Price: High → Low</SelectItem>
            <SelectItem value="name-az">Name: A → Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="no-scrollbar flex space-x-4 overflow-x-auto scroll-smooth pb-2">
        {brands.map((brand) => {
          const active =
            brand === "all"
              ? selectedBrand === "all"
              : selectedBrand.toLowerCase() === brand.toLowerCase();

          return (
            <Button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              variant="ghost"
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  : "text-black/60 hover:bg-black/10 dark:text-white/60 dark:hover:bg-white/10"
              }`}
            >
              {brand === "all" ? "All" : brand}
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="py-12 text-center">
          <p className="mb-2 text-lg text-black/50 dark:text-white/50">
            No products found
          </p>
          <p className="text-sm text-black/40 dark:text-white/40">
            {searchTerm || selectedBrand !== "all"
              ? "Try adjusting your filters"
              : "Check back soon for new drops"}
          </p>
        </div>
      )}

      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-2xl transition hover:scale-105 active:scale-95 dark:bg-white dark:text-black lg:bottom-6"
        aria-label="Open cart"
      >
        <ShoppingCart className="h-6 w-6" />

        {cartItemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
            {cartItemCount > 9 ? "9+" : cartItemCount}
          </span>
        )}
      </button>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}