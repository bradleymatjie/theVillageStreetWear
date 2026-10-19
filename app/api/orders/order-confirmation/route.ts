import { getColorValue } from "@/lib/server-colors";
// app/api/order-confirmation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

interface OrderData {
  orderId: string;
  amount: string;
  email: string;
  phone: string;
  customer_name: string;
  shipping_method: 'delivery' | 'pickup';
  shipping_address: string;
  pickup_location: string;
  cartItems: CartItem[] | string; // Accept array or stringified JSON
  payment_status: string;
  payment_reference: string;
}

const generateOrderConfirmationHtml = (orderData: OrderData): string => {
  const {
    orderId,
    customer_name,
    email,
    phone,
    shipping_method,
    shipping_address,
    pickup_location,
    cartItems: rawCartItems,
  } = orderData;

  // Robustly handle cartItems (array or stringified JSON from webhook/metadata)
  let cartItems: CartItem[] = [];
  if (Array.isArray(rawCartItems)) {
    cartItems = rawCartItems;
  } else if (typeof rawCartItems === 'string') {
    try {
      cartItems = JSON.parse(rawCartItems);
    } catch (e) {
      console.error("Failed to parse cartItems string:", e);
      cartItems = [];
    }
  }

  const firstName = customer_name.split(' ')[0] || customer_name;
  const date = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = shipping_method === 'delivery' ? 90 : 0;
  const total = subtotal + shippingCost;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation #${orderId}</title>
  <style>
    body { margin: 0; padding: 20px; background: ${getColorValue("--palette-surface-email-subtle")}; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    @media (max-width: 600px) {
      .preview-grid td { display: block !important; width: 100% !important; padding: 0 0 24px 0 !important; }
      .preview-grid td:last-child { padding-bottom: 0 !important; }
    }
  </style>
</head>
<body>
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:800px; margin:0 auto; background:${getColorValue("--palette-white")}; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px ${getColorValue("--palette-black-10")};">
    <tr>
      <td style="padding:40px 32px; text-align:center; background:${getColorValue("--palette-black")}; color:${getColorValue("--palette-white")};">
        <h1 style="font-size:32px; font-weight:bold; margin:0;">Order Confirmed!</h1>
        <p style="font-size:18px; margin:8px 0 0;">Thank you for your purchase, ${firstName}!</p>
        <p style="margin:8px 0 0; opacity:0.8;">Order #${orderId} • ${date}</p>
      </td>
    </tr>

    <tr>
      <td style="padding:32px;">
        <h2 style="font-size:24px; font-weight:bold; margin:0 0 24px;">Your Custom T-Shirts</h2>

        ${cartItems.map((item) => {
          const capitalizedColor = item.tshirt_color?.charAt(0).toUpperCase() + item.tshirt_color?.slice(1) || 'Unknown';

          return `
          <div style="margin-bottom:32px; padding:24px; background:${getColorValue("--palette-surface-email-subtle")}; border-radius:12px; border:1px solid ${getColorValue("--palette-border-email-soft")};">
            <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
              <div>
                <p style="font-size:18px; font-weight:600; margin:0;">${item.name || 'Custom T-Shirt'}</p>
                <p style="margin:8px 0 0; color:${getColorValue("--palette-text-email-muted")};">Color: ${capitalizedColor}</p>
                ${(item.selectedSize || item.selectedMaterial) ? `<p style="margin:4px 0 0; color:${getColorValue("--palette-text-email-muted")};">${[item.selectedSize, item.selectedMaterial].filter(Boolean).join(' / ')}</p>` : ''}
                <p style="margin:4px 0 0; color:${getColorValue("--palette-text-email-muted")};">Quantity: ${item.quantity || 1}</p>
              </div>
              <div style="text-align:right;">
                <p style="font-size:18px; font-weight:600; margin:0;">R${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
              </div>
            </div>

            <!-- Design Previews -->
            <table width="100%" cellpadding="0" cellspacing="0" class="preview-grid">
              <tr>
                <td style="padding-right:12px;">
                  <p style="font-size:14px; font-weight:600; margin:0 0 8px; text-align:center;">Front</p>
                  <img src="${item.front || 'https://via.placeholder.com/400x500?text=No+Front+Design'}" alt="Front design" style="width:100%; border-radius:8px; border:1px solid ${getColorValue("--palette-border-email-soft")};" />
                </td>
                <td style="padding-left:12px;">
                  <p style="font-size:14px; font-weight:600; margin:0 0 8px; text-align:center;">Back</p>
                  <img src="${item.back || 'https://via.placeholder.com/400x500?text=No+Back+Design'}" alt="Back design" style="width:100%; border-radius:8px; border:1px solid ${getColorValue("--palette-border-email-soft")};" />
                </td>
              </tr>
            </table>
          </div>
          `;
        }).join('') || '<p>No items found in order.</p>'}

        <!-- Totals -->
        <div style="background:${getColorValue("--palette-surface-email-muted")}; border-radius:12px; padding:24px;">
          <div style="display:flex; justify-content:space-between; padding:8px 0;">
            <span style="color:${getColorValue("--palette-text-email-secondary")};">Subtotal: </span>
            <span style="font-weight:600;">R${subtotal.toFixed(2)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:8px 0;">
            <span style="color:${getColorValue("--palette-text-email-secondary")};">${shipping_method === 'delivery' ? 'Delivery' : 'Pickup'}: </span>
            <span style="font-weight:600;">${shippingCost === 0 ? 'Free' : `R${shippingCost.toFixed(2)}`}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:16px 0 0; border-top:2px solid ${getColorValue("--palette-border-email-soft")}; margin-top:16px;">
            <span style="font-size:20px; font-weight:bold;">Total Paid: </span>
            <span style="font-size:20px; font-weight:bold;">R${total.toFixed(2)}</span>
          </div>
        </div>

        <!-- Delivery/Pickup -->
        <h2 style="font-size:24px; font-weight:bold; margin:32px 0 16px;">
          ${shipping_method === 'delivery' ? 'Delivery Address' : 'Pickup Location'}
        </h2>
        <p style="margin:0; white-space:pre-line;">${shipping_method === 'delivery' ? shipping_address : pickup_location || 'Johannesburg CBD'}</p>

        <!-- Contact -->
        <h2 style="font-size:24px; font-weight:bold; margin:32px 0 16px;">Contact Information</h2>
        <p style="margin:4px 0;">Name: ${customer_name} </p>
        <p style="margin:4px 0;">Email: ${email}</p>
        <p style="margin:4px 0;">Phone: ${phone || 'Not provided'}</p>

        <p style="text-align:center; margin:48px 0 0; color:${getColorValue("--palette-text-email-subtle")}; font-size:14px;">
          Questions? Email <a href="mailto:support@thevillagestreetwear.com" style="color:${getColorValue("--palette-link-blue")};">support@thevillagestreetwear.com</a><br>
          © ${new Date().getFullYear()} The Village Streetwear
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json();

    if (
      !orderData.email ||
      !orderData.orderId ||
      !orderData.customer_name ||
      !orderData.cartItems // Can be array or string
    ) {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    const subjectLine = orderData.shipping_method === 'delivery'
      ? `Order Confirmation #${orderData.orderId} - Your custom t-shirts will be on the way soon!`
      : `Order Confirmation #${orderData.orderId} - Your custom t-shirts will be ready for pickup soon`;

    const { data, error } = await resend.emails.send({
      from: 'The Village Streetwear <support@thevillagestreetwear.com>',
      to: [orderData.email],
      subject: subjectLine,
      html: generateOrderConfirmationHtml(orderData),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email', details: error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: 'Order confirmation email sent successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}