import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      email,
      orderId,
      customer_name,
      phone,
      cart_items,
      shipping_method,
      shipping_address,
      pickup_location,
    } = await request.json();

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid order amount' },
        { status: 400 }
      );
    }

    if (!email || !customer_name || !phone || !shipping_address) {
      return NextResponse.json(
        { error: 'Email, customer name, phone, and shipping address are required' },
        { status: 400 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Validate cart items
    if (!Array.isArray(cart_items) || cart_items.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      );
    }

    // Calculate total (in cents for Yoco)
    const totalAmount = Math.round(amount * 100); // Convert Rands to cents

    // Prepare Yoco metadata
    const metadata = {
      orderId,
      customer_email: email,
      customer_name,
      customer_phone: phone,
      shipping_address: shipping_address,
      shipping_method: shipping_method || 'standard',
      pickup_location: pickup_location || '',
      item_count: cart_items.length,
      total_items: cart_items.reduce((sum, item) => sum + item.quantity, 0),
    };

    // Create Yoco checkout session
    const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: totalAmount,
        currency: 'ZAR',
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/studio/checkout/success?orderId=${orderId}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/studio/checkout/cancel?orderId=${orderId}`,
        errorUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/studio/checkout/error?orderId=${orderId}`,
        metadata,
        receipt: {
          email: email,
          sms: phone || undefined,
        },
        notes: `Custom T-Shirt Order - ${customer_name}`,
      }),
    });

    const yocoData = await yocoResponse.json();

    if (!yocoResponse.ok) {
      console.error('Yoco API error:', yocoData);
      
      if (yocoResponse.status === 401) {
        return NextResponse.json(
          { error: 'Payment gateway configuration error. Please contact support.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: yocoData.message || 'Payment gateway error',
          details: yocoData.error || 'Failed to create checkout session'
        },
        { status: yocoResponse.status }
      );
    }

    // Create the order in our database (pending payment)
    try {
      const orderResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/orders/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_number: orderId,
            customer_name,
            customer_email: email,
            customer_phone: phone,
            shipping_address,
            items: cart_items,
            subtotal: amount,
            shipping_cost: 0,
            total: amount,
            payment_status: 'pending',
            payment_id: yocoData.id,
            status: 'pending',
            notes: `Yoco Checkout ID: ${yocoData.id}`,
            created_at: new Date().toISOString(),
          }),
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        console.error('Order creation failed:', orderData);
        console.warn('Order saved to Yoco but not to database:', orderData.error);
      }
    } catch (dbError) {
      console.error('Database error during order creation:', dbError);
    }

    return NextResponse.json({
      success: true,
      redirectUrl: yocoData.redirectUrl,
      orderId,
      checkoutId: yocoData.id,
    });

  } catch (error) {
    console.error('Checkout processing error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during checkout',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}