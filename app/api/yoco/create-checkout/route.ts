// app/api/yoco/create-checkout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  let createdOrderId: string | null = null;

  try {
    const {
      order_number,
      brand_id,
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      subtotal,
      delivery_fee,
      total_amount,
      cartItems,
      shipping_method,
      shipping_address,
      pickup_location,
    } = await req.json();

    if (
      !order_number ||
      !brand_id ||
      !customer_id ||
      !customer_email ||
      !customer_name ||
      !total_amount ||
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    const brandIds = Array.from(
      new Set(cartItems.map((item) => item.brand_id).filter(Boolean))
    );

    if (brandIds.length !== 1 || brandIds[0] !== brand_id) {
      return NextResponse.json(
        { error: "Only one brand can be checked out at a time." },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_id: order_number,
        customer_id,
        brand_id,
        customer_name,
        email: customer_email,
        phone: customer_phone || "",
        amount: subtotal,
        shipping_cost: delivery_fee || 0,
        total: total_amount,
        subtotal,
        delivery_fee,
        total_amount,
        payment_status: "pending",
        order_status: "pending_payment",
        status: "pending",
        shipping_method,
        shipping_address: shipping_address || "",
        pickup_location: pickup_location || "",
        metadata: { cartItems },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create pending order" },
        { status: 500 }
      );
    }

    createdOrderId = order.id;

    const amountInCents = Math.round(Number(total_amount) * 100);

    const yocoRes = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency: "ZAR",
        successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id=${order.id}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
        customer: {
          email: customer_email,
          name: customer_name,
        },
        metadata: {
          order_id: order.id,
          order_number,
          brand_id,
          customer_id,
        },
      }),
    });

    const yocoData = await yocoRes.json();

    if (!yocoRes.ok) {
      console.error("Yoco error:", yocoData);

      await supabase.from("orders").delete().eq("id", order.id);

      return NextResponse.json(
        { error: yocoData.message || "Checkout failed" },
        { status: 400 }
      );
    }

    const redirectUrl = yocoData.redirectUrl || yocoData.redirect_url;

    await supabase
      .from("orders")
      .update({
        yoco_checkout_id: yocoData.id,
      })
      .eq("id", order.id);

    return NextResponse.json({
      redirectUrl,
      orderId: order.id,
      orderNumber: order_number,
      yocoCheckoutId: yocoData.id,
    });
  } catch (error) {
    console.error("Checkout handler error:", error);

    if (createdOrderId) {
      await supabase.from("orders").delete().eq("id", createdOrderId);
    }

    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}