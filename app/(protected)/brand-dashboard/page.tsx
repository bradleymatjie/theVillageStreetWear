"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  X,
  Package,
  Plus,
  ShoppingCart,
  BarChart3,
  LogOut,
  Store,
  type LucideIcon,
} from "lucide-react";
import { useUser } from "@/app/lib/user";

type Product = {
  id: string;
  name: string;
  price: string;
  imageurl: string;
  soldout: boolean | null;
};

type BrandProfileStatus = {
  tagline?: string | null;
  story?: string | null;
  street_address?: string | null;
  location_city?: string | null;
  location_province?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
};

function hasUsefulProfileInfo(brand: BrandProfileStatus) {
  const hasIdentity = Boolean(brand.tagline || brand.story);
  const hasLocation = Boolean(
    brand.street_address && brand.location_city && brand.location_province
  );
  const hasSocials = Boolean(brand.instagram || brand.tiktok);
  const hasVisuals = Boolean(brand.logo_url || brand.cover_image_url);

  return hasIdentity && hasLocation && (hasSocials || hasVisuals);
}

function getProfilePromptKey(brandId: string) {
  return `brand-profile-prompt-dismissed:${brandId}`;
}

export default function BrandDashboardPage() {
  const [brandName, setBrandName] = useState("");
  const [productsCount, setProductsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [salesTotal, setSalesTotal] = useState(0);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [brandId, setBrandId] = useState("");
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [loading, setLoading] = useState(true);

  const {signOut } = useUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    signOut();
    window.location.href = "/login";
  };

  const dismissProfilePrompt = () => {
    if (brandId) {
      sessionStorage.setItem(getProfilePromptKey(brandId), "true");
    }

    setShowProfilePrompt(false);
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
        .select(
          "id, name, tagline, story, street_address, location_city, location_province, instagram, tiktok, logo_url, cover_image_url"
        )
        .eq("user_id", user.id)
        .single();

      if (!brand) {
        setBrandName(user.user_metadata?.brand_name || "Your Brand");
        setLoading(false);
        return;
      }

      setBrandName(brand.name);
      setBrandId(brand.id);

      const promptDismissed = sessionStorage.getItem(
        getProfilePromptKey(brand.id)
      );
      setShowProfilePrompt(!promptDismissed && !hasUsefulProfileInfo(brand));

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
      {showProfilePrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/35">
                  Brand profile
                </p>
                <h2 className="mt-3 text-3xl font-black leading-tight">
                  Help customers trust your brand
                </h2>
              </div>

              <button
                type="button"
                onClick={dismissProfilePrompt}
                className="rounded-full border border-white/10 p-2 text-white/50 transition hover:bg-white hover:text-black"
                aria-label="Close profile reminder"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-white/60">
              Your profile is what buyers see before they decide to support you.
              Add your story, logo, location, address, and socials so customers
              know who they are buying from and whether pickup is available.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-white/65 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="font-black text-white">Build trust</p>
                <p className="mt-1">Tell people what your brand stands for.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="font-black text-white">Enable pickup</p>
                <p className="mt-1">A complete address can unlock R0 pickup.</p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/brand-dashboard/profile"
                className="flex-1 rounded-full bg-white px-5 py-3 text-center text-sm font-black text-black"
              >
                Complete profile
              </Link>
              <button
                type="button"
                onClick={dismissProfilePrompt}
                className="flex-1 rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <DashboardCard
          href="/brand-dashboard/products"
          icon={Package}
          title="Products"
          value={String(productsCount)}
          text="Products listed"
        />

        <DashboardCard
          href="/brand-dashboard/orders"
          icon={ShoppingCart}
          title="Orders"
          value={String(ordersCount)}
          text="Paid orders received"
        />

        <DashboardCard
          href="/brand-dashboard/sales"
          icon={BarChart3}
          title="Sales"
          value={`R${salesTotal.toFixed(2)}`}
          text="Delivered paid sales"
        />

        <DashboardCard
          href="/brand-dashboard/profile"
          icon={Store}
          title="Profile"
          value="Edit"
          text="Story, location, socials"
        />

        <Link
          href="/brand-dashboard/products"
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
            href="/brand-dashboard/products"
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
                href="/brand-dashboard/products"
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
  icon: LucideIcon;
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
