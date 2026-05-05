import { createServerSupabaseClient } from "@/lib/supebase/server";
import { Package, ShoppingCart } from "lucide-react";
import { redirect } from "next/navigation";

type Order = {
  id: string;
  order_id: string;
  customer_name: string;
  email: string;
  phone: string | null;
  total: number;
  status: string;
  payment_status: string | null;
  shipping_method: "delivery" | "pickup";
  shipping_address: string | null;
  pickup_location: string | null;
  created_at: string;
  brand_id: string | null;
};

export default async function BrandOrdersPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.user_metadata?.role !== "brand") {
    redirect("/protected/profile");
  }

  const { data: brand } = await supabase
    .from("brands")
    .select("id, name")
    .eq("id", user.user_metadata.brand_id)
    .single();

  if (!brand) {
    return (
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-black">Orders</h1>
        <p className="mt-3 text-white/50">Brand profile not found.</p>
      </div>
    );
  }

  const { data: orders = [], error } = await supabase
    .from("orders")
    .select("*")
    .eq("brand_id", brand.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const totalOrders = orders?.length;

  const totalSales = orders?.reduce((sum: number, order: Order) => {
    return sum + Number(order.total || 0);
  }, 0);

  const paidOrders = orders?.filter(
    (order: Order) =>
      order.payment_status === "paid" || order.status === "paid"
  ).length;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/40">
          Brand Orders
        </p>
        <h1 className="mt-2 text-4xl font-black">Orders</h1>
        <p className="mt-2 text-sm text-white/50">
          View orders placed for {brand.name}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          icon={ShoppingCart}
          title="Orders"
          value={String(totalOrders)}
          text="Total orders received"
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
          text="Total order value"
        />
      </div>

      <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <h2 className="text-2xl font-black">Recent Orders</h2>

        {orders?.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-8 text-center">
            <p className="font-bold">No orders yet</p>
            <p className="mt-2 text-sm text-white/50">
              Orders for your brand will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders?.map((order: Order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
            {order.order_id}
          </p>

          <h3 className="mt-2 text-lg font-black">{order.customer_name}</h3>

          <p className="mt-1 text-sm text-white/50">{order.email}</p>

          {order.phone && (
            <p className="mt-1 text-sm text-white/50">{order.phone}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge>{order.status}</Badge>
          <Badge>{order.payment_status || "pending"}</Badge>
        </div>
      </div>

      <div className="mt-5 border-t border-white/10 pt-5 text-sm text-white/50">
        <p>
          {order.shipping_method === "pickup"
            ? `Pickup: ${order.pickup_location || "Not specified"}`
            : `Delivery: ${order.shipping_address || "Not specified"}`}
        </p>

        <p className="mt-3 text-lg font-black text-white">
          Total: R{Number(order.total || 0).toFixed(2)}
        </p>
      </div>
    </div>
  );
}

function StatsCard({
  icon: Icon,
  title,
  value,
  text,
}: {
  icon: any;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <Icon className="mb-5 h-7 w-7 text-white/60" />
      <p className="text-sm font-bold text-white/40">{title}</p>
      <h2 className="mt-2 text-3xl font-black">{value}</h2>
      <p className="mt-1 text-sm text-white/50">{text}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold capitalize text-white/70">
      {children}
    </span>
  );
}