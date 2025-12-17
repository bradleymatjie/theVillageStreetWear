'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/app/lib/types';
import ProductCard from './ProductCard';

// shadcn/ui imports (add these components if not already installed)
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductFiltersProps {
  data: Product[] | null;
}

export default function ProductFilters({ data }: ProductFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>(['all']);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'name-az'>('featured');

  useEffect(() => {
    if (data && data.length > 0) {
      const uniqueCatsSet = new Set<string>();
      data.forEach((p) => {
        if (p.category && typeof p.category === 'string') {
          uniqueCatsSet.add(p.category.trim().toLowerCase());
        }
      });
      setCategories(['all', ...Array.from(uniqueCatsSet)]);
    }
  }, [data]);

  // Loading / no data state
  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Loading products...</p>
      </div>
    );
  }

  // Filter by category
  let filteredProducts = selectedCategory === 'all'
    ? data
    : data.filter((p) => {
        if (!p.category || typeof p.category !== 'string') return false;
        return p.category.trim().toLowerCase() === selectedCategory;
      });

  // Search filter
  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    filteredProducts = filteredProducts.filter((p) =>
      p.name && typeof p.name === 'string'
        ? p.name.toLowerCase().includes(lowerSearch)
        : false
    );
  }

  // Sorting
  const sortedProducts = [...filteredProducts];
  if (sortBy === 'price-low') {
    sortedProducts.sort((a, b) => (Number(a.price) ?? 0) - (Number(b.price) ?? 0));
  } else if (sortBy === 'price-high') {
    sortedProducts.sort((a, b) => (Number(b.price) ?? 0) - (Number(a.price) ?? 0));
  } else if (sortBy === 'name-az') {
    sortedProducts.sort((a, b) =>
      (a.name ?? '').localeCompare(b.name ?? '')
    );
  }

  const getCategoryLabel = (cat: string) => {
    if (cat === 'all') return 'All';
    return cat
      .split(/[\s-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-8">
      {/* Search + Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 rounded-full bg-gray-800 border-0 text-white placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        />

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
          <SelectTrigger className="w-full sm:w-[220px] rounded-full bg-gray-800 border-0 text-white focus-visible:ring-2 focus-visible:ring-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 bg-white">
            <SelectItem value="featured">Latest</SelectItem>
            <SelectItem value="price-low">Price: Low → High</SelectItem>
            <SelectItem value="price-high">Price: High → Low</SelectItem>
            <SelectItem value="name-az">Name: A → Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Pills (using shadcn Button for consistency) */}
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            variant="ghost"
            className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-white text-black hover:bg-white/90'
                : 'text-white hover:bg-gray-700'
            }`}
          >
            {getCategoryLabel(cat)}
          </Button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Empty State */}
      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-2">No products found</p>
          <p className="text-gray-500 text-sm">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Check back soon for new drops'}
          </p>
        </div>
      )}
    </div>
  );
}