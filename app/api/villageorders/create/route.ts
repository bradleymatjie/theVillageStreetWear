// app/api/orders/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client without auth checks
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageurl: string;
  selectedSize?: string;
  selectedMaterial?: string;
}

interface OrderData {
  orderId: string;
  amount: string;
  email: string;
  phone: string;
  customer_name: string;
  shipping_method: string;
  shipping_address: string;
  pickup_location: string;
  cartItems: CartItem[];
  paymentId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json();

    console.log('Received order data:', {
      orderId: orderData.orderId,
      email: orderData.email,
      itemCount: orderData.cartItems?.length
    });

    if (
      !orderData.email ||
      !orderData.orderId ||
      !orderData.customer_name ||
      !orderData.amount ||
      !Array.isArray(orderData.cartItems) ||
      orderData.cartItems.length === 0
    ) {
      return NextResponse.json(
        { 
          error: 'Missing or invalid required fields',
          received: {
            email: !!orderData.email,
            orderId: !!orderData.orderId,
            customer_name: !!orderData.customer_name,
            amount: !!orderData.amount,
            cartItems: Array.isArray(orderData.cartItems) ? orderData.cartItems.length : 'invalid'
          }
        },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = orderData.cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    
    const shippingCost = orderData.shipping_method === 'delivery' 
      ? (subtotal < 500 ? 75 : 0)
      : 0;
    
    const total = subtotal + shippingCost;

    console.log('Calculated totals:', { subtotal, shippingCost, total });

    // Check if order already exists
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('order_id', orderData.orderId)
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        orderId: orderData.orderId,
        message: 'Order already exists',
        warning: 'Duplicate order detected'
      });
    }

    // 1. Insert order into database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_id: orderData.orderId,
        customer_name: orderData.customer_name,
        email: orderData.email,
        phone: orderData.phone || '',
        amount: parseFloat(orderData.amount),
        subtotal: subtotal,
        shipping_cost: shippingCost,
        total: total,
        shipping_method: orderData.shipping_method,
        shipping_address: orderData.shipping_method === 'delivery' ? orderData.shipping_address : null,
        pickup_location: orderData.shipping_method === 'pickup' ? orderData.pickup_location : null,
        status: 'pending',
        payment_status: 'paid',
        metadata: {
          payment_id: orderData.paymentId || null,
          source: 'yoco_checkout',
          cart_items_count: orderData.cartItems.length
        }
      })
      .select()
      .single();

    if (orderError) {
      console.error('Database order error:', orderError);
      return NextResponse.json(
        { 
          error: 'Failed to create order record', 
          details: orderError.message,
          hint: orderError.hint,
          code: orderError.code
        },
        { status: 500 }
      );
    }

    console.log('Order created successfully:', order.id);

    // 2. Insert order items
    const orderItems = orderData.cartItems.map(item => ({
      order_id: order.id,
      product_id: item.id || `product_${Math.random().toString(36).substr(2, 9)}`,
      name: item.name || 'Unknown Product',
      price: item.price || 0,
      quantity: item.quantity || 1,
      image_url: item.imageurl || '',
      selected_size: item.selectedSize || null,
      selected_material: item.selectedMaterial || null
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Database items error:', itemsError);
      
      // Try to delete the order if items fail
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', order.id);

      return NextResponse.json(
        { 
          error: 'Failed to save order items', 
          details: itemsError.message,
          hint: itemsError.hint
        },
        { status: 500 }
      );
    }

    console.log('Order items saved successfully:', orderItems.length, 'items');

    return NextResponse.json({
      success: true,
      orderId: order.order_id,
      databaseId: order.id,
      message: 'Order saved successfully',
      orderSummary: {
        customer: order.customer_name,
        email: order.email,
        total: order.total,
        status: order.status
      }
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}