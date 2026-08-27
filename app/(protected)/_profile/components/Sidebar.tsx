"use client";

import Link from "next/link";
import { Home, ShoppingBag, Store, Truck, User, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/app/lib/user";
import { getCurrentProfileBase, joinProfilePath } from "@/app/lib/profileRoutes";

const navItems = [
  { label: "Home", subPath: "", icon: Home },
  { label: "Catalog", subPath: "products", icon: ShoppingBag },
  { label: "Brands", href: "/brands", icon: Store },
  { label: "Orders", subPath: "orders", icon: Truck },
  { label: "Profile", subPath: "profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useUser();
  const profileBase = getCurrentProfileBase(pathname, user);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-white/10 bg-black px-5 py-6 text-white lg:block">
      <Link href={profileBase} className="block text-2xl font-black">
        The Village
      </Link>

      <p className="mt-1 text-xs text-white/40">Marketplace dashboard</p>

      <nav className="mt-10 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const href = item.href || joinProfilePath(profileBase, item.subPath);
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
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
