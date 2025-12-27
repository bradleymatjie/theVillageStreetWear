// app/api/my-orders/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TransformedOrder {
  order_id: string;
  created_at: string;
  customer_name: string;
  email: string;
  phone: string;
  total: number;
  status: string;
  shipping_method: "delivery" | "pickup";
  shipping_address: string;
  pickup_location: string;
  order_items: {
    name: string;
    price: number;
    quantity: number;
    image_url: string;
    selected_size?: string;
    selected_material?: string;
  }[];
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .ilike('metadata->>email', normalizedEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!orders || orders.length === 0) {
      return NextResponse.json([]);
    }

    const transformedOrders: TransformedOrder[] = orders.map((order: any) => {
      const metadata = order.metadata || {};

      // Parse cartItems (JSON string)
      let order_items: TransformedOrder['order_items'] = [];
      if (metadata.cartItems && typeof metadata.cartItems === 'string') {
        try {
          const parsed = JSON.parse(metadata.cartItems);
          if (Array.isArray(parsed)) {
            order_items = parsed.map((item: any) => ({
              name: item.name,
              price: Number(item.price) || 0,
              quantity: Number(item.quantity) || 1,
              image_url: item.imageurl || '/noImage.jpg',
              selected_size: item.selectedSize,
              selected_material: item.selectedMaterial,
            }));
          }
        } catch (parseError) {
          console.error('Failed to parse cartItems for order:', order.id, parseError);
        }
      }

      const total = order_items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      return {
        order_id: metadata.orderId || `ORD-${order.id}`,
        created_at: order.created_at,
        customer_name: metadata.customer_name || 'Customer',
        email: metadata.email || '',
        phone: metadata.phone || '',
        total,
        status: order.status || 'pending',
        shipping_method: (metadata.shipping_method || 'delivery') as "delivery" | "pickup",
        shipping_address: metadata.shipping_address || '',
        pickup_location: metadata.pickup_location || '',
        order_items,
      };
    });

    return NextResponse.json(transformedOrders);
  } catch (error: any) {
    console.error('My orders fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}