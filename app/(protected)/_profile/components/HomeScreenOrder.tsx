"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/app/lib/user";
import { getCurrentProfileBase, joinProfilePath } from "@/app/lib/profileRoutes";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Order = {
  id: string;
  order_id: string;
  created_at: string;
  total: number;
  status: string;
  payment_status: string;
  order_items: {
    name: string;
    image_url?: string;
  }[];
};

const timelineSteps = [
  { key: "paid", label: "Paid" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export default function HomeScreenOrder() {
  const pathname = usePathname();
  const { user } = useUser();
  const profileBase = getCurrentProfileBase(pathname, user);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestOrder() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const response = await fetch("/api/my-orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ customer_id: user.id, email: user.email }),
        });
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) return;

        const latest = [...data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0];
        setOrder(latest);
      } catch (error) {
        console.error("Could not load latest order", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLatestOrder();
  }, []);

  const currentStepIndex = useMemo(() => {
    if (!order || order.status.toLowerCase() === "cancelled") return -1;
    const status = order.status.toLowerCase();
    const directIndex = timelineSteps.findIndex((step) => step.key === status);
    if (directIndex >= 0) return directIndex;
    return order.payment_status?.toLowerCase() === "paid" ? 0 : -1;
  }, [order]);

  const firstItem = order?.order_items?.[0];
  const ordersHref = joinProfilePath(profileBase, "orders");

  return (
    <section className="rounded-2xl border border-black/10 bg-black/[0.025] p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black sm:text-2xl">Your latest order</h2>
          <span className="hidden h-px w-10 bg-black/30 dark:bg-white/30 sm:block" />
        </div>
        <Link href={ordersHref} className="text-xs font-bold underline underline-offset-4 sm:text-sm">View all</Link>
      </div>

      {loading ? (
        <div className="mt-5 flex min-h-32 items-center justify-center gap-2 text-sm text-black/50 dark:text-white/50">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading order...
        </div>
      ) : !order ? (
        <div className="mt-5 rounded-xl border border-dashed border-black/15 p-6 text-center dark:border-white/15">
          <p className="font-bold">No orders yet</p>
          <Link href="/products" className="mt-3 inline-flex items-center gap-2 text-sm font-bold underline">
            Shop new drops <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-[300px_1fr_auto] lg:items-center">
          <div className="flex min-w-0 items-center gap-4">
            {firstItem?.image_url ? (
              <img src={firstItem.image_url} alt={firstItem.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="h-20 w-20 shrink-0 rounded-xl bg-black/10 dark:bg-white/10" />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{firstItem?.name || "Order"}</p>
              <p className="mt-1 truncate text-xs text-black/50 dark:text-white/50">{order.order_id}</p>
              <p className="mt-2 font-black">R{Number(order.total).toFixed(2)}</p>
            </div>
          </div>

          {order.status.toLowerCase() === "cancelled" ? (
            <div className="rounded-xl bg-red-500/10 p-4 text-sm font-bold text-red-500">This order was cancelled.</div>
          ) : (
            <div className="grid grid-cols-4">
              {timelineSteps.map((step, index) => {
                const complete = index < currentStepIndex;
                const current = index === currentStepIndex;
                const active = complete || current;
                return (
                  <div key={step.key} className="relative text-center">
                    {index > 0 && <span className={`absolute right-1/2 top-3 h-px w-full ${index <= currentStepIndex ? "bg-black dark:bg-white" : "bg-black/15 dark:bg-white/20"}`} />}
                    <span className={`relative z-10 mx-auto flex h-6 w-6 items-center justify-center rounded-full border-2 ${active ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-black/20 bg-white dark:border-white/25 dark:bg-black"}`}>
                      {complete && <Check className="h-3.5 w-3.5" />}
                      {current && <span className="h-2 w-2 rounded-full bg-white dark:bg-black" />}
                    </span>
                    <p className={`mt-2 text-[10px] font-bold sm:text-xs ${active ? "text-black dark:text-white" : "text-black/40 dark:text-white/40"}`}>{step.label}</p>
                  </div>
                );
              })}
            </div>
          )}

          <Link href={ordersHref} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-black px-5 text-sm font-black text-white transition hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80">
            Track order <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
