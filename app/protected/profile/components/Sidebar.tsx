"use client";

import Link from "next/link";
import { Home, ShoppingBag, Truck, User, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/app/lib/user";

const navItems = [
  { label: "Home", href: "/protected/profile", icon: Home },
  { label: "Catalog", href: "/protected/profile/products", icon: ShoppingBag },
  { label: "Orders", href: "/protected/profile/orders", icon: Truck },
  { label: "Profile", href: "/protected/profile/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearUser, signOut } = useUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-white/10 bg-black px-5 py-6 text-white lg:block">
      <Link href="/protected/profile" className="block text-2xl font-black">
        The Village
      </Link>

      <p className="mt-1 text-xs text-white/40">Marketplace dashboard</p>

      <nav className="mt-10 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                active
                  ? "bg-white text-black"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="absolute bottom-6 left-5 right-5 flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-white/70 transition hover:bg-red-600 hover:text-white"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>
    </aside>
  );
}