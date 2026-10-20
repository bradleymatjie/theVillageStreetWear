"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, PackageCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { usePathname } from "next/navigation";
import { useUser } from "@/app/lib/user";
import { getCurrentProfileBase } from "@/app/lib/profileRoutes";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { OrderDetails } from "./components/OrderDetails";
import OrderDetailsSkeleton from "./OderDetailsSkeleton";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const pathname = usePathname();
  const { user } = useUser();
  const profileBase = getCurrentProfileBase(pathname, user);

  useEffect(() => {
    async function fetchOrders() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

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

      if (!res.ok) {
        console.error("Orders error:", data);
        setLoading(false);
        return;
      }

      setOrders(data || []);
      setLoading(false);
    }

    fetchOrders();
  }, []);

  const getPaymentStatus = (order: any) => {
    const status = String(order.payment_status || "pending").toLowerCase();

    return ["paid", "completed", "success"].includes(status)
      ? "paid"
      : "pending";
  };

  const getOrderStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pending",
      pending_payment: "Pending payment",
      paid: "Received",
      processing: "Processing",
      preparing: "Preparing",
      shipping: "Shipping",
      out_for_delivery: "Out for delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      refunded: "Refunded",
      failed: "Failed",
    };

    return labels[status] || status;
  };

  const getOrderStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      pending: "bg-theme-warning-bg text-theme-warning-ink",
      pending_payment: "bg-theme-warning-bg text-theme-warning-ink",
      paid: "bg-theme-info-bg text-theme-info-ink",
      processing: "bg-theme-info-bg text-theme-info-ink",
      preparing: "bg-theme-purple-bg text-theme-purple-ink",
      shipping: "bg-theme-purple-bg text-theme-purple-ink",
      out_for_delivery: "bg-theme-warning-bg text-theme-warning-ink",
      delivered: "bg-theme-success-bg text-theme-success-ink",
      cancelled: "bg-theme-error-bg text-theme-error-ink",
      refunded: "bg-theme-soft text-theme-ink/85",
      failed: "bg-theme-error-bg text-theme-error-ink",
    };

    return classes[status] || "bg-theme-soft text-theme-ink/85";
  };

  const formatMoney = (value: any) => `R${Number(value || 0).toFixed(2)}`;

  if (loading) {
  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mb-4 h-5 w-20 animate-pulse rounded-full bg-theme-ink/10" />

      <div className="mb-6 h-10 w-48 animate-pulse rounded-2xl bg-theme-ink/10" />

      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-3xl border p-5 border-theme-ink/10"
          >
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 shrink-0 rounded-2xl bg-theme-ink/10" />

              <div className="flex-1">
                <div className="h-6 w-3/4 rounded-xl bg-theme-ink/10" />

                <div className="mt-3 h-4 w-32 rounded-full bg-theme-ink/10" />

                <div className="mt-4 h-5 w-24 rounded-xl bg-theme-ink/10" />

                <div className="mt-4 flex gap-2">
                  <div className="h-7 w-24 rounded-full bg-theme-ink/10" />
                </div>
              </div>
            </div>

            <div className="mt-5 h-11 w-full rounded-2xl bg-theme-ink/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen px-4 py-6">
      <Link
        href={profileBase}
        className="mb-4 flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <h1 className="mb-6 text-3xl font-black">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center">
          <PackageCheck className="mx-auto mb-3" />
          No orders yet
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const paymentStatus = getPaymentStatus(order);
            const orderStatus = String(order.status || "pending").toLowerCase();
            const firstItem = order.order_items?.[0];

            return (
              <div key={order.id} className="rounded-3xl border p-5">
                <div className="flex items-start gap-4">
                  {firstItem?.image_url && (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                      <img
                        src={firstItem.image_url}
                        alt={firstItem.name}                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 className="break-all font-black">{order.order_id}</h2>

                    <p className="text-sm opacity-60">{firstItem?.name}</p>

                    <p className="mt-2 text-sm">{formatMoney(order.total)}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getOrderStatusClass(
                          orderStatus
                        )}`}
                      >
                        {getOrderStatusLabel(orderStatus)}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          paymentStatus === "paid"
                            ? "bg-theme-success-bg text-theme-success-ink"
                            : "bg-theme-warning-bg text-theme-warning-ink"
                        }`}
                      >
                        Payment: {paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-theme-base py-2 text-theme-ink"
                >
                  <Eye size={16} />
                  View more
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Drawer
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DrawerContent className="max-h-[90vh] p-0 md:hidden z-[99999999]">
          <div className="max-h-[85vh] overflow-y-auto px-5 pb-6">
            {selectedOrder && <OrderDetails order={selectedOrder} />}
          </div>
        </DrawerContent>
      </Drawer>

      <Sheet
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <SheetContent className="hidden h-auto max-h-screen w-[460px] overflow-hidden bg-theme-base text-theme-ink md:block">
          <div className="max-h-screen overflow-y-auto p-6">
            {selectedOrder && <OrderDetails order={selectedOrder} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

