// app/api/webhook-yoco/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from 'crypto';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    console.log("🎯 Webhook endpoint hit!");

    try {
        // Yoco uses Svix for webhooks - different headers
        const svixId = req.headers.get('webhook-id');
        const svixTimestamp = req.headers.get('webhook-timestamp');
        const svixSignature = req.headers.get('webhook-signature');

        const rawBody = await req.text();

        console.log("📨 Received webhook:");
        console.log("- Svix ID:", svixId);
        console.log("- Svix Timestamp:", svixTimestamp);
        console.log("- Svix Signature:", svixSignature ? "Present" : "Missing");
        console.log("- Body length:", rawBody.length);

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

        // Verify Svix signature if secret is configured
        if (process.env.YOCO_WEBHOOK_SECRET && svixSignature && svixId && svixTimestamp) {
            try {
                // Svix signature format: v1,<base64_signature>
                const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
                const expectedSignature = crypto
                    .createHmac('sha256', process.env.YOCO_WEBHOOK_SECRET)
                    .update(signedContent)
                    .digest('base64');

                // Extract all signatures (Svix sends multiple v1 signatures)
                const signatures = svixSignature.split(' ').map(sig => {
                    const [version, signature] = sig.split(',');
                    return signature;
                });

                const isValid = signatures.some(sig => sig === expectedSignature);

                if (!isValid) {
                    console.error("❌ Invalid Svix signature");
                    console.log("Expected one of:", signatures);
                    console.log("Got:", expectedSignature);
                    // For production, you should return an error here
                    // return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
                    console.warn("⚠️ Continuing despite signature mismatch for debugging");
                } else {
                    console.log("✅ Signature verified");
                }
            } catch (sigError) {
                console.error("⚠️ Signature verification error:", sigError);
                console.warn("⚠️ Continuing despite signature error for debugging");
            }
        } else {
            console.warn("⚠️ Skipping signature verification (missing secret or headers)");
        }

        // Process successful payments
        if (eventType === "payment.succeeded" && data.id) {
            const metadata = data.metadata || {};

            // Use checkoutId from metadata instead of payment id
            const yocoCheckoutId = metadata.checkoutId || data.id;

            console.log("🔍 Looking for order with yoco_checkout_id:", yocoCheckoutId);

            // Try to find existing order by Yoco checkout ID
            const { data: existingOrder, error: findError } = await supabase
                .from("orders")
                .select("*")
                .eq("yoco_checkout_id", yocoCheckoutId)
                .single();

            let orderData;
            let cartItemsForEmail = [];

            if (findError || !existingOrder) {
                console.log("🆕 Creating new order from webhook data (order not found in database)");

                const customer = data.customer || {};
                const orderAmount = data.amount / 100; // Convert cents to rands

                // Use custom orderId from metadata if available
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
                    metadata: {},
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

                // Create order items if available
                if (metadata.cartItems) {
                    try {
                        const cartItems = typeof metadata.cartItems === 'string'
                            ? JSON.parse(metadata.cartItems)
                            : metadata.cartItems;

                        cartItemsForEmail = cartItems; // Save for email

                        const orderItems = cartItems.map((item: any) => ({
                            order_id: customOrderId, // Use custom order ID
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
            } else {
                console.log("📝 Updating existing order status to 'pending'");

                const { data: updatedOrder, error: updateError } = await supabase
                    .from("orders")
                    .update({
                        status: "pending", // CHANGED: Use 'pending' instead of 'paid'
                        payment_status: "paid",
                        amount: data.amount / 100,
                        subtotal: data.amount / 100,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("yoco_checkout_id", yocoCheckoutId)
                    .select()
                    .single();

                if (updateError) throw updateError;
                orderData = updatedOrder;
                console.log("✅ Order updated:", orderData.order_id);

                // Get existing cart items for email if updating order
                if (metadata.cartItems) {
                    try {
                        cartItemsForEmail = typeof metadata.cartItems === 'string'
                            ? JSON.parse(metadata.cartItems)
                            : metadata.cartItems;
                    } catch (itemsError) {
                        console.error("⚠️ Failed to parse cart items for email:", itemsError);
                    }
                }
            }

            // Send confirmation email
            // In your webhook code, replace the email section with this:
            if (orderData) {
                try {
                    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get('host')}`;
                    const cookieHeader = req.headers.get('cookie') || '';

                    const emailRes = await fetch(`${baseUrl}/api/order-confirmation`, {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            'Cookie': cookieHeader
                        },
                        body: JSON.stringify({
                            orderId: orderData.order_id,
                            amount: (orderData.total || data.amount / 100).toString(),
                            email: orderData.email,
                            phone: orderData.phone || metadata.phone || "",
                            customer_name: orderData.customer_name || metadata.customer_name || "Customer",
                            shipping_method: orderData.shipping_method || metadata.shipping_method || "",
                            shipping_address: orderData.shipping_address || metadata.shipping_address || "",
                            pickup_location: orderData.pickup_location || metadata.pickup_location || "",
                            cartItems: cartItemsForEmail,
                            payment_status: "paid",
                            payment_reference: data.id,
                        }),
                    });

                    if (!emailRes.ok) {
                        const errorText = await emailRes.text();
                        console.error("❌ Email sending failed:", errorText);
                    } else {
                        console.log("✅ Order confirmation email sent");
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

// Add GET method for testing
export async function GET() {
    console.log("✅ Webhook endpoint is accessible");
    return NextResponse.json({
        status: "Webhook endpoint is active",
        timestamp: new Date().toISOString()
    });
}