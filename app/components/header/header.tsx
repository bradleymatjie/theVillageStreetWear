"use client";

import { useState } from "react";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/app/lib/user";
import { useCartStore } from "@/app/lib/cartStore";
import CartSidebar from "./CartSidebar";
import { usePathname } from "next/navigation";
import DesignHeader from "@/app/studio/components/Designheader";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { user } = useUser();
  const pathname = usePathname();
  const cartItemCount = useCartStore((state) => state.getTotalItems());

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "";
  const isLoggedIn = !!user;

  if (pathname.includes("admin") || pathname.includes("protected")) return null;

  if (pathname.includes("/studio")) return <DesignHeader />;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-black/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-xl font-black text-black dark:text-white sm:text-2xl"
          >
            The Village
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            <Link href="/products" className="text-sm font-black text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white">
              MARKETPLACE
            </Link>
            {/* <Link href="/studio" className="text-sm font-black text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white">
              STUDIO
            </Link> */}
            <Link href="/sell" className="text-sm font-black text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white">
              SELL YOUR BRAND
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/protected/profile"
                className="hidden rounded-full bg-black px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-black lg:block"
              >
                Hi, {firstName || "Dashboard"}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-full bg-black px-4 py-2 text-sm font-black text-white dark:bg-white dark:text-black lg:block"
              >
                Login
              </Link>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-black/5 text-black dark:border-white/10 dark:bg-white/5 dark:text-white"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-black text-white dark:bg-white dark:text-black">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </button>

            <Link href={isLoggedIn ? "/protected/profile" : "/login"} className="lg:hidden">
              <User className="h-5 w-5 text-black dark:text-white" />
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-black dark:text-white"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden border-t border-black/10 bg-white transition-all duration-300 dark:border-white/10 dark:bg-black lg:hidden ${
            isMobileMenuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-2 px-4 py-4">
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-black">
              MARKETPLACE
            </Link>
            {/* <Link href="/studio" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-black">
              STUDIO
            </Link> */}
            <Link href="/sell" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-black">
              SELL YOUR BRAND
            </Link>
            <Link href="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-black">
              TRACK ORDER
            </Link>
          </nav>
        </div>
      </header>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}