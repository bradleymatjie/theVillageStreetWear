"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Circle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type Order = {
  id: string;
  order_id: string;
  created_at: string;
  customer_name: string;
  email: string;
  total: number;
  status: OrderStatus;
  payment_status: string;
  shipping_method: string;
  shipping_address: string;
  pickup_location: string;
  order_items: {
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
    selected_size?: string;
    selected_material?: string;
  }[];
};

const timelineSteps = [
  { key: "pending", label: "Order placed" },
  { key: "paid", label: "Payment confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "On the way" },
  { key: "delivered", label: "Delivered" },
];

export default function HomeScreenOrder() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarliestOrder();
  }, []);

  async function fetchEarliestOrder() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const res = await fetch("/api/my-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          customer_id: user.id,
          email: user.email,
        }),
      });

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setOrder(null);
        return;
      }

      const earliestOrder = [...data].sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      )[0];

      setOrder(earliestOrder);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const currentStepIndex = useMemo(() => {
    if (!order || order.status === "cancelled") return -1;

    return timelineSteps.findIndex(
      (step) => step.key === String(order.status).toLowerCase()
    );
  }, [order]);

  const firstItem = order?.order_items?.[0];

  return (
    <div className="mt-5 rounded-2xl border border-black/10 bg-black/5 p-4 transition-colors dark:border-white/10 dark:bg-white/5 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-black sm:text-lg">Your Orders</h2>

        <Link
          href="/protected/profile/orders"
          className="shrink-0 text-xs text-black/60 underline dark:text-white/60"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-black/5 p-4 text-sm text-black/50 dark:bg-white/5 dark:text-white/50">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading order...
        </div>
      ) : !order ? (
        <div className="mt-4 rounded-xl bg-black/5 p-4 text-sm text-black/60 dark:bg-white/5 dark:text-white/60">
          You don’t have any orders yet.
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-black/10 bg-white/60 p-4 transition-colors dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {firstItem?.image_url ? (
              <img
                src={firstItem.image_url}
                alt={firstItem.name}
                className="h-24 w-24 rounded-2xl object-cover sm:h-20 sm:w-20"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-black/10 text-xs text-black/50 dark:bg-white/10 dark:text-white/50 sm:h-20 sm:w-20">
                No image
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black sm:text-base">
                    {order.order_id}
                  </p>

                  <p className="mt-1 line-clamp-2 text-sm text-black/60 dark:text-white/60">
                    {firstItem?.name || "Order"}
                  </p>

                  <p className="mt-2 text-sm font-bold sm:text-base">
                    R{Number(order.total).toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-[11px] font-bold capitalize text-blue-600 dark:text-blue-400 sm:text-xs">
                    {order.status}
                  </span>

                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold capitalize text-emerald-600 dark:text-emerald-400 sm:text-xs">
                    Payment: {order.payment_status}
                  </span>
                </div>
              </div>

              {order.status === "cancelled" ? (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:text-red-400">
                  This order was cancelled.
                </div>
              ) : (
                <div className="mt-6 rounded-2xl bg-black/5 p-4 dark:bg-white/5">
                  <p className="mb-4 text-xs font-bold uppercase tracking-wide text-black/50 dark:text-white/50">
                    Order progress
                  </p>

                  <div className="space-y-0">
                    {timelineSteps.map((step, index) => {
                      const isCompleted = index < currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      const isActive = isCompleted || isCurrent;

                      return (
                        <div
                          key={step.key}
                          className="relative flex gap-3 pb-5 last:pb-0"
                        >
                          {index !== timelineSteps.length - 1 && (
                            <div
                              className={`absolute left-[11px] top-7 h-full w-[2px] ${
                                index < currentStepIndex
                                  ? "bg-emerald-500"
                                  : "bg-black/10 dark:bg-white/10"
                              }`}
                            />
                          )}

                          <div
                            className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                              isActive
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-black/20 bg-white text-black/40 dark:border-white/20 dark:bg-neutral-950 dark:text-white/40"
                            }`}
                          >
                            {isActive ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Circle className="h-3 w-3" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`text-sm font-bold ${
                                isCurrent
                                  ? "text-black dark:text-white"
                                  : isCompleted
                                    ? "text-black/80 dark:text-white/80"
                                    : "text-black/40 dark:text-white/40"
                              }`}
                            >
                              {step.label}
                            </p>

                            {isCurrent && (
                              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                                Current status
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}