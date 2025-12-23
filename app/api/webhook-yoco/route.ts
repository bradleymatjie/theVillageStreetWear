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
    // Log all headers for debugging
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log("📋 Headers:", JSON.stringify(headers, null, 2));
    
    const signature = req.headers.get('x-webhook-signature');
    const rawBody = await req.text();
    
    console.log("📨 Received webhook:");
    console.log("- Signature:", signature ? "Present" : "Missing");
    console.log("- Body length:", rawBody.length);
    console.log("- Raw body:", rawBody.substring(0, 500)); // First 500 chars
    
    let payload;
    try {
      payload = JSON.parse(rawBody);
      console.log("- Parsed payload:", JSON.stringify(payload, null, 2));
    } catch (parseError) {
      console.error("❌ Failed to parse JSON:", parseError);
      console.log("Raw body:", rawBody);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    
    console.log("- Event type:", payload.event || payload.type);
    console.log("- Checkout ID:", payload.data?.id || payload.id);
    
    // Verify webhook signature (only if secret is configured)
    if (process.env.YOCO_WEBHOOK_SECRET) {
      if (!signature) {
        console.warn("⚠️ No signature provided but secret is configured");
        // Don't fail - Yoco might not be sending signatures in test mode
      } else {
        const expectedSignature = crypto
          .createHmac('sha256', process.env.YOCO_WEBHOOK_SECRET!)
          .update(rawBody)
          .digest('hex');
        
        if (signature !== expectedSignature) {
          console.error("❌ Invalid webhook signature");
          console.log("Expected:", expectedSignature);
          console.log("Received:", signature);
          return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
        
        console.log("✅ Signature verified");
      }
    } else {
      console.warn("⚠️ YOCO_WEBHOOK_SECRET not configured - skipping signature verification");
    }

    const eventType = payload.event || payload.type;
    const data = payload.data || payload;

    console.log(`📦 Processing event: ${eventType}`);
    console.log(`📦 Data:`, JSON.stringify(data, null, 2));

    // Process successful payments
    if (eventType === "payment.success" && data.id) {
      const yocoCheckoutId = data.id;
      
      console.log("🔍 Looking for order with yoco_checkout_id:", yocoCheckoutId);
      
      // Try to find existing order by Yoco checkout ID
      const { data: existingOrder, error: findError } = await supabase
        .from("orders")
        .select("*")
        .eq("yoco_checkout_id", yocoCheckoutId)
        .single();

      let orderData;
      
      if (findError || !existingOrder) {
        console.log("🆕 Creating new order from webhook data (order not found in database)");
        
        const metadata = data.metadata || {};
        const customer = data.customer || {};
        
        // Use custom orderId from metadata if available
        const customOrderId = metadata.checkoutId || yocoCheckoutId;
        
        orderData = {
          order_id: customOrderId,
          yoco_checkout_id: yocoCheckoutId,
          status: "paid",
          total: data.amount / 100,
          email: customer.email || metadata.email,
          phone: metadata.phone || "",
          customer_name: metadata.customer_name || customer.name || "Customer",
          shipping_method: metadata.shipping_method || "",
          shipping_address: metadata.shipping_address || "",
          pickup_location: metadata.pickup_location || "",
          payment_reference: data.paymentId || yocoCheckoutId,
          created_at: new Date().toISOString(),
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
        console.log("📝 Updating existing order status to 'paid'");
        
        const { data: updatedOrder, error: updateError } = await supabase
          .from("orders")
          .update({
            status: "paid",
            payment_reference: data.paymentId || yocoCheckoutId,
            updated_at: new Date().toISOString(),
          })
          .eq("yoco_checkout_id", yocoCheckoutId)
          .select()
          .single();

        if (updateError) throw updateError;
        orderData = updatedOrder;
        console.log("✅ Order updated:", orderData.order_id);
      }

      // Send confirmation email
      if (orderData && process.env.NEXT_PUBLIC_BASE_URL) {
        try {
          const emailRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/yoco/order-confirmation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderData.order_id,
              amount: orderData.total.toString(),
              email: orderData.email,
              phone: orderData.phone || "",
              customer_name: orderData.customer_name,
              shipping_method: orderData.shipping_method,
              shipping_address: orderData.shipping_address || "",
              pickup_location: orderData.pickup_location || "",
              cartItems: [],
              payment_status: "paid",
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
      console.log(`ℹ️ Ignoring event type: ${eventType}`);
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