// app/api/webhook-yoco/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // Verify webhook signature (CRITICAL for security)
    const signature = req.headers.get('x-webhook-signature');
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    
    // Verify the signature matches Yoco's webhook secret
    const expectedSignature = crypto
      .createHmac('sha256', process.env.YOCO_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const eventType = payload.event;
    const data = payload.data;

    console.log(`📦 Webhook received: ${eventType} for checkout ${data.id}`);

    // Only process successful payments
    if (eventType === "payment.success" && data.id) {
      const checkoutId = data.id;
      
      // Try to find existing order first
      const { data: existingOrder, error: findError } = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", checkoutId)
        .single();

      let orderData;
      
      if (findError || !existingOrder) {
        // Order doesn't exist - create it from webhook data
        console.log("🆕 Creating new order from webhook data");
        
        // Extract order details from metadata or webhook payload
        const metadata = data.metadata || {};
        const customer = data.customer || {};
        
        orderData = {
          order_id: checkoutId,
          status: "paid",
          total: data.amount / 100, // Convert cents to Rand
          email: customer.email || metadata.email,
          phone: metadata.phone || "",
          customer_name: metadata.customer_name || customer.name || "Customer",
          shipping_method: metadata.shipping_method || "",
          shipping_address: metadata.shipping_address || "",
          pickup_location: metadata.pickup_location || "",
          payment_reference: data.paymentId || checkoutId,
          created_at: new Date().toISOString(),
        };

        // Insert new order
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
        
        // If you have cart items in metadata, create order items
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
            
            await supabase
              .from("order_items")
              .insert(orderItems);
              
            console.log(`✅ Created ${orderItems.length} order items`);
          } catch (itemsError) {
            console.error("Failed to create order items:", itemsError);
            // Continue anyway - the order is still created
          }
        }
      } else {
        // Order exists - update it
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
      }

      // Send confirmation email
      if (orderData) {
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
            cartItems: [], // You might need to fetch these from order_items
            payment_status: "paid",
          }),
        });

        if (!emailRes.ok) {
          const errorText = await emailRes.text();
          console.error("❌ Email sending failed:", errorText);
        } else {
          console.log("✅ Order confirmation email sent");
        }
      }
    }

    return NextResponse.json({ success: true });
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