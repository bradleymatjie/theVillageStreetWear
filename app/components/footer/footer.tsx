"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  
  if (pathname.includes("admin")) {
    return null;
  }

  return (
    <footer className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div>
            <h3 className="font-bold mb-3 sm:mb-4 text-xs sm:text-sm">SHOP</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-white">ALL PRODUCTS</Link></li>
              <li><Link href="/products?category=tshirts" className="hover:text-white">T-SHIRTS</Link></li>
              <li><Link href="/products?category=hoodies" className="hover:text-white">HOODIES</Link></li>
              <li><Link href="/products?category=new" className="hover:text-white">NEW ARRIVALS</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-3 sm:mb-4 text-xs sm:text-sm">HELP</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li><Link href="/contact" className="hover:text-white">CONTACT US</Link></li>
              <li><Link href="/shipping" className="hover:text-white">SHIPPING INFO</Link></li>
              <li><Link href="/returns" className="hover:text-white">RETURNS POLICY</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-3 sm:mb-4 text-xs sm:text-sm">COMPANY</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white">ABOUT US</Link></li>
              <li><Link href="/studio" className="hover:text-white">CUSTOM DESIGN</Link></li>
              <li><Link href="/privacy" className="hover:text-white">PRIVACY POLICY</Link></li>
              <li><Link href="/terms" className="hover:text-white">TERMS & CONDITIONS</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-3 sm:mb-4 text-xs sm:text-sm">ADDRESS</h3>
            <p className="text-xs text-gray-400">
              Johannesburg, Gauteng<br />
              South Africa
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="text-xs text-gray-500 font-bold">SECURE PAYMENTS POWERED BY</span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="px-4 py-2 bg-white/10 rounded-lg text-xs font-bold flex items-center gap-2">
                YOCO
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-lg text-xs font-bold flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                APPLE PAY
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-lg text-xs font-bold flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
                GOOGLE PAY
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-lg text-xs font-bold">
                CARD
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl lg:text-6xl font-black mb-3 sm:mb-4 opacity-20">The Village</div>
            <p className="text-xs text-gray-500">© 2025 The Village. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}