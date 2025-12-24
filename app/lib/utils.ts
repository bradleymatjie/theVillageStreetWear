import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/app/lib/types';

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('thevillageproducts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
};

// Alternative: Get product by slug (better for SEO)
export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('thevillageproducts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
};

// Get product by either ID or slug
export const getProduct = async (identifier: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('thevillageproducts')
      .select('*')
      .or(`id.eq.${identifier},slug.eq.${identifier}`)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
};