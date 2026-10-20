import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supebase/server";
import { supabaseAdmin } from "@/lib/supebase/admin";
import { parseCheckoutItems, priceCheckout, moneyToCents } from "@/app/lib/checkout-pricing";

export async function POST(req: Request) {
  let createdOrderId: string | null = null;
  try {
    const auth = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await auth.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Sign in before checking out." }, { status: 401 });
    if (!process.env.YOCO_SECRET_KEY || !process.env.YOCO_WEBHOOK_SECRET || !process.env.NEXT_PUBLIC_BASE_URL) return NextResponse.json({ error: "Payments are not configured. Please contact support." }, { status: 503 });
    const body = await req.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
    const method = body.shipping_method;
    if (method !== "delivery" && method !== "pickup") return NextResponse.json({ error: "Choose delivery or pickup." }, { status: 400 });
    const name = typeof body.customer_name === "string" ? body.customer_name.trim() : "";
    const address = typeof body.shipping_address === "string" ? body.shipping_address.trim() : "";
    const phone = typeof body.customer_phone === "string" ? body.customer_phone.trim() : "";
    if (!user.email || name.length < 2 || name.length > 120 || phone.length > 40 || (method === "delivery" && (!address || address.length > 1000))) return NextResponse.json({ error: "Complete your contact and delivery details." }, { status: 400 });
    let items;
    try { items = parseCheckoutItems(body.cartItems); } catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 400 }); }
    const { data: products, error: productError } = await supabaseAdmin.from("thevillageproducts").select("*").in("id", [...new Set(items.map(item => item.product_id))]);
    if (productError) throw productError;
    let pricing;
    try { pricing = priceCheckout(items, products || [], method); } catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 400 }); }
    // The displayed amount must agree, but the amount sent to Yoco is always server-calculated.
    try {
      if (moneyToCents(body.total_amount) !== pricing.totalCents) return NextResponse.json({ error: "Prices or delivery charges have changed. Refresh your cart before paying." }, { status: 409 });
    } catch { return NextResponse.json({ error: "Invalid checkout total." }, { status: 400 }); }
    let pickupLocation = "";
    if (method === "pickup") {
      const { data: brand, error } = await supabaseAdmin.from("brands").select("street_address, location_city, location_province, location_country").eq("id", pricing.brandId).maybeSingle();
      if (error) throw error;
      if (!brand?.street_address || !brand.location_city || !brand.location_province) return NextResponse.json({ error: "Pickup is not available for this brand." }, { status: 400 });
      pickupLocation = [brand.street_address, brand.location_city, brand.location_province, brand.location_country].filter(Boolean).join(", ");
    }
    const orderNumber = `VIL-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const timestamp = new Date().toISOString();
    const { data: order, error: insertError } = await supabaseAdmin.from("orders").insert({
      order_id: orderNumber, customer_id: user.id, brand_id: pricing.brandId,
      customer_name: name, email: user.email, phone,
      amount: pricing.subtotalCents / 100, subtotal: pricing.subtotalCents / 100,
      shipping_cost: pricing.deliveryCents / 100, delivery_fee: pricing.deliveryCents / 100,
      total: pricing.totalCents / 100, total_amount: pricing.totalCents / 100,
      payment_status: "pending", order_status: "pending_payment", status: "pending",
      shipping_method: method, shipping_address: method === "delivery" ? address : "", pickup_location: pickupLocation,
      metadata: { cartItems: pricing.cartItems }, created_at: timestamp, updated_at: timestamp,
    }).select("id").single();
    if (insertError || !order) throw insertError || new Error("Order could not be created.");
    createdOrderId = order.id;
    const baseUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL);
    if (!['https:', 'http:'].includes(baseUrl.protocol) || (baseUrl.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(baseUrl.hostname))) throw new Error("Invalid payment return URL.");
    const successUrl = new URL("/success", baseUrl);
    successUrl.searchParams.set("order_id", order.id);
    const response = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.YOCO_SECRET_KEY}` },
      body: JSON.stringify({ amount: pricing.totalCents, currency: "ZAR", successUrl: successUrl.toString(), cancelUrl: new URL("/checkout", baseUrl).toString(), customer: { email: user.email, name }, metadata: { order_id: order.id, order_number: orderNumber, brand_id: pricing.brandId, customer_id: user.id } }),
      signal: AbortSignal.timeout(20000),
    });
    const checkout = await response.json();
    const redirectUrl = checkout.redirectUrl || checkout.redirect_url;
    if (!response.ok || typeof checkout.id !== "string" || typeof redirectUrl !== "string" || !redirectUrl.startsWith("https://")) throw new Error("Yoco checkout could not be started.");
    const { error: updateError } = await supabaseAdmin.from("orders").update({ yoco_checkout_id: checkout.id, updated_at: new Date().toISOString() }).eq("id", order.id);
    if (updateError) throw updateError;
    return NextResponse.json({ redirectUrl, orderId: order.id, orderNumber }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Checkout failed:", error instanceof Error ? error.message : "Unexpected error");
    if (createdOrderId) {
      // Keep failed attempts for reconciliation; do not delete financial records.
      await supabaseAdmin.from("orders").update({ payment_status: "failed", updated_at: new Date().toISOString() }).eq("id", createdOrderId).neq("payment_status", "paid");
    }
    return NextResponse.json({ error: error instanceof SyntaxError ? "Invalid checkout request." : "Checkout could not be started. Please try again." }, { status: error instanceof SyntaxError ? 400 : 502 });
  }
}
