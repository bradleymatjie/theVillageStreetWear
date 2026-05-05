import { createServerSupabaseClient } from "@/lib/supebase/server";
import { Package, ShoppingCart, Banknote } from "lucide-react";
import { redirect } from "next/navigation";
import { StatsCard } from "../orders/components/StatsCard";
import { RevenueChart } from "./components/RevenueChart";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type OrderItem = {
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  size?: string;
  material?: string;
};

type Order = {
  id: string;
  order_id: string;
  customer_name: string;
  email: string;
  phone: string | null;
  total: number | null;
  shipping_method: "delivery" | "pickup";
  shipping_address: string | null;
  pickup_location: string | null;
  created_at: string;
  metadata: {
    cartItems?: OrderItem[];
  } | null;
};

// 🔹 Helpers
function getDailyRevenue(orders: Order[]) {
  const map = new Map<string, number>();

  orders.forEach((order) => {
    const label = new Date(order.created_at).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
    });

    map.set(label, (map.get(label) || 0) + Number(order.total || 0));
  });

  return Array.from(map.entries()).map(([label, revenue]) => ({
    label,
    revenue,
  }));
}

function getMonthlyRevenue(orders: Order[]) {
  const map = new Map<string, number>();

  orders.forEach((order) => {
    const label = new Date(order.created_at).toLocaleDateString("en-ZA", {
      month: "short",
      year: "numeric",
    });

    map.set(label, (map.get(label) || 0) + Number(order.total || 0));
  });

  return Array.from(map.entries()).map(([label, revenue]) => ({
    label,
    revenue,
  }));
}

export default async function BrandSalesPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (user.user_metadata?.role !== "brand") {
    redirect("/protected/profile");
  }

  const { data: brand } = await supabase
    .from("brands")
    .select("id, name")
    .eq("user_id", user.id)
    .single();

  if (!brand) {
    return (
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-black">Sales</h1>
        <p className="mt-3 text-white/50">Brand profile not found.</p>
      </div>
    );
  }

  // ✅ Only completed sales
  const { data: ordersData } = await supabase
    .from("orders")
    .select("*")
    .eq("brand_id", brand.id)
    .eq("payment_status", "paid")
    .eq("status", "delivered")
    .order("created_at", { ascending: false });

  const sales = (ordersData || []) as Order[];

  const totalSales = sales.reduce((sum, order) => {
    return sum + Number(order.total || 0);
  }, 0);

  const totalItems = sales.reduce((sum, order) => {
    const items = order.metadata?.cartItems || [];
    return (
      sum +
      items.reduce((itemSum, item) => {
        return itemSum + Number(item.quantity || 0);
      }, 0)
    );
  }, 0);

  const completedOrders = sales.length;

  const dailyRevenue = getDailyRevenue(sales);
  const monthlyRevenue = getMonthlyRevenue(sales);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/40">
          Brand Sales
        </p>
        <h1 className="mt-2 text-4xl font-black">Sales</h1>
        <p className="mt-2 text-sm text-white/50">
          Completed sales for {brand.name}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          icon={Banknote}
          title="Revenue"
          value={`R${totalSales.toFixed(2)}`}
          text="Completed sales"
        />

        <StatsCard
          icon={ShoppingCart}
          title="Orders"
          value={String(completedOrders)}
          text="Delivered & paid"
        />

        <StatsCard
          icon={Package}
          title="Items Sold"
          value={String(totalItems)}
          text="Total items sold"
        />
      </div>

      {/* Charts */}
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <RevenueChart title="Daily Revenue" data={dailyRevenue} />
        <RevenueChart title="Monthly Revenue" data={monthlyRevenue} />
      </div>

      {/* Sales list */}
      <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <h2 className="text-2xl font-black">Sales History</h2>

        {sales.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-8 text-center">
            <p className="font-bold">No sales yet</p>
            <p className="mt-2 text-sm text-white/50">
              Completed orders will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {sales.map((order) => {
              const items = order.metadata?.cartItems || [];

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <div>
                      <p className="text-xs text-white/30">
                        {order.order_id}
                      </p>
                      <h3 className="text-lg font-black">
                        {order.customer_name}
                      </h3>
                      <p className="text-sm text-white/50">
                        {order.email}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-white/40">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-lg font-black">
                        R{Number(order.total || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {items.length > 0 && (
                    <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
                      {items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              className="h-14 w-14 rounded-xl object-cover"
                            />
                          )}

                          <div className="flex-1">
                            <p className="font-bold">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-white/50">
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <p className="font-bold">
                            R{Number(item.total_price).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}