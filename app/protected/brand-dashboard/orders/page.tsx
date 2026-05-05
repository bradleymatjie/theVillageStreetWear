import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supebase/server";
import { Package, ShoppingCart } from "lucide-react";
import { redirect } from "next/navigation";
import { StatsCard } from "./components/StatsCard";
import { OrderCard } from "./components/OrderCard";
import { Order } from "../types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const filters = [
  { label: "All", value: "all" },
  { label: "Processing", value: "processing" },
  { label: "Out for delivery", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default async function BrandOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const activeStatus = params.status || "all";

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
        <h1 className="text-3xl font-black">Orders</h1>
        <p className="mt-3 text-white/50">Brand profile not found.</p>
      </div>
    );
  }

  let query = supabase
    .from("orders")
    .select("*")
    .eq("brand_id", brand.id)
    .or("payment_status.eq.paid,status.eq.paid")
    .order("created_at", { ascending: false });

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  const { data: ordersData } = await query;

  console.log("data: ", ordersData)

  const orders = (ordersData || []) as Order[];

  const totalOrders = orders.length;

  const totalSales = orders.reduce((sum, order) => {
    return sum + Number(order.total || 0);
  }, 0);

  const paidOrders = orders.length;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/40">
          Brand Orders
        </p>
        <h1 className="mt-2 text-4xl font-black">Orders</h1>
        <p className="mt-2 text-sm text-white/50">
          View paid orders placed for {brand.name}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          icon={ShoppingCart}
          title="Orders"
          value={String(totalOrders)}
          text="Paid orders in this filter"
        />

        <StatsCard
          icon={Package}
          title="Paid Orders"
          value={String(paidOrders)}
          text="Successfully paid"
        />

        <StatsCard
          icon={ShoppingCart}
          title="Sales"
          value={`R${totalSales.toFixed(2)}`}
          text="Paid order value only"
        />
      </div>

      <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-black">Recent Orders</h2>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => {
              const isActive = activeStatus === filter.value;

              return (
                <Link
                  key={filter.value}
                  href={
                    filter.value === "all"
                      ? "/protected/brand-dashboard/orders"
                      : `/protected/brand-dashboard/orders?status=${filter.value}`
                  }
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                    isActive
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-8 text-center">
            <p className="font-bold">No paid orders found</p>
            <p className="mt-2 text-sm text-white/50">
              Paid orders matching this filter will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}