import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function OrderDetails({ order }: { order: any }) {
  const items = order.order_items || [];
  const status = String(order.status || "pending").toLowerCase();

  return (
    <div className="theme-paper bg-theme-ink text-theme-base dark:bg-theme-base dark:text-theme-ink opacity-100">
      <DrawerHeader className="px-0 md:hidden">
        <DrawerTitle>Order Details</DrawerTitle>
      </DrawerHeader>

      <SheetHeader className="hidden px-0 md:block">
        <SheetTitle>Order Details</SheetTitle>
      </SheetHeader>

      <h2 className="mt-4 break-all text-xl font-black">{order.order_id}</h2>

      <div className="mt-3 rounded-2xl border border-theme-base/10 bg-theme-base/[0.03] p-4 dark:border-theme-ink/10 dark:bg-theme-ink/[0.05]">
        <p className="text-xs font-bold uppercase text-theme-base/50 dark:text-theme-ink/50">
          Order Status
        </p>
        <p className="mt-1 font-black capitalize">
          {status.replaceAll("_", " ")}
        </p>

        <p className="mt-3 text-xs font-bold uppercase text-theme-base/50 dark:text-theme-ink/50">
          Payment Status
        </p>
        <p className="mt-1 font-black capitalize">
          {order.payment_status || "pending"}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item: any, i: number) => (
          <div
            key={i}
            className="rounded-2xl border border-theme-base/10 bg-theme-base/[0.03] p-4 dark:border-theme-ink/10 dark:bg-theme-ink/[0.05]"
          >
            <div className="flex gap-4">
              {item.image_url && (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <img
                    src={item.image_url}
                    alt={item.name}                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="min-w-0">
                <p className="break-words font-black">{item.name}</p>
                <p className="text-sm text-theme-base/60 dark:text-theme-ink/60">
                  Size: {item.selected_size}
                </p>
                <p className="text-sm text-theme-base/60 dark:text-theme-ink/60">
                  Material: {item.selected_material}
                </p>
                <p className="mt-1 text-sm font-medium">
                  R{item.price} × {item.quantity}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}