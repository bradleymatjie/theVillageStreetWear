// app/api/webhook-yoco/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";


export async function POST(req: Request) {
  console.log("🎯 Webhook endpoint hit!");

  try {

    const rawBody = await req.text();


    let payload;
    try {
      payload = JSON.parse(rawBody);
      console.log("- Event type:", payload.type);
      console.log("- Payload:", JSON.stringify(payload, null, 2));
    } catch (parseError) {
      console.error("❌ Failed to parse JSON:", parseError);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const eventType = payload.type;
    const data = payload.payload || {};

    // Process successful payments
    if (eventType === "payment.succeeded" && data.id) {
      const metadata = data.metadata || {};

      const yocoCheckoutId = metadata.checkoutId || data.id;

      const { data: existingOrder, error: findError } = await supabase
        .from("orders")
        .select("*")
        .eq("yoco_checkout_id", yocoCheckoutId)
        .single();

      let orderData;

      if (!existingOrder) {
        console.log("🆕 Creating new order from webhook data (order not found in database)");

        const customer = data.customer || {};
        const orderAmount = data.amount / 100;

        const customOrderId = metadata.orderId || yocoCheckoutId;

        orderData = {
          order_id: customOrderId,
          yoco_checkout_id: yocoCheckoutId,
          status: "pending", // CHANGED: Use 'pending' instead of 'paid' due to check constraint
          payment_status: "paid",
          total: orderAmount,
          amount: orderAmount,
          subtotal: orderAmount,
          shipping_cost: 0.00,
          email: customer.email || metadata.email,
          phone: metadata.phone || "",
          customer_name: metadata.customer_name || customer.name || "Customer",
          shipping_method: metadata.shipping_method || "",
          shipping_address: metadata.shipping_address || "",
          pickup_location: metadata.pickup_location || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: metadata,
        };

        const { data: newOrder, error: insertError } = await supabase
          .from("orders")
          .insert([orderData])
          .select()
          .single();

        if (insertError) {
          console.error("❌ Failed to create order:", insertError);
          throw insertError;
        }

        orderData = newOrder;
        console.log("✅ Order created:", orderData.order_id);


      }

      if (existingOrder) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get('host') || 'testing.thevillagestreetwear.com'}`;
          const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || "fTR0teGrKTYoEDNIVTudNnSGt7QvTTnV";

          console.log("📧 Attempting to send email with bypass secret...", orderData);

          const emailRes = await fetch(`${baseUrl}/api/yoco/order-confirmation`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'x-vercel-protection-bypass': bypassSecret
            },
            body: JSON.stringify({
              orderId: existingOrder.order_id,
              amount: (existingOrder.total || data.amount / 100).toString(),
              email: existingOrder.email,
              phone: existingOrder.phone || metadata.phone || "",
              customer_name: existingOrder.customer_name || metadata.customer_name || "Customer",
              shipping_method: existingOrder.shipping_method || metadata.shipping_method || "",
              shipping_address: existingOrder.shipping_address || metadata.shipping_address || "",
              pickup_location: existingOrder.pickup_location || metadata.pickup_location || "",
              cartItems: JSON.parse(metadata?.cartItems),
            }),
          });

          if (!emailRes.ok) {
            const errorText = await emailRes.text();
            console.error("❌ Email sending failed:", errorText);
            console.log("Response status:", emailRes.status);
          } else {
            const result = await emailRes.json();
            console.log("✅ Order confirmation email sent:", result);
          }
        } catch (emailError) {
          console.error("⚠️ Email error:", emailError);
        }
      }
    } else {
      console.log(`ℹ️ Event type '${eventType}' received but not processed (expected 'payment.succeeded')`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: unknown) {
    console.error("🔥 Webhook processing error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        success: false
      },
      { status: 500 }
    );
  }
}
