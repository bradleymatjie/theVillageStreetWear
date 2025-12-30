"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Package, Truck, MapPin, Phone, Mail, Clock } from "lucide-react";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  selected_size?: string;
  selected_material?: string;
}

interface CatalogOrder {
  id: number;
  order_id: string;
  created_at: string;
  customer_name: string;
  email: string;
  phone?: string;
  total: number;
  status: string;
  payment_status: string;
  shipping_method: string;
  shipping_address?: string;
  pickup_location?: string;
  order_items: OrderItem[];
}

interface DesignOrder {
  id: string;
  order_id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total: number;
  status: string;
  payment_status: string;
  shipping_method: string;
  shipping_address?: string;
  pickup_location?: string;
  cartItems: {
    name?: string;
    front?: string;
    back?: string;
    tshirt_color: string;
    price: number;
    quantity: number;
    selectedSize?: string;
  }[];
}

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-yellow-900/50 text-yellow-400" },
  { value: "processing", label: "Processing", color: "bg-blue-900/50 text-blue-400" },
  { value: "shipped", label: "Shipped", color: "bg-purple-900/50 text-purple-400" },
  { value: "delivered", label: "Delivered", color: "bg-green-900/50 text-green-400" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-900/50 text-red-400" },
];

function getStatusColor(status: string) {
  const option = statusOptions.find((opt) => opt.value === status);
  return option?.color || "bg-gray-800 text-gray-400";
}

function getStatusLabel(status: string) {
  const option = statusOptions.find((opt) => opt.value === status);
  return option?.label || status.charAt(0).toUpperCase() + status.slice(1);
}

