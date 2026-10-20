"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart2,
  Store,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/app/lib/user";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: Home, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  {
    icon: Store,
    label: "Applications",
    href: "/admin/brand-applications",
  },
  { icon: Users, label: "Customers", href: "/admin/customers" },
  { icon: BarChart2, label: "Analytics", href: "/admin/analytics" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const {signOut } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    signOut();
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-theme-base text-theme-ink">
      <aside className="fixed left-0 top-0 flex h-full w-64 flex-col border-r border-theme-ink/10 p-6">
        <h1 className="mb-10 text-2xl font-extrabold uppercase tracking-wide">
          The Village
        </h1>

        <nav className="space-y-2 text-sm flex-1">
          {navItems.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex w-full items-center gap-3 rounded-md px-3 py-3 font-medium uppercase tracking-wide text-theme-ink transition hover:bg-theme-ink/10 hover:text-theme-success-ink"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium uppercase tracking-wide text-theme-error-ink transition hover:bg-red-500/10 hover:text-theme-error-ink"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="ml-64 flex-1 p-10">{children}</main>
    </div>
  );
}