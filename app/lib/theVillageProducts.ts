import { createClient } from "@/lib/supebase/client";
import { Product, ProductInput } from "./types";




// Get all products
export async function getAllProducts(): Promise<Product[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data || [];
}

// Get products by category
export async function getProductsByCategory(category: string = 'ALL'): Promise<Product[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (category !== 'ALL') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }

  return data || [];
}

// Get single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

// Get single product by slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }

  return data;
}

// Create new product
export async function createProduct(product: ProductInput): Promise<Product | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .insert([{
      ...product,
      available_sizes: product.available_sizes || ['S', 'M', 'L'],
      available_materials: product.available_materials || ['100% Cotton'],
      stock: product.stock || 0,
      sold_out: product.sold_out || false
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data;
}

// Update product
export async function updateProduct(id: string, updates: Partial<ProductInput>): Promise<Product | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return data;
}

// Delete product
export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }

  return true;
}

// Search products
export async function searchProducts(searchTerm: string): Promise<Product[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching products:', error);
    throw error;
  }

  return data || [];
}

// Get low stock products (stock < threshold)
export async function getLowStockProducts(threshold: number = 10): Promise<Product[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .lt('stock', threshold)
    .order('stock', { ascending: true });

  if (error) {
    console.error('Error fetching low stock products:', error);
    throw error;
  }

  return data || [];
}

// Update product stock
export async function updateProductStock(id: string, newStock: number): Promise<Product | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .update({
      stock: newStock,
      sold_out: newStock === 0,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }

  return data;
}

// Get products count
export async function getProductsCount(): Promise<number> {
  const supabase = createClient();
  
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error getting products count:', error);
    return 0;
  }

  return count || 0;
}

// Get total inventory value
export async function getTotalInventoryValue(): Promise<number> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('price, stock');

  if (error) {
    console.error('Error calculating inventory value:', error);
    return 0;
  }

  const total = data?.reduce((sum, product) => {
    return sum + (product.price * product.stock);
  }, 0) || 0;

  return total;
}