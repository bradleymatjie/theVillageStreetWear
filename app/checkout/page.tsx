"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/app/lib/cartStore";
import { ShoppingBag, Truck, MapPin, Package } from "lucide-react";
import { useUser } from "../lib/user";
import { toast } from "sonner";


const PICKUP_ADDRESS = {
  name: "The Village CBD Pickup Point",
  address: "Joburg Central",
  city: "Johannesburg",
  postalCode: "2000",
  province: "Gauteng",
};

const provinces = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Free State", "Limpopo", "Mpumalanga", "Northern Cape", "North West"
];

export default function CheckoutPage() {
  const { user } = useUser();
  const { items, getTotalPrice } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>('delivery');
  const [orderId, setOrderId] = useState<string>("");

  // Generate order ID on component mount
  useEffect(() => {
    const generateOrderId = () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      return `ORD-${timestamp}-${random}`;
    };
    setOrderId(generateOrderId());
  }, []);

  // Initialize form data with user info
  const [formData, setFormData] = useState({
    email: user?.email || "",
    fullName: user?.user_metadata?.full_name || "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        fullName: user.user_metadata?.full_name || prev.fullName
      }));
    }
  }, [user]);

  const subtotal = getTotalPrice();
  const shipping = deliveryOption === 'delivery' && subtotal < 500 ? 75 : 0;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Prepare cart items for backend
      const cartItems = items.map(item => {
        const priceMatch = item.price.match(/[\d.,]+/);
        const itemPrice = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;
        
        return {
          id: item.id,
          name: item.name,
          price: itemPrice,
          quantity: item.quantity,
          imageurl: item.imageurl || "/noImage.jpg",
          selectedSize: item.selectedSize || null,
          selectedMaterial: item.selectedMaterial || null,
        };
      });

      // Prepare shipping info based on delivery option
      let shipping_method = deliveryOption;
      let shipping_address = "";
      let pickup_location = "";
      
      if (deliveryOption === 'delivery') {
        shipping_address = `${formData.address}, ${formData.city}, ${formData.province}, ${formData.postalCode}`;
      } else {
        pickup_location = PICKUP_ADDRESS.name;
      }

      const requestBody = {
        amount: total,
        email: formData.email,
        orderId: orderId,
        customer_name: formData.fullName,
        phone: formData.phone,
        cart_items: cartItems,
        shipping_method: shipping_method,
        shipping_address: shipping_address,
        pickup_location: pickup_location,
      };

      console.log("Sending request:", requestBody);

      const res = await fetch("/api/yoco/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Backend error:", data);
        toast.error(data.error || "Payment error");
        setIsProcessing(false);
        return;
      }

      // Redirect to Yoco payment page
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast.warning("No redirect URL received from server");
        setIsProcessing(false);
      }

    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to checkout</p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-2xl font-black text-gray-900">
            The Village
          </Link>
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
            <Link href="/products" className="hover:text-gray-900">Products</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Delivery Options */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery Options</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('delivery')}
                    className={`flex flex-col items-start p-4 border rounded-lg transition-colors ${
                      deliveryOption === 'delivery' ? 'border-black ring-2 ring-black bg-gray-50' : 'border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <Truck className="w-5 h-5 mb-2 text-black" />
                    <span className="font-semibold text-gray-900">Ship to Address</span>
                    <span className="text-xs text-gray-600 mt-1">
                      {shipping === 0 ? "Free shipping" : `R${shipping.toFixed(2)} standard`}
                    </span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('pickup')}
                    className={`flex flex-col items-start p-4 border rounded-lg transition-colors ${
                      deliveryOption === 'pickup' ? 'border-black ring-2 ring-black bg-gray-50' : 'border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <Package className="w-5 h-5 mb-2 text-black" />
                    <span className="font-semibold text-gray-900">Free Pickup</span>
                    <span className="text-xs text-gray-600 mt-1">Available in Johannesburg CBD</span>
                  </button>
                </div>
              </div>

              {/* Contact Information - Always Required */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="+27 12 345 6789"
                    />
                  </div>
                </div>
              </div>

              {/* Conditional Shipping Address */}
              {deliveryOption === 'delivery' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Street address, apartment, suite, etc."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                        <select
                          name="province"
                          required
                          value={formData.province}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                          <option value="">Select Province</option>
                          {provinces.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Postal code"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pickup Info Display */}
              {deliveryOption === 'pickup' && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-black" />
                    <h2 className="text-lg font-bold text-gray-900">Pickup Location</h2>
                  </div>
                  <p className="text-gray-800 font-semibold">{PICKUP_ADDRESS.name}</p>
                  <p className="text-gray-600 mt-1">{PICKUP_ADDRESS.address}</p>
                  <p className="text-gray-600">{PICKUP_ADDRESS.city}, {PICKUP_ADDRESS.postalCode}, {PICKUP_ADDRESS.province}</p>
                </div>
              )}

              {/* Payment Button */}
              <button
                // type="submit"
                // disabled={isProcessing}
                disabled
                className="w-full py-4 bg-black text-white font-bold rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  `Pay R${total.toFixed(2)}`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By completing your purchase, you agree to our Terms of Service
              </p>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="text-xs text-gray-500 mb-4">
                Order ID: {orderId}
              </div>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {items.map((item) => {
                  const priceMatch = item.price.match(/[\d.,]+/);
                  const itemPrice = priceMatch ? parseFloat(priceMatch[0].replace(',', '')) : 0;

                  return (
                    <div key={`${item.id}-${item.selectedSize}-${item.selectedMaterial}`} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                        <Image
                          src={item.imageurl || "/noImage.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        {item.selectedSize && item.selectedMaterial && (
                          <p className="text-xs text-gray-500">
                            {item.selectedSize} / {item.selectedMaterial}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        R{(itemPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {deliveryOption === 'delivery' ? 'Shipping' : 'Pickup'}
                  </span>
                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? "Free" : `R${shipping.toFixed(2)}`}
                  </span>
                </div>
                {deliveryOption === 'delivery' && subtotal < 500 && (
                  <p className="text-xs text-gray-500">
                    Add R{(500 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>R{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}