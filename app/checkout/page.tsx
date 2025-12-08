"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/lib/cartStore";
import { ShoppingBag, CreditCard, Truck, Lock, MapPin, Package } from "lucide-react"; // Added MapPin and Package icons

// Define the pickup location details
const PICKUP_ADDRESS = {
  name: "The Village CBD Pickup Point",
  address: "123 Main Street, Unit 5",
  city: "Johannesburg",
  postalCode: "2000",
  province: "Gauteng",
};

// Define the available South African provinces
const provinces = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Free State", "Limpopo", "Mpumalanga", "Northern Cape", "North West"
];


export default function CheckoutPage() {
  const router = useRouter();
  // Ensure the CartItem structure is updated from cartStore, assuming it includes the new size/material fields now
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 1. New State for Delivery Option
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>('delivery');

  const subtotal = getTotalPrice();
  // 2. Shipping calculation depends on delivery option
  const shipping = deliveryOption === 'delivery' && subtotal < 500 ? 75 : 0;
  const total = subtotal + shipping;

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Basic validation check if Delivery is selected but no required fields are filled
    const requiredDeliveryFields = ['email', 'firstName', 'lastName', 'address', 'city', 'province', 'postalCode', 'phone'];
    const isDeliveryFormIncomplete = deliveryOption === 'delivery' && requiredDeliveryFields.some(field => !formData[field as keyof typeof formData]);
    
    if (isDeliveryFormIncomplete) {
        alert("Please fill out all required shipping fields.");
        setIsProcessing(false);
        return;
    }


    // TODO: Integrate actual payment/order API call here
    await new Promise((resolve) => setTimeout(resolve, 2000));

    clearCart();
    router.push("/order-success");
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

              {/* 3. Delivery Option Selector */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery Options</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Delivery Option */}
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
                    
                    {/* Pickup Option */}
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

              {/* 4. Conditional Content based on deliveryOption */}
              {deliveryOption === 'delivery' ? (
                // Shipping Address Form (Original Content)
                <>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h2>
                        <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                required
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                            </div>
                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                required
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                            type="text"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="Street address"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                name="city"
                                required
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                            </div>
                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                            <select
                                name="province"
                                required
                                value={formData.province}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                            >
                                <option value="">Select</option>
                                {provinces.map(p => (
                                    <option key={p} value={p.toLowerCase().replace(/\s/g, '-')}>{p}</option>
                                ))}
                            </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                            <input
                                type="text"
                                name="postalCode"
                                required
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                            </div>
                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="+27"
                            />
                            </div>
                        </div>
                        </div>
                    </div>
                </>
              ) : (
                // Pickup Address Display
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <MapPin className="w-5 h-5 text-black" />
                        <h2 className="text-lg font-bold text-gray-900">Pickup Location</h2>
                    </div>
                    <p className="text-gray-800 font-semibold">{PICKUP_ADDRESS.name}</p>
                    <p className="text-gray-600 mt-1">{PICKUP_ADDRESS.address}</p>
                    <p className="text-gray-600">{PICKUP_ADDRESS.city}, {PICKUP_ADDRESS.postalCode}, {PICKUP_ADDRESS.province}</p>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Contact Email</h3>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="Email for confirmation & updates"
                        />
                    </div>
                    {/* You might want a name/phone field for pickup too, but I'll leave that optional */}
                </div>
              )}
              
              {/* Payment Information - Uncommented and simplified for the scope */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-bold text-gray-900">Payment Information</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                        </label>
                        <input
                            type="text"
                            name="cardNumber"
                            required
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Expiry Date
                            </label>
                            <input
                                type="text"
                                name="expiryDate"
                                required
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="MM/YY"
                                maxLength={5}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                CVV
                            </label>
                            <input
                                type="text"
                                name="cvv"
                                required
                                value={formData.cvv}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="123"
                                maxLength={3}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
                        <Lock className="w-4 h-4" />
                        <span>Your payment information is secure and encrypted</span>
                    </div>
                </div>
            </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-black text-white font-bold rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : `Pay R${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => {
                    // Extracting price safely for display
                    const priceMatch = item.price.match(/[\d.,]+/);
                    const itemPrice = priceMatch ? parseFloat(priceMatch[0].replace(',', '')) : 0;

                    return (
                        // It is better to use the unique cartItemId as the key here if possible, 
                        // but sticking to item.id for now since the CartStore update wasn't applied here yet
                        <div key={item.id} className="flex gap-3">
                            <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                                <Image
                                    src={item.imageUrl}
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
                                {/* Display selected options */}
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
                  <span className="text-gray-600">{deliveryOption === 'delivery' ? 'Shipping' : 'Pickup Fee'}</span>
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