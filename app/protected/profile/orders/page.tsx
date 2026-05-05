"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Eye, PackageCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

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
      pending: "bg-yellow-100 text-yellow-700",
      pending_payment: "bg-yellow-100 text-yellow-700",
      paid: "bg-blue-100 text-blue-700",
      processing: "bg-blue-100 text-blue-700",
      preparing: "bg-purple-100 text-purple-700",
      shipping: "bg-indigo-100 text-indigo-700",
      out_for_delivery: "bg-orange-100 text-orange-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      refunded: "bg-gray-100 text-gray-700",
      failed: "bg-red-100 text-red-700",
    };

    return classes[status] || "bg-gray-100 text-gray-700";
  };

  const formatMoney = (value: any) => `R${Number(value || 0).toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <Link
        href="/protected/profile"
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
                      <Image
                        src={firstItem.image_url}
                        alt={firstItem.name}
                        fill
                        className="object-cover"
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
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        Payment: {paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-2 text-white"
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
        <DrawerContent className="max-h-[90vh] p-0 md:hidden">
          <div className="max-h-[85vh] overflow-y-auto px-5 pb-6">
            {selectedOrder && <OrderDetails order={selectedOrder} />}
          </div>
        </DrawerContent>
      </Drawer>

      <Sheet
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <SheetContent className="hidden h-auto max-h-screen w-[460px] overflow-hidden bg-white text-black dark:bg-black dark:text-white md:block">
          <div className="max-h-screen overflow-y-auto p-6">
            {selectedOrder && <OrderDetails order={selectedOrder} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

