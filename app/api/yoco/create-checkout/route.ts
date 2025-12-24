// app/api/yoco/create-checkout/route.ts
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const { 
      amount, 
      email, 
      orderId, 
      customer_name, 
      phone, 
      cartItems, 
      shipping_method,
      shipping_address, 
      pickup_location, 
    } = await req.json();

    if (!orderId || !amount || !email || !customer_name || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { 
          error: "Missing or invalid required fields",
          received: {
            email: !!email,
            orderId: !!orderId,
            customer_name: !!customer_name,
            amount: !!amount,
            cartItems: Array.isArray(cartItems) ? cartItems.length : "missing/invalid"
          }
        },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(parseFloat(amount) * 100);
    const params = new URLSearchParams({
    orderId,
    amount: amount.toString(),
    email,
    customer_name,
    phone: phone || '',
    cartItems: JSON.stringify(cartItems),
    shipping_method,
    shipping_address: shipping_address || '',
    pickup_location: pickup_location || ''
  });

const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/success?${params.toString()}`;

    console.log("Generated successUrl:", successUrl);
    console.log("Order ID to send:", orderId);

    const metadata = {
      orderId: orderId,
      email,
      customer_name,
      phone: phone || '',
      shipping_method: shipping_method || '',
      shipping_address: shipping_address || '',
      pickup_location: pickup_location || '',
      cartItems: JSON.stringify(cartItems)
    };

    console.log("Metadata being sent to Yoco:", JSON.stringify(metadata, null, 2));

    // Create Yoco checkout
    const yocoRes = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency: "ZAR",
        successUrl,
        cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
        customer: { 
          email,
          name: customer_name,
        },
        metadata,
      }),
    });

    const data = await yocoRes.json();

    if (!yocoRes.ok) {
      console.error("Yoco API error:", data);
      return NextResponse.json({ error: data.message || "Checkout failed" }, { status: 400 });
    }

    console.log("✅ Yoco checkout created:", yocoRes);

    const orderData = {
      order_id: orderId,
      yoco_checkout_id: data.id,
      status: "pending",
      total: parseFloat(amount),
      email,
      phone: phone || "",
      customer_name,
      amount,
      metadata,
      shipping_method: shipping_method || "",
      shipping_address: shipping_address || "",
      pickup_location: pickup_location || "",
      created_at: new Date().toISOString(),
    };

    console.log("Creating pending order:", orderData);

    const { data:newData, error: insertError } = await supabase
      .from("orders")
      .insert([orderData])
      .select()
      .single();

    if (insertError) {
      console.error("❌ Failed to create pending order:", insertError);
    }

    return NextResponse.json({ 
      redirectUrl: data.redirectUrl || data.redirect_url,
      orderId,
      yocoCheckoutId: data.id,
      status: "redirecting_to_payment"
    });
    
  } catch (error: unknown) {
    console.error("Checkout handler error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" }, 
      { status: 500 }
    );
  }
}