// Catalog Order Card (unchanged from your original, just minor refactors)
function CatalogOrderCard({
  order,
  updateStatus,
}: {
  order: CatalogOrder;
  updateStatus: (id: number, newStatus: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [localStatus, setLocalStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setLocalStatus(order.status);
  }, [order.status]);

  const handleSave = async () => {
    if (localStatus === order.status) return;
    setUpdating(true);
    try {
      await updateStatus(order.id, localStatus);
    } catch (err) {
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 text-left flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#1A1A1A] transition-colors"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <span className="font-bold text-lg">#{order.order_id}</span>
          <span className="text-gray-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {new Date(order.created_at).toLocaleString()}
          </span>
          <span className="font-medium">{order.customer_name}</span>
          <span className="text-gray-400">{order.email}</span>
          <span className="font-bold text-xl">R{order.total.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
          {order.shipping_method === "delivery" ? (
            <Truck className="w-5 h-5 text-gray-400" />
          ) : (
            <MapPin className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="p-6 border-t border-[#1A1A1A] space-y-8">
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Items ({order.order_items.length})
            </h3>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-4 border-b border-[#1A1A1A] last:border-0"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#1A1A1A] flex-shrink-0">
                    <Image
                      src={item.image_url || "/placeholder.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    {(item.selected_size || item.selected_material) && (
                      <p className="text-sm text-gray-400">
                        {item.selected_size && `Size: ${item.selected_size}`}
                        {item.selected_size && item.selected_material && " / "}
                        {item.selected_material && `Material: ${item.selected_material}`}
                      </p>
                    )}
                    <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                  </div>
                  <div className="font-semibold">
                    R{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Customer Info
              </h3>
              <p>{order.customer_name}</p>
              <p className="text-gray-400 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {order.email}
              </p>
              {order.phone && (
                <p className="text-gray-400 flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4" />
                  {order.phone}
                </p>
              )}
            </div>

            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                {order.shipping_method === "delivery" ? <Truck className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                {order.shipping_method === "delivery" ? "Delivery" : "Pickup"} Details
              </h3>
              <p className="text-gray-300">
                {order.shipping_address || order.pickup_location || "N/A"}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1A1A1A]">
            <h3 className="font-bold text-lg mb-4">Update Fulfillment Status</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <select
                value={localStatus}
                onChange={(e) => setLocalStatus(e.target.value)}
                disabled={updating}
                className="bg-[#1A1A1A] border border-[#333] text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {localStatus !== order.status && (
                <button
                  onClick={handleSave}
                  disabled={updating}
                  className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Current status: <span className="font-medium">{getStatusLabel(order.status)}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// New Design Order Card – tailored for custom tees
function DesignOrderCard({
  order,
  updateStatus,
}: {
  order: DesignOrder;
  updateStatus: (id: string, newStatus: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [localStatus, setLocalStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setLocalStatus(order.status);
  }, [order.status]);

  const handleSave = async () => {
    if (localStatus === order.status) return;
    setUpdating(true);
    try {
      await updateStatus(order.id, localStatus);
    } catch (err) {
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 text-left flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#1A1A1A] transition-colors"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <span className="font-bold text-lg">#{order.order_id}</span>
          <span className="text-gray-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {new Date(order.created_at).toLocaleString()}
          </span>
          <span className="font-medium">{order.customer_name}</span>
          <span className="text-gray-400">{order.customer_email}</span>
          <span className="font-bold text-xl">R{order.total.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
          {order.shipping_method === "delivery" ? (
            <Truck className="w-5 h-5 text-gray-400" />
          ) : (
            <MapPin className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="p-6 border-t border-[#1A1A1A] space-y-8">
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Custom Items ({order.cartItems.length})
            </h3>
            <div className="space-y-12">
              {order.cartItems.map((item, idx) => (
                <div key={idx} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {item.front ? (
                      <div className="relative aspect-square bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#333]">
                        <Image
                          src={item.front}
                          alt="Front design"
                          fill
                          className="object-contain"
                        />
                        <span className="absolute bottom-0 left-0 bg-black/70 text-white text-xs px-3 py-1 rounded-tr-lg">
                          Front
                        </span>
                      </div>
                    ) : (
                      <div className="aspect-square bg-[#1A1A1A] rounded-lg border border-[#333] flex items-center justify-center">
                        <span className="text-gray-500">No front design</span>
                      </div>
                    )}
                    {item.back ? (
                      <div className="relative aspect-square bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#333]">
                        <Image
                          src={item.back}
                          alt="Back design"
                          fill
                          className="object-contain"
                        />
                        <span className="absolute bottom-0 left-0 bg-black/70 text-white text-xs px-3 py-1 rounded-tr-lg">
                          Back
                        </span>
                      </div>
                    ) : (
                      <div className="aspect-square bg-[#1A1A1A] rounded-lg border border-[#333] flex items-center justify-center">
                        <span className="text-gray-500">No back design</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <p>
                      <span className="text-gray-400">Color:</span> {item.tshirt_color}
                    </p>
                    {item.selectedSize && (
                      <p>
                        <span className="text-gray-400">Size:</span> {item.selectedSize}
                      </p>
                    )}
                    <p>
                      <span className="text-gray-400">Quantity:</span> {item.quantity}
                    </p>
                    <p>
                      <span className="text-gray-400">Price:</span> R{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Customer Info
              </h3>
              <p>{order.customer_name}</p>
              <p className="text-gray-400 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {order.customer_email}
              </p>
              {order.customer_phone && (
                <p className="text-gray-400 flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4" />
                  {order.customer_phone}
                </p>
              )}
            </div>

            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                {order.shipping_method === "delivery" ? <Truck className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                {order.shipping_method === "delivery" ? "Delivery" : "Pickup"} Details
              </h3>
              <p className="text-gray-300">
                {order.shipping_address || order.pickup_location || "N/A"}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1A1A1A]">
            <h3 className="font-bold text-lg mb-4">Update Fulfillment Status</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <select
                value={localStatus}
                onChange={(e) => setLocalStatus(e.target.value)}
                disabled={updating}
                className="bg-[#1A1A1A] border border-[#333] text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {localStatus !== order.status && (
                <button
                  onClick={handleSave}
                  disabled={updating}
                  className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Current status: <span className="font-medium">{getStatusLabel(order.status)}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "design">("catalog");
  const [catalogOrders, setCatalogOrders] = useState<CatalogOrder[]>([]);
  const [designOrders, setDesignOrders] = useState<DesignOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllOrders() {
      setLoading(true);
      setError(null);
      try {
        const [catalogRes, designRes] = await Promise.all([
          fetch("/api/admin/orders"),
          fetch("/api/admin/design-orders"),
        ]);

        if (!catalogRes.ok && !designRes.ok) {
          throw new Error("Failed to load orders");
        }

        if (catalogRes.ok) {
          const catalogData = await catalogRes.json();
          setCatalogOrders(catalogData);
        }

        if (designRes.ok) {
          const designData = await designRes.json();
          setDesignOrders(designData);
        }
      } catch (err) {
        setError("Failed to load orders. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllOrders();
  }, []);

  const updateCatalogStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      setCatalogOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Catalog status update error:", err);
      throw err;
    }
  };

  const updateDesignStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/design-orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      setDesignOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Design status update error:", err);
      throw err;
    }
  };

  const totalOrders = catalogOrders.length + designOrders.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-800 rounded-lg">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase mb-6">
        Orders ({totalOrders})
      </h1>

      {/* Simple underline tabs */}
      <div className="flex gap-8 mb-8 border-b border-[#1A1A1A]">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-3 font-medium transition-colors ${
            activeTab === "catalog"
              ? "text-white border-b-2 border-white"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Catalog Orders ({catalogOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("design")}
          className={`pb-3 font-medium transition-colors ${
            activeTab === "design"
              ? "text-white border-b-2 border-white"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Custom Design Orders ({designOrders.length})
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === "catalog" && (
          <>
            {catalogOrders.length === 0 ? (
              <div className="p-10 bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg text-center">
                <p className="text-gray-400">No catalog orders yet.</p>
              </div>
            ) : (
              catalogOrders.map((order) => (
                <CatalogOrderCard
                  key={order.id}
                  order={order}
                  updateStatus={updateCatalogStatus}
                />
              ))
            )}
          </>
        )}

        {activeTab === "design" && (
          <>
            {designOrders.length === 0 ? (
              <div className="p-10 bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg text-center">
                <p className="text-gray-400">No custom design orders yet.</p>
              </div>
            ) : (
              designOrders.map((order) => (
                <DesignOrderCard
                  key={order.id}
                  order={order}
                  updateStatus={updateDesignStatus}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}