import Link from "next/link";

export default function HomeScreenOrder() {
  return (
    <div className="mt-5 rounded-2xl border border-black/10 bg-black/5 p-5 transition-colors dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">Your Orders</h2>

        <Link
          href="/protected/profile/orders"
          className="text-xs text-black/60 underline dark:text-white/60"
        >
          View all
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-black/5 p-3 transition-colors dark:bg-white/5">
          <div>
            <p className="text-sm font-bold">Zen Panda Tee</p>
            <p className="text-xs text-black/50 dark:text-white/50">
              Arriving tomorrow
            </p>
          </div>

          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-500 dark:text-emerald-400">
            On the way
          </span>
        </div>
      </div>
    </div>
  );
}