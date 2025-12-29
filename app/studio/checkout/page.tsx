"use client";

import { useState, useEffect } from 'react';
import { Shirt, ArrowLeft, Check, Image as ImageIcon, Type, Loader2 } from 'lucide-react';
import useDesignStore from '@/app/lib/useDesignStore';
import Link from 'next/link';
import { useUser } from '@/app/lib/user';

export default function StudioCheckout() {
  const { cart, getCartItemCount, getCartTotal, updateCartItemQuantity, removeFromCart } = useDesignStore();
  const { user } = useUser();

  const userId = user?.id;

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const baseDeliveryFee = 90; // Fixed delivery fee when delivery is selected

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    deliveryMethod: 'delivery' as 'delivery' | 'pickup',
    agreeToTerms: false,
  });

  // Pre-fill form with user data when user becomes available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || prev.fullName || '',
        email: user.email || prev.email || '',
        phone: user.user_metadata?.phone || prev.phone || '',
      }));
    }
  }, [user]);

  const deliveryFee = formData.deliveryMethod === 'delivery' ? baseDeliveryFee : 0;
  const totalAmount = getCartTotal() + deliveryFee;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-()]+$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Please enter a valid phone number';
    
    if (formData.deliveryMethod === 'delivery' && !formData.address.trim()) {
      newErrors.address = 'Shipping address is required for delivery';
    }
    
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked !== undefined ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setProcessing(true);
    setErrors({});

    try {
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const cartItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        front: item.front,
        back: item.back,
        elements: item.elements,
        tshirt_color: item.tshirtColor,
        price: parseFloat(item.price.toFixed(2)),
        quantity: item.quantity,
        total_price: parseFloat((item.price * item.quantity).toFixed(2)),
      }));

      const response = await fetch('/api/orders/yoco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(totalAmount.toFixed(2)),
          email: formData.email.trim(),
          orderId,
          customer_name: formData.fullName.trim(),
          phone: formData.phone.trim(),
          cart_items: cartItems,
          shipping_address: formData.deliveryMethod === 'delivery' ? formData.address.trim() : 'Pickup - Johannesburg CBD',
          shipping_method: formData.deliveryMethod,
          shipping_cost: deliveryFee,
          pickup_location: formData.deliveryMethod === 'pickup' ? 'Johannesburg CBD' : '',
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Payment failed to initialize');

      localStorage.setItem('lastOrder', JSON.stringify({
        order_number: orderId,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: formData.deliveryMethod === 'delivery' ? formData.address : 'Pickup - Johannesburg CBD',
        shipping_method: formData.deliveryMethod,
        pickup_location: formData.deliveryMethod === 'pickup' ? 'Johannesburg CBD' : '',
        items: cartItems,
        subtotal: getCartTotal(),
        shipping_cost: deliveryFee,
        total: totalAmount,
        created_at: new Date().toISOString(),
        status: 'pending',
      }));
      
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('No redirect URL received from payment gateway');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to process payment. Please try again.'
      });
      setProcessing(false);
    }
  };

  if (getCartItemCount() === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shirt className="w-20 h-20 text-gray-400" />
          </div>
          <h1 className="text-3xl font-black mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            You haven't added any custom t-shirts to your cart yet.
          </p>
          <div className="space-y-4">
            <Link 
              href="/studio" 
              className="inline-block bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors text-lg"
            >
              Back to Designer
            </Link>
            <p className="text-gray-500 text-sm">
              Need help? <a href="/contact" className="text-blue-600 hover:underline">Contact our support team</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/studio" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
          Back to Designer
        </Link>

        <h1 className="text-3xl md:text-4xl font-black mb-8 md:mb-12 text-center">Checkout - Custom T-Shirts</h1>

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">{errors.submit}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 order-2 lg:order-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Order Summary</h2>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'}
              </span>
            </div>
            
            <div className="space-y-8">
              {cart.map((item) => {
                const totalElements = item.elements.front.length + item.elements.back.length;
                const capitalizedColor = item.tshirtColor.charAt(0).toUpperCase() + item.tshirtColor.slice(1);

                return (
                  <div key={item.id} className="pb-6 border-b border-gray-200 last:border-0">
                    <div className="flex flex-col md:flex-row gap-6 mb-4">
                      {/* Previews - Front & Back */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-96 flex-shrink-0">
                        {/* Front */}
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2 text-center">Front</p>
                          <div className="h-48 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                            <img 
                              src={item.front} 
                              alt="Front design" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          {item.elements.front.length === 0 && (
                            <p className="text-center text-sm text-gray-500 mt-2">Blank front</p>
                          )}
                        </div>

                        {/* Back */}
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2 text-center">Back</p>
                          <div className="h-48 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                            <img 
                              src={item.back} 
                              alt="Back design" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          {item.elements.back.length === 0 && (
                            <p className="text-center text-sm text-gray-500 mt-2">Blank back</p>
                          )}
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-3">
                          <h3 className="font-bold text-lg md:text-xl truncate">{item.name}</h3>
                          <p className="text-xl md:text-2xl font-black whitespace-nowrap">
                            R{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Color:</span> {capitalizedColor}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Design elements:</span> {totalElements} ({item.elements.front.length} front, {item.elements.back.length} back)
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                            <button
                              onClick={() => {
                                if (!userId) return;
                                if (item.quantity > 1) {
                                  updateCartItemQuantity(item.id, userId, item.quantity - 1);
                                } else {
                                  removeFromCart(item.id, userId);
                                }
                              }}
                              disabled={!userId}
                              className="px-3 py-2 hover:bg-gray-100 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="px-4 py-2 border-x border-gray-300 text-sm font-bold min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                if (!userId) return;
                                updateCartItemQuantity(item.id, userId, item.quantity + 1);
                              }}
                              disabled={!userId}
                              className="px-3 py-2 hover:bg-gray-100 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            onClick={() => {
                              if (!userId) return;
                              if (confirm('Remove this item from your cart?')) {
                                removeFromCart(item.id, userId);
                              }
                            }}
                            disabled={!userId}
                            className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Elements List */}
                    {totalElements > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 mt-4 space-y-6">
                        {item.elements.front.length > 0 && (
                          <div>
                            <h4 className="text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
                              Front Elements ({item.elements.front.length})
                            </h4>
                            <ul className="space-y-3">
                              {item.elements.front.map((element, idx) => (
                                <li key={element.id} className="flex items-start gap-3 text-sm">
                                  {element.type === 'image' ? (
                                    <>
                                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                        <ImageIcon className="w-4 h-4 text-blue-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="font-medium text-gray-800">Image {idx + 1}</span>
                                          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                                            {Math.round(element.width)}×{Math.round(element.height)}px
                                          </span>
                                        </div>
                                        {element.src && (
                                          <p className="text-xs text-gray-500 truncate mt-1">
                                            {element.src.split('/').pop()}
                                          </p>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                                        <Type className="w-4 h-4 text-purple-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                          <span className="font-medium text-gray-800">Text Element</span>
                                          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                                            {element.fontSize}px
                                          </span>
                                          <div 
                                            className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" 
                                            style={{ backgroundColor: element.color }}
                                            title={element.color}
                                          />
                                        </div>
                                        <p className="text-gray-600 truncate">"{element.text}"</p>
                                        {element.fontFamily && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Font: {element.fontFamily}
                                          </p>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {item.elements.back.length > 0 && (
                          <div>
                            <h4 className="text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
                              Back Elements ({item.elements.back.length})
                            </h4>
                            <ul className="space-y-3">
                              {item.elements.back.map((element, idx) => (
                                <li key={element.id} className="flex items-start gap-3 text-sm">
                                  {element.type === 'image' ? (
                                    <>
                                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                        <ImageIcon className="w-4 h-4 text-blue-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="font-medium text-gray-800">Image {idx + 1}</span>
                                          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                                            {Math.round(element.width)}×{Math.round(element.height)}px
                                          </span>
                                        </div>
                                        {element.src && (
                                          <p className="text-xs text-gray-500 truncate mt-1">
                                            {element.src.split('/').pop()}
                                          </p>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                                        <Type className="w-4 h-4 text-purple-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                          <span className="font-medium text-gray-800">Text Element</span>
                                          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                                            {element.fontSize}px
                                          </span>
                                          <div 
                                            className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" 
                                            style={{ backgroundColor: element.color }}
                                            title={element.color}
                                          />
                                        </div>
                                        <p className="text-gray-600 truncate">"{element.text}"</p>
                                        {element.fontFamily && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Font: {element.fontFamily}
                                          </p>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Order Totals */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({getCartItemCount()} items)</span>
                  <span className="font-medium">R{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{formData.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}</span>
                  <span className="font-medium">
                    {formData.deliveryMethod === 'delivery' ? `R${baseDeliveryFee.toFixed(2)}` : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between text-xl md:text-2xl font-black pt-4 border-t border-gray-300">
                  <span>Total</span>
                  <span>R{totalAmount.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 pt-2">
                  All prices include VAT where applicable
                </p>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 order-1 lg:order-2">
            <h2 className="text-xl md:text-2xl font-bold mb-6">Shipping & Payment Details</h2>
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <div>
                <label className="block font-bold mb-2 text-gray-800">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                    errors.fullName ? 'border-red-500 ring-red-200' : 'border-gray-300'
                  }`} 
                  placeholder="John Doe" 
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-bold mb-2 text-gray-800">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    readOnly={!!user}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                      errors.email ? 'border-red-500 ring-red-200' : 'border-gray-300'
                    } ${!!user ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                    placeholder="john@example.com" 
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                  {!!user && (
                    <p className="mt-1 text-sm text-gray-600">Using your account email</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold mb-2 text-gray-800">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    required 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                      errors.phone ? 'border-red-500 ring-red-200' : 'border-gray-300'
                    }`} 
                    placeholder="+27 12 345 6789" 
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Delivery Method Selection */}
              <div>
                <label className="block font-bold mb-3 text-gray-800">
                  Delivery Method <span className="text-red-500">*</span>
                </label>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-black ${formData.deliveryMethod === 'delivery' ? 'border-black bg-gray-50' : 'border-gray-300'}">
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="delivery"
                        checked={formData.deliveryMethod === 'delivery'}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-black focus:ring-black"
                      />
                      <div>
                        <p className="font-bold">Door-to-Door Delivery</p>
                        <p className="text-sm text-gray-600">Nationwide courier</p>
                      </div>
                    </div>
                    <span className="font-bold">R{baseDeliveryFee.toFixed(2)}</span>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-black ${formData.deliveryMethod === 'pickup' ? 'border-black bg-green-50' : 'border-gray-300'}">
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="pickup"
                        checked={formData.deliveryMethod === 'pickup'}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-black focus:ring-black"
                      />
                      <div>
                        <p className="font-bold text-green-700">Free Pickup</p>
                        <p className="text-sm text-gray-600">Collect in Johannesburg CBD</p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600">Free</span>
                  </label>
                </div>
              </div>

              {/* Conditional Address or Pickup Info */}
              {formData.deliveryMethod === 'delivery' ? (
                <div>
                  <label className="block font-bold mb-2 text-gray-800">
                    Shipping Address <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={4} 
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none ${
                      errors.address ? 'border-red-500 ring-red-200' : 'border-gray-300'
                    }`} 
                    placeholder="Street Address, City, Province, Postal Code" 
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Please provide your complete shipping address for delivery
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-3 text-green-800">Pickup Location</h3>
                  <p className="font-medium text-gray-800">Johannesburg CBD</p>
                  <p className="text-sm text-gray-700 mt-3">
                    Save on shipping! We'll send the exact pickup address, map link, and collection instructions to your email once your order is ready (typically 3–5 business days).
                  </p>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="/terms" className="text-blue-600 hover:underline font-medium">
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline font-medium">
                      Privacy Policy
                    </a>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
                )}
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-bold mb-3 flex items-center gap-2 text-blue-800">
                  Secure Payment via Yoco
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Your payment is processed securely through Yoco. We never store your payment details.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-blue-200 gap-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-gray-800">Total Amount:</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl md:text-3xl font-black text-gray-900">
                      R{totalAmount.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-500">ZAR - South African Rand</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing || getCartItemCount() === 0}
                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Your Order...
                  </>
                ) : (
                  <>
                    Proceed to Secure Payment
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-center text-sm text-gray-500 mb-4">
                  Your payment is secure and encrypted
                </p>
                <div className="flex justify-center gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">SSL Secure</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">PCI DSS</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">3D Secure</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center pt-4 border-t border-gray-200">
                Need help?{' '}
                <a href="/contact" className="text-blue-600 hover:underline font-medium">
                  Contact our support team
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}