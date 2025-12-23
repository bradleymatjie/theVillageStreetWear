// app/api/webhook-yoco/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageurl: string;
  selectedSize?: string;
  selectedMaterial?: string;
}

interface OrderData {
  orderId: string;
  amount: string;
  email: string;
  phone: string;
  customer_name: string;
  shipping_method: string;
  shipping_address?: string;
  pickup_location?: string;
  cartItems: CartItem[];
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const eventType = payload.event;
    const data = payload.data;

    // Only process successful payments
    if (eventType === "payment.success" && data.id) {
      const checkoutId = data.id;

      // Update order status in Supabase
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_reference: checkoutId,
        })
        .eq("order_id", checkoutId)
        .select()
        .single();

      if (orderError) throw new Error(orderError.message);
      if (!order) throw new Error("Order not found");

      // Fetch order items (assuming you have a separate table)
      const { data: cartItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", checkoutId);

      if (itemsError) throw new Error(itemsError.message);

      // Prepare data for email
      const orderEmailData: OrderData = {
        orderId: order.order_id,
        amount: order.total.toString(),
        email: order.email,
        phone: order.phone || "",
        customer_name: order.customer_name,
        shipping_method: order.shipping_method,
        shipping_address: order.shipping_address || "",
        pickup_location: order.pickup_location || "",
        cartItems: cartItems || [],
      };

      // Send order confirmation email
      const emailRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/yoco/order-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderEmailData),
      });

      const emailResult = await emailRes.json();
      if (!emailRes.ok) {
        console.error("Failed to send order confirmation email:", emailResult);
      } else {
        console.log("Order confirmation email sent successfully:", emailResult.messageId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Webhook error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Unknown webhook error:", error);
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}
