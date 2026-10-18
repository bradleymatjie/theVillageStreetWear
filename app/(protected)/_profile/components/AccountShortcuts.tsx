"use client";

import Link from "next/link";
import { Heart, MapPin, Package, User, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUser } from "@/app/lib/user";
import { getCurrentProfileBase, joinProfilePath } from "@/app/lib/profileRoutes";

export default function AccountShortcuts() {
  const pathname = usePathname();
  const { user } = useUser();
  const profileBase = getCurrentProfileBase(pathname, user);
  const shortcuts = [
    { label: "Orders", detail: "Track and view your orders", href: joinProfilePath(profileBase, "orders"), icon: Package },
    { label: "Saved items", detail: "Your wishlist", href: "/products", icon: Heart },
    { label: "Addresses", detail: "Manage delivery details", href: joinProfilePath(profileBase, "profile"), icon: MapPin },
    { label: "Profile", detail: "View and edit your profile", href: joinProfilePath(profileBase, "profile"), icon: User },
  ];

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xl font-black sm:text-2xl">Your account</h2>
        <span className="h-px w-10 bg-black/30 dark:bg-white/30" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {shortcuts.map(({ label, detail, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group flex min-h-28 items-center gap-3 rounded-2xl border border-black/10 bg-black/[0.025] p-4 transition hover:-translate-y-0.5 hover:bg-black/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] sm:min-h-24"
          >
            <Icon className="h-7 w-7 shrink-0" strokeWidth={1.7} />
            <div className="min-w-0 flex-1">
              <p className="font-black">{label}</p>
              <p className="mt-1 hidden text-xs text-black/50 dark:text-white/50 sm:block">{detail}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </section>
  );
}
