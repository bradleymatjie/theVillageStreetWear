import { supabase } from '@/lib/supabaseClient';
import ProductFilters from './components/ProductFilters';
import { Product } from '@/app/lib/types';

export default async function CatalogPage() {
  const { data, error } = await supabase
    .from('thevillageproducts')
    .select('*');

  if (error) {
    console.error('Supabase error:', error);
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Error loading catalog</p>
          <p className="text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">Catalog</h1>
        <ProductFilters data={data as Product[] | null} />
      </div>
    </div>
  );
}