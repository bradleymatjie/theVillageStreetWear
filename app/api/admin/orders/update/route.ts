// app/api/admin/orders/update/route.ts
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY!);

const statusLabels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

export async function POST(request: Request) {
    try {
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json(
                { error: 'Missing required fields: id and status' },
                { status: 400 }
            );
        }

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status value' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select('*') // Ensure we get the full row back, including metadata
            .single(); // Expect exactly one row

        if (error) throw error;
        if (!data) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        const order = data;
        const metadata = order.metadata || {};
        const customerEmail = metadata.email?.trim();
        const customerName = metadata.customer_name || 'Customer';
        const orderId = metadata.orderId || `ORD-${order.id}`;
        const shippingMethod = metadata.shipping_method || 'delivery';

        const statusLabel = statusLabels[status] || status;

        // Custom message based on status + shipping method
        let statusMessage = `<strong>${statusLabel}</strong>`;

        if (status === 'shipped') {
            if (shippingMethod === 'delivery') {
                statusMessage = 'shipped! It\'s on its way and should arrive in 3-5 business days.';
            } else {
                statusMessage = 'ready for pickup at your selected location!';
            }
        } else if (status === 'delivered') {
            if (shippingMethod === 'delivery') {
                statusMessage = 'delivered! Enjoy your new items.';
            } else {
                statusMessage = 'picked up! Thank you for shopping with us.';
            }
        } else if (status === 'processing') {
            statusMessage = 'now being processed. We\'ll notify you when it\'s ready.';
        } else if (status === 'cancelled') {
            statusMessage = 'cancelled. If you were charged, a refund will be processed shortly.';
        }

        if (customerEmail) {
            const subject = `Order #${orderId} ${statusLabel}`;

            const statusLabels: Record<string, string> = {
                pending: 'Pending',
                processing: 'Processing',
                shipped: 'Shipped',
                delivered: 'Delivered',
                cancelled: 'Cancelled',
            };

            const badgeStyles: Record<string, { bg: string; text: string }> = {
                pending: { bg: '#fffbeb', text: '#d97706' },      // amber
                processing: { bg: '#eff6ff', text: '#2563eb' },   // blue
                shipped: { bg: '#f3e8ff', text: '#9333ea' },      // purple
                delivered: { bg: '#ecfdf5', text: '#059669' },    // emerald green
                cancelled: { bg: '#fee2e2', text: '#dc2626' },    // red
            };

            // const statusLabel = statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);
            const { bg: bgColor, text: textColor } = badgeStyles[status] || { bg: '#f3f4f6', text: '#4b5563' }; // fallback gray

            const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
    <h1 style="color: #000; margin-bottom: 24px;">
      Order Update: 
      <span style="
        display: inline-block;
        padding: 6px 16px;
        border-radius: 9999px;
        font-size: 14px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background-color: ${bgColor};
        color: ${textColor};
      ">
        ${statusLabel}
      </span>
    </h1>
    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            Hi ${customerName},
            </p>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Great news! Your order <strong>#${orderId}</strong> is ${statusMessage}
            </p>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Thank you for shopping with <strong>The Village Streetwear</strong>!
            </p>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            If you have any questions, simply reply to this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
            <p style="color: #666; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} The Village Streetwear. All rights reserved.
            </p>
        </div>
        `;
            try {
                await resend.emails.send({
                    from: 'The Village Orders <orders@thevillagestreetwear.com>',
                    to: [customerEmail],
                    subject,
                    html,
                });

                console.log(`Status update email sent to ${customerEmail} for order #${orderId}`);
            } catch (emailError) {
                console.error('Failed to send status update email:', emailError);
            }
        } else {
            console.log(`No email address found for order #${orderId} – skipping notification`);
        }

        return NextResponse.json(order);
    } catch (error: any) {
        console.error('Failed to update order status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update order status' },
            { status: 500 }
        );
    }
}