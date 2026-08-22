// app/products/[id]/page.tsx (Server Component)
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from '@/app/lib/utils';
import ProductPageClient from './clientComponent';
import { Product } from '@/app/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { Suspense } from 'react';
import { absoluteUrl, siteConfig } from '@/app/lib/seo';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

function getProductPath(product: Product) {
  return `/products/${product.slug || product.id}`;
}

function getNumericPrice(price: string) {
  const amount = Number(String(price).replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) ? amount : undefined;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;


  const product: Product | null = await getProduct(id);

  if (!product) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `Shop ${product.name} on ${siteConfig.name}.`,
    image: [product.imageurl, ...(product.images || [])].filter(Boolean),
    brand: {
      "@type": "Brand",
      name: product.brand_name || siteConfig.name,
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(getProductPath(product)),
      priceCurrency: "ZAR",
      price: getNumericPrice(product.price),
      availability: product.soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (<Suspense fallback="loading...">
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <ProductPageClient product={product} />
  </Suspense>)
}

export async function generateStaticParams() {
  try {
    const { data: products } = await supabase
      .from('thevillageproducts')
      .select('id');

    if (!products) return [];

    // Generate params for both ID and slug routes
    return products.flatMap((product: { id: string; }) => [
      { id: product.id },
    ]);
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const title = `${product.name}${product.brand_name ? ` by ${product.brand_name}` : ""}`;
  const description =
    product.description ||
    `Shop ${product.name}${product.brand_name ? ` by ${product.brand_name}` : ""} on The Village.`;
  const productPath = getProductPath(product);

  return {
    title,
    description,
    alternates: {
      canonical: productPath,
    },
    openGraph: {
      title,
      description,
      url: productPath,
      images: product.imageurl ? [product.imageurl] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.imageurl ? [product.imageurl] : [],
    },
  };
}
