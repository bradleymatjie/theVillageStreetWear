export default function OrderDetailsSkeleton() {
  return (
    <div className="animate-pulse bg-white text-black dark:bg-black dark:text-white">
      <div className="mx-auto mb-6 h-1.5 w-20 rounded-full bg-black/10 dark:bg-white/10 md:hidden" />

      <div className="mx-auto h-6 w-36 rounded-full bg-black/10 dark:bg-white/10" />

      <div className="mt-8 h-8 w-4/5 rounded-xl bg-black/10 dark:bg-white/10" />

      <div className="mt-5 rounded-3xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-950">
        <div className="h-3 w-28 rounded-full bg-black/10 dark:bg-white/10" />
        <div className="mt-3 h-7 w-32 rounded-xl bg-black/10 dark:bg-white/10" />

        <div className="mt-6 h-3 w-32 rounded-full bg-black/10 dark:bg-white/10" />
        <div className="mt-3 h-7 w-24 rounded-xl bg-black/10 dark:bg-white/10" />
      </div>

      <div className="mt-6 space-y-4">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-950"
          >
            <div className="flex gap-4">
              <div className="h-24 w-24 shrink-0 rounded-2xl bg-black/10 dark:bg-white/10" />

              <div className="flex-1">
                <div className="h-6 w-3/4 rounded-xl bg-black/10 dark:bg-white/10" />

                <div className="mt-4 h-4 w-20 rounded-full bg-black/10 dark:bg-white/10" />
                <div className="mt-2 h-4 w-28 rounded-full bg-black/10 dark:bg-white/10" />

                <div className="mt-4 h-5 w-24 rounded-xl bg-black/10 dark:bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}