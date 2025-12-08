// app/products/[id]/page.tsx (Server Component)
import { notFound } from 'next/navigation';
import { mockProducts } from '@/app/lib/products';
import { getProductById } from '@/app/lib/utils';// Make sure this file is in the same directory
import ProductPageClient from './clientComponent';
import { Product } from '@/app/lib/types';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params; // Server component can await
  
  const product: Product | undefined = getProductById(id);
  if (!product) {
    notFound();
  }

  // Pass the product data to the client component
  return <ProductPageClient product={product} />;
}

// Generate static params for better performance
export async function generateStaticParams() {
  return mockProducts.map((product: Product) => ({
    id: product.id,
  }));
}