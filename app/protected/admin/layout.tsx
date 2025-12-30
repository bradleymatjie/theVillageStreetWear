'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart2,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: Home, label: "Dashboard", href: "/protected/admin" },
  { icon: Package, label: "Products", href: "/protected/admin/products" },
  { icon: ShoppingCart, label: "Orders", href: "/protected/admin/orders" },
  { icon: Users, label: "Customers", href: "/protected/admin/customers" },
  { icon: BarChart2, label: "Analytics", href: "/protected/admin/analytics" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-[#1A1A1A] p-6 fixed top-0 left-0 h-full flex flex-col">
        <h1 className="text-2xl font-extrabold uppercase tracking-wide mb-10">
          The Village
        </h1>

        <nav className="space-y-2 text-sm">
          {navItems.map(({ icon: Icon, label, href }) => (
            <Link key={href} href={href}>
              <button
                className="w-full flex items-center gap-3 px-3 py-3 rounded-md uppercase tracking-wide font-medium
                  text-white hover:bg-[#111] hover:text-green-400 transition"
              >
                <Icon size={18} />
                {label}
              </button>
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-10">
        {children}
      </main>
    </div>
  );
}
