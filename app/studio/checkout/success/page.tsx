// app/studio/checkout/success/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface CartItem {
  name: string;
  front: string;
  back: string;
  tshirt_color: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedMaterial?: string;
  elements?: {
    front: any[];
    back: any[];
  };
}

interface OrderData {
  orderId: string;
  amount: string;
  email: string;
  phone: string;
  customer_name: string;
  shipping_method: 'delivery' | 'pickup';
  shipping_address: string;
  pickup_location: string;
  cartItems: CartItem[];
  payment_status: string;
  payment_reference: string;
  date: string;
}

function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      const orderId = searchParams.get('orderId');
      if (!orderId) {
        setError('Order ID not found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          setOrderData(data);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [searchParams]);

  const calculateTotals = () => {
    if (!orderData?.cartItems) return { subtotal: 0, shipping: 0, total: 0 };

    const subtotal = orderData.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    const shippingCost = orderData.shipping_method === 'delivery' ? 90 : 0;
    const total = subtotal + shippingCost;

    return { subtotal, shipping: shippingCost, total };
  };

  const { subtotal, shipping, total } = calculateTotals();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">
            {error || 'Unable to load order details'}
          </p>
          <button
            onClick={() => router.push('/studio/design')}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Return to Design Studio
          </button>
        </div>
      </div>
    );
  }

  const firstName = orderData.customer_name.split(' ')[0] || orderData.customer_name;
  const formattedDate = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-black text-white rounded-t-2xl p-8 text-center">
          <div className="mb-4">
            <svg className="h-12 w-12 text-green-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-xl mb-4">Thank you for your purchase, {firstName}!</p>
          <p className="text-gray-300">
            Order #{orderData.orderId} • {formattedDate}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6 md:p-8">
          {/* Order Items */}
          <h2 className="text-3xl font-bold mb-6">Your Custom T-Shirts</h2>
          
          {orderData.cartItems.map((item, index) => {
            const capitalizedColor = item.tshirt_color?.charAt(0).toUpperCase() + item.tshirt_color?.slice(1) || 'Unknown';
            const itemTotal = item.price * item.quantity;

            return (
              <div key={index} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.name || 'Custom T-Shirt'}</h3>
                    <div className="space-y-1">
                      <p className="text-gray-600">Color: {capitalizedColor}</p>
                      {(item.selectedSize || item.selectedMaterial) && (
                        <p className="text-gray-600">
                          {[item.selectedSize, item.selectedMaterial].filter(Boolean).join(' / ')}
                        </p>
                      )}
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <p className="text-xl font-semibold">R{itemTotal.toFixed(2)}</p>
                  </div>
                </div>

                {/* Design Previews */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold mb-3 text-center">Front Design</p>
                    <div className="relative aspect-square bg-white rounded-lg border border-gray-300 overflow-hidden">
                      <Image
                        src={item.front || '/placeholder-front.jpg'}
                        alt="Front design"
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-3 text-center">Back Design</p>
                    <div className="relative aspect-square bg-white rounded-lg border border-gray-300 overflow-hidden">
                      <Image
                        src={item.back || '/placeholder-back.jpg'}
                        alt="Back design"
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Order Summary */}
          <div className="bg-gray-100 rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-bold mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-semibold">R{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">
                  {orderData.shipping_method === 'delivery' ? 'Delivery' : 'Pickup'}
                </span>
                <span className="font-semibold">
                  {shipping === 0 ? 'Free' : `R${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-4 mt-4">
                <div className="flex justify-between">
                  <span className="text-2xl font-bold">Total Paid</span>
                  <span className="text-2xl font-bold">R{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">
              {orderData.shipping_method === 'delivery' ? 'Delivery Address' : 'Pickup Location'}
            </h3>
            <p className="text-gray-700 whitespace-pre-line">
              {orderData.shipping_method === 'delivery'
                ? orderData.shipping_address
                : orderData.pickup_location || 'Johannesburg CBD'}
            </p>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">Name:</span> {orderData.customer_name}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Email:</span> {orderData.email}
              </p>
              {orderData.phone && (
                <p className="text-gray-700">
                  <span className="font-semibold">Phone:</span> {orderData.phone}
                </p>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-blue-900 mb-2">What Happens Next?</h3>
            {orderData.shipping_method === 'delivery' ? (
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">📦</span>
                  <span>Your order is being processed and will be shipped within 3-5 business days</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📧</span>
                  <span>You'll receive a shipping confirmation email with tracking information</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">⏱️</span>
                  <span>Expected delivery: 5-7 business days after shipping</span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">🏪</span>
                  <span>Your order is being prepared for pickup</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📧</span>
                  <span>You'll receive an email when your order is ready for collection</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🆔</span>
                  <span>Please bring your order ID and ID document for collection</span>
                </li>
              </ul>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-200">
            <button
              onClick={() => window.print()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium transition flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Receipt
            </button>
            <button
              onClick={() => router.push('/studio/design')}
              className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Design Another T-Shirt
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t border-gray-200 text-gray-500 text-sm">
            <p>
              Questions? Email{' '}
              <a
                href="mailto:support@thevillagestreetwear.com"
                className="text-blue-600 hover:text-blue-800"
              >
                support@thevillagestreetwear.com
              </a>
            </p>
            <p className="mt-2">© {new Date().getFullYear()} The Village Streetwear</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={"loading..."}>
      <CheckoutSuccessPage />
    </Suspense>
  )
}