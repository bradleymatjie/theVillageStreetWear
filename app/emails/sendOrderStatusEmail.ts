import { getColorValue } from "@/lib/server-colors";
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

  await resend.emails.send({
    from: "updates@thevillagestreetwear.com",
    to: email,
    subject: `${content.badge} — Order ${orderId}`,
    html: `
      <div style="margin:0;padding:0;background:${getColorValue("--palette-surface-status-email")};font-family:Arial,Helvetica,sans-serif;color:${getColorValue("--palette-text-email")};">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${getColorValue("--palette-white")};border-radius:24px;overflow:hidden;border:1px solid ${getColorValue("--palette-border-email-soft")};">
                
                <tr>
                  <td style="background:${getColorValue("--palette-black")};padding:28px 32px;text-align:center;">
                    <h1 style="margin:0;color:${getColorValue("--palette-white")};font-size:26px;letter-spacing:-0.5px;">
                      The Village
                    </h1>
                    <p style="margin:8px 0 0;color:${getColorValue("--palette-text-email-on-dark")};font-size:13px;">
                      Streetwear marketplace
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:36px 32px;">
                    <div style="display:inline-block;margin-bottom:20px;padding:8px 14px;border-radius:999px;background:${getColorValue("--palette-text-email")};color:${getColorValue("--palette-white")};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">
                      ${content.badge}
                    </div>

                    <h2 style="margin:0 0 12px;font-size:28px;line-height:1.2;color:${getColorValue("--palette-text-email")};">
                      ${content.title}
                    </h2>

                    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:${getColorValue("--palette-text-email-secondary")};">
                      Hi ${name}, ${content.message}
                    </p>

                    <div style="border-radius:18px;background:${getColorValue("--palette-surface-email-subtle")};border:1px solid ${getColorValue("--palette-border-email-soft")};padding:20px;margin-bottom:28px;">
                      <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${getColorValue("--palette-text-email-muted")};font-weight:700;">
                        Order ID
                      </p>
                      <p style="margin:0;font-size:16px;font-weight:800;color:${getColorValue("--palette-text-email")};">
                        ${orderId}
                      </p>
                    </div>

                    <p style="margin:0;font-size:14px;line-height:1.7;color:${getColorValue("--palette-text-email-secondary")};">
                      Thank you for supporting local brands through The Village.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 32px;background:${getColorValue("--palette-surface-neutral-subtle")};border-top:1px solid ${getColorValue("--palette-border-email-soft")};text-align:center;">
                    <p style="margin:0;font-size:12px;color:${getColorValue("--palette-text-email-footer")};">
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
}
