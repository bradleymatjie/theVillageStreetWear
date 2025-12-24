import React from 'react';
import { FileText, ArrowLeft, ShoppingBag, Ban, AlertTriangle, Mail } from 'lucide-react';
import Link from 'next/link';

export default function TermsConditions() {
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
            TERMS & CONDITIONS
          </h1>
          <p className="text-gray-600 text-lg">
            Last updated: December 2024
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Introduction */}
        <div className="bg-black text-white rounded-lg p-6 sm:p-8 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8" />
            <h2 className="text-2xl font-black">AGREEMENT TO TERMS</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            By accessing and using The Village website and purchasing our products, you agree to be bound by these 
            Terms and Conditions. Please read them carefully before making a purchase.
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12">
          {/* General Terms */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">GENERAL TERMS</h2>
            </div>
            <div className="prose prose-gray max-w-none space-y-4">
              <p className="text-gray-600 leading-relaxed">
                These Terms and Conditions govern your use of The Village's website and the purchase of products. 
                By using our website or making a purchase, you accept these terms in full.
              </p>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold mb-3">Key Points:</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• You must be at least 18 years old to make a purchase</li>
                  <li>• All prices are in South African Rand (ZAR)</li>
                  <li>• We reserve the right to refuse service to anyone</li>
                  <li>• We may modify these terms at any time</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Products and Pricing */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">PRODUCTS & PRICING</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-3">Product Information</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We strive to display product colors and images as accurately as possible. However, we cannot 
                  guarantee that your device's display will accurately reflect the actual color or appearance of products.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Pricing
                </h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• All prices are in South African Rand (ZAR) and include VAT</li>
                  <li>• Prices are subject to change without notice</li>
                  <li>• The price displayed at checkout is the final price you'll pay</li>
                  <li>• We reserve the right to correct pricing errors</li>
                  <li>• Shipping costs are calculated at checkout</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold mb-3">Product Availability</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  All products are subject to availability. We reserve the right to limit quantities of any products 
                  or services. If a product becomes unavailable after you place an order, we will notify you and 
                  provide a full refund.
                </p>
              </div>
            </div>
          </section>

          {/* Orders and Payment */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">ORDERS & PAYMENT</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-3">Order Process</h3>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <ol className="space-y-4">
                    <li className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h4 className="font-bold mb-1">Place Order</h4>
                        <p className="text-sm text-gray-600">Add items to cart and complete checkout</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h4 className="font-bold mb-1">Order Confirmation</h4>
                        <p className="text-sm text-gray-600">Receive confirmation email with order details</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <div>
                        <h4 className="font-bold mb-1">Processing</h4>
                        <p className="text-sm text-gray-600">We prepare your order (2-3 business days)</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                        4
                      </div>
                      <div>
                        <h4 className="font-bold mb-1">Shipping</h4>
                        <p className="text-sm text-gray-600">Order ships with tracking (3-5 business days)</p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3">Payment</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  All payments are processed securely through Yoco. We accept the following payment methods:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="font-bold text-sm">Credit/Debit Cards</p>
                    <p className="text-xs text-gray-600 mt-1">Visa, Mastercard</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="font-bold text-sm">Digital Wallets</p>
                    <p className="text-xs text-gray-600 mt-1">Apple Pay, Google Pay</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mt-4">
                  Payment must be received in full before we process your order. We do not store your payment 
                  information - all payments are handled securely by Yoco.
                </p>
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">SHIPPING</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                We currently ship within South Africa only. For detailed shipping information, please see our{' '}
                <Link href="/shipping" className="underline font-bold hover:text-black">
                  Shipping Information page
                </Link>.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold mb-2">Important Shipping Notes:</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• You are responsible for providing accurate shipping information</li>
                  <li>• We are not responsible for delays caused by incorrect addresses</li>
                  <li>• Risk of loss passes to you upon delivery</li>
                  <li>• Unclaimed packages will not be refunded</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Returns and Refunds */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Ban className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">RETURNS & REFUNDS</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                We have a 3-day return policy. For complete details on returns, exchanges, and refunds, please 
                see our{' '}
                <Link href="/returns" className="underline font-bold hover:text-black">
                  Returns Policy page
                </Link>.
              </p>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold mb-3">Quick Summary:</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Returns must be initiated within 3 days of delivery</li>
                  <li>• Items must be unworn with original tags attached</li>
                  <li>• Refunds processed within 5-7 business days after inspection</li>
                  <li>• Customer pays return shipping unless item is faulty</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">INTELLECTUAL PROPERTY</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                All content on this website, including but not limited to text, graphics, logos, images, and software, 
                is the property of The Village and is protected by South African and international copyright laws.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-bold mb-2 text-red-900">You May Not:</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Reproduce, distribute, or display any content without written permission</li>
                  <li>• Use our trademarks, logos, or brand name without authorization</li>
                  <li>• Copy or replicate our designs for commercial purposes</li>
                  <li>• Use automated tools to access or scrape our website</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">LIMITATION OF LIABILITY</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                To the fullest extent permitted by law, The Village shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages resulting from:
              </p>
              <ul className="space-y-2 text-gray-700 ml-6 mb-4">
                <li>• Your use or inability to use our website or products</li>
                <li>• Unauthorized access to your personal information</li>
                <li>• Errors or omissions in our content</li>
                <li>• Any other matter relating to our service</li>
              </ul>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our total liability to you for any claim arising out of or relating to these terms shall not exceed 
                the amount you paid for the product(s) in question.
              </p>
            </div>
          </section>

          {/* User Conduct */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Ban className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">USER CONDUCT</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-bold mb-3">You agree not to:</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Use our website for any unlawful purpose</li>
                <li>• Attempt to gain unauthorized access to our systems</li>
                <li>• Interfere with or disrupt our website or servers</li>
                <li>• Transmit any viruses, malware, or harmful code</li>
                <li>• Impersonate any person or entity</li>
                <li>• Harass, abuse, or harm other users</li>
                <li>• Collect personal information about other users</li>
              </ul>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">GOVERNING LAW</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed">
                These Terms and Conditions are governed by and construed in accordance with the laws of South Africa. 
                Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the South African courts.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">CHANGES TO TERMS</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these Terms and Conditions at any time. Changes will be effective 
                immediately upon posting to our website. Your continued use of our website after changes are posted 
                constitutes your acceptance of the modified terms.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">CONTACT INFORMATION</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:thevillagestreetwear@gmail.com" className="underline hover:text-black">
                    thevillagestreetwear@gmail.com
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong>Location:</strong> Johannesburg, Gauteng, South Africa
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 bg-black text-white rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">QUESTIONS ABOUT OUR TERMS?</h2>
          <p className="text-gray-300 mb-6">
            If you have any questions or concerns about these terms, we're here to help.
          </p>
          <a
            href="mailto:thevillagestreetwear@gmail.com"
            className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}