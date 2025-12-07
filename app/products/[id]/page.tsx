import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { mockProducts } from '@/app/lib/products'; // Simplified import path (assume lib at root; adjust if needed)
import { getProductById } from '@/app/lib/utils'; // Simplified; ensure this exports the function

interface Product {
  id: string;
  slug: string;
  name: string;
  price: string;
  category?: string;
  soldOut?: boolean;
  imageUrl: string;
  description?: string;
}

interface ProductPageProps {
  params: Promise<{ id: string }>; // Updated: params is now a Promise in Next.js 15+
}

export default async function ProductPage({ params }: ProductPageProps) { // Made async to await params
  const { id } = await params; // Unwrap the Promise
  
  const product: Product | undefined = getProductById(id);
  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium hover:underline group"
        >
          ← Back to Catalog
          <span className="w-4 h-4 border-r border-white/50 group-hover:translate-x-1 transition-transform" />
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Hero Image */}
          <div className="relative aspect-square rounded-md overflow-hidden border border-white/20 group">
            <Image
              src={product.imageUrl || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {product.soldOut && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <span className="text-white font-bold text-xl uppercase tracking-wide px-4 py-2 bg-black/30 rounded-full">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6 lg:pt-4">
            {product.category && (
              <p className="text-sm uppercase tracking-wide text-gray-400 font-medium">
                {product.category}
              </p>
            )}
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">{product.name}</h1>
            <p className="text-3xl font-bold text-white">{product.price}</p>
            
            {product.description && (
              <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                <p>{product.description}</p>
              </div>
            )}

             <div className="text-sm text-gray-400 space-y-2">
              <p><span className="font-medium">Material:</span> 100% Cotton</p>
              <p><span className="font-medium">Sizes:</span> S, M, L, XL</p>
              <p><span className="font-medium">Shipping:</span> Free over R500</p>
            </div>
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                className="flex-1 py-4 px-6 bg-white text-black font-bold rounded-md hover:bg-gray-100 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={product.soldOut}
              >
                {product.soldOut ? 'Sold Out' : 'Add to Cart'}
              </button>
              <Link
                href={product.soldOut ? '#' : '/checkout'}
                className="py-4 px-6 border border-white/20 rounded-md font-bold text-center hover:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.soldOut ? 'Sold Out' : 'Buy Now'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate static params for better performance (pre-renders pages at build time)
export async function generateStaticParams() {
  return mockProducts.map((product: Product) => ({
    id: product.id,
  }));
}