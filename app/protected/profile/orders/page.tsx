"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Eye, PackageCheck, Truck } from "lucide-react";
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
        body: JSON.stringify({
          customer_id: user.id,
          email: user.email,
        }),
      });

      const data = await res.json();
      console.log("my orders: ", data)
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
    const status = String(
      order.payment_status || order.status || "pending"
    ).toLowerCase();

    return ["paid", "completed", "success"].includes(status)
      ? "paid"
      : "pending";
  };

  const formatMoney = (value: any) =>
    `R${Number(value || 0).toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <Link href="/protected/profile" className="flex items-center gap-2 text-sm mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <h1 className="text-3xl font-black mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center">
          <PackageCheck className="mx-auto mb-3" />
          No orders yet
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const paymentStatus = getPaymentStatus(order);
            const firstItem = order.order_items?.[0];

            return (
              <div
                key={order.id}
                className="rounded-3xl border p-5"
              >
                <div className="flex items-start gap-4">
                  {/* IMAGE */}
                  {firstItem?.image_url && (
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl">
                      <Image
                        src={firstItem.image_url}
                        alt={firstItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* INFO */}
                  <div className="flex-1">
                    <h2 className="font-black">
                      {order.order_id}
                    </h2>

                    <p className="text-sm opacity-60">
                      {firstItem?.name}
                    </p>

                    <p className="text-sm mt-2">
                      {formatMoney(order.total)}
                    </p>
                  </div>

                  {/* STATUS */}
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {paymentStatus}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="mt-4 w-full bg-black text-white py-2 rounded-xl flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View more
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* MOBILE DRAWER */}
      <Drawer
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DrawerContent className="max-h-[90vh] p-0 md:hidden">
          <div className="max-h-[85vh] overflow-y-auto px-5 pb-6">
            {selectedOrder && (
              <OrderDetails order={selectedOrder} />
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* DESKTOP SHEET */}
      <Sheet
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <SheetContent className="hidden h-auto max-h-screen w-[460px] overflow-hidden md:block">
          <div className="max-h-screen overflow-y-auto p-6">
            {selectedOrder && (
              <OrderDetails order={selectedOrder} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function OrderDetails({ order }: { order: any }) {
  const items = order.order_items || [];

  return (
    <div>
      <DrawerHeader className="md:hidden px-0">
        <DrawerTitle>Order Details</DrawerTitle>
      </DrawerHeader>

      <SheetHeader className="hidden md:block px-0">
        <SheetTitle>Order Details</SheetTitle>
      </SheetHeader>

      <h2 className="text-xl font-black mt-4">
        {order.order_id}
      </h2>

      {/* ITEMS */}
      <div className="mt-6 space-y-4">
        {items.map((item: any, i: number) => (
          <div key={i} className="border rounded-2xl p-4">
            <div className="flex gap-4">
              {item.image_url && (
                <div className="relative h-20 w-20 rounded-xl overflow-hidden">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div>
                <p className="font-black">{item.name}</p>
                <p className="text-sm opacity-60">
                  Size: {item.selected_size}
                </p>
                <p className="text-sm opacity-60">
                  Material: {item.selected_material}
                </p>
                <p className="text-sm mt-1">
                  R{item.price} × {item.quantity}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}