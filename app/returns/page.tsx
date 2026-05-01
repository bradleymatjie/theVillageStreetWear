
import { Package, ArrowLeft, Clock, XCircle, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ReturnsPolicy() {
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
            RETURNS POLICY
          </h1>
          <p className="text-gray-600 text-lg">
            Last updated: December 2024
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
              <span>You have <strong>3 days</strong> from delivery to initiate a return</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Items must be unworn, unwashed, and have original tags attached</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Refunds processed within 5-7 business days</span>
            </li>
          </ul>
        </div>

        {/* Detailed Policy Sections */}
        <div className="space-y-12">
          {/* Return Window */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">RETURN WINDOW</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed">
                You have <strong className="text-black">3 days from the date of delivery</strong> to initiate a return. 
                Returns requested after this period will not be accepted. The return window begins on the day 
                your order is delivered to your address.
              </p>
            </div>
          </section>

          {/* Eligibility */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">ELIGIBILITY REQUIREMENTS</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Items We Accept
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Items in original, unworn condition</li>
                  <li>• All original tags and packaging intact</li>
                  <li>• No signs of wear, washing, or alterations</li>
                  <li>• Items free from perfume, smoke, or other odors</li>
                  <li>• Original proof of purchase included</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Items We Cannot Accept
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Items worn or washed</li>
                  <li>• Items with tags removed or damaged</li>
                  <li>• Items with stains, damage, or alterations</li>
                  <li>• Sale or clearance items (unless faulty)</li>
                  <li>• Items returned after the 3-day window</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How to Return */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <ArrowLeft className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">HOW TO RETURN</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 border border-gray-200">
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Contact Us</h3>
                    <p className="text-gray-600">
                      Email us at <a href="mailto:thevillagestreetwear@gmail.com" className="underline hover:text-black">thevillagestreetwear@gmail.com</a> within 
                      3 days of delivery with your order number and reason for return.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Get Approval</h3>
                    <p className="text-gray-600">
                      Wait for our team to approve your return request. We'll provide you with return instructions 
                      and our return address.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Pack Your Items</h3>
                    <p className="text-gray-600">
                      Securely pack your items with all original tags and packaging. Include your order confirmation 
                      or packing slip.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Ship Your Return</h3>
                    <p className="text-gray-600">
                      Send your package to the address provided. We recommend using a tracked shipping method. 
                      Return shipping costs are the customer's responsibility unless the item is faulty.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          {/* Refunds */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">REFUNDS</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                Once we receive and inspect your return, we'll notify you via email. If approved, your refund 
                will be processed within <strong className="text-black">5-7 business days</strong> to your original 
                payment method.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Please note that it may take an additional 3-5 business days for the refund to reflect in your 
                account, depending on your bank or payment provider.
              </p>
            </div>
          </section>

          {/* Exchanges */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">EXCHANGES</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                We currently do not offer direct exchanges. If you need a different size or item, please return 
                your original purchase for a refund and place a new order.
              </p>
              <p className="text-gray-600 leading-relaxed">
                This ensures you get your preferred item as quickly as possible without waiting for the return 
                process to complete.
              </p>
            </div>
          </section>

          {/* Faulty Items */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <XCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">FAULTY OR DAMAGED ITEMS</h2>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                If you receive a faulty or damaged item, please contact us immediately at{' '}
                <a href="mailto:thevillagestreetwear@gmail.com" className="underline font-bold hover:text-black">
                  thevillagestreetwear@gmail.com
                </a>{' '}
                with photos of the defect or damage.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We'll arrange a replacement or full refund, including return shipping costs, at no additional 
                charge to you.
              </p>
            </div>
          </section>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-black text-white rounded-lg p-8 text-center">
          <Mail className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">QUESTIONS?</h2>
          <p className="text-gray-300 mb-6">
            If you have any questions about our returns policy, please don't hesitate to contact us.
          </p>
          <a
            href="mailto:thevillagestreetwear@gmail.com"
            className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}