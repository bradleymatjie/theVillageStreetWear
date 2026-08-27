"use client";

import Link from "next/link";
import { Home, ShoppingBag, Store, Truck, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUser } from "@/app/lib/user";
import { getCurrentProfileBase, joinProfilePath } from "@/app/lib/profileRoutes";

const navItems = [
  { label: "Home", subPath: "", icon: Home },
  { label: "Catalog", subPath: "products", icon: ShoppingBag },
  { label: "Brands", href: "/brands", icon: Store },
  { label: "Orders", subPath: "orders", icon: Truck },
  { label: "Profile", subPath: "profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const profileBase = getCurrentProfileBase(pathname, user);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black lg:hidden">
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const href = item.href || joinProfilePath(profileBase, item.subPath);
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
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
