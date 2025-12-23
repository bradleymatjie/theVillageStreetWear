import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const resend = new Resend(process.env.RESEND_API_KEY);

const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function getStatusLabel(status: string): string {
  return statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Update the order status in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }

    // Fetch the updated order details for the email (customer name, email, order_id)
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('order_id, customer_name, email')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      console.error("Failed to fetch order for email:", fetchError);
      // Still return success since the status was updated
      return NextResponse.json({ success: true, warning: "Status updated but failed to fetch order details for email" });
    }

    if (order.email && process.env.RESEND_API_KEY) {
      try {
        const firstName = order.customer_name.split(' ')[0] || 'Customer';

        await resend.emails.send({
          from: 'The Village <no-reply@thevillagestreetwear.com>',
          to: [order.email],
          subject: `Order #${order.order_id} - Status Update`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #333; border-radius: 8px; background: #0f0f0f; color: #fff;">
              <h1 style="text-align: center; text-transform: uppercase;">The Village</h1>
              <p>Hi ${firstName},</p>
              <p>Great news! The status of your order <strong>#${order.order_id}</strong> has been updated to:</p>
              <p style="text-align: center; font-size: 1.5em; font-weight: bold; color: #00ff00;">
                ${getStatusLabel(status)}
              </p>
              <p>We'll keep you posted on any further updates. Thank you for shopping with us!</p>
              <hr style="border-color: #333; margin: 30px 0;" />
              <p style="font-size: 0.9em; color: #888;">
                Questions? Reply to this email or contact <a href="mailto:support@thevillage.co.za" style="color: #fff;">support@thevillage.co.za</a>
              </p>
            </div>
          `,
          text: `Hi ${firstName},\n\nYour order #${order.order_id} status has been updated to ${getStatusLabel(status)}.\n\nThank you for shopping with The Village!\n\nQuestions? Contact support@thevillage.co.za`,
        });

        console.log(`Status update email sent to ${order.email}`);
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
      }
    } else if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured – skipping status update email");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}