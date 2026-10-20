"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  ShoppingCart,
  BarChart3,
  LayoutDashboard,
  Store,
  type LucideIcon,
} from "lucide-react";

const navItems = [
  {
    href: "/brand-dashboard",
    label: "Home",
    icon: LayoutDashboard,
  },
  {
    href: "/brand-dashboard/products",
    label: "Products",
    icon: Package,
  },
  {
    href: "/brand-dashboard/profile",
    label: "Profile",
    icon: Store,
  },
  {
    href: "/brand-dashboard/orders",
    label: "Orders",
    icon: ShoppingCart,
  },
  {
    href: "/brand-dashboard/sales",
    label: "Sales",
    icon: BarChart3,
  },
];

export default function BrandDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-theme-base text-theme-ink">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-72 border-r border-theme-ink/10 bg-theme-ink/[0.03] p-6 lg:block">
          <Link href="/" className="text-xl font-black">
            The Village
          </Link>

          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-theme-ink/40">
            Brand Portal
          </p>

          <nav className="mt-10 space-y-2">
            {navItems.map((item) => (
              <DesktopNavLink
                key={item.href}
                {...item}
                active={
                  pathname === item.href ||
                  (item.href !== "/brand-dashboard" &&
                    pathname.startsWith(`${item.href}/`))
                }
              />
            ))}
          </nav>
        </aside>

        {/* Page Content */}
        <section className="flex-1 pb-24 lg:pb-0">
          <div className="px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </section>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-theme-ink/10 bg-theme-base/95 px-2 py-2 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => (
            <MobileNavLink
              key={item.href}
              {...item}
              active={
                pathname === item.href ||
                (item.href !== "/brand-dashboard" &&
                  pathname.startsWith(`${item.href}/`))
              }
            />
          ))}
        </div>
      </nav>
    </main>
  );
}

function DesktopNavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
        active
          ? "bg-theme-ink text-theme-base"
          : "text-theme-ink/60 hover:bg-theme-ink/10 hover:text-theme-ink"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-bold transition ${
        active
          ? "text-theme-ink"
          : "text-theme-ink/60 hover:bg-theme-ink/10 hover:text-theme-ink"
      }`}
    >
      <Icon
        className={`mb-1 h-5 w-5 ${
          active ? "text-theme-ink" : "text-theme-ink/60"
        }`}
      />
      {label}
    </Link>
  );
}
