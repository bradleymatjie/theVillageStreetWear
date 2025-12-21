import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature');
    const body = JSON.parse(rawBody);

    // Verify webhook signature (optional but recommended)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.YOCO_WEBHOOK_SECRET || '')
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { event, data } = body;
    const { checkoutId, metadata, status } = data;

    // Update order status based on payment result
    if (event === 'payment.succeeded') {
      const orderId = metadata?.orderId;
      
      if (orderId) {
        await supabase
          .from('design_orders')
          .update({
            payment_status: 'paid',
            status: 'processing',
            payment_id: checkoutId,
            updated_at: new Date().toISOString(),
          })
          .eq('order_number', orderId);
      }
    } else if (event === 'payment.failed') {
      const orderId = metadata?.orderId;
      
      if (orderId) {
        await supabase
          .from('design_orders')
          .update({
            payment_status: 'failed',
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('order_number', orderId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}