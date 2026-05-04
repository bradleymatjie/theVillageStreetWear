import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    console.log("🎯 Webhook endpoint hit!");
    console.log("- Event type:", payload.type);
    const payment = payload.payload || {};
    const metadata = payment.metadata || {};

    const checkoutId = metadata.checkoutId;
    const orderId = metadata.order_id;
    const paymentId = payment.id;

    const isSuccess =
      payload.type === "payment.succeeded" &&
      payment.status === "succeeded";

    if (!isSuccess) {
      return NextResponse.json({ received: true });
    }

    if (!checkoutId || !orderId) {
      return NextResponse.json(
        { error: "Missing checkoutId or orderId" },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("yoco_checkout_id", checkoutId)
      .single();

    if (orderError || !order) {
      console.error("❌ Order not found:", {
        orderId,
        checkoutId,
        orderError,
      });

      return NextResponse.json({ received: true });
    }

    if (order.payment_status === "paid" || order.status === "paid") {
      return NextResponse.json({ received: true });
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_status: "paid",
        order_status: "paid",
        yoco_checkout_id: paymentId,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("❌ Failed to update order:", updateError);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    console.log("✅ Order marked as paid:", order.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("🔥 Yoco webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}