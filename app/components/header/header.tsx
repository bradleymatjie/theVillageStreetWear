"use client";

import { useState, useSyncExternalStore } from "react";
import { Home, Menu, Search, ShoppingBag, ShoppingCart, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/app/lib/user";
import { useCartStore } from "@/app/lib/cartStore";
import CartSidebar from "./CartSidebar";
import { usePathname } from "next/navigation";
import DesignHeader from "@/app/studio/components/Designheader";
import { getUserProfileBase } from "@/app/lib/profileRoutes";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const cartItemCount = useCartStore((state) => state.getTotalItems());

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "";
  const isLoggedIn = !!user;
  const profileHref = isLoggedIn ? getUserProfileBase(user) : "/login";
  const homeHref = isLoggedIn ? getUserProfileBase(user) : "/";

  if (pathname.includes("admin") || pathname.includes("protected")) return null;

  if (pathname.includes("/studio")) return <DesignHeader />;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 text-black backdrop-blur-xl lg:border-white/10 lg:bg-[var(--palette-surface-header)]/95 lg:text-white">
        <div className="mx-auto flex h-[68px] max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:h-[82px] lg:px-8">
          <Link
            href="/"
            className="relative block h-9 w-36 shrink-0 sm:w-44 lg:h-11 lg:w-52"
            aria-label="The Village home"
          >
            <Image
              src="/brand/logo-horizontal-light.png"
              alt="The Village"
              fill
              priority
              sizes="(min-width: 640px) 192px, 160px"
              className="object-contain object-left lg:hidden"
            />
            <Image
              src="/brand/logo-horizontal-dark.png"
              alt="The Village"
              fill
              priority
              sizes="(min-width: 640px) 192px, 160px"
              className="hidden object-contain object-left lg:block"
            />
          </Link>

          <nav className="hidden items-center gap-5 lg:flex">
            {[["HOME", "/"], ["SHOP", "/products"], ["DISCOVER", "/brands"], ["SELL", "/sell"]].map(([label, href], index) => (
              <div key={href} className="flex items-center gap-5">
                <Link href={href} className="text-[11px] font-bold tracking-[0.14em] text-white/75 transition hover:text-white">
                  {label}
                </Link>
                {index < 3 && <span className="text-xs text-white/35">/</span>}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href={profileHref}
                className="hidden text-[11px] font-bold uppercase tracking-[0.14em] text-white/75 hover:text-white lg:block"
              >
                Hi, {firstName || "Dashboard"}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden text-[11px] font-bold uppercase tracking-[0.14em] text-white/75 hover:text-white lg:block"
              >
                Login
              </Link>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center text-black lg:text-white"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {isMounted && cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-black text-white dark:bg-white dark:text-black">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </button>

            <Link href={profileHref} className="lg:hidden">
              <User className="h-5 w-5 text-black" />
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black lg:hidden"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden border-t border-black/10 bg-white transition-all duration-300 lg:hidden ${
            isMobileMenuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-2 px-4 py-4">
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-black">
              MARKETPLACE
            </Link>
            <Link href="/brands" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-black">
              BRANDS
            </Link>
            {/* <Link href="/studio" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-black">
              STUDIO
            </Link> */}
            <Link href="/sell" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-black">
              SELL YOUR BRAND
            </Link>
          </nav>
        </div>
      </header>

      {isMounted && !isLoading && isLoggedIn && (
      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-2xl border border-white/10 bg-[var(--palette-surface-pill)]/95 px-1 pb-[env(safe-area-inset-bottom)] text-white shadow-2xl backdrop-blur-xl lg:hidden">
        {[
          { label: "Home", href: homeHref, icon: Home },
          { label: "Shop", href: "/products", icon: ShoppingBag },
          { label: "Discover", href: "/brands", icon: Search },
          { label: "Account", href: isLoggedIn ? `${profileHref}/profile` : "/login", icon: User },
        ].map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (label !== "Home" && href !== "/" && pathname.startsWith(`${href}/`));
          return (
            <Link key={label} href={href} className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[9px] ${active ? "text-white" : "text-white/45"}`}>
              <span className={active ? "flex h-6 w-6 items-center justify-center rounded-full bg-white text-black" : "flex h-6 w-6 items-center justify-center"}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
      )}

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
