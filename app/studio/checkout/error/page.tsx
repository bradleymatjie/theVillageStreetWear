"use client";

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutError() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-12 h-12 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Payment Error</h1>
        <p className="text-gray-600 mb-6">
          We encountered an error while processing your payment. Please try again or use a different payment method.
        </p>
        <div className="space-y-4">
          <Link
            href="/studio/checkout"
            className="block bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors text-lg"
          >
            Try Again
          </Link>
          <Link
            href="/studio"
            className="block border border-black text-black py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
          >
            Back to Designer
          </Link>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              If the problem persists, please:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
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