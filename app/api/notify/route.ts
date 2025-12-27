import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.RESEND_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendApiKey);

export async function POST(request: NextRequest) {

  try {
    const { email }: { email: string } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('waitlist_emails')
      .select('email')
      .eq('email', email)
      .single();


    if (existing) {
      return NextResponse.json({ error: 'Already on the list!' }, { status: 409 });
    }

    const { error: insertError } = await supabase
      .from('waitlist_emails')
      .insert([{ email, status: 'pending' }]);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save—try again' }, { status: 500 });
    }

    try {
      await resend.emails.send({
        from: 'notify@thevillagestreetwear.com',
        to: [email],
        subject: "You're In The Village 🔥 – Exclusive Drops Incoming",
        html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #000; color: #fff; text-align: center;">
        <!-- Logo / Header -->
        <h1 style="font-size: 42px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #ff4500; margin-bottom: 8px;">
          The Village
        </h1>
        <p style="font-size: 14px; opacity: 0.7; margin-bottom: 40px; text-transform: uppercase; letter-spacing: 1px;">
          Streetwear Collective
        </p>

        <!-- Main Content -->
        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 24px; color: #fff;">
          Welcome to the Crew ${email}!
        </h2>

        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 32px; opacity: 0.9; color: #f5f5f5;">
          You just locked in first access to limited drops, custom designs, and exclusive streetwear heat built by the community.
        </p>

        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 40px; opacity: 0.9;  #f5f5f5;">
          We'll keep it real — no spam, just fire notifications when new pieces drop and special offers for the inner circle.
        </p>

        <!-- CTA Button -->
        <div style="margin: 40px 0;">
          <a href="https://thevillagestreetwear.com" target="_blank" style="display: inline-block; background-color: #ff4500; color: #fff; padding: 18px 40px; font-size: 18px; font-weight: bold; text-transform: uppercase; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 20px rgba(255, 69, 0, 0.4);">
            Explore The Village
          </a>
        </div>

        <!-- Closing -->
        <p style="font-size: 16px; opacity: 0.8; margin-top: 48px;">
          Stay fresh,<br>
          <strong>The Village Crew</strong>
        </p>

        <!-- Footer -->
        <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #333; font-size: 12px; opacity: 0.6;">
          <p>© 2025 The Village - Streetwear. All rights reserved.</p>
          <p>
            <a href="https://thevillagestreetwear.com" style="color: #ff4500; text-decoration: underline;">thevillagestreetwear.com</a>
          </p>
        </div>
      </div>
    `,});
    } catch (emailError) {
      console.error('Resend email error:', emailError);
    }

    return NextResponse.json({ success: true, message: 'Signed up!' }, { status: 200 });

  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Server hiccup—retry' }, { status: 500 });
  }
}