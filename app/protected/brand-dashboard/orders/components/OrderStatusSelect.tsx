"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "../actions";

const statuses = [
  { label: "Paid / Received", value: "paid" },
  { label: "Processing", value: "processing" },
  { label: "Out for delivery", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
];

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [pending, startTransition] = useTransition();

  const handleChange = (nextStatus: string) => {
    const previousStatus = status;
    setStatus(nextStatus);

    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, nextStatus);
        toast.success("Order status updated");
      } catch (error) {
        setStatus(previousStatus);
        toast.error(
          error instanceof Error ? error.message : "Could not update status"
        );
      }
    });
  };

  return (
    <select
      value={status}
      disabled={pending || status === "delivered"}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm font-bold text-white outline-none transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {statuses.map((item) => (
        <option key={item.value} value={item.value} className="bg-black">
          {item.label}
        </option>
      ))}
    </select>
  );
}