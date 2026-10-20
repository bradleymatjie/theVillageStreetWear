"use client";

import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-theme-soft to-theme-base flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-theme-error-bg rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-theme-error-ink" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-theme-muted mb-8">
          Your payment was cancelled. No charges have been made to your account.
        </p>
        <div className="space-y-4">
          <Link
            href="/studio/checkout"
            className="block bg-theme-ink text-theme-base py-3 rounded-lg font-bold hover:bg-theme-ink/85 transition-colors text-lg"
          >
            Return to Checkout
          </Link>
          <Link
            href="/studio"
            className="block border border-theme-ink text-theme-ink py-3 rounded-lg font-bold hover:bg-theme-soft transition-colors"
          >
            Back to Designer
          </Link>
          <p className="text-theme-muted text-sm pt-4">
            Need help?{' '}
            <a href="/contact" className="text-theme-info-ink hover:underline font-medium">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}