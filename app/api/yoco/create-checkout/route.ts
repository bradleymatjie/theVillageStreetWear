import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { 
      amount, 
      email, 
      orderId, 
      customer_name, 
      phone, 
      cart_items, 
      shipping_method,
      shipping_address, 
      pickup_location, 
    } = await req.json();  // Expanded body for full order deets

    // Validate required fields
    if (!orderId || !amount || !email || !customer_name || !cart_items) {
      return NextResponse.json({ error: "Missing required fields: orderId, amount, email, customer_name, cart_items" }, { status: 400 });
    }

    const amountInCents = Math.round(parseFloat(amount) * 100); // Ensure numeric and in cents

    // Encode cart_items for URL param (JSON string + URI encode)
    const encodedCartItems = encodeURIComponent(JSON.stringify(cart_items || []));

    // Encode all URL params to prevent breaking on special characters
    const encodedEmail = encodeURIComponent(email);
    const encodedPhone = encodeURIComponent(phone);
    const encodedCustomerName = encodeURIComponent(customer_name);
    const encodedShippingMethod = encodeURIComponent(shipping_method || '');
    const encodedShippingAddress = encodeURIComponent(shipping_address || '');
    const encodedPickupLocation = encodeURIComponent(pickup_location || '');
    const encodedAmount = encodeURIComponent(amount.toFixed(2)); // Format for cleanliness
    const encodedOrderId = encodeURIComponent(orderId);

    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/success?orderId=${encodedOrderId}&amount=${encodedAmount}&email=${encodedEmail}&phone=${encodedPhone}&cartItems=${encodedCartItems}&customer_name=${encodedCustomerName}&shipping_method=${encodedShippingMethod}&shipping_address=${encodedShippingAddress}&pickup_location=${encodedPickupLocation}`;
    console.log("yoco: key: ", process.env.YOCO_SECRET_KEY);
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

    return NextResponse.json({ redirectUrl: data.redirectUrl || data.redirect_url });
  } catch (error: unknown) {
    // Safely narrow the error type
    if (error instanceof Error) {
      console.error("Update handler error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If it’s not an instance of Error
    console.error("Unknown error:", error);
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}