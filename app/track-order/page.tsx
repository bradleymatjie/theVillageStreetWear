"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  ShoppingBag,
  Eye,
  Download,
  XCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUser } from "../lib/user";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  selected_size?: string;
  selected_material?: string;
}

interface Order {
  order_id: string;
  created_at: string;
  customer_name: string;
  total: number;
  status: string;
  shipping_method: "delivery" | "pickup";
  shipping_address: string;
  pickup_location: string;
  order_items: OrderItem[];
}

const steps = [
  { key: "pending", label: "Ordered" },
  { key: "processing", label: "Confirmed" },
  { key: "shipped", label: "Out for delivery / Ready for pickup" },
  { key: "delivered", label: "Delivered / Picked up" },
];

export default function MyOrdersPage() {
  const { user } = useUser();
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const fetchOrders = async (fetchEmail: string) => {
    if (!fetchEmail.trim()) return;

    setLoading(true);
    setError(null);
    setOrders([]);

    try {
      const res = await fetch("/api/my-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fetchEmail.trim().toLowerCase() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch orders");
      }

      const data: Order[] = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "No orders found for this email");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      const userEmail = user.email;
      setEmail(userEmail);
      fetchOrders(userEmail);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(email);
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusMessage = (status: string, shipping_method: "delivery" | "pickup") => {
    if (status === "delivered") {
      return {
        text: shipping_method === "delivery" ? "Delivered" : "Picked up",
        class: "bg-teal-100 text-teal-800",
      };
    }
    if (status === "shipped") {
      return {
        text: shipping_method === "delivery" ? "Expected delivery in 3–5 days" : "Ready for pickup",
        class: "bg-amber-100 text-amber-800",
      };
    }
    if (status === "processing") {
      return {
        text: "Processing – expected to ship soon",
        class: "bg-blue-100 text-blue-800",
      };
    }
    return null;
  };

  const getCurrentStepIndex = (status: string) => {
    return steps.findIndex((s) => s.key === status);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Orders</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            View your order history and check the delivery status for items.
          </p>
        </div>

        {loading && orders.length === 0 && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        )}

        {error && orders.length === 0 && (
          <Alert variant="destructive" className="mb-12">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {orders.length > 0 && (
          <div className="space-y-8">
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.order_id);
              const isCancelled = order.status === "cancelled";
              const currentStepIndex = isCancelled ? -1 : getCurrentStepIndex(order.status);
              const statusMessage = getStatusMessage(order.status, order.shipping_method);

              const firstItem = order.order_items[0];
            
              return (
                <Card
                  key={order.order_id}
                  className="overflow-hidden rounded-2xl border shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader
                    className="cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                    onClick={() => toggleExpand(order.order_id)}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div className="flex items-start gap-6 w-full p-2">
                        {firstItem && (
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden border flex-shrink-0">
                            <img
                              src={firstItem.image_url}
                              alt={firstItem.name}
                              className="object-cover w-full h-full"
                            />
                            {order.order_items.length > 1 && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold">
                                +{order.order_items.length - 1}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-4 mb-2 flex-col">
                            <h3 className="text-md font-bold">#{order.order_id}</h3>
                            {statusMessage && (
                              <Badge className={`px-6 py-2 rounded-full font-medium w-[fit-content] ${statusMessage.class}`}>
                                {statusMessage.text}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Placed on {new Date(order.created_at).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                            <span>•</span>
                            <span>{order.order_items.length} item{order.order_items.length > 1 ? "s" : ""}</span>
                            <span>•</span>
                            <span className="font-semibold text-foreground">R{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View details
                        </Button>
                        {/* <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Invoice
                        </Button> */}
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <CardContent className="pt-8">
                      {isCancelled ? (
                        <Alert variant="destructive">
                          <AlertCircle className="w-5 h-5" />
                          <AlertDescription>This order has been cancelled.</AlertDescription>
                        </Alert>
                      ) : (
                        <div className="grid lg:grid-cols-2 gap-12">
                          {/* Items List */}
                          <div className="space-y-8">
                            {order.order_items.map((item, i) => (
                              <div key={i} className="flex gap-6 items-start">
                                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border">
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm">{item.name}</h4>
                                  {(item.selected_size || item.selected_material) && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {item.selected_size && `Size: ${item.selected_size}`}
                                      {(item.selected_size && item.selected_material) && " • "}
                                      {item.selected_material && item.selected_material}
                                    </p>
                                  )}
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Quantity: {item.quantity}
                                  </p>
                                  <p className="font-semibold mt-2">
                                    R{(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}

                            <Separator className="my-6" />

                            <div className="flex justify-between text-lg">
                              <span className="font-semibold">Total</span>
                              <span className="font-bold text-2xl">R{order.total.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div className="flex justify-center lg:justify-end">
                            <div className="w-full max-w-sm">
                              <div className="relative">
                                {steps.map((step, index) => {
                                  const isCompleted = index < currentStepIndex;
                                  const isCurrent = index === currentStepIndex;

                                  let label = step.label;
                                  if (index === 2) {
                                    label =
                                      order.shipping_method === "delivery"
                                        ? "Out for delivery"
                                        : "Ready for pickup";
                                  }
                                  if (index === 3) {
                                    label =
                                      order.shipping_method === "delivery" ? "Delivered" : "Picked up";
                                  }

                                  return (
                                    <div key={index} className="flex items-start gap-3">
                                      <div className="flex flex-col items-center">
                                        <div
                                          className={` w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                            isCompleted || isCurrent
                                              ? "bg-emerald-500 text-white"
                                              : "bg-white border-4 border-gray-300"
                                          }`}
                                        />
                                        {index < steps.length - 1 && (
                                          <div
                                            className={` w-1 h-20 ${
                                              isCompleted ? "bg-emerald-500" : "bg-gray-300"
                                            }`}
                                          />
                                        )}
                                      </div>
                                      <p
                                        className={` font-medium ${
                                          isCurrent
                                            ? "text-emerald-700 font-semibold text-lg"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        {label}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {orders.length === 0 && !loading && !error && (
          <Card className="text-center py-16">
            <CardContent>
              <p className="text-muted-foreground mb-6">No orders found for this email address.</p>
              <Button asChild>
                <a href="/products">
                  <ShoppingBag className="mr-2 w-5 h-5" />
                  Continue Shopping
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}