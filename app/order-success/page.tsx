"use client";

import Link from "next/link";
import { CheckCircle, Package, Mail } from "lucide-react";

export default function OrderSuccessPage() {
  const orderNumber = `VIL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-theme-soft flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-theme-surface text-theme-ink rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-theme-success-bg rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-theme-success-ink" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-theme-ink mb-2">
            Order Confirmed!
          </h1>
          <p className="text-theme-muted mb-6">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>

          {/* Order Number */}
          <div className="bg-theme-soft rounded-lg p-4 mb-6">
            <p className="text-sm text-theme-muted mb-1">Order Number</p>
            <p className="text-xl font-bold text-theme-ink">{orderNumber}</p>
          </div>

          {/* Info Cards */}
          <div className="space-y-3 mb-8 text-left">
            <div className="flex items-start gap-3 p-3 bg-theme-info-bg rounded-lg">
              <Mail className="w-5 h-5 text-theme-info-ink mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-theme-ink">Confirmation Email</p>
                <p className="text-theme-muted">
                  We've sent a confirmation email with your order details
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-theme-purple-bg rounded-lg">
              <Package className="w-5 h-5 text-theme-purple-ink mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-theme-ink">Estimated Delivery</p>
                <p className="text-theme-muted">
                  Your order will arrive in 3-5 business days
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/products"
              className="block w-full py-3 bg-theme-ink text-theme-base font-semibold rounded-md hover:bg-theme-ink/85 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="block w-full py-3 border border-theme-ink/15 text-theme-ink/85 font-semibold rounded-md hover:bg-theme-soft transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-theme-muted">
          <p>
            Questions about your order?{" "}
            <Link href="/contact" className="text-theme-ink font-semibold hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
