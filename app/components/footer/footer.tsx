"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname.includes("admin") || pathname.includes("protected")) return null;

  return (
    <footer className="bg-theme-base text-theme-ink">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm leading-6 text-theme-muted">
            A marketplace helping streetwear brands launch, sell, and grow online.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-theme-ink/70">
              Marketplace
            </h3>
            <ul className="space-y-2 text-sm text-theme-muted">
              <li>
                <Link href="/products" className="hover:text-theme-ink">
                  Explore Catalog
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-theme-ink">
                  Explore Brands
                </Link>
              </li>
            </ul>
            <Image
              src="/brand/logo-horizontal-dark.png"
              alt="The Village"
              width={518}
              height={157}
              className="mt-6 hidden h-auto w-44 sm:w-56 dark:block"
            />
            <Image src="/brand/logo-horizontal-light.png" alt="The Village" width={518} height={157} className="mt-6 h-auto w-44 sm:w-56 dark:hidden" />
          </div>

          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-theme-ink/70">
              For Brands
            </h3>
            <ul className="space-y-2 text-sm text-theme-muted">
              <li>
                <Link href="/sell" className="hover:text-theme-ink">
                  Join as a Brand
                </Link>
              </li>
              <li>
                <Link href="/brands/login" className="hover:text-theme-ink">
                  Log in as a Brand
                </Link>
              </li>
              <li>
                <Link href="/sell#pricing" className="hover:text-theme-ink">
                  Commission
                </Link>
              </li>
              <li>
                <Link href="/sell#onboarding" className="hover:text-theme-ink">
                  Onboarding
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-theme-ink/70">
              Company
            </h3>
            <ul className="space-y-2 text-sm text-theme-muted">
              <li>
                <Link href="/about" className="hover:text-theme-ink">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-theme-ink">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-theme-ink">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-theme-ink">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-theme-ink/70">
              Location
            </h3>
            <p className="text-sm leading-6 text-theme-muted">
              Johannesburg, Gauteng
              <br />
              South Africa
            </p>
          </div>
        </div>

        <div className="border-t border-theme-ink/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-theme-muted">
              Copyright 2026 The Village Marketplace. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {["YOCO", "APPLE PAY", "GOOGLE PAY", "CARD"].map((item) => (
                <span
                  key={item}
                  className="rounded-md bg-theme-ink/10 px-3 py-1 text-[10px] font-black text-theme-ink/70"
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
