// app/success/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  ShoppingBag,
  MapPin,
  Clock,
} from "lucide-react";

/* ---------------- TYPES ---------------- */

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageurl: string;
  selectedSize?: string;
  selectedMaterial?: string;
}

interface OrderDetails {
  orderId: string;
  amount: number;
  email: string;
  phone: string;
  customer_name: string;
  shipping_method: "delivery" | "pickup";
  shipping_address?: string;
  pickup_location?: string;
  cartItems: CartItem[];
  timestamp: Date;
}

/* ---------------- COMPONENT ---------------- */

function SuccessContent() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!searchParams) return;

    try {
      const cartItemsParam = searchParams.get("cartItems");

      const cartItems: CartItem[] = cartItemsParam
        ? JSON.parse(cartItemsParam)
        : [];

        debugger;

      setOrderDetails({
        orderId: searchParams.get("orderId") || "",
        amount: Number(searchParams.get("amount") || 0),
        email: decodeURIComponent(searchParams.get("email") || ""),
        phone: decodeURIComponent(searchParams.get("phone") || ""),
        customer_name: decodeURIComponent(
          searchParams.get("customer_name") || ""
        ),
        shipping_method: (searchParams.get("shipping_method") ||
          "delivery") as "delivery" | "pickup",
        shipping_address: decodeURIComponent(
          searchParams.get("shipping_address") || ""
        ),
        pickup_location: decodeURIComponent(
          searchParams.get("pickup_location") || ""
        ),
        cartItems,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error("Failed to parse order details", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  /* ---------------- HELPERS ---------------- */

  const subtotal =
    orderDetails?.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ) ?? 0;

  const shipping =
    orderDetails?.shipping_method === "pickup"
      ? 0
      : subtotal < 500
      ? 75
      : 0;

  const total = subtotal + shipping;

  /* ---------------- STATES ---------------- */

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-black rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading order confirmation…</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Clock className="mx-auto mb-4 text-gray-400" size={48} />
          <h2 className="text-xl font-bold mb-2">Order Processing</h2>
          <p className="text-gray-600 mb-6">
            Your payment is being processed. Please refresh in a moment.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-black text-white rounded-lg"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  console.log(orderDetails);
  debugger;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h1 className="text-3xl font-bold">Order Confirmed</h1>
          <p className="text-gray-600 mt-2">
            Thank you, {orderDetails.customer_name.split(" ")[0]}!
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Order #{orderDetails.orderId}
          </p>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Package size={18} /> Order Items
          </h2>

          <div className="space-y-4">
            {orderDetails.cartItems.map((item) => (
              <div
                key={`${item.id}-${item.selectedSize}`}
                className="flex gap-4"
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <Image
                    src={item?.imageurl||"/noImage.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  {item.selectedSize && item.selectedMaterial && (
                    <p className="text-sm text-gray-500">
                      {item.selectedSize} / {item.selectedMaterial}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="font-semibold">
                  R{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t mt-6 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>R{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>
                {orderDetails.shipping_method === "delivery"
                  ? "Shipping"
                  : "Pickup"}
              </span>
              <span>{shipping === 0 ? "Free" : `R${shipping}`}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>R{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/products"
            className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white rounded-lg"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 border rounded-lg"
          >
            <Home size={18} />
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SUSPENSE ---------------- */

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SuccessContent />
    </Suspense>
  );
}
