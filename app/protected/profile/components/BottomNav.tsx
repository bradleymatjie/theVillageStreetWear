"use client";

import Link from "next/link";
import { Home, ShoppingBag, Truck, User } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/protected/profile", icon: Home },
  { label: "Catalog", href: "/protected/profile/products", icon: ShoppingBag },
  { label: "Orders", href: "/protected/profile/orders", icon: Truck },
  { label: "Profile", href: "/protected/profile/profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black lg:hidden">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2 text-xs font-bold transition ${
                isActive ? "text-white" : "text-white/40"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}