"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Package, Truck, Mail } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/app/lib/user";

interface DesignOrder {
  orderId: string;
  amount: string;
  email: string;
  phone: string;
  customer_name: string;
  shipping_method: string;
  shipping_address: string;
  pickup_location: string;
  cartItems: {
    name: string;
    front: string;
    back: string;
    tshirt_color: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    elements?: any;
  }[];
  payment_status: string;
  payment_reference: string;
  date: string;
}

interface CatalogOrder {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_status: string;
  status: string;
  created_at: string;
  shipping_method: string;
  pickup_location: string;
}

export default function TrackOrderPage() {
  const { user } = useUser();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("design");

  const [designOrders, setDesignOrders] = useState<DesignOrder[]>([]);
  const [catalogOrders, setCatalogOrders] = useState<CatalogOrder[]>([]);

  const hasOrders = designOrders.length > 0 || catalogOrders.length > 0;

  const loadOrders = async (searchEmail: string) => {
    if (!searchEmail.trim()) return;

    setLoading(true);
    setError(null);
    setDesignOrders([]);
    setCatalogOrders([]);

    const encodedEmail = encodeURIComponent(searchEmail.trim().toLowerCase());

    try {
      // Fetch Design Orders
      const designRes = await fetch(`/api/orders/getOrder?email=${encodedEmail}`);
      if (designRes.ok) {
        const designData: DesignOrder[] = await designRes.json();
        setDesignOrders(designData);
      } else if (designRes.status !== 404) {
        const err = await designRes.json().catch(() => ({}));
        console.error("Design orders error:", err);
      }

      // Fetch Catalog Orders (update endpoint if different)
      const catalogRes = await fetch(`/api/orders/getCatalogOrders?email=${encodedEmail}`);
      if (catalogRes.ok) {
        const catalogData: CatalogOrder[] = await catalogRes.json();
        setCatalogOrders(catalogData);
      } else if (catalogRes.status !== 404) {
        const err = await catalogRes.json().catch(() => ({}));
        console.error("Catalog orders error:", err);
      }

      // Only show "no orders" if both are empty
      if (designOrders.length === 0 && catalogOrders.length === 0) {
        setError("No orders found for this email");
      }
    } catch (err: any) {
      setError("An error occurred while searching. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load if user is logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user?.email);
      loadOrders(user?.email);
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `R${num.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-center mb-10">Track Your Order</h1>

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="aspect-square rounded-lg" />
                  </div>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Orders Tabs - only show after search/loading complete */}
        {!loading && hasOrders && (
          <>
            {user?.email && email.toLowerCase() === user.email.toLowerCase() && (
              <p className="text-center text-sm text-muted-foreground mb-6">
                Showing orders for your account
              </p>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="design">Design Orders</TabsTrigger>
                <TabsTrigger value="catalog">Catalog Orders</TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="space-y-6">
                {designOrders.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-10">
                      <p className="text-gray-500">No custom design orders found</p>
                    </CardContent>
                  </Card>
                ) : (
                  designOrders.map((order) => (
                    <Card key={order.orderId} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <CardTitle>Order {order.orderId}</CardTitle>
                            <CardDescription>{formatDate(order.date)}</CardDescription>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                              {order.payment_status}
                            </Badge>
                            <div className="text-2xl font-bold">{formatPrice(order.amount)}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {order.cartItems.map((item, idx) => (
                            <div key={idx} className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                {item.front && (
                                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <Image
                                      src={item.front}
                                      alt="Front design"
                                      fill
                                      className="object-contain"
                                    />
                                    <span className="absolute bottom-0 left-0 bg-black text-white text-xs px-2 py-1">
                                      Front
                                    </span>
                                  </div>
                                )}
                                {item.back && (
                                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <Image
                                      src={item.back}
                                      alt="Back design"
                                      fill
                                      className="object-contain"
                                    />
                                    <span className="absolute bottom-0 left-0 bg-black text-white text-xs px-2 py-1">
                                      Back
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-sm space-y-1">
                                <p className="font-medium">{item.name}</p>
                                <p>Size: {item.selectedSize || "N/A"}</p>
                                <p>Color: {item.tshirt_color}</p>
                                <p>Quantity: {item.quantity}</p>
                                <p>Price: {formatPrice(item.price * item.quantity)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{order.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            <span>{order.shipping_address || order.pickup_location}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="catalog" className="space-y-6">
                {catalogOrders.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-10">
                      <p className="text-gray-500">No catalog orders found</p>
                    </CardContent>
                  </Card>
                ) : (
                  catalogOrders.map((order) => (
                    <Card key={order.order_id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <CardTitle>Order {order.order_id}</CardTitle>
                            <CardDescription>{formatDate(order.created_at)}</CardDescription>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                              {order.status || order.payment_status}
                            </Badge>
                            <div className="text-2xl font-bold">{formatPrice(order.total)}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span>Subtotal: {formatPrice(order.subtotal)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            <span>Shipping: {order.shipping_cost === 0 ? "Free" : formatPrice(order.shipping_cost)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{order.customer_email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{order.shipping_address || order.pickup_location || "N/A"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}