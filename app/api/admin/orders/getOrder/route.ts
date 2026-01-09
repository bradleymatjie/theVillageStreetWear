import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

interface CartItem {
  name: string;
  front: string;
  back: string;
  tshirt_color: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedMaterial?: string;
  elements?: {
    front: any[];
    back: any[];
  };
}

interface OrderMetadata {
  cartItems: string | CartItem[];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const customer_email = url.searchParams.get('email');

  if (!customer_email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const { data: orders, error } = await supabase
      .from('design_orders')
      .select('*')
      .eq('customer_email', customer_email.toLowerCase()); // Remove .toLowerCase() if emails aren't stored lowercase

    if (error) {
      console.error('❌ Supabase fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: error.message },
        { status: 500 }
      );
    }

    // Process each order (handles multiple)
    const processedOrders = orders.map((order: any) => {
      let cartItems: CartItem[] = [];

      try {
        const metadata: OrderMetadata = order.metadata || {};
        const rawCartItems = typeof metadata.cartItems === 'string'
          ? JSON.parse(metadata.cartItems)
          : metadata.cartItems;

        if (Array.isArray(rawCartItems)) {
          cartItems = rawCartItems.map((item: any) => {
            let elements = { front: [], back: [] };
            if (item.elements) {
              try {
                elements = typeof item.elements === 'string'
                  ? JSON.parse(item.elements)
                  : item.elements;
              } catch (e) {
                console.warn('⚠️ Failed to parse elements for item:', item.name);
              }
            }

            return {
              name: item.name || 'Custom T-Shirt',
              front: item.front || '',
              back: item.back || '',
              tshirt_color: item.tshirt_color || 'white',
              price: Number(item.price) || 0,
              quantity: Number(item.quantity) || 1,
              selectedSize: item.selectedSize,
              selectedMaterial: item.selectedMaterial,
              elements,
            };
          });
        }
      } catch (parseError) {
        console.error('❌ Failed to parse cart items for order:', order.id, parseError);
        cartItems = [];
      }

      return {
        orderId: order.id,
        amount: order.total_amount
          ? (order.total_amount / 100).toFixed(2)
          : '0.00',
        email: order.customer_email,
        phone: order.customer_phone || '',
        customer_name: order.customer_name || '',
        shipping_method: order.shipping_method || '',
        shipping_address: order.shipping_address || '',
        pickup_location: order.pickup_location || '',
        cartItems,
        payment_status: order.payment_status || 'pending',
        payment_reference: order.payment_reference || order.yoco_checkout_id || '',
        date: order.created_at,
      };
    });

    return NextResponse.json(processedOrders); // Returns array, even if empty
  } catch (err) {
    console.error('🔥 Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}