// app/api/send-waitlist/route.ts

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper delay
const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function POST() {
  try {
    // Fetch waitlist emails
    const { data: waitlist, error: fetchError } = await supabase
      .from("waitlist_emails")
      .select("id, email");

    if (fetchError) {
      throw fetchError;
    }

    if (!waitlist || waitlist.length === 0) {
      return NextResponse.json({
        message: "No waitlist emails found.",
      });
    }

    console.log(`Found ${waitlist.length} emails`);

    let sentCount = 0;
    let failedCount = 0;

    const results: any[] = [];

    for (const { id: rowId, email } of waitlist) {
      const emailPayload = {
        from: "The Village <support@thevillagestreetwear.com>",
        to: email,

        subject: "The Village is Growing — New Brands Are Joining 🚀",

        text: `
The Village is Growing — New Brands Are Joining

Hello,

We’re excited to officially announce a new chapter for The Village.

The Village - Streetwear LTD PTY is evolving into more than just a streetwear brand — we are building a platform dedicated to showcasing and supporting upcoming local brands, creatives, and streetwear culture.

Over the past few weeks, we’ve started receiving applications from independent brands that want to join The Village marketplace, and the response has been incredible.

Soon, you’ll be able to discover:
• New local streetwear brands
• Exclusive collections
• Limited releases
• Independent creatives
• Unique fashion pieces from rising designers

Our vision is simple:
To create a home for local culture, fashion, and creativity.

We believe South Africa has some of the most talented designers and brands in the world, and The Village aims to become a platform where those brands can grow, gain exposure, and connect with people who genuinely love streetwear culture.

As part of our growing community, you’ll be among the first to:
• See new brand launches
• Access exclusive drops
• Receive updates on collaborations
• Discover upcoming creators
• Get early access to special collections and announcements

Visit:
https://thevillagestreetwear.com

The Village - Streetwear LTD PTY
Elevating local. Building culture.
        `,

        html: `
<div style="background:#f5f5f5;padding:40px 20px;font-family:Arial,sans-serif;">
  <div style="max-width:650px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e5e5;">

    <!-- Header -->
    <div style="background:#000;padding:45px 30px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:42px;letter-spacing:3px;font-weight:900;">
        THE VILLAGE
      </h1>

      <p style="color:#c7c7c7;margin-top:10px;font-size:14px;letter-spacing:2px;text-transform:uppercase;">
        STREETWEAR LTD PTY
      </p>
    </div>

    <!-- Body -->
    <div style="padding:40px 35px;">

      <h2 style="margin-top:0;color:#111;font-size:32px;line-height:1.2;">
        The Village is Growing 🚀
      </h2>

      <p style="color:#555;font-size:16px;line-height:1.8;">
        We’re excited to officially announce a new chapter for The Village.
      </p>

      <p style="color:#555;font-size:16px;line-height:1.8;">
        <strong>The Village - Streetwear LTD PTY</strong> is evolving into more than just a streetwear brand — we are building a platform dedicated to showcasing and supporting upcoming local brands, creatives, and streetwear culture.
      </p>

      <p style="color:#555;font-size:16px;line-height:1.8;">
        Over the past few weeks, we’ve started receiving applications from independent brands that want to join The Village marketplace, and the response has been incredible.
      </p>

      <!-- Features -->
      <div style="margin-top:35px;padding:30px;background:#fafafa;border:1px solid #eee;border-radius:18px;">

        <h3 style="margin-top:0;color:#111;font-size:20px;">
          Soon you'll discover:
        </h3>

        <ul style="padding-left:20px;color:#444;line-height:2;font-size:15px;">
          <li>New local streetwear brands</li>
          <li>Exclusive collections</li>
          <li>Limited releases</li>
          <li>Independent creatives</li>
          <li>Unique fashion pieces from rising designers</li>
        </ul>
      </div>

      <!-- Vision -->
      <div style="margin-top:35px;">
        <h3 style="color:#111;font-size:22px;">
          Our Vision
        </h3>

        <p style="color:#555;font-size:16px;line-height:1.8;">
          To create a home for local culture, fashion, and creativity.
        </p>

        <p style="color:#555;font-size:16px;line-height:1.8;">
          We believe South Africa has some of the most talented designers and brands in the world, and The Village aims to become a platform where those brands can grow, gain exposure, and connect with people who genuinely love streetwear culture.
        </p>
      </div>

      <!-- CTA -->
      <div style="margin-top:45px;text-align:center;">
        <a
          href="https://thevillagestreetwear.com"
          style="
            display:inline-block;
            background:#000;
            color:#fff;
            text-decoration:none;
            padding:16px 34px;
            border-radius:999px;
            font-weight:bold;
            font-size:15px;
            letter-spacing:0.5px;
          "
        >
          Visit The Village
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="padding:30px;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;color:#111;font-size:18px;font-weight:bold;">
        The Village - Streetwear LTD PTY
      </p>

      <p style="margin-top:8px;color:#777;font-size:14px;">
        Elevating local. Building culture.
      </p>

      <a
        href="https://thevillagestreetwear.com"
        style="display:inline-block;margin-top:12px;color:#000;text-decoration:none;font-size:14px;font-weight:bold;"
      >
        www.thevillagestreetwear.com
      </a>
    </div>

  </div>
</div>
        `,
      };

      const { data, error } = await resend.emails.send(emailPayload);

      const status = data?.id ? "sent" : "failed";

      if (data?.id) {
        sentCount++;
      } else {
        failedCount++;
      }

      // Update DB status
      await supabase
        .from("waitlist_emails")
        .update({ status })
        .eq("id", rowId);

      if (error) {
        console.error(`Failed for ${email}:`, error);
      } else {
        console.log(`Sent to ${email}`);
      }

      results.push({
        email,
        status,
        data,
        error,
      });

      // Delay between sends
      if (
        waitlist.indexOf(
          waitlist.find((e) => e.id === rowId)!
        ) <
        waitlist.length - 1
      ) {
        await delay(600);
      }
    }

    return NextResponse.json({
      message: `Processed ${waitlist.length} emails.`,
      sent: sentCount,
      failed: failedCount,
      details: results,
    });
  } catch (error: any) {
    console.error("Email send error:", error);

    return NextResponse.json(
      {
        error: "Failed to send emails",
        details: error.message,
      },
      {
        status: 500,
      }
    );
  }
}