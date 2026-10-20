"use client";

import Link from "next/link";
import { Home, Search, Package, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUser } from "@/app/lib/user";
import { getCurrentProfileBase, joinProfilePath } from "@/app/lib/profileRoutes";

const navItems = [
  { label: "Home", subPath: "", icon: Home },
  { label: "Shop", href: "/products", icon: Search },
  { label: "Orders", subPath: "orders", icon: Package },
  { label: "Account", subPath: "profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const profileBase = getCurrentProfileBase(pathname, user);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const href = item.href || joinProfilePath(profileBase, item.subPath);
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 py-2 text-[11px] font-bold transition ${
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
