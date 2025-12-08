// components/ProductCard.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/app/lib/types';
import { useCartStore } from '@/app/lib/cartStore';
import { useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    // Default options for quick-add
    const defaultSize = 'M';
    const defaultMaterial = 'Cotton';

    addItem(product, defaultSize, defaultMaterial);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Link href={`/products/${product.id}`} className={`block group ${className}`}>
      <div className="relative overflow-hidden rounded-md border border-white/20 hover:border-white/50 transition-all bg-white/10">
        
        {/* IMAGE */}
        <div className="aspect-square relative">
          <Image
            src={product.imageUrl || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          />
        </div>

        {/* DETAILS */}
        <div className="p-3 sm:p-4 space-y-2">

          <h3 className="font-bold text-white text-xs sm:text-sm leading-tight">
            {product.name}
          </h3>

          {product.category && (
            <p className="text-gray-400 text-xs uppercase tracking-wide">
              {product.category}
            </p>
          )}

          <div className="flex justify-between items-end pt-1">
            <p className="text-white font-bold text-lg sm:text-xl leading-none">
              {product.price}
            </p>

            {!product.soldOut && (
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className={`py-1.5 px-3 rounded-md font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  isAdded
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
