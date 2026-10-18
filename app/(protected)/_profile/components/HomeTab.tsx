"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/app/lib/user";
import { getCurrentProfileBase, joinProfilePath } from "@/app/lib/profileRoutes";

export default function HomeTab() {
  const { user } = useUser();
  const pathname = usePathname();
  const profileBase = getCurrentProfileBase(pathname, user);
  const routeName = decodeURIComponent(profileBase.split("/")[2] || "there")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    routeName;
  const firstName = displayName.split(" ")[0];

  return (
    <section className="relative isolate min-h-[460px] overflow-hidden border-b border-white/10 bg-black text-white sm:min-h-[500px] lg:min-h-[520px]">
      <img
        src="/joziHome.jpg"
        alt="Johannesburg skyline"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/85 to-black/30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

      <div className="mx-auto flex min-h-[460px] max-w-7xl items-end px-4 py-10 sm:min-h-[500px] sm:items-center sm:px-6 lg:min-h-[520px] lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.32em] text-white/70 sm:text-xs">
            Streetwear lives here
            <span className="h-px w-10 bg-white/50" />
          </p>
          <h1 className="max-w-xl text-5xl font-black leading-[0.92] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Welcome back,<br />{firstName}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/70 sm:text-base">
            New drops. Fresh brands. Same culture. Discover what&apos;s next at The Village.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-white px-6 text-sm font-black text-black transition hover:bg-white/85"
            >
              Shop new drops
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={joinProfilePath(profileBase, "orders")}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/50 px-6 text-sm font-black text-white transition hover:bg-white hover:text-black"
            >
              View my orders
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
