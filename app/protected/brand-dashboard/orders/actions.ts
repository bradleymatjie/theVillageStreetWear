"use server";

import { sendOrderStatusEmail } from "@/app/emails/sendOrderStatusEmail";
import { createServerSupabaseClient } from "@/lib/supebase/server";
import { revalidatePath } from "next/cache";

const allowedStatuses = ["processing", "out_for_delivery", "delivered"];

export async function updateOrderStatus(orderId: string, status: string) {
  if (!orderId) {
    throw new Error("Missing order id");
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid order status");
  }

  const supabase = await createServerSupabaseClient();

  // ✅ 1. Get order details (for email)
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("email, customer_name, order_id, status")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    throw new Error("Order not found");
  }

  // 🚫 Prevent unnecessary updates (same status)
  if (order.status === status) {
    return;
  }

  // ✅ 2. Update order
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status,
      order_status: status,
    })
    .eq("id", orderId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  // ✅ 3. Send email notification
  try {
    await sendOrderStatusEmail({
      email: order.email,
      name: order.customer_name,
      orderId: order.order_id,
      status,
    });
  } catch (emailError) {
    console.error("Email failed:", emailError);
    // Do NOT throw — we don't want UI to break if email fails
  }

  // ✅ 4. Refresh UI
  revalidatePath("/protected/brand-dashboard/orders");
}