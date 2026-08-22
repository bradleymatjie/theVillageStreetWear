import { supabase } from '@/lib/supabaseClient';
import ProductFilters from './components/ProductFilters';
import { Product } from '@/app/lib/types';
import { BadgeCheck, PackageCheck, Store, Truck } from 'lucide-react';
export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const { data, error } = await supabase
    .from('thevillageproducts')
    .select('*')
    .order('created_at', { ascending: false });

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
    <div className="min-h-screen bg-black text-white">
      <section className="border-b border-white/10 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-4 inline-flex border border-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-white/45">
                Marketplace
              </p>
              <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-5xl">
                Discover drops from independent streetwear brands.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                Browse local labels, compare new pieces, and check out with the
                same order flow across every brand on The Village.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Store, label: 'Brand-led drops' },
                { icon: BadgeCheck, label: 'Curated catalog' },
                { icon: PackageCheck, label: 'Order updates' },
                { icon: Truck, label: 'SA delivery' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="border border-white/10 bg-white/5 p-3">
                  <Icon className="mb-3 h-5 w-5 text-white/70" />
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/60">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductFilters data={data as Product[] | null} />
      </div>
    </div>
  );
}
