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
    <section className="bg-[var(--palette-surface-catalog)] px-4 py-10 text-black sm:px-6 sm:py-14 lg:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Shop the latest</p><h2 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">LATEST DROPS</h2></div>
          <Link href="/products" className="flex items-center gap-2 text-xs sm:text-sm font-bold hover:underline">
            SEE MORE <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {data?.map((item) => (
            <Link key={item.slug} href={`/products/${item.id}`} className="group block">
              <div className={`relative overflow-hidden rounded-lg border border-black/10 bg-white transition-all hover:-translate-y-1 hover:shadow-xl ${item.soldOut ? 'opacity-50' : ''}`}>
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
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-black/40">The Village</p>
                  <h3 className="mb-1 text-xs font-bold sm:text-sm">{item.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
