import { Order } from "../../types";
import { Badge } from "./Badge";
import OrderStatusSelect from "./OrderStatusSelect";

export function OrderCard({ order }: { order: Order }) {
  const items = order.metadata?.cartItems || [];

  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-all text-xs font-bold uppercase tracking-[0.18em] text-white/30 sm:tracking-[0.2em]">
            {order.order_id}
          </p>

          <h3 className="mt-2 break-words text-base font-black sm:text-lg">
            {order.customer_name}
          </h3>

          <p className="mt-1 break-all text-sm text-white/50">{order.email}</p>

          {order.phone && (
            <p className="mt-1 break-all text-sm text-white/50">
              {order.phone}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:items-end">
          <div className="flex flex-wrap gap-2">
            <Badge>{order.status}</Badge>
            <Badge>{order.payment_status || "pending"}</Badge>
          </div>

          <div className="w-full sm:w-auto">
            <OrderStatusSelect
              orderId={order.id}
              currentStatus={order.status}
            />
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
          <p className="text-sm font-bold text-white/60">Order Items</p>

          {items.map((item, index) => (
            <div
              key={`${item.product_id}-${index}`}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center"
            >
              <div className="flex gap-3 sm:flex-1">
                {item.product_image && (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-bold sm:text-base">
                    {item.product_name}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/50">
                    Qty: {item.quantity}
                    {item.size && ` • Size: ${item.size}`}
                    {item.material && ` • Material: ${item.material}`}
                  </p>
                </div>
              </div>

              <div className="flex items-end justify-between border-t border-white/10 pt-3 text-right sm:block sm:border-t-0 sm:pt-0">
                <p className="text-xs text-white/40 sm:hidden">Item total</p>

                <div>
                  <p className="font-bold">
                    R{Number(item.total_price || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-white/40">
                    R{Number(item.unit_price || 0).toFixed(2)} each
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 border-t border-white/10 pt-5 text-sm text-white/50">
        <p className="break-words leading-6">
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