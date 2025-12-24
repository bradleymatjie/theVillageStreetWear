// app/products/[id]/page.tsx (Server Component)
import { notFound } from 'next/navigation';
import { getProduct } from '@/app/lib/utils';
import ProductPageClient from './clientComponent';
import { Product } from '@/app/lib/types';
import { supabase } from '@/lib/supabaseClient';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  // Fetch product by ID or slug
  const product: Product | null = await getProduct(id);
  
  if (!product) {
    notFound();
  }

  return <ProductPageClient product={product} />;
}

// Generate static params for all products in database
export async function generateStaticParams() {
  try {
    const { data: products } = await supabase
      .from('thevillageproducts')
      .select('id, slug');

    if (!products) return [];

    // Generate params for both ID and slug routes
    return products.flatMap((product: { id: string; slug: string }) => [
      { id: product.id },
      { id: product.slug },
    ]);
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// metadata for SEO
export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} - The Village`,
    description: product.description || `Shop ${product.name} at The Village`,
    openGraph: {
      title: product.name,
      description: product.description || `Shop ${product.name} at The Village`,
      images: product.imageurl ? [product.imageurl] : [],
    },
  };
}