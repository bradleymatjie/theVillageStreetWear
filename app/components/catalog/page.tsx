import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
export const dynamic = 'force-dynamic';

export default async function Catalog() {
    const { data, error } = await supabase.from('thevillageproducts').select('*').order('created_at', { ascending: false }).limit(4);

    if (error) {
      return;
    }

  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 bg-black text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-black">LATEST DROPS</h2>
          <Link href="/products" className="flex items-center gap-2 text-xs sm:text-sm font-bold hover:underline">
            SEE MORE <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {data?.map((item) => (
            <Link key={item.slug} href={`/products/${item.id}`} className="group block">
              <div className={`relative overflow-hidden rounded-md border border-white/20 hover:border-white/50 transition-colors ${item.soldOut ? 'opacity-50' : ''}`}>
                <div className="aspect-square relative">
                  <img
                    src={item.imageurl}
                    alt={item.name}                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"                  />
                  {item.soldOut && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">SOLD OUT</span>
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-xs sm:text-sm mb-1">{item.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}