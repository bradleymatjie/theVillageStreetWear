"use client";

import { ShoppingBag, Truck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function HomeTab() {
  const [firstName, setFirstName] = useState<string>("");

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
    <div className="space-y-6 px-4 py-6">
      <div>
        <p className="text-sm text-white/60">Welcome back</p>
        <h1 className="text-2xl font-black">Hi, {firstName}</h1>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-black">Explore The Village</h2>
        <p className="mt-2 text-sm text-white/60">
          Discover streetwear, explore brands, and manage your orders — all in one place.
        </p>

        <Link
          href="/products"
          className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white underline"
        >
          Browse Catalog <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}