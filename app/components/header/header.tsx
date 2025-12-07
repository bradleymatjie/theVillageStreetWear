"use client";

import { useState } from "react";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/app/lib/user";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "";
  const isLoggedIn = !!user;

  return (
    <header className="border-b border-gray-200 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl sm:text-2xl font-black text-gray-900">
          The Village
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-4 xl:gap-8">
          <Link href="#" className="text-sm font-semibold text-gray-700 hover:text-gray-900 hover:underline transition-colors">
            NEW DROP
          </Link>
          <Link href="/products" className="text-sm font-semibold text-gray-700 hover:text-gray-900 hover:underline transition-colors">
            CATALOG
          </Link>
          <Link href="/about" className="text-sm font-semibold text-gray-700 hover:text-gray-900 hover:underline transition-colors">
            ABOUT
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Right Section: User/Auth + Cart */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Desktop: Show name if logged in, otherwise show Login button */}
          {isLoggedIn ? (
            <Link
              href="/protected/profile"
              className="hidden lg:block text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors underline"
            >
              Hi, {firstName}
            </Link>
          ) : (
            <Link href="/login" className="hidden lg:block">
              <Button>Login</Button>
            </Link>
          )}

          {/* Mobile: Show profile icon if logged in, otherwise show Login button */}
          {isLoggedIn ? (
            <Link href="/protected/profile" className="lg:hidden">
              <User className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900 transition-colors" />
            </Link>
          ) : (
            <Link href="/login" className="lg:hidden">
              <Button size="sm">Login</Button>
            </Link>
          )}

          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 cursor-pointer hover:text-gray-900 transition-colors" />
        </div>
      </div>

      {/* Mobile Nav Dropdown with Smooth Transition */}
      <div
        className={`lg:hidden overflow-hidden border-t border-gray-200 bg-white transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "max-h-48 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-1"
        }`}
      >
        <nav className="px-4 py-4 flex flex-col gap-2">
          <Link
            href="#"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 py-2 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            NEW DROP
          </Link>
          <Link
            href="/products"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 py-2 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            CATALOG
          </Link>
          <Link
            href="/about"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 py-2 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ABOUT
          </Link>
        </nav>
      </div>
    </header>
  );
}