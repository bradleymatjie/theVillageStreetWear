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
import { usePathname } from "next/navigation";
import { useUser } from "@/app/lib/user";
import { getCurrentProfileBase, joinProfilePath } from "@/app/lib/profileRoutes";

interface ProductFiltersProps {
  data: Product[] | null;
}

export default function ProductFilters({ data }: ProductFiltersProps) {
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "featured" | "price-low" | "price-high" | "name-az"
  >("featured");
  const pathname = usePathname();
  const { user } = useUser();
  const profileBase = getCurrentProfileBase(pathname, user);


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
        <p className="text-theme-base/50 dark:text-theme-ink/50">
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
          className="w-full rounded-full bg-theme-base/5 text-theme-base placeholder-theme-base/50 focus-visible:ring-2 focus-visible:ring-theme-base focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-theme-ink/5 dark:text-theme-ink dark:placeholder-theme-ink/50 dark:focus-visible:ring-theme-ink dark:focus-visible:ring-offset-black sm:w-80"
        />

        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as typeof sortBy)}
        >
          <SelectTrigger className="w-full rounded-full bg-theme-base/5 text-theme-base focus-visible:ring-2 focus-visible:ring-theme-base dark:bg-theme-ink/5 dark:text-theme-ink dark:focus-visible:ring-theme-ink sm:w-[220px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>

          <SelectContent className="border-theme-base/10 bg-theme-ink text-theme-base dark:border-theme-ink/10 dark:bg-theme-base dark:text-theme-ink">
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
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${active
                  ? "bg-theme-base text-theme-ink hover:bg-theme-base/90 dark:bg-theme-ink dark:text-theme-base dark:hover:bg-theme-ink/90"
                  : "text-theme-base/60 hover:bg-theme-base/10 dark:text-theme-ink/60 dark:hover:bg-theme-ink/10"
                }`}
            >
              {brand === "all" ? "All" : brand}
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            detailBasePath={joinProfilePath(profileBase, "products")}
            showAddToCart={false}
          />
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="py-12 text-center">
          <p className="mb-2 text-lg text-theme-base/50 dark:text-theme-ink/50">
            No products found
          </p>
          <p className="text-sm text-theme-base/40 dark:text-theme-ink/40">
            {searchTerm || selectedBrand !== "all"
              ? "Try adjusting your filters"
              : "Check back soon for new drops"}
          </p>
        </div>
      )}

    </div>
  );
}
