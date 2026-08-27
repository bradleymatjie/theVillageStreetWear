"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, Circle, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { updateOrderStatus } from "../actions";

const statuses = [
  {
    label: "Processing",
    value: "processing",
    message:
      "The order is confirmed and being prepared. The customer will know the brand has started working on it.",
  },
  {
    label: "Out for delivery",
    value: "out_for_delivery",
    message:
      "Is the product out for delivery? Update the customer so they can be ready to receive it.",
  },
  {
    label: "Delivered",
    value: "delivered",
    message:
      "Mark this once the customer has received the order. This closes the delivery journey.",
  },
];

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [pending, startTransition] = useTransition();
  const activeStatus =
    statuses.find((item) => item.value === status) || statuses[0];
  const activeStatusIndex = statuses.findIndex((item) => item.value === status);
  const isDelivered = status === "delivered";
  const hasUpcomingStatuses = activeStatusIndex < statuses.length - 1;

  const selectedStatusLabel =
    statuses.find((item) => item.value === selectedStatus)?.label || "";

  const stageStatus = (nextStatus: string) => {
    const nextStatusIndex = statuses.findIndex(
      (item) => item.value === nextStatus
    );

    if (nextStatus === status || nextStatusIndex <= activeStatusIndex) {
      return;
    }

    setSelectedStatus(nextStatus);
  };

  const confirmStatusUpdate = () => {
    if (!selectedStatus) {
      return;
    }

    const previousStatus = status;
    const nextStatus = selectedStatus;
    setStatus(nextStatus);

    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, nextStatus);
        setSelectedStatus("");
        setOpen(false);
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
    <div className="relative w-full sm:w-64">
      <button
        type="button"
        disabled={pending || isDelivered || !hasUpcomingStatuses}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black px-4 py-3 text-left text-sm font-black text-white outline-none transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{hasUpcomingStatuses ? "Update status" : activeStatus.label}</span>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin text-white/60" />
        ) : (
          <ChevronDown className="h-4 w-4 text-white/60" />
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#080808] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
                  Update customer
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  Choose next status
                </h3>
                <p className="mt-2 text-sm leading-5 text-white/60">
                  Completed stages are greyed out. Pick the next stage when it
                  is true for this order.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedStatus("");
                  setOpen(false);
                }}
                className="rounded-full border border-white/10 p-2 text-white/50 transition hover:bg-white hover:text-black"
                aria-label="Close status picker"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-2">
              {statuses.map((item, index) => {
                const active = item.value === activeStatus.value;
                const completed = activeStatusIndex >= 0 && index < activeStatusIndex;
                const locked = active || completed;
                const selected = selectedStatus === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={locked || pending}
                    onClick={() => stageStatus(item.value)}
                    className={`flex w-full gap-3 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed ${
                      locked
                        ? "border-white/5 bg-white/[0.03] opacity-45"
                        : selected
                          ? "border-white bg-white/15"
                        : "border-white/15 bg-white/[0.05] hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20">
                      {completed || active || selected ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Circle className="h-3 w-3 fill-white" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-white">
                          {item.label}
                        </span>
                        {completed && (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white/50">
                            Completed
                          </span>
                        )}
                        {active && (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white/50">
                            Current
                          </span>
                        )}
                        {!locked && (
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-black">
                            {selected ? "Selected" : "Upcoming"}
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-white/50">
                        {item.message}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-xs leading-5 text-white/50">
                {selectedStatus
                  ? `Confirm ${selectedStatusLabel} when you are ready to notify the customer.`
                  : "Pick an upcoming status to continue."}
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={!selectedStatus || pending}
                  onClick={confirmStatusUpdate}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm update
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setSelectedStatus("");
                    setOpen(false);
                  }}
                  className="flex-1 rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
