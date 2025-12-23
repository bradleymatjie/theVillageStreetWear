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

    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/success?orderId=${encodeURIComponent(orderId)}`;

    console.log("Generated successUrl:", successUrl);

    const metadata = {
      checkoutId: orderId,
      email,
      customer_name,
      phone: phone || '',
      shipping_method: shipping_method || '',
      shipping_address: shipping_address || '',
      pickup_location: pickup_location || '',
      cartItems: JSON.stringify(cartItems.map(item => {
        const { imageurl, ...rest } = item;
        return rest;
      }))
    };

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
        metadata, // Send all data to webhook via metadata
      }),
    });

    const data = await yocoRes.json();

    if (!yocoRes.ok) {
      console.error("Yoco API error:", data);
      return NextResponse.json({ error: data.message || "Checkout failed" }, { status: 400 });
    }

    // ✅ REMOVED: Order creation and email sending
    // DO NOT create order or send email here
    // Let the webhook handle it after payment

    return NextResponse.json({ 
      redirectUrl: data.redirectUrl || data.redirect_url,
      orderId,
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