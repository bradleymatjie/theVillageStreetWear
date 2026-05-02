"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname.includes("admin") || pathname.includes("protected")) return null;

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-4xl font-black sm:text-5xl">The Village</h2>
          <p className="mt-3 text-sm leading-6 text-white/50">
            A marketplace helping streetwear brands launch, sell, and grow online.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-white/70">
              Marketplace
            </h3>
            <ul className="space-y-2 text-sm text-white/45">
              <li><Link href="/products" className="hover:text-white">Explore Catalog</Link></li>
              <li><Link href="/studio" className="hover:text-white">Design Studio</Link></li>
              <li><Link href="/track-order" className="hover:text-white">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-white/70">
              For Brands
            </h3>
            <ul className="space-y-2 text-sm text-white/45">
              <li><Link href="/sell" className="hover:text-white">Join as a Brand</Link></li>
              <li><Link href="/brands/login" className="hover:text-white">Login in as a Brand</Link></li>
              <li><Link href="/sell#pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/sell#onboarding" className="hover:text-white">Onboarding</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-white/70">
              Company
            </h3>
            <ul className="space-y-2 text-sm text-white/45">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-white/70">
              Location
            </h3>
            <p className="text-sm leading-6 text-white/45">
              Johannesburg, Gauteng<br />
              South Africa
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-white/40">
              © 2025 The Village Marketplace. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {["YOCO", "APPLE PAY", "GOOGLE PAY", "CARD"].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black text-white/70"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}