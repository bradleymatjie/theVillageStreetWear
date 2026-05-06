import { Skeleton } from "@/components/ui/skeleton";

export default function BrandShowcaseSkeleton() {
  return (
    <section className="space-y-4">
      <div>
        <Skeleton className="h-6 w-44 bg-white/10" />
        <Skeleton className="mt-2 h-4 w-64 bg-white/10" />
      </div>

      <div className="flex gap-3 overflow-hidden pb-2">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton
            key={item}
            className="h-11 w-24 shrink-0 rounded-2xl bg-white/10"
          />
        ))}
      </div>

      <div className="flex gap-4 overflow-hidden pb-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="w-[160px] shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5"
          >
            <Skeleton className="aspect-[4/5] w-full bg-white/10" />

            <div className="space-y-2 p-3">
              <Skeleton className="h-3 w-full bg-white/10" />
              <Skeleton className="h-3 w-3/4 bg-white/10" />
              <Skeleton className="mt-3 h-4 w-14 bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}