import React from 'react';
import { Truck, MapPin, Package, Clock, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ShippingInfo() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold hover:underline mb-6">
            <ArrowLeft className="w-4 h-4" />
            BACK TO HOME
          </Link>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
            SHIPPING INFORMATION
          </h1>
          <p className="text-gray-600 text-lg">
            Everything you need to know about shipping with The Village
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Quick Summary */}
        <div className="bg-black text-white rounded-lg p-6 sm:p-8 mb-12">
          <h2 className="text-2xl font-black mb-4">QUICK SUMMARY</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>We ship <strong>within South Africa only</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Processing time: <strong>2-3 business days</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Delivery time: <strong>3-5 business days</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Tracking provided for all orders</span>
            </li>
          </ul>
        </div>

        {/* Detailed Information Sections */}
        <div className="space-y-12">
          {/* Shipping Areas */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">SHIPPING AREAS</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong className="text-black">We currently ship within South Africa only.</strong> We deliver to all provinces including:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Gauteng</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Western Cape</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>KwaZulu-Natal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Eastern Cape</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Free State</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Limpopo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Mpumalanga</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>North West</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Northern Cape</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> We do not ship to P.O. Boxes or international addresses at this time.
                </p>
              </div>
            </div>
          </section>

          {/* Processing Time */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">PROCESSING TIME</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                All orders are processed within <strong className="text-black">2-3 business days</strong> (excluding weekends and holidays) 
                after receiving your order confirmation email. You will receive another notification when your order has shipped.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Important Information
                </h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Orders placed on Friday after 2 PM will be processed the following Monday</li>
                  <li>• Orders placed during holidays may experience slight delays</li>
                  <li>• Peak season (November-January) may require additional processing time</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Delivery Time */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Truck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">DELIVERY TIME</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                Once your order has been processed and shipped, delivery typically takes <strong className="text-black">3-5 business days</strong> depending 
                on your location within South Africa.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="font-bold mb-2">Major Cities</h3>
                  <p className="text-gray-600 text-sm">Johannesburg, Cape Town, Durban, Pretoria</p>
                  <p className="text-2xl font-black mt-3">3-4 days</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="font-bold mb-2">Other Areas</h3>
                  <p className="text-gray-600 text-sm">Remote or rural locations</p>
                  <p className="text-2xl font-black mt-3">4-5 days</p>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Costs */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">SHIPPING COSTS</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 border border-gray-200">
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-200">
                  <div>
                    <h3 className="font-bold mb-1">Standard Shipping</h3>
                    <p className="text-sm text-gray-600">3-5 business days delivery</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black">R80</p>
                    <p className="text-xs text-gray-600">per order</p>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong className="text-green-700">Free Shipping:</strong> Available on orders over R800
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Order Tracking */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">ORDER TRACKING</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 border border-gray-200">
              <p className="text-gray-600 leading-relaxed mb-6">
                Once your order ships, you'll receive a shipping confirmation email with a tracking number. 
                You can use this number to track your package's journey.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Order Confirmed</h3>
                    <p className="text-sm text-gray-600">You'll receive an email confirming your order</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Order Processing</h3>
                    <p className="text-sm text-gray-600">We're preparing your items for shipment (2-3 days)</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Order Shipped</h3>
                    <p className="text-sm text-gray-600">You'll receive tracking details via email</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Out for Delivery</h3>
                    <p className="text-sm text-gray-600">Your package is on its way to you</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Delivered</h3>
                    <p className="text-sm text-gray-600">Enjoy your new gear!</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Delivery Issues */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">DELIVERY ISSUES</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                If your order hasn't arrived within the estimated delivery time, or if there are any issues with your delivery, 
                please contact us immediately at{' '}
                <a href="mailto:thevillagestreetwear@gmail.com" className="underline font-bold hover:text-black">
                  thevillagestreetwear@gmail.com
                </a>
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-bold mb-2">Lost or Damaged Packages</h3>
                <p className="text-sm text-gray-700">
                  In the rare event that your package is lost or arrives damaged, we'll work with you to resolve the issue. 
                  Please contact us within 48 hours of receiving a damaged package with photos of the damage.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-black text-white rounded-lg p-8 text-center">
          <Truck className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">SHIPPING QUESTIONS?</h2>
          <p className="text-gray-300 mb-6">
            Have questions about shipping? We're here to help.
          </p>
          <a
            href="mailto:thevillagestreetwear@gmail.com"
            className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}