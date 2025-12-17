import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default async function Catalog() {
    const { data, error } = await supabase.from('thevillageproducts').select('*');

    if (error) {
      return;
    }

  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 bg-black text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-black">LATEST DESIGNS</h2>
          <Link href="/products" className="flex items-center gap-2 text-xs sm:text-sm font-bold hover:underline">
            SEE MORE <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {data?.slice(0,4).map((item) => (
            <Link key={item.slug} href={`/products/${item.id}`} className="group block">
              <div className={`relative overflow-hidden rounded-md border border-white/20 hover:border-white/50 transition-colors ${item.soldOut ? 'opacity-50' : ''}`}>
                <div className="aspect-square relative">
                  <Image
                    src={item.imageurl}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFmMjkzNyIvPjwvc3ZnPg=="
                  />
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