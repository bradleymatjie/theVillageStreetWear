// app/api/webhooks/design-checkout/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    const headers = req.headers;
    const webhookId = headers.get("webhook-id");
    const webhookTimestamp = headers.get("webhook-timestamp");
    const webhookSignature = headers.get("webhook-signature");

    if (!webhookId || !webhookTimestamp || !webhookSignature) {
      console.warn("❌ Missing required webhook headers");
      return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 });
    }

    // Replay protection
    const timestamp = parseInt(webhookTimestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (isNaN(timestamp) || Math.abs(now - timestamp) > 180) {
      console.warn("❌ Stale or invalid timestamp");
      return NextResponse.json({ error: "Invalid timestamp" }, { status: 400 });
    }

    const secret = process.env.YOCO_WEBHOOK_SECRET;
    if (!secret) {
      console.error("❌ YOCO_WEBHOOK_SECRET not set");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Parse payload
    const payload = JSON.parse(rawBody);
    const eventType = payload.type;
    const data = payload.payload || payload.data || payload;

    if (eventType === "payment.succeeded" && data.id) {
      const metadata = data.metadata || {};
      const yocoCheckoutId = metadata.checkoutId || data.id;

      let orderData: any;

      const orderAmount = data.amount / 100;
      const customOrderId = metadata.orderId || yocoCheckoutId;

      orderData = {
        order_id: customOrderId,
        yoco_checkout_id: yocoCheckoutId,
        status: "pending",
        payment_status: "paid",
        total: orderAmount,
        amount: orderAmount,
        subtotal: orderAmount - (Number(metadata.shipping_cost) || 0),
        shipping_cost: Number(metadata.shipping_cost) || 0,
        customer_email: metadata.customer_email || "",
        customer_phone: metadata.customer_phone || "",
        customer_name: metadata.customer_name || "Customer",
        shipping_method: metadata.shipping_method || "",
        shipping_address: metadata.shipping_address || "",
        pickup_location: metadata.pickup_location || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: metadata,
      };

      const { data: newOrder, error: insertError } = await supabase
        .from("design_orders")
        .insert([orderData])
        .select()
        .single();

      if (insertError) {
        console.error("Failed to insert order:", insertError);
        throw insertError;
      }

      orderData = newOrder;

      if (orderData && orderData.customer_email) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${headers.get("host") || "localhost:3000"}`;
          const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || "your-default-secret";

          const emailRes = await fetch(`${baseUrl}/api/orders/order-confirmation`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-vercel-protection-bypass": bypassSecret,
            },
            body: JSON.stringify({
              orderId: orderData.order_id,
              amount: orderData.total.toString(),
              email: orderData.customer_email,
              phone: orderData.customer_phone || "",
              customer_name: orderData.customer_name || "Customer",
              shipping_method: orderData.shipping_method || "",
              shipping_address: orderData.shipping_address || "",
              pickup_location: orderData.pickup_location || "",
              cartItems: orderData.metadata.cartItems,
              payment_status: "paid",
              payment_reference: data.id,
            }),
          });

          if (!emailRes.ok) {
            const errText = await emailRes.text();
            console.error("Email failed:", emailRes.status, errText);
          }
        } catch (emailErr) {
          console.error("Email sending error:", emailErr);
        }
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active", timestamp: new Date().toISOString() });
}

export const dynamic = "force-dynamic";
