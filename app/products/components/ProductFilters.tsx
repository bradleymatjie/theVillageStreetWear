"use client";

import { useMemo, useState } from "react";
import { Product } from "@/app/lib/types";
import ProductCard from "./ProductCard";
import { Search, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFiltersProps {
  data: Product[] | null;
}

const getCategoryKey = (category: string) =>
  category.trim().toLowerCase().replace(/[\s-]+/g, "-");

export default function ProductFilters({ data }: ProductFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "featured" | "price-low" | "price-high" | "name-az"
  >("featured");

  const categories = useMemo(() => {
    const uniqueCatsSet = new Set<string>();

    if (data) {
      data.forEach((p) => {
        if (p.category && typeof p.category === "string") {
          uniqueCatsSet.add(getCategoryKey(p.category));
        }
      });
    }

    return ["all", ...Array.from(uniqueCatsSet)];
  }, [data]);

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-400">Loading products...</p>
      </div>
    );
  }

  let filteredProducts =
    selectedCategory === "all"
      ? data
      : data.filter((p) => {
          if (!p.category || typeof p.category !== "string") return false;
          return getCategoryKey(p.category) === selectedCategory;
        });

  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    filteredProducts = filteredProducts.filter((p) =>
      [p.name, p.brand_name, p.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(lowerSearch))
    );
  }

  const sortedProducts = [...filteredProducts];
  if (sortBy === "price-low") {
    sortedProducts.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else if (sortBy === "price-high") {
    sortedProducts.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  } else if (sortBy === "name-az") {
    sortedProducts.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }

  const getCategoryLabel = (cat: string) => {
    if (cat === "all") return "All";
    return cat
      .split(/[\s-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-8">
      <div className="border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
              Browse drops
            </p>
            <p className="mt-1 text-sm text-white/55">
              {sortedProducts.length} of {data.length} products showing
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <Input
                placeholder="Search product, brand, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-none border-white/10 bg-black pl-11 text-white placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-0"
              />
            </div>

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as typeof sortBy)}
            >
              <SelectTrigger className="h-12 w-full rounded-none border-white/10 bg-black text-white focus:ring-1 focus:ring-white sm:w-[220px]">
                <SlidersHorizontal className="mr-2 h-4 w-4 text-white/45" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-black text-white">
                <SelectItem value="featured">Latest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name-az">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            variant="ghost"
            className={`h-10 rounded-none border px-4 text-xs font-black uppercase tracking-wide whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "border-white bg-white text-black hover:bg-white/90"
                : "border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {getCategoryLabel(cat)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="border border-white/10 bg-white/[0.03] py-12 text-center">
          <p className="mb-2 text-lg text-gray-400">No products found</p>
          <p className="text-sm text-gray-500">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your filters"
              : "Check back soon for new drops"}
          </p>
        </div>
      )}
    </div>
  );
}
