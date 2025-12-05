import { Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
            <footer className="bg-black text-white py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div>
              <h3 className="font-bold mb-3 sm:mb-4 text-xs sm:text-sm">PRODUCT</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white">T-SHIRTS</Link></li>
                <li><Link href="#" className="hover:text-white">HOODIES</Link></li>
                <li><Link href="#" className="hover:text-white">LONG SLEEVES</Link></li>
                <li><Link href="/studio" className="hover:text-white">CUSTOM DESIGN</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 sm:mb-4 text-xs sm:text-sm">CATALOG</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white">NEW ARRIVALS</Link></li>
                <li><Link href="#" className="hover:text-white">BEST SELLERS</Link></li>
                <li><Link href="#" className="hover:text-white">COLLABORATIONS</Link></li>
                <li><Link href="#" className="hover:text-white">COLLECTIONS</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 sm:mb-4 text-xs sm:text-sm">CUSTOMER SERVICE</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white">CONTACT US</Link></li>
                <li><Link href="#" className="hover:text-white">SHIPPING INFO</Link></li>
                <li><Link href="#" className="hover:text-white">RETURNS</Link></li>
                <li><Link href="#" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 sm:mb-4 text-xs sm:text-sm">ABOUT THE VILLAGE</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white">OUR STORY</Link></li>
                <li><Link href="#" className="hover:text-white">SUSTAINABILITY</Link></li>
                <li><Link href="#" className="hover:text-white">CAREERS</Link></li>
                <li><Link href="#" className="hover:text-white">PRESS</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-6xl font-black mb-3 sm:mb-4 opacity-20">The Village</div>
              <p className="text-xs text-gray-500">© 2025 The Village. ALL RIGHTS RESERVED.</p>
            </div>
          </div>
        </div>
      </footer>
    )
}