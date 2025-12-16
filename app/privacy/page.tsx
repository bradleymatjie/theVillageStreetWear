import React from 'react';
import { Shield, ArrowLeft, Lock, Eye, Database, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
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
            PRIVACY POLICY
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
            <Shield className="w-8 h-8" />
            <h2 className="text-2xl font-black">YOUR PRIVACY MATTERS</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            At The Village, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you visit our website or make a purchase from us.
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12">
          {/* Information We Collect */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Database className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">INFORMATION WE COLLECT</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-3">Personal Information</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  When you make a purchase or attempt to make a purchase through our website, we collect certain 
                  information from you, including:
                </p>
                <ul className="space-y-2 text-gray-700 ml-6">
                  <li>• Name</li>
                  <li>• Email address</li>
                  <li>• Phone number</li>
                  <li>• Billing address</li>
                  <li>• Shipping address</li>
                  <li>• Payment information (processed securely through Yoco)</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold mb-3">Automatically Collected Information</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  When you visit our website, we automatically collect certain information about your device, including:
                </p>
                <ul className="space-y-2 text-gray-700 ml-6">
                  <li>• Web browser type</li>
                  <li>• IP address</li>
                  <li>• Time zone</li>
                  <li>• Cookies and similar tracking technologies</li>
                  <li>• Information about how you interact with our website</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">HOW WE USE YOUR INFORMATION</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-bold mb-2 text-sm">Process Orders</h4>
                  <p className="text-sm text-gray-600">Fulfill and manage your purchases, payments, and shipping</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-bold mb-2 text-sm">Communicate</h4>
                  <p className="text-sm text-gray-600">Send order confirmations, updates, and customer service responses</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-bold mb-2 text-sm">Improve Service</h4>
                  <p className="text-sm text-gray-600">Analyze how customers use our website to enhance user experience</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-bold mb-2 text-sm">Prevent Fraud</h4>
                  <p className="text-sm text-gray-600">Screen orders for potential risk or fraudulent activity</p>
                </div>
              </div>
            </div>
          </section>

          {/* Sharing Your Information */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">SHARING YOUR INFORMATION</h2>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
              <p className="text-gray-700 leading-relaxed font-bold mb-2">
                We do not sell, trade, or rent your personal information to third parties.
              </p>
              <p className="text-gray-700 leading-relaxed text-sm">
                We only share your information in the following circumstances:
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold mb-2">Service Providers</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We share information with third-party service providers who help us operate our business, such as:
                </p>
                <ul className="mt-3 space-y-1 text-gray-700 text-sm ml-6">
                  <li>• Payment processors (Yoco)</li>
                  <li>• Shipping and delivery companies</li>
                  <li>• Email service providers</li>
                  <li>• Website hosting services</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold mb-2">Legal Requirements</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We may disclose your information if required to do so by law or in response to valid requests 
                  by public authorities (e.g., a court or government agency).
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">DATA SECURITY</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold mb-3">Our Security Measures Include:</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• SSL encryption for all data transmission</li>
                  <li>• Secure payment processing through Yoco (PCI DSS compliant)</li>
                  <li>• Regular security audits and updates</li>
                  <li>• Limited access to personal information by authorized personnel only</li>
                  <li>• Secure data storage with regular backups</li>
                </ul>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mt-4">
                However, please note that no method of transmission over the internet or electronic storage is 100% 
                secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">YOUR RIGHTS</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Under the Protection of Personal Information Act (POPIA) in South Africa, you have the following rights:
              </p>
              <div className="grid gap-4">
                <div className="flex gap-4 items-start bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Access Your Data</h3>
                    <p className="text-sm text-gray-600">Request a copy of the personal information we hold about you</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Correct Your Data</h3>
                    <p className="text-sm text-gray-600">Request correction of any inaccurate or incomplete information</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Delete Your Data</h3>
                    <p className="text-sm text-gray-600">Request deletion of your personal information (subject to legal obligations)</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Withdraw Consent</h3>
                    <p className="text-sm text-gray-600">Withdraw consent for data processing at any time</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mt-4">
                To exercise any of these rights, please contact us at{' '}
                <a href="mailto:thevillagestreetwear@gmail.com" className="underline font-bold hover:text-black">
                  thevillagestreetwear@gmail.com
                </a>
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Database className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">COOKIES</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our website and store certain information. 
                Cookies are files with a small amount of data that are sent to your browser from a website and stored on your device.
              </p>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold mb-3">Types of Cookies We Use:</h3>
                <ul className="space-y-3 text-gray-700">
                  <li>
                    <strong>Essential Cookies:</strong> Required for the website to function properly (e.g., shopping cart)
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website
                  </li>
                  <li>
                    <strong>Preference Cookies:</strong> Remember your settings and preferences
                  </li>
                </ul>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mt-4">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                However, if you do not accept cookies, you may not be able to use some portions of our website.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">CHILDREN'S PRIVACY</h2>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed">
                Our website is not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children. If you are a parent or guardian and believe your child has 
                provided us with personal information, please contact us immediately.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black">CHANGES TO THIS POLICY</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date at the top of this policy. 
                We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </div>
          </section>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-black text-white rounded-lg p-8 text-center">
          <Mail className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">QUESTIONS ABOUT PRIVACY?</h2>
          <p className="text-gray-300 mb-6">
            If you have any questions about this Privacy Policy, please contact us.
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