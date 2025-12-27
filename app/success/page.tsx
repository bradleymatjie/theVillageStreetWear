"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  CheckCircle, 
  Package, 
  Home, 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Truck, 
  Mail, 
  CheckCheck,
  Phone,
  User
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

/* ---------------- MAIN CONTENT COMPONENT ---------------- */

function SuccessContent() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!searchParams) return;

    try {
      const cartItemsParam = searchParams.get("cartItems");
      const cartItems: CartItem[] = cartItemsParam ? JSON.parse(cartItemsParam) : [];

      setOrderDetails({
        orderId: searchParams.get("orderId") || "",
        amount: Number(searchParams.get("amount") || 0),
        email: decodeURIComponent(searchParams.get("email") || ""),
        phone: decodeURIComponent(searchParams.get("phone") || ""),
        customer_name: decodeURIComponent(searchParams.get("customer_name") || ""),
        shipping_method: (searchParams.get("shipping_method") || "delivery") as "delivery" | "pickup",
        shipping_address: decodeURIComponent(searchParams.get("shipping_address") || ""),
        pickup_location: decodeURIComponent(searchParams.get("pickup_location") || ""),
        cartItems,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error("Failed to parse order details", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  /* ---------------- CALCULATIONS ---------------- */

  const subtotal = orderDetails?.cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  ) ?? 0;

  const shipping = orderDetails?.shipping_method === "pickup" ? 0 : subtotal < 500 ? 75 : 0;
  const total = subtotal + shipping;
  const firstName = orderDetails?.customer_name.split(" ")[0] || "";
  const date = orderDetails?.timestamp.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }) || "";

  /* ---------------- TIMELINE STEPS ---------------- */

  const steps = orderDetails ? [
    {
      icon: <CheckCheck className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />,
      title: "Order Placed",
      description: "Now",
      active: true,
    },
    {
      icon: <Package className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />,
      title: "Processing",
      description: "Soon",
      active: false,
    },
    {
      icon: orderDetails.shipping_method === "delivery" ? 
        <Truck className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" /> : 
        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />,
      title: orderDetails.shipping_method === "delivery" ? "Shipped" : "Ready for Pickup",
      description: orderDetails.shipping_method === "delivery" ? "3-4 Days" : "2-3 days",
      active: false,
    },
    {
      icon: <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />,
      title: orderDetails.shipping_method === "delivery" ? "Delivered" : "Picked Up",
      description: orderDetails.shipping_method === "delivery" ? "4-5 Days" : "Today",
      active: false,
    },
  ] : [];

  /* ---------------- LOADING STATE ---------------- */

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading order confirmation…</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Clock className="mx-auto mb-4 text-muted-foreground w-12 h-12" />
            <CardTitle className="text-xl sm:text-2xl">Order Processing</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Your payment is being processed. Please refresh in a moment.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="w-full sm:w-auto">
              <a href="/">Back to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------------- MAIN RENDER ---------------- */

  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 md:py-8 lg:py-12 px-3 sm:px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 ring-4 ring-green-50">
            <CheckCircle className="text-green-600 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Order Confirmed!
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-2">
            Thank you for your purchase, {firstName}!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="font-mono text-xs sm:text-sm">
              #{orderDetails.orderId}
            </Badge>
            <span className="hidden sm:inline">•</span>
            <span className="text-xs sm:text-sm">{date}</span>
          </div>
        </div>

        {/* Order Timeline - Responsive vertical timeline */}
        <Card className="mb-6 sm:mb-8 md:mb-10">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-md sm:text-xl md:text-2xl">Order Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 sm:pt-4">
            <div className="relative">
              {/* Mobile Timeline - Vertical */}
              <div className="sm:hidden">
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.active ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                      }`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{step.title}</h3>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Timeline - Horizontal */}
              <div className="hidden sm:block">
                <div className="relative">
                  {/* Progress line */}
                  <div className="absolute top-7 left-0 right-0 h-0.5 bg-border transform -translate-y-1/2 z-0"></div>
                  
                  <div className="relative flex justify-evenly z-10 w-[70%] mx-auto">
                    {steps.map((step, index) => (
                      <div key={index} className="flex flex-col items-center relative">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 ${
                          step.active 
                            ? "bg-green-100 text-green-600 border-2 border-green-300" 
                            : "bg-muted text-muted-foreground border-2 border-background"
                        }`}>
                          {step.icon}
                        </div>
                        <div className="text-center max-w-[120px]">
                          <h3 className="font-semibold text-sm md:text-base mb-1">{step.title}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Flex container for responsive layout */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
          {/* Left Column - Takes 2/3 on desktop, full width on mobile */}
          <div className="flex-1 lg:flex-[2] space-y-4 sm:space-y-6">
            {/* Order Details */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  <CardTitle className="text-base sm:text-lg md:text-xl">Order Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 pt-3">
                {orderDetails.cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3 sm:gap-4">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border">
                      <img
                        src={item.imageurl}
                        alt={item.name}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{item.name}</h3>
                      {(item.selectedSize || item.selectedMaterial) && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {[item.selectedSize, item.selectedMaterial].filter(Boolean).join(" / ")}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-sm sm:text-base">
                        R{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                {/* Order Summary */}
                <div className="bg-muted/50 rounded-lg p-4 sm:p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">R{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {orderDetails.shipping_method === "delivery" ? "Shipping" : "Pickup"}
                      </span>
                      <span className="font-medium">
                        {shipping === 0 ? "Free" : `R${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between pt-2">
                      <span className="font-bold text-sm sm:text-base">Total Paid</span>
                      <span className="font-bold text-base sm:text-lg">R{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  <CardTitle className="text-base sm:text-lg md:text-xl">Contact Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6">
                  <div className="flex-1 min-w-[200px] sm:min-w-[180px] space-y-1">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Name</span>
                    </div>
                    <p className="font-medium text-sm sm:text-base truncate">{orderDetails.customer_name}</p>
                  </div>
                  <div className="flex-1 min-w-[200px] sm:min-w-[180px] space-y-1">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Email</span>
                    </div>
                    <p className="font-medium text-sm sm:text-base truncate">{orderDetails.email}</p>
                  </div>
                  <div className="flex-1 min-w-[200px] sm:min-w-[180px] space-y-1">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Phone</span>
                    </div>
                    <p className="font-medium text-sm sm:text-base">{orderDetails.phone || "Not provided"}</p>
                  </div>
                  <div className="flex-1 min-w-[200px] sm:min-w-[180px] space-y-1">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Order Number</span>
                    </div>
                    <p className="font-medium font-mono text-sm sm:text-base truncate">{orderDetails.orderId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Takes 1/3 on desktop, full width on mobile */}
          <div className="flex-1 space-y-4 sm:space-y-6">
            {/* Delivery/Pickup Details */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {orderDetails.shipping_method === "delivery" ? 
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5" /> : 
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  }
                  <CardTitle className="text-base sm:text-lg md:text-xl">
                    {orderDetails.shipping_method === "delivery" ? "Delivery Details" : "Pickup Details"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-3 space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                    {orderDetails.shipping_method === "delivery" ? "Shipping Address" : "Pickup Location"}
                  </p>
                  <p className="font-medium text-sm sm:text-base whitespace-pre-line break-words">
                    {orderDetails.shipping_method === "delivery" 
                      ? orderDetails.shipping_address 
                      : orderDetails.pickup_location}
                  </p>
                </div>
                
                <Alert className={`text-left ${orderDetails.shipping_method === "delivery" 
                  ? "bg-blue-50 border-blue-200" 
                  : "bg-green-50 border-green-200"
                }`}>
                  <AlertDescription className="text-sm sm:text-base">
                    <div className="text-2xl sm:text-3xl text-center mb-2 sm:mb-3">
                      {orderDetails.shipping_method === "delivery" ? "📦" : "✅"}
                    </div>
                    <h4 className="font-semibold text-center mb-2 sm:mb-3">
                      {orderDetails.shipping_method === "delivery" 
                        ? "Delivery Information" 
                        : "Pickup Instructions"}
                    </h4>
                    <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      {orderDetails.shipping_method === "delivery" ? (
                        <>
                          <li className="flex items-start">
                            <span className="mr-2 mt-0.5">•</span>
                            <span>Your order will be shipped within 2-3 business days</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-0.5">•</span>
                            <span>You'll receive a tracking number via email once shipped</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-0.5">•</span>
                            <span>Estimated delivery: 3-5 business days</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-0.5">•</span>
                            <span>{shipping === 0 ? "Free shipping on orders over R500" : "Shipping fee: R75"}</span>
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-start">
                            <span className="mr-2 mt-0.5">•</span>
                            <span>Your order will be ready in 2-3 days</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-0.5">•</span>
                            <span>We'll notify you when it's ready for pickup</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-0.5">•</span>
                            <span>No pickup fee — completely free!</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* What's Next */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <CardTitle className="text-base sm:text-lg md:text-xl">What's Next?</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-3 space-y-3 sm:space-y-4">
                <div className="flex gap-3">
                  <Badge className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                    1
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base">Order Confirmation Email</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Sent to {orderDetails.email}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Badge className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                    2
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base">
                      {orderDetails.shipping_method === "delivery" ? "Shipping Update" : "Pickup Notification"}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {orderDetails.shipping_method === "delivery" 
                        ? "You'll receive tracking information within 48 hours" 
                        : "We'll notify you when your order is ready (usually 2-3 days)"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3">
              <Button asChild className="w-full" size="lg">
                <a href="/products" className="flex items-center justify-center gap-2 text-sm sm:text-base">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  Continue Shopping
                </a>
              </Button>
              
              <Button asChild variant="outline" className="w-full" size="lg">
                <a href="/" className="flex items-center justify-center gap-2 text-sm sm:text-base">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                  Back to Home
                </a>
              </Button>
            </div>

            {/* Support Info */}
            <Card>
              <CardContent className="pt-4 sm:pt-6 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                  Questions about your order?
                </p>
                <a 
                  href="mailto:support@thevillage.com" 
                  className="text-primary font-medium text-sm sm:text-base hover:underline break-all"
                >
                  support@thevillage.com
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <Separator className="my-6 sm:my-8 md:my-10" />
        <div className="text-center px-2">
          <p className="text-muted-foreground text-xs sm:text-sm">
            © {new Date().getFullYear()} The Village Streetwear. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SUSPENSE WRAPPER ---------------- */

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading order confirmation…</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}