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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  console.log('✅ Order ID from params:', orderId);

  if (!orderId) {
    return NextResponse.json(
      { error: 'Order ID is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch order from Supabase
    const { data: order, error } = await supabase
      .from('design_orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      console.error('❌ Supabase fetch error:', error);
      return NextResponse.json(
        { error: 'Order not found', details: error.message },
        { status: 404 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Safely parse cart items
    let cartItems: CartItem[] = [];
    try {
      const metadata = order.metadata as OrderMetadata;
      const rawCartItems = typeof metadata.cartItems === 'string' 
        ? JSON.parse(metadata.cartItems) 
        : metadata.cartItems;

      cartItems = rawCartItems?.map((item: any) => {
        // Safely parse elements if it's a string
        let elements = { front: [], back: [] };
        if (item.elements) {
          if (typeof item.elements === 'string') {
            try {
              elements = JSON.parse(item.elements);
            } catch (parseError) {
              console.warn('⚠️ Failed to parse elements for item:', item.name, parseError);
            }
          } else {
            elements = item.elements;
          }
        }

        return {
          name: item.name || 'Custom T-Shirt',
          front: item.front || '',
          back: item.back || '',
          tshirt_color: item.tshirt_color || 'white',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          elements,
        };
      }) || [];
    } catch (parseError) {
      console.error('❌ Failed to parse cart items:', parseError);
      return NextResponse.json(
        { error: 'Invalid order data format' },
        { status: 500 }
      );
    }

    const orderData = {
      orderId: order.id,
      amount: order.total_amount
        ? (order.total_amount / 100).toFixed(2)
        : order.amount || '0',
      email: order.customer_email,
      phone: order.customer_phone || '',
      customer_name: order.customer_name,
      shipping_method: order.shipping_method,
      shipping_address: order.shipping_address || '',
      pickup_location: order.pickup_location || '',
      cartItems,
      payment_status: order.payment_status || 'pending',
      payment_reference: order.payment_reference || order.yoco_checkout_id || '',
      date: order.created_at,
    };

    return NextResponse.json(orderData);
  } catch (err) {
    console.error('🔥 Unexpected error:', err);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}