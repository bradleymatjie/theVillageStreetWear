"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useCartStore } from "@/app/lib/cartStore";
import { ShoppingBag, Truck, MapPin, LockIcon } from "lucide-react";
import { useUser } from "../lib/user";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

type PickupDetails = {
  brandName: string;
  address: string;
  city: string;
  province: string;
  country?: string | null;
};

const provinces = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Free State", "Limpopo", "Mpumalanga", "Northern Cape", "North West"
];

function CheckoutPage() {
  const { user } = useUser();
  const { items, hasHydrated } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>('delivery');
  const [orderId, setOrderId] = useState<string>("");
  const [pickupDetails, setPickupDetails] = useState<PickupDetails | null>(null);
  const [selectedBrandKey, setSelectedBrandKey] = useState<string>("");

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

  const checkoutGroups = useMemo(() => {
    const brandGroups = items.reduce((groups, item: any) => {
      const brandId = item.brand_id || item.brandId || item.brand?.id || "";
      const brandName = item.brand_name || item.brand?.name || "The Village";
      const key = brandId || `unknown-${brandName}`;
      const existing = groups.get(key);

      if (existing) {
        existing.items.push(item);
      } else {
        groups.set(key, {
          key,
          brandId,
          brandName,
          items: [item],
        });
      }

      return groups;
    }, new Map<string, { key: string; brandId: string; brandName: string; items: typeof items }>());

    return Array.from(brandGroups.values());
  }, [items]);
  const selectedGroup =
    checkoutGroups.find((group) => group.key === selectedBrandKey) ||
    checkoutGroups[0];
  const checkoutItems = selectedGroup?.items || [];
  const selectedBrandId = selectedGroup?.brandId || "";
  const pickupLocation = pickupDetails
    ? [
        pickupDetails.address,
        pickupDetails.city,
        pickupDetails.province,
        pickupDetails.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  useEffect(() => {
    if (!hasHydrated || checkoutGroups.length === 0) {
      return;
    }

    if (
      !selectedBrandKey ||
      !checkoutGroups.some((group) => group.key === selectedBrandKey)
    ) {
      setSelectedBrandKey(checkoutGroups[0].key);
    }
  }, [hasHydrated, checkoutGroups, selectedBrandKey]);

  useEffect(() => {
    async function loadPickupDetails() {
      if (!hasHydrated || !selectedBrandId) {
        setPickupDetails(null);
        setDeliveryOption("delivery");
        return;
      }

      const { data, error } = await supabase
        .from("brands")
        .select("name, street_address, location_city, location_province, location_country")
        .eq("id", selectedBrandId)
        .maybeSingle();

      if (
        error ||
        !data?.street_address ||
        !data?.location_city ||
        !data?.location_province
      ) {
        setPickupDetails(null);
        setDeliveryOption("delivery");
        return;
      }

      setPickupDetails({
        brandName: data.name,
        address: data.street_address,
        city: data.location_city,
        province: data.location_province,
        country: data.location_country,
      });
    }

    loadPickupDetails();
  }, [hasHydrated, selectedBrandId]);

  const subtotal = checkoutItems.reduce((total, item) => {
    const priceMatch = item.price.match(/[\d.,]+/);
    const itemPrice = priceMatch
      ? parseFloat(priceMatch[0].replace(/,/g, ""))
      : 0;

    return total + itemPrice * item.quantity;
  }, 0);
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
    const cartItems = checkoutItems.map((item: any) => {
      const priceMatch = item.price.match(/[\d.,]+/);
      const itemPrice = priceMatch
        ? parseFloat(priceMatch[0].replace(/,/g, ""))
        : 0;

      return {
        product_id: item.id,
        brand_id: item.brand_id || item.brandId || item.brand?.id,
        product_name: item.name,
        product_image: item.imageurl || "/noImage.jpg",
        size: item.selectedSize || null,
        material: item.selectedMaterial || null,
        quantity: item.quantity,
        unit_price: itemPrice,
        total_price: itemPrice * item.quantity,
      };
    });

    const brandIds = Array.from(
      new Set(cartItems.map((item) => item.brand_id).filter(Boolean))
    );

    if (brandIds.length !== 1) {
      toast.error(
        "Choose a brand order to check out."
      );
      setIsProcessing(false);
      return;
    }

    let shipping_method = deliveryOption;
    let shipping_address = "";
    let pickup_location = "";

    if (deliveryOption === "delivery") {
      shipping_address = `${formData.address}, ${formData.city}, ${formData.province}, ${formData.postalCode}`;
    } else {
      pickup_location = pickupLocation;
    }

    const requestBody = {
      order_number: orderId,
      brand_id: brandIds[0],
      customer_id: user?.id,
      customer_name: formData.fullName,
      customer_email: formData.email,
      customer_phone: formData.phone,
      subtotal,
      delivery_fee: shipping,
      total_amount: total,
      payment_status: "pending",
      order_status: "pending_payment",
      cartItems,
      shipping_method,
      shipping_address,
      pickup_location,
    };

    const res = await fetch("/api/yoco/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Payment error");
      setIsProcessing(false);
      return;
    }

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

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading cart...
      </div>
    );
  }

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
              {checkoutGroups.length > 1 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    Checkout by brand
                  </h2>
                  <p className="mb-4 text-sm text-gray-500">
                    Complete one brand order at a time. Each brand can have its own delivery or pickup options.
                  </p>
                  <div className="space-y-3">
                    {checkoutGroups.map((group) => {
                      const groupSubtotal = group.items.reduce((sum, item) => {
                        const priceMatch = item.price.match(/[\d.,]+/);
                        const itemPrice = priceMatch
                          ? parseFloat(priceMatch[0].replace(/,/g, ""))
                          : 0;

                        return sum + itemPrice * item.quantity;
                      }, 0);

                      return (
                        <button
                          key={group.key}
                          type="button"
                          onClick={() => {
                            setSelectedBrandKey(group.key);
                            setDeliveryOption("delivery");
                          }}
                          className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition ${
                            selectedGroup?.key === group.key
                              ? "border-black bg-gray-50"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <span>
                            <span className="block font-bold text-gray-900">
                              {group.brandName}
                            </span>
                            <span className="mt-1 block text-sm text-gray-500">
                              {group.items.length} item{group.items.length === 1 ? "" : "s"}
                            </span>
                          </span>
                          <span className="font-bold text-gray-900">
                            R{groupSubtotal.toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery Method</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                      deliveryOption === "delivery"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="delivery"
                      checked={deliveryOption === "delivery"}
                      onChange={() => setDeliveryOption("delivery")}
                      className="mt-1"
                    />
                    <span>
                      <span className="flex items-center gap-2 font-bold text-gray-900">
                        <Truck className="h-4 w-4" />
                        Delivery
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        Ship to your address.
                      </span>
                    </span>
                  </label>

                  {pickupDetails && (
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                        deliveryOption === "pickup"
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryOption"
                        value="pickup"
                        checked={deliveryOption === "pickup"}
                        onChange={() => setDeliveryOption("pickup")}
                        className="mt-1"
                      />
                      <span>
                        <span className="flex items-center gap-2 font-bold text-gray-900">
                          <MapPin className="h-4 w-4" />
                          Pick up
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          Collect from {pickupDetails.brandName}. Delivery fee R0.
                        </span>
                      </span>
                    </label>
                  )}
                </div>

                {deliveryOption === "pickup" && pickupDetails && (
                  <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    <p className="font-bold text-gray-900">Pickup address</p>
                    <p className="mt-1">{pickupLocation}</p>
                  </div>
                )}
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
                        className="w-full px-4 py-2 text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"                      />
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
                          className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:ring-2 focus:ring-black focus:border-transparent"                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                        <select
                          name="province"
                          required
                          value={formData.province}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:ring-2 focus:ring-black focus:border-transparent"                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              {user ? <button
                type="submit"
                disabled={isProcessing}
                // disabled
                className="w-full py-4 bg-black text-white font-bold rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LockIcon />
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  `Pay R${total.toFixed(2)}`
                )}
              </button>:<Link
              href={"/login"}
                className="w-full py-4 bg-black text-white font-bold rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LockIcon />
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  `LOGIN TO CONTINUE`
                )}
              </Link>}

              <p className="text-xs text-gray-500 text-center">
                By completing your purchase, you agree to our Terms of Service
              </p>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Order Summary</h2>
              {selectedGroup && (
                <p className="mb-4 text-sm text-gray-500">
                  {selectedGroup.brandName} order
                </p>
              )}
              <div className="text-xs text-gray-500 mb-4">
                Order ID: {orderId}
              </div>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {checkoutItems.map((item) => {
                  const priceMatch = item.price.match(/[\d.,]+/);
                  const itemPrice = priceMatch ? parseFloat(priceMatch[0].replace(',', '')) : 0;

                  return (
                    <div key={`${item.id}-${item.selectedSize}-${item.selectedMaterial}`} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={item.imageurl || "/noImage.jpg"}
                          alt={item.name}                          className="h-full w-full object-cover"                        />
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

export default function Page() {
  return (
    <Suspense fallback="loading...">
      <CheckoutPage />
    </Suspense>
  )
}
