import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supebase/admin";
import { moneyToCents } from "@/app/lib/checkout-pricing";
import { verifyYocoSignature } from "./yoco-signature";

type PaymentEvent = {
  type?: string;
  payload?: { id?: string; status?: string; amount?: number; currency?: string; metadata?: { checkoutId?: string; order_id?: string } };
};

export async function handleYocoWebhook(req: Request) {
  const secret = process.env.YOCO_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook verification is not configured." }, { status: 503 });
  const rawBody = await req.text();
  if (!verifyYocoSignature(rawBody, req.headers, secret)) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  let event: PaymentEvent;
  try { event = JSON.parse(rawBody); } catch { return NextResponse.json({ error: "Invalid event." }, { status: 400 }); }
  const payment = event?.payload;
  const paid = event?.type === "payment.succeeded" && payment?.status === "succeeded";
  const failed = ["payment.failed", "payment.cancelled"].includes(event?.type || "");
  if (!paid && !failed) return NextResponse.json({ received: true });
  const checkoutId = payment?.metadata?.checkoutId;
  const orderId = payment?.metadata?.order_id;
  if (!payment?.id || (!checkoutId && !orderId)) return NextResponse.json({ error: "Missing payment reference." }, { status: 400 });
  try {
    let query = supabaseAdmin.from("orders").select("id,total,payment_status,yoco_checkout_id");
    query = orderId ? query.eq("id", orderId) : query.eq("yoco_checkout_id", checkoutId!);
    const { data: order, error } = await query.maybeSingle();
    if (error) throw error;
    // Retry unknown orders: the checkout record may still be committing.
    if (!order) return NextResponse.json({ error: "Order not available yet." }, { status: 503 });
    if (checkoutId && order.yoco_checkout_id && checkoutId !== order.yoco_checkout_id) return NextResponse.json({ error: "Checkout does not match order." }, { status: 400 });
    if (paid && (payment.currency !== "ZAR" || !Number.isSafeInteger(payment.amount) || payment.amount !== moneyToCents(order.total))) return NextResponse.json({ error: "Payment amount or currency does not match order." }, { status: 400 });
    if (order.payment_status?.toLowerCase() === "paid") return NextResponse.json({ received: true, duplicate: true });
    const now = new Date().toISOString();
    const update = paid
      ? { payment_status: "paid", status: "paid", order_status: "paid", yoco_payment_id: payment.id, paid_at: now, updated_at: now }
      : { payment_status: "failed", updated_at: now };
    // A concurrent failed event must never overwrite a confirmed payment.
    const { error: updateError } = await supabaseAdmin.from("orders").update(update).eq("id", order.id).neq("payment_status", "paid");
    if (updateError) throw updateError;
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Payment webhook failed:", error instanceof Error ? error.message : "Unexpected error");
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
