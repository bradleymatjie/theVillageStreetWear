'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/app/lib/types';
import mockProducts from '@/app/lib/products';
import ProductCard from './ProductCard';

interface ProductFiltersProps {
  onProductsChange?: (products: Product[]) => void;
}

export default function ProductFilters({ onProductsChange }: ProductFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = ['all', 'T-Shirts', 'Hoodies', 'long sleeve'] as const;
  
  const categoryLabels: Record<typeof categories[number], string> = {
    all: 'All',
    'T-Shirts': 'T-Shirts',
    'Hoodies': 'Hoodies',
    'long sleeve': 'Long Sleeve',
  };

  const filteredProducts = selectedCategory === 'all'
    ? mockProducts
    : mockProducts.filter((p: Product) => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  // Notify parent when filtered products change
  useEffect(() => {
    if (onProductsChange) {
      onProductsChange(filteredProducts);
    }
  }, [filteredProducts, onProductsChange]);

  return (
    <div className="space-y-8">
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={` cursor-pointer px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-white text-black'
                : 'text-white hover:text-gray-300'
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-400 col-span-full">No products found.</p>
      )}
    </div>
  );
}