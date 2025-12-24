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
        // .eq('status', 'pending');

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
                to: email,
                subject: 'The Village Is Now Live — Public Beta Open!',
                text: `Welcome to The Village

We're thrilled to announce that The Village is now live and open to everyone in public beta!

Explore our carefully curated collection of beautiful streetwear T-shirts, handpicked for style and quality.

Or hop into our powerful designer tool to bring your own vision to life — start from scratch, upload your ideas, and create custom T-shirts that reflect your unique aspirations and creativity.

Dive in and discover everything The Village has to offer:

https://thevillagestreetwear.com

Your early support means the world to us, and we're excited to have you join us as we grow and improve the platform together.

Best regards,
The Village Team

                If you no longer wish to receive these emails, simply reply to unsubscribe.`,
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
                <h1 style="color: #111; margin-bottom: 16px;">The Village Is Now Live!</h1>

                <p style="color: #333; line-height: 1.6;">
                    We're thrilled to announce that The Village is now live and open to everyone in public beta!
                </p>

                <p style="color: #333; line-height: 1.6;">
                    Explore our carefully curated collection of beautiful streetwear T-shirts, handpicked for style and quality.
                </p>

                <p style="color: #333; line-height: 1.6;">
                    Or hop into our powerful designer tool to bring your own vision to life — start from scratch, upload your ideas, and create custom T-shirts that reflect your unique aspirations and creativity.
                </p>

                <p style="margin: 32px 0; text-align: center;">
                    <a
                    href="https://thevillagestreetwear.com"
                    style="display: inline-block; background: #000; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;"
                    >
                    Explore The Village Now
                    </a>
                </p>

                <p style="color: #555; line-height: 1.6;">
                    Your early support means the world to us, and we're excited to have you join us as we grow and improve the platform together.
                </p>

                <p style="margin-top: 32px;">
                    Best regards,<br />
                    <strong>The Village Team</strong>
                </p>

                <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />

                <small style="color: #888;">
                    If you no longer wish to receive these emails, simply reply to unsubscribe.
                </small>
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