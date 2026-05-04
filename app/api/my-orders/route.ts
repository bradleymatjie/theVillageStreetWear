// app/api/my-orders/route.ts

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { customer_id, email } = await request.json();

    if (!customer_id && !email) {
      return NextResponse.json(
        { error: "Customer ID or email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email?.trim().toLowerCase();

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .or(
        `customer_id.eq.${customer_id},email.eq.${normalizedEmail},metadata->>customer_id.eq.${customer_id}`
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    const transformedOrders = (orders || []).map((order: any) => {
      const metadata = order.metadata || {};
      const cartItems = metadata.cartItems || [];

      const order_items = Array.isArray(cartItems)
        ? cartItems.map((item: any) => ({
            name: item.product_name || item.name,
            price: Number(item.unit_price || item.price) || 0,
            quantity: Number(item.quantity) || 1,
            image_url: item.product_image || item.imageurl || "/noImage.jpg",
            selected_size: item.size || item.selectedSize,
            selected_material: item.material || item.selectedMaterial,
          }))
        : [];

      return {
        id: order.id,
        order_id: order.order_id,
        created_at: order.created_at,
        customer_name: order.customer_name,
        email: order.email,
        phone: order.phone,
        total: Number(order.total || order.total_amount || 0),
        status: order.order_status || order.status || "pending",
        payment_status: order.payment_status || "pending",
        shipping_method: order.shipping_method || "delivery",
        shipping_address: order.shipping_address || "",
        pickup_location: order.pickup_location || "",
        order_items,
      };
    });

    return NextResponse.json(transformedOrders);
  } catch (error: any) {
    console.error("My orders fetch error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}