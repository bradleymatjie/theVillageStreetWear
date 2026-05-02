"use client";

import { ShoppingBag, Truck, ArrowRight, ShoppingCart, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/app/lib/user";
import { useCartStore } from "@/app/lib/cartStore";
import { useTheme } from "next-themes";
import CartSidebar from "./CartItems";

export default function HomeTab() {
    const [firstName, setFirstName] = useState<string>("");
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { user } = useUser();
    const { theme, setTheme } = useTheme();

    const cartItemCount = useCartStore((state) => state.getTotalItems());

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const name =
                    user.user_metadata?.full_name ||
                    user.email?.split("@")[0] ||
                    "User";

                setFirstName(name.split(" ")[0]);
            }
        };

        getUser();
    }, []);



    return (
        <>
            <div className="flex items-center justify-between px-4 py-6 text-black dark:text-white">
                <div>
                    <p className="text-sm text-black/60 dark:text-white/60">
                        Welcome back
                    </p>
                    <h1 className="text-2xl font-black">Hi, {firstName}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border transition
    ${theme === "light"
                                ? "border-yellow-400 bg-yellow-100 text-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.6)]"
                                : "border-black/10 bg-black/5 text-black hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                            }
  `}
                        aria-label="Toggle theme"
                    >
                        {/* Glow pulse */}
                        {theme === "light" && (
                            <span className="absolute inset-0 rounded-2xl animate-pulse bg-yellow-300/30 blur-md"></span>
                        )}

                        <Lightbulb
                            className={`relative h-5 w-5 transition-all duration-300 ${theme === "light" ? "scale-110" : "scale-100"
                                }`}
                        />
                    </button>

                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-black/5 text-black transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                        aria-label="Open cart"
                    >
                        <ShoppingCart className="h-5 w-5" />

                        {cartItemCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-black leading-none text-white dark:bg-white dark:text-black">
                                {cartItemCount > 9 ? "9+" : cartItemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
            <div className="relative mx-4 mb-4 rounded-2xl border border-black/10 bg-black/5 px-4 py-6 transition-colors dark:border-white/10 dark:bg-white/5
  shadow-[0_10px_25px_rgba(0,0,0,0.08)]
  dark:shadow-[0_10px_25px_rgba(0,0,0,0.6)]
">

                {/* Light highlight from top */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-t-2xl bg-gradient-to-b from-white/40 to-transparent dark:from-white/10"></div>

                <h2 className="text-lg font-black text-black dark:text-white">
                    Explore The Village
                </h2>

                <p className="mt-2 text-sm text-black/60 dark:text-white/60">
                    Discover streetwear, explore brands, and manage your orders — all in one place.
                </p>

                <Link
                    href="/protected/profile/products"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-black underline transition hover:text-black/70 dark:text-white dark:hover:text-white/70"
                >
                    Browse Catalog
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}