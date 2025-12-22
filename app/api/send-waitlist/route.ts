// app/api/send-waitlist/route.ts

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST() {
  try {
    // Fetch pending emails
    const { data: waitlist, error: fetchError } = await supabase
      .from('waitlist_emails')
      .select('id, email')
      .eq('status', 'pending');

    if (fetchError) {
      throw fetchError;
    }

    if (!waitlist || waitlist.length === 0) {
      return NextResponse.json({ message: 'No pending emails found.' });
    }

    console.log(`Found ${waitlist.length} pending emails. Sending sequentially with delay...`);

    let sentCount = 0;
    let failedCount = 0;
    const results: any[] = [];

    // Send sequentially with 600ms delay (under 2 requests/second)
    for (const { id: rowId, email } of waitlist) {
      const emailPayload = {
        from: 'The Village <support@thevillagestreetwear.com>',
        // Remove the hard-coded 'to' line below when ready to send to real emails
        to: "bradleysaint45@gmail.com",
        // to: email, // Uncomment this when ready
        subject: 'The Village is Live – Public Beta Now Open!',
        text: 'Hi! The Village custom streetwear designer is now in public beta. Start creating: https://thevillagestreetwear.com\n\nThanks,\nThe Village Team',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h1 style="color: #333;">Welcome to The Village!</h1>
            <p>We're excited to announce that our custom streetwear designer is now open for <strong>public beta testing</strong>!</p>
            <p><a href="https://thevillagestreetwear.com" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Start Designing Now</a></p>
            <p>Thank you for joining the waitlist early — your support means everything.</p>
            <p>Best,<br><strong>The Village Team</strong></p>
            <hr style="margin-top: 40px;">
            <small>If you no longer wish to receive emails, reply to this email.</small>
          </div>
        `,
      };

      const { data, error } = await resend.emails.send(emailPayload);

      const status = data?.id ? 'sent' : 'failed';
      if (data?.id) sentCount++;
      else failedCount++;

      // Update DB status
      await supabase
        .from('waitlist_emails')
        .update({ status })
        .eq('id', rowId);

      if (error) {
        console.error(`Failed for ${email}:`, error);
      } else {
        console.log(`Sent to ${email} (ID: ${data.id})`);
      }

      results.push({ email, status, data, error });

      // Delay before next send (600ms = ~1.67 requests/sec, safe under 2/sec limit)
      if (waitlist.indexOf(waitlist.find(e => e.id === rowId)!) < waitlist.length - 1) {
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
    console.error('Waitlist send error:', error);
    return NextResponse.json(
      { error: 'Failed to send emails', details: error.message },
      { status: 500 }
    );
  }
}