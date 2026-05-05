import Link from "next/link";
import {
  Package,
  ShoppingCart,
  BarChart3,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  {
    href: "/protected/brand-dashboard",
    label: "Home",
    icon: LayoutDashboard,
  },
  {
    href: "/protected/brand-dashboard/products",
    label: "Products",
    icon: Package,
  },
  {
    href: "/protected/brand-dashboard/orders",
    label: "Orders",
    icon: ShoppingCart,
  },
  {
    href: "/protected/brand-dashboard/analytics",
    label: "Sales",
    icon: BarChart3,
  },
];

export default function BrandDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-72 border-r border-white/10 bg-white/[0.03] p-6 lg:block">
          <Link href="/" className="text-xl font-black">
            The Village
          </Link>

          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/40">
            Brand Portal
          </p>

          <nav className="mt-10 space-y-2">
            {navItems.map((item) => (
              <DesktopNavLink key={item.href} {...item} />
            ))}
          </nav>
        </aside>

        {/* Page Content */}
        <section className="flex-1 pb-24 lg:pb-0">
          <div className="px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </section>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/95 px-2 py-2 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => (
            <MobileNavLink key={item.href} {...item} />
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
}: {
  href: string;
  label: string;
  icon: any;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
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
}: {
  href: string;
  label: string;
  icon: any;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
    >
      <Icon className="mb-1 h-5 w-5" />
      {label}
    </Link>
  );
}