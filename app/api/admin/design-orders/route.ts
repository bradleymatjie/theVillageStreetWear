// app/api/admin/design-orders/route.ts
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

interface CartItem {
  name?: string;
  front?: string;
  back?: string;
  tshirt_color: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  elements?: any;
}

export async function GET() {
  try {
    const { data: orders, error } = await supabase
      .from('design_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch design orders' },
        { status: 500 }
      );
    }

    // Process and parse each order
    const processedOrders = orders.map((order: any) => {
      let cartItems: CartItem[] = [];

      try {
        const metadata = order.metadata || {};
        const rawCartItems =
          typeof metadata.cartItems === 'string'
            ? JSON.parse(metadata.cartItems)
            : metadata.cartItems || [];

        cartItems = Array.isArray(rawCartItems)
          ? rawCartItems.map((item: any) => ({
              name: item.name || 'Custom Design',
              front: item.front || '',
              back: item.back || '',
              tshirt_color: item.tshirt_color || 'white',
              price: Number(item.price) || 0,
              quantity: Number(item.quantity) || 1,
              selectedSize: item.selectedSize,
              elements: item.elements
                ? typeof item.elements === 'string'
                  ? JSON.parse(item.elements)
                  : item.elements
                : { front: [], back: [] },
            }))
          : [];
      } catch (parseError) {
        console.warn('⚠️ Failed to parse cartItems for order:', order.id, parseError);
        cartItems = [];
      }

      // Calculate total – use total_amount if stored in cents, otherwise fallback
      const totalInRand =
        order.total_amount !== undefined
          ? (order.total_amount / 100).toFixed(2)
          : order.amount
          ? order.amount.toFixed(2)
          : (cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)).toFixed(2);

      return {
        id: order.id,
        order_id: order.order_id || order.id,
        created_at: order.created_at,
        customer_name: order.customer_name || '',
        customer_email: order.customer_email || '',
        customer_phone: order.customer_phone || '',
        total: parseFloat(totalInRand),
        status: order.status || 'pending',
        payment_status: order.payment_status || 'pending',
        shipping_method: order.shipping_method || 'pickup',
        shipping_address: order.shipping_address || '',
        pickup_location: order.pickup_location || '',
        cartItems,
      };
    });

    return NextResponse.json(processedOrders);
  } catch (err) {
    console.error('🔥 Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}