import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // Validate required fields based on your schema
    if (!orderData.order_number || !orderData.customer_email || !orderData.total) {
      return NextResponse.json(
        { error: 'Missing required order fields: order_number, customer_email, and total are required' },
        { status: 400 }
      );
    }
     
    if (!orderData.customer_name) {
      return NextResponse.json(
        { error: 'customer_name is required' },
        { status: 400 }
      );
    }

    if (!orderData.customer_phone) {
      return NextResponse.json(
        { error: 'customer_phone is required' },
        { status: 400 }
      );
    }

    if (!orderData.shipping_address) {
      return NextResponse.json(
        { error: 'shipping_address is required' },
        { status: 400 }
      );
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'items array is required and must contain at least one item' },
        { status: 400 }
      );
    }

    if (!orderData.subtotal || orderData.subtotal <= 0) {
      return NextResponse.json(
        { error: 'Valid subtotal is required' },
        { status: 400 }
      );
    }

    if (!orderData.total || orderData.total <= 0) {
      return NextResponse.json(
        { error: 'Valid total is required' },
        { status: 400 }
      );
    }

    const subtotal = parseFloat(orderData.subtotal);
    const shippingCost = parseFloat(orderData.shipping_cost || 0);
    const total = parseFloat(orderData.total);

    if (isNaN(subtotal) || isNaN(shippingCost) || isNaN(total)) {
      return NextResponse.json(
        { error: 'Invalid numeric values in subtotal, shipping_cost, or total' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('design_orders')
      .insert([
        {
          order_number: orderData.order_number,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          shipping_address: orderData.shipping_address,
          items: orderData.items,
          subtotal: subtotal,
          shipping_cost: shippingCost,
          total: total,
          payment_status: orderData.payment_status || 'pending',
          payment_id: orderData.payment_id || null,
          status: orderData.status || 'pending',
          notes: orderData.notes || null,
          created_at: orderData.created_at || new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      
      // Handle specific errors
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { 
            error: 'Order number already exists',
            details: `Order ${orderData.order_number} already exists in the system`,
            code: error.code
          },
          { status: 409 } // Conflict
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to save order to database', 
          details: error.message,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No data returned from database insert' },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      order: data[0],
      message: 'Order created successfully',
      order_number: data[0].order_number,
      order_id: data[0].id
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error processing order:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      },
      { status: 500 }
    );
  }
}