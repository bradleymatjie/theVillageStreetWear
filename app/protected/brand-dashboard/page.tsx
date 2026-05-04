"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Package, Plus, ShoppingCart, BarChart3 } from "lucide-react";

export default function BrandDashboardPage() {
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.href = "/login";
};

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const role = user.user_metadata?.role;

      if (role !== "brand") {
        window.location.href = "/protected/profile";
        return;
      }

      setBrandName(user.user_metadata?.brand_name || "Your Brand");
      setLoading(false);
    }

    getUser();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-start justify-between">
  <div>
    <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/40">
      Brand Dashboard
    </p>
    <h1 className="mt-2 text-4xl font-black">
      Welcome, {brandName}
    </h1>
    <p className="mt-2 text-sm text-white/50">
      Manage your products, orders, and brand presence on The Village.
    </p>
  </div>

  <button
    onClick={handleLogout}
    className="rounded-full border border-white/20 px-5 py-2 text-sm font-bold text-white hover:bg-white hover:text-black transition"
  >
    Logout
  </button>
</div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            icon={Package}
            title="Products"
            value="0"
            text="Products listed"
          />
          <DashboardCard
            icon={ShoppingCart}
            title="Orders"
            value="0"
            text="Orders received"
          />
          <DashboardCard
            icon={BarChart3}
            title="Sales"
            value="R0"
            text="Total earnings"
          />
          <Link
            href="/protected/brand-dashboard/products"
            className="rounded-3xl bg-white p-6 text-black transition hover:bg-white/80"
          >
            <Plus className="mb-5 h-7 w-7" />
            <h2 className="text-xl font-black">Add Product</h2>
            <p className="mt-2 text-sm text-black/60">
              Upload your first item.
            </p>
          </Link>
        </div>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">Your Products</h2>
              <p className="mt-1 text-sm text-white/50">
                Products you upload will appear here.
              </p>
            </div>

            <Link
              href="/protected/brand-dashboard/products/new"
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-black"
            >
              Add Product
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-8 text-center">
            <p className="font-bold">No products yet</p>
            <p className="mt-2 text-sm text-white/50">
              Start by adding your first product to the marketplace.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  icon: Icon,
  title,
  value,
  text,
}: {
  icon: any;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <Icon className="mb-5 h-7 w-7 text-white/60" />
      <p className="text-sm font-bold text-white/40">{title}</p>
      <h2 className="mt-2 text-3xl font-black">{value}</h2>
      <p className="mt-1 text-sm text-white/50">{text}</p>
    </div>
  );
}