// app/api/admin/orders/route.ts
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match the frontend's expected shape
    const transformedOrders = orders.map((order: any) => {
      const metadata = order.metadata || {};

      // cartItems is stored as a JSON string in metadata
      let order_items: any[] = [];
      if (metadata.cartItems && typeof metadata.cartItems === 'string') {
        try {
          const parsed = JSON.parse(metadata.cartItems);
          if (Array.isArray(parsed)) {
            order_items = parsed.map((item: any) => ({
              id: item.id, // uuid string – fine for keys
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

      // Calculate total from items (more reliable than relying on a possibly missing top-level total)
      const total = order_items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        id: order.id, // assuming integer id (frontend expects number); adjust if uuid
        order_id: metadata.orderId || order.order_id || `ORD-${order.id}`,
        created_at: order.created_at,
        customer_name: metadata.customer_name || 'Unknown',
        email: metadata.email || '',
        phone: metadata.phone || '',
        total,
        status: order.status || 'pending',
        payment_status: order.payment_status || 'paid', // adjust if you have this column
        shipping_method: metadata.shipping_method || 'delivery',
        shipping_address: metadata.shipping_address || '',
        pickup_location: metadata.pickup_location || '',
        order_items,
      };
    });

    return NextResponse.json(transformedOrders);
  } catch (error: any) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}