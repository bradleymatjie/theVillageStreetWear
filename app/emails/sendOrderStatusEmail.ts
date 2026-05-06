import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const statusContent: Record<
  string,
  { title: string; message: string; badge: string }
> = {
  processing: {
    title: "Your order is being prepared",
    message:
      "Good news — your order has been received by the brand and is now being prepared.",
    badge: "Processing",
  },
  out_for_delivery: {
    title: "Your order is out for delivery",
    message:
      "Your package is on the move. Please keep your phone nearby in case the driver needs to contact you.",
    badge: "Out for delivery",
  },
  delivered: {
    title: "Your order has been delivered",
    message:
      "Your order has been marked as delivered. We hope you love your purchase.",
    badge: "Delivered",
  },
};

export async function sendOrderStatusEmail({
  email,
  name,
  orderId,
  status,
}: {
  email: string;
  name: string;
  orderId: string;
  status: string;
}) {
  const content = statusContent[status] || {
    title: "Your order status has changed",
    message: `Your order status is now ${status}.`,
    badge: status,
  };

  const res = await resend.emails.send({
    from: "updates@thevillagestreetwear.com",
    to: email,
    subject: `${content.badge} — Order ${orderId}`,
    html: `
      <div style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#111827;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e5e7eb;">
                
                <tr>
                  <td style="background:#000000;padding:28px 32px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:26px;letter-spacing:-0.5px;">
                      The Village
                    </h1>
                    <p style="margin:8px 0 0;color:#a1a1aa;font-size:13px;">
                      Streetwear marketplace
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:36px 32px;">
                    <div style="display:inline-block;margin-bottom:20px;padding:8px 14px;border-radius:999px;background:#111827;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">
                      ${content.badge}
                    </div>

                    <h2 style="margin:0 0 12px;font-size:28px;line-height:1.2;color:#111827;">
                      ${content.title}
                    </h2>

                    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4b5563;">
                      Hi ${name}, ${content.message}
                    </p>

                    <div style="border-radius:18px;background:#f9fafb;border:1px solid #e5e7eb;padding:20px;margin-bottom:28px;">
                      <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;font-weight:700;">
                        Order ID
                      </p>
                      <p style="margin:0;font-size:16px;font-weight:800;color:#111827;">
                        ${orderId}
                      </p>
                    </div>

                    <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5563;">
                      Thank you for supporting local brands through The Village.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 32px;background:#fafafa;border-top:1px solid #e5e7eb;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#71717a;">
                      © The Village. This is an automated order update.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
  });

  console.log("email res: ", res);
}