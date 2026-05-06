"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (!error) setOrder(data);

      setLoading(false);
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Confirming your order...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <CheckCircle className="mx-auto mb-5 h-16 w-16 text-green-400" />

        <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/40">
          Payment Complete
        </p>

        <h1 className="mt-3 text-4xl font-black">Order received</h1>

        <p className="mt-3 text-white/60">
          Thank you for your purchase. Your order has been created successfully.
        </p>

        {order && (
          <div className="mt-6 rounded-2xl bg-black/40 p-5 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Order ID</span>
              <span className="font-bold">{order.order_id}</span>
            </div>

            <div className="mt-3 flex justify-between">
              <span className="text-white/50">Status</span>
              <span className="font-bold capitalize">{order.status}</span>
            </div>

            <div className="mt-3 flex justify-between">
              <span className="text-white/50">Total</span>
              <span className="font-bold">R{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/protected/profile/orders`}
            className="flex-1 rounded-full bg-white px-6 py-3 text-sm font-black text-black"
          >
            Track Order
          </Link>

          <Link
            href="/protected/profile/products"
            className="flex-1 rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}