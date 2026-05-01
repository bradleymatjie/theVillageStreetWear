"use client";

import Link from "next/link";
import { PackageCheck, Truck, Clock, ArrowLeft } from "lucide-react";

const orders = [];

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mb-6">
        <Link
          href="/protected/profile"
          className="mb-4 inline-flex items-center gap-2 text-sm text-white/60"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="text-3xl font-black">My Orders</h1>
        <p className="mt-1 text-sm text-white/60">
          Track your purchases and delivery progress.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <PackageCheck className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-xl font-black">No orders yet</h2>
          <p className="mt-2 text-sm text-white/60">
            Once you place an order, it will appear here.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex w-full justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-black"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* later we map real orders here */}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <Clock className="mb-3 h-5 w-5 text-white/70" />
          <p className="text-sm font-black">Pending</p>
          <p className="text-xs text-white/50">Awaiting confirmation</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <Truck className="mb-3 h-5 w-5 text-white/70" />
          <p className="text-sm font-black">Delivery</p>
          <p className="text-xs text-white/50">Track active orders</p>
        </div>
      </div>
    </div>
  );
}