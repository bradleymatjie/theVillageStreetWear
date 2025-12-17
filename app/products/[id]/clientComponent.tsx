// app/products/[id]/ProductPageClient.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from '@/app/lib/cartStore';
import { Product } from '@/app/lib/types';

interface ProductPageClientProps {
  product: Product;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const addItem = useCartStore((state) => state.addItem);

  debugger;
  console.log("product:", product);

  // Get available sizes and materials from product, with fallbacks
  const availableSizes = product.availableSizes && product.availableSizes.length > 0
    ? product.availableSizes
    : ["S", "M", "L", "XL"];

  const availableMaterials = product.availableMaterials && product.availableMaterials.length > 0
    ? product.availableMaterials
    : ["100% Cotton"];

  // Handle images array
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.imageurl || '/placeholder-product.jpg'];

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>(availableMaterials[0]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isAdded, setIsAdded] = useState(false);

  // Handle both database field names (imageurl, soldout) and mock data (imageUrl, soldOut)
  const imageUrl = productImages[selectedImageIndex];
  const isSoldOut = product.soldOut ?? product.soldOut ?? false;

  // Format price
  const formattedPrice = typeof product.price === 'string'
    ? product.price.startsWith('R') ? product.price : `R${product.price}`
    : `R${product.price}`;

  const handleAddToCart = () => {
    addItem(product, selectedSize, selectedMaterial);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">

        {/* Back Link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium hover:underline group"
        >
          ← Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* Hero Image */}

          <div>
            <div className="relative aspect-square rounded-md overflow-hidden border border-white/20 group">
              <Image
                src={imageUrl || "/noImage.jpg"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {isSoldOut && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                  <span className="text-white font-bold text-xl uppercase tracking-wide px-4 py-2 bg-black/30 rounded-full">
                    Sold Out
                  </span>
                </div>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {productImages.length > 1 && (
              <div className="mt-4 flex h-[100px] w-full justify-center">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? "border-white" 
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <Image
                      src={img || "/noImage.jpg"}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 25vw, 12vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>


          {/* Product Details */}
          <div className="space-y-6 lg:pt-4 ">

            {product.category && (
              <p className="text-sm uppercase tracking-wide text-gray-400 font-medium">
                {product.category}
              </p>
            )}

            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              {product.name}
            </h1>

            <p className="text-3xl font-bold text-white">{formattedPrice}</p>

            {product.description && (
              <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                <p>{product.description}</p>
              </div>
            )}

            {/* ========== SIZE SELECTOR ========== */}
            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-gray-300">Select Size</p>

                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={isSoldOut}
                      className={`px-4 py-2 border rounded-md transition-all ${selectedSize === size
                          ? "bg-white text-black"
                          : "border-white/20 text-gray-300 hover:border-white/40"
                        } ${isSoldOut ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ========== MATERIAL SELECTOR ========== */}
            {availableMaterials.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-gray-300">Select Material</p>

                <div className="flex flex-wrap gap-2">
                  {availableMaterials.map((mat) => (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterial(mat)}
                      disabled={isSoldOut}
                      className={`px-4 py-2 border rounded-md transition-all ${selectedMaterial === mat
                          ? "bg-white text-black"
                          : "border-white/20 text-gray-300 hover:border-white/40"
                        } ${isSoldOut ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 px-6 font-bold rounded-md text-center transition-all duration-300 ${isAdded
                    ? "bg-green-600 text-white"
                    : "bg-white text-black hover:bg-gray-100"
                  } ${isSoldOut ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isSoldOut}
              >
                {isSoldOut
                  ? "Sold Out"
                  : isAdded
                    ? "✓ Added to Cart"
                    : "Add to Cart"}
              </button>

              <Link
                href={isSoldOut ? "#" : "/checkout"}
                className={`py-4 px-6 border border-white/20 rounded-md font-bold text-center hover:border-white/50 transition-colors ${isSoldOut ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                  }`}
              >
                {isSoldOut ? "Sold Out" : "Buy Now"}
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}