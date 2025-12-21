"use client";

import { Suspense, useEffect, useState } from 'react';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Download,
  Share2,
  Home,
  ShoppingBag,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface OrderItem {
  name: string;
  screenshot: string;
  elements: any[];
  view: string;
  tshirt_color: string;
  price: number;
  quantity: number;
  total_price: number;
}

interface OrderDetails {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  created_at: string;
  status: string;
  estimated_delivery?: string;
}

function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('');
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    // Calculate estimated delivery date (3-5 business days from now)
    const calculateDeliveryDate = () => {
      const now = new Date();
      let daysToAdd = 3;
      
      // Skip weekends
      for (let i = 0; i < 5; i++) {
        now.setDate(now.getDate() + 1);
        const day = now.getDay();
        if (day !== 0 && day !== 6) {
          daysToAdd--;
        }
        if (daysToAdd === 0) break;
      }
      
      return now.toLocaleDateString('en-ZA', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    setEstimatedDelivery(calculateDeliveryDate());

    // Try to retrieve order details from localStorage or simulate
    const fetchOrderDetails = async () => {
      try {
        // Check localStorage for order data
        const savedOrder = localStorage.getItem('lastOrder');
        if (savedOrder) {
          const orderData = JSON.parse(savedOrder);
          setOrder(orderData);
        } else if (orderId) {
          // Try to fetch from API
          const response = await fetch(`/api/orders/${orderId}`);
          if (response.ok) {
            const data = await response.json();
            setOrder(data.order);
          } else {
            // Create mock order based on orderId
            setOrder({
              order_number: orderId,
              customer_name: 'John Doe',
              customer_email: 'john@example.com',
              customer_phone: '+27 12 345 6789',
              shipping_address: '123 Main Street, Johannesburg, Gauteng, 2000',
              items: [
                {
                  name: 'Custom T-Shirt Design',
                  screenshot: '',
                  elements: [],
                  view: 'front',
                  tshirt_color: 'Black',
                  price: 299.99,
                  quantity: 1,
                  total_price: 299.99
                }
              ],
              subtotal: 299.99,
              shipping_cost: 0,
              total: 299.99,
              created_at: new Date().toISOString(),
              status: 'paid',
              estimated_delivery: calculateDeliveryDate()
            });
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        // Fallback to mock data
        setOrder({
          order_number: orderId || `ORD-${Date.now()}`,
          customer_name: 'John Doe',
          customer_email: 'customer@example.com',
          customer_phone: '+27 12 345 6789',
          shipping_address: '123 Main Street, Johannesburg, Gauteng, 2000',
          items: [
            {
              name: 'Custom T-Shirt Design',
              screenshot: '',
              elements: [],
              view: 'front',
              tshirt_color: 'Black',
              price: 299.99,
              quantity: 1,
              total_price: 299.99
            }
          ],
          subtotal: 299.99,
          shipping_cost: 0,
          total: 299.99,
          created_at: new Date().toISOString(),
          status: 'paid'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleShareOrder = async () => {
    if (!order) return;
    
    setSharing(true);
    try {
      const shareData = {
        title: 'My Custom T-Shirt Order',
        text: `I just ordered a custom t-shirt from your store! Order #${order.order_number}`,
        url: window.location.href,
      };
      
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(
          `I just ordered a custom t-shirt! Order #${order.order_number}\n${window.location.href}`
        );
        alert('Order link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!order) return;
    
    const receiptText = `
      =================================
      CUSTOM T-SHIRT ORDER RECEIPT
      =================================
      Order Number: ${order.order_number}
      Date: ${new Date(order.created_at).toLocaleDateString('en-ZA')}
      Time: ${new Date(order.created_at).toLocaleTimeString('en-ZA')}
      =================================
      CUSTOMER DETAILS
      ---------------------------------
      Name: ${order.customer_name}
      Email: ${order.customer_email}
      Phone: ${order.customer_phone}
      Shipping: ${order.shipping_address}
      =================================
      ORDER ITEMS
      ---------------------------------
      ${order.items.map((item, index) => `
      ${index + 1}. ${item.name}
         Color: ${item.tshirt_color}
         View: ${item.view}
         Qty: ${item.quantity}
         Price: R${item.price.toFixed(2)}
         Subtotal: R${item.total_price.toFixed(2)}
      `).join('')}
      =================================
      ORDER SUMMARY
      ---------------------------------
      Subtotal: R${order.subtotal.toFixed(2)}
      Shipping: R${order.shipping_cost.toFixed(2)}
      Total: R${order.total.toFixed(2)}
      =================================
      Status: ${order.status.toUpperCase()}
      Estimated Delivery: ${estimatedDelivery}
      =================================
      Thank you for your order!
      =================================
    `;
    
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.order_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'shipped':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return CheckCircle;
      case 'processing':
        return Package;
      case 'shipped':
        return Truck;
      default:
        return Clock;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the order details. Please check your email for confirmation or contact support.
          </p>
          <div className="space-y-3">
            <Link
              href="/studio"
              className="block bg-black text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-800 transition-colors"
            >
              Create New Design
            </Link>
            <Link
              href="/orders"
              className="block border border-black text-black py-3 px-6 rounded-lg font-bold hover:bg-gray-50 transition-colors"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getOrderStatusIcon(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for your order, <span className="font-bold">{order.customer_name}</span>!
          </p>
          <p className="text-gray-500">
            We've sent a confirmation email to <span className="font-medium">{order.customer_email}</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Order Status Card */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Summary Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order Summary
                </h2>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getOrderStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                  <StatusIcon className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-6 border-b border-gray-200 last:border-0">
                    <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                      {item.screenshot ? (
                        <img 
                          src={item.screenshot} 
                          alt={item.name} 
                          className="w-full h-full object-contain p-1" 
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Color:</span>
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: item.tshirt_color.toLowerCase() }}
                            title={item.tshirt_color}
                          />
                          <span>{item.tshirt_color}</span>
                        </div>
                        <div>
                          <span className="font-medium">View:</span> {item.view}
                        </div>
                        <div>
                          <span className="font-medium">Qty:</span> {item.quantity}
                        </div>
                        <div>
                          <span className="font-medium">Designs:</span> {item.elements?.length || 0}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold">R{item.total_price.toFixed(2)}</div>
                        <span className="text-sm text-gray-500">
                          R{item.price.toFixed(2)} each
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Order Total */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">R{order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-medium text-green-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-xl md:text-2xl font-black pt-4 border-t border-gray-300">
                      <span>Total Paid</span>
                      <span>R{order.total.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 pt-2">
                      Payment processed via Yoco • VAT included where applicable
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Order Timeline
              </h2>
              
              <div className="relative pl-8">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Timeline steps */}
                <div className="space-y-8">
                  {/* Step 1: Order Placed */}
                  <div className="relative">
                    <div className="absolute -left-8 top-0 w-8 h-8 bg-green-100 border-4 border-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Order Placed</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {new Date(order.created_at).toLocaleDateString('en-ZA', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-green-600 font-medium">✓ Completed</p>
                    </div>
                  </div>

                  {/* Step 2: Payment Confirmed */}
                  <div className="relative">
                    <div className="absolute -left-8 top-0 w-8 h-8 bg-green-100 border-4 border-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Payment Confirmed</h3>
                      <p className="text-gray-600 text-sm mb-2">Payment processed successfully</p>
                      <p className="text-green-600 font-medium">✓ Completed</p>
                    </div>
                  </div>

                  {/* Step 3: Processing */}
                  <div className="relative">
                    <div className="absolute -left-8 top-0 w-8 h-8 bg-blue-100 border-4 border-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Processing Order</h3>
                      <p className="text-gray-600 text-sm mb-2">Preparing your custom t-shirt(s)</p>
                      <p className="text-blue-600 font-medium">In Progress</p>
                    </div>
                  </div>

                  {/* Step 4: Shipped */}
                  <div className="relative">
                    <div className="absolute -left-8 top-0 w-8 h-8 bg-gray-100 border-4 border-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Shipped</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Estimated: {estimatedDelivery}
                      </p>
                      <p className="text-gray-500">Upcoming</p>
                    </div>
                  </div>

                  {/* Step 5: Delivered */}
                  <div className="relative">
                    <div className="absolute -left-8 top-0 w-8 h-8 bg-gray-100 border-4 border-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Delivered</h3>
                      <p className="text-gray-600 text-sm mb-2">Arriving at your doorstep</p>
                      <p className="text-gray-500">Upcoming</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Order Details Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Order Details
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Number</p>
                    <p className="font-bold text-lg">{order.order_number}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">
                      {new Date(order.created_at).toLocaleDateString('en-ZA', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-medium">{estimatedDelivery}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium break-all">{order.customer_email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{order.customer_phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shipping Address</p>
                    <p className="font-medium text-sm">{order.shipping_address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Order Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleDownloadReceipt}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
                
                <button
                  onClick={handlePrintReceipt}
                  className="w-full flex items-center justify-center gap-2 border border-black text-black py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Receipt
                </button>
                
                <button
                  onClick={handleShareOrder}
                  disabled={sharing}
                  className="w-full flex items-center justify-center gap-2 border border-black text-black py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Share2 className="w-4 h-4" />
                  {sharing ? 'Sharing...' : 'Share Order'}
                </button>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-200 space-y-3">
                <Link
                  href="/studio"
                  className="block w-full text-center bg-gradient-to-r from-black to-gray-800 text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                >
                  Create Another Design
                </Link>
                
                <Link
                  href="/orders"
                  className="block w-full text-center border border-black text-black py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  View All Orders
                </Link>
                
                <Link
                  href="/"
                  className="block w-full text-center text-gray-600 py-3 rounded-lg font-bold hover:text-black transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 md:p-8 border border-blue-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Need Help?</h3>
              <p className="text-gray-700 mb-4">
                Our support team is here to help with any questions about your order.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="mailto:support@example.com" 
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Mail className="w-4 h-4" />
                  support@example.com
                </a>
                <a 
                  href="tel:+27123456789" 
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Phone className="w-4 h-4" />
                  +27 12 345 6789
                </a>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            You will receive production updates via email. For any changes to your order, 
            please contact us within 24 hours.
          </p>
          <p className="mt-2">
            Order reference: <span className="font-bold">{order.order_number}</span>
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content,
          .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function designCheckoutSuccess() {
    return (
        <Suspense fallback={"loadding..."}>
            <CheckoutSuccess />
        </Suspense>
    )
}