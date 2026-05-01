'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function CatalogLoading() {
  return (
    <div className="space-y-8 p-[40px] sm:p-[20px]">
      {/* Search + Sort Row Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Skeleton className="h-10 w-full sm:w-80 rounded-full" />

        <Skeleton className="h-10 w-full sm:w-[220px] rounded-full" />
      </div>

      {/* Category Pills Skeleton */}
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={i}
            className="h-9 w-24 rounded-full flex-shrink-0"
          />
        ))}
      </div>

      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="space-y-4"
          >
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}