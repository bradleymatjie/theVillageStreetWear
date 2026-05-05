"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  Package,
  Plus,
  ShoppingCart,
  BarChart3,
  LogOut,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: string;
  imageurl: string;
  soldout: boolean | null;
};

export default function BrandDashboardPage() {
  const [brandName, setBrandName] = useState("");
  const [productsCount, setProductsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [salesTotal, setSalesTotal] = useState(0);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      if (user.user_metadata?.role !== "brand") {
        window.location.href = "/protected/profile";
        return;
      }

      const { data: brand } = await supabase
        .from("brands")
        .select("id, name")
        .eq("user_id", user.id)
        .single();

      if (!brand) {
        setBrandName(user.user_metadata?.brand_name || "Your Brand");
        setLoading(false);
        return;
      }

      setBrandName(brand.name);

      const { count: productCount } = await supabase
        .from("thevillageproducts")
        .select("*", { count: "exact", head: true })
        .eq("brand_id", brand.id);

      const { count: paidOrderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("brand_id", brand.id)
        .or("payment_status.eq.paid,status.eq.paid");

      const { data: deliveredPaidOrders } = await supabase
        .from("orders")
        .select("total")
        .eq("brand_id", brand.id)
        .eq("payment_status", "paid")
        .eq("status", "delivered");

      const { data: products } = await supabase
        .from("thevillageproducts")
        .select("id, name, price, imageurl, soldout")
        .eq("brand_id", brand.id)
        .order("created_at", { ascending: false })
        .limit(4);

      const totalSales =
        deliveredPaidOrders?.reduce((sum, order) => {
          return sum + Number(order.total || 0);
        }, 0) || 0;

      setProductsCount(productCount || 0);
      setOrdersCount(paidOrderCount || 0);
      setSalesTotal(totalSales);
      setRecentProducts((products || []) as Product[]);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/40">
            Brand Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Welcome, {brandName}
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Manage your products, orders, and brand presence on The Village.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm font-bold text-white transition hover:bg-white hover:text-black"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          href="/protected/brand-dashboard/products"
          icon={Package}
          title="Products"
          value={String(productsCount)}
          text="Products listed"
        />

        <DashboardCard
          href="/protected/brand-dashboard/orders"
          icon={ShoppingCart}
          title="Orders"
          value={String(ordersCount)}
          text="Paid orders received"
        />

        <DashboardCard
          href="/protected/brand-dashboard/sales"
          icon={BarChart3}
          title="Sales"
          value={`R${salesTotal.toFixed(2)}`}
          text="Delivered paid sales"
        />

        <Link
          href="/protected/brand-dashboard/products"
          className="rounded-3xl bg-white p-6 text-black transition hover:bg-white/80"
        >
          <Plus className="mb-5 h-7 w-7" />
          <h2 className="text-xl font-black">Add Product</h2>
          <p className="mt-2 text-sm text-black/60">
            Upload a new marketplace item.
          </p>
        </Link>
      </div>

      <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black">Your Products</h2>
            <p className="mt-1 text-sm text-white/50">
              Your latest listed products.
            </p>
          </div>

          <Link
            href="/protected/brand-dashboard/products/new"
            className="rounded-full bg-white px-5 py-3 text-center text-sm font-black text-black"
          >
            Add Product
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-8 text-center">
            <p className="font-bold">No products yet</p>
            <p className="mt-2 text-sm text-white/50">
              Start by adding your first product to the marketplace.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentProducts.map((product) => (
              <Link
                key={product.id}
                href="/protected/brand-dashboard/products"
                className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 transition hover:bg-white/10"
              >
                <img
                  src={product.imageurl}
                  alt={product.name}
                  className="h-40 w-full object-cover"
                />

                <div className="p-4">
                  <p className="line-clamp-1 font-bold">{product.name}</p>
                  <p className="mt-1 text-sm text-white/50">
                    R{product.price}
                  </p>

                  {product.soldout && (
                    <p className="mt-2 text-xs font-bold text-red-400">
                      Sold out
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DashboardCard({
  href,
  icon: Icon,
  title,
  value,
  text,
}: {
  href: string;
  icon: any;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
    >
      <Icon className="mb-5 h-7 w-7 text-white/60" />
      <p className="text-sm font-bold text-white/40">{title}</p>
      <h2 className="mt-2 text-3xl font-black">{value}</h2>
      <p className="mt-1 text-sm text-white/50">{text}</p>
    </Link>
  );
}