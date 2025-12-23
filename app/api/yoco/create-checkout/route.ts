// app/api/yoco/create-checkout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    console.log("Order ID to send:", orderId);

    const metadata = {
      orderId: orderId, // Use 'orderId' instead of 'checkoutId' to avoid conflicts
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

    console.log("✅ Yoco checkout created:", data.id);

    // CRITICAL: Create order in database with "pending" status
    // Store BOTH your orderId AND Yoco's checkout ID
    const orderData = {
      order_id: orderId, // Your custom ID (for success page)
      yoco_checkout_id: data.id, // Yoco's checkout ID (for webhook lookup)
      status: "pending",
      total: parseFloat(amount),
      email,
      phone: phone || "",
      customer_name,
      shipping_method: shipping_method || "",
      shipping_address: shipping_address || "",
      pickup_location: pickup_location || "",
      payment_reference: null, // Will be set by webhook
      created_at: new Date().toISOString(),
    };

    console.log("Creating pending order:", orderData);

    const { data: newOrder, error: insertError } = await supabase
      .from("orders")
      .insert([orderData])
      .select()
      .single();

    if (insertError) {
      console.error("❌ Failed to create pending order:", insertError);
      // Continue anyway - webhook can still create it
    } else {
      console.log("✅ Pending order created:", orderId, "with Yoco ID:", data.id);

      // Create order items
      try {
        const orderItems = cartItems.map((item: any) => ({
          order_id: orderId, // Link to your custom order ID
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.imageurl || "/noImage.jpg",
          selected_size: item.selectedSize || null,
          selected_material: item.selectedMaterial || null,
        }));

        await supabase.from("order_items").insert(orderItems);
        console.log(`✅ Created ${orderItems.length} order items`);
      } catch (itemsError) {
        console.error("⚠️ Failed to create order items:", itemsError);
      }
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