"use client";

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutError() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-theme-soft to-theme-base flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-theme-warning-bg rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-12 h-12 text-theme-warning-ink" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Payment Error</h1>
        <p className="text-theme-muted mb-6">
          We encountered an error while processing your payment. Please try again or use a different payment method.
        </p>
        <div className="space-y-4">
          <Link
            href="/studio/checkout"
            className="block bg-theme-ink text-theme-base py-3 rounded-lg font-bold hover:bg-theme-ink/85 transition-colors text-lg"
          >
            Try Again
          </Link>
          <Link
            href="/studio"
            className="block border border-theme-ink text-theme-ink py-3 rounded-lg font-bold hover:bg-theme-soft transition-colors"
          >
            Back to Designer
          </Link>
          <div className="pt-4 border-t border-theme-ink/15">
            <p className="text-sm text-theme-muted mb-2">
              If the problem persists, please:
            </p>
            <ul className="text-sm text-theme-muted space-y-1">
              <li>• Check your payment details</li>
              <li>• Ensure you have sufficient funds</li>
              <li>• Contact your bank if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}