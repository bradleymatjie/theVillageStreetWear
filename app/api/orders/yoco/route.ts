// app/api/orders/yoco/route.ts
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
      shipping_cost = 0,
      pickup_location = '',
    } = await request.json();

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    if (!email || !customer_name || !phone || !shipping_address) {
      return NextResponse.json(
        { error: 'Email, customer name, phone, and shipping address are required' },
        { status: 400 }
      );
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!Array.isArray(cart_items) || cart_items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    const totalAmountInCents = Math.round(amount * 100);

    // Prepare metadata for Yoco (sent during checkout creation)
    const metadata = {
      orderId,
      customer_email: email,
      customer_name,
      customer_phone: phone,
      shipping_address,
      shipping_method: shipping_method || 'standard',
      shipping_cost,
      pickup_location,
      cartItems: JSON.stringify(cart_items),
      item_count: cart_items.length,
      total_items: cart_items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const customerData = JSON.stringify(metadata);

    const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: totalAmountInCents,
        currency: 'ZAR',
        successUrl: `${baseUrl}/studio/checkout/success?orderId=${orderId}`,
        cancelUrl: `${baseUrl}/studio/checkout/cancel?orderId=${orderId}`,
        errorUrl: `${baseUrl}/studio/checkout/error?orderId=${orderId}`,
        metadata,
        receipt: { email, sms: phone || undefined },
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
        { error: yocoData.message || 'Payment gateway error' },
        { status: yocoResponse.status }
      );
    }

    try {
      const dbResponse = await fetch(`${baseUrl}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: orderId,
          customer_name,
          customer_email: email,
          customer_phone: phone,
          shipping_address,
          shipping_method,
          pickup_location,
          items: cart_items,
          subtotal: amount - shipping_cost,
          shipping_cost,
          total: amount,
          payment_status: 'pending',
          yoco_checkout_id: yocoData.id, // Save the real checkout ID
          status: 'pending',
          notes: `Yoco Checkout ID: ${yocoData.id}`,
          created_at: new Date().toISOString(),
        }),
      });

      if (!dbResponse.ok) {
        const dbError = await dbResponse.json();
        console.error('Order creation failed:', dbError);
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
      { error: 'Internal server error during checkout' },
      { status: 500 }
    );
  }
}