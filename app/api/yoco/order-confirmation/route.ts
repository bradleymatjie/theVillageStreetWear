// app/api/order-confirmation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    cartItems,
  } = orderData;

  const firstName = customer_name.split(' ')[0] || customer_name;
  const date = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = shipping_method === 'delivery' ? (subtotal < 500 ? 75 : 0) : 0;
  const total = subtotal + shippingCost;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation #${orderId}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .mobile-stack {
        display: block !important;
        width: 100% !important;
      }
      .mobile-full-width {
        width: 100% !important;
      }
      .mobile-text-center {
        text-align: center !important;
      }
      .mobile-padding {
        padding: 20px !important;
      }
      .mobile-timeline-vertical {
        display: block !important;
      }
      .mobile-timeline-vertical > div {
        width: 100% !important;
        margin-bottom: 30px !important;
        padding-left: 40px !important;
        position: relative !important;
      }
      .mobile-timeline-vertical > div:before {
        content: '' !important;
        position: absolute !important;
        left: 15px !important;
        top: 40px !important;
        bottom: -30px !important;
        width: 2px !important;
        background: #e5e7eb !important;
      }
      .mobile-timeline-vertical > div:last-child:before {
        display: none !important;
      }
    }
  </style>
</head>
<body style="margin:0; padding:20px; background:#f9fafb; font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
  <div style="display:none; color:#f9fafb;">Thank you for your order #${orderId} at The Village Streetwear!</div>

  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:1200px; margin:0 auto;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <div style="width:80px; height:80px; background:#f0fdf4; border-radius:50%; margin:0 auto 24px; display:flex; align-items:center; justify-content:center; font-size:48px; color:#16a34a;">✓</div>
              <h1 style="font-size:40px; font-weight:bold; margin:0 0 12px; color:#111827; letter-spacing:-0.025em;">Order Confirmed!</h1>
              <p style="font-size:20px; margin:0 0 8px; color:#4b5563;">Thank you for your purchase, ${firstName}!</p>
              <p style="margin:0; color:#6b7280; font-size:16px;">Order #${orderId} • ${date}</p>
            </td>
          </tr>
        </table>

        <!-- Order Timeline -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px; background:#ffffff; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden;">
          <tr>
            <td style="padding:32px;">
              <h2 style="font-size:24px; font-weight:bold; margin:0 0 24px; color:#111827; letter-spacing:-0.025em;">Order Timeline</h2>
              
              <!-- Desktop Timeline -->
              <table width="100%" cellpadding="0" cellspacing="0" style="display:none;" class="mobile-hide">
                <tr>
                  <td align="center" style="width:25%; padding:0 12px;">
                    <div style="width:48px; height:48px; background:#f0fdf4; border-radius:50%; margin:0 auto 12px; display:flex; align-items:center; justify-content:center; font-size:24px; color:#16a34a;">✓</div>
                    <p style="margin:0 0 4px; font-size:16px; font-weight:600; color:#111827;">Order Placed</p>
                    <p style="margin:0; font-size:14px; color:#6b7280;">Now</p>
                  </td>
                  <td align="center" style="width:25%; padding:0 12px;">
                    <div style="width:48px; height:48px; background:#f3f4f6; border-radius:50%; margin:0 auto 12px; display:flex; align-items:center; justify-content:center; font-size:24px; color:#9ca3af;">📦</div>
                    <p style="margin:0 0 4px; font-size:16px; font-weight:600; color:#111827;">Processing</p>
                    <p style="margin:0; font-size:14px; color:#6b7280;">Soon</p>
                  </td>
                  <td align="center" style="width:25%; padding:0 12px;">
                    <div style="width:48px; height:48px; background:#f3f4f6; border-radius:50%; margin:0 auto 12px; display:flex; align-items:center; justify-content:center; font-size:24px; color:#9ca3af;">
                      ${shipping_method === 'delivery' ? '🚚' : '📍'}
                    </div>
                    <p style="margin:0 0 4px; font-size:16px; font-weight:600; color:#111827;">
                      ${shipping_method === 'delivery' ? 'Shipped' : 'Ready for Pickup'}
                    </p>
                    <p style="margin:0; font-size:14px; color:#6b7280;">
                      ${shipping_method === 'delivery' ? '3-4 Days' : '2-3 days'}
                    </p>
                  </td>
                  <td align="center" style="width:25%; padding:0 12px;">
                    <div style="width:48px; height:48px; background:#f3f4f6; border-radius:50%; margin:0 auto 12px; display:flex; align-items:center; justify-content:center; font-size:24px; color:#9ca3af;">✓</div>
                    <p style="margin:0 0 4px; font-size:16px; font-weight:600; color:#111827;">
                      ${shipping_method === 'delivery' ? 'Delivered' : 'Picked Up'}
                    </p>
                    <p style="margin:0; font-size:14px; color:#6b7280;">
                      ${shipping_method === 'delivery' ? '4-5 Days' : 'Today'}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Mobile Timeline -->
              <div class="mobile-timeline-vertical" style="display:none;">
                <div style="display:flex; align-items:flex-start; margin-bottom:30px; position:relative;">
                  <div style="width:32px; height:32px; background:#f0fdf4; border-radius:50%; flex-shrink:0; margin-right:16px; display:flex; align-items:center; justify-content:center; font-size:16px; color:#16a34a; position:absolute; left:0;">✓</div>
                  <div style="padding-left:40px;">
                    <p style="margin:0 0 4px; font-size:16px; font-weight:600; color:#111827;">Order Placed</p>
                    <p style="margin:0; font-size:14px; color:#6b7280;">Now</p>
                  </div>
                </div>
                <div style="display:flex; align-items:flex-start; margin-bottom:30px; position:relative;">
                  <div style="width:32px; height:32px; background:#f3f4f6; border-radius:50%; flex-shrink:0; margin-right:16px; display:flex; align-items:center; justify-content:center; font-size:16px; color:#9ca3af; position:absolute; left:0;">📦</div>
                  <div style="padding-left:40px;">
                    <p style="margin:0 0 4px; font-size:16px; font-weight:600; color:#111827;">Processing</p>
                    <p style="margin:0; font-size:14px; color:#6b7280;">Soon</p>
                  </div>
                </div>
                <div style="display:flex; align-items:flex-start; margin-bottom:30px; position:relative;">
                  <div style="width:32px; height:32px; background:#f3f4f6; border-radius:50%; flex-shrink:0; margin-right:16px; display:flex; align-items:center; justify-content:center; font-size:16px; color:#9ca3af; position:absolute; left:0;">
                    ${shipping_method === 'delivery' ? '🚚' : '📍'}
                  </div>
                  <div style="padding-left:40px;">
                    <p style="margin:0 0 4px; font-size:16px; font-weight:600; color:#111827;">
                      ${shipping_method === 'delivery' ? 'Shipped' : 'Ready for Pickup'}
                    </p>
                    <p style="margin:0; font-size:14px; color:#6b7280;">
                      ${shipping_method === 'delivery' ? '1-2 Days' : '1-2 Hours'}
                    </p>
                  </div>
                </div>
                <div style="display:flex; align-items:flex-start; position:relative;">
                  <div style="width:32px; height:32px; background:#f3f4f6; border-radius:50%; flex-shrink:0; margin-right:16px; display:flex; align-items:center; justify-content:center; font-size:16px; color:#9ca3af; position:absolute; left:0;">✓</div>
                  <div style="padding-left:40px;">
                    <p style="margin:0 0 4px; font-size:16px; font-weight:600; color:#111827;">
                      ${shipping_method === 'delivery' ? 'Delivered' : 'Picked Up'}
                    </p>
                    <p style="margin:0; font-size:14px; color:#6b7280;">
                      ${shipping_method === 'delivery' ? '3-5 Days' : 'Today'}
                    </p>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Main Content Grid -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:800px;">
                <tr>
                  <td align="left" valign="top" style="width:66%; padding-right:24px;" class="mobile-stack">
                    <!-- Order Details Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px; background:#ffffff; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden;">
                      <tr>
                        <td style="padding:24px; background:#f9fafb; border-bottom:1px solid #e5e7eb;">
                          <h2 style="font-size:20px; font-weight:600; margin:0; color:#111827; display:flex; align-items:center; gap:8px;">
                            <span style="font-size:20px;">📦</span> Order Details
                          </h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:24px;">
                          ${cartItems.map((item) => `
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px; padding-bottom:24px; border-bottom:1px solid #e5e7eb; ${cartItems.indexOf(item) === cartItems.length - 1 ? 'border-bottom:0; margin-bottom:0; padding-bottom:0;' : ''}">
                            <tr>
                              <td style="width:80px; vertical-align:top;">
                                <img src="${item.imageurl || 'https://via.placeholder.com/100'}" alt="${item.name}" width="80" height="80" style="border-radius:8px; border:1px solid #e5e7eb; object-fit:cover;" />
                              </td>
                              <td style="padding-left:16px; vertical-align:top;">
                                <p style="margin:0 0 8px; font-size:16px; font-weight:600; color:#111827;">${item.name}</p>
                                ${(item.selectedSize || item.selectedMaterial) ? `<p style="margin:0 0 8px; font-size:14px; color:#6b7280;">${[item.selectedSize, item.selectedMaterial].filter(Boolean).join(' / ')}</p>` : ''}
                                <p style="margin:0; font-size:14px; color:#6b7280;">Qty: ${item.quantity}</p>
                              </td>
                              <td style="vertical-align:top; text-align:right;">
                                <p style="margin:0; font-size:16px; font-weight:600; color:#111827;">R${(item.price * item.quantity).toFixed(2)}</p>
                              </td>
                            </tr>
                          </table>
                          `).join('')}

                          <!-- Order Total -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; background:#f9fafb; border-radius:8px; padding:16px;">
                            <tr>
                              <td style="padding:4px 0; text-align:right; color:#6b7280; font-size:14px;">Subtotal</td>
                              <td style="padding:4px 0 4px 32px; text-align:right; font-size:14px; font-weight:500;">R${subtotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                              <td style="padding:4px 0; text-align:right; color:#6b7280; font-size:14px;">${shipping_method === 'delivery' ? 'Shipping' : 'Pickup'}</td>
                              <td style="padding:4px 0 4px 32px; text-align:right; font-size:14px; font-weight:500;">${shippingCost === 0 ? 'Free' : `R${shippingCost.toFixed(2)}`}</td>
                            </tr>
                            <tr style="border-top:1px solid #e5e7eb;">
                              <td style="padding:12px 0 0; text-align:right; font-size:18px; font-weight:600; color:#111827;">Total Paid</td>
                              <td style="padding:12px 0 0 32px; text-align:right; font-size:18px; font-weight:600; color:#111827;">R${total.toFixed(2)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Contact Information Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px; background:#ffffff; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden;">
                      <tr>
                        <td style="padding:24px; background:#f9fafb; border-bottom:1px solid #e5e7eb;">
                          <h2 style="font-size:20px; font-weight:600; margin:0; color:#111827; display:flex; align-items:center; gap:8px;">
                            <span style="font-size:20px;">📧</span> Contact Information
                          </h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:24px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:50%; padding-bottom:16px;">
                                <p style="margin:0 0 4px; font-size:14px; color:#6b7280;">Name</p>
                                <p style="margin:0; font-size:16px; font-weight:500; color:#111827;">${customer_name}</p>
                              </td>
                              <td style="width:50%; padding-bottom:16px;">
                                <p style="margin:0 0 4px; font-size:14px; color:#6b7280;">Email</p>
                                <p style="margin:0; font-size:16px; font-weight:500; color:#111827;">${email}</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="width:50%;">
                                <p style="margin:0 0 4px; font-size:14px; color:#6b7280;">Phone</p>
                                <p style="margin:0; font-size:16px; font-weight:500; color:#111827;">${phone || 'Not provided'}</p>
                              </td>
                              <td style="width:50%;">
                                <p style="margin:0 0 4px; font-size:14px; color:#6b7280;">Order Number</p>
                                <p style="margin:0; font-size:16px; font-weight:500; color:#111827; font-family:monospace;">${orderId}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <td align="left" valign="top" style="width:34%;" class="mobile-stack">
                    <!-- Delivery/Pickup Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px; background:#ffffff; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden;">
                      <tr>
                        <td style="padding:24px; background:#f9fafb; border-bottom:1px solid #e5e7eb;">
                          <h2 style="font-size:20px; font-weight:600; margin:0; color:#111827; display:flex; align-items:center; gap:8px;">
                            <span style="font-size:20px;">${shipping_method === 'delivery' ? '🚚' : '📍'}</span>
                            ${shipping_method === 'delivery' ? 'Delivery Details' : 'Pickup Details'}
                          </h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:24px;">
                          <p style="margin:0 0 8px; font-size:14px; color:#6b7280;">${shipping_method === 'delivery' ? 'Shipping Address' : 'Pickup Location'}</p>
                          <p style="margin:0 0 20px; font-size:16px; font-weight:500; color:#111827; white-space:pre-line;">${shipping_method === 'delivery' ? shipping_address : pickup_location}</p>
                          
                          <div style="background:${shipping_method === 'delivery' ? '#eff6ff' : '#f0fdf4'}; border:1px solid ${shipping_method === 'delivery' ? '#dbeafe' : '#dcfce7'}; border-radius:12px; padding:20px;">
                            <div style="font-size:32px; margin-bottom:12px; text-align:center;">${shipping_method === 'delivery' ? '📦' : '✅'}</div>
                            <p style="margin:0 0 12px; font-size:16px; font-weight:600; text-align:center; color:${shipping_method === 'delivery' ? '#1e40af' : '#15803d'};">${shipping_method === 'delivery' ? 'Delivery Information' : 'Pickup Instructions'}</p>
                            <ul style="margin:0; padding-left:20px; color:${shipping_method === 'delivery' ? '#1e40af' : '#15803d'}; line-height:1.6; font-size:14px;">
                              ${shipping_method === 'delivery' ? `
                              <li style="margin-bottom:4px;">• Your order will be shipped within 2-3 business days</li>
                              <li style="margin-bottom:4px;">• You'll receive a tracking number via email once shipped</li>
                              <li style="margin-bottom:4px;">• Estimated delivery: 3-5 business days</li>
                              <li style="margin-bottom:0;">• ${shippingCost === 0 ? 'Free shipping on orders over R500' : 'Shipping fee: R75'}</li>
                              ` : `
                              <li style="margin-bottom:4px;">• Your order will be ready in 1-2 hours</li>
                              <li style="margin-bottom:4px;">• We'll notify you when it's ready for pickup</li>
                              <li style="margin-bottom:4px;">• Please bring your order confirmation and ID</li>
                              <li style="margin-bottom:0;">• No pickup fee — completely free!</li>
                              `}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- What's Next Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px; background:#ffffff; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden;">
                      <tr>
                        <td style="padding:24px; background:#f9fafb; border-bottom:1px solid #e5e7eb;">
                          <h2 style="font-size:20px; font-weight:600; margin:0; color:#111827;">What's Next?</h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:24px;">
                          <!-- Step 1 -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                            <tr>
                              <td width="32" valign="top" style="padding-right:12px;">
                                <div style="width:32px; height:32px; background:#dbeafe; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#2563eb; font-weight:600; font-size:14px;">1</div>
                              </td>
                              <td valign="top">
                                <p style="margin:0 0 4px; font-size:16px; font-weight:500; color:#111827;">Order Confirmation Email</p>
                                <p style="margin:0; font-size:14px; color:#4b5563;">Sent to ${email}</p>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Step 2 -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                            <tr>
                              <td width="32" valign="top" style="padding-right:12px;">
                                <div style="width:32px; height:32px; background:#dbeafe; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#2563eb; font-weight:600; font-size:14px;">2</div>
                              </td>
                              <td valign="top">
                                <p style="margin:0 0 4px; font-size:16px; font-weight:500; color:#111827;">${shipping_method === 'delivery' ? 'Shipping Update' : 'Pickup Notification'}</p>
                                <p style="margin:0; font-size:14px; color:#4b5563;">${shipping_method === 'delivery' ? "You'll receive tracking information within 48 hours" : "We'll notify you when your order is ready (usually 1-2 hours)"}</p>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Step 3 -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="32" valign="top" style="padding-right:12px;">
                                <div style="width:32px; height:32px; background:#dbeafe; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#2563eb; font-weight:600; font-size:14px;">3</div>
                              </td>
                              <td valign="top">
                                <p style="margin:0 0 4px; font-size:16px; font-weight:500; color:#111827;">Need Help?</p>
                                <p style="margin:0; font-size:14px; color:#4b5563;">Contact us at <a href="mailto:support@thevillage.com" style="color:#2563eb; text-decoration:none; font-weight:500;">support@thevillage.com</a></p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Action Buttons -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td style="padding-bottom:12px;">
                          <a href="https://thevillagestreetwear.com/products" style="display:block; width:100%; padding:16px; background:#000000; color:#ffffff; text-align:center; text-decoration:none; border-radius:8px; font-weight:600; font-size:16px;">🛍️ Continue Shopping</a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <a href="https://thevillagestreetwear.com" style="display:block; width:100%; padding:16px; color:#4b5563; text-align:center; text-decoration:none; border-radius:8px; font-weight:600; font-size:16px; border:1px solid #e5e7eb;">🏠 Back to Home</a>
                        </td>
                      </tr>
                    </table>

                    <!-- Support Info -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; border-radius:12px; border:1px solid #e5e7eb; padding:20px;">
                      <tr>
                        <td align="center">
                          <p style="margin:0; font-size:14px; color:#6b7280; line-height:1.5;">
                            Questions about your order?<br>
                            <a href="mailto:support@thevillage.com" style="color:#2563eb; text-decoration:none; font-weight:500;">support@thevillage.com</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:48px; text-align:center;">
          <tr>
            <td>
              <p style="margin:0; font-size:12px; color:#9ca3af;">© ${new Date().getFullYear()} The Village Streetwear. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- JavaScript for responsive switching (will only work in some email clients) -->
  <script type="text/javascript">
    // This script will only work in email clients that support JavaScript (very few)
    // It's included as a fallback for better clients
    (function() {
      var width = window.innerWidth || document.documentElement.clientWidth;
      var mobileTimeline = document.querySelector('.mobile-timeline-vertical');
      var desktopTimeline = document.querySelector('.mobile-hide');
      
      if (width <= 600) {
        if (mobileTimeline) mobileTimeline.style.display = 'block';
        if (desktopTimeline) desktopTimeline.style.display = 'none';
      } else {
        if (mobileTimeline) mobileTimeline.style.display = 'none';
        if (desktopTimeline) desktopTimeline.style.display = 'table';
      }
    })();
  </script>
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
      !Array.isArray(orderData.cartItems)
    ) {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    const subjectLine = orderData.shipping_method === 'delivery'
      ? `Order Confirmation #${orderData.orderId} - Your order is being prepared for delivery`
      : `Order Confirmation #${orderData.orderId} - Your order will be ready for pickup soon`;

    const fromAddress = 'The Village Streetwear <support@thevillagestreetwear.com>';

    const { data, error } = await resend.emails.send({
      from: fromAddress,
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