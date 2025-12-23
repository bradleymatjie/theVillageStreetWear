// app/api/webhook-yoco/route.ts
import { NextResponse } from "next/server";
import crypto from 'crypto';
import { supabase } from "@/lib/supabaseClient";


export async function POST(req: Request) {
  console.log("🎯 Webhook endpoint hit!");
  
  try {
    const signature = req.headers.get('x-webhook-signature');
    const rawBody = await req.text();
    
    console.log("📨 Received webhook:");
    console.log("- Signature:", signature ? "Present" : "Missing");
    console.log("- Body length:", rawBody.length);
    
    const payload = JSON.parse(rawBody);
    console.log("- Event type:", payload.event);
    console.log("- Checkout ID:", payload.data?.id);
    
    // Verify webhook signature
    if (!process.env.YOCO_WEBHOOK_SECRET) {
      console.error("❌ YOCO_WEBHOOK_SECRET not configured!");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }
    
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

    const eventType = payload.event;
    const data = payload.data;

    console.log(`📦 Processing event: ${eventType} for checkout ${data.id}`);

    // Process successful payments
    if (eventType === "payment.success" && data.id) {
      const checkoutId = data.id;
      
      // Try to find existing order
      const { data: existingOrder, error: findError } = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", checkoutId)
        .single();

      let orderData;
      
      if (findError || !existingOrder) {
        console.log("🆕 Creating new order from webhook data");
        
        const metadata = data.metadata || {};
        const customer = data.customer || {};
        
        orderData = {
          order_id: checkoutId,
          status: "paid",
          total: data.amount / 100,
          email: customer.email || metadata.email,
          phone: metadata.phone || "",
          customer_name: metadata.customer_name || customer.name || "Customer",
          shipping_method: metadata.shipping_method || "",
          shipping_address: metadata.shipping_address || "",
          pickup_location: metadata.pickup_location || "",
          payment_reference: data.paymentId || checkoutId,
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
              order_id: checkoutId,
              product_id: item.id,
              product_name: item.name,
              price: item.price,
              quantity: item.quantity,
              image_url: item.imageurl,
              selected_size: item.selectedSize,
              selected_material: item.selectedMaterial,
            }));
            
            await supabase.from("order_items").insert(orderItems);
            console.log(`✅ Created ${orderItems.length} order items`);
          } catch (itemsError) {
            console.error("⚠️ Failed to create order items:", itemsError);
          }
        }
      } else {
        console.log("📝 Updating existing order status");
        
        const { data: updatedOrder, error: updateError } = await supabase
          .from("orders")
          .update({
            status: "paid",
            payment_reference: data.paymentId || checkoutId,
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", checkoutId)
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