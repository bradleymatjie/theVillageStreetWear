"use client";

import { useCartStore } from "@/app/lib/cartStore";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();

  return (
    <>
      {/* Overlay */}
      <div
        className={` fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-theme-base text-theme-ink shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-theme-ink/15">
            <h2 className="text-xl font-bold text-theme-ink">Your Cart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-theme-soft rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-theme-muted" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 rounded-full bg-theme-soft flex items-center justify-center mb-4">
                  <span className="text-4xl">🛒</span>
                </div>
                <h3 className="text-lg font-semibold text-theme-ink mb-2">Your cart is empty</h3>
                <p className="text-sm text-theme-muted mb-6">Add some items to get started</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-theme-ink text-theme-base font-semibold rounded-md hover:bg-theme-ink/85 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-3 pb-4 border-b border-theme-ink/15">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border border-theme-ink/15">
                      <img
                        src={item.imageurl||"/noImage.jpg"}
                        alt={item.name}                        className="h-full w-full object-cover"                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-theme-ink truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-theme-muted mt-1">{item.price}</p>

                      {/* Variant */}
                      <p className="text-xs text-theme-muted mt-1">
                        Size: {item.selectedSize} • Material: {item.selectedMaterial}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-1 hover:bg-theme-soft rounded transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3 text-theme-muted" />
                        </button>
                        <span className="text-sm font-medium text-theme-ink w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-1 hover:bg-theme-soft rounded transition-colors"
                        >
                          <Plus className="w-3 h-3 text-theme-muted" />
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      className="p-2 hover:bg-theme-error-bg rounded transition-colors self-start"
                    >
                      <Trash2 className="w-4 h-4 text-theme-error-ink" />
                    </button>
                  </div>
                ))}

                {/* Clear Cart */}
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-sm text-theme-error-ink hover:text-theme-error-ink font-medium transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-theme-ink/15 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-theme-muted">Subtotal</span>
                <span className="text-lg font-bold text-theme-ink">
                  R{totalPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-theme-muted text-center">
                Shipping prices calculated at checkout
              </p>
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full py-3 bg-theme-ink text-theme-base text-center font-bold rounded-md hover:bg-theme-ink/85 transition-colors"
              >
                Checkout
              </Link>
              <button
                onClick={onClose}
                className="w-full py-2 text-sm text-theme-muted hover:text-theme-ink font-medium transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
