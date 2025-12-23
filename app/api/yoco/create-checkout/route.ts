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

    // Validate required fields
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

    // STRIP imageurl FOR successUrl TO PREVENT TRUNCATION
    const strippedCartItems = cartItems.map(item => {
      const { imageurl, ...rest } = item; // eslint-disable-line @typescript-eslint/no-unused-vars
      return rest;
    });
    const encodedCartItems = encodeURIComponent(JSON.stringify(strippedCartItems));

    // Encode other params
    const encodedEmail = encodeURIComponent(email);
    const encodedPhone = encodeURIComponent(phone || '');
    const encodedCustomerName = encodeURIComponent(customer_name);
    const encodedShippingMethod = encodeURIComponent(shipping_method || '');
    const encodedShippingAddress = encodeURIComponent(shipping_address || '');
    const encodedPickupLocation = encodeURIComponent(pickup_location || '');
    const encodedAmount = encodeURIComponent(parseFloat(amount).toFixed(2));
    const encodedOrderId = encodeURIComponent(orderId);

    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/success?orderId=${encodedOrderId}&amount=${encodedAmount}&email=${encodedEmail}&phone=${encodedPhone}&cartItems=${encodedCartItems}&customer_name=${encodedCustomerName}&shipping_method=${encodedShippingMethod}&shipping_address=${encodedShippingAddress}&pickup_location=${encodedPickupLocation}`;

    // DEBUG URL length
    console.log("Generated successUrl length:", successUrl.length);

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
        customer: { email },
        metadata: { checkoutId: orderId },
      }),
    });

    const data = await yocoRes.json();

    if (!yocoRes.ok) {
      console.error("Yoco API error:", data);
      return NextResponse.json({ error: data.message || "Checkout failed" }, { status: 400 });
    }

    // SEND ORDER CONFIRMATION EMAIL IMMEDIATELY AFTER SUCCESSFUL CHECKOUT CREATION
    // We use the FULL cartItems (with imageurl) for the email – body can be large, no truncation issue
    const orderEmailData = {
      orderId,
      amount: parseFloat(amount).toFixed(2),
      email,
      phone: phone || '',
      customer_name,
      shipping_method: shipping_method || '',
      shipping_address: shipping_address || '',
      pickup_location: pickup_location || '',
      cartItems,
    };

    try {
      const emailRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/yoco/order-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderEmailData),
      });

      if (!emailRes.ok) {
        const errData = await emailRes.json().catch(() => ({}));
        console.error("Confirmation email send failed:", errData);
      } else {
        console.log("Order confirmation email sent successfully (pre-payment)");
      }
    } catch (emailErr) {
      console.error("Error triggering confirmation email:", emailErr);
    }

    return NextResponse.json({ redirectUrl: data.redirectUrl || data.redirect_url });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Checkout handler error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error("Unknown error:", error);
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